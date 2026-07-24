# Espetinho Perus — Worker MisticPay V4.1

Worker da Cloudflare responsável por:

- gerar cobranças PIX pela MisticPay;
- consultar o pagamento;
- receber o webhook da MisticPay;
- registrar e acompanhar pedidos no Workers KV;
- manter painel administrativo e Web Push.

## Variáveis e secrets na Cloudflare

- `MISTICPAY_CI` — variável com o Client ID
- `MISTICPAY_CS` — Secret com o Client Secret
- `ADMIN_KEY` — Secret do painel
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` — Secret
- `VAPID_SUBJECT`
- binding KV: `ORDERS_KV`

Opcional: `MISTICPAY_PAYER_DOCUMENT`. Só use caso a API da sua conta recuse transações sem `payerDocument`.

## Rotas de pagamento

- `POST /criar-pix` — cria a cobrança PIX
- `GET /pagamento-status?id=...` — consulta a MisticPay
- `POST /webhook-misticpay` — recebe o aviso e confirma o status consultando a API

## Teste

Após publicar, abra a raiz do Worker. O retorno deve conter:

```json
{"status":"online","misticpay":true}
```

A primeira tentativa é feita sem CPF. Caso a conta exija `payerDocument`, a resposta da MisticPay aparecerá no campo `detalhes`.
