import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{OrderRealtime} from '../worker.js';
import {validateCard,asaasConfig} from '../asaas-payments.js';
const card={attempt_id:'11111111-1111-4111-8111-111111111111',creditCard:{holderName:'TESTE CARTAO',number:'4111111111111111',expiryMonth:'12',expiryYear:'2035',ccv:'987'},creditCardHolderInfo:{name:'Teste Cartao',cpfCnpj:'52998224725',email:'test@example.com',postalCode:'05206000',addressNumber:'8',phone:'11999999999'}};
function setup(){
 const orders=new Map(),stores=new Map(),objects=new Map();
 const env={ASAAS_ENV:'sandbox',ASAAS_SANDBOX_API_KEY:'test-key',ASAAS_WEBHOOK_TOKEN:'test-webhook-token',ASAAS_CARD_ENABLED:'true',ORDERS_KV:{get:async(k,format)=>{if(k==='config:delivery-control')return {mode:'manual_open',expires_at:Date.now()+60000};const value=orders.get(k);return format==='json'&&value?JSON.parse(value):value||null;},put:async(k,v)=>orders.set(k,v)}};
 const binding={idFromName:x=>x,get(id){if(!objects.has(id)){
  if(!stores.has(id))stores.set(id,new Map());const map=stores.get(id);
  let tail=Promise.resolve();
  const storage={get:async k=>structuredClone(map.get(k)),put:async(k,v)=>map.set(k,structuredClone(v)),transaction:fn=>{const run=tail.then(()=>fn({get:async k=>map.get(k),put:async(k,v)=>map.set(k,v)}));tail=run.catch(()=>{});return run;}};
  objects.set(id,new OrderRealtime({storage,getWebSockets:()=>[]},env));
 }return {fetch:(url,init)=>objects.get(id).fetch(new Request(url,init))};}};
 env.ORDER_REALTIME=binding;
 const body={order_id:'EP-test',customer:{name:'Test',email:'test@example.com',phone:'11999999999',cpf:'52998224725',fulfillment:'Retirada'},items:[{name:'Pão de alho',quantity:1,price:0.01}],total:0.01};
 let payment,calls=[],mode='success';
 const mock=async(url,options={})=>{
  calls.push({url,body:options.body?JSON.parse(options.body):undefined});
  assert.ok(url.startsWith('https://api-sandbox.asaas.com/'),url);
  if(url.includes('/customers?'))return Response.json({data:[{id:'cus_test',cpfCnpj:body.customer.cpf}]});
  if(url.endsWith('/payments')){const b=JSON.parse(options.body);payment={id:'pay_test',customer:b.customer,externalReference:b.externalReference,billingType:'CREDIT_CARD',value:b.value,status:'PENDING'};return Response.json(payment);}
  if(url.endsWith('/payWithCreditCard')){
    if(mode==='timeout'){payment.status='CONFIRMED';throw Error('response lost');}
    if(mode==='refused')return Response.json({errors:[{code:'invalid_creditCard'}]},{status:400});
    payment.status='CONFIRMED';return Response.json({...payment,creditCard:{creditCardToken:'MUST_NOT_PERSIST',creditCardNumber:'1111'}});
  }
  if(url.endsWith('/pay_test'))return Response.json(payment);
  throw Error('unexpected '+url);
 };
 const create=(changes={})=>worker.fetch(new Request('https://api.test/criar-checkout-asaas',{method:'POST',body:JSON.stringify({...body,...changes})}),env,{});
 const call=(path,data,token)=>worker.fetch(new Request('https://api.test'+path+'?order_id=EP-test',{method:data?'POST':'GET',headers:{'X-Order-Token':token||'wrong','CF-Connecting-IP':'203.0.113.4'},body:data?JSON.stringify(data):undefined}),env,{});
 const webhook=(token='test-webhook-token',event='evt_1')=>worker.fetch(new Request('https://api.test/webhook-asaas',{method:'POST',headers:{'asaas-access-token':token},body:JSON.stringify({id:event,event:'PAYMENT_CONFIRMED',payment:{id:'pay_test',externalReference:'EP-test',value:999,status:'CONFIRMED'}})}),env,{});
 return {env,stores,orders,objects,calls,create,call,webhook,mock,setMode:x=>mode=x,getPayment:()=>payment};
}
async function scenario(fn){const s=setup(),original=fetch;globalThis.fetch=s.mock;try{await fn(s);}finally{globalThis.fetch=original;}}
test('disabled and wrong environment fail closed without provider calls',()=>scenario(async s=>{
 s.env.ASAAS_CARD_ENABLED='false';assert.equal((await s.create()).status,503);assert.equal(s.calls.length,0);
 assert.equal(asaasConfig({...s.env,ASAAS_ENV:'production',ASAAS_CARD_ENABLED:'true'}).ready,false);
}));
test('server totals and durable duplicate protection; no card sent during creation',()=>scenario(async s=>{
 const responses=await Promise.all(Array.from({length:8},()=>s.create()));
 assert.equal(responses.filter(r=>r.status===201).length,1);assert.equal(responses.filter(r=>r.status===409).length,7);
 const data=await responses.find(r=>r.status===201).json();assert.equal(data.total,11.4);
 assert.equal(s.calls.filter(c=>c.url.endsWith('/payments')).length,1);assert.ok(s.calls.every(c=>!c.body?.creditCard));
 assert.equal((await s.call('/asaas-status')).status,403);assert.equal((await s.call('/pagar-cartao-asaas',card)).status,403);
}));
test('double click charges once; card and returned token absent from every durable write',()=>scenario(async s=>{
 const data=await (await s.create()).json();
 const responses=await Promise.all(Array.from({length:8},()=>s.call('/pagar-cartao-asaas',card,data.tracking_token)));
 assert.equal(s.calls.filter(c=>c.url.endsWith('/payWithCreditCard')).length,1);
 assert.equal(responses.filter(r=>r.status===200).length,1);
 assert.equal(JSON.parse(s.orders.get('order:EP-test')).payment_status,'approved');
 const persisted=JSON.stringify([...s.orders,...[...s.stores].map(([k,v])=>[k,[...v]])]);
 for(const secret of ['4111111111111111','MUST_NOT_PERSIST','"ccv"','test-key'])assert.ok(!persisted.includes(secret),secret);
 const sent=s.calls.find(c=>c.url.endsWith('/payWithCreditCard')).body;assert.equal(sent.remoteIp,'203.0.113.4');
}));
test('lost response survives object restart and resolves via provider query, never another payment',()=>scenario(async s=>{
 const data=await (await s.create()).json();s.setMode('timeout');
 const paid=await (await s.call('/pagar-cartao-asaas',card,data.tracking_token)).json();assert.equal(paid.attempt,'uncertain');assert.equal(paid.can_pay,false);
 s.objects.clear();assert.equal((await s.call('/pagar-cartao-asaas',card,data.tracking_token)).status,409);
 const status=await (await s.call('/asaas-status',null,data.tracking_token)).json();assert.equal(status.status,'approved');
 assert.equal(s.calls.filter(c=>c.url.endsWith('/payWithCreditCard')).length,1);
}));
test('webhook authentication, provider requery, identity/amount verification and replay deduplication',()=>scenario(async s=>{
 const data=await (await s.create()).json();assert.equal((await s.webhook('wrong')).status,401);
 s.getPayment().value=0.01;assert.equal((await s.webhook()).status,503);assert.equal(JSON.parse(s.orders.get('order:EP-test')).payment_status,'pending');
 s.getPayment().value=11.4;s.getPayment().status='CONFIRMED';assert.equal((await s.webhook()).status,200);
 const before=s.calls.length;assert.equal((await (await s.webhook()).json()).duplicate,true);assert.equal(s.calls.length,before);
 assert.equal(JSON.parse(s.orders.get('order:EP-test')).order_status,'recebido');
 s.getPayment().status='REFUNDED';assert.equal((await s.webhook('test-webhook-token','evt_2')).status,200);assert.equal(JSON.parse(s.orders.get('order:EP-test')).payment_status,'refunded');
}));
test('invalid card fails before attempt and provider; explicit refusal requires fresh pending query and a new attempt ID',()=>scenario(async s=>{
 const data=await (await s.create()).json();const before=s.calls.length;
 assert.equal((await s.call('/pagar-cartao-asaas',{...card,creditCard:{...card.creditCard,number:'123'}},data.tracking_token)).status,400);assert.equal(s.calls.length,before);
 s.setMode('refused');const r=await (await s.call('/pagar-cartao-asaas',card,data.tracking_token)).json();assert.equal(r.attempt,'refused');assert.equal(r.can_pay,true);
 const count=s.calls.filter(c=>c.url.endsWith('/payWithCreditCard')).length;
 assert.equal((await s.call('/pagar-cartao-asaas',card,data.tracking_token)).status,409);
 assert.equal(s.calls.filter(c=>c.url.endsWith('/payWithCreditCard')).length,count);
 s.setMode('success');const retry={...card,attempt_id:'22222222-2222-4222-8222-222222222222'};
 assert.equal((await (await s.call('/pagar-cartao-asaas',retry,data.tracking_token)).json()).status,'approved');
}));
test('cardholder CPF and expired card validation',()=>{
 assert.throws(()=>validateCard({...card,creditCardHolderInfo:{...card.creditCardHolderInfo,cpfCnpj:'11111111111'}}));
 assert.throws(()=>validateCard({...card,creditCard:{...card.creditCard,expiryYear:'2020'}}));
 assert.equal(validateCard(card).creditCard.expiryMonth,'12');
});
test('Asaas uses reward reservation: mixed basket charges only paid products, zero reward never calls Asaas',()=>scenario(async s=>{
 const uid='11111111-1111-4111-8111-111111111111',entries=new Map();
 Object.assign(s.env,{SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'server',SUPABASE_PUBLISHABLE_KEY:'public'});
 const provider=globalThis.fetch;
 globalThis.fetch=async(url,options={})=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:uid,email:'test@example.com'});
  if(url.endsWith('/rpc/checkout_resgate_v1')){
   const {p_action:a,p_data:d}=JSON.parse(options.body);let entry=entries.get(d.order_id);
   if(a==='open'){if(entry)return Response.json({...entry,created:false});entry={state:'reserved',points:d.points};entries.set(d.order_id,entry);return Response.json({created:true});}
   if(a==='save')entry.order=d.order;
   if(a==='response')entry.response=d.response;
   return Response.json(entry);
  }
  if(url.endsWith('/rpc/creditar_pontos_pedido'))return Response.json({pontos_creditados:0});
  return provider(url,options);
 };
 const body={order_id:'EP-R-11111111-1111-4111-8111-111111111111',reward_customer_id:uid,customer:{name:'Test',email:'test@example.com',phone:'11999999999',cpf:'52998224725',fulfillment:'Retirada'},items:[{name:'Pão de alho',quantity:1,reward:true},{name:'Queijo coalho',quantity:1}]};
 const request=()=>worker.fetch(new Request('https://api.test/criar-checkout-asaas',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify(body)}),s.env,{});
 let r=await request();let d=await r.json();assert.equal(r.status,201,JSON.stringify(d));assert.equal(d.total,11.4);assert.equal(entries.get(body.order_id).points,228);
 const count=s.calls.length;r=await request();assert.equal((await r.json()).total,11.4);assert.equal(s.calls.length,count);
 body.order_id='EP-R-22222222-2222-4222-8222-222222222222';body.items=body.items.slice(0,1);
 r=await request();d=await r.json();assert.equal(d.total,0);assert.equal(d.status,'approved');assert.equal(s.calls.length,count);
}));
