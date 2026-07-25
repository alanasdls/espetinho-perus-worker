
const API='https://summer-field-09b7.alanasdls.workers.dev';
let key=localStorage.getItem('ep-admin-key')||'',orders=[],loading=false;
let realtimeSocket=null,reconnectTimer=null,fallbackTimer=null;
const $=s=>document.querySelector(s);
const fmt=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function headers(){return {'X-Admin-Key':key,'Content-Type':'application/json'}}
async function api(path,opt={}){const r=await fetch(API+path,{...opt,headers:{...headers(),...(opt.headers||{})},cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.erro||`HTTP ${r.status}`);return d}
function startFallback(){clearInterval(fallbackTimer);fallbackTimer=setInterval(()=>{if(document.visibilityState==='visible')load()},60000)}
function connectRealtime(){
  clearTimeout(reconnectTimer);
  if(!key||document.visibilityState==='hidden')return;
  if(realtimeSocket&&[WebSocket.OPEN,WebSocket.CONNECTING].includes(realtimeSocket.readyState))return;
  const wsUrl=API.replace(/^http/,'ws')+'/admin/realtime?key='+encodeURIComponent(key);
  realtimeSocket=new WebSocket(wsUrl);
  realtimeSocket.onopen=()=>{clearInterval(fallbackTimer);$('#kitchenConnection').textContent='ONLINE • WebSocket';};
  realtimeSocket.onmessage=e=>{if(e.data==='pong')return;load();};
  realtimeSocket.onerror=()=>{try{realtimeSocket.close()}catch(_){}};
  realtimeSocket.onclose=()=>{realtimeSocket=null;$('#kitchenConnection').textContent='RECONECTANDO • modo econômico';startFallback();reconnectTimer=setTimeout(connectRealtime,5000);};
}

function elapsed(o){const m=Math.max(0,Math.floor((Date.now()-new Date(o.created_at).getTime())/60000));return {m,c:m>=20?'late':m>=10?'warn':'ok'}}
function next(s){return ({recebido:'em_preparo',em_preparo:'pronto_retirada',pronto_retirada:'saiu_entrega'})[s]||''}
const labels={em_preparo:'Iniciar preparo',pronto_retirada:'Marcar como pronto',saiu_entrega:'Saiu para entrega'};
function orderCard(o){const e=elapsed(o),n=next(o.order_status);return `<article class="kitchen-order ${e.c}" data-id="${esc(o.order_id)}">
<header><strong>${esc(o.order_id)}</strong><b>${e.m} min</b></header><h3>${esc(o.customer?.name||'Cliente')}</h3>
${(o.items||[]).map(i=>`<p><b>${Number(i.quantity||1)}x</b> ${esc(i.name)}</p>`).join('')}
<footer><strong>${fmt(o.total)}</strong>${n?`<button data-status="${n}">${labels[n]}</button>`:''}</footer></article>`}
function render(){const active=orders.filter(o=>o.payment_status==='approved');const groups=[['recebido','new','Novos'],['em_preparo','preparing','Em preparo'],['pronto_retirada','ready','Prontos']];
$('#kitchenBoard').innerHTML=groups.map(([s,c,t])=>{const list=active.filter(o=>o.order_status===s).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));return `<section class="kitchen-column ${c}"><h2>${t} • ${list.length}</h2><div class="kitchen-body">${list.map(orderCard).join('')||'Nenhum pedido'}</div></section>`}).join('');
$('#kNew').textContent=active.filter(o=>o.order_status==='recebido').length;$('#kPreparing').textContent=active.filter(o=>o.order_status==='em_preparo').length;$('#kReady').textContent=active.filter(o=>o.order_status==='pronto_retirada').length;
const open=active.filter(o=>!['finalizado','cancelado'].includes(o.order_status));$('#kAverage').textContent=`${open.length?Math.round(open.reduce((s,o)=>s+elapsed(o).m,0)/open.length):0} min`}
async function load(){if(loading||!key)return;loading=true;try{orders=(await api('/admin/orders')).pedidos||[];$('#kitchenConnection').textContent='ONLINE • tempo real';render()}catch(e){$('#kitchenConnection').textContent='OFFLINE • tentando novamente'}finally{loading=false}}
$('#kitchenBoard').onclick=async e=>{const b=e.target.closest('button[data-status]');if(!b)return;const card=b.closest('.kitchen-order');b.disabled=true;try{await api('/admin/orders/'+encodeURIComponent(card.dataset.id),{method:'PATCH',body:JSON.stringify({order_status:b.dataset.status,estimated_minutes:25})});await load()}catch(err){alert(err.message);b.disabled=false}};
$('#kitchenLoginForm').onsubmit=async e=>{e.preventDefault();key=$('#kitchenKey').value.trim();try{await api('/admin/orders');localStorage.setItem('ep-admin-key',key);$('#kitchenLogin').hidden=true;await load();connectRealtime()}catch(err){alert('Senha inválida')}};
if(!key)$('#kitchenLogin').hidden=false;else load().then(connectRealtime);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){load();connectRealtime()}else if(realtimeSocket){realtimeSocket.close(1000,'painel oculto')}});
startFallback();setInterval(()=>{$('#kitchenClock').textContent=new Date().toLocaleTimeString('pt-BR');render()},30000);
