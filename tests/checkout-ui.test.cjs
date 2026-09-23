const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const app=fs.readFileSync(new URL('../app-misticpay-cpf-v102.js','file://'+__filename),'utf8');
test('Pix and card handlers share an in-flight guard, including reentrant calls',async()=>{
 let release,calls=0,payloads=0;
 const buttons={card:{textContent:'Cartão'},pix:{textContent:'Pix'}};
 const context={paymentSelect:{value:'Cartão de débito'},pagBankButton:buttons.card,document:{querySelector:()=>buttons.pix},getOrderPayload:()=>{payloads++;return {order_id:'EP-test',items:[]};},epCheckoutHeaders:async()=>({}),fetch:async()=>{calls++;await new Promise(r=>release=r);return {ok:false,json:async()=>({erro:'test rejection'})};},epHandleRewardResponse:()=>false,alert:()=>{}};
 vm.createContext(context);
 vm.runInContext(app.slice(app.indexOf('let epCheckoutInFlight='),app.indexOf('const pixOverlay=')),context);
 vm.runInContext(app.slice(app.indexOf('const mpButton='),app.indexOf('// ===== Horário de pedidos')),context);
 const first=buttons.pix.onclick();await new Promise(r=>setImmediate(r));
 await Promise.all([buttons.pix.onclick(),buttons.card.onclick(),buttons.card.onclick()]);
 assert.equal(calls,1);assert.equal(payloads,1);
 release();await first;
 const second=buttons.card.onclick();await new Promise(r=>setImmediate(r));assert.equal(calls,2);release();await second;
 assert.equal(buttons.pix.disabled,false);assert.equal(buttons.card.disabled,false);
});
