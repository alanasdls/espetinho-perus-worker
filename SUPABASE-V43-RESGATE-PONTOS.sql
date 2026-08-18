-- ESPETINHO PERUS — V43
-- Execute uma única vez no SQL Editor do Supabase ANTES de publicar o Worker V43.
-- Não apaga dados. Cria somente a função transacional de débito de pontos usada nos resgates.

begin;

create or replace function public.resgatar_pontos_produto(
  p_cliente_id uuid,
  p_pontos integer,
  p_descricao text
)
returns table (
  saldo_anterior integer,
  pontos_debitados integer,
  saldo_atual integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo integer;
begin
  if p_cliente_id is null then
    raise exception 'CLIENTE_INVALIDO';
  end if;

  if coalesce(p_pontos,0) <= 0 then
    raise exception 'PONTOS_INVALIDOS';
  end if;

  select coalesce(c.pontos,0)
    into v_saldo
  from public.clientes c
  where c.id = p_cliente_id
  for update;

  if not found then
    raise exception 'CLIENTE_NAO_ENCONTRADO';
  end if;

  if v_saldo < p_pontos then
    raise exception 'PONTOS_INSUFICIENTES';
  end if;

  update public.clientes
     set pontos = v_saldo - p_pontos
   where id = p_cliente_id;

  insert into public.movimentacoes_pontos
    (cliente_id, tipo, pontos, descricao, criado_em)
  values
    (p_cliente_id, 'debito', p_pontos, coalesce(nullif(trim(p_descricao),''),'Resgate de produto'), now());

  return query
  select v_saldo, p_pontos, v_saldo - p_pontos;
end;
$$;

revoke all on function public.resgatar_pontos_produto(uuid,integer,text) from public;
revoke all on function public.resgatar_pontos_produto(uuid,integer,text) from anon;
revoke all on function public.resgatar_pontos_produto(uuid,integer,text) from authenticated;
grant execute on function public.resgatar_pontos_produto(uuid,integer,text) to service_role;

commit;
