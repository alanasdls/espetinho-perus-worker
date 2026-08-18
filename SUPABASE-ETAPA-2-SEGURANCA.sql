-- Execute no SQL Editor do Supabase antes de publicar a V46.
-- Impede que o cliente altere o próprio saldo de pontos pelo navegador.
revoke update on public.clientes from authenticated;
grant update (nome, telefone) on public.clientes to authenticated;

-- Mantém a política existente, mas limita as colunas modificáveis pelo GRANT acima.
-- A pontuação e os pedidos deverão ser gravados apenas pelo Worker usando uma chave secreta.
