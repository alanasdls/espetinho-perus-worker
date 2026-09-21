# Segurança V152

## Banco

A migração `harden_public_permissions` foi aplicada em 21/09/2026 ao projeto
Supabase Espetinho Perus. A consulta SQL da integração é somente leitura; para
DDL, usar a operação de migração. Não é necessário ampliar as permissões do plugin.

- Removidos privilégios amplos de tabela de PUBLIC/anon/authenticated, incluindo TRUNCATE.
- Preservadas políticas RLS existentes e acesso do service_role.
- Cliente autenticado lê os próprios dados e só altera nome e telefone.
- Visitantes leem regras de fidelidade ativas. Resgates continuam exclusivos do servidor.
- Funções de trigger têm search_path fixo e não são RPCs acessíveis ao navegador.
- Consulta de privilégios em produção confirmou as restrições; testes isolados em
  PostgreSQL/PGlite confirmaram cadastro, atualização de perfil e isolamento.
- Advisor após migração: apenas aviso de proteção contra senhas vazadas desativada
  e informação esperada sobre RLS sem políticas em resgates_checkout (tabela privada).

## Checkout

O KV permanece como armazenamento dos pedidos, mas não decide sozinho se um
pedido é novo. Cada identificador usa uma reserva transacional em um Durable Object
`checkout-v1:<order_id>`, dentro do binding ORDER_REALTIME já existente.
A reserva acontece depois das validações e antes da primeira gravação ou chamada
financeira. Só uma requisição prossegue, mesmo com leituras antigas do KV ou
requisições em diferentes meios de pagamento.

A reserva não expira automaticamente: após timeout, a operadora pode já ter aceitado
a cobrança. Repetições do mesmo identificador recebem 409 sem expor token ou dados
do pedido. Falha da reserva retorna 503 sem chamar a operadora. Números antigos
continuam válidos, até 64 caracteres; novos pedidos usam UUID. Os resgates mantêm
sua reserva de pontos e resposta idempotente existentes, além desta proteção.

O navegador impede chamadas simultâneas entre os botões de Pix/cartão/resgate.
A proteção do servidor é por número do pedido; não deduplica compras diferentes
com números diferentes e não reenvia automaticamente pagamentos incertos.

## Validação

- 25 testes de segurança, concorrência, checkout e integração de descontos.
- 9 testes de interface administrativa, recuperação de senha e montagem da home.
- Teste SQL isolado para cadastro, perfil, saldo protegido, isolamento e service_role.
- Simulações de pagamento, sem cobranças reais.

A publicação automática no Cloudflare deve ser acompanhada no Worker
espetinho-perus-api e Pages espetinho-perus-site. Nenhuma configuração de hostname,
webhook, impressão, preview ou workers.dev foi alterada nesta entrega.
