const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(new URL('../app-misticpay-cpf-v102.js','file://'+__filename),'utf8');
const modulePath=process.env.JSDOM_MODULE||'jsdom';const {JSDOM}=require(modulePath);
test('cart displays quoted regional freight, total, pickup and unknown coverage correctly',()=>{
 const ids=['cartSubtotal','promoDiscount','promoDiscountLabel','couponDiscount','couponDiscountLabel','promoInfo','deliveryFee','deliveryFeeLabel','deliveryFeeInfo','cartTotal'];
 const dom=new JSDOM(ids.map(id=>`<span id="${id}"></span>`).join(''));
 let decision={allowed:true,fee:25,region:'Laranjeiras'},delivery=true,total;
 const c={document:dom.window.document,window:{epUpdateCartDesign:x=>total=x},deliveryAreaDecision:()=>decision,isDelivery:()=>delivery,getSubtotal:()=>50,getRegisteredDiscount:()=>0,epCouponState:{valid:false},epRegisteredCustomer:false,hasRewardItems:()=>false,fmt:v=>'R$ '+v.toFixed(2),updateCheckoutAvailability:()=>{}};
 vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function updateOrderSummary(){'),source.indexOf('const atualizarRecebimento=')),c);
 c.updateOrderSummary();assert.equal(total,75);assert.equal(dom.window.document.getElementById('deliveryFee').textContent,'R$ 25.00');
 decision={allowed:true,fee:15,region:'Vila Aurora'};c.updateOrderSummary();assert.equal(total,65);
 delivery=false;c.updateOrderSummary();assert.equal(total,50);assert.equal(dom.window.document.getElementById('deliveryFee').textContent,'Grátis');
 delivery=true;decision={allowed:false};c.updateOrderSummary();assert.equal(dom.window.document.getElementById('deliveryFee').textContent,'Consultar CEP');
});
test('a slow old CEP response cannot overwrite the latest address or freight',async()=>{
 const fields={};for(const name of ['streetInput','neighborhoodInput','cityInput','stateInput','numberInput','cepStatus','deliveryWhatsapp','cepInput'])fields[name]={value:'',style:{},focus(){}};
 let cep='07745095';const pending=new Map();
 const c={...fields,deliveryCepDigits:()=>cep,updateOrderSummary(){},composeAddress(){},localStorage:{setItem(){}},fetch:async url=>new Promise(resolve=>pending.set(url,resolve))};vm.createContext(c);
 vm.runInContext("let deliveryQuote=null,cepLookupComplete=false,lastLookupCep='',deliveryLookupVersion=0;"+source.slice(source.indexOf('async function buscarCep(){'),source.indexOf("cepInput?.addEventListener('input'")),c);
 const first=c.buscarCep();cep='05186000';const second=c.buscarCep();
 function finish(code,fee,region){pending.get(`https://viacep.com.br/ws/${code}/json/`)({ok:true,json:async()=>({logradouro:region,bairro:region,localidade:'São Paulo',uf:'SP'})});pending.get(`https://api.espetinhoperus.com.br/delivery/quote?cep=${code}`)({ok:true,json:async()=>({cep:code,allowed:true,fee,region})});}
 finish('05186000',15,'Vila Aurora');await second;finish('07745095',25,'Laranjeiras');await first;
 assert.equal(vm.runInContext('deliveryQuote.fee',c),15);assert.equal(c.streetInput.value,'Vila Aurora');assert.equal(vm.runInContext('lastLookupCep',c),'05186000');
});
test('admin editor persists prices, pauses and CEP additions through authenticated API',async()=>{
 const dom=new JSDOM('<button id="loadDeliveryZones"></button><form id="deliveryZonesForm" hidden><div id="deliveryZonesRows"></div><button type="submit"></button></form><p id="deliveryZonesMessage"></p>',{runScripts:'outside-only'});
 let payload;
 dom.window.api=async(path,opts)=>{assert.equal(path,'/admin/delivery-zones');if(opts)payload=JSON.parse(opts.body);return payload||{zones:[{id:'vila-aurora',name:'Vila Aurora',fee:15,active:true,ceps:['05186'],neighborhoods:[]}]};};
 dom.window.eval(fs.readFileSync(new URL('../delivery-admin.js','file://'+__filename),'utf8'));
 await dom.window.document.getElementById('loadDeliveryZones').onclick();
 dom.window.document.querySelector('[data-fee]').value=18;dom.window.document.querySelector('[data-active]').checked=false;dom.window.document.querySelector('[data-ceps]').value='05186\n05187000';
 await dom.window.document.getElementById('deliveryZonesForm').onsubmit({preventDefault(){}});
 assert.equal(payload.zones[0].fee,18);assert.equal(payload.zones[0].active,false);assert.deepEqual(payload.zones[0].ceps,['05186','05187000']);
});
test('05205080 address remains visible when freight endpoint rejects with HTML 403; checkout stays blocked',async()=>{
 const c={deliveryCepDigits:()=> '05205080',updateOrderSummary(){},composeAddress(){},localStorage:{setItem(){}},fetch:async url=>url.includes('viacep')?{ok:true,json:async()=>({logradouro:'Rua Joaquim da Costa Penha',bairro:'Jardim Russo',localidade:'São Paulo',uf:'SP'})}:{ok:false,status:403,json:async()=>{throw Error('HTML');}}};
 for(const name of ['streetInput','neighborhoodInput','cityInput','stateInput','numberInput','cepStatus','deliveryWhatsapp','cepInput'])c[name]={value:'',style:{},focus(){}};
 vm.createContext(c);vm.runInContext("let deliveryQuote=null,cepLookupComplete=false,lastLookupCep='',deliveryLookupVersion=0;"+source.slice(source.indexOf('async function buscarCep(){'),source.indexOf("cepInput?.addEventListener('input'")),c);
 await c.buscarCep();assert.equal(c.streetInput.value,'Rua Joaquim da Costa Penha');assert.match(c.cepStatus.textContent,/frete.*403/);assert.equal(vm.runInContext('cepLookupComplete',c),false);assert.equal(vm.runInContext('deliveryQuote',c),null);
});
