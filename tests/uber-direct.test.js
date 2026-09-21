import test from 'node:test';
import assert from 'node:assert/strict';
import {uberOperation,handleUber} from '../uber-direct.js';
import {ADMIN_CONTEXT} from '../admin-security.js';
const originalFetch=globalThis.fetch;
test('Uber: disabled, permissions, BRL quote, exact fee, persistent retry and tracking',async()=>{
 const map=new Map(),storage={get:async k=>structuredClone(map.get(k)),put:async(k,v)=>map.set(k,structuredClone(v))};
 const order={order_id:'EP-1',customer:{name:'Cliente',fulfillment:'Entrega',address:'Rua Teste, 100, Perus, São Paulo SP',cep:'05210000',phone:'11999999999'},payment_status:'approved',order_status:'recebido',delivery_fee:10,items:[{name:'Espeto',quantity:2}]};
 const env={UBER_ENABLED:'true',UBER_CLIENT_ID:'id',UBER_CLIENT_SECRET:'secret',UBER_CUSTOMER_ID:'customer',UBER_PICKUP_ADDRESS:'Rua Retirada, 42, São Paulo SP Brasil',UBER_PICKUP_PHONE:'11999999999',ORDERS_KV:{get:async()=>structuredClone(order)}};
 let calls=[],lost=true;
 globalThis.fetch=async(url,opts)=>{
  if(url.includes('oauth'))return Response.json({access_token:'token'});
  if(url.endsWith('delivery_quotes'))return Response.json({id:'dqt_1',fee:1750,currency:'brl',expires:new Date(Date.now()+60000).toISOString()});
  if(url.endsWith('/deliveries')){calls.push(JSON.parse(opts.body));if(lost){lost=false;throw Error('timeout');}return Response.json({id:'del_1',status:'pending',fee:1750,currency:'brl',live_mode:false});}
  return Response.json({id:'del_1',status:'delivered',tracking_url:'https://example.com/track',live_mode:false});
 };
 try{
  assert.equal((await uberOperation(storage,{...env,UBER_ENABLED:'false'},{order_id:'EP-1',action:'quote'})).status,503);
  assert.equal((await handleUber(new Request('https://example.com/admin/uber/config'),{...env,[ADMIN_CONTEXT]:{role:'cozinha'}},{},()=>{})).status,403);
  let q=await (await uberOperation(storage,env,{order_id:'EP-1',action:'quote'})).json();assert.equal(q.quote.fee,1750);assert.equal(q.quote.customer_fee,10);
  assert.equal((await uberOperation(storage,env,{order_id:'EP-1',action:'dispatch',quote_id:'dqt_1',confirm_fee:1})).status,409);assert.equal(calls.length,0);
  const b={order_id:'EP-1',action:'dispatch',quote_id:'dqt_1',confirm_fee:1750};
  assert.equal((await uberOperation(storage,env,b)).status,502);
  assert.equal((await uberOperation(storage,env,{order_id:'EP-1',action:'quote'})).status,409);
  assert.equal((await uberOperation(storage,env,b)).status,200);assert.deepEqual(calls[0],calls[1]);assert.ok(calls[0].idempotency_key);assert.ok(calls[0].test_specifications);
  await uberOperation(storage,env,b);assert.equal(calls.length,2);
  let d=await (await uberOperation(storage,env,{order_id:'EP-1',action:'status'})).json();assert.equal(d.delivery.status,'delivered');
  assert.equal(order.delivery_fee,10);
  map.clear();order.payment_status='pending';assert.equal((await uberOperation(storage,env,{order_id:'EP-1',action:'quote'})).status,409);
 }finally{globalThis.fetch=originalFetch;}
});
