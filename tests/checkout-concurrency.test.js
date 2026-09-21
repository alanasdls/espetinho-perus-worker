import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
import {checkoutBinding} from './checkout-storage.js';
const paths=['/criar-pix','/criar-checkout-mercadopago','/criar-checkout-pagbank'];
const request=(path,changes={})=>new Request('https://api.test'+path,{method:'POST',body:JSON.stringify({order_id:'EP-one',customer:{name:'Test',email:'a@test.com',phone:'11999999999',cpf:'52998224725',fulfillment:'Retirada'},items:[{name:'Pão de alho',quantity:1}],...changes})});
function environment(){
 const writes=[];
 return {writes,env:{ORDER_REALTIME:checkoutBinding(),MISTICPAY_CI:'test',MISTICPAY_CS:'test',MERCADOPAGO_ACCESS_TOKEN:'test',PAGBANK_TOKEN:'test',PAGBANK_ENV:'production',ORDERS_KV:{
  // Deliberately stale reads: KV's duplicate lookup must not be the guarantee.
  get:async key=>key==='config:delivery-control'?{mode:'manual_open',expires_at:Date.now()+60000}:null,
  put:async(key,value)=>{writes.push([key,value]);}
 }}};
}
function providerReply(url){
 if(url.includes('mercadopago'))return Response.json({id:'pref',init_point:'https://payment.test/checkout'});
 if(url.includes('/checkouts'))return Response.json({id:'checkout',links:[{rel:'PAY',href:'https://payment.test/checkout'}]});
 return Response.json({data:{transactionId:'payment',copyPaste:'pix',qrCodeBase64:'cXI=',transactionState:'PENDENTE'}});
}
for(const path of [...paths,'mixed'])test(`concurrent ${path}: one provider call despite stale KV and fresh instances`,async()=>{
 const {env,writes}=environment();const original=fetch;let calls=0;
 globalThis.fetch=async(url)=>{calls++;return providerReply(url);};
 try{
  const responses=await Promise.all(Array.from({length:12},(_,i)=>worker.fetch(request(path==='mixed'?paths[i%3]:path),{...env},{})));
  assert.equal(responses.filter(r=>r.status===201).length,1);
  assert.equal(responses.filter(r=>r.status===409).length,11);
  assert.equal(calls,1);
  const first=await responses.find(r=>r.status===201).json();assert.ok(first.tracking_token);
  for(const response of responses.filter(r=>r.status===409))assert.equal((await response.json()).tracking_token,undefined);
  assert.equal(new Set(writes.filter(([k])=>k.startsWith('order:')).map(([,v])=>JSON.parse(v).tracking_token)).size,1);
  assert.equal((await worker.fetch(request(paths[0]),{...env},{})).status,409);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('uncertain provider failure retains durable claim; restart/retry cannot charge again',async()=>{
 const {env}=environment();const original=fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error('timeout after provider accepted');};
 try{assert.equal((await worker.fetch(request(paths[0]),env,{})).status,500);
 assert.equal((await worker.fetch(request(paths[0]),{...env},{})).status,409);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('claim failure fails closed before saving an order or contacting provider',async()=>{
 const original=fetch;globalThis.fetch=async()=>{throw Error('must not call provider');};
 try{for(const binding of [undefined,{idFromName:x=>x,get:()=>({fetch:async()=>{throw Error('unavailable');}})}]){
  const {env,writes}=environment();env.ORDER_REALTIME=binding;
  for(const path of paths)assert.equal((await worker.fetch(request(path),env,{})).status,503);
  assert.equal(writes.length,0);
 }}finally{globalThis.fetch=original;}
});
test('validation failures do not consume IDs, overly long IDs are rejected without truncation',async()=>{
 const {env,writes}=environment();const original=fetch;let calls=0;
 globalThis.fetch=async url=>{calls++;return providerReply(url);};
 try{
  assert.equal((await worker.fetch(request(paths[0],{customer:{email:'invalid'}}),env,{})).status,400);
  assert.equal(writes.length,0);
  for(const path of paths)assert.equal((await worker.fetch(request(path,{order_id:'a'.repeat(65)}),env,{})).status,400);
  assert.equal(calls,0);
  assert.equal((await worker.fetch(request(paths[0]),env,{})).status,201);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('anonymous HTTP cannot acquire or reset internal reservations',async()=>{
 const {env,writes}=environment();assert.equal((await worker.fetch(request('/checkout-claim'),env,{})).status,404);assert.equal(writes.length,0);
});
