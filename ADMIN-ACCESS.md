# Acesso administrativo individual — V149

Sem A2F, conforme solicitado.

## Primeira ativação

1. Abrir `/admin.html` no domínio Espetinho Perus.
2. Selecionar **Ativar primeiro administrador**.
3. Informar o e-mail e a senha da conta do proprietário já existente no site, e a chave antiga do painel.
4. Entrar. A conta inicial é vinculada ao UUID do proprietário confirmado no Supabase; outra conta não pode assumir a administração apenas por conhecer a chave.

A ativação é atômica e só acontece uma vez. Nenhuma conta foi ativada automaticamente durante a implantação. A chave antiga não autoriza mais consultas, alterações ou WebSockets, inclusive antes da primeira ativação. Após a ativação, usar **Entrar**, com e-mail e senha individuais.

## Equipe

Na aba **Acessos**, o administrador gera um convite para um e-mail e uma função. Entregar o código diretamente ao funcionário. Nenhum e-mail é enviado automaticamente.

O funcionário cria/confirma sua conta pelo site e escolhe **Ativar acesso de funcionário** no painel. O código é vinculado ao e-mail, vale 24 horas e é de uso único. Depois, basta entrar com e-mail e senha.

- Administrador: gestão completa e segurança.
- Atendimento: consulta operacional dos pedidos, contato/endereço necessários à entrega, avanço de etapas e abertura/fechamento do delivery. Não acessa diagnósticos, gestão de usuários ou cancelamento.
- Cozinha: itens, observações e nome/retirada; pode iniciar preparo e marcar pronto. Não recebe CPF, telefone, endereço, tokens ou valores financeiros.

Sessões expiram em 8 horas; no máximo 5 por conta. Token opaco fica apenas em sessionStorage, com hash no servidor. Sair revoga a sessão. Alterar função/desativar usuário revoga todas as suas sessões. O último administrador ativo é protegido contra remoção. Recuperação de senha usa o fluxo já existente da conta do site; sessões administrativas existentes devem ser revogadas na aba Acessos caso haja suspeita de comprometimento.

## Implementação e limites

Supabase Auth valida e-mail/senha e confirmação do e-mail. Nenhum papel vem de user_metadata. Tokens do Supabase não são devolvidos nem persistidos; a sessão temporária de autenticação é encerrada com scope=local.

Autorizações, convites, sessões revogáveis e auditoria ficam no Durable Object existente, instância `staff-security-v1`, com transações. Não há migração nas tabelas de clientes, pedidos ou fidelidade.

Limites de login por janela de 15 minutos: 8 por e-mail, 20 por IP e 300 globais. São contadas todas as tentativas, inclusive as bem-sucedidas. Além disso, continuam valendo os controles do Supabase. Isso não substitui WAF/proteção volumétrica.

Auditoria retém as últimas 1000 ações; painel mostra as últimas 100. Registra login, convites, permissões, revogações e tentativas/resultados das alterações operacionais, sem senhas, códigos ou tokens. É um histórico operacional limitado, não arquivo imutável de conformidade.

Atualização de pedidos por consulta autenticada a cada 5 segundos. WebSocket legado é desativado; conexões antigas são encerradas no próximo broadcast sem envio de dados. Arquivos do servidor deixam de ser copiados pelo build do site público.

Se houver um Worker antigo em outro domínio ainda ativo, esta implantação não o desativa: ele precisa ser retirado de operação pelo painel Cloudflare. Não reutilizar nele a chave antiga.

## Verificação

`node --test tests/admin-security.test.js tests/security.test.js tests/reward-checkout.test.js tests/home-reference-v117.test.cjs`

`JSDOM_MODULE=/caminho/node_modules/jsdom node --test tests/admin-ui.test.cjs`

Testes isolados cobrem concorrência no bootstrap/limites, convite/e-mail, expiração e revogação, último administrador, rejeição da chave antiga, permissões na API real com serviços simulados, dados filtrados, auditoria e entrada nas três funções. Nenhuma senha real, pagamento ou alteração de saldo foi usada nos testes. Testes DOM não substituem verificação visual em navegador nem comprovação de implantação.
