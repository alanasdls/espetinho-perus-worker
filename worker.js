
export class OrderRealtime {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ connected_at: new Date().toISOString() });
      server.send(JSON.stringify({ type: "connected", at: new Date().toISOString() }));
      return new Response(null, { status: 101, webSocket: client });
    }
    if (request.method === "POST" && url.pathname === "/broadcast") {
      const payload = await request.text();
      let enviados = 0;
      for (const ws of this.ctx.getWebSockets()) {
        try { ws.send(payload); enviados++; } catch (_) {}
      }
      return new Response(JSON.stringify({ ok: true, enviados }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws, message) {
    if (String(message) === "ping") ws.send("pong");
  }

  async webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch (_) {}
  }

  async webSocketError(ws) {
    try { ws.close(1011, "WebSocket error"); } catch (_) {}
  }
}

async function avisarTempoReal(env, tipo, pedido) {
  if (!env.ORDER_REALTIME) return;
  try {
    const id = env.ORDER_REALTIME.idFromName("espetinho-perus");
    const stub = env.ORDER_REALTIME.get(id);
    await stub.fetch("https://realtime.internal/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: tipo || "order_updated",
        event_id: crypto.randomUUID(),
        emitted_at: new Date().toISOString(),
        order_id: pedido?.order_id || null,
        payment_status: pedido?.payment_status || null,
        order_status: pedido?.order_status || null,
        updated_at: pedido?.updated_at || new Date().toISOString(),
        order: pedido || null
      })
    });
  } catch (error) {
    console.error("Falha ao avisar WebSocket", error);
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization, X-Access-Token, X-Api-Token, Token"
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

const STATUS_LABELS = {
  aguardando_pagamento: "Aguardando pagamento",
  recebido: "Pedido recebido",
  em_preparo: "Pedido em preparo",
  pronto_retirada: "Pronto para retirada",
  saiu_entrega: "Saiu para entrega",
  finalizado: "Pedido finalizado",
  cancelado: "Pedido cancelado"
};
const enc = new TextEncoder();
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
const fromB64url = s => Uint8Array.from(atob(String(s).replace(/-/g,"+").replace(/_/g,"/")+"===".slice((String(s).length+3)%4)), c=>c.charCodeAt(0));
const concat = (...arrays) => { const n=arrays.reduce((s,a)=>s+a.length,0), out=new Uint8Array(n); let p=0; for(const a of arrays){out.set(a,p);p+=a.length} return out; };

function responder(dados, status = 200) {
  return new Response(JSON.stringify(dados), { status, headers: { ...CORS, "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" } });
}
function emailValido(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function texto(valor, limite = 500) { return String(valor ?? "").trim().slice(0, limite); }
// Códigos de impressão (Cód. PDV) importados da planilha PRODUTOS (18).xlsx.
// São usados somente na integração do pedido com o Consumer/PDV e nunca como
// identificador de item nos provedores de pagamento.
const CODIGOS_IMPRESSAO_POR_PRODUTO = Object.freeze({
  "Caipirinha de vodka com morango": "640",
  "Caipirinha de cachaça com morango": "642",
  "Caipirinha de saquê com morango": "641",
  "Caipirinha de vodka com kiwi": "634",
  "Caipirinha de cachaça com kiwi": "635",
  "Caipirinha de saquê com kiwi": "636",
  "Caipirinha de vodka com limão": "637",
  "Caipirinha de cachaça com limão": "638",
  "Caipirinha de saquê com limão": "639",
  "Caipirinha com vinho": "615",
  "Caipirinha com Licor 43": "616"
});

function codigoImpressaoProduto(nome, item = {}) {
  const recebido = texto(
    item.print_code || item.printCode || item.pdv_code || item.external_code || item.externalCode,
    80
  );
  return recebido || CODIGOS_IMPRESSAO_POR_PRODUTO[nome] || null;
}

function normalizarTexto(valor) { return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); }
const PERUS_CEP_PREFIXES = new Set(["05201","05202","05203","05204","05205","05206","05207","05208","05209","05210","05211","05212","05215","05230"]);
function cepAtendidoPerus(valor) {
  const cep = String(valor ?? "").replace(/\D/g, "");
  return cep.length === 8 && PERUS_CEP_PREFIXES.has(cep.slice(0, 5));
}
function calcularEntrega(entrada) {
  const fulfillment = texto(entrada.customer?.fulfillment, 50);
  const bairro = texto(entrada.customer?.bairro, 100);
  const cep = texto(entrada.customer?.cep, 12);
  if (fulfillment !== "Entrega") return { fee: 0, bairro, cep };
  if (!cepAtendidoPerus(cep)) throw new Error("CEP fora da área de entrega automática de Perus. Consulte o frete pelo WhatsApp.");
  const feeInformada = Number(entrada.delivery_fee ?? 10);
  if (feeInformada !== 10) throw new Error("Taxa de entrega inválida.");
  return { fee: 10, bairro, cep };
}

async function clienteSupabaseAutenticado(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) return null;
  try {
    const r = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
      headers: {
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`
      }
    });
    if (!r.ok) return null;
    const user = await r.json();
    return user?.id ? { id: String(user.id), email: user.email || null } : null;
  } catch (e) {
    console.error("Falha ao validar cliente no Supabase", e);
    return null;
  }
}

async function creditarPontosFidelidade(env, pedido) {
  const clienteId = pedido?.customer?.loyalty_customer_id;
  if (!clienteId || pedido?.loyalty?.credited) return { credited: false, reason: "sem_cliente" };
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    pedido.loyalty = { ...(pedido.loyalty || {}), credited: false, status: "config_missing", updated_at: new Date().toISOString() };
    return { credited: false, reason: "config_missing" };
  }
  try {
    const r = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/rpc/creditar_pontos_pedido`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_cliente_id: clienteId,
        p_numero_pedido: pedido.order_id,
        p_subtotal: Number(pedido.subtotal || 0),
        p_valor_total: Number(pedido.total || 0),
        p_frete: Number(pedido.delivery_fee || 0)
      })
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${JSON.stringify(data)}`);
    const row = Array.isArray(data) ? data[0] : data;
    pedido.loyalty = {
      credited: true,
      status: row?.ja_creditado ? "already_credited" : "credited",
      points: Number(row?.pontos_creditados || 0),
      subtotal_eligible: Number(pedido.subtotal || 0),
      freight_excluded: Number(pedido.delivery_fee || 0),
      updated_at: new Date().toISOString()
    };
    return pedido.loyalty;
  } catch (e) {
    console.error("Falha ao creditar pontos", e);
    pedido.loyalty = { ...(pedido.loyalty || {}), credited: false, status: "error", error: e instanceof Error ? e.message : String(e), updated_at: new Date().toISOString() };
    return pedido.loyalty;
  }
}

function adminAutorizado(request, env) { return Boolean(env.ADMIN_KEY) && (request.headers.get("X-Admin-Key") || "") === env.ADMIN_KEY; }
async function gravarPedido(env, pedido, options = {}) {
  pedido.updated_at = new Date().toISOString();
  await env.ORDERS_KV.put(`order:${pedido.order_id}`, JSON.stringify(pedido));
  if (pedido.payment_id) await env.ORDERS_KV.put(`payment:${pedido.payment_id}`, pedido.order_id);
  if (pedido.tracking_token) await env.ORDERS_KV.put(`tracking:${pedido.tracking_token}`, pedido.order_id);
  if (options.notify !== false) await avisarTempoReal(env, options.type || "order_updated", pedido);
  return pedido;
}
async function buscarPedido(env, id) { return env.ORDERS_KV?.get(`order:${id}`, "json"); }
async function pedidoPorToken(env, token) { const id=await env.ORDERS_KV?.get(`tracking:${token}`); return id ? buscarPedido(env,id) : null; }
function pedidoPublico(p) { return { order_id:p.order_id, created_at:p.created_at, updated_at:p.updated_at, paid_at:p.paid_at, customer:{name:p.customer?.name,fulfillment:p.customer?.fulfillment,address:p.customer?.address}, items:p.items, subtotal:p.subtotal, delivery_fee:p.delivery_fee||0, total:p.total, payment_status:p.payment_status, order_status:p.order_status, status_history:p.status_history||[], estimated_minutes:p.estimated_minutes||25 }; }
function statusMisticParaSite(status) {
  const s=texto(status,50).toUpperCase();
  if(s==="COMPLETO") return "approved";
  if(s==="FALHA"||s==="CANCELADO") return "rejected";
  return "pending";
}

function credenciaisMistic(env) {
  const ciBruto = String(env.MISTICPAY_CI ?? "");
  const csBruto = String(env.MISTICPAY_CS ?? "");
  const ci = ciBruto.trim();
  const cs = csBruto.trim();
  return {
    ci,
    cs,
    diagnostico: {
      ci_configurado: Boolean(ci),
      cs_configurado: Boolean(cs),
      ci_tamanho: ci.length,
      cs_tamanho: cs.length,
      ci_tinha_espacos_ocultos: ciBruto !== ci,
      cs_tinha_espacos_ocultos: csBruto !== cs
    }
  };
}

async function consultarMisticPay(env,id) {
  const r=await fetch("https://api.misticpay.com/api/transactions/check",{
    method:"POST",
    headers:{ci:credenciaisMistic(env).ci,cs:credenciaisMistic(env).cs,"Content-Type":"application/json"},
    body:JSON.stringify({transactionId:String(id)})
  });
  let data={}; try{data=await r.json()}catch{data={erro:"Resposta invalida da MisticPay"}}
  return {ok:r.ok,status:r.status,data};
}
async function listarPedidos(env) { const l=await env.ORDERS_KV.list({prefix:"order:",limit:1000}), a=[]; for(const k of l.keys){const p=await env.ORDERS_KV.get(k.name,"json");if(p)a.push(p)} return a.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))); }
async function sincronizarPagamentoMistic(env,d) {
  const tx=d?.transaction||d?.data||d;
  const paymentId=tx?.transactionId??tx?.id;
  if(paymentId===undefined||paymentId===null)return null;
  let orderId=await env.ORDERS_KV.get(`payment:${paymentId}`);
  if(!orderId)orderId=texto(tx?.clientTransactionId||tx?.external_reference,100);
  if(!orderId)return null;
  const p=await buscarPedido(env,orderId); if(!p)return null;
  const novoStatus=statusMisticParaSite(tx?.transactionState||tx?.status);
  const before=p.payment_status;
  p.payment_id=String(paymentId);
  p.payment_provider="misticpay";
  p.payment_status=novoStatus;
  p.payment_status_detail=texto(tx?.transactionState||tx?.status,100);
  if(novoStatus==="approved")p.paid_at=tx?.updatedAt||new Date().toISOString();
  if(novoStatus==="approved"&&p.order_status==="aguardando_pagamento"){
    p.order_status="recebido";
    p.status_history=p.status_history||[];
    p.status_history.push({status:"recebido",at:new Date().toISOString()});
  }
  await gravarPedido(env,p);
  // Tenta creditar sempre que o pagamento estiver aprovado e ainda não houver crédito.
  // Isso permite recuperar automaticamente falhas temporárias de configuração, webhook ou Supabase.
  if(novoStatus==="approved" && !p?.loyalty?.credited){
    await creditarPontosFidelidade(env,p);
    await gravarPedido(env,p);
  }
  if(before!=="approved"&&novoStatus==="approved"){
    await enviarNotificacoes(env,p,"Pagamento aprovado!","Recebemos seu pedido. Acompanhe o preparo por aqui.");
    await notificarNovoPedidoPago(env,p);
  }
  return p;
}
async function hmac(key,data) { const k=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]); return new Uint8Array(await crypto.subtle.sign("HMAC",k,data)); }
async function hkdfExtract(salt,ikm) { return hmac(salt,ikm); }
async function hkdfExpand(prk,info,len) { let t=new Uint8Array(),out=new Uint8Array(),i=1; while(out.length<len){t=await hmac(prk,concat(t,info,new Uint8Array([i++])));out=concat(out,t)} return out.slice(0,len); }
async function vapidJwt(env, endpoint) {
  const pub=fromB64url(env.VAPID_PUBLIC_KEY), priv=fromB64url(env.VAPID_PRIVATE_KEY), x=pub.slice(1,33), y=pub.slice(33,65);
  const key=await crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",x:b64url(x),y:b64url(y),d:b64url(priv),ext:true},{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
  const head=b64url(enc.encode(JSON.stringify({typ:"JWT",alg:"ES256"}))); const aud=new URL(endpoint).origin;
  const body=b64url(enc.encode(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+43200,sub:env.VAPID_SUBJECT||"mailto:contato@geradorlipejb.com"}))); const input=`${head}.${body}`;
  const sig=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,enc.encode(input)); return `${input}.${b64url(sig)}`;
}
async function push(env, sub, payload) {
  const ua=fromB64url(sub.keys.p256dh), auth=fromB64url(sub.keys.auth), eph=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
  const uaKey=await crypto.subtle.importKey("raw",ua,{name:"ECDH",namedCurve:"P-256"},false,[]); const shared=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:uaKey},eph.privateKey,256));
  const asPub=new Uint8Array(await crypto.subtle.exportKey("raw",eph.publicKey)); const prkKey=await hkdfExtract(auth,shared); const ikm=await hkdfExpand(prkKey,concat(enc.encode("WebPush: info"),new Uint8Array([0]),ua,asPub),32);
  const salt=crypto.getRandomValues(new Uint8Array(16)); const prk=await hkdfExtract(salt,ikm); const cek=await hkdfExpand(prk,concat(enc.encode("Content-Encoding: aes128gcm"),new Uint8Array([0])),16); const nonce=await hkdfExpand(prk,concat(enc.encode("Content-Encoding: nonce"),new Uint8Array([0])),12);
  const plain=concat(enc.encode(JSON.stringify(payload)),new Uint8Array([2])); const aes=await crypto.subtle.importKey("raw",cek,"AES-GCM",false,["encrypt"]); const cipher=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce,tagLength:128},aes,plain));
  const rs=new Uint8Array([0,0,16,0]); const body=concat(salt,rs,new Uint8Array([asPub.length]),asPub,cipher); const jwt=await vapidJwt(env,sub.endpoint);
  return fetch(sub.endpoint,{method:"POST",headers:{"Content-Encoding":"aes128gcm","Content-Type":"application/octet-stream","TTL":"86400","Authorization":`vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`},body});
}
async function enviarNotificacoes(env,p,title,body,requireInteraction=false) {
  if(!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY) return {sent:0,failed:0,results:[],config_error:"VAPID nao configurado"};
  const subs=Array.isArray(p.push_subscriptions)?p.push_subscriptions:[], valid=[], results=[];
  let sent=0, failed=0;
  for(const s of subs){
    try{
      const r=await push(env,s,{title,body,tag:p.order_id,url:`${p.site_url||"https://geradorlipejb.com"}/pedido.html?token=${encodeURIComponent(p.tracking_token)}`,icon:`${p.site_url||"https://geradorlipejb.com"}/icon-192.png`,requireInteraction});
      const responseText=await r.text().catch(()=>"");
      results.push({status:r.status,ok:r.ok,body:responseText.slice(0,300)});
      if(r.ok){sent++;valid.push(s)} else {failed++;if(r.status!==404&&r.status!==410)valid.push(s)}
    }catch(e){failed++;results.push({status:0,ok:false,body:e instanceof Error?e.message:String(e)});console.error("push",e)}
  }
  p.push_subscriptions=valid; await gravarPedido(env,p);
  return {sent,failed,results};
}


async function listarAssinaturasAdmin(env) {
  return (await env.ORDERS_KV.get("admin:push:subscriptions", "json")) || [];
}
async function salvarAssinaturasAdmin(env, subscriptions) {
  await env.ORDERS_KV.put("admin:push:subscriptions", JSON.stringify(subscriptions));
}
async function registrarAssinaturaAdmin(env, subscription) {
  let subscriptions = await listarAssinaturasAdmin(env);
  subscriptions = subscriptions.filter((item) => item.endpoint !== subscription.endpoint);
  subscriptions.push(subscription);
  await salvarAssinaturasAdmin(env, subscriptions);
  return subscriptions.length;
}
async function enviarNotificacoesAdmin(env, payload) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return { sent: 0, failed: 0, results: [], config_error: "VAPID nao configurado" };
  const subscriptions = await listarAssinaturasAdmin(env);
  const valid = [], results = [];
  let sent = 0, failed = 0;
  for (const subscription of subscriptions) {
    try {
      const response = await push(env, subscription, payload);
      const responseText = await response.text().catch(() => "");
      results.push({ status: response.status, ok: response.ok, body: responseText.slice(0, 300) });
      if (response.ok) { sent++; valid.push(subscription); }
      else { failed++; if (response.status !== 404 && response.status !== 410) valid.push(subscription); }
    } catch (error) {
      failed++;
      results.push({ status: 0, ok: false, body: error instanceof Error ? error.message : String(error) });
    }
  }
  await salvarAssinaturasAdmin(env, valid);
  return { sent, failed, results, subscriptions: valid.length };
}
async function notificarNovoPedidoPago(env, pedido) {
  return enviarNotificacoesAdmin(env, {
    title: "Novo pedido pago!",
    body: `${pedido.customer?.name || "Cliente"} • ${Number(pedido.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} • ${pedido.order_id}`,
    tag: `admin-${pedido.order_id}`,
    url: "https://geradorlipejb.com/painel/",
    icon: "https://geradorlipejb.com/painel/icon-192.png",
    requireInteraction: true
  });
}


function pagBankBase(env){ return env.PAGBANK_ENV === "production" ? "https://api.pagseguro.com" : "https://sandbox.api.pagseguro.com"; }
function pagBankToken(env){ return env.PAGBANK_ENV === "production" ? env.PAGBANK_TOKEN : env.PAGBANK_SANDBOX_TOKEN; }
function normalizarStatusPagBank(status){
  const s=texto(status,50).toUpperCase();
  if(s==="PAID"||s==="AUTHORIZED") return "approved";
  if(s==="DECLINED"||s==="CANCELED"||s==="EXPIRED") return "rejected";
  return "pending";
}
async function sincronizarPagBank(env, payload){
  const reference=texto(payload?.reference_id||payload?.referenceId||payload?.data?.reference_id,100);
  const checkoutId=texto(payload?.id||payload?.checkout_id||payload?.data?.id,100);
  let orderId=reference;
  if(!orderId&&checkoutId) orderId=await env.ORDERS_KV.get(`pagbank:${checkoutId}`);
  if(!orderId) return null;
  const p=await buscarPedido(env,orderId); if(!p) return null;
  const charges=payload?.charges||payload?.payments||payload?.data?.charges||[];
  const charge=Array.isArray(charges)?charges[0]:charges;
  const rawStatus=charge?.status||payload?.status||payload?.data?.status||"WAITING";
  const novoStatus=normalizarStatusPagBank(rawStatus), before=p.payment_status;
  p.payment_provider="pagbank";
  p.payment_id=texto(charge?.id||checkoutId||p.payment_id,100);
  p.checkout_id=checkoutId||p.checkout_id;
  p.payment_status=novoStatus;
  p.payment_status_detail=texto(rawStatus,100);
  p.payment_method=texto(charge?.payment_method?.type||p.payment_method||"CARTAO",50);
  p.installments=Number(charge?.payment_method?.installments||p.installments||1);
  if(novoStatus==="approved") p.paid_at=charge?.paid_at||new Date().toISOString();
  if(novoStatus==="approved"&&p.order_status==="aguardando_pagamento"){
    p.order_status="recebido"; p.status_history=p.status_history||[]; p.status_history.push({status:"recebido",at:new Date().toISOString(),origem:"pagbank"});
  }
  await gravarPedido(env,p);
  // Reprocessa o crédito quando o pagamento já está aprovado, mas a pontuação ainda não foi concluída.
  if(novoStatus==="approved" && !p?.loyalty?.credited){
    await creditarPontosFidelidade(env,p);
    await gravarPedido(env,p);
  }
  if(before!=="approved"&&novoStatus==="approved"){
    await enviarNotificacoes(env,p,"Pagamento aprovado!","Recebemos seu pedido. Acompanhe o preparo por aqui.");
    await notificarNovoPedidoPago(env,p);
  }
  return p;
}
async function consultarCheckoutPagBank(env,checkoutId){
  const token=pagBankToken(env); if(!token) return {ok:false,status:500,data:{erro:"Token PagBank nao configurado."}};
  const r=await fetch(`${pagBankBase(env)}/checkouts/${encodeURIComponent(checkoutId)}`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/json"}});
  let data={}; try{data=await r.json()}catch{data={erro:"Resposta invalida do PagBank"}}
  return {ok:r.ok,status:r.status,data};
}


function normalizarStatusMercadoPago(status){
  const s=texto(status,50).toLowerCase();
  if(s==="approved") return "approved";
  if(["rejected","cancelled","refunded","charged_back"].includes(s)) return "rejected";
  return "pending";
}
async function consultarPagamentoMercadoPago(env,paymentId){
  const token=env.MERCADOPAGO_ACCESS_TOKEN;
  if(!token)return {ok:false,status:500,data:{erro:"MERCADOPAGO_ACCESS_TOKEN nao configurado."}};
  const r=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/json"}});
  let data={};try{data=await r.json()}catch{data={erro:"Resposta invalida do Mercado Pago"}}
  return {ok:r.ok,status:r.status,data};
}
async function sincronizarMercadoPago(env,pagamento){
  const orderId=texto(pagamento?.external_reference||pagamento?.metadata?.order_id,100);
  const paymentId=texto(pagamento?.id,100);
  let resolvedOrderId=orderId;
  if(!resolvedOrderId&&paymentId)resolvedOrderId=await env.ORDERS_KV.get(`mercadopago:payment:${paymentId}`);
  if(!resolvedOrderId)return null;
  const p=await buscarPedido(env,resolvedOrderId);if(!p)return null;
  const novoStatus=normalizarStatusMercadoPago(pagamento?.status),before=p.payment_status;
  p.payment_provider="mercadopago";
  p.payment_id=paymentId||p.payment_id;
  p.payment_status=novoStatus;
  p.payment_status_detail=texto(pagamento?.status_detail||pagamento?.status,120);
  p.payment_method="CREDIT_CARD";
  p.payment_method_id=texto(pagamento?.payment_method_id,50);
  p.installments=Number(pagamento?.installments||1);
  if(novoStatus==="approved")p.paid_at=pagamento?.date_approved||new Date().toISOString();
  if(novoStatus==="approved"&&p.order_status==="aguardando_pagamento"){
    p.order_status="recebido";p.status_history=p.status_history||[];p.status_history.push({status:"recebido",at:new Date().toISOString(),origem:"mercadopago"});
  }
  await gravarPedido(env,p);
  if(paymentId)await env.ORDERS_KV.put(`mercadopago:payment:${paymentId}`,p.order_id);
  if(novoStatus==="approved"&&!p?.loyalty?.credited){await creditarPontosFidelidade(env,p);await gravarPedido(env,p);}
  if(before!=="approved"&&novoStatus==="approved"){
    await enviarNotificacoes(env,p,"Pagamento aprovado!","Recebemos seu pedido. Acompanhe o preparo por aqui.");
    await notificarNovoPedidoPago(env,p);
  }
  return p;
}

function horarioPedidos(){
  const partes=new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
  const dados=Object.fromEntries(partes.map(p=>[p.type,p.value]));
  const dias={"dom.":0,"seg.":1,"ter.":2,"qua.":3,"qui.":4,"sex.":5,"sáb.":6,"sab.":6};
  const dia=dias[dados.weekday]??-1;
  const minutos=Number(dados.hour)*60+Number(dados.minute);
  let fecha=null;
  if([0,3,4].includes(dia))fecha=22*60;
  if([5,6].includes(dia))fecha=23*60;
  return {aberto:fecha!==null&&minutos>=18*60&&minutos<fecha,dia,minutos,fecha};
}
function proximaAbertura(){
  const nomes=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
  const atual=horarioPedidos();
  if(atual.fecha!==null&&atual.minutos<18*60)return "hoje às 18h";
  for(let i=1;i<=7;i++){const d=(atual.dia+i)%7;if([0,3,4,5,6].includes(d))return `${nomes[d]} às 18h`;}
  return "quarta-feira às 18h";
}


const DELIVERY_CONTROL_KEY = "config:delivery-control";
const MANUAL_OPEN_MINUTES = 30;

async function estadoDelivery(env) {
  const automatico = horarioPedidos();
  let controle = null;
  try { controle = await env.ORDERS_KV.get(DELIVERY_CONTROL_KEY, "json"); } catch (_) {}
  const agora = Date.now();

  if (controle?.mode === "manual_open") {
    const expiresAt = Number(controle.expires_at || 0);
    if (expiresAt > agora) {
      return {
        aberto: true,
        modo: "manual_open",
        motivo: "abertura_manual",
        expires_at: new Date(expiresAt).toISOString(),
        remaining_seconds: Math.max(0, Math.ceil((expiresAt - agora) / 1000)),
        automatico
      };
    }
    try { await env.ORDERS_KV.put(DELIVERY_CONTROL_KEY, JSON.stringify({mode:"automatic",updated_at:new Date().toISOString()})); } catch (_) {}
  }

  if (controle?.mode === "manual_closed") {
    return { aberto:false, modo:"manual_closed", motivo:"fechamento_manual", expires_at:null, remaining_seconds:0, automatico };
  }

  return { aberto:automatico.aberto, modo:"automatic", motivo:"horario_programado", expires_at:null, remaining_seconds:0, automatico };
}

async function salvarControleDelivery(env, mode) {
  const agora = Date.now();
  let registro;
  if (mode === "manual_open") {
    registro = { mode, opened_at:new Date(agora).toISOString(), expires_at:agora + MANUAL_OPEN_MINUTES*60*1000, updated_at:new Date(agora).toISOString() };
  } else if (mode === "manual_closed") {
    registro = { mode, updated_at:new Date(agora).toISOString() };
  } else {
    registro = { mode:"automatic", updated_at:new Date(agora).toISOString() };
  }
  await env.ORDERS_KV.put(DELIVERY_CONTROL_KEY, JSON.stringify(registro));
  return estadoDelivery(env);
}


// ===== INTEGRACAO CONSUMER API DO PARCEIRO =====
function consumerAutorizado(request, env, url) {
  const esperado = String(env.CONSUMER_API_TOKEN || "").trim();
  if (!esperado) return false;
  const auth = String(request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const candidatos = [
    auth,
    request.headers.get("X-Access-Token"),
    request.headers.get("X-Api-Token"),
    request.headers.get("X-Api-Key"),
    request.headers.get("xapikey"),
    request.headers.get("Token"),
    url.searchParams.get("token")
  ].map(v => String(v || "").trim());
  return candidatos.includes(esperado);
}

function consumerStatusParaSite(status) {
  const s = normalizarTexto(status).replace(/\s+/g, "_");
  const mapa = {
    confirmed: "recebido", accepted: "recebido", confirmado: "recebido", recebida: "recebido",
    preparation: "em_preparo", preparing: "em_preparo", in_preparation: "em_preparo", em_preparo: "em_preparo",
    ready_to_pickup: "pronto_retirada", ready: "pronto_retirada", pronto_para_retirada: "pronto_retirada",
    dispatched: "saiu_entrega", out_for_delivery: "saiu_entrega", saiu_para_entrega: "saiu_entrega",
    concluded: "finalizado", completed: "finalizado", finalizado: "finalizado",
    cancelled: "cancelado", canceled: "cancelado", cancelado: "cancelado"
  };
  return mapa[s] || null;
}

function somenteDigitos(v) { return String(v || "").replace(/\D/g, ""); }
function numeroPedidoExibicao(id) {
  const digitos = somenteDigitos(id);
  return (digitos.slice(-8) || String(id || "PEDIDO").slice(-8)).padStart(4, "0");
}
function codigoExternoFallback(nome, index) {
  const slug = normalizarTexto(nome).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
  return `SITE-${slug || "ITEM"}-${index + 1}`;
}
function separarEndereco(customer = {}) {
  const endereco = String(customer.address || "").trim();
  const partes = endereco.split(",").map(x => x.trim()).filter(Boolean);
  const rua = partes[0] || "Rua nao informada";
  const numero = partes[1] || "S/N";
  const complemento = partes.slice(2).join(", ") || null;
  const bairro = String(customer.bairro || "Perus").trim();
  const cidade = "São Paulo";
  const estado = "SP";
  const cep = somenteDigitos(customer.cep).slice(0, 8) || "05200000";
  return {
    reference: customer.notes || null,
    country: "BR",
    streetName: rua,
    formattedAddress: [rua, numero, complemento, bairro, `${cidade} - ${estado}`].filter(Boolean).join(", "),
    streetNumber: numero,
    city: cidade,
    postalCode: cep,
    coordinates: { latitude: 0, longitude: 0 },
    neighborhood: bairro,
    state: estado,
    complement: complemento
  };
}
function metodoPagamentoConsumer(p) {
  const provider = normalizarTexto(p.payment_provider);
  const method = normalizarTexto(p.payment_method);
  if (provider === "misticpay" || provider === "pix" || method.includes("pix")) return "PIX";
  if (method.includes("debit")) return "DEBIT";
  if (method.includes("credit")) return "CREDIT";
  if (method.includes("cash") || method.includes("dinheiro")) return "CASH";
  return "OTHER";
}
function detalheConsumer(p, env) {
  const entrega = normalizarTexto(p.customer?.fulfillment) === "entrega";
  const createdAt = p.created_at || new Date().toISOString();
  const previsao = new Date(Date.now() + Number(p.estimated_minutes || (entrega ? 40 : 25)) * 60000).toISOString();
  const items = (p.items || []).map((item, index) => {
    const unitPrice = Number(item.unit_price ?? item.price ?? 0);
    const quantity = Math.max(1, Number(item.quantity || 1));
    const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
    // O nome principal impresso é exatamente o produto comprado no site.
    // Não vinculamos a linha ao produto técnico DELIVERY, evitando que o Consumer
    // substitua o nome recebido por outro cadastro interno.
    const nomeReal = String(item.name || `Item ${index + 1}`).trim();
    // O valor real precisa ser enviado no item principal. Enviar o preço apenas como
    // opção/complemento pode aparecer no cupom, mas não contabilizar a venda do produto.
    const options = Array.isArray(item.options) ? item.options : [];

    return {
      unitPrice,
      quantity,
      totalPrice,
      index: index + 1,
      unit: "UN",
      ean: null,
      price: unitPrice,
      observations: [item.observations, p.customer?.notes].filter(Boolean).join(" | ") || null,
      imageUrl: item.image_url || null,
      name: nomeReal,
      options: options.length ? options : null,
      // id e uniqueId identificam exclusivamente esta linha do pedido.
      id: `${p.order_id}-item-${index + 1}`,
      uniqueId: `${p.order_id}-item-${index + 1}`,
      optionsPrice: 0,
      addition: 0,
      scalePrices: null
    };
  });

  const amount = Number(p.total || 0);
  const subtotal = Number(p.subtotal || items.reduce((a, i) => a + i.totalPrice, 0));
  const deliveryFee = Number(p.delivery_fee || 0);
  const discountAmount = Math.max(0, Number(p.discount_amount || 0));
  // O Consumer valida a composição financeira do pedido. Com promoção, a soma deve fechar:
  // subtotal + entrega - benefícios = total.
  const expectedAmount = Math.round((subtotal + deliveryFee - discountAmount) * 100) / 100;
  const consumerAmount = discountAmount > 0 ? expectedAmount : amount;
  const prepaid = p.payment_status === "approved" ? consumerAmount : 0;
  const displayId = numeroPedidoExibicao(p.order_id);
  const detalhes = {
    benefits: discountAmount > 0 ? [{
      target: "ORDER",
      value: discountAmount,
      sponsorshipValues: [{ name: "MERCHANT", value: discountAmount }],
      description: p.promotion_code === "CADASTRADO10" ? "10% de desconto para cliente cadastrado" : "Desconto promocional"
    }] : [],
    orderType: entrega ? "DELIVERY" : "TAKEOUT",
    payments: {
      methods: [{
        method: metodoPagamentoConsumer(p),
        prepaid: prepaid > 0,
        currency: "BRL",
        type: prepaid > 0 ? "ONLINE" : "OFFLINE",
        value: consumerAmount,
        cash: null,
        card: null,
        wallet: null
      }],
      pending: Math.max(0, Math.round((consumerAmount - prepaid) * 100) / 100),
      prepaid
    },
    merchant: {
      name: env.CONSUMER_MERCHANT_NAME || "Espetinho Perus",
      id: env.CONSUMER_MERCHANT_ID || "61341548000190"
    },
    salesChannel: "PARTNER",
    picking: null,
    orderTiming: "IMMEDIATE",
    createdAt,
    total: {
      benefits: discountAmount,
      deliveryFee,
      orderAmount: consumerAmount,
      subTotal: subtotal,
      additionalFees: 0
    },
    preparationStartDateTime: createdAt,
    id: p.order_id,
    displayId,
    items,
    customer: {
      phone: {
        number: somenteDigitos(p.customer?.phone) || "11999999999",
        localizer: displayId,
        localizerExpiration: new Date(Date.now() + 3600000).toISOString()
      },
      documentNumber: p.customer?.document || null,
      name: p.customer?.name || "Cliente",
      ordersCountOnMerchant: null,
      id: p.tracking_token || p.customer?.phone || p.order_id,
      segmentation: "Cliente"
    },
    extraInfo: p.customer?.notes || null,
    additionalFees: null,
    delivery: entrega ? {
      mode: "DEFAULT",
      pickupCode: displayId,
      deliveredBy: "Partner",
      deliveryAddress: separarEndereco(p.customer),
      deliveryDateTime: previsao,
      observations: p.customer?.notes || null
    } : null,
    schedule: null,
    indoor: null,
    takeout: !entrega ? {
      mode: "DEFAULT",
      takeoutDateTime: previsao,
      observations: p.customer?.notes || null
    } : null,
    additionalInfometadata: null
  };
  return { item: detalhes, statusCode: 0, reasonPhrase: null };
}
async function pedidosPendentesConsumer(env) {
  const pedidos = await listarPedidos(env);
  const limite = Date.now() - 72 * 60 * 60 * 1000;
  return pedidos.filter(p =>
    p.payment_status === "approved" &&
    ["recebido", "em_preparo", "pronto_retirada", "saiu_entrega"].includes(p.order_status) &&
    !["accepted", "concluded", "cancelled"].includes(p.consumer_sync?.status) &&
    new Date(p.created_at || 0).getTime() >= limite
  );
}
async function marcarConsumer(env, p, patch = {}) {
  p.consumer_sync = { ...(p.consumer_sync || {}), ...patch, updated_at: new Date().toISOString() };
  await gravarPedido(env, p);
  return p;
}
// ===== FIM INTEGRACAO CONSUMER =====

export default { async fetch(request,env,ctx) {
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS}); const url=new URL(request.url);
  if(request.method==="POST"&&["/criar-pix","/criar-checkout-pagbank","/criar-checkout-mercadopago","/criar-pedido"].includes(url.pathname)){const delivery=await estadoDelivery(env);if(!delivery.aberto)return responder({erro:delivery.modo==="manual_closed"?"Delivery fechado manualmente no momento.":`Pedidos fechados no momento. Próxima abertura: ${proximaAbertura()}.`,delivery},403);}
  if(request.method==="GET"&&url.pathname==="/")return responder({status:"online",servico:"Pix MisticPay, acompanhamento e notificacoes - Espetinho Perus",misticpay:Boolean(env.MISTICPAY_CI&&env.MISTICPAY_CS),pedidos_kv:Boolean(env.ORDERS_KV),admin:Boolean(env.ADMIN_KEY),web_push:Boolean(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY),pagbank_sandbox:Boolean(env.PAGBANK_SANDBOX_TOKEN),pagbank_producao:Boolean(env.PAGBANK_TOKEN),consumer_api:Boolean(env.CONSUMER_API_TOKEN),mercadopago:Boolean(env.MERCADOPAGO_ACCESS_TOKEN)});
  if(request.method==="GET"&&url.pathname==="/vapid-public-key")return responder({publicKey:env.VAPID_PUBLIC_KEY||""});

  // Consumer API do Parceiro. Nao consulta estoque e nao bloqueia produtos sem cadastro.
  if(url.pathname.startsWith("/consumer/")){
    if(!consumerAutorizado(request,env,url))return responder({statusCode:401,reasonPhrase:"Token Consumer invalido."},401);
    if(!env.ORDERS_KV)return responder({statusCode:500,reasonPhrase:"ORDERS_KV nao configurado."},500);

    if(request.method==="GET"&&url.pathname==="/consumer/polling"){
      const pedidos=await pedidosPendentesConsumer(env);
      const items=pedidos.slice(0,100).map(p=>({
        id:p.consumer_sync?.event_id||`PLC-${p.order_id}`,
        orderId:p.order_id,
        createdAt:p.created_at||new Date().toISOString(),
        fullCode:"PLACED",
        code:"PLC"
      }));
      return responder({items,statusCode:0,reasonPhrase:null});
    }

    const detalheGet=url.pathname.match(/^\/consumer\/orders\/([^/]+)$/);
    if(request.method==="GET"&&detalheGet){
      const orderId=decodeURIComponent(detalheGet[1]);
      const p=await buscarPedido(env,orderId);
      if(!p)return responder({statusCode:404,reasonPhrase:"Pedido nao encontrado."},404);
      const detalhes = detalheConsumer(p,env);
      await env.ORDERS_KV.put("consumer:debug:last-details-response", JSON.stringify({order_id:orderId,generated_at:new Date().toISOString(),response:detalhes}), {expirationTtl:604800});
      await marcarConsumer(env,p,{status:"details_requested",details_requested_at:new Date().toISOString()});
      return responder(detalhes);
    }

    // O Consumer possui apenas um campo POST. Esta rota recebe todos os eventos.
    if(request.method==="POST"&&url.pathname==="/consumer/events"){
      const b=await request.json().catch(()=>({}));
      const orderId=texto(
        b.orderId||b.OrderId||b?.item?.id||b.Id||b.id||b.referenceId||b.ReferenceId,
        100
      );
      const statusRecebido=texto(
        b.status||b.Status||b.orderStatus||b.OrderStatus||b.eventStatus||b.EventStatus,
        100
      );
      const eventCode=texto(
        b.code||b.Code||b.eventCode||b.EventCode||b.fullCode||b.FullCode||b.EventFullCode||b.EventFull,
        100
      );

      await env.ORDERS_KV.put(
        "consumer:debug:last-event",
        JSON.stringify({received_at:new Date().toISOString(),body:b}),
        {expirationTtl:604800}
      );

      // Atualizacao de status enviada pelo Consumer.
      const novo=consumerStatusParaSite(statusRecebido||eventCode);
      if(orderId&&novo){
        const p=await buscarPedido(env,orderId);
        if(!p)return responder({statusCode:404,reasonPhrase:"Pedido nao encontrado."},404);
        p.order_status=novo;
        p.status_history=p.status_history||[];
        p.status_history.push({
          status:novo,
          at:new Date().toISOString(),
          source:"consumer",
          justification:texto(b.justification||b.Justification||b.reason||b.Reason,300)
        });
        const finalizado=["finalizado","cancelado"].includes(novo);
        await marcarConsumer(env,p,{
          status:finalizado?"concluded":"synced",
          consumer_status:statusRecebido||eventCode,
          justification:texto(b.justification||b.Justification||b.reason||b.Reason,300),
          last_event:b
        });
        await enviarNotificacoes(
          env,p,
          STATUS_LABELS[novo]||"Atualizacao do pedido",
          texto(b.justification||b.Justification||b.reason||b.Reason,300)||`Status atualizado: ${STATUS_LABELS[novo]||novo}.`
        );
        return responder({statusCode:0,reasonPhrase:`${orderId} alterado para '${statusRecebido||eventCode}'.`});
      }

      // Confirmacao de que os detalhes do pedido foram recebidos/processados.
      if(orderId){
        const p=await buscarPedido(env,orderId);
        if(p){
          await marcarConsumer(env,p,{
            status:"event_received",
            event_code:eventCode||null,
            details_sent_at:new Date().toISOString(),
            last_event:b
          });
        }
      }

      return responder({
        statusCode:0,
        reasonPhrase:`${orderId||"Evento"} recebido com sucesso.`
      });
    }

    // Compatibilidade temporaria com a versao anterior. O Consumer deve usar /consumer/events.
    if(request.method==="POST"&&[
      "/consumer/order-details-events",
      "/consumer/order-details",
      "/consumer/status"
    ].includes(url.pathname)){
      return responder({
        statusCode:410,
        reasonPhrase:"Use o unico endpoint POST: /consumer/events"
      },410);
    }

    if(request.method==="GET"&&url.pathname==="/consumer/debug"){
      const ultimo=await env.ORDERS_KV.get("consumer:debug:last-details-response","json");
      return responder({statusCode:0,reasonPhrase:null,lastDetails:ultimo});
    }
    return responder({statusCode:404,reasonPhrase:"Rota Consumer nao encontrada."},404);
  }

  if(request.method==="GET"&&url.pathname==="/admin/realtime"){
    const suppliedKey=url.searchParams.get("key")||(request.headers.get("X-Admin-Key")||"");
    if(!env.ADMIN_KEY||suppliedKey!==env.ADMIN_KEY)return responder({erro:"Senha administrativa invalida."},401);
    if(request.headers.get("Upgrade")!=="websocket")return responder({erro:"Esta rota exige WebSocket."},426);
    if(!env.ORDER_REALTIME)return responder({erro:"Durable Object ORDER_REALTIME nao configurado."},500);
    const id=env.ORDER_REALTIME.idFromName("espetinho-perus");
    return env.ORDER_REALTIME.get(id).fetch(request);
  }
  if(request.method==="GET"&&url.pathname==="/delivery-status"){if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);return responder(await estadoDelivery(env));}
  if(request.method==="GET"&&url.pathname==="/pedido-status"){const token=texto(url.searchParams.get("token"),200);const p=await pedidoPorToken(env,token);return p?responder({pedido:pedidoPublico(p)}):responder({erro:"Pedido nao encontrado."},404)}
  if(request.method==="POST"&&url.pathname==="/pedido-subscribe"){
    const b=await request.json();const p=await pedidoPorToken(env,texto(b.token,200));
    if(!p)return responder({erro:"Pedido nao encontrado."},404);
    if(!b.subscription?.endpoint||!b.subscription?.keys?.p256dh||!b.subscription?.keys?.auth)return responder({erro:"Assinatura invalida ou incompleta."},400);
    p.push_subscriptions=Array.isArray(p.push_subscriptions)?p.push_subscriptions:[];
    p.push_subscriptions=p.push_subscriptions.filter(s=>s.endpoint!==b.subscription.endpoint);p.push_subscriptions.push(b.subscription);await gravarPedido(env,p);
    let test={sent:0,failed:0,results:[]};
    if(b.test) test=await enviarNotificacoes(env,p,"Notificacoes ativadas!","Voce recebera aqui as atualizacoes do seu pedido.");
    if(b.test&&test.sent<1)return responder({erro:"A assinatura foi salva, mas o navegador recusou a notificacao de teste.",detalhes:test.results},502);
    return responder({ok:true,test_sent:test.sent>0,diagnostico:test});
  }
  if(url.pathname.startsWith("/admin/")){
    if(!adminAutorizado(request,env))return responder({erro:"Senha administrativa invalida."},401);if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);
    if(request.method==="GET"&&url.pathname==="/admin/orders")return responder({pedidos:await listarPedidos(env)});
    if(request.method==="GET"&&url.pathname==="/admin/delivery-control")return responder(await estadoDelivery(env));
    if(request.method==="POST"&&url.pathname==="/admin/delivery-control"){
      const b=await request.json().catch(()=>({}));
      const mode=String(b.mode||"");
      if(!["manual_open","manual_closed","automatic"].includes(mode))return responder({erro:"Modo de delivery invalido."},400);
      return responder(await salvarControleDelivery(env,mode));
    }
    if(request.method==="GET"&&url.pathname==="/admin/misticpay-debug"){
      const debug=await env.ORDERS_KV.get("debug:misticpay:last","json");
      return debug?responder({ok:true,debug}):responder({erro:"Nenhum diagnostico da MisticPay foi gravado ainda."},404);
    }
    if(request.method==="GET"&&url.pathname==="/admin/misticpay-auth-test"){
      const creds=credenciaisMistic(env);
      if(!creds.ci||!creds.cs)return responder({ok:false,erro:"Credenciais MisticPay ausentes.",diagnostico:creds.diagnostico},500);
      try{
        const r=await fetch("https://api.misticpay.com/api/users/info",{
          method:"GET",
          headers:{ci:creds.ci,cs:creds.cs,"Content-Type":"application/json",Accept:"application/json"}
        });
        const body=await r.json().catch(async()=>({texto:(await r.text().catch(()=>"" )).slice(0,500)}));
        return responder({ok:r.ok,http_status:r.status,diagnostico:creds.diagnostico,resposta:body},r.ok?200:r.status);
      }catch(e){
        return responder({ok:false,erro:e instanceof Error?e.message:String(e),diagnostico:creds.diagnostico},502);
      }
    }
    if(request.method==="POST"&&url.pathname==="/admin/push-subscribe"){
      const b=await request.json().catch(()=>({}));
      const subscription=b.subscription;
      if(!subscription?.endpoint||!subscription?.keys?.p256dh||!subscription?.keys?.auth)return responder({erro:"Assinatura administrativa invalida ou incompleta."},400);
      const total=await registrarAssinaturaAdmin(env,subscription);
      let test={sent:0,failed:0,results:[]};
      if(b.test)test=await enviarNotificacoesAdmin(env,{title:"Alertas do painel ativados!",body:"O celular recebera novos pedidos pagos mesmo com o aplicativo fechado.",tag:"admin-push-teste",url:"https://geradorlipejb.com/painel/",icon:"https://geradorlipejb.com/painel/icon-192.png",requireInteraction:false});
      if(b.test&&test.sent<1)return responder({erro:"A assinatura foi salva, mas o servico Push recusou a notificacao de teste.",detalhes:test.results,total_assinaturas:total},502);
      return responder({ok:true,test_sent:test.sent>0,total_assinaturas:total,diagnostico:test});
    }
    if(request.method==="GET"&&url.pathname==="/admin/push-status"){
      const subscriptions=await listarAssinaturasAdmin(env);
      return responder({ok:true,total_assinaturas:subscriptions.length});
    }
    if(request.method==="POST"&&url.pathname==="/admin/test-admin-push"){
      const test=await enviarNotificacoesAdmin(env,{title:"Teste do painel",body:"Web Push em segundo plano esta funcionando.",tag:"admin-push-manual",url:"https://geradorlipejb.com/painel/",icon:"https://geradorlipejb.com/painel/icon-192.png",requireInteraction:true});
      return responder({ok:test.sent>0,...test},test.sent>0?200:502);
    }
    if(request.method==="POST"&&url.pathname==="/admin/test-push"){const b=await request.json();const p=await pedidoPorToken(env,texto(b.token,200));if(!p)return responder({erro:"Pedido nao encontrado."},404);const test=await enviarNotificacoes(env,p,"Teste Espetinho Perus","A notificacao do cliente esta funcionando.");return responder({ok:test.sent>0,...test},test.sent>0?200:502)}
    const m=url.pathname.match(/^\/admin\/orders\/([^/]+)$/);if(request.method==="PATCH"&&m){const p=await buscarPedido(env,decodeURIComponent(m[1]));if(!p)return responder({erro:"Pedido nao encontrado."},404);const b=await request.json();const ok=["recebido","em_preparo","pronto_retirada","saiu_entrega","finalizado","cancelado"];if(!ok.includes(b.order_status))return responder({erro:"Status invalido."},400);p.order_status=b.order_status;p.estimated_minutes=Number.isFinite(Number(b.estimated_minutes))?Math.max(0,Math.min(240,Number(b.estimated_minutes))):(p.estimated_minutes||25);p.status_history=p.status_history||[];p.status_history.push({status:b.order_status,at:new Date().toISOString()});await gravarPedido(env,p);await enviarNotificacoes(env,p,STATUS_LABELS[b.order_status]||"Atualizacao do pedido", b.order_status==="pronto_retirada"?"Seu pedido está pronto para retirada.":b.order_status==="saiu_entrega"?"Seu pedido está a caminho.":`Status atualizado: ${STATUS_LABELS[b.order_status]||b.order_status}.`);return responder({pedido:p})}
    return responder({erro:"Rota administrativa nao encontrada."},404);
  }

  if(request.method==="POST"&&url.pathname==="/criar-pedido"){
    try{
      if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);
      const entrada=await request.json();
      const clienteAuth=await clienteSupabaseAutenticado(request,env);
      if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);
      const entrega=calcularEntrega(entrada);
      let subtotal=0;
      const itens=entrada.items.map(item=>{
        const nome=texto(item.name||item.nome||item.title,150), q=Number(item.quantity||item.quantidade);
        if(!nome)throw new Error("Produto sem nome.");
        if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);
        const informado=Number(item.unit_price??item.price??item.preco);
        const unit_price=Object.prototype.hasOwnProperty.call(PRECOS,nome)?PRECOS[nome]:informado;
        if(!Number.isFinite(unit_price)||unit_price<=0)throw new Error(`Preco invalido para ${nome}`);
        subtotal+=unit_price*q;
        return {name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100,external_code:codigoImpressaoProduto(nome,item),unregistered:!Object.prototype.hasOwnProperty.call(PRECOS,nome)};
      });
      subtotal=Math.round(subtotal*100)/100;
      const total=Math.round((subtotal+entrega.fee)*100)/100;
      const orderId=texto(entrada.order_id||entrada.numero_pedido,100)||`EP-${Date.now()}`;
      if(await buscarPedido(env,orderId))return responder({erro:"Pedido duplicado.",order_id:orderId},409);
      const agora=new Date().toISOString(), tracking=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16);
      const p={order_id:orderId,tracking_token:tracking,site_url:texto(entrada.site_url,300)||"https://geradorlipejb.com",created_at:agora,updated_at:agora,
        customer:{name:texto(entrada.customer?.name||"Cliente",100),email:texto(entrada.customer?.email,150).toLowerCase(),phone:texto(entrada.customer?.phone,30),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),cep:texto(entrada.customer?.cep,12),bairro:entrega.bairro,notes:texto(entrada.customer?.notes,500),loyalty_customer_id:clienteAuth?.id||null},
        items:itens,subtotal,delivery_fee:entrega.fee,total,payment_id:null,payment_provider:"dinheiro",payment_method:"Dinheiro",change_for:texto(entrada.change_for,50),payment_status:"approved",payment_status_detail:"Pagamento na entrega/retirada",order_status:"recebido",paid_at:agora,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"recebido",at:agora,origem:"site"}],consumer_sync:{status:"pending",created_at:agora}};
      await gravarPedido(env,p,{type:"order_created"});
      const tarefasPosteriores=(async()=>{
        try{
          await creditarPontosFidelidade(env,p);
          await gravarPedido(env,p,{notify:false});
          await notificarNovoPedidoPago(env,p);
        }catch(error){console.error("tarefas posteriores do pedido",error)}
      })();
      if(ctx?.waitUntil) ctx.waitUntil(tarefasPosteriores); else await tarefasPosteriores;
      return responder({ok:true,numero_pedido:orderId,order_id:orderId,tracking_token:tracking,status:"approved",order_status:"recebido",total},201);
    }catch(e){console.error("criar-pedido",e);return responder({erro:"Erro ao registrar pedido.",detalhes:e instanceof Error?e.message:String(e)},500)}
  }
  if(request.method==="POST"&&url.pathname==="/criar-checkout-mercadopago"){
    try{
      if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);
      const token=env.MERCADOPAGO_ACCESS_TOKEN;if(!token)return responder({erro:"MERCADOPAGO_ACCESS_TOKEN nao configurado no Worker."},500);
      const entrada=await request.json();const clienteAuth=await clienteSupabaseAutenticado(request,env);
      if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);
      const email=texto(entrada.customer?.email||entrada.email,150).toLowerCase();if(!emailValido(email))return responder({erro:"Informe um e-mail valido."},400);
      let subtotal=0;const itens=entrada.items.map(item=>{const nome=texto(item.name||item.nome||item.title,150),q=Number(item.quantity||item.quantidade);if(!nome)throw new Error("Produto sem nome.");if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);const precoSite=Number(item.unit_price??item.price??item.preco);const unit_price=Object.prototype.hasOwnProperty.call(PRECOS,nome)?PRECOS[nome]:precoSite;if(!Number.isFinite(unit_price)||unit_price<=0)throw new Error(`Preco invalido para ${nome}`);subtotal+=unit_price*q;return{name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100,external_code:codigoImpressaoProduto(nome,item),unregistered:!Object.prototype.hasOwnProperty.call(PRECOS,nome)}});subtotal=Math.round(subtotal*100)/100;
      const entrega=calcularEntrega(entrada),deliveryFee=entrega.fee,total=Math.round((subtotal+deliveryFee)*100)/100;
      const orderId=texto(entrada.order_id||entrada.numero_pedido,64)||`EP-${Date.now()}`,nome=texto(entrada.customer?.name||"Cliente",100),agora=new Date().toISOString();
      const partesNome=nome.trim().split(/\s+/).filter(Boolean),primeiroNome=texto(entrada.customer?.first_name||partesNome[0]||nome,60),sobrenome=texto(entrada.customer?.last_name||partesNome.slice(1).join(" "),60);
      const cpf=texto(entrada.customer?.cpf||entrada.customer?.document,20).replace(/\D/g,"");if(cpf.length!==11)return responder({erro:"Informe um CPF valido para o pagamento com cartao."},400);
      const telefone=texto(entrada.customer?.phone,30).replace(/\D/g,"");const ddd=telefone.length>=10?telefone.slice(0,2):"";const numeroTelefone=telefone.length>=10?telefone.slice(2):telefone;
      const cep=texto(entrada.customer?.cep,12).replace(/\D/g,"");const rua=texto(entrada.customer?.street,160),numeroEndereco=texto(entrada.customer?.number,30),complemento=texto(entrada.customer?.complement,100),bairro=texto(entrada.customer?.bairro||entrega.bairro,100),cidade=texto(entrada.customer?.city,100),estado=texto(entrada.customer?.state,2).toUpperCase();
      if(await buscarPedido(env,orderId))return responder({erro:"Pedido duplicado.",order_id:orderId},409);
      const tracking=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16);
      let p={order_id:orderId,tracking_token:tracking,site_url:texto(entrada.site_url,300)||"https://espetinhoperus.com.br",created_at:agora,updated_at:agora,customer:{name:nome,first_name:primeiroNome,last_name:sobrenome,email,phone:texto(entrada.customer?.phone,30),cpf,birth_date:texto(entrada.customer?.birth_date,10),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),cep,street:rua,number:numeroEndereco,complement:complemento,bairro,city:cidade,state:estado,reference:texto(entrada.customer?.reference,150),notes:texto(entrada.customer?.notes,500),loyalty_customer_id:clienteAuth?.id||null},items:itens,subtotal,delivery_fee:deliveryFee,total,payment_id:null,preference_id:null,payment_provider:"mercadopago",payment_method:"CREDIT_CARD",payment_status:"creating",payment_status_detail:"",order_status:"aguardando_pagamento",paid_at:null,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"aguardando_pagamento",at:agora}]};await gravarPedido(env,p);
      const site=p.site_url.replace(/\/$/,"");
      const mpItems=[...itens.map((i,index)=>({id:`${orderId}-item-${index+1}`,title:i.name,quantity:i.quantity,currency_id:"BRL",unit_price:Number(i.unit_price)})),...(deliveryFee>0?[{id:`${orderId}-frete`,title:"Taxa de entrega - Perus",quantity:1,currency_id:"BRL",unit_price:Number(deliveryFee)}]:[])];
      const payer={name:primeiroNome,surname:sobrenome,email,identification:{type:"CPF",number:cpf}};
      if(ddd&&numeroTelefone)payer.phone={area_code:ddd,number:numeroTelefone};
      if(cep||rua||numeroEndereco)payer.address={zip_code:cep,street_name:rua,street_number:numeroEndereco};
      const body={items:mpItems,external_reference:orderId,metadata:{order_id:orderId,tracking_token:tracking,customer_cpf:cpf},payer,notification_url:`${url.origin}/webhook-mercadopago`,back_urls:{success:`${site}/pedido.html?token=${encodeURIComponent(tracking)}&pagamento=aprovado`,pending:`${site}/pedido.html?token=${encodeURIComponent(tracking)}&pagamento=pendente`,failure:`${site}/pedido.html?token=${encodeURIComponent(tracking)}&pagamento=falhou`},auto_return:"approved",statement_descriptor:"ESPETINHO PERUS",payment_methods:{excluded_payment_types:[{id:"pix"},{id:"ticket"},{id:"atm"},{id:"bank_transfer"},{id:"debit_card"},{id:"prepaid_card"}],installments:Math.max(1,Math.min(12,Number(env.MERCADOPAGO_INSTALLMENTS_LIMIT||3)))}};
      if(texto(entrada.customer?.fulfillment,50)==="Entrega"&&(rua||cep))body.shipments={receiver_address:{zip_code:cep,street_name:rua,street_number:numeroEndereco,city_name:cidade,state_name:estado,floor:complemento,apartment:texto(entrada.customer?.reference,100)}};
      const r=await fetch("https://api.mercadopago.com/checkout/preferences",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json","X-Idempotency-Key":orderId},body:JSON.stringify(body)});let d={};try{d=await r.json()}catch{d={erro:"Resposta invalida do Mercado Pago"}};
      if(!r.ok){console.error("Mercado Pago recusou preferencia",JSON.stringify({status:r.status,resposta:d}));p.payment_status="error";p.payment_status_detail=texto(JSON.stringify(d),500);await gravarPedido(env,p);return responder({erro:"Mercado Pago recusou a criacao do checkout.",status_mercadopago:r.status,detalhes:d},r.status)}
      const checkoutUrl=d.init_point||d.sandbox_init_point;if(!d.id||!checkoutUrl)return responder({erro:"Mercado Pago nao retornou o link de pagamento.",detalhes:d},502);
      p.preference_id=String(d.id);p.payment_status="pending";p.payment_status_detail="Aguardando pagamento";await gravarPedido(env,p);await env.ORDERS_KV.put(`mercadopago:preference:${d.id}`,orderId);
      return responder({preference_id:d.id,checkout_url:checkoutUrl,numero_pedido:orderId,tracking_token:tracking,status:p.payment_status,total},201);
    }catch(e){console.error("criar-checkout-mercadopago",e);return responder({erro:"Erro ao criar checkout Mercado Pago.",detalhes:e instanceof Error?e.message:String(e)},500)}
  }
  if(request.method==="POST"&&url.pathname==="/webhook-mercadopago"){
    try{
      const b=await request.json().catch(()=>({}));
      const paymentId=texto(b?.data?.id||b?.id||url.searchParams.get("data.id")||url.searchParams.get("id"),100);
      if(paymentId){const c=await consultarPagamentoMercadoPago(env,paymentId);if(c.ok)await sincronizarMercadoPago(env,c.data);else console.error("Falha ao consultar pagamento Mercado Pago",c.status,c.data);}
    }catch(e){console.error("webhook-mercadopago",e)}
    return responder({recebido:true});
  }
  if(request.method==="GET"&&url.pathname==="/mercadopago-status"){
    const paymentId=texto(url.searchParams.get("id"),100);if(!paymentId)return responder({erro:"ID do pagamento invalido."},400);
    const c=await consultarPagamentoMercadoPago(env,paymentId);if(!c.ok)return responder({erro:"Nao foi possivel consultar o Mercado Pago.",detalhes:c.data},c.status);
    const p=await sincronizarMercadoPago(env,c.data);return responder({payment_id:paymentId,status:p?.payment_status||normalizarStatusMercadoPago(c.data?.status),pedido:p?{order_id:p.order_id,order_status:p.order_status,tracking_token:p.tracking_token,loyalty:p.loyalty||null}:null});
  }
  if(request.method==="POST"&&url.pathname==="/criar-checkout-pagbank"){
    try{
      if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);
      const token=pagBankToken(env); if(!token)return responder({erro:"Token do PagBank nao configurado no Worker."},500);
      const entrada=await request.json(); const clienteAuth=await clienteSupabaseAutenticado(request,env); if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);
      const email=texto(entrada.customer?.email||entrada.email,150).toLowerCase(); if(!emailValido(email))return responder({erro:"Informe um e-mail valido."},400);
      let subtotal=0; const itens=entrada.items.map(item=>{const nome=texto(item.name||item.nome||item.title,150),q=Number(item.quantity||item.quantidade);if(!nome)throw new Error("Produto sem nome.");if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);const precoSite=Number(item.unit_price??item.price??item.preco);const unit_price=Object.prototype.hasOwnProperty.call(PRECOS,nome)?PRECOS[nome]:precoSite;if(!Number.isFinite(unit_price)||unit_price<=0)throw new Error(`Preco invalido para ${nome}`);subtotal+=unit_price*q;return{name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100,external_code:codigoImpressaoProduto(nome,item),unregistered:!Object.prototype.hasOwnProperty.call(PRECOS,nome)}}); subtotal=Math.round(subtotal*100)/100;
      const entrega=calcularEntrega(entrada); const deliveryFee=entrega.fee; const total=Math.round((subtotal+deliveryFee)*100)/100;
      const orderId=texto(entrada.order_id||entrada.numero_pedido,64)||`EP-${Date.now()}`,nome=texto(entrada.customer?.name||"Cliente",100),agora=new Date().toISOString();
      const tracking=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16);
      const method=entrada.payment_method==="DEBIT_CARD"?"DEBIT_CARD":"CREDIT_CARD";
      let p={order_id:orderId,tracking_token:tracking,site_url:texto(entrada.site_url,300)||"https://geradorlipejb.com",created_at:agora,updated_at:agora,customer:{name:nome,email,phone:texto(entrada.customer?.phone,30),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),cep:texto(entrada.customer?.cep,12),bairro:entrega.bairro,notes:texto(entrada.customer?.notes,500),loyalty_customer_id:clienteAuth?.id||null},items:itens,subtotal,delivery_fee:deliveryFee,total,payment_id:null,checkout_id:null,payment_provider:"pagbank",payment_method:method,payment_status:"creating",payment_status_detail:"",order_status:"aguardando_pagamento",paid_at:null,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"aguardando_pagamento",at:agora}]}; await gravarPedido(env,p);
      const site=p.site_url.replace(/\/$/,""); const webhook=`${url.origin}/webhook-pagbank`;
      const body={reference_id:orderId,customer_modifiable:true,items:[...itens.map((i,n)=>({reference_id:`${orderId}-${n+1}`,name:i.name,quantity:i.quantity,unit_amount:Math.round(i.unit_price*100)})),...(deliveryFee>0?[{reference_id:`${orderId}-frete`,name:"Taxa de entrega - Perus",quantity:1,unit_amount:Math.round(deliveryFee*100)}]:[])],payment_methods:[{type:method}],payment_methods_configs:method==="CREDIT_CARD"?[{type:"CREDIT_CARD",config_options:[{option:"INSTALLMENTS_LIMIT",value:String(Math.max(1,Math.min(12,Number(env.PAGBANK_INSTALLMENTS_LIMIT||3))))}]}]:undefined,notification_urls:[webhook],payment_notification_urls:[webhook],redirect_url:`${site}/pedido.html?token=${encodeURIComponent(tracking)}`,return_url:`${site}/pedido.html?token=${encodeURIComponent(tracking)}`,redirect_waiting_time:5};
      if(!body.payment_methods_configs)delete body.payment_methods_configs;
      const r=await fetch(`${pagBankBase(env)}/checkouts`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(body)}); let d={};try{d=await r.json()}catch{d={erro:"Resposta invalida do PagBank"}};
      if(!r.ok){console.error("PagBank checkout recusado",JSON.stringify({status:r.status,resposta:d,payload:body}));p.payment_status="error";p.payment_status_detail=texto(JSON.stringify(d),500);await gravarPedido(env,p);return responder({erro:"PagBank recusou a criacao do checkout.",status_pagbank:r.status,detalhes:d},r.status)}
      const payLink=(d.links||[]).find(l=>l.rel==="PAY")?.href; if(!d.id||!payLink)return responder({erro:"PagBank nao retornou o link de pagamento.",detalhes:d},502);
      p.checkout_id=String(d.id);p.payment_id=String(d.id);p.payment_status="pending";p.payment_status_detail=texto(d.status||"ACTIVE",100);await gravarPedido(env,p);await env.ORDERS_KV.put(`pagbank:${d.id}`,orderId);
      return responder({checkout_id:d.id,checkout_url:payLink,numero_pedido:orderId,tracking_token:tracking,status:p.payment_status,total},201);
    }catch(e){console.error("criar-checkout-pagbank",e);return responder({erro:"Erro ao criar checkout PagBank.",detalhes:e instanceof Error?e.message:String(e)},500)}
  }
  if(request.method==="POST"&&url.pathname==="/webhook-pagbank"){
    try{
      const b=await request.json().catch(()=>({})); let payload=b;
      const checkoutId=texto(b?.id||b?.checkout_id||b?.data?.id,100);
      if(checkoutId&&String(checkoutId).startsWith("CHEC_")){const c=await consultarCheckoutPagBank(env,checkoutId);if(c.ok)payload=c.data;}
      await sincronizarPagBank(env,payload);
    }catch(e){console.error("webhook-pagbank",e)}
    return responder({recebido:true});
  }
  if(request.method==="GET"&&url.pathname==="/pagbank-status"){
    const checkoutId=texto(url.searchParams.get("id"),100);if(!checkoutId)return responder({erro:"ID do checkout invalido."},400);
    const c=await consultarCheckoutPagBank(env,checkoutId);if(!c.ok)return responder({erro:"Nao foi possivel consultar o PagBank.",detalhes:c.data},c.status);
    const p=await sincronizarPagBank(env,c.data);return responder({checkout_id:checkoutId,status:p?.payment_status||normalizarStatusPagBank(c.data?.status),pedido:p?{order_id:p.order_id,order_status:p.order_status,tracking_token:p.tracking_token,loyalty:p.loyalty||null}:null});
  }
  if(!credenciaisMistic(env).ci||!credenciaisMistic(env).cs)return responder({erro:"MISTICPAY_CI ou MISTICPAY_CS nao configurado.",diagnostico:credenciaisMistic(env).diagnostico},500);
  if(request.method==="GET"&&url.pathname==="/pagamento-status"){
    const id=texto(url.searchParams.get("id"),100);if(!id)return responder({erro:"ID de pagamento invalido."},400);
    const c=await consultarMisticPay(env,id);if(!c.ok)return responder({erro:"Nao foi possivel consultar o pagamento na MisticPay.",detalhes:c.data},c.status);
    const tx=c.data?.transaction||c.data?.data||c.data;const p=await sincronizarPagamentoMistic(env,c.data);const status=statusMisticParaSite(tx?.transactionState||tx?.status);
    return responder({id:String(tx?.transactionId??id),status,status_detail:tx?.transactionState||tx?.status||"",pedido:p?{order_id:p.order_id,order_status:p.order_status,tracking_token:p.tracking_token,loyalty:p.loyalty||null}:null});
  }
  if(request.method==="POST"&&url.pathname==="/webhook-misticpay"){
    try{
      const b=await request.json().catch(()=>({}));const id=b?.transactionId??b?.data?.transactionId??url.searchParams.get("id");
      if(id!==undefined&&id!==null){const c=await consultarMisticPay(env,String(id));if(c.ok)await sincronizarPagamentoMistic(env,c.data)}
    }catch(e){console.error("webhook-misticpay",e)}
    return responder({recebido:true});
  }
  if(request.method!=="POST"||url.pathname!=="/criar-pix")return responder({erro:"Rota nao encontrada."},404);
  try{if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);const entrada=await request.json();const clienteAuth=await clienteSupabaseAutenticado(request,env);if(!clienteAuth?.id)return responder({erro:"Cadastre-se ou entre na sua conta para concluir o pedido e receber 10% de desconto."},401);if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);const email=texto(entrada.customer?.email||entrada.email,150).toLowerCase();if(!emailValido(email))return responder({erro:"Informe um e-mail valido para gerar o Pix."},400);
    let subtotal=0;const itens=entrada.items.map((item,index)=>{const nome=texto(item.name||item.nome||item.title,150),q=Number(item.quantity||item.quantidade);if(!nome)throw new Error("Produto sem nome.");if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);const precoSite=Number(item.unit_price??item.price??item.preco);const unit_price=Object.prototype.hasOwnProperty.call(PRECOS,nome)?PRECOS[nome]:precoSite;if(!Number.isFinite(unit_price)||unit_price<=0)throw new Error(`Preco invalido para ${nome}`);subtotal+=unit_price*q;return{name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100,external_code:codigoImpressaoProduto(nome,item),unregistered:!Object.prototype.hasOwnProperty.call(PRECOS,nome)}});subtotal=Math.round(subtotal*100)/100;const discountRate=0.10;const discountAmount=Math.round(subtotal*discountRate*100)/100;const discountedSubtotal=Math.round((subtotal-discountAmount)*100)/100;const entrega=calcularEntrega(entrada);const deliveryFee=entrega.fee;const total=Math.round((discountedSubtotal+deliveryFee)*100)/100;
    const orderId=texto(entrada.order_id||entrada.numero_pedido,100)||`EP-${Date.now()}`, nome=texto(entrada.customer?.name||entrada.nome||"Cliente",100), agora=new Date().toISOString();let p={order_id:orderId,tracking_token:crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16),site_url:texto(entrada.site_url,300)||"https://geradorlipejb.com",created_at:agora,updated_at:agora,customer:{name:nome,email,phone:texto(entrada.customer?.phone,30),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),cep:texto(entrada.customer?.cep,12),bairro:entrega.bairro,notes:texto(entrada.customer?.notes,500),loyalty_customer_id:clienteAuth?.id||null},items:itens,subtotal,discount_rate:discountRate,discount_amount:discountAmount,discounted_subtotal:discountedSubtotal,promotion_code:"CADASTRADO10",delivery_fee:deliveryFee,total,payment_id:null,payment_status:"creating",payment_status_detail:"",order_status:"aguardando_pagamento",paid_at:null,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"aguardando_pagamento",at:agora}]};await gravarPedido(env,p);
    const pay={amount:total,payerName:nome,transactionId:orderId,description:`Pedido ${orderId} - Espetinho Perus`,projectWebhook:`${url.origin}/webhook-misticpay`};
    const documento=texto(entrada.customer?.document||entrada.customer?.cpf||entrada.payerDocument||env.MISTICPAY_PAYER_DOCUMENT,30).replace(/\D/g,"");
    if(documento)pay.payerDocument=documento;
    const r=await fetch("https://api.misticpay.com/api/transactions/create",{method:"POST",headers:{ci:credenciaisMistic(env).ci,cs:credenciaisMistic(env).cs,"Content-Type":"application/json"},body:JSON.stringify(pay)});
    let d={};try{d=await r.json()}catch{d={erro:"Resposta invalida da MisticPay"}}
    const diagnosticoCriacao={
      registrado_em:new Date().toISOString(),
      http_status:r.status,
      http_status_text:r.statusText,
      endpoint:"https://api.misticpay.com/api/transactions/create",
      payload_enviado:{...pay,payerDocument:pay.payerDocument?`${pay.payerDocument.slice(0,3)}*****${pay.payerDocument.slice(-2)}`:"nao informado"},
      resposta_misticpay:d
    };
    console.log("MisticPay create resposta",diagnosticoCriacao);
    await env.ORDERS_KV.put("debug:misticpay:last",JSON.stringify(diagnosticoCriacao),{expirationTtl:86400});
    if(!r.ok){
      const mensagemApi=texto(
        d?.message||d?.error||d?.erro||d?.detail||d?.details||
        d?.data?.message||d?.data?.error||d?.data?.erro||
        d?.response?.message||d?.response?.error||
        (typeof d==="string"?d:JSON.stringify(d)),
        900
      )||"Resposta sem mensagem";
      p.payment_status="error";
      p.payment_status_detail=`HTTP ${r.status}: ${mensagemApi}`;
      await gravarPedido(env,p);
      console.error("MisticPay create recusado",{status:r.status,statusText:r.statusText,resposta:d,payload:{...pay,payerDocument:pay.payerDocument?"[INFORMADO]":undefined}});
      return responder({
        erro:`MisticPay recusou o Pix (HTTP ${r.status}): ${mensagemApi}`,
        codigo_http:r.status,
        status_http:r.statusText,
        mensagem_misticpay:mensagemApi,
        detalhes:d,
        dados_enviados:{amount:pay.amount,payerName:pay.payerName,transactionId:pay.transactionId,description:pay.description,projectWebhook:pay.projectWebhook,payerDocument:pay.payerDocument?"informado":"nao informado"},
        teste_sem_cpf:!documento
      },r.status)
    }
    const tx=d?.data||d?.transaction||d;const paymentId=tx?.transactionId??tx?.id;if(paymentId===undefined||paymentId===null){p.payment_status="error";p.payment_status_detail="MisticPay nao retornou transactionId";await gravarPedido(env,p);return responder({erro:"A MisticPay nao retornou o ID da transacao.",detalhes:d},502)}
    const copiaCola=tx?.copyPaste||tx?.qrCode||tx?.qr_code;let qrBase64=texto(tx?.qrCodeBase64||tx?.qrcodeBase64||tx?.qr_code_base64,2000000);qrBase64=qrBase64.replace(/^data:image\/[^;]+;base64,/i,"");
    if(!copiaCola||!qrBase64){p.payment_status="error";p.payment_status_detail="QR Code ausente na resposta";await gravarPedido(env,p);return responder({erro:"A MisticPay nao retornou o QR Code Pix completo.",detalhes:d},502)}
    p.payment_id=String(paymentId);p.payment_provider="misticpay";p.payment_status=statusMisticParaSite(tx?.transactionState||"PENDENTE");p.payment_status_detail=texto(tx?.transactionState||"PENDENTE",100);await gravarPedido(env,p);
    return responder({payment_id:String(paymentId),numero_pedido:orderId,tracking_token:p.tracking_token,status:p.payment_status,total,qr_code:copiaCola,qr_code_base64:qrBase64,ticket_url:tx?.qrcodeUrl||tx?.qrCodeUrl||null,resumo:itens.map(i=>`${i.quantity}x ${i.name}`).join(", "),diagnostico_disponivel:true},201);
  }catch(e){console.error(e);return responder({erro:"Erro ao criar o Pix.",detalhes:e instanceof Error?e.message:String(e)},500)}
} };
