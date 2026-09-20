-- Additive checkout reservation. Leaves the existing redemption RPC intact.
create table public.resgates_checkout (
  order_id text primary key,
  cliente_id uuid not null references public.clientes(id),
  pontos integer not null check(pontos>0),
  fingerprint text not null,
  estado text not null default 'reserved' check(estado in ('reserved','committed','released')),
  pedido jsonb,
  resposta jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index resgates_checkout_cliente_estado on public.resgates_checkout(cliente_id,estado);
alter table public.resgates_checkout enable row level security;
revoke all on public.resgates_checkout from public, anon, authenticated;
grant select,insert,update on public.resgates_checkout to service_role;

create function public.checkout_resgate_v1(p_action text,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  uid uuid := (p_data->>'customer_id')::uuid;
  oid text := p_data->>'order_id';
  r public.resgates_checkout%rowtype;
  saldo integer;
  reservados bigint;
  pts integer;
  criado boolean := false;
  status text;
begin
  if uid is null or oid is null or length(oid)>100 then raise exception 'ENTRADA_INVALIDA'; end if;
  -- Serialize both reservations and settlement for this customer.
  select pontos into saldo from public.clientes where id=uid and ativo=true for update;
  if not found then raise exception 'CLIENTE_INVALIDO'; end if;
  select * into r from public.resgates_checkout where order_id=oid for update;
  if found and r.cliente_id<>uid then raise exception 'CONFLITO'; end if;
  if p_action='open' then
    pts := (p_data->>'points')::integer;
    if r.order_id is not null then
      if r.fingerprint<>p_data->>'fingerprint' or r.pontos<>pts then raise exception 'CONFLITO'; end if;
    else
      if pts is null or pts<=0 or coalesce(p_data->>'fingerprint','')='' then raise exception 'ENTRADA_INVALIDA'; end if;
      select coalesce(sum(pontos),0) into reservados from public.resgates_checkout where cliente_id=uid and estado='reserved';
      if saldo-reservados<pts then raise exception 'PONTOS_INSUFICIENTES'; end if;
      insert into public.resgates_checkout(order_id,cliente_id,pontos,fingerprint)
      values(oid,uid,pts,p_data->>'fingerprint') returning * into r;
      criado:=true;
    end if;
  elsif r.order_id is null then raise exception 'RESERVA_INEXISTENTE';
  elsif p_action='save' then
    if p_data->'order'->>'order_id'<>oid then raise exception 'CONFLITO'; end if;
    status:=p_data->'order'->>'payment_status';
    if status='approved' and r.estado='released' then raise exception 'RESERVA_LIBERADA'; end if;
    if status='approved' and r.estado='reserved' then
      perform * from public.resgatar_pontos_produto(uid,r.pontos,'Resgate no pedido '||oid);
      r.estado:='committed';
    elsif status in ('rejected','cancelled','refunded') and r.estado='reserved' then
      r.estado:='released';
    end if;
    -- Preserve an approved snapshot against an older concurrent pending write.
    if r.pedido->>'payment_status'='approved' and status in ('creating','pending') then
      return jsonb_build_object('order',r.pedido,'state',r.estado);
    end if;
    update public.resgates_checkout set estado=r.estado,pedido=p_data->'order',atualizado_em=now() where order_id=oid returning * into r;
  elsif p_action='response' then
    update public.resgates_checkout set resposta=coalesce(resposta,p_data->'response'),
      estado=case when pedido is null and (p_data->'response'->>'status')::int>=400 then 'released' else estado end,
      atualizado_em=now() where order_id=oid returning * into r;
  else raise exception 'ACAO_INVALIDA';
  end if;
  return jsonb_build_object('created',criado,'order',r.pedido,'response',r.resposta,'state',r.estado);
end;$$;
revoke all on function public.checkout_resgate_v1(text,jsonb) from public,anon,authenticated;
grant execute on function public.checkout_resgate_v1(text,jsonb) to service_role;
notify pgrst,'reload schema';
