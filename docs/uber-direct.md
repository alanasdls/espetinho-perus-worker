# Uber Direct — configuração e operação

Integração inicialmente DESLIGADA. Não altera a tabela de fretes, Pix, impressão ou fluxo de pedidos. Apenas administradores podem cotar/solicitar entregas. Não há despacho automático ao pagar.

## Cloudflare: Worker espetinho-perus-api → Settings → Variables and secrets

Cadastrar como Secrets: `UBER_CLIENT_ID`, `UBER_CLIENT_SECRET`, `UBER_CUSTOMER_ID` obtidos em https://direct.uber.com → Management → Developer.

Variáveis:
- `UBER_ENABLED`: `true` somente após preencher as demais.
- `UBER_MODE`: `test` inicialmente. **Use as credenciais TEST do Uber**. O nome do modo não transforma credenciais de produção em sandbox.
- `UBER_PICKUP_ADDRESS`: endereço completo da loja, número, bairro, cidade, UF, CEP, Brasil.
- `UBER_PICKUP_PHONE`: telefone da retirada com DDD (formato +55...).
- `UBER_PICKUP_NAME`: Espetinho Perus.

A conta precisa ser habilitada pela Uber para produção. Depois de homologar com credenciais de teste, trocar por credenciais de produção e `UBER_MODE=production`. Uma entrega real gera custo para o restaurante. Não colar segredos em conversas ou arquivos Git.

## Painel → Pedidos → Entrega Uber Direct

Informar número completo de um pedido de entrega pago/ativo. Consultar Uber, conferir endereço de origem/destino, custo em BRL e validade. Confirmar entregador quando preparado. O custo Uber é separado da taxa fixa paga pelo cliente. Atualizar entrega consulta o status na API e fornece link de acompanhamento.

Retries usam o mesmo payload e chave idempotente persistidos no Durable Object antes da chamada. Em falha ambígua, não despachar outra entrega manualmente sem verificar Uber Direct. O sistema não libera automaticamente o pedido para uma segunda entrega, mesmo após cancelamento. Consultas e estados permanecem separados do registro do pedido para não sobrescrever pagamentos/impressão. Status logísticos não alteram automaticamente status do pedido.

Primeira versão: consulta manual de status; webhooks e cancelamento são feitos no painel Uber, não implementados no site. Confirmar elegibilidade/condições Uber para alimentos e bebidas alcoólicas antes do uso comercial; a integração não adiciona verificação de idade.

Referências oficiais: https://developer.uber.com/docs/deliveries/get-started , https://developer.uber.com/docs/deliveries/guides/robocourier .
