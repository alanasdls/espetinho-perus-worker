import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
import {DEFAULT_ZONES,selectZone,validateZones,quoteDelivery,handleDelivery} from '../delivery-rates.js';
import {allowed} from '../admin-security.js';
import {checkoutBinding} from './checkout-storage.js';
const address=(bairro,localidade='São Paulo')=>({bairro,localidade,uf:'SP'});
const env=()=>{const values=new Map();return {values,ORDER_REALTIME:checkoutBinding(),MISTICPAY_CI:'test',MISTICPAY_CS:'test',ORDERS_KV:{get:async(k,format)=>k==='config:delivery-control'?{mode:'manual_open',expires_at:Date.now()+60000}:values.has(k)?format==='json'?JSON.parse(values.get(k)):values.get(k):null,put:async(k,v)=>values.set(k,v)}};};
test('approved fees, entire station Aurora prefix, neighboring homonyms denied',()=>{
 for(const [cep,a,fee] of [['05201000',address('Perus'),10],['05186000',address('Vila Aurora'),15],['05186911',address('Vila Aurora'),15],['05181000',address('Jaraguá'),15],['02986080',address('Parque Taipas'),20],['07749225',address('Vila Rosina','Caieiras'),20],['07745095',address('Laranjeiras','Caieiras'),25]])assert.equal(selectZone(DEFAULT_ZONES,cep,a)?.fee,fee);
 for(const [cep,a] of [['02410020',address('Vila Aurora')],['01001000',address('Sé')],['07745095',address('Laranjeiras','Outra cidade')]])assert.equal(selectZone(DEFAULT_ZONES,cep,a),null);
});
test('paused specific CEP cannot fall through to a cheaper neighborhood; invalid/overlapping config rejected',()=>{
 const zones=structuredClone(DEFAULT_ZONES);zones[1].active=false;
 assert.equal(selectZone(zones,'05186000',address('Jaraguá')),null);
 zones[1].active=true;zones[2].ceps=['05186'];assert.throws(()=>validateZones(zones),/sobrepostos/);
 zones[2].ceps=[];zones[2].fee=-1;assert.throws(()=>validateZones(zones),/frete/);
 zones[2].fee=15;zones[2].ceps=['05200000-05100000'];assert.throws(()=>validateZones(zones),/intervalo/);
});
test('Perus coverage survives lookup outage; new areas fail closed; CEP input validated',async()=>{
 const e=env(),original=fetch;globalThis.fetch=async()=>{throw Error('lookup unavailable');};
 try{assert.equal((await quoteDelivery(e,'05201-000')).fee,10);await assert.rejects(()=>quoteDelivery(e,'05186000'));await assert.rejects(()=>quoteDelivery(e,'foo05201000'),/CEP válido/);}finally{globalThis.fetch=original;}
});
test('server uses trusted CEP data, caches lookup and applies edited/paused table',async()=>{
 const e=env(),original=fetch;let lookups=0;
 globalThis.fetch=async()=>{lookups++;return Response.json({cep:'07749-225',...address('Vila Rosina','Caieiras')});};
 try{
  assert.equal((await quoteDelivery(e,'07749225')).fee,20);
  assert.equal((await quoteDelivery(e,'07749225')).fee,20);assert.equal(lookups,1);
  const zones=structuredClone(DEFAULT_ZONES);zones[4].fee=22;
  let r=await handleDelivery(new Request('https://api.test/admin/delivery-zones',{method:'POST',body:JSON.stringify({zones})}),e,{},()=>{throw Error('unexpected');},{});assert.equal(r.status,200);
  assert.equal((await quoteDelivery(e,'07749225')).fee,22);
  zones[4].active=false;e.values.set('config:delivery-zones-v1',JSON.stringify(zones));assert.equal((await quoteDelivery(e,'07749225')).allowed,false);
 }finally{globalThis.fetch=original;}
});
test('checkout recalculates freight; forged fee blocked before charging, valid regional fee charged once',async()=>{
 const e=env(),original=fetch;let paymentCalls=0,charged;
 globalThis.fetch=async(url,opts)=>{
  if(url.includes('viacep'))return Response.json({cep:'07749-225',...address('Vila Rosina','Caieiras')});
  paymentCalls++;charged=JSON.parse(opts.body).amount;return Response.json({data:{transactionId:'one',copyPaste:'pix',qrCodeBase64:'cXI=',transactionState:'PENDENTE'}});
 };
 const request=fee=>new Request('https://api.test/criar-pix',{method:'POST',body:JSON.stringify({order_id:'EP-zone',items:[{name:'Pão de alho',quantity:1}],delivery_fee:fee,customer:{name:'Test',email:'test@example.com',fulfillment:'Entrega',cep:'07749225',bairro:'Perus'}})});
 try{
  assert.equal((await worker.fetch(request(10),e,{})).status,409);assert.equal(paymentCalls,0);
  const r=await worker.fetch(request(20),e,{});assert.equal(r.status,201);assert.equal(charged,31.4);assert.equal(paymentCalls,1);
  const order=JSON.parse(e.values.get('order:EP-zone'));assert.equal(order.delivery_fee,20);assert.equal(order.customer.bairro,'Vila Rosina');
 }finally{globalThis.fetch=original;}
});
test('delivery table requires individual admin authentication',async()=>{
 for(const method of ['GET','POST']){const r=await worker.fetch(new Request('https://api.test/admin/delivery-zones',{method}),env(),{});assert.equal(r.status,401);assert.equal(allowed('cozinha',method,'/admin/delivery-zones'),false);assert.equal(allowed('atendimento',method,'/admin/delivery-zones'),false);assert.equal(allowed('admin',method,'/admin/delivery-zones'),true);}
});
