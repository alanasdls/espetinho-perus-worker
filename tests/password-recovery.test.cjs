const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require(process.env.JSDOM_MODULE||'jsdom');
const tick=()=>new Promise(r=>setTimeout(r,15));
async function setup(user,url='?mode=password'){
 const dom=new JSDOM(fs.readFileSync('cliente.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),{url:'https://espetinhoperus.com.br/cliente.html'+url,runScripts:'dangerously'});
 const w=dom.window,calls=[],errors=[];let callback;
 w.addEventListener('error',e=>errors.push(e.message));
 w.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:user?{user}:null}}),getUser:async()=>({data:{user}}),onAuthStateChange:cb=>{callback=cb},updateUser:async b=>{calls.push(b);return {error:null}},resetPasswordForEmail:async(...b)=>{calls.push(b);return {error:null}}}})};
 w.eval(fs.readFileSync('cliente.js','utf8'));await tick();
 return {w,dom,calls,errors,event:()=>callback('PASSWORD_RECOVERY',{user})};
}
test('Google session can define password; mismatch never submits',async()=>{
 const {w,dom,calls,errors}=await setup({id:'one',email:'test@example.com'});
 try{assert.deepEqual(errors,[]);const $=s=>w.document.querySelector(s);
 assert.equal($('#passwordUpdateForm').hidden,false);assert.equal($('#clientDashboard').hidden,true);
 $('#newAccountPassword').value='new-password';$('#confirmAccountPassword').value='different';
 $('#passwordUpdateForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(calls.length,0);
 $('#confirmAccountPassword').value='new-password';$('#passwordUpdateForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();
 assert.equal(calls[0].password,'new-password');assert.match($('#passwordMessage').textContent,/Senha salva/);assert.equal($('#newAccountPassword').value,'');
 }finally{dom.window.close()}
});
test('logged-out recovery only offers email request',async()=>{
 const {w,dom,calls,errors}=await setup(null);try{
 assert.deepEqual(errors,[]);const $=s=>w.document.querySelector(s);assert.equal($('#passwordUpdateForm').hidden,true);assert.equal($('#passwordRequestForm').hidden,false);
 $('#passwordEmail').value='test@example.com';$('#passwordRequestForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(calls[0][1].redirectTo,'https://espetinhoperus.com.br/cliente.html');
 }finally{dom.window.close()}
});
test('existing recovery email opens password form rather than dashboard',async()=>{
 const {w,dom,event}=await setup({id:'one',email:'test@example.com'},'#type=recovery&access_token=test');try{
 event();await tick();assert.equal(w.document.querySelector('#passwordUpdateForm').hidden,false);assert.equal(w.document.querySelector('#clientDashboard').hidden,true);
 }finally{dom.window.close()}
});
