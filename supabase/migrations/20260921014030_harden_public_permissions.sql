-- Hardening only: preserve existing RLS ownership policies and server access.
-- Remove broad grants, including TRUNCATE (which is not governed by RLS).
revoke all privileges on table public.clientes, public.pedidos_fidelidade,
  public.movimentacoes_pontos, public.configuracao_fidelidade, public.resgates_checkout
  from public, anon, authenticated;
grant select on public.clientes, public.pedidos_fidelidade,
  public.movimentacoes_pontos, public.configuracao_fidelidade to authenticated;
grant select on public.configuracao_fidelidade to anon;
grant update (nome, telefone) on public.clientes to authenticated;

-- These are trigger functions, not client-facing RPCs. Existing triggers remain.
alter function public.atualizar_data_modificacao() set search_path = '';
alter function public.criar_perfil_cliente() set search_path = '';
revoke execute on function public.atualizar_data_modificacao(),
  public.criar_perfil_cliente() from public, anon, authenticated;
