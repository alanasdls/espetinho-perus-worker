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
function pedidoPublico(p) { return { order_id:p.order_id, created_at:p.created_at, updated_at:p.updated_at, paid_at:p.paid_at, customer:{name:p.customer?.name,fulfillment:p.customer?.fulfillment,address:p.customer?.address}, items:p.items, total:p.total, payment_status:p.payment_status, order_status:p.order_status, status_history:p.status_history||[], estimated_minutes:p.estimated_minutes||25 }; }
async function consultarMercadoPago(env,id) { const r=await fetch(`https://api.mercadopago.com/v1/payments/${id}`,{headers:{Authorization:`Bearer ${env.MP_ACCESS_TOKEN}`}}); return {ok:r.ok,status:r.status,data:await r.json()}; }
async function listarPedidos(env) { const l=await env.ORDERS_KV.list({prefix:"order:",limit:1000}), a=[]; for(const k of l.keys){const p=await env.ORDERS_KV.get(k.name,"json");if(p)a.push(p)} return a.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))); }
async function sincronizarPagamento(env,d) {
  if(!d?.id)return null; let id=await env.ORDERS_KV.get(`payment:${d.id}`); if(!id)id=texto(d.external_reference,100); if(!id)return null;
  const p=await buscarPedido(env,id); if(!p)return null; const before=p.payment_status;
  p.payment_id=String(d.id); p.payment_status=texto(d.status,50)||p.payment_status; p.payment_status_detail=texto(d.status_detail,100); p.paid_at=d.date_approved||p.paid_at||null;
  if(d.status==="approved"&&p.order_status==="aguardando_pagamento"){p.order_status="recebido";p.status_history=p.status_history||[];p.status_history.push({status:"recebido",at:new Date().toISOString()})}
  await gravarPedido(env,p); if(before!=="approved"&&d.status==="approved") await enviarNotificacoes(env,p,"Pagamento aprovado!","Recebemos seu pedido. Acompanhe o preparo por aqui."); return p;
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
async function enviarNotificacoes(env,p,title,body) {
  if(!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)return; const subs=Array.isArray(p.push_subscriptions)?p.push_subscriptions:[]; const valid=[];
  for(const s of subs){try{const r=await push(env,s,{title,body,tag:p.order_id,url:`${p.site_url||"https://geradorlipejb.com"}/pedido.html?token=${encodeURIComponent(p.tracking_token)}`,icon:`${p.site_url||"https://geradorlipejb.com"}/icon-192.png`});if(r.status!==404&&r.status!==410)valid.push(s)}catch(e){console.error("push",e)}}
  p.push_subscriptions=valid; await gravarPedido(env,p);
}

export default { async fetch(request,env) {
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS}); const url=new URL(request.url);
  if(request.method==="GET"&&url.pathname==="/")return responder({status:"online",servico:"Pix, acompanhamento e notificacoes - Espetinho Perus",mercado_pago:Boolean(env.MP_ACCESS_TOKEN),pedidos_kv:Boolean(env.ORDERS_KV),admin:Boolean(env.ADMIN_KEY),web_push:Boolean(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY)});
  if(request.method==="GET"&&url.pathname==="/vapid-public-key")return responder({publicKey:env.VAPID_PUBLIC_KEY||""});
  if(request.method==="GET"&&url.pathname==="/pedido-status"){const token=texto(url.searchParams.get("token"),200);const p=await pedidoPorToken(env,token);return p?responder({pedido:pedidoPublico(p)}):responder({erro:"Pedido nao encontrado."},404)}
  if(request.method==="POST"&&url.pathname==="/pedido-subscribe"){const b=await request.json();const p=await pedidoPorToken(env,texto(b.token,200));if(!p)return responder({erro:"Pedido nao encontrado."},404);if(!b.subscription?.endpoint)return responder({erro:"Assinatura invalida."},400);p.push_subscriptions=Array.isArray(p.push_subscriptions)?p.push_subscriptions:[];p.push_subscriptions=p.push_subscriptions.filter(s=>s.endpoint!==b.subscription.endpoint);p.push_subscriptions.push(b.subscription);await gravarPedido(env,p);return responder({ok:true})}
  if(url.pathname.startsWith("/admin/")){
    if(!adminAutorizado(request,env))return responder({erro:"Senha administrativa invalida."},401);if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);
    if(request.method==="GET"&&url.pathname==="/admin/orders")return responder({pedidos:await listarPedidos(env)});
    const m=url.pathname.match(/^\/admin\/orders\/([^/]+)$/);if(request.method==="PATCH"&&m){const p=await buscarPedido(env,decodeURIComponent(m[1]));if(!p)return responder({erro:"Pedido nao encontrado."},404);const b=await request.json();const ok=["recebido","em_preparo","pronto_retirada","saiu_entrega","finalizado","cancelado"];if(!ok.includes(b.order_status))return responder({erro:"Status invalido."},400);p.order_status=b.order_status;p.estimated_minutes=Number.isFinite(Number(b.estimated_minutes))?Math.max(0,Math.min(240,Number(b.estimated_minutes))):(p.estimated_minutes||25);p.status_history=p.status_history||[];p.status_history.push({status:b.order_status,at:new Date().toISOString()});await gravarPedido(env,p);await enviarNotificacoes(env,p,STATUS_LABELS[b.order_status]||"Atualizacao do pedido", b.order_status==="pronto_retirada"?"Seu pedido está pronto para retirada.":b.order_status==="saiu_entrega"?"Seu pedido está a caminho.":`Status atualizado: ${STATUS_LABELS[b.order_status]||b.order_status}.`);return responder({pedido:p})}
    return responder({erro:"Rota administrativa nao encontrada."},404);
  }
  if(!env.MP_ACCESS_TOKEN)return responder({erro:"MP_ACCESS_TOKEN nao configurado."},500);
  if(request.method==="GET"&&url.pathname==="/pagamento-status"){const id=url.searchParams.get("id");if(!id||!/^\d+$/.test(id))return responder({erro:"ID de pagamento invalido."},400);const c=await consultarMercadoPago(env,id);if(!c.ok)return responder({erro:"Nao foi possivel consultar o pagamento.",detalhes:c.data},c.status);const p=await sincronizarPagamento(env,c.data);return responder({id:c.data.id,status:c.data.status,status_detail:c.data.status_detail,pedido:p?{order_id:p.order_id,order_status:p.order_status,tracking_token:p.tracking_token}:null})}
  if(request.method==="POST"&&url.pathname==="/webhook-mercado-pago"){try{const b=await request.json().catch(()=>({}));const id=b?.data?.id||url.searchParams.get("data.id")||url.searchParams.get("id");if(id&&/^\d+$/.test(String(id))){const c=await consultarMercadoPago(env,String(id));if(c.ok)await sincronizarPagamento(env,c.data)}}catch(e){console.error(e)}return responder({recebido:true})}
  if(request.method!=="POST"||url.pathname!=="/criar-pix")return responder({erro:"Rota nao encontrada."},404);
  try{if(!env.ORDERS_KV)return responder({erro:"ORDERS_KV nao configurado."},500);const entrada=await request.json();if(!Array.isArray(entrada.items)||!entrada.items.length)return responder({erro:"O carrinho esta vazio."},400);const email=texto(entrada.customer?.email||entrada.email,150).toLowerCase();if(!emailValido(email))return responder({erro:"Informe um e-mail valido para gerar o Pix."},400);
    let total=0;const itens=entrada.items.map((item,index)=>{const nome=texto(item.name||item.nome||item.title,150),q=Number(item.quantity||item.quantidade);if(!Object.prototype.hasOwnProperty.call(PRECOS,nome))throw new Error(`Produto nao reconhecido: ${nome}`);if(!Number.isInteger(q)||q<1||q>50)throw new Error(`Quantidade invalida para ${nome}`);const unit_price=PRECOS[nome];total+=unit_price*q;return{name:nome,quantity:q,unit_price,subtotal:Math.round(unit_price*q*100)/100}});total=Math.round(total*100)/100;
    const orderId=texto(entrada.order_id||entrada.numero_pedido,100)||`EP-${Date.now()}`, nome=texto(entrada.customer?.name||entrada.nome||"Cliente",100), agora=new Date().toISOString();let p={order_id:orderId,tracking_token:crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16),site_url:texto(entrada.site_url,300)||"https://geradorlipejb.com",created_at:agora,updated_at:agora,customer:{name:nome,email,phone:texto(entrada.customer?.phone,30),fulfillment:texto(entrada.customer?.fulfillment,50),address:texto(entrada.customer?.address,500),notes:texto(entrada.customer?.notes,500)},items:itens,total,payment_id:null,payment_status:"creating",payment_status_detail:"",order_status:"aguardando_pagamento",paid_at:null,estimated_minutes:25,push_subscriptions:[],status_history:[{status:"aguardando_pagamento",at:agora}]};await gravarPedido(env,p);
    const pay={transaction_amount:total,description:`Pedido ${orderId} - Espetinho Perus`,payment_method_id:"pix",external_reference:orderId,notification_url:`${url.origin}/webhook-mercado-pago`,payer:{email,first_name:nome.split(/\s+/)[0]||"Cliente",last_name:nome.split(/\s+/).slice(1).join(" ")||"Espetinho Perus"},additional_info:{items:itens.map((i,j)=>({id:String(j+1),title:i.name,quantity:i.quantity,unit_price:i.unit_price}))},metadata:{numero_pedido:orderId,cliente:nome,telefone:p.customer.phone,recebimento:p.customer.fulfillment,endereco:p.customer.address,observacoes:p.customer.notes}};
    const r=await fetch("https://api.mercadopago.com/v1/payments",{method:"POST",headers:{Authorization:`Bearer ${env.MP_ACCESS_TOKEN}`,"Content-Type":"application/json","X-Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(pay)}),d=await r.json();if(!r.ok){p.payment_status="error";p.payment_status_detail=texto(d?.message||d?.error,200);await gravarPedido(env,p);return responder({erro:"O Mercado Pago recusou a criacao do Pix.",detalhes:d},r.status)}p.payment_id=String(d.id);p.payment_status=texto(d.status,50);p.payment_status_detail=texto(d.status_detail,100);await gravarPedido(env,p);const pix=d.point_of_interaction?.transaction_data||{};if(!pix.qr_code||!pix.qr_code_base64)return responder({erro:"O Mercado Pago nao retornou o QR Code Pix."},502);return responder({payment_id:d.id,numero_pedido:orderId,tracking_token:p.tracking_token,status:d.status,total,qr_code:pix.qr_code,qr_code_base64:pix.qr_code_base64,ticket_url:pix.ticket_url||null,resumo:itens.map(i=>`${i.quantity}x ${i.name}`).join(", ")},201);
  }catch(e){console.error(e);return responder({erro:"Erro ao criar o Pix.",detalhes:e instanceof Error?e.message:String(e)},500)}
} };
