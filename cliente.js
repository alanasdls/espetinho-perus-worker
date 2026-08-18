const SUPABASE_URL='https://xikhljdlmeinihpeuwlj.supabase.co';
const SUPABASE_KEY='sb_publishable_SUPqs1Kjmmz_GIwVTDMFrA_WXDnNAM-';
const SUPABASE_AUTH_OPTIONS={auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage,storageKey:'espetinho-perus-auth'}};
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,SUPABASE_AUTH_OPTIONS);
const API_FIDELIDADE='https://espetinho-perus-api.alanasdls.workers.dev';
const $=s=>document.querySelector(s);
const fmt=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const phoneDigits=v=>String(v||'').replace(/\D/g,'');
const cpfDigits=v=>String(v||'').replace(/\D/g,'').slice(0,11);
const cepDigits=v=>String(v||'').replace(/\D/g,'').slice(0,8);
let currentUser=null,currentProfile=null,rewardsCatalog=[],rewardsImages={};
const AUTH_BACKUP_KEY='ep-supabase-session-backup';
function saveSessionBackup(session){try{if(session?.access_token&&session?.refresh_token)localStorage.setItem(AUTH_BACKUP_KEY,JSON.stringify({access_token:session.access_token,refresh_token:session.refresh_token}))}catch{}}
async function getPersistentSession(){
  let {data:{session}}=await db.auth.getSession();
  if(session){saveSessionBackup(session);return session}
  try{
    const backup=JSON.parse(localStorage.getItem(AUTH_BACKUP_KEY)||'null');
    if(backup?.access_token&&backup?.refresh_token){
      const {data,error}=await db.auth.setSession(backup);
      if(!error&&data.session){saveSessionBackup(data.session);return data.session}
    }
  }catch{}
  return null;
}

function toast(message){const el=$('#clientToast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function authMessage(message,type=''){const el=$('#authMessage');el.textContent=message;el.className=`auth-message ${type}`}
function maskCpf(value){const d=cpfDigits(value);return d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')}
function maskCep(value){const d=cepDigits(value);return d.replace(/(\d{5})(\d)/,'$1-$2')}
function maskBirthDate(value){const d=String(value||'').replace(/\D/g,'').slice(0,8);if(d.length<=2)return d;if(d.length<=4)return `${d.slice(0,2)}/${d.slice(2)}`;return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`}
function birthDateToIso(value){const m=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return '';const day=Number(m[1]),month=Number(m[2]),year=Number(m[3]);const dt=new Date(year,month-1,day);if(dt.getFullYear()!==year||dt.getMonth()!==month-1||dt.getDate()!==day)return '';const today=new Date();if(dt>today||year<1900)return '';return `${m[3]}-${m[2]}-${m[1]}`}
function birthDateToBr(value){const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:maskBirthDate(value)}
function validCpf(value){const cpf=cpfDigits(value);if(!/^\d{11}$/.test(cpf)||/^(\d)\1{10}$/.test(cpf))return false;let sum=0;for(let i=0;i<9;i++)sum+=Number(cpf[i])*(10-i);let d=(sum*10)%11;if(d===10)d=0;if(d!==Number(cpf[9]))return false;sum=0;for(let i=0;i<10;i++)sum+=Number(cpf[i])*(11-i);d=(sum*10)%11;if(d===10)d=0;return d===Number(cpf[10])}
function splitName(name=''){const parts=name.trim().split(/\s+/).filter(Boolean);return {first_name:parts.shift()||'',last_name:parts.join(' ')}}
function maskPhone(value){const d=phoneDigits(value).slice(0,11);if(d.length<=2)return d;if(d.length<=6)return `(${d.slice(0,2)}) ${d.slice(2)}`;if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`}
function setBusy(form,busy,label){const btn=form.querySelector('button[type="submit"]');if(!btn)return;if(!btn.dataset.original)btn.dataset.original=btn.textContent;btn.disabled=busy;btn.textContent=busy?label:btn.dataset.original}
function showTab(name){document.querySelectorAll('[data-auth-tab]').forEach(b=>b.classList.toggle('active',b.dataset.authTab===name));document.querySelectorAll('[data-auth-panel]').forEach(p=>p.classList.toggle('active',p.dataset.authPanel===name));authMessage('')}

document.querySelectorAll('[data-auth-tab]').forEach(btn=>btn.addEventListener('click',()=>showTab(btn.dataset.authTab)));

$('#googleLoginButton')?.addEventListener('click',async e=>{
  const button=e.currentTarget;
  const original=button.innerHTML;
  button.disabled=true;
  button.classList.add('loading');
  button.querySelector('span:last-child').textContent='Abrindo o Google...';
  authMessage('');
  try{
    const redirectTo=new URL('cliente.html',location.href).href;
    const {error}=await db.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo,queryParams:{access_type:'offline',prompt:'select_account'}}
    });
    if(error)throw error;
  }catch(err){
    button.disabled=false;
    button.classList.remove('loading');
    button.innerHTML=original;
    authMessage(translateError(err.message),'error');
  }
});

function showClientTab(panelId){
  document.querySelectorAll('[data-client-tab]').forEach(btn=>{
    const active=btn.dataset.clientTab===panelId;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-selected',active?'true':'false');
  });
  document.querySelectorAll('.client-panel').forEach(panel=>{
    panel.classList.toggle('active',panel.id===panelId);
  });
}
document.querySelectorAll('[data-client-tab]').forEach(btn=>btn.addEventListener('click',()=>showClientTab(btn.dataset.clientTab)));
['#registerPhone','#profilePhone'].forEach(sel=>$(sel)?.addEventListener('input',e=>e.target.value=maskPhone(e.target.value)));
['#registerCpf','#profileCpf'].forEach(sel=>$(sel)?.addEventListener('input',e=>e.target.value=maskCpf(e.target.value)));
['#registerCep','#profileCep'].forEach(sel=>$(sel)?.addEventListener('input',e=>e.target.value=maskCep(e.target.value)));
['#registerBirthDate','#profileBirthDate'].forEach(sel=>$(sel)?.addEventListener('input',e=>e.target.value=maskBirthDate(e.target.value)));
['#registerState','#profileState'].forEach(sel=>$(sel)?.addEventListener('input',e=>e.target.value=e.target.value.replace(/[^a-z]/gi,'').slice(0,2).toUpperCase()));

$('#registerForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;setBusy(form,true,'Criando conta...');authMessage('');
  const name=$('#registerName').value.trim(),phone=phoneDigits($('#registerPhone').value),email=$('#registerEmail').value.trim().toLowerCase(),password=$('#registerPassword').value;
  const cpf=cpfDigits($('#registerCpf').value),birth_date=birthDateToIso($('#registerBirthDate').value),address={cep:cepDigits($('#registerCep').value),street:$('#registerStreet').value.trim(),number:$('#registerNumber').value.trim(),complement:$('#registerComplement').value.trim(),neighborhood:$('#registerNeighborhood').value.trim(),city:$('#registerCity').value.trim(),state:$('#registerState').value.trim().toUpperCase()};
  if(!validCpf(cpf)){setBusy(form,false);return authMessage('Informe um CPF válido.','error')}
  if(!birth_date){setBusy(form,false);return authMessage('Informe uma data de nascimento válida no formato DD/MM/AAAA.','error')}
  const names=splitName(name);
  try{
    const {data,error}=await db.auth.signUp({email,password,options:{data:{nome:name,first_name:names.first_name,last_name:names.last_name,telefone:phone,cpf,birth_date,address}}});
    if(error)throw error;
    if(!data.session){authMessage('Conta criada. Faça o login para continuar.','success');showTab('login');$('#loginEmail').value=email;return}
    toast('Conta criada com sucesso.');await loadSession();
  }catch(err){authMessage(translateError(err.message),'error')}
  finally{setBusy(form,false)}
});

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;setBusy(form,true,'Entrando...');authMessage('');
  try{const {error}=await db.auth.signInWithPassword({email:$('#loginEmail').value.trim().toLowerCase(),password:$('#loginPassword').value});if(error)throw error;toast('Login realizado.');await loadSession()}
  catch(err){authMessage(translateError(err.message),'error')}
  finally{setBusy(form,false)}
});

$('#forgotPassword').addEventListener('click',async()=>{const email=$('#loginEmail').value.trim();if(!email)return authMessage('Digite seu e-mail primeiro.','error');const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/cliente.html`});authMessage(error?translateError(error.message):'Enviamos as instruções de recuperação para o seu e-mail.',error?'error':'success')});
$('#clientLogout').addEventListener('click',async()=>{await db.auth.signOut();localStorage.removeItem(AUTH_BACKUP_KEY);currentUser=null;currentProfile=null;renderLoggedOut();toast('Você saiu da conta.')});

$('#clientProfileForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!currentUser)return;
  const nome=$('#profileName').value.trim(),telefone=phoneDigits($('#profilePhone').value),cpf=cpfDigits($('#profileCpf').value),birth_date=birthDateToIso($('#profileBirthDate').value);
  const address={cep:cepDigits($('#profileCep').value),street:$('#profileStreet').value.trim(),number:$('#profileNumber').value.trim(),complement:$('#profileComplement').value.trim(),neighborhood:$('#profileNeighborhood').value.trim(),city:$('#profileCity').value.trim(),state:$('#profileState').value.trim().toUpperCase()};
  if(!validCpf(cpf))return toast('Informe um CPF válido.');
  if(!birth_date)return toast('Informe uma data de nascimento válida no formato DD/MM/AAAA.');
  const names=splitName(nome);
  const metadata={nome,first_name:names.first_name,last_name:names.last_name,telefone,cpf,birth_date,address};
  const {error:userError}=await db.auth.updateUser({data:metadata});
  if(userError)return toast('Não foi possível salvar os dados.');
  const {error}=await db.from('clientes').update({nome,telefone}).eq('id',currentUser.id);
  if(error)console.warn('Perfil básico não atualizado na tabela clientes',error);
  currentProfile={...currentProfile,nome,telefone,cpf,birth_date,address};
  localStorage.setItem('ep-customer-profile',JSON.stringify({name:nome,email:currentUser.email,phone:telefone,cpf,birth_date,address}));
  renderHeader();toast('Dados atualizados.');
});

function translateError(message=''){const m=message.toLowerCase();if(m.includes('invalid login'))return 'E-mail ou senha incorretos.';if(m.includes('already registered')||m.includes('already been registered'))return 'Este e-mail já possui cadastro.';if(m.includes('password'))return 'A senha precisa ter pelo menos 6 caracteres.';if(m.includes('rate limit'))return 'Muitas tentativas. Aguarde um pouco e tente novamente.';return message||'Não foi possível concluir. Tente novamente.'}
function renderLoggedOut(){const access=$('#clientAccess'),dashboard=$('#clientDashboard');dashboard.hidden=true;dashboard.setAttribute('aria-hidden','true');access.hidden=false;access.setAttribute('aria-hidden','false');$('#clientGreeting').textContent='Sua conta. Seus pontos.';$('#clientAvatar').textContent='EP'}
function renderHeader(){const name=currentProfile?.nome||currentUser?.user_metadata?.nome||currentUser?.user_metadata?.full_name||currentUser?.user_metadata?.name||'Cliente';$('#clientGreeting').textContent=`Olá, ${name.split(' ')[0]}!`;$('#clientAvatar').textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'EP'}
function empty(text,link=false){return `<div class="empty-client"><b>${esc(text)}</b>${link?'<br><a href="index.html#cardapio">Fazer primeiro pedido</a>':''}</div>`}

async function apiFidelidade(path,options={}){
  const session=await getPersistentSession();
  if(!session?.access_token)throw new Error('Sua sessão expirou. Entre novamente.');
  const headers={...(options.headers||{}),Authorization:`Bearer ${session.access_token}`};
  if(options.body&&!headers['Content-Type'])headers['Content-Type']='application/json';
  const response=await fetch(`${API_FIDELIDADE}${path}`,{...options,headers,cache:'no-store'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.erro||data.detalhes||`Erro ${response.status}`);
  return data;
}
function statusLabel(status=''){
  const map={aguardando_pagamento:'Aguardando pagamento',recebido:'Recebido',em_preparo:'Em preparo',pronto_retirada:'Pronto para retirada',saiu_entrega:'Saiu para entrega',finalizado:'Finalizado',cancelado:'Cancelado'};
  return map[status]||status||'Pedido';
}
function renderItems(items=[]){
  if(!Array.isArray(items)||!items.length)return '<div class="order-items order-items-empty">Itens deste pedido antigo não estão disponíveis no histórico detalhado.</div>';
  return `<div class="order-items">${items.map(i=>`<p><b>${Number(i.quantity||1)}× ${esc(i.name||'Produto')}</b><span>${fmt(i.unit_price||0)}</span></p>`).join('')}</div>`;
}
function renderOrderCard(o){
  const redeemed=Boolean(o?.loyalty?.redeemed);
  const points=Number(o?.loyalty?.points_used||0);
  const totalLabel=redeemed?`Resgate de ${points.toLocaleString('pt-BR')} pts`:fmt(o.total||o.valor_total||0);
  const pointsText=redeemed?'Sem geração de pontos':`+${Number(o?.loyalty?.points||o.pontos_gerados||0)} pontos`;
  return `<article class="client-order-card">
    <div class="order-card-top"><div><strong>Pedido ${esc(o.order_id||o.numero_pedido||'')}</strong><small>${new Date(o.created_at||o.criado_em).toLocaleString('pt-BR')}</small></div><span class="order-status">${esc(statusLabel(o.order_status||o.status))}</span></div>
    ${renderItems(o.items)}
    <div class="order-card-bottom"><strong>${esc(totalLabel)}</strong><small>${esc(pointsText)}</small></div>
  </article>`;
}
async function carregarImagensRecompensas(){
  if(Object.keys(rewardsImages).length)return;
  try{
    const r=await fetch('admin-catalog.json?v=20260815-v95',{cache:'no-store'});
    const catalog=await r.json();
    const list=Array.isArray(catalog)?catalog:(catalog.products||[]);
    rewardsImages=Object.fromEntries(list.map(p=>[String(p.name||''),p.image||'']));
  }catch(e){console.warn('Imagens do catálogo de fidelidade indisponíveis',e)}
}
function renderRewards(){
  const grid=$('#rewardsGrid');if(!grid)return;
  const q=String($('#rewardsSearch')?.value||'').trim().toLowerCase();
  const points=Number(currentProfile?.pontos||0);
  const list=rewardsCatalog.filter(p=>!q||String(p.name).toLowerCase().includes(q));
  if(!list.length){grid.innerHTML=empty('Nenhum produto encontrado para este filtro.');return}
  grid.innerHTML=list.map(p=>{
    const enough=points>=Number(p.points||0);
    const image=rewardsImages[p.name]||'logo-premium.png';
    return `<article class="reward-card ${enough?'reward-available':'reward-locked'}">
      <img src="${esc(image)}" alt="${esc(p.name)}" loading="lazy">
      <div class="reward-copy"><small>${fmt(p.price)}</small><h3>${esc(p.name)}</h3><strong>${Number(p.points||0).toLocaleString('pt-BR')} pontos</strong>
      <button type="button" data-redeem-product="${esc(p.name)}" ${enough?'':'disabled'}>${enough?'Resgatar produto':'Pontos insuficientes'}</button></div>
    </article>`;
  }).join('');
}
async function loadRewards(){
  const msg=$('#rewardsMessage'),grid=$('#rewardsGrid');
  if(!grid)return;
  $('#rewardsPoints').textContent=`${Number(currentProfile?.pontos||0).toLocaleString('pt-BR')} pts`;
  msg.textContent='Carregando produtos disponíveis...';
  try{
    const [data]=await Promise.all([apiFidelidade('/fidelidade/catalogo'),carregarImagensRecompensas()]);
    rewardsCatalog=Array.isArray(data.produtos)?data.produtos:[];
    msg.textContent=`${rewardsCatalog.length} produtos disponíveis para troca • retirada no local`;
    renderRewards();
  }catch(e){
    msg.textContent=e.message||'Não foi possível carregar os produtos para resgate.';
    grid.innerHTML='';
  }
}

async function loadDashboard(){
  const access=$('#clientAccess'),dashboard=$('#clientDashboard');access.hidden=true;access.setAttribute('aria-hidden','true');dashboard.hidden=false;dashboard.setAttribute('aria-hidden','false');renderHeader();
  const meta=currentUser.user_metadata||{},saved=(()=>{try{return JSON.parse(localStorage.getItem('ep-customer-profile')||'{}')}catch{return {}}})();
  const addr=currentProfile?.address||meta.address||saved.address||{};
  $('#profileName').value=currentProfile?.nome||meta.nome||saved.name||'';$('#profilePhone').value=maskPhone(currentProfile?.telefone||meta.telefone||saved.phone||'');$('#profileEmail').value=currentUser.email||'';
  $('#profileCpf').value=maskCpf(currentProfile?.cpf||meta.cpf||saved.cpf||'');$('#profileBirthDate').value=birthDateToBr(currentProfile?.birth_date||meta.birth_date||saved.birth_date||'');
  $('#profileCep').value=maskCep(addr.cep||'');$('#profileStreet').value=addr.street||'';$('#profileNumber').value=addr.number||'';$('#profileComplement').value=addr.complement||'';$('#profileNeighborhood').value=addr.neighborhood||'';$('#profileCity').value=addr.city||'';$('#profileState').value=addr.state||'';
  $('#clientPoints').textContent=Number(currentProfile?.pontos||0).toLocaleString('pt-BR');
  $('#rewardsPoints').textContent=`${Number(currentProfile?.pontos||0).toLocaleString('pt-BR')} pts`;

  const [{data:movs},ordersResult]=await Promise.all([
    db.from('movimentacoes_pontos').select('id,tipo,pontos,descricao,criado_em').order('criado_em',{ascending:false}).limit(30),
    apiFidelidade('/fidelidade/meus-pedidos').catch(async e=>{
      console.warn('Histórico detalhado via Worker indisponível, usando histórico básico.',e);
      const {data}=await db.from('pedidos_fidelidade').select('id,numero_pedido,valor_total,status,pontos_gerados,pontos_utilizados,criado_em').order('criado_em',{ascending:false}).limit(30);
      return {pedidos:data||[]};
    })
  ]);
  const orderList=ordersResult?.pedidos||[];
  $('#clientOrdersCount').textContent=orderList.length;
  $('#clientSpent').textContent=fmt(orderList.reduce((s,o)=>s+Number(o.total??o.valor_total??0),0));
  $('#pointsHistory').innerHTML=(movs||[]).length?(movs||[]).map(m=>`<article class="client-order-card movement"><div><strong>${m.tipo==='debito'?'-':'+'}${Number(m.pontos).toLocaleString('pt-BR')} pontos</strong><small>${esc(m.descricao||'Movimentação de fidelidade')}</small></div><time>${new Date(m.criado_em).toLocaleDateString('pt-BR')}</time></article>`).join(''):empty('Você ainda não possui movimentações de pontos.');
  $('#clientOrders').innerHTML=orderList.length?orderList.map(renderOrderCard).join(''):renderLocalOrders();
  await loadRewards();
}
function renderLocalOrders(){let list=[];try{list=JSON.parse(localStorage.getItem('ep-customer-orders')||'[]')}catch{}if(!list.length)return empty('Nenhum pedido vinculado ainda.',true);return `<div class="local-note">Pedidos feitos neste aparelho antes da vinculação:</div>`+list.slice(0,10).map(o=>`<article class="client-order-card"><div class="order-card-top"><div><strong>${esc(o.order_id||'Pedido')}</strong><small>Histórico local</small></div></div><div class="order-card-bottom"><strong>${fmt(o.estimated_total||0)}</strong><small>Aguardando vinculação</small></div></article>`).join('')}


$('#rewardsSearch')?.addEventListener('input',renderRewards);
$('#rewardsGrid')?.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-redeem-product]');
  if(!btn||btn.disabled)return;
  const product=btn.dataset.redeemProduct;
  const reward=rewardsCatalog.find(p=>p.name===product);
  if(!reward)return;
  const pontos=Number(reward.points||0);
  if(Number(currentProfile?.pontos||0)<pontos)return toast('Você ainda não possui pontos suficientes.');
  const ok=window.confirm(`Confirmar resgate de ${product} por ${pontos.toLocaleString('pt-BR')} pontos?\n\nO produto será preparado para retirada no Espetinho Perus.`);
  if(!ok)return;
  const original=btn.textContent;btn.disabled=true;btn.textContent='Resgatando...';
  try{
    const result=await apiFidelidade('/fidelidade/resgatar',{
      method:'POST',
      body:JSON.stringify({product_name:product,request_id:crypto.randomUUID()})
    });
    toast(`Resgate confirmado: ${product}`);
    if(result.tracking_token) localStorage.setItem('ep-last-order-token',result.tracking_token);
    await loadSession();
    showClientTab('ordersPanel');
  }catch(err){
    toast(err.message||'Não foi possível concluir o resgate.');
    btn.disabled=false;btn.textContent=original;
  }
});

async function loadSession(){const session=await getPersistentSession();if(!session){renderLoggedOut();return}currentUser=session.user;let {data:profile}=await db.from('clientes').select('id,nome,telefone,email,pontos,ativo').eq('id',currentUser.id).maybeSingle();if(!profile){await new Promise(r=>setTimeout(r,500));({data:profile}=await db.from('clientes').select('id,nome,telefone,email,pontos,ativo').eq('id',currentUser.id).maybeSingle())}const meta=currentUser.user_metadata||{};currentProfile={...(profile||{id:currentUser.id,nome:meta.nome||meta.full_name||meta.name||'Cliente',telefone:meta.telefone||'',email:currentUser.email,pontos:0}),cpf:meta.cpf||'',birth_date:meta.birth_date||'',address:meta.address||{}};localStorage.setItem('ep-customer-profile',JSON.stringify({name:currentProfile.nome,phone:currentProfile.telefone,email:currentUser.email,cpf:currentProfile.cpf,birth_date:currentProfile.birth_date,address:currentProfile.address}));localStorage.setItem('ep-loyalty-user-id',currentUser.id);await loadDashboard()}

db.auth.onAuthStateChange((_event,session)=>{if(session)saveSessionBackup(session);else localStorage.removeItem('ep-loyalty-user-id')});
loadSession();
