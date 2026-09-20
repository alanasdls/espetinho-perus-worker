const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_MODULE||'jsdom');
const root=path.resolve(__dirname,'..');
async function setup(role){
 const html=fs.readFileSync(path.join(root,'admin.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const dom=new JSDOM(html,{url:'https://espetinhoperus.com.br/admin.html',runScripts:'dangerously'}),w=dom.window,errors=[];
 w.addEventListener('error',e=>errors.push(e.error?.message||e.message));
 w.setInterval=()=>0;w.clearInterval=()=>{};w.Notification={permission:'denied'};w.alert=()=>{};
 w.fetch=async url=>({ok:true,status:200,json:async()=>{
  if(url.endsWith('/admin/auth/login'))return {token:'a'.repeat(64),user:{id:'one',email:'staff@test.com',role}};
  if(url.endsWith('/admin/security/access'))return {users:[],sessions:[],audit:[{actor:'<img src=x onerror=alert(1)>',action:'login',target:'',status:200,at:new Date().toISOString()}]};
  if(url.endsWith('/admin/orders'))return {pedidos:[{order_id:'EP-1',created_at:new Date().toISOString(),payment_status:'approved',order_status:'recebido',customer:{name:'Cliente',fulfillment:'Retirada'},items:[{name:'Espeto',quantity:1}]}]};
  if(url.endsWith('/admin/delivery-control'))return {modo:'automatic',aberto:true};
  return {};
 }});
 for(const filename of ['admin.js','staff-ui.js']){const script=w.document.createElement('script');script.textContent=fs.readFileSync(path.join(root,filename),'utf8');w.document.body.append(script);}
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
 }finally{dom.window.close();}
});
