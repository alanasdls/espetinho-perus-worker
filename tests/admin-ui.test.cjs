const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_MODULE||'jsdom');
const root=path.resolve(__dirname,'..');
async function setup(role,unseen=[]){
 const html=fs.readFileSync(path.join(root,'admin.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const dom=new JSDOM(html,{url:'https://espetinhoperus.com.br/admin.html',runScripts:'dangerously'}),w=dom.window,errors=[];
 w.localStorage.setItem('ep-unseen-orders',JSON.stringify(unseen));
 w.addEventListener('error',e=>errors.push(e.error?.message||e.message));
 w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
 w.setInterval=()=>0;w.clearInterval=()=>{};w.Notification={permission:'denied'};w.alert=()=>{};
 w.fetch=async url=>({ok:true,status:200,json:async()=>{
  if(url.endsWith('/admin/auth/login'))return {token:'a'.repeat(64),user:{id:'one',email:'staff@test.com',role}};
  if(url.endsWith('/admin/security/access'))return {users:[],sessions:[],audit:[{actor:'<img src=x onerror=alert(1)>',action:'login',target:'',status:200,at:new Date().toISOString()}]};
  if(url.endsWith('/admin/orders'))return {pedidos:[{order_id:'EP-1',created_at:new Date().toISOString(),payment_status:'approved',order_status:'recebido',customer:{name:'Cliente',fulfillment:'Retirada'},items:[{name:'Espeto',quantity:1}]}]};
  if(url.endsWith('/admin/delivery-control'))return {modo:'automatic',aberto:true};
  return {};
 }});
 for(const filename of ['admin.js','staff-ui.js','uber-admin.js','admin-mobile.js']){const script=w.document.createElement('script');script.textContent=fs.readFileSync(path.join(root,filename),'utf8');w.document.body.append(script);}
 w.document.querySelector('#staffEmail').value='staff@test.com';w.document.querySelector('#keyInput').value='password';await w.document.querySelector('#loginBtn').onclick();
 await new Promise(r=>setTimeout(r,20));return {dom,w,errors};
}
for(const role of ['admin','atendimento','cozinha'])test('panel login and controls for '+role,async()=>{
 const {dom,w,errors}=await setup(role);try{
  assert.deepEqual(errors,[]);assert.equal(w.document.querySelector('#panel').hidden,false);
  assert.equal(w.document.body.dataset.staffRole,role);assert.equal(w.localStorage.getItem('ep-admin-key'),null);assert.equal(w.sessionStorage.getItem('ep-staff-session'),'a'.repeat(64));
  assert.equal(w.document.querySelector('[data-tab="securityTab"]').hidden,role!=='admin');
  assert.equal(w.document.querySelector('[data-tab="financeTab"]').hidden,role!=='admin');
  assert.equal(w.document.querySelectorAll('#staffAudit img').length,0);
  if(role==='cozinha')assert.equal(w.document.querySelector('.delivery-control-actions').hidden,true);
  if(role!=='admin')assert.equal(w.document.querySelector('[data-status="cancelado"]'),null);
  assert.ok(w.document.querySelector('#orders').textContent.includes('Espeto'));
  assert.equal(w.document.querySelector('#orders .order-uber'),null);
  assert.equal(w.document.querySelector('#orders [data-status="saiu_entrega"]'),null);
  const detail=w.document.querySelector('#orders details');assert.equal(detail.open,false);
  detail.open=true;w.document.querySelector('#searchInput').dispatchEvent(new w.Event('input'));assert.equal(w.document.querySelector('#orders details').open,true);
  const menu=w.document.querySelector('.panel-menu');assert.equal(w.document.querySelector('.section-menu'),null);assert.equal(menu.querySelector('.tabs').hidden,false);menu.open=true;w.document.querySelector('[data-tab="ordersTab"]').click();assert.equal(menu.open,false);menu.open=true;w.document.querySelector('.order-view').click();assert.equal(menu.open,false);menu.open=true;w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(menu.open,false);
  if(role==='admin'){w.confirm=()=>false;w.document.querySelector('#orders [data-status="cancelado"]').click();assert.equal(w.document.querySelector('#orders [data-status="em_preparo"]').disabled,false);}
  let opened=false;w.document.querySelector('#uberDialog').showModal=()=>{opened=true;};w.openOrderUber('EP-delivery');assert.equal(opened,true);assert.equal(w.document.querySelector('#uberOrderId').value,'EP-delivery');

 }finally{dom.window.close();}
});

test('counter removes stale orders, filters follow search and estimate draft survives polling',async()=>{
 const {dom,w}=await setup('admin',['EP-1','old-completed','missing']);try{
  assert.equal(w.document.querySelector('#newOrdersCounter').textContent,'1 novo');
  assert.deepEqual(JSON.parse(w.localStorage.getItem('ep-unseen-orders')),['EP-1']);
  assert.equal(w.document.querySelector('#filters [data-filter="ativos"] .filter-count').textContent,'1');
  const input=w.document.querySelector('.estimate-input');input.value='45';input.dispatchEvent(new w.Event('input',{bubbles:true}));
  await w.document.querySelector('#refreshBtn').onclick();assert.equal(w.document.querySelector('.estimate-input').value,'45');
  let body;w.fetch=async(url,opt)=>{body=JSON.parse(opt.body);return {ok:true,json:async()=>({})};};
  w.document.querySelector('.save-estimate').click();await new Promise(r=>setTimeout(r,5));
  assert.deepEqual(body,{estimated_minutes:45});assert.equal(w.document.querySelector('.estimate-feedback').textContent,'Previsão salva');
  const search=w.document.querySelector('#searchInput');search.value='nonexistent';search.dispatchEvent(new w.Event('input'));
  assert.equal(w.document.querySelector('#filters [data-filter="ativos"] .filter-count').textContent,'0');
  assert.equal(w.document.querySelectorAll('#orders article').length,0);
  assert.ok(w.document.querySelector('.panel-menu #staffIdentity'));
 }finally{dom.window.close();}
});
