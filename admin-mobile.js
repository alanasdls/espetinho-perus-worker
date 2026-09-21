(()=>{
 const dialog=document.getElementById('uberDialog');
 document.getElementById('uberOrderId').readOnly=true;
 document.getElementById('closeUber').onclick=()=>dialog.close();
 document.getElementById('orders').addEventListener('click',async e=>{
  const uber=e.target.closest('.order-uber');if(uber){window.openOrderUber(uber.dataset.orderId);return;}
  const copy=e.target.closest('.copy-order');if(copy){try{await navigator.clipboard.writeText(copy.dataset.orderId);copy.textContent='Copiado';}catch{copy.textContent='Selecione o código acima';}}
 });
 const menu=document.querySelector('.panel-menu'),nav=menu.querySelector('.tabs'),panel=document.getElementById('panel');
 const syncMenu=()=>{nav.hidden=panel.hidden;};syncMenu();
 new MutationObserver(syncMenu).observe(panel,{attributes:true,attributeFilter:['hidden']});
 nav.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{menu.open=false;document.querySelector('.order-view h2').textContent='Pedidos';}));
 document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 menu.querySelectorAll('.top-actions>a,.top-actions>button').forEach(el=>el.addEventListener('click',()=>{menu.open=false;}));
 document.getElementById('toggleOrderView').onclick=e=>{const board=document.body.classList.toggle('board-view');e.target.textContent=board?'Ver lista':'Ver quadro';};
})();
