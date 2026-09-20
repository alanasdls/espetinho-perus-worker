# Gateway Mistic Pay com IP fixo

Objetivo: manter o fluxo atual do Espetinho Perus e fazer somente as chamadas de saída para a Mistic Pay passarem pelo VPS de IP fixo `191.252.185.6`.

## Fluxo preservado

- Site estático Cloudflare -> Worker API
- Worker continua criando e consultando pedidos
- Supabase/Consumer continuam inalterados
- Webhook Mistic Pay continua apontando para `/webhook-misticpay` no Worker
- Somente `create` e `check` saem pelo VPS
- O VPS não grava pedido, não altera saldo e não processa webhook

## Variáveis novas no Worker

- `MISTICPAY_API_BASE`
  - produção com gateway: `https://SEU_HOSTNAME_GATEWAY`
  - rollback: remover a variável ou definir `https://api.misticpay.com`
- `MISTICPAY_GATEWAY_KEY`
  - chave secreta compartilhada entre Worker e Nginx
  - não registrar em Git

## Instalação no VPS

1. Instalar Nginx.
2. Copiar `nginx-mistic-gateway.conf` para `/etc/nginx/sites-available/mistic-gateway`.
3. Trocar `GATEWAY_HOSTNAME` pelo hostname dedicado.
4. Criar o arquivo local `/etc/nginx/snippets/mistic-gateway-auth.conf`:

   ```nginx
   if ($http_x_gateway_key != "UMA_CHAVE_ALEATORIA_FORTE") { return 403; }
   ```

5. Ativar o site e validar:
   ```bash
   sudo ln -s /etc/nginx/sites-available/mistic-gateway /etc/nginx/sites-enabled/mistic-gateway
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. Publicar o hostname no DNS apontando para `191.252.185.6` e habilitar HTTPS antes de trocar o Worker.

## Testes antes da ativação

- `GET /health` deve retornar 200.
- Sem `X-Gateway-Key`, `create` e `check` devem retornar 403.
- Com chave correta, o gateway deve encaminhar a chamada.
- Confirmar nos logs da Mistic Pay que o IP de origem é `191.252.185.6`.
- Fazer um Pix real/ambiente permitido e confirmar:
  - criação do pedido;
  - QR Code;
  - consulta de status;
  - webhook no Worker;
  - Consumer/PDV;
  - atualização no Supabase.

## Rollback

Remover `MISTICPAY_API_BASE` e `MISTICPAY_GATEWAY_KEY` do Worker, ou redefinir `MISTICPAY_API_BASE=https://api.misticpay.com`.

Nenhuma alteração de banco é necessária.
