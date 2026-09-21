// Server-only. One Durable Object per order serializes quote/dispatch/status.
import { ADMIN_CONTEXT } from './admin-security.js';
const json = (data, status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail = (message,status=400) => {throw Object.assign(new Error(message),{status});};
export function uberConfig(env) {
  const missing=['UBER_CLIENT_ID','UBER_CLIENT_SECRET','UBER_CUSTOMER_ID','UBER_PICKUP_ADDRESS','UBER_PICKUP_PHONE'].filter(k=>!env[k]);
  return {enabled:env.UBER_ENABLED==='true',mode:env.UBER_MODE==='production'?'production':'test',ready:!missing.length,missing};
}
async function uber(env,path,body) {
  const auth=await fetch('https://auth.uber.com/oauth/v2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.UBER_CLIENT_ID,client_secret:env.UBER_CLIENT_SECRET,grant_type:'client_credentials',scope:'eats.deliveries'}),signal:AbortSignal.timeout(10000)});
  if(!auth.ok)fail('Não foi possível autenticar na Uber. Verifique as credenciais no Cloudflare.',502);
  const token=await auth.json();
  if(!token.access_token)fail('Resposta de autenticação inválida.',502);
  const r=await fetch(`https://api.uber.com/v1/customers/${encodeURIComponent(env.UBER_CUSTOMER_ID)}/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
  if(!r.ok)fail('A Uber não confirmou a operação. Consulte o painel Uber Direct antes de tentar novamente.',502);
  return r.json();
}
function phone(value){let n=String(value||'').replace(/\D/g,'');if(n.length===10||n.length===11)n='55'+n;if(!/^55\d{10,11}$/.test(n))fail('Confira o telefone brasileiro com DDD.');return '+'+n;}
function eligible(p){if(!p)fail('Pedido não encontrado.',404);if(p.customer?.fulfillment!=='Entrega'||p.payment_status!=='approved'||['cancelado','finalizado'].includes(p.order_status))fail('Selecione um pedido de entrega pago e ainda ativo.',409);}
function publicDelivery(d){return {id:d.id,status:d.status,tracking_url:typeof d.tracking_url==='string'&&d.tracking_url.startsWith('https://')?d.tracking_url:null,fee:d.fee,currency:d.currency,live_mode:d.live_mode};}
export async function uberOperation(storage,env,b) {
  try {
    const cfg=uberConfig(env);
    if(!cfg.enabled||!cfg.ready)fail('Uber Direct ainda não configurado/ativado.',503);
    if(!/^[A-Za-z0-9_-]{1,64}$/.test(b.order_id||''))fail('Pedido inválido.');
    let state=await storage.get('uber-v1')||{};
    // A single persisted payload/key survives timeouts, deployments and retries.
    if(state.customer_id&&state.customer_id!==env.UBER_CUSTOMER_ID)fail('Conta Uber alterada: confira a entrega anterior no painel Uber.',409);
    if(b.action==='status'){
      if(state.delivery){state.delivery=publicDelivery(await uber(env,`deliveries/${encodeURIComponent(state.delivery.id)}`));await storage.put('uber-v1',state);}
      return json({delivery:state.delivery||null,pending:!!state.payload&&!state.delivery});
    }
    if(state.delivery)return json({delivery:state.delivery});
    if(b.action==='dispatch'&&state.payload){
      // Never generate another key, including after an ambiguous failure.
      const d=await uber(env,'deliveries',state.payload);
      if(!d.id)fail('Entrega não confirmada; confira o painel Uber.',502);
      state.delivery=publicDelivery(d);await storage.put('uber-v1',state);return json({delivery:state.delivery});
    }
    if(state.payload)fail('Solicitação pendente. Use confirmar novamente para recuperar a mesma entrega.',409);
    const p=await env.ORDERS_KV.get(`order:${b.order_id}`,'json');eligible(p);
    if(b.action==='quote'){
      const address=String(p.customer.address||'').trim();
      if(address.length<10||!p.customer.cep)fail('Confira endereço completo, número e CEP do pedido.');
      const payload={pickup_name:env.UBER_PICKUP_NAME||'Espetinho Perus',pickup_address:env.UBER_PICKUP_ADDRESS,pickup_phone_number:phone(env.UBER_PICKUP_PHONE),dropoff_name:p.customer.name,dropoff_address:`${address}, CEP ${p.customer.cep}, Brasil`,dropoff_phone_number:phone(p.customer.phone),manifest_items:(p.items||[]).map(i=>({name:i.name,quantity:i.quantity,size:'small'})),manifest_reference:p.order_id,external_id:p.order_id,undeliverable_action:'return'};
      if(!payload.manifest_items.length)fail('Pedido sem itens.');
      const q=await uber(env,'delivery_quotes',{pickup_address:payload.pickup_address,dropoff_address:payload.dropoff_address,pickup_phone_number:payload.pickup_phone_number,dropoff_phone_number:payload.dropoff_phone_number});
      if(!q.id||!Number.isInteger(q.fee)||q.fee<0||String(q.currency).toUpperCase()!=='BRL'||!Number.isFinite(Date.parse(q.expires)))fail('Cotação Uber inválida ou moeda diferente de BRL.',502);
      state={customer_id:env.UBER_CUSTOMER_ID,quote:{id:q.id,fee:q.fee,currency:q.currency,expires:q.expires,customer_fee:p.delivery_fee,pickup_address:payload.pickup_address,dropoff_address:payload.dropoff_address},draft:payload,mode:cfg.mode};
      await storage.put('uber-v1',state);return json({quote:state.quote,mode:cfg.mode});
    }
    if(b.action!=='dispatch')fail('Operação inválida.');
    if(!state.quote||b.quote_id!==state.quote.id||b.confirm_fee!==state.quote.fee||Date.parse(state.quote.expires)<=Date.now())fail('Cotação expirada ou alterada. Consulte novamente.',409);
    if(state.mode!==cfg.mode)fail('Modo Uber alterado; consulte novamente.',409);
    state.payload={...state.draft,quote_id:state.quote.id,idempotency_key:crypto.randomUUID()};
    if(cfg.mode==='test')state.payload.test_specifications={robo_courier_specification:{mode:'auto'}};
    await storage.put('uber-v1',state); // Persist BEFORE the paid operation.
    const d=await uber(env,'deliveries',state.payload);
    if(!d.id)fail('Entrega não confirmada; confira o painel Uber.',502);
    state.delivery=publicDelivery(d);await storage.put('uber-v1',state);return json({delivery:state.delivery});
  } catch(e){return json({erro:e.status?e.message:'Falha de comunicação com a Uber. Não solicite outra entrega pelo painel sem conferir a anterior.'},e.status||502);}
}
async function routeUber(request,env,ctx,next) {
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/admin/uber'))return next(request,env,ctx);
  if(env[ADMIN_CONTEXT]?.role!=='admin')return json({erro:'Acesso restrito ao administrador.'},403);
  if(url.pathname==='/admin/uber/config'&&request.method==='GET')return json(uberConfig(env));
  const m=url.pathname.match(/^\/admin\/uber\/orders\/([A-Za-z0-9_-]{1,64})\/(quote|dispatch|status)$/);
  if(!m||request.method!=='POST')return json({erro:'Rota inválida.'},404);
  if(Number(request.headers.get('content-length')||0)>4096)return json({erro:'Requisição muito grande.'},413);
  try {
    const raw=await request.text();if(raw.length>4096)return json({erro:'Requisição muito grande.'},413);
    const body=raw?JSON.parse(raw):{};
    const stub=env.ORDER_REALTIME.get(env.ORDER_REALTIME.idFromName(`uber-v1:${m[1]}`));
    return stub.fetch('https://uber.internal/uber',{method:'POST',body:JSON.stringify({action:m[2],order_id:m[1],quote_id:body.quote_id,confirm_fee:body.confirm_fee})});
  }catch{return json({erro:'Não foi possível acessar a integração Uber.'},503);}
}

export async function handleUber(request,env,ctx,next,headers={}) {
  const r=await routeUber(request,env,ctx,next);
  if(!new URL(request.url).pathname.startsWith('/admin/uber'))return r;
  const h=new Headers(r.headers);for(const [k,v] of Object.entries(headers))h.set(k,v);
  return new Response(r.body,{status:r.status,headers:h});
}
