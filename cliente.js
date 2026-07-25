
const API='https://summer-field-09b7.alanasdls.workers.dev';
const $=s=>document.querySelector(s);
const fmt=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const phoneDigits=v=>String(v||'').replace(/\D/g,'');
const orderLabels={
  aguardando_pagamento:'Aguardando pagamento',
  recebido:'Pedido recebido',
  em_preparo:'Em preparo',
  pronto_retirada:'Pronto para retirada',
  saiu_entrega:'Saiu para entrega',
  finalizado:'Finalizado',
  cancelado:'Cancelado'
};

let currentPhone=localStorage.getItem('ep-client-session')||'';
let statusCache={};

function loadJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}
}
function saveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function toast(message){
  const el=$('#clientToast');el.textContent=message;el.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200)
}
function maskPhone(value){
  const d=phoneDigits(value).slice(0,11);
  if(d.length<=2)return d;
  if(d.length<=6)return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
function maskCpf(value){
  const d=String(value||'').replace(/\D/g,'').slice(0,11);
  return d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')
}
function maskCep(value){
  const d=String(value||'').replace(/\D/g,'').slice(0,8);
  return d.replace(/(\d{5})(\d)/,'$1-$2')
}
function getOrders(){
  const orders=loadJson('ep-customer-orders',[]);
  return orders
    .filter(order=>!currentPhone||phoneDigits(order.customer?.phone)===currentPhone)
    .sort((a,b)=>Number(b.created_at||0)-Number(a.created_at||0))
}
function getProfile(){return loadJson('ep-customer-profile',{})}
function setSession(phone){
  currentPhone=phoneDigits(phone);
  localStorage.setItem('ep-client-session',currentPhone);
  renderAccess()
}
function renderAccess(){
  const logged=Boolean(currentPhone);
  $('#clientAccess').hidden=logged;
  $('#clientDashboard').hidden=!logged;
  if(!logged){
    $('#clientGreeting').textContent='Bem-vindo!';
    $('#clientAvatar').textContent='EP';
    return
  }
  const profile=getProfile();
  const name=profile.name||getOrders()[0]?.customer?.name||'Cliente';
  $('#clientGreeting').textContent=`Olá, ${name.split(' ')[0]}!`;
  $('#clientAvatar').textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'EP';
  fillForms(profile);
  renderDashboard()
}
function fillForms(profile){
  $('#profileName').value=profile.name||'';
  $('#profilePhone').value=maskPhone(profile.phone||currentPhone);
  $('#profileEmail').value=profile.email||'';
  $('#profileCpf').value=maskCpf(profile.cpf||'');
  const a=profile.address||{};
  $('#savedCep').value=a.cep||'';
  $('#savedStreet').value=a.street||'';
  $('#savedNumber').value=a.number||'';
  $('#savedNeighborhood').value=a.neighborhood||'';
  $('#savedComplement').value=a.complement||'';
  $('#savedReference').value=a.reference||''
}
async function loadOrderStatus(order){
  if(!order.tracking_token)return null;
  try{
    const r=await fetch(`${API}/pedido-status?token=${encodeURIComponent(order.tracking_token)}`,{cache:'no-store'});
    const d=await r.json();
    if(r.ok&&d.pedido){statusCache[order.order_id]=d.pedido;return d.pedido}
  }catch(_){}
  return null
}
async function refreshStatuses(orders){
  await Promise.all(orders.slice(0,10).map(loadOrderStatus));
  renderOrders(orders)
}
function renderDashboard(){
  const orders=getOrders();
  const profile=getProfile();
  $('#clientOrdersCount').textContent=orders.length;
  $('#clientSpent').textContent=fmt(orders.reduce((s,o)=>s+Number(o.total||o.estimated_total||0),0));
  $('#clientFavoritesCount').textContent=loadJson('ep-favorites',[]).length;
  if(orders[0]){
    $('#clientLastOrder').textContent=orders[0].order_id||'Pedido';
    $('#clientLastOrderDate').textContent=new Date(orders[0].created_at||Date.now()).toLocaleDateString('pt-BR')
  }else{
    $('#clientLastOrder').textContent='—';$('#clientLastOrderDate').textContent='sem pedidos'
  }
  renderOrders(orders);
  renderFavorites();
  refreshStatuses(orders)
}
function renderOrders(orders){
  const box=$('#clientOrders');
  if(!orders.length){
    box.innerHTML='<div class="empty-client">Nenhum pedido salvo neste aparelho.<br><a href="index.html#cardapio">Fazer meu primeiro pedido</a></div>';
    return
  }
  box.innerHTML=orders.map(order=>{
    const live=statusCache[order.order_id];
    const status=live?.order_status||order.order_status||order.payment_status||'aguardando_pagamento';
    const total=live?.total||order.total||order.estimated_total||0;
    const items=live?.items||order.items||[];
    const token=order.tracking_token||live?.tracking_token||'';
    return `<article class="client-order-card">
      <div class="order-card-top">
        <div><strong>${esc(order.order_id||'Pedido')}</strong><small>${new Date(order.created_at||Date.now()).toLocaleString('pt-BR')}</small></div>
        <span class="order-status">${esc(orderLabels[status]||status)}</span>
      </div>
      <div class="order-items">${items.map(i=>`<p>${Number(i.quantity||1)}x ${esc(i.name||'Item')}</p>`).join('')||'<p>Itens não disponíveis neste histórico.</p>'}</div>
      <div class="order-card-bottom">
        <strong>${fmt(total)}</strong>
        <div class="order-buttons">
          ${token?`<a href="pedido.html?token=${encodeURIComponent(token)}">Acompanhar</a>`:''}
          <button type="button" data-repeat-order="${esc(order.order_id)}">Pedir novamente</button>
        </div>
      </div>
    </article>`
  }).join('')
}
function renderFavorites(){
  const count=loadJson('ep-favorites',[]).length;
  $('#clientFavorites').innerHTML=count
    ? `<strong>${count} ${count===1?'produto favorito':'produtos favoritos'}</strong><p>Seus favoritos continuam marcados no cardápio deste aparelho.</p><a href="index.html#cardapio">Abrir meus favoritos no cardápio</a>`
    : '<p>Você ainda não marcou produtos como favoritos.</p><a href="index.html#cardapio">Explorar cardápio</a>'
}
function repeatOrder(orderId){
  const order=getOrders().find(o=>o.order_id===orderId);
  if(!order)return;
  saveJson('ep-repeat-items',(order.items||[]).map(i=>({name:i.name,quantity:Number(i.quantity||1)})));
  location.href='index.html#cardapio'
}
$('#clientLoginPhone').addEventListener('input',e=>e.target.value=maskPhone(e.target.value));
$('#profilePhone').addEventListener('input',e=>e.target.value=maskPhone(e.target.value));
$('#profileCpf').addEventListener('input',e=>e.target.value=maskCpf(e.target.value));
$('#savedCep').addEventListener('input',e=>e.target.value=maskCep(e.target.value));
$('#clientLoginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const phone=phoneDigits($('#clientLoginPhone').value);
  if(phone.length<10)return toast('Informe um telefone válido.');
  const profile=getProfile();
  if(!profile.phone)saveJson('ep-customer-profile',{...profile,phone});
  setSession(phone);toast('Conta aberta neste aparelho.')
});
$('#clientProfileForm').addEventListener('submit',e=>{
  e.preventDefault();
  const old=getProfile();
  const profile={...old,
    name:$('#profileName').value.trim(),
    phone:phoneDigits($('#profilePhone').value),
    email:$('#profileEmail').value.trim(),
    cpf:String($('#profileCpf').value).replace(/\D/g,'')
  };
  saveJson('ep-customer-profile',profile);
  if(profile.phone)setSession(profile.phone);
  toast('Dados salvos.')
});
$('#clientAddressForm').addEventListener('submit',e=>{
  e.preventDefault();
  const profile=getProfile();
  profile.address={
    cep:$('#savedCep').value.trim(),street:$('#savedStreet').value.trim(),
    number:$('#savedNumber').value.trim(),neighborhood:$('#savedNeighborhood').value.trim(),
    complement:$('#savedComplement').value.trim(),reference:$('#savedReference').value.trim()
  };
  saveJson('ep-customer-profile',profile);toast('Endereço salvo.')
});
document.addEventListener('click',e=>{
  const tab=e.target.closest('[data-client-tab]');
  if(tab){
    document.querySelectorAll('[data-client-tab]').forEach(x=>x.classList.toggle('active',x===tab));
    document.querySelectorAll('.client-panel').forEach(x=>x.classList.toggle('active',x.id===tab.dataset.clientTab))
  }
  const repeat=e.target.closest('[data-repeat-order]');
  if(repeat)repeatOrder(repeat.dataset.repeatOrder)
});
$('#clientLogout').onclick=()=>{localStorage.removeItem('ep-client-session');currentPhone='';renderAccess();toast('Você saiu da conta.')};
$('#clearClientData').onclick=()=>{
  if(!confirm('Apagar perfil, endereço e histórico salvo neste aparelho?'))return;
  ['ep-client-session','ep-customer-profile','ep-customer-orders','ep-last-order','ep-last-tracking-token'].forEach(k=>localStorage.removeItem(k));
  currentPhone='';statusCache={};renderAccess();toast('Dados apagados.')
};
renderAccess();
setInterval(()=>{if(currentPhone)refreshStatuses(getOrders())},15000);
