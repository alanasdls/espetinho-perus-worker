(()=>{
 const input=document.getElementById('uberOrderId'),message=document.getElementById('uberMessage'),quoteButton=document.getElementById('uberQuote'),dispatch=document.getElementById('uberDispatch'),status=document.getElementById('uberStatus'),tracking=document.getElementById('uberTracking');
 let current=null,busy=false;
 const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 input.oninput=()=>{current=null;dispatch.hidden=true;tracking.hidden=true;message.textContent='';};
 async function run(action){
  if(busy)return;const id=input.value.trim();if(!/^[A-Za-z0-9_-]{1,64}$/.test(id)){message.textContent='Informe o número completo do pedido.';return;}
  if(action==='dispatch'&&(!current||!confirm(`Solicitar entrega Uber por ${money(current.fee/100)}? Esse custo é cobrado do restaurante.`)))return;
  busy=true;[input,quoteButton,dispatch,status].forEach(e=>e.disabled=true);message.textContent='Consultando Uber...';tracking.hidden=true;
  try{
   const d=await api(`/admin/uber/orders/${encodeURIComponent(id)}/${action}`,{method:'POST',body:JSON.stringify(action==='dispatch'?{quote_id:current.id,confirm_fee:current.fee}:{})});
   if(d.quote){current=d.quote;dispatch.hidden=false;message.textContent=`${d.mode==='test'?'TESTE — use credenciais de teste. ':''}Uber: ${money(current.fee/100)}. Frete do cliente: ${money(current.customer_fee)}. Retirada: ${current.pickup_address}. Destino: ${current.dropoff_address}. Validade: ${new Date(current.expires).toLocaleTimeString('pt-BR')}. Confira os endereços antes de confirmar.`;}
   else if(d.delivery){dispatch.hidden=true;message.textContent=`Entrega ${d.delivery.id}: ${d.delivery.status}${d.delivery.live_mode===false?' (teste)':''}.`;if(d.delivery.tracking_url?.startsWith('https://')){tracking.href=d.delivery.tracking_url;tracking.hidden=false;}}
   else message.textContent=d.pending?'Solicitação pendente. Confira o painel Uber antes de outra ação.':'Nenhuma entrega Uber solicitada para este pedido.';
  }catch(e){message.textContent=e.message;}finally{busy=false;[input,quoteButton,dispatch,status].forEach(e=>e.disabled=false);}
 }
 quoteButton.onclick=()=>run('quote');dispatch.onclick=()=>run('dispatch');status.onclick=()=>run('status');
})();
