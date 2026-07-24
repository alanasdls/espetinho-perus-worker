const API = 'https://summer-field-09b7.alanasdls.workers.dev';
const token = new URLSearchParams(location.search).get('token') || localStorage.getItem('ep-last-tracking-token') || '';
const $ = (s) => document.querySelector(s);
const labels = {
  aguardando_pagamento:['⏳','Aguardando pagamento','Assim que o Pix for aprovado, o pedido será recebido.'],
  recebido:['✅','Pedido recebido','Pagamento confirmado. Seu pedido já está com nossa equipe.'],
  em_preparo:['👨‍🍳','Em preparo','Estamos preparando tudo com cuidado.'],
  pronto_retirada:['🍢','Pronto para retirada','Seu pedido está pronto. Pode vir retirar!'],
  saiu_entrega:['🛵','Saiu para entrega','Seu pedido está a caminho.'],
  finalizado:['🎉','Pedido finalizado','Obrigado por pedir no Espetinho Perus!'],
  cancelado:['❌','Pedido cancelado','Entre em contato conosco para mais informações.']
};
const steps=['recebido','em_preparo','pronto_retirada','saiu_entrega','finalizado'];

function b64(s){
  const p='='.repeat((4-s.length%4)%4);
  return Uint8Array.from(atob((s+p).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
}
async function load(){
  if(!token){showError('Link do pedido inválido.');return;}
  try{
    const r=await fetch(`${API}/pedido-status?token=${encodeURIComponent(token)}`,{cache:'no-store'});
    const d=await r.json();
    if(!r.ok) throw new Error(d.erro||'Pedido não encontrado.');
    render(d.pedido);
  }catch(e){showError(e.message);}
}
function showError(t){$('#content').hidden=true;$('#error').hidden=false;$('#error').textContent=t;}
function render(p){
  $('#error').hidden=true;$('#content').hidden=false;
  $('#orderNumber').textContent=`Pedido ${p.order_id}`;
  const info=labels[p.order_status]||['📦',p.order_status,'Acompanhe as atualizações.'];
  $('#statusIcon').textContent=info[0];$('#statusTitle').textContent=info[1];$('#statusText').textContent=info[2];
  $('#estimate').textContent=p.order_status==='finalizado'?'Concluído':`${p.estimated_minutes||25} minutos`;
  let i=steps.indexOf(p.order_status);if(p.order_status==='recebido')i=0;if(p.order_status==='cancelado')i=0;
  $('#progressBar').style.width=`${p.order_status==='finalizado'?100:Math.max(12,(i+1)/steps.length*100)}%`;
  $('#steps').innerHTML=steps.map((s,n)=>`<div class="step ${n<i?'done':n===i?'current':''}"><span class="dot">${labels[s][0]}</span><div><b>${labels[s][1]}</b></div></div>`).join('');
  $('#items').innerHTML=(p.items||[]).map(x=>`<div class="item"><span>${x.quantity}x ${x.name}</span><b>${Number(x.subtotal||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</b></div>`).join('');
  $('#total').textContent=Number(p.total||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  $('#fulfillment').textContent=p.customer?.fulfillment?`📦 ${p.customer.fulfillment}`:'';
  $('#address').textContent=p.customer?.address?`📍 ${p.customer.address}`:'';
}
async function enablePush(){
  const btn=$('#notifyBtn'),info=$('#notifyInfo');
  try{
    if(!window.isSecureContext) throw new Error('As notificações precisam ser ativadas pelo endereço HTTPS do site.');
    if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)) throw new Error('Este navegador não oferece notificações Web Push.');
    btn.disabled=true; info.textContent='Ativando notificações…';
    const permission=await Notification.requestPermission();
    if(permission!=='granted') throw new Error('A permissão não foi concedida. Abra as configurações do navegador e permita notificações para este site.');
    const reg=await navigator.serviceWorker.register('./sw.js?v=20260724-v3',{scope:'./'});
    await navigator.serviceWorker.ready;
    const keyResponse=await fetch(`${API}/vapid-public-key`,{cache:'no-store'});
    const keyData=await keyResponse.json();
    if(!keyResponse.ok||!keyData.publicKey) throw new Error('As chaves de notificação não estão configuradas no Worker.');
    // Remove assinaturas antigas, inclusive as criadas com outra chave VAPID.
    const oldSub=await reg.pushManager.getSubscription();
    if(oldSub) await oldSub.unsubscribe().catch(()=>{});
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(keyData.publicKey)});
    const r=await fetch(`${API}/pedido-subscribe`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,subscription:sub.toJSON(),test:true})});
    const result=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(result.erro||result.detalhes||'Não foi possível registrar a notificação.');
    btn.textContent='🔔 Notificações ativadas';
    info.textContent=result.test_sent?'Uma notificação de teste foi enviada. Você receberá as próximas atualizações.':'Notificações ativadas. Você receberá as próximas atualizações.';
  }catch(e){
    info.textContent=e.message;
    btn.disabled=false;
    btn.textContent='🔔 Ativar notificações';
  }
}
$('#notifyBtn').onclick=enablePush;
load();setInterval(load,5000);
