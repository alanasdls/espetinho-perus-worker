(()=>{
 const dialog=document.getElementById('uberDialog');
 document.getElementById('uberOrderId').readOnly=true;
 document.getElementById('closeUber').onclick=()=>dialog.close();
 document.getElementById('orders').addEventListener('click',async e=>{
  const uber=e.target.closest('.order-uber');if(uber){window.openOrderUber(uber.dataset.orderId);return;}
  const copy=e.target.closest('.copy-order');if(copy){try{await navigator.clipboard.writeText(copy.dataset.orderId);copy.textContent='Copiado';}catch{copy.textContent='Selecione o código acima';}}
 });
 document.querySelectorAll('.section-menu .tab').forEach(b=>b.addEventListener('click',()=>{document.querySelector('.section-menu').open=false;document.querySelector('.section-menu>summary').textContent=b.textContent.trim()+' · Seções';}));
 document.querySelector('.section-menu>summary').textContent='Pedidos · Seções';
 document.getElementById('toggleOrderView').onclick=e=>{const board=document.body.classList.toggle('board-view');e.target.textContent=board?'Ver lista':'Ver quadro';};
})();
