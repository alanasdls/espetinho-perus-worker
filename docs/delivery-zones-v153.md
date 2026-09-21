# Frete por CEP — V153

Valores aprovados: Perus R$10; Vila Aurora/estação R$15; Jaraguá R$15;
Taipas R$20; Vila Rosina/Caieiras R$20; Laranjeiras/Caieiras R$25.

## Cobertura inicial

Perus preserva exatamente os prefixos anteriormente aceitos no servidor.
Vila Aurora cobre todo o prefixo 05186 (05186-000 a 05186-999), condicionado à
cidade São Paulo/SP retornada na consulta. Não inclui a Vila Aurora da zona
norte com CEP 02410. Bairros vizinhos adicionais dependem de definição de nomes/CEPs.

Nas demais áreas, o servidor consulta o ViaCEP e compara cidade/UF e bairro
com a tabela em delivery-rates.js. Taipas inclui Parada de Taipas, Parque Taipas,
Parque Taipas - Parque das Flores, Jardim Taipas, Jardim Rincão e Conjunto
Residencial Elisio Teixeira Leite (bairro postal do CEU Taipas).
Nomes postais diferentes ainda não cadastrados ficam sob consulta pelo WhatsApp.

Referências verificadas em 21/09/2026:
- https://viacep.com.br/ — contrato do serviço de consulta de CEP.
- https://viacep.com.br/ws/05186000/json/ — Vila Aurora, São Paulo.
- https://viacep.com.br/ws/05186911/json/ — Vila Aurora, São Paulo.
- https://viacep.com.br/ws/05181000/json/ — Jaraguá, São Paulo.
- https://viacep.com.br/ws/02986080/json/ — Parque Taipas, São Paulo.
- https://viacep.com.br/ws/02815000/json/ — Conjunto Residencial Elisio Teixeira Leite.
- https://ceu.sme.prefeitura.sp.gov.br/unidade/ceu-taipas/ — CEU Taipas, CEP 02815000.
- https://viacep.com.br/ws/07749225/json/ — Vila Rosina, Caieiras.
- https://viacep.com.br/ws/07745095/json/ — Laranjeiras, Caieiras.

## Configuração

Painel administrativo > Configurações > Áreas de entrega > Carregar tabela de fretes.
O administrador altera valores, pausa regiões e adiciona CEPs/prefixos/faixas.
A configuração é persistida em ORDERS_KV, chave config:delivery-zones-v1. Sem
configuração gravada, os valores aprovados acima são os padrões em produção.
Não é necessário cadastrar variáveis ou integrar Uber. Outras funções de equipe
não podem editar esta tabela. As alterações geram os eventos de auditoria existentes.

Faixas conflitantes são recusadas; regiões pausadas não passam para uma regra
menos específica. Alterações do KV podem levar cerca de um minuto para propagar.
Não publicar valores no navegador como única fonte de verdade.

## Cálculo e falhas

GET /delivery/quote?cep=... é público, sem cache HTTP, e retorna região/valor ou
fora de cobertura. Cache de endereço verificado no KV: 24 horas. O servidor
ignora bairro e preço enviados pelo navegador como fonte de decisão, valida o
frete antes de reservar pontos/pedido e antes de contatar o provedor de pagamento.
Frete divergente retorna 409, exigindo nova consulta do CEP. Consulta de endereço
indisponível bloqueia novas áreas; a cobertura histórica de Perus continua funcionando.
Retirada mantém frete zero. O cálculo inclui os checkouts de resgate por pontos.

O módulo delivery-rates.js é exclusivo do Worker e excluído do build do Pages.
A interface foi atualizada para remover a mensagem fixa de frete R$10 de todas
as entregas. Respostas atrasadas de consultas de CEP não substituem a consulta atual.

Validação: seis testes novos de servidor e três de interface; 25 testes existentes
de segurança/checkout/descontos e nove de painel/recuperação/home. Nenhuma cobrança real.
Publicação: Worker espetinho-perus-api e Pages espetinho-perus-site.
