const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const html=fs.readFileSync('pagamento-cartao.html','utf8');
const script=fs.readFileSync('pagamento-cartao.js','utf8');
const order={order_id:'EP-test-3492e9',total:31.42,subtotal:23.8,discount_amount:2.38,delivery_fee:10,items:[{name:'Produto <teste>',quantity:2,unit_price:11.9,subtotal:23.8}],status:'pending',attempt:'none',can_pay:true,customer:{name:'Cliente Teste',email:'cliente@example.com',phone:'11999999999',cpf:'52998224725',cep:'05205080',number:'95',fulfillment:'Entrega',address:'Rua de Teste, 95'}};
function setup(data=order){
 class Element{
  constructor(){this.value='';this.textContent='';this.children=[];this.listeners={};this.hidden=false;this.open=true;}
  addEventListener(type,fn){(this.listeners[type]||=[]).push(fn)}
  append(...children){this.children.push(...children)}
  replaceChildren(){this.children=[]}
  setAttribute(name,value){this[name]=value}
  checkValidity(){return !!this.value}
  reportValidity(){return true}
  async fire(type,event={}){for(const fn of this.listeners[type]||[])await fn(event)}
 }
 const elements=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const events={},calls=[],storage=new Map();
 elements.cvvHelp.hidden=true;
 const context={URLSearchParams,location:{hash:'#order_id=EP-test&token=test-token'},document:{getElementById:id=>elements[id],createElement:()=>new Element(),addEventListener:(type,fn)=>events[type]=fn},localStorage:{getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},addEventListener:(type,fn)=>events[type]=fn,crypto:{randomUUID:()=> '11111111-1111-4111-8111-111111111111'},setTimeout:()=>0,clearTimeout:()=>{},fetch:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>options.method==='POST'?{...data,status:'approved',can_pay:false,attempt:'finished'}:data}}};
 vm.runInNewContext(script,context);
 return {elements,events,calls,storage,ready:()=>new Promise(r=>setImmediate(r))};
}
test('checkout folds prefilled details, masks fields and renders server totals',async()=>{
 const {elements:e,ready}=setup();await ready();
 assert.equal(e.cardForm.hidden,false);assert.equal(e.holderDetails.open,false);assert.equal(e.billingDetails.open,false);
 assert.equal(e.cpf.value,'529.982.247-25');assert.equal(e.postalCode.value,'05205-080');assert.equal(e.phone.value,'(11) 99999-9999');
 assert.equal(e.orderLabel.textContent,'Pedido • 3492e9');assert.match(e.payLabel.textContent,/31,42/);assert.equal(e.holderContact.textContent,'clie***@example.com');
 const content=JSON.stringify(e.orderContent.children);assert.match(content,/Produto <teste>/);assert.match(content,/2,38/);assert.match(content,/Rua de Teste/);
 const group={open:false};await e.cardForm.fire('invalid',{target:{closest:()=>group}});assert.equal(group.open,true);
 e.cvvToggle.onclick();assert.equal(e.cvvHelp.hidden,false);assert.equal(e.cvvToggle['aria-expanded'],'true');
});
test('missing billing data stays open and editing updates the summary',async()=>{
 const {elements:e,ready}=setup({...order,customer:{...order.customer,cep:'',number:''}});await ready();assert.equal(e.billingDetails.open,true);
 e.postalCode.value='05206000';await e.postalCode.fire('input');e.addressNumber.value='8';await e.addressNumber.fire('input');
 assert.equal(e.billingSummary.textContent,'CEP 05206-000 · Nº 8');
});
test('masked holder fields are normalized for payment and sensitive fields are cleared',async()=>{
 const {elements:e,calls,ready}=setup();await ready();
 e.cardNumber.value='4111 1111 1111 1111';e.expiry.value='12/2035';e.ccv.value='987';
 await e.cardForm.fire('submit',{preventDefault(){}});
 const sent=JSON.parse(calls.find(c=>c.options.method==='POST').options.body);
 assert.equal(sent.creditCardHolderInfo.cpfCnpj,'52998224725');assert.equal(sent.creditCardHolderInfo.postalCode,'05205080');assert.equal(sent.creditCardHolderInfo.phone,'11999999999');
 assert.equal(sent.creditCard.number,'4111111111111111');assert.equal(e.cardNumber.value,'');assert.equal(e.ccv.value,'');assert.equal(e.cardForm.hidden,true);assert.match(e.message.textContent,/aprovado/);
});
