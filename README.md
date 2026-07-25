# Espetinho Perus — Painel em tempo real

Projeto dividido em:

- `worker/`: Cloudflare Worker V6 com KV, pagamentos, WebSocket e Durable Object hibernável.
- `site/`: site e painel para Cloudflare Pages.

## 1. Publicar o Worker pelo GitHub

No Cloudflare, abra **Workers & Pages**, conecte o repositório e configure:

- Diretório raiz: `worker`
- Comando de deploy: `npx wrangler deploy`

Mantenha no Worker as variáveis e segredos já usados na versão anterior, incluindo `ADMIN_KEY`, credenciais de pagamento, VAPID e o binding KV `ORDERS_KV`.

O `wrangler.jsonc` já contém o binding `ORDER_REALTIME` e a migração SQLite do Durable Object `OrderRealtime`.

## 2. Publicar o site pelo GitHub

Crie ou atualize o projeto Pages:

- Diretório raiz: `site`
- Comando de build: deixar vazio
- Diretório de saída: `.`

## Funcionamento

O painel abre `/admin/realtime` por WebSocket. Quando qualquer pedido é criado, pago ou atualizado, o Worker transmite um pequeno evento. O painel então faz uma única leitura para obter a lista atualizada.

Caso o WebSocket caia, existe fallback de 60 segundos. Quando a aba fica oculta, a conexão é encerrada e reaberta ao voltar, reduzindo ainda mais o uso.
