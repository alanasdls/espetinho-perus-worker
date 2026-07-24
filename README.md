# Espetinho Perus — Worker

Worker da Cloudflare responsável por:

- gerar Pix pelo Mercado Pago;
- registrar pedidos no Workers KV;
- receber o webhook do Mercado Pago;
- atualizar automaticamente o status do pagamento;
- disponibilizar as rotas do painel administrativo.

## Configurações existentes na Cloudflare

O Worker deve possuir estes Secrets:

- `MP_ACCESS_TOKEN`
- `ADMIN_KEY`

O projeto também usa o binding KV:

- `ORDERS_KV`

O arquivo `wrangler.jsonc` declara esse binding. No primeiro deploy pelo GitHub, a Cloudflare pode provisionar automaticamente um namespace KV para ele.

## Rotas

- `GET /` — verifica o serviço.
- `POST /criar-pix` — cria o Pix.
- `GET /pagamento-status?id=...` — consulta o pagamento.
- `POST /webhook-mercado-pago` — recebe notificações do Mercado Pago.
- `GET /admin/orders` — lista pedidos com o cabeçalho `X-Admin-Key`.
- `PATCH /admin/orders/:id` — altera o status do pedido.

## Deploy automático

Qualquer commit na branch `main` dispara o build na Cloudflare.
