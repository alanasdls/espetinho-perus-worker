# Cartão de crédito Asaas no Espetinho Perus

Implementação preparada para pagamento em uma vez, na página do próprio domínio
`/pagamento-cartao.html`. Não foi homologada com a conta Asaas e não deve ser ativada
em produção antes de concluir os passos abaixo. Nenhuma cobrança real foi executada.

## Configuração do Worker espetinho-perus-api

| Nome | Tipo | Valor |
| --- | --- | --- |
| ASAAS_ENV | variável | `sandbox` para homologação; `production` para produção |
| ASAAS_CARD_ENABLED | variável | `false` inicialmente; `true` após configurar e testar |
| ASAAS_SANDBOX_API_KEY | segredo | chave da conta Sandbox, somente para testes |
| ASAAS_API_KEY | segredo | chave da conta de produção, somente para produção |
| ASAAS_WEBHOOK_TOKEN | segredo | token dedicado do webhook, diferente da chave API |

Cloudflare → Workers & Pages → espetinho-perus-api → Settings → Variables and Secrets.
Nunca colocar essas chaves nos arquivos HTML/JS, GitHub, chat ou localStorage.
Não habilitar captura de corpos de requisições nas rotas de cartão.

No Asaas do ambiente correspondente, criar webhook para:
`https://api.espetinhoperus.com.br/webhook-asaas`

Configurar o mesmo token dedicado (32–255 caracteres, sem espaços), versão v3,
envio sequencial e eventos de confirmação/recebimento, análise e reprovação de risco,
captura recusada, estorno, exclusão e chargeback. O endpoint verifica
`asaas-access-token` e consulta a cobrança pelo ID para obter seu estado atual.
Confirmar a entrega no painel de logs do Asaas.

Publicar primeiro o Worker com `ASAAS_CARD_ENABLED=false`, configurar credenciais e
webhook de Sandbox e testar com clientes/cartões fictícios. Publicar os arquivos do
site e homologar na interface. A conta/ambiente Sandbox deve estar isolada de pedidos
reais (Worker, ORDERS_KV, ORDER_REALTIME e Supabase de testes); não apontar a
homologação para o armazenamento de produção. Quando homologado, configurar os
segredos e webhook de produção e ativar `ASAAS_CARD_ENABLED=true`.

O frontend oferece a escolha Pix/cartão somente quando `/asaas-capabilities`
confirma a ativação do backend. Se o cartão estiver desativado nas configurações
locais de meios de pagamento do administrador, habilitar crédito ali também.
A publicação do código com a variável desligada preserva o checkout somente Pix.
Se a disponibilidade mudar durante o checkout, o botão informa indisponibilidade.
Débito e Pix seguem as rotas existentes.

## Fluxo e garantias

1. `/criar-checkout-asaas`: reutiliza preços, frete, descontos e resgates autoritativos,
   reserva o número do pedido no Durable Object e cria cliente/cobrança sem cartão.
2. A página recebe token de acompanhamento no fragmento da URL (não no request HTML).
3. `/pagar-cartao-asaas`: exige token do pedido, valida dados, persiste a tentativa
   antes de enviar o cartão ao Asaas. Processa a cobrança conhecida, sem criar outra.
4. `/asaas-status` e webhook consultam a API e validam ID, referência, cliente,
   meio e valor antes de marcar o pedido como pago, creditar pontos e notificar.
5. O Durable Object serializa cobrança, consultas e eventos. Eventos concluídos
   são deduplicados por ID. Uma resposta perdida permanece em consulta, mesmo
   após reinício do objeto; nunca há retry financeiro automático.
6. Recusa explícita `invalid_creditCard` seguida de consulta `PENDING` permite nova
   tentativa manual na mesma cobrança, com UUID diferente e limite de três.
   Respostas ambíguas, análise de risco e erros de comunicação não permitem retry.

Não armazenamos número, CVV, token de cartão ou resposta integral do provedor.
A página de cartão carrega apenas scripts locais e tem CSP restrita; não usa
bibliotecas de análise, CDN ou formulário enviado por navegação. O service worker
não faz cache de páginas/rotas de pagamento. Segredos permanecem no backend.
O carrinho só é limpo após aprovação se não mudou em outra aba.

## Homologação obrigatória

- Pagamento aprovado no Sandbox, com webhook autenticado e pedido no painel.
- Recusa e nova tentativa manual; análise de risco e timeout sem duplicidade.
- Pedido misto com resgate, frete, cupom e produto grátis em retirada.
- Duplo clique, recarregamento da página e reenvio do mesmo evento.
- Conferência de logs: nenhum PAN, CVV, chave ou token de cartão persistido.
- Validação com Asaas dos requisitos PCI DSS para checkout que captura cartão.
- Se a conta exigir 3DS/desafio do emissor, implementar/homologar esse fluxo antes
  de habilitar: este escopo não apresenta desafio 3DS nem guarda cartões.

Testes locais usam fetch simulado e armazenamento isolado; não comprovam a
habilitação comercial, antifraude, PCI DSS ou aceitação do cartão na conta real.
Falha durante criação da cobrança exige consulta/conciliação antes de outro pedido.
Pedidos/cartões em confirmação ficam recuperáveis pelo mesmo token; se a criação
não devolveu token, a loja deve conciliar a referência do pedido no Asaas.

## Fontes

- https://docs.asaas.com/docs/cobrancas-via-cartao-de-credito
- https://docs.asaas.com/reference/pagar-uma-cobranca-com-cartao-de-credito
- https://docs.asaas.com/docs/sobre-os-webhooks
- https://docs.asaas.com/docs/pci-dss-1

## Verificação local

`node --test tests/asaas-payments.test.js tests/checkout-concurrency.test.js tests/reward-checkout.test.js tests/checkout-ui.test.cjs`

Inclui preços adulterados, concorrência, reinício após timeout, autenticação,
webhook repetido, valor incompatível, resgates e ausência de dados sensíveis no storage.
