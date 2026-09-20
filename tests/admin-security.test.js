import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
import {staffStorage,digest,allowed,filterOrders} from '../admin-security.js';
function storage(){
 let state;let chain=Promise.resolve();
 return {snapshot:()=>structuredClone(state),transaction(fn){const run=chain.then(async()=>{let working=structuredClone(state);const value=await fn({get:async()=>structuredClone(working),put:async(_,s)=>{working=structuredClone(s);}});state=working;return value;});chain=run.catch(()=>{});return run;}};
}
const user={id:'owner',email:'owner@test.com'};
async function init(s){return staffStorage(s,{action:'login',bootstrap:true,bootstrapValid:true,user,newTokenHash:'ownerhash'});}
test('bootstrap is one-time and atomic; shared key cannot authorize later',async()=>{
 const s=storage();const results=await Promise.all([init(s),init(s)]);assert.deepEqual(results.map(r=>r.status),[200,409]);
 assert.equal((await staffStorage(s,{action:'authorize',tokenHash:'bad'})).status,401);
 assert.equal((await staffStorage(s,{action:'login',user:{id:'outsider',email:'o@test.com'},newTokenHash:'bad'})).status,403);
});
test('invites bind verified email, are single-use, and cannot restore disabled users',async()=>{
 const s=storage();await init(s);
 await staffStorage(s,{action:'invite',tokenHash:'ownerhash',email:'cook@test.com',role:'cozinha',inviteHash:'code'});
 let r=await staffStorage(s,{action:'login',user:{id:'wrong',email:'wrong@test.com'},inviteHash:'code',newTokenHash:'wrong'});assert.equal(r.status,403);
 r=await staffStorage(s,{action:'login',user:{id:'cook',email:'cook@test.com'},inviteHash:'code',newTokenHash:'cookhash'});assert.equal(r.body.user.role,'cozinha');
 assert.equal((await staffStorage(s,{action:'list',tokenHash:'cookhash'})).status,403);
 await staffStorage(s,{action:'update',tokenHash:'ownerhash',userId:'cook',role:'cozinha',active:false});
 assert.equal((await staffStorage(s,{action:'authorize',tokenHash:'cookhash'})).status,401);
 assert.equal((await staffStorage(s,{action:'login',user:{id:'cook',email:'cook@test.com'},inviteHash:'code',newTokenHash:'new'})).status,403);
});
test('last administrator cannot be removed; logout, revocation and expiry are effective',async()=>{
 const s=storage();await init(s);
 assert.equal((await staffStorage(s,{action:'update',tokenHash:'ownerhash',userId:'owner',role:'cozinha',active:true})).status,409);
 const list=await staffStorage(s,{action:'list',tokenHash:'ownerhash'});
 assert.ok(!JSON.stringify(list).includes('ownerhash'));
 await staffStorage(s,{action:'revoke',tokenHash:'ownerhash',sessionId:list.body.sessions[0].id});
 assert.equal((await staffStorage(s,{action:'authorize',tokenHash:'ownerhash'})).status,401);
 await staffStorage(s,{action:'login',user,newTokenHash:'again'});
 await staffStorage(s,{action:'logout',tokenHash:'again'});assert.equal((await staffStorage(s,{action:'authorize',tokenHash:'again'})).status,401);
 await staffStorage(s,{action:'login',user,newTokenHash:'expire'});
 const clock=Date.now;Date.now=()=>clock()+8*3600000+1;
 try{assert.equal((await staffStorage(s,{action:'authorize',tokenHash:'expire'})).status,401);}finally{Date.now=clock;}
});
test('login attempts limited atomically across concurrent requests',async()=>{
 const s=storage();const results=await Promise.all(Array.from({length:12},()=>staffStorage(s,{action:'attempt',emailHash:'one',ipHash:'ip'})));
 assert.equal(results.filter(r=>r.status===200).length,8);assert.equal(results.filter(r=>r.status===429).length,4);
});
test('role policy and response filters exclude financial/customer secrets from kitchen',()=>{
 assert.equal(allowed('cozinha','POST','/admin/delivery-control'),false);
 assert.equal(allowed('atendimento','POST','/admin/delivery-control'),true);
 assert.equal(allowed('atendimento','GET','/admin/misticpay-debug'),false);
 const p={order_id:'one',total:100,tracking_token:'secret',payment_id:'p',customer:{name:'Alice',cpf:'secret',email:'private',phone:'private',address:'private',notes:'sem sal'},items:[{name:'Espeto',quantity:1,unit_price:100}]};
 const d=JSON.stringify(filterOrders('cozinha',[p]));assert.ok(!/secret|private|unit_price|total/.test(d));assert.ok(d.includes('sem sal'));
});
function environment(s){
 const records=new Map();const env={ADMIN_KEY:'bootstrap-secret',ADMIN_BOOTSTRAP_USER_ID:'owner',SUPABASE_URL:'https://db.test',SUPABASE_PUBLISHABLE_KEY:'public',
  ORDER_REALTIME:{idFromName:x=>x,get:()=>({fetch:async(url,opt)=>Response.json(new URL(url).pathname==='/staff-security'?await staffStorage(s,JSON.parse(opt.body)):{ok:true})})},
  ORDERS_KV:{get:async(k,t)=>records.get(k)||null,put:async(k,v)=>{try{records.set(k,JSON.parse(v));}catch{records.set(k,v);}},list:async()=>({keys:[...records.keys()].filter(k=>k.startsWith('order:')).map(name=>({name}))})}};
 return {env,records};
}
const req=(path,body,token)=>new Request('https://api.test'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
test('real Worker login uses provider identity, hides provider tokens, rejects old key and audits changes',async()=>{
 const s=storage(),{env,records}=environment(s);const original=fetch;
 globalThis.fetch=async(url,opt)=>url.includes('/token?')?Response.json({access_token:'provider-secret',refresh_token:'provider-refresh',user:{...user,email_confirmed_at:'2026-01-01',user_metadata:{role:'admin'}}}):Response.json({});
 try{
  let r=await worker.fetch(req('/admin/auth/login',{email:user.email,password:'password',mode:'bootstrap',bootstrap_key:env.ADMIN_KEY}),env,{});
  assert.equal(r.status,200);const d=await r.json();assert.match(d.token,/^[a-f0-9]{64}$/);assert.equal(d.user.role,'admin');assert.ok(!JSON.stringify(d).includes('provider-'));
  assert.ok(!JSON.stringify(s.snapshot()).includes(d.token));assert.ok(!JSON.stringify(s.snapshot()).includes('password'));
  r=await worker.fetch(new Request('https://api.test/admin/orders',{headers:{'X-Admin-Key':env.ADMIN_KEY}}),env,{});assert.equal(r.status,401);
  r=await worker.fetch(new Request('https://api.test/admin/realtime?key='+env.ADMIN_KEY),env,{});assert.equal(r.status,401);
  const cook={id:'cook',email:'cook@test.com'};await staffStorage(s,{action:'invite',tokenHash:await digest(d.token),email:cook.email,role:'cozinha',inviteHash:'invite'});
  const token='a'.repeat(64);await staffStorage(s,{action:'login',user:cook,inviteHash:'invite',newTokenHash:await digest(token)});
  records.set('order:one',{order_id:'one',payment_status:'approved',order_status:'recebido',customer:{name:'Alice',cpf:'private'},tracking_token:'private',total:100,items:[]});
  r=await worker.fetch(req('/admin/orders',null,token),env,{});assert.equal(r.status,200);assert.ok(!(await r.text()).includes('private'));
  r=await worker.fetch(new Request('https://api.test/admin/orders/one',{method:'PATCH',headers:{Authorization:'Bearer '+token},body:JSON.stringify({order_status:'cancelado'})}),env,{});assert.equal(r.status,403);
  r=await worker.fetch(new Request('https://api.test/admin/orders/one',{method:'PATCH',headers:{Authorization:'Bearer '+token},body:JSON.stringify({order_status:'em_preparo'})}),env,{});assert.equal(r.status,200);assert.ok(!(await r.text()).includes('private'));
  assert.equal(records.get('order:one').order_status,'em_preparo');assert.ok(s.snapshot().audit.some(a=>a.actor===cook.email&&a.action==='action_result'&&a.status===200));
  r=await worker.fetch(req('/admin/auth/logout',{},token),env,{});assert.equal(r.status,200);
  r=await worker.fetch(req('/admin/orders',null,token),env,{});assert.equal(r.status,401);
 }finally{globalThis.fetch=original;}
});
test('unverified or forged account cannot bootstrap; storage outage fails closed',async()=>{
 const s=storage(),{env}=environment(s);const original=fetch;
 globalThis.fetch=async()=>Response.json({user,access_token:'provider'});
 try{const r=await worker.fetch(req('/admin/auth/login',{email:user.email,password:'password',mode:'bootstrap',bootstrap_key:env.ADMIN_KEY}),env,{});assert.equal(r.status,401);assert.equal(s.snapshot().initialized,false);}finally{globalThis.fetch=original;}
 delete env.ORDER_REALTIME;const r=await worker.fetch(req('/admin/orders',null,'a'.repeat(64)),env,{});assert.equal(r.status,503);
});
