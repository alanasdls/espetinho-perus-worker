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

(()=>{
 const menu=document.querySelector('.panel-menu'),nav=menu.querySelector('.tabs'),actions=menu.querySelector('.top-actions');
 const paths={orders:'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4',chart:'M4 20V10h4v10 M10 20V4h4v16 M16 20v-8h4v8',trend:'M3 18l6-7 4 3 8-10 M15 4h6v6',box:'M3 7l9-5 9 5v10l-9 5-9-5z M3 7l9 5 9-5 M12 12v10',image:'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M7 7h1',card:'M2 5h20v14H2z M2 9h20 M5 15h5',settings:'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2 2 M16.4 16.4l2 2 M5.6 18.4l2-2 M16.4 7.6l2-2 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',users:'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3a8 8 0 0 1 16 0v3',truck:'M2 5h12v12H2z M14 9h5l3 4v4h-8 M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0 M20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0'};
 const icon=key=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[key]||paths.settings}"/></svg>`;
 const groups=[['Operação',[['ordersTab','Pedidos','orders']]],['Gestão',[['financeTab','Visão geral','chart'],['performanceTab','Desempenho','trend'],['catalogTab','Produtos','box'],['paymentsTab','Pagamentos','card']]],['Configurações',[['mediaTab','Imagens','image'],['appearanceTab','Aparência','image'],['settingsTab','Configurações','settings'],['securityTab','Acessos','users']]]];
 for(const [title,items] of groups){const group=document.createElement('div');group.className='menu-group';const heading=document.createElement('h3');heading.textContent=title;group.append(heading);for(const [id,label,key] of items){const button=nav.querySelector(`[data-tab="${id}"]`);button.innerHTML=icon(key)+`<span>${label}</span>`;group.append(button);}nav.append(group);}
 const delivery=actions.querySelector('a[href="painel/"]');delivery.innerHTML=icon('truck')+'<span>Delivery</span>';nav.querySelector('.menu-group').append(delivery);
 const management=actions.querySelector('a[href="gestao.html"]');management.innerHTML=icon('chart')+'<span>Gestão avançada</span>';management.dataset.adminOnly='';nav.querySelectorAll('.menu-group')[1].append(management);
 const close=document.createElement('button');close.type='button';close.className='menu-close';close.textContent='Fechar menu ×';close.onclick=()=>{menu.open=false;menu.querySelector('summary').focus();};actions.prepend(close);
 const panel=document.getElementById('panel'),identity=document.getElementById('staffIdentity');
 const sync=()=>{identity.hidden=panel.hidden;nav.querySelectorAll('.menu-group').forEach(group=>{const hidden=![...group.querySelectorAll('button,a')].some(el=>!el.hidden);if(group.hidden!==hidden)group.hidden=hidden;});};
 new MutationObserver(sync).observe(nav,{attributes:true,subtree:true,attributeFilter:['hidden']});new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['hidden']});sync();
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false;}));
})();
