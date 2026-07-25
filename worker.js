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
function adminAutorizado(request, env) { return Boolean(env.ADMIN_KEY) && (request.headers.get("X-Admin-Key") || "") === env.ADMIN_KEY; }
async function gravarPedido(env, pedido) {
  pedido.updated_at = new Date().toISOString();
  await env.ORDERS_KV.put(`order:${pedido.order_id}`, JSON.stringify(pedido));
  if (pedido.payment_id) await env.ORDERS_KV.put(`payment:${pedido.payment_id}`, pedido.order_id);
  if (pedido.tracking_token) await env.ORDERS_KV.put(`tracking:${pedido.tracking_token}`, pedido.order_id);
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
async function consultarMisticPay(env,id) {
  const r=await fetch("https://api.misticpay.com/api/transactions/check",{
    method:"POST",
    headers:{ci:env.MISTICPAY_CI,cs:env.MISTICPAY_CS,"Content-Type":"application/json"},
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
  if(before!=="approved"&&novoStatus==="approved"){await enviarNotificacoes(env,p,"Pagamento aprovado!","Recebemos seu pedido. Acompanhe o preparo por aqui.");await notificarNovoPedidoPago(env,p);}
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

export default { async fetch(request,env) {
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS}); const url=new URL(request.url);
  if(request.method==="POST"&&["/criar-pix","/criar-checkout-pagbank"].includes(url.pathname)&&!horarioPedidos().aberto)return responder({erro:`Pedidos fechados no momento. Próxima abertura: ${proximaAbertura()}.`},403);
  if(request.method==="GET"&&url.pathname==="/")return responder({status:"online",servico:"Pix MisticPay, acompanhamento e notificacoes - Espetinho Perus",misticpay:Boolean(env.MISTICPAY_CI&&env.MISTICPAY_CS),pedidos_kv:Boolean(env.ORDERS_KV),admin:Boolean(env.ADMIN_KEY),web_push:Boolean(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY),pagbank_sandbox:Boolean(env.PAGBANK_SANDBOX_TOKEN),pagbank_producao:Boolean(env.PAGBANK_TOKEN)});
  if(request.method==="GET"&&url.pathname==="/vapid-public-key")return responder({publicKey:env.VAPID_PUBLIC_KEY||""});
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
    if(request.method==="GET"&&url.pathname==="/admin/misticpay-debug"){
      const debug=await env.ORDERS_KV.get("debug:misticpay:last","json");
      return debug?responder({ok:true,debug}):responder({erro:"Nenhum diagnostico da MisticPay foi gravado ainda."},404);
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
  if(request.method==="POST"&&url.pathname==="/criar-checkout-pagbank"){
    try{
      if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);
      const token=pagBankToken(env); if(!token)return responder({erro:"Token do PagBank nao configurado no Worker."},500);
      const entrada=await request.json(); if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);
      const email=texto(entrada.customer?.email||entrada.email,150).toLowerCase(); if(!emailValido(email))return responder({erro:"Informe um e-mail valido."},400);
      let subtotal=0; const itens=entrada.items.map(item=>{const nome=texto(item.name||item.nome||item.title,150),q=Number(item.quantity||item.quantidade);if(!Object.prototype.hasOwnProperty.call(PRECOS,nome))throw new Error(`Produto nao reconhecido: ${nome}`);if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);const unit_price=PRECOS[nome];subtotal+=unit_price*q;return{name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100}}); subtotal=Math.round(subtotal*100)/100;
      const entrega=calcularEntrega(entrada); const deliveryFee=entrega.fee; const total=Math.round((subtotal+deliveryFee)*100)/100;
      const orderId=texto(entrada.order_id||entrada.numero_pedido,64)||`EP-${Date.now()}`,nome=texto(entrada.customer?.name||"Cliente",100),agora=new Date().toISOString();
      const tracking=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16);
      const method=entrada.payment_method==="DEBIT_CARD"?"DEBIT_CARD":"CREDIT_CARD";
      let p={order_id:orderId,tracking_token:tracking,site_url:texto(entrada.site_url,300)||"https://geradorlipejb.com",created_at:agora,updated_at:agora,customer:{name:nome,email,phone:texto(entrada.customer?.phone,30),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),cep:texto(entrada.customer?.cep,12),bairro:entrega.bairro,notes:texto(entrada.customer?.notes,500)},items:itens,subtotal,delivery_fee:deliveryFee,total,payment_id:null,checkout_id:null,payment_provider:"pagbank",payment_method:method,payment_status:"creating",payment_status_detail:"",order_status:"aguardando_pagamento",paid_at:null,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"aguardando_pagamento",at:agora}]}; await gravarPedido(env,p);
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
    const p=await sincronizarPagBank(env,c.data);return responder({checkout_id:checkoutId,status:p?.payment_status||normalizarStatusPagBank(c.data?.status),pedido:p?{order_id:p.order_id,order_status:p.order_status,tracking_token:p.tracking_token}:null});
  }
  if(!env.MISTICPAY_CI||!env.MISTICPAY_CS)return responder({erro:"MISTICPAY_CI ou MISTICPAY_CS nao configurado."},500);
  if(request.method==="GET"&&url.pathname==="/pagamento-status"){
    const id=texto(url.searchParams.get("id"),100);if(!id)return responder({erro:"ID de pagamento invalido."},400);
    const c=await consultarMisticPay(env,id);if(!c.ok)return responder({erro:"Nao foi possivel consultar o pagamento na MisticPay.",detalhes:c.data},c.status);
    const tx=c.data?.transaction||c.data?.data||c.data;const p=await sincronizarPagamentoMistic(env,c.data);const status=statusMisticParaSite(tx?.transactionState||tx?.status);
    return responder({id:String(tx?.transactionId??id),status,status_detail:tx?.transactionState||tx?.status||"",pedido:p?{order_id:p.order_id,order_status:p.order_status,tracking_token:p.tracking_token}:null});
  }
  if(request.method==="POST"&&url.pathname==="/webhook-misticpay"){
    try{
      const b=await request.json().catch(()=>({}));const id=b?.transactionId??b?.data?.transactionId??url.searchParams.get("id");
      if(id!==undefined&&id!==null){const c=await consultarMisticPay(env,String(id));if(c.ok)await sincronizarPagamentoMistic(env,c.data)}
    }catch(e){console.error("webhook-misticpay",e)}
    return responder({recebido:true});
  }
  if(request.method!=="POST"||url.pathname!=="/criar-pix")return responder({erro:"Rota nao encontrada."},404);
  try{if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);const entrada=await request.json();if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);const email=texto(entrada.customer?.email||entrada.email,150).toLowerCase();if(!emailValido(email))return responder({erro:"Informe um e-mail valido para gerar o Pix."},400);
    let subtotal=0;const itens=entrada.items.map((item,index)=>{const nome=texto(item.name||item.nome||item.title,150),q=Number(item.quantity||item.quantidade);if(!Object.prototype.hasOwnProperty.call(PRECOS,nome))throw new Error(`Produto nao reconhecido: ${nome}`);if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);const unit_price=PRECOS[nome];subtotal+=unit_price*q;return{name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100}});subtotal=Math.round(subtotal*100)/100;const entrega=calcularEntrega(entrada);const deliveryFee=entrega.fee;const total=Math.round((subtotal+deliveryFee)*100)/100;
    const orderId=texto(entrada.order_id||entrada.numero_pedido,100)||`EP-${Date.now()}`, nome=texto(entrada.customer?.name||entrada.nome||"Cliente",100), agora=new Date().toISOString();let p={order_id:orderId,tracking_token:crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16),site_url:texto(entrada.site_url,300)||"https://geradorlipejb.com",created_at:agora,updated_at:agora,customer:{name:nome,email,phone:texto(entrada.customer?.phone,30),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),cep:texto(entrada.customer?.cep,12),bairro:entrega.bairro,notes:texto(entrada.customer?.notes,500)},items:itens,subtotal,delivery_fee:deliveryFee,total,payment_id:null,payment_status:"creating",payment_status_detail:"",order_status:"aguardando_pagamento",paid_at:null,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"aguardando_pagamento",at:agora}]};await gravarPedido(env,p);
    const pay={amount:total,payerName:nome,transactionId:orderId,description:`Pedido ${orderId} - Espetinho Perus`,projectWebhook:`${url.origin}/webhook-misticpay`};
    const documento=texto(entrada.customer?.document||entrada.customer?.cpf||entrada.payerDocument||env.MISTICPAY_PAYER_DOCUMENT,30).replace(/\D/g,"");
    if(documento)pay.payerDocument=documento;
    const r=await fetch("https://api.misticpay.com/api/transactions/create",{method:"POST",headers:{ci:env.MISTICPAY_CI,cs:env.MISTICPAY_CS,"Content-Type":"application/json"},body:JSON.stringify(pay)});
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
