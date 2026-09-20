(function(){
  const root=document.getElementById('cartOverlay');
  const details=document.getElementById('customerDetails');
  const summary=document.getElementById('customerSummary');
  const pix=document.getElementById('mercadoPagoCheckout');
  if(!root||!details)return;
  let initialized=false;
  const value=id=>document.getElementById(id)?.value.trim()||'';
  function syncCustomer(){
    const name=value('customerName'),email=value('customerEmail'),phone=value('customerPhone');
    const maskedEmail=email.replace(/^(.{1,4})[^@]*@/,'$1***@');
    const digits=phone.replace(/\D/g,'');
    const maskedPhone=digits.length>=10?`(${digits.slice(0,2)}) *****-${digits.slice(-4)}`:phone;
    summary.textContent=[name,maskedEmail,maskedPhone].filter(Boolean).join('\n')||'Preencha seus dados para finalizar';
    if(!initialized&&name&&email&&phone){details.open=false;initialized=true;}
  }
  details.querySelector('summary').addEventListener('click',()=>{initialized=true;});
  ['customerName','customerEmail','customerPhone','customerCpf'].forEach(id=>document.getElementById(id)?.addEventListener('input',syncCustomer));
  const choice=root.querySelector('.fulfillment-only');
  const note=document.createElement('p');note.className='cart-fulfillment-note';choice?.appendChild(note);
  window.epUpdateCartDesign=function(total){
    syncCustomer();
    const delivery=value('fulfillment')==='Entrega';
    note.textContent=delivery?'Entrega em Perus • Frete de R$ 10,00':'Retirada no Espetinho Perus • Sem frete';
    if(pix&&!/Gerando|Abrindo|Confirmando/.test(pix.textContent)){
      const hasRewards=typeof cart!=='undefined'&&Object.keys(cart).some(id=>products[id]?.reward);
      const security=document.getElementById('pixSecurity');if(security)security.textContent=Number(total)===0&&hasRewards?'Resgate com pontos • Sem cobrança':'Pagamento seguro via Pix.';
      pix.textContent=Number(total)===0&&hasRewards?'Confirmar resgate':`Pagar ${Number(total).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} com Pix`;
    }
  };
  const refresh=()=>{
    const raw=document.getElementById('cartTotal')?.textContent||'0';
    window.epUpdateCartDesign(Number(raw.replace(/[^\d,]/g,'').replace(',','.')));
  };
  new MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['class']});
  const loyalty=document.getElementById('loyaltyCartStatus');
  if(loyalty)new MutationObserver(syncCustomer).observe(loyalty,{childList:true,characterData:true,subtree:true});
  root.addEventListener('error',event=>{if(event.target.matches?.('.cart-item-photo')&&!event.target.dataset.fallback){event.target.dataset.fallback='1';event.target.src='logo-premium.png';}},true);
  refresh();
})();
