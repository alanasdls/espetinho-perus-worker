import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
function setup(){
 const records=new Map();let writes=0;
 const env={MISTICPAY_CI:'test',MISTICPAY_CS:'test',ORDERS_KV:{
  async get(k,type){if(k==='config:delivery-control')return {mode:'manual_open',expires_at:Date.now()+60000};const v=records.get(k);return type==='json'&&v?JSON.parse(v):v||null;},
  async put(k,v){writes++;records.set(k,v);}
 }};
 return {env,records,writes:()=>writes};
}
const req=(path,body)=>new Request('https://api.test'+path,body===undefined?{}:{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});
test('payment status requires token for matching order before contacting any provider',async()=>{
 const {env,records,writes}=setup();const original=fetch;let calls=0;
 records.set('tracking:secret','EP-1');records.set('order:EP-1',JSON.stringify({order_id:'EP-1',payment_id:'own',checkout_id:'CHEC_own'}));
 globalThis.fetch=async()=>{calls++;throw Error('must not fetch');};
 try{for(const path of ['/pagamento-status','/mercadopago-status','/pagbank-status']){
  for(const suffix of ['?id=other','?id=other&token=secret','?id=own&token=wrong']){
   const r=await worker.fetch(req(path+suffix),env,{});assert.equal(r.status,403);assert.equal((await r.json()).pedido,undefined);
  }
 }assert.equal(calls,0);assert.equal(writes(),0);}finally{globalThis.fetch=original;}
});
test('forged PagBank status cannot approve an order; provider failure fails closed',async()=>{
 const {env,records,writes}=setup();env.PAGBANK_TOKEN='test';env.PAGBANK_ENV='production';
 records.set('order:EP-1',JSON.stringify({order_id:'EP-1',payment_provider:'pagbank',checkout_id:'CHEC_own',payment_status:'pending'}));
 const original=fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({}, {status:503});};
 try{
  const r=await worker.fetch(req('/webhook-pagbank',{reference_id:'EP-1',status:'PAID',charges:[{status:'PAID'}]}),env,{});
  assert.equal(r.status,503);assert.equal(calls,1);assert.equal(writes(),0);
  assert.equal(JSON.parse(records.get('order:EP-1')).payment_status,'pending');
 }finally{globalThis.fetch=original;}
});
test('unknown products and existing order IDs are rejected before checkout',async()=>{
 const {env,records,writes}=setup();records.set('order:EP-1',JSON.stringify({order_id:'EP-1'}));
 for(const path of ['/criar-pix','/criar-pedido','/criar-checkout-pagbank','/criar-checkout-mercadopago']){
  let r=await worker.fetch(req(path,{items:[{name:'<img onerror=alert(1)>',quantity:1,price:0.01}]}),env,{});assert.equal(r.status,400);
  r=await worker.fetch(req(path,{order_id:'EP-1',items:[{name:'Pão de alho',quantity:1}]}),env,{});assert.equal(r.status,409);
 }assert.equal(writes(),0);
});
test('cash route cannot mint approved orders or loyalty points',async()=>{
 const {env,writes}=setup();const r=await worker.fetch(req('/criar-pedido',{order_id:'EP-new',items:[{name:'Pão de alho',quantity:1}],customer:{fulfillment:'Retirada'}}),env,{});
 assert.equal(r.status,409);assert.equal(writes(),0);
});
