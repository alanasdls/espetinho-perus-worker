// Server-only Asaas integration. Never persist/log card data or provider responses.
export function asaasConfig(env) {
  const production=env.ASAAS_ENV==='production';
  const key=production?env.ASAAS_API_KEY:env.ASAAS_SANDBOX_API_KEY;
  const valid=['sandbox','production'].includes(env.ASAAS_ENV);
  return {key,base:production?'https://api.asaas.com/v3':'https://api-sandbox.asaas.com/v3',ready:valid&&Boolean(key)&&Boolean(env.ASAAS_WEBHOOK_TOKEN)&&env.ASAAS_CARD_ENABLED==='true'};
}
export async function asaasApi(env,path,body) {
  const config=asaasConfig(env);
  if(!config.key)throw Error('Asaas unavailable');
  const response=await fetch(config.base+path,{method:body===undefined?'GET':'POST',headers:{access_token:config.key,'Content-Type':'application/json','User-Agent':'EspetinhoPerus/Asaas'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(body===undefined?15000:65000)});
  const data=await response.json().catch(()=>null);
  return {ok:response.ok,status:response.status,data};
}
const clean=(value,max=150)=>String(value??'').trim().slice(0,max);
const digits=value=>clean(value,40).replace(/\D/g,'');
export function validCpf(value) {
  if(!/^\d{11}$/.test(value)||/^(\d)\1+$/.test(value))return false;
  for(let n=9;n<=10;n++){let sum=0;for(let i=0;i<n;i++)sum+=Number(value[i])*(n+1-i);if(((sum*10)%11)%10!==Number(value[n]))return false;}
  return true;
}
export function validateCard(body) {
  const card=body.creditCard||{},holder=body.creditCardHolderInfo||{};
  const number=digits(card.number),month=digits(card.expiryMonth),year=digits(card.expiryYear),ccv=digits(card.ccv);
  let sum=0;for(let i=number.length-1,j=0;i>=0;i--,j++){let n=Number(number[i]);if(j%2){n*=2;if(n>9)n-=9;}sum+=n;}
  const now=new Date();
  if(!/^\d{13,19}$/.test(number)||sum%10||!/^\d{3,4}$/.test(ccv)||!/^\d{4}$/.test(year)||Number(month)<1||Number(month)>12||Number(year)<now.getUTCFullYear()||(Number(year)===now.getUTCFullYear()&&Number(month)<now.getUTCMonth()+1)||!clean(card.holderName))throw Error('Confira o número, nome, validade e código de segurança do cartão.');
  const info={name:clean(holder.name),cpfCnpj:digits(holder.cpfCnpj),email:clean(holder.email),postalCode:digits(holder.postalCode),addressNumber:clean(holder.addressNumber,30),phone:digits(holder.phone)};
  if(!info.name||!validCpf(info.cpfCnpj)||!/^\S+@\S+\.\S+$/.test(info.email)||!/^\d{8}$/.test(info.postalCode)||!info.addressNumber||!/^\d{10,13}$/.test(info.phone))throw Error('Confira os dados e o endereço de cobrança do titular.');
  return {creditCard:{holderName:clean(card.holderName),number,expiryMonth:month.padStart(2,'0'),expiryYear:year,ccv},creditCardHolderInfo:info};
}
export function asaasStatus(value) {
  if(['CONFIRMED','RECEIVED'].includes(value))return 'approved';
  if(value==='REFUNDED')return 'refunded';
  if(['CHARGEBACK_REQUESTED','CHARGEBACK_DISPUTE','AWAITING_CHARGEBACK_REVERSAL'].includes(value))return 'charged_back';
  if(['DELETED','CANCELED'].includes(value))return 'cancelled';
  return 'pending';
}
export function asaasStub(env,orderId) {return env.ORDER_REALTIME.get(env.ORDER_REALTIME.idFromName(`asaas-v1:${orderId}`));}
export async function callAsaasOrder(env,orderId,body) {
  return asaasStub(env,orderId).fetch('https://asaas.internal/asaas-operation',{method:'POST',body:JSON.stringify(body)});
}
function canPay(state) {return (!state.attempt||state.attempt==='refused')&&state.order.payment_status==='pending'&&(state.attemptIds||[]).length<3;}
function publicState(state) {
  const p=state.order;
  return {order_id:p.order_id,total:p.total,subtotal:p.subtotal,delivery_fee:p.delivery_fee,discount_amount:p.discount_amount,items:(p.items||[]).map(i=>({name:i.name,quantity:i.quantity,unit_price:i.unit_price,subtotal:i.subtotal})),status:p.payment_status,attempt:state.attempt||'none',can_pay:canPay(state),customer:{name:p.customer.name,email:p.customer.email,phone:p.customer.phone,cpf:p.customer.cpf,cep:p.customer.cep,number:p.customer.number,fulfillment:p.customer.fulfillment,address:p.customer.address,reference:p.customer.reference,notes:p.customer.notes},tracking_token:p.tracking_token};
}
async function applyPayment(storage,env,state,payment,deps) {
  const original=state.order;
  if(!payment||payment.id!==original.payment_id||payment.externalReference!==original.order_id||payment.customer!==original.asaas_customer_id||payment.billingType!=='CREDIT_CARD'||Math.round(Number(payment.value)*100)!==Math.round(original.total*100))throw Error('Payment mismatch');
  const previous=original.payment_status;
  let status=payment.deleted?'cancelled':asaasStatus(payment.status);
  // Queries always read provider state; never regress an already confirmed charge to pending.
  if(status==='pending'&&['approved','refunded','charged_back','cancelled'].includes(previous))status=previous;
  const latest=await deps.find(env,original.order_id);
  const p={...original,...(latest||{}),payment_provider:'asaas',payment_method:'CREDIT_CARD',payment_id:original.payment_id,asaas_customer_id:original.asaas_customer_id,payment_status:status,payment_status_detail:clean(payment.status,60)};
  if(status==='approved'){
    p.paid_at=p.paid_at||new Date().toISOString();
    if(p.order_status==='aguardando_pagamento'){p.order_status='recebido';p.status_history=[...(p.status_history||[]),{status:'recebido',at:p.paid_at,origem:'asaas'}];}
  }
  state.order=p;
  if(['approved','refunded','charged_back','cancelled'].includes(status))state.attempt='finished';
  await storage.put('asaas-state',state);
  await deps.save(env,p);
  if(status==='approved'&&!p.loyalty?.credited){await deps.credit(env,p);await deps.save(env,p);state.order=p;await storage.put('asaas-state',state);}
  if(previous!=='approved'&&status==='approved')await deps.notify(env,p);
  return publicState(state);
}
// Called only by the internal Durable Object binding. Its caller serializes operations.
export async function asaasOperation(storage,env,body,deps) {
  const reply=(b,status=200)=>Response.json(b,{status});
  let state=await storage.get('asaas-state');
  if(body.action==='init'){
    if(state)return reply({ok:false},409);
    await storage.put('asaas-state',{order:body.order,attempt:null,lastChecked:0});return reply({ok:true});
  }
  if(!state)return reply({erro:'Pedido em preparação. Aguarde e consulte novamente.'},503);
  if(body.action!=='webhook'&&body.token!==state.order.tracking_token)return reply({erro:'Acesso não autorizado.'},403);
  if(body.action==='webhook'){
    if(body.paymentId!==state.order.payment_id)return reply({erro:'Cobrança incompatível.'},409);
    if(await storage.get(`event:${body.eventId}`))return reply({received:true,duplicate:true});
  }
  if(body.action==='pay'){
    if(!asaasConfig(env).ready||state.order.asaas_environment!==env.ASAAS_ENV)return reply({erro:'Pagamento por cartão indisponível.'},503);
    if(!canPay(state))return reply({...publicState(state),erro:'Pagamento já iniciado. Consulte o andamento.'},409);
    let card;
    try{card=validateCard(body.card||{});}catch(e){return reply({erro:e.message},400);}
    if(!body.remoteIp)return reply({erro:'Não foi possível validar a conexão. Atualize a página.'},400);
    const attemptId=body.card?.attempt_id;
    if(!/^[a-f0-9-]{36}$/.test(attemptId||'')||(state.attemptIds||[]).includes(attemptId))return reply({erro:'Tentativa já enviada ou inválida. Consulte o pagamento.'},409);
    // Persist BEFORE the non-idempotent call. Even after a crash this cannot charge again.
    state.attempt='processing';state.attemptIds=[...(state.attemptIds||[]),attemptId];await storage.put('asaas-state',state);
    try{
      const result=await asaasApi(env,`/payments/${encodeURIComponent(state.order.payment_id)}/payWithCreditCard`,{...card,remoteIp:body.remoteIp});
      card=null;
      if(result.ok&&result.data?.id){
        await applyPayment(storage,env,state,result.data,deps);
      }else{
        state.attempt='uncertain';
        // Only an explicit card refusal plus a fresh PENDING query permits a NEW user attempt.
        if(result.status===400&&result.data?.errors?.some(e=>e.code==='invalid_creditCard')){
          const current=await asaasApi(env,`/payments/${encodeURIComponent(state.order.payment_id)}`);
          if(current.ok){await applyPayment(storage,env,state,current.data,deps);if(current.data.status==='PENDING'&&state.order.payment_status==='pending')state.attempt='refused';}
        }
        await storage.put('asaas-state',state);
      }
    }catch(_){state.attempt='uncertain';await storage.put('asaas-state',state);}
    return reply(publicState(state));
  }
  if(!['status','webhook'].includes(body.action))return reply({erro:'Operação inválida.'},400);
  try{
    if(state.order.asaas_environment!==env.ASAAS_ENV)throw Error('Environment mismatch');
    if(body.action==='webhook'||Date.now()-state.lastChecked>=5000){
      const result=await asaasApi(env,`/payments/${encodeURIComponent(state.order.payment_id)}`);
      if(!result.ok)throw Error('Provider unavailable');
      await applyPayment(storage,env,state,result.data,deps);state.lastChecked=Date.now();await storage.put('asaas-state',state);
    }
    if(body.action==='webhook'){await storage.put(`event:${body.eventId}`,true);return reply({received:true});}
    return reply(publicState(state));
  }catch(_){return reply({erro:'Não foi possível consultar o pagamento. Aguarde e consulte novamente.'},503);}
}
export async function handleAsaas(request,env,deps) {
  const url=new URL(request.url),reply=deps.reply;
  if(url.pathname==='/asaas-capabilities'&&request.method==='GET')return reply({enabled:asaasConfig(env).ready});
  if(url.pathname==='/webhook-asaas'&&request.method==='POST'){
    const expected=env.ASAAS_WEBHOOK_TOKEN;
    if(!expected||request.headers.get('asaas-access-token')!==expected)return reply({erro:'Webhook não autorizado.'},401);
    try{
      const raw=await request.text();if(raw.length>65536)return reply({erro:'Evento muito grande.'},413);
      const body=JSON.parse(raw),orderId=body.payment?.externalReference;
      if(!/^EP-[A-Za-z0-9_-]+$/.test(orderId||''))return reply({received:true,ignored:true});
      if(!body.id||!body.payment?.id)return reply({erro:'Evento inválido.'},400);
      const result=await callAsaasOrder(env,orderId,{action:'webhook',eventId:clean(body.id,200),paymentId:clean(body.payment.id,100)});
      return reply(await result.json(),result.status);
    }catch(_){return reply({erro:'Falha temporária ao processar evento.'},503);}
  }
  if(['/asaas-status','/pagar-cartao-asaas'].includes(url.pathname)){
    if(request.method!==(url.pathname==='/asaas-status'?'GET':'POST'))return reply({erro:'Método inválido.'},405);
    const orderId=url.searchParams.get('order_id')||'',token=request.headers.get('X-Order-Token');
    if(!/^[A-Za-z0-9_-]{1,64}$/.test(orderId)||!token)return reply({erro:'Acesso não autorizado.'},403);
    try{
      let card;
      if(request.method==='POST'){
        const raw=await request.text();if(raw.length>8192)return reply({erro:'Dados inválidos.'},413);
        card=JSON.parse(raw);
      }
      const result=await callAsaasOrder(env,orderId,{action:card?'pay':'status',token,card,remoteIp:request.headers.get('CF-Connecting-IP')});
      return reply(await result.json(),result.status);
    }catch(_){return reply({erro:'Não foi possível confirmar o pagamento. Consulte o andamento antes de tentar novamente.'},503);}
  }
  return null;
}
