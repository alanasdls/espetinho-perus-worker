# Resgates pelo carrinho

## Publicação

1. Aplicar SUPABASE-RESGATE-CARRINHO.sql (já aplicado no projeto xikhljdlmeinihpeuwlj em 20/09/2026).
2. Publicar o Worker com worker.js e reward-checkout.js. Preservar bindings/segredos existentes.
3. Confirmar GET /fidelidade/checkout-capabilities retorna reward_cart: true.
4. Publicar Pages pelo pages-build.sh.

O frontend verifica a capacidade do servidor antes de enviar resgates. Se o Worker antigo estiver ativo, o carrinho fica salvo e o checkout explica que a atualização está pendente. Preços e pontos nunca são autorizados pelo frontend.

## Comportamento

- Resgatar salva uma seleção local; não cria pedido nem debita pontos.
- Checkout reserva pontos sob bloqueio da linha do cliente. Outros checkouts não podem consumir a mesma disponibilidade.
- Aprovação do pagamento (ou confirmação sem pagamento para retirada gratuita) debita uma única vez usando a RPC existente.
- Falha/cancelamento definitivo de pagamento libera a reserva ainda não consumida.
- Retentativa com o mesmo identificador retorna a resposta salva sem criar outro Pix. Identificador com dados diferentes é rejeitado.
- Timeout ambíguo não repete a chamada ao gateway: mantém reserva/pedido para acompanhamento e conciliação. Reservas não expiram automaticamente porque um Pix pode ser pago mais tarde. Falhas ambíguas podem exigir conciliação operacional; não liberar pontos sem confirmar o estado no gateway.
- Resgates anteriores já confirmados não são convertidos nem debitados novamente.
- Rascunho e dados do formulário persistem somente neste navegador. Limpar os dados do site apaga o rascunho, mas não pedidos já registrados.

## Verificação sem transações reais

node --test tests/reward-checkout.test.js tests/home-reference-v117.test.cjs

SQL foi validado com PostgreSQL WASM (PGlite 0.5.8), incluindo reserva, saldo insuficiente, replay, débito único, liberação e restrição de permissões:

PGLITE_MODULE=/caminho/node_modules/@electric-sql/pglite/dist/index.js node tests/reward-sql.test.mjs

Não foi feito pedido real nem movimentação de pontos de clientes durante os testes.
