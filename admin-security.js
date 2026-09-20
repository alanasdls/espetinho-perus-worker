// Administrative identities are verified by Supabase Auth. Authorization and revocable
// sessions live in one Durable Object; no browser-provided role is trusted.
export const ADMIN_CONTEXT=Symbol('staff');
const BOOTSTRAP_USER_ID='29348136-8d74-4a10-af8f-9329b9be96b2';
const HOURS=8*60*60*1000;
const ROLES=['admin','atendimento','cozinha'];
export const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');
const opaque=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const result=(body,status=200)=>({body,status});
const fail=(status,erro)=>result({erro},status);
function log(s,actor,action,target='',status=200){
 s.audit.push({id:crypto.randomUUID(),at:new Date().toISOString(),actor:actor?.email||actor||'anônimo',action,target:String(target).slice(0,180),status});
 s.audit=s.audit.slice(-1000);
}
function clean(s,now){
 for(const [k,v] of Object.entries(s.sessions))if(v.expires<=now)delete s.sessions[k];
 for(const [k,v] of Object.entries(s.invites))if(v.expires<=now)delete s.invites[k];
 for(const [k,v] of Object.entries(s.rates))if(v.until<=now)delete s.rates[k];
}
// Called exclusively over the internal Durable Object binding, never a public route.
export async function staffStorage(storage,b){
 return storage.transaction(async tx=>{
  const s=await tx.get('staff-v1')||{users:{},sessions:{},invites:{},rates:{},audit:[],initialized:false};
  const now=Date.now();clean(s,now);let out;
  const session=s.sessions[b.tokenHash];const actor=session&&s.users[session.userId];
  const valid=actor?.active&&session.expires>now;
  if(b.action==='attempt'){
   const keys=['global','ip:'+b.ipHash,'email:'+b.emailHash],limits=[300,20,8];
   const blocked=keys.some((k,i)=>(s.rates[k]?.count||0)>=limits[i]);
   if(blocked)out=fail(429,'Muitas tentativas. Aguarde 15 minutos.');
   else{keys.forEach(k=>{s.rates[k]||={count:0,until:now+900000};s.rates[k].count++;});out=result({ok:true});}
  }else if(b.action==='failed'){
   log(s,'anônimo','login_failed',b.emailHash,401);out=result({ok:true});
  }else if(b.action==='login'){
   let u=s.users[b.user.id];
   if(b.bootstrap){
    if(s.initialized)out=fail(409,'O primeiro administrador já foi ativado. Entre com sua conta.');
    else if(!b.bootstrapValid)out=fail(401,'Não foi possível autorizar este acesso.');
    else {u={id:b.user.id,email:b.user.email,role:'admin',active:true};s.users[u.id]=u;s.initialized=true;log(s,u,'bootstrap');}
   }else if(b.inviteHash){
    const invitation=s.invites[b.inviteHash];
    if(!invitation||invitation.email!==b.user.email||u)out=fail(403,'Convite inválido, utilizado ou conta já cadastrada no painel.');
    else{u={id:b.user.id,email:b.user.email,role:invitation.role,active:true};s.users[u.id]=u;delete s.invites[b.inviteHash];log(s,u,'invitation_accepted');}
   }
   if(!out){
    if(!u?.active){log(s,b.user.email,'login_denied','',403);out=fail(403,'Esta conta não tem acesso ao painel.');}
    else{
     const own=Object.entries(s.sessions).filter(([,v])=>v.userId===u.id).sort((a,b)=>a[1].created-b[1].created);
     while(own.length>=5)delete s.sessions[own.shift()[0]];
     s.sessions[b.newTokenHash]={id:crypto.randomUUID(),userId:u.id,created:now,expires:now+HOURS};
     log(s,u,'login');out=result({user:u,expires_at:now+HOURS});
    }
   }
  }else if(!valid)out=fail(401,'Sessão expirada ou revogada. Entre novamente.');
  else if(b.action==='authorize')out=result({user:actor,expires_at:session.expires});
  else if(b.action==='logout'){delete s.sessions[b.tokenHash];log(s,actor,'logout');out=result({ok:true});}
  else if(b.action==='audit'){log(s,actor,b.event,b.target,b.status);out=result({ok:true});}
  else if(actor.role!=='admin')out=fail(403,'Acesso restrito à administração.');
  else if(b.action==='list')out=result({users:Object.values(s.users),sessions:Object.values(s.sessions).map(v=>({...v,email:s.users[v.userId]?.email})),audit:s.audit.slice(-100).reverse()});
  else if(b.action==='invite'){
   if(!ROLES.includes(b.role)||!/^\S+@\S+\.\S+$/.test(b.email))out=fail(400,'Informe e-mail e função válidos.');
   else if(Object.values(s.users).some(u=>u.email===b.email))out=fail(409,'Conta já vinculada. Altere o acesso na lista.');
   else{
    for(const [k,v] of Object.entries(s.invites))if(v.email===b.email)delete s.invites[k];
    s.invites[b.inviteHash]={email:b.email,role:b.role,expires:now+86400000};
    log(s,actor,'invite_created',`${b.email} → ${b.role}`);out=result({ok:true,expires_at:now+86400000});
   }
  }else if(b.action==='update'){
   const u=s.users[b.userId];
   if(!u||!ROLES.includes(b.role)||typeof b.active!=='boolean')out=fail(400,'Usuário ou função inválidos.');
   else if(u.role==='admin'&&u.active&&(b.role!=='admin'||!b.active)&&Object.values(s.users).filter(x=>x.active&&x.role==='admin').length<=1)out=fail(409,'Mantenha pelo menos um administrador ativo.');
   else{u.role=b.role;u.active=b.active;for(const [k,v] of Object.entries(s.sessions))if(v.userId===u.id)delete s.sessions[k];log(s,actor,'access_changed',`${u.email} → ${u.role}, ativo=${u.active}`);out=result({ok:true});}
  }else if(b.action==='revoke'){
   for(const [k,v] of Object.entries(s.sessions))if(v.id===b.sessionId)delete s.sessions[k];
   log(s,actor,'session_revoked',b.sessionId);out=result({ok:true});
  }else out=fail(404,'Operação não encontrada.');
  if(!['authorize','list'].includes(b.action))await tx.put('staff-v1',s);
  return out;
 });
}
async function rpc(env,body){
 if(!env.ORDER_REALTIME)throw Error('Staff storage unavailable');
 const r=await env.ORDER_REALTIME.get(env.ORDER_REALTIME.idFromName('staff-security-v1')).fetch('https://internal/staff-security',{method:'POST',body:JSON.stringify(body)});
 if(!r.ok)throw Error('Staff storage failed');return r.json();
}
export function allowed(role,method,path){
 if(role==='admin')return true;
 if(method==='GET'&&['/admin/orders','/admin/delivery-control'].includes(path))return true;
 if(method==='PATCH'&&/^\/admin\/orders\/[^/]+$/.test(path))return true;
 return role==='atendimento'&&method==='POST'&&path==='/admin/delivery-control';
}
export function filterOrders(role,orders){
 if(role==='admin')return orders;
 return orders.map(p=>{
  const common={order_id:p.order_id,created_at:p.created_at,updated_at:p.updated_at,order_status:p.order_status,payment_status:p.payment_status,estimated_minutes:p.estimated_minutes,status_history:p.status_history,
   items:(p.items||[]).map(i=>({name:i.name,quantity:i.quantity,reward:i.reward})),customer:{name:p.customer?.name,fulfillment:p.customer?.fulfillment,notes:p.customer?.notes}};
  if(role==='atendimento'){common.total=p.total;common.delivery_fee=p.delivery_fee;common.customer.phone=p.customer?.phone;common.customer.address=p.customer?.address;}
  return common;
 });
}
async function readSmall(request){
 if(Number(request.headers.get('Content-Length'))>8192)throw Error('body');
 const reader=request.body?.getReader();if(!reader)return {};
 const chunks=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw Error('body');}chunks.push(value);}
 const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
export async function handleStaff(request,env,ctx,core,headers){
 const path=new URL(request.url).pathname;
 if(!path.startsWith('/admin/'))return core(request,env,ctx);
 const respond=(d,s=200)=>Response.json(d,{status:s,headers:{...headers,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 try{
  if(path==='/admin/auth/login'&&request.method==='POST'){
   let b;try{b=await readSmall(request);}catch{return respond({erro:'Dados de acesso inválidos.'},400);}
   const email=String(b.email||'').trim().toLowerCase();
   const emailHash=await digest(email),ipHash=await digest(request.headers.get('CF-Connecting-IP')||'unknown');
   const limit=await rpc(env,{action:'attempt',emailHash,ipHash});if(limit.status!==200)return respond(limit.body,limit.status);
   if(!email||typeof b.password!=='string'||b.password.length>256)return respond({erro:'Informe e-mail e senha.'},400);
   if(!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY)return respond({erro:'Login indisponível.'},503);
   const base=env.SUPABASE_URL.replace(/\/$/,'');
   const auth=await fetch(base+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password:b.password})});
   const data=await auth.json().catch(()=>({}));
   if(!auth.ok||!data.user?.id||!data.user?.email_confirmed_at||String(data.user.email).toLowerCase()!==email){await rpc(env,{action:'failed',emailHash});return respond({erro:'Não foi possível entrar. Verifique a conta e a senha.'},401);}
   const token=opaque();
   const a=await rpc(env,{action:'login',user:{id:data.user.id,email},newTokenHash:await digest(token),bootstrap:b.mode==='bootstrap',bootstrapValid:data.user.id===(env.ADMIN_BOOTSTRAP_USER_ID||BOOTSTRAP_USER_ID)&&Boolean(env.ADMIN_KEY)&&await digest(String(b.bootstrap_key||''))===await digest(env.ADMIN_KEY),inviteHash:b.mode==='invite'?await digest(String(b.invite_code||'')):null});
   // This provider session was used only to verify credentials. Never expose or persist it.
   if(data.access_token)await fetch(base+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+data.access_token}}).catch(()=>{});
   return respond(a.status===200?{...a.body,token}:a.body,a.status);
  }
  const token=request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if(!token)return respond({erro:'Entre com sua conta individual.'},401);
  const tokenHash=await digest(token);
  const a=await rpc(env,{action:'authorize',tokenHash});if(a.status!==200)return respond(a.body,a.status);
  const user=a.body.user;
  if(path==='/admin/auth/me'&&request.method==='GET')return respond(a.body);
  if(path==='/admin/auth/logout'&&request.method==='POST'){const r=await rpc(env,{action:'logout',tokenHash});return respond(r.body,r.status);}
  if(path.startsWith('/admin/security/')){
   if(user.role!=='admin')return respond({erro:'Acesso restrito à administração.'},403);
   let b={};if(request.method!=='GET'){try{b=await readSmall(request);}catch{return respond({erro:'Dados inválidos.'},400);}}
   let action=null,extra={};
   if(path==='/admin/security/access'&&request.method==='GET')action='list';
   if(path==='/admin/security/invite'&&request.method==='POST'){action='invite';const code=opaque();extra={code};b={email:String(b.email||'').trim().toLowerCase(),role:b.role,inviteHash:await digest(code)};}
   if(path==='/admin/security/user'&&request.method==='POST'){action='update';b={userId:b.userId,role:b.role,active:b.active};}
   if(path==='/admin/security/revoke'&&request.method==='POST'){action='revoke';b={sessionId:b.sessionId};}
   if(!action)return respond({erro:'Operação não encontrada.'},404);
   const r=await rpc(env,{...b,action,tokenHash});return respond(r.status===200?{...r.body,...extra}:r.body,r.status);
  }
  if(path==='/admin/realtime')return respond({erro:'Atualize o painel para usar a sessão individual.'},410);
  if(!allowed(user.role,request.method,path)){await rpc(env,{action:'audit',tokenHash,event:'access_denied',target:path,status:403});return respond({erro:'Sua função não permite esta operação.'},403);}
  const mutating=request.method!=='GET';
  let target=request.method+' '+path;
  if(mutating){const details=await request.clone().json().catch(()=>({}));const status=String(details.order_status||details.mode||'').replace(/[^a-z_]/g,'').slice(0,40);if(status)target+=' → '+status;}
  if(mutating)await rpc(env,{action:'audit',tokenHash,event:'action_requested',target,status:202});
  const r=await core(request,{...env,[ADMIN_CONTEXT]:user},ctx);
  if(mutating)await rpc(env,{action:'audit',tokenHash,event:'action_result',target,status:r.status});
  if(r.ok&&path==='/admin/orders'&&user.role!=='admin'){const d=await r.json();return respond({pedidos:filterOrders(user.role,d.pedidos||[])});}
  if(r.ok&&user.role!=='admin'&&/^\/admin\/orders\//.test(path)){const d=await r.json();return respond({pedido:filterOrders(user.role,[d.pedido])[0]});}
  return r;
 }catch(error){console.error('Staff security unavailable');return respond({erro:'Não foi possível validar o acesso. Tente novamente.'},503);}
}
