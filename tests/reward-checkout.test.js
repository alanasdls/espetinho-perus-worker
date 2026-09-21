import {checkoutBinding} from './checkout-storage.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {quoteRewards,handleRewardCheckout,REWARD_CONTEXT} from '../reward-checkout.js';
const prices={'Água':5,'Espeto':10},codes={'Água':'1','Espeto':'2'};
test('reward costs use server prices and ignore forged browser points/price',()=>{
 assert.deepEqual(quoteRewards({items:[{name:'Água',quantity:2,reward:true,price:0,points:1},{name:'Espeto',quantity:1}]},prices,codes),{points:200,discount:10,rewards:[{name:'Água',quantity:2,points:200}]});
 assert.throws(()=>quoteRewards({items:[{name:'Fake',quantity:1,reward:true}]},prices,codes));
 assert.throws(()=>quoteRewards({items:[{name:'Água',quantity:-1,reward:true}]},prices,codes));
});
test('cart survives script reload, normal and reward versions coexist, account isolation',()=>{
 const storage=new Map();const context=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
 const script=fs.readFileSync(new URL('../cart-state.js',import.meta.url),'utf8');vm.runInContext(script,context);
 context.EPCart.write({items:[{name:'Água',quantity:1}],owner:null});context.EPCart.addReward({name:'Água',points:100},'alice');
 vm.runInContext(script,context);assert.equal(context.EPCart.read().items.length,2);assert.equal(context.EPCart.read().items[1].points,100);
 assert.throws(()=>context.EPCart.addReward({name:'Água',points:100},'bob'));
 context.EPCart.clear();assert.equal(context.EPCart.read().items.length,0);
});
test('checkout retries return same response; zero pickup never calls a payment provider',async()=>{
 const original=globalThis.fetch;let entry=null,calls=0;
 globalThis.fetch=async(_url,options)=>{
  const {p_action:a,p_data:d}=JSON.parse(options.body);
  if(a==='open'){if(entry)return Response.json({...entry,created:false});entry={};return Response.json({created:true});}
  if(a==='response'){entry.response=d.response;return Response.json(entry);}
  throw Error(a);
 };
 try{
  const deps={headers:{},authenticate:async()=>({id:'alice'}),store:async()=>({aberto:true}),prices,codes,delivery:()=>({fee:0}),discounts:env=>({total_discount:env[REWARD_CONTEXT].discount})};
  const body={order_id:'EP-R-11111111-1111-4111-8111-111111111111',reward_customer_id:'alice',customer:{name:'Alice',email:'a@b.com',phone:'1'},items:[{name:'Água',quantity:1,reward:true}]};
  const request=()=>new Request('https://api.test/criar-pix',{method:'POST',body:JSON.stringify(body)});
  const core=async req=>{calls++;assert.equal(new URL(req.url).pathname,'/criar-pedido');return Response.json({status:'approved',total:0,tracking_token:'one'});};
  const env={ORDER_REALTIME:checkoutBinding(),SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test'};
  const first=await handleRewardCheckout(request(),env,{},core,deps);const second=await handleRewardCheckout(request(),env,{},core,deps);
  assert.deepEqual(await first.json(),await second.json());assert.equal(calls,1);
  const denied=await handleRewardCheckout(request(),env,{},core,{...deps,authenticate:async()=>null});assert.equal(denied.status,401);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});

test('real Worker charges only freight for reward, mixed reward keeps current no-extra-discount rule, QR replay creates one payment',async()=>{
 const {default:worker}=await import('../worker.js');
 const original=globalThis.fetch;const orders=new Map();const reservations=new Map();let payments=[];
 const user='11111111-1111-4111-8111-111111111111';
 const env={ORDER_REALTIME:checkoutBinding(),SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'server',SUPABASE_PUBLISHABLE_KEY:'public',MISTICPAY_CI:'ci',MISTICPAY_CS:'cs',ORDERS_KV:{async get(key,format){if(key==='config:delivery-control')return {mode:'manual_open',expires_at:Date.now()+60000};const value=orders.get(key);return format==='json'&&value?JSON.parse(value):value||null;},async put(key,value){orders.set(key,value);}}};
 globalThis.fetch=async(url,options={})=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:user,email:'a@test.com'});
  if(url.endsWith('/rpc/checkout_resgate_v1')){
   const {p_action:a,p_data:d}=JSON.parse(options.body);let entry=reservations.get(d.order_id);
   if(a==='open'){if(entry)return Response.json({...entry,created:false});entry={state:'reserved'};reservations.set(d.order_id,entry);return Response.json({created:true});}
   if(a==='save')entry.order=d.order;
   if(a==='response')entry.response=d.response;
   return Response.json(entry);
  }
  if(url.endsWith('/rpc/creditar_pontos_pedido')){assert.equal(JSON.parse(options.body).p_subtotal,0);return Response.json({pontos_creditados:0});}
  if(url.endsWith('/api/transactions/create')){payments.push(JSON.parse(options.body));return Response.json({data:{transactionId:'payment-'+payments.length,copyPaste:'pix',qrCodeBase64:'cXI=',transactionState:'PENDENTE'}});}
  throw Error('Unexpected fetch '+url);
 };
 try{
  const body={order_id:'EP-R-11111111-1111-4111-8111-111111111111',reward_customer_id:user,customer:{name:'Alice',email:'a@test.com',phone:'11999999999',fulfillment:'Entrega',cep:'05201000',address:'Rua 1'},delivery_fee:10,items:[{name:'Pão de alho',quantity:1,reward:true}]};
  const request=b=>new Request('https://api.test/criar-pix',{method:'POST',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify(b)});
  let r=await worker.fetch(request(body),env,{});let d=await r.json();assert.equal(r.status,201,JSON.stringify(d));assert.equal(d.total,10);assert.equal(payments[0].amount,10);
  r=await worker.fetch(request(body),env,{});d=await r.json();assert.equal(d.total,10);assert.equal(payments.length,1);
  body.order_id='EP-R-22222222-2222-4222-8222-222222222222';body.items.push({name:'Queijo coalho',quantity:1});
  r=await worker.fetch(request(body),env,{});d=await r.json();assert.equal(r.status,201,JSON.stringify(d));assert.equal(d.total,21.4);assert.equal(payments[1].amount,21.4);
  const stored=JSON.parse(orders.get('order:'+body.order_id));assert.equal(stored.loyalty_subtotal_eligible,11.4);assert.equal(stored.reward_checkout.points,228);assert.equal(stored.items[0].reward,true);
  body.order_id='EP-R-33333333-3333-4333-8333-333333333333';body.items=body.items.slice(0,1);body.customer.fulfillment='Retirada';
  r=await worker.fetch(request(body),env,{});d=await r.json();assert.equal(r.status,201,JSON.stringify(d));assert.equal(d.total,0);assert.equal(d.status,'approved');assert.equal(payments.length,2);

 }finally{globalThis.fetch=original;}
});
