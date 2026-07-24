const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
};

const PRECOS = {
  "Queijo coalho": 10.90, "Pão de alho": 10.90, "Carne": 11.90,
  "Carne e bacon": 12.50, "Carne e toscana": 11.90, "Carne e calabresa": 11.90,
  "Frango": 11.90, "Pernil": 11.90, "Pernil e bacon": 12.50, "Tulipa": 12.50,
  "Coração de frango": 11.90, "Linguiça toscana": 11.90, "Linguiça calabresa": 11.90,
  "Linguiça apimentada": 12.50, "Medalhão de frango": 14.90, "Camarão": 14.90,
  "Kafta": 14.90, "Kafta com queijo": 18.90, "Batata simples 600g": 35.00,
  "Batata com cheddar e bacon 600g": 45.00, "Batata com calabresa ou frango 600g": 45.00,
  "Frango a passarinho 1kg": 39.90, "Cebola empanada": 39.90, "Salame com azeitonas": 39.00,
  "Azeitona": 20.00, "Torresmo 600g": 39.90, "Calabresa acebolada 600g": 39.90,
  "Meia calabresa / meia frango": 45.00, "Isca de frango empanado 600g": 45.00,
  "Mandioca com bacon 600g": 39.90, "Isca de tilápia 600g": 69.90,
  "Carne seca com mandioca 600g": 85.90, "Contra filé acebolado 600g": 79.90,
  "Picanha grelhada 600g": 95.90, "Porção da casa 1,2kg": 130.00,
  "X-Burguer": 22.00, "X-Salada": 25.00, "X-Bacon": 27.00, "X-Contra filé": 28.00,
  "X-Calabresa": 25.00, "X-Toscana": 25.00, "X-Kafta": 25.00,
  "Batata frita 150g": 8.00, "Batata frita 150g com cheddar": 12.00,
  "Hambúrguer extra 180g": 10.00, "Skol 600ml": 15.00, "Balde Skol 600ml com 3": 43.50,
  "Balde Skol 600ml com 5": 72.50, "Original 600ml": 16.00,
  "Balde Original 600ml com 3": 46.50, "Balde Original 600ml com 5": 77.50,
  "Heineken 600ml": 19.50, "Balde Heineken 600ml com 3": 57.00,
  "Balde Heineken 600ml com 5": 95.00, "Budweiser Long Neck 330ml": 12.50,
  "Balde Budweiser Long Neck com 5": 60.00, "Heineken Long Neck 330ml": 15.00,
  "Heineken Zero Long Neck": 15.00, "Corona Long Neck": 15.00, "Corona Zero Long Neck": 15.00,
  "Stella Long Neck": 15.00, "Itaipava lata 269ml": 5.50, "Skol lata 269ml": 6.50,
  "Original lata 269ml": 7.00, "Cerveja especial 600ml": 25.00,
  "Cerveja especial Long Neck ou lata": 16.50, "Água": 5.00, "Água com gás": 6.00,
  "Água tônica": 7.50, "Refrigerante lata 350ml": 7.50,
  "Energético Red Bull tradicional": 15.00, "Energético Red Bull sabores": 16.00,
  "Água de coco 330ml": 12.00, "Limonada suíça copo": 15.00,
  "Copo de suco com água": 12.00, "Jarra de suco com água": 25.00, "Gelo coco sabores": 5.00,
  "Caipirinha 400ml": 20.00, "Caipirinha com vinho": 25.00, "Caipirinha com Licor 43": 35.00,
  "Batida com vodka 330ml": 23.00, "Batida com Jurupinga 330ml": 28.00, "Espanhola 330ml": 25.00,
  "Frozen 500ml": 28.00, "Frozen arretada": 25.00, "Morena canela": 20.00,
  "Sex on the Beach": 25.00, "Bob Marley": 25.00, "Piña Colada": 25.00, "Mojito": 25.00,
  "Meia de seda": 25.00, "Negroni": 30.00, "Moscow Mule": 25.00, "Caipirinha zero": 18.00,
  "Batida zero": 20.00, "Mojito zero": 20.00, "Namoradinha": 20.00, "Smirnoff Ice": 15.00,
  "Skol Beats": 15.00, "Xeque Mate": 15.00, "Pitú / 51 / Velho Barreiro": 5.00,
  "Salinas": 10.00, "Seleta": 10.00, "Dreher": 8.00, "Domecq": 10.00, "Menta": 10.00,
  "Contini": 15.00, "Campari": 15.00, "Tequila José Cuervo": 25.00, "Licor 43": 25.00,
  "Balena": 25.00, "Bomberinho": 10.00, "Maria Mole": 12.00, "Kariri com mel": 15.00,
  "Conhaque com mel": 15.00, "Passaport dose 100ml": 15.00, "White Horse dose 100ml": 25.00,
  "Red Label dose 100ml": 30.00, "Old Parr dose 100ml": 35.00, "Jack Daniel's dose 100ml": 35.00,
  "Eternity gin dose": 5.00, "Rock's gin dose": 15.00, "Bombay gin dose": 25.00,
  "Tanqueray gin dose": 30.00, "Beefeater gin dose": 30.00, "Smirnoff vodka dose": 25.00,
  "Absolut vodka dose": 30.00, "Ciroc vodka dose": 35.00, "Taça de sorvete 350ml": 25.00,
  "Petit Gateau": 25.00, "Brownie de chocolate": 25.00, "Bolo de pote": 20.00
};

function responder(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" }
  });
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function texto(valor, limite = 500) {
  return String(valor ?? "").trim().slice(0, limite);
}

function adminAutorizado(request, env) {
  const recebido = request.headers.get("X-Admin-Key") || "";
  return Boolean(env.ADMIN_KEY) && recebido === env.ADMIN_KEY;
}

async function gravarPedido(env, pedido) {
  if (!env.ORDERS_KV) throw new Error("ORDERS_KV nao configurado.");
  pedido.updated_at = new Date().toISOString();
  await env.ORDERS_KV.put(`order:${pedido.order_id}`, JSON.stringify(pedido));
  if (pedido.payment_id) await env.ORDERS_KV.put(`payment:${pedido.payment_id}`, pedido.order_id);
  return pedido;
}

async function buscarPedido(env, orderId) {
  if (!env.ORDERS_KV) return null;
  return env.ORDERS_KV.get(`order:${orderId}`, "json");
}

async function sincronizarPagamento(env, paymentData) {
  if (!env.ORDERS_KV || !paymentData?.id) return null;
  let orderId = await env.ORDERS_KV.get(`payment:${paymentData.id}`);
  if (!orderId) orderId = texto(paymentData.external_reference, 100);
  if (!orderId) return null;
  const pedido = await buscarPedido(env, orderId);
  if (!pedido) return null;
  pedido.payment_id = String(paymentData.id);
  pedido.payment_status = texto(paymentData.status, 50) || pedido.payment_status;
  pedido.payment_status_detail = texto(paymentData.status_detail, 100);
  pedido.paid_at = paymentData.date_approved || pedido.paid_at || null;
  if (paymentData.status === "approved" && pedido.order_status === "aguardando_pagamento") {
    pedido.order_status = "recebido";
  }
  await gravarPedido(env, pedido);
  return pedido;
}

async function consultarMercadoPago(env, paymentId) {
  const mp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
  });
  const data = await mp.json();
  return { ok: mp.ok, status: mp.status, data };
}

async function listarPedidos(env) {
  const lista = await env.ORDERS_KV.list({ prefix: "order:", limit: 1000 });
  const pedidos = [];
  for (const chave of lista.keys) {
    const pedido = await env.ORDERS_KV.get(chave.name, "json");
    if (pedido) pedidos.push(pedido);
  }
  pedidos.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return pedidos;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return responder({
        status: "online",
        servico: "Pix e Painel de Pedidos - Espetinho Perus",
        mercado_pago: Boolean(env.MP_ACCESS_TOKEN),
        pedidos_kv: Boolean(env.ORDERS_KV),
        admin: Boolean(env.ADMIN_KEY)
      });
    }

    if (url.pathname.startsWith("/admin/")) {
      if (!adminAutorizado(request, env)) return responder({ erro: "Senha administrativa invalida." }, 401);
      if (!env.ORDERS_KV) return responder({ erro: "ORDERS_KV nao configurado." }, 500);

      if (request.method === "GET" && url.pathname === "/admin/orders") {
        return responder({ pedidos: await listarPedidos(env) });
      }

      const match = url.pathname.match(/^\/admin\/orders\/([^/]+)$/);
      if (request.method === "PATCH" && match) {
        const orderId = decodeURIComponent(match[1]);
        const pedido = await buscarPedido(env, orderId);
        if (!pedido) return responder({ erro: "Pedido nao encontrado." }, 404);
        const body = await request.json();
        const permitidos = ["recebido", "em_preparo", "saiu_entrega", "finalizado", "cancelado"];
        if (!permitidos.includes(body.order_status)) return responder({ erro: "Status invalido." }, 400);
        pedido.order_status = body.order_status;
        pedido.status_history = Array.isArray(pedido.status_history) ? pedido.status_history : [];
        pedido.status_history.push({ status: body.order_status, at: new Date().toISOString() });
        await gravarPedido(env, pedido);
        return responder({ pedido });
      }
      return responder({ erro: "Rota administrativa nao encontrada." }, 404);
    }

    if (!env.MP_ACCESS_TOKEN) return responder({ erro: "MP_ACCESS_TOKEN nao configurado." }, 500);

    if (request.method === "GET" && url.pathname === "/pagamento-status") {
      const id = url.searchParams.get("id");
      if (!id || !/^\d+$/.test(id)) return responder({ erro: "ID de pagamento invalido." }, 400);
      const consulta = await consultarMercadoPago(env, id);
      if (!consulta.ok) return responder({ erro: "Nao foi possivel consultar o pagamento.", detalhes: consulta.data }, consulta.status);
      const pedido = await sincronizarPagamento(env, consulta.data);
      return responder({
        id: consulta.data.id,
        status: consulta.data.status,
        status_detail: consulta.data.status_detail,
        pedido: pedido ? { order_id: pedido.order_id, order_status: pedido.order_status } : null
      });
    }

    if (request.method === "POST" && url.pathname === "/webhook-mercado-pago") {
      try {
        const body = await request.json().catch(() => ({}));
        const id = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
        if (id && /^\d+$/.test(String(id))) {
          const consulta = await consultarMercadoPago(env, String(id));
          if (consulta.ok) await sincronizarPagamento(env, consulta.data);
        }
      } catch (erro) {
        console.error("Webhook Mercado Pago:", erro);
      }
      return responder({ recebido: true });
    }

    if (request.method !== "POST" || url.pathname !== "/criar-pix") {
      return responder({ erro: "Rota nao encontrada." }, 404);
    }

    try {
      if (!env.ORDERS_KV) return responder({ erro: "ORDERS_KV nao configurado." }, 500);
      const entrada = await request.json();
      if (!Array.isArray(entrada.items) || entrada.items.length === 0) return responder({ erro: "O carrinho esta vazio." }, 400);

      const email = texto(entrada.customer?.email || entrada.email, 150).toLowerCase();
      if (!emailValido(email)) return responder({ erro: "Informe um e-mail valido para gerar o Pix." }, 400);

      let total = 0;
      const itens = entrada.items.map((item, index) => {
        const nome = texto(item.name || item.nome || item.title, 150);
        const quantidade = Number(item.quantity || item.quantidade);
        if (!Object.prototype.hasOwnProperty.call(PRECOS, nome)) throw new Error(`Produto nao reconhecido na posicao ${index + 1}: ${nome || "sem nome"}`);
        if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 50) throw new Error(`Quantidade invalida para ${nome}.`);
        const unit_price = PRECOS[nome];
        total += unit_price * quantidade;
        return { name: nome, quantity: quantidade, unit_price, subtotal: Math.round(unit_price * quantidade * 100) / 100 };
      });
      total = Math.round(total * 100) / 100;

      const numeroPedido = texto(entrada.order_id || entrada.numero_pedido, 100) || `EP-${Date.now()}`;
      const nomeCliente = texto(entrada.customer?.name || entrada.nome || "Cliente", 100);
      const agora = new Date().toISOString();
      let pedido = {
        order_id: numeroPedido,
        created_at: agora,
        updated_at: agora,
        customer: {
          name: nomeCliente,
          email,
          phone: texto(entrada.customer?.phone, 30),
          fulfillment: texto(entrada.customer?.fulfillment, 50),
          address: texto(entrada.customer?.address, 500),
          notes: texto(entrada.customer?.notes, 500)
        },
        items: itens,
        total,
        payment_id: null,
        payment_status: "creating",
        payment_status_detail: "",
        order_status: "aguardando_pagamento",
        paid_at: null,
        status_history: [{ status: "aguardando_pagamento", at: agora }]
      };
      await gravarPedido(env, pedido);

      const pagamento = {
        transaction_amount: total,
        description: `Pedido ${numeroPedido} - Espetinho Perus`,
        payment_method_id: "pix",
        external_reference: numeroPedido,
        notification_url: `${url.origin}/webhook-mercado-pago`,
        payer: {
          email,
          first_name: nomeCliente.split(/\s+/)[0] || "Cliente",
          last_name: nomeCliente.split(/\s+/).slice(1).join(" ") || "Espetinho Perus"
        },
        additional_info: {
          items: itens.map((item, index) => ({ id: String(index + 1), title: item.name, quantity: item.quantity, unit_price: item.unit_price }))
        },
        metadata: {
          numero_pedido: numeroPedido,
          cliente: nomeCliente,
          telefone: pedido.customer.phone,
          recebimento: pedido.customer.fulfillment,
          endereco: pedido.customer.address,
          observacoes: pedido.customer.notes
        }
      };

      const respostaMP = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": crypto.randomUUID()
        },
        body: JSON.stringify(pagamento)
      });
      const resultado = await respostaMP.json();
      if (!respostaMP.ok) {
        pedido.payment_status = "error";
        pedido.payment_status_detail = texto(resultado?.message || resultado?.error || "Mercado Pago recusou", 200);
        await gravarPedido(env, pedido);
        console.error("Mercado Pago:", resultado);
        return responder({ erro: "O Mercado Pago recusou a criacao do Pix.", detalhes: resultado }, respostaMP.status);
      }

      pedido.payment_id = String(resultado.id);
      pedido.payment_status = texto(resultado.status, 50);
      pedido.payment_status_detail = texto(resultado.status_detail, 100);
      await gravarPedido(env, pedido);

      const dadosPix = resultado.point_of_interaction?.transaction_data || {};
      if (!dadosPix.qr_code || !dadosPix.qr_code_base64) return responder({ erro: "O Mercado Pago nao retornou o QR Code Pix.", detalhes: resultado }, 502);

      return responder({
        payment_id: resultado.id,
        numero_pedido: numeroPedido,
        status: resultado.status,
        total,
        qr_code: dadosPix.qr_code,
        qr_code_base64: dadosPix.qr_code_base64,
        ticket_url: dadosPix.ticket_url || null,
        resumo: itens.map(i => `${i.quantity}x ${i.name}`).join(", ")
      }, 201);
    } catch (erro) {
      console.error(erro);
      return responder({ erro: "Erro ao criar o Pix.", detalhes: erro instanceof Error ? erro.message : String(erro) }, 500);
    }
  }
};
