(()=>{
 const form=document.getElementById('deliveryZonesForm'),rows=document.getElementById('deliveryZonesRows'),message=document.getElementById('deliveryZonesMessage'),load=document.getElementById('loadDeliveryZones');
 let zones=[];
 function render(data){
  zones=data;rows.replaceChildren();
  for(const zone of zones){
   const card=document.createElement('fieldset');card.className='studio-card';card.dataset.zone=zone.id;
   const title=document.createElement('legend');title.textContent=zone.name;card.append(title);
   const feeLabel=document.createElement('label');feeLabel.textContent='Frete (R$) ';const fee=document.createElement('input');fee.type='number';fee.min='0';fee.max='200';fee.step='0.01';fee.required=true;fee.value=zone.fee;fee.dataset.fee='';feeLabel.append(fee);card.append(feeLabel);
   const activeLabel=document.createElement('label');const active=document.createElement('input');active.type='checkbox';active.checked=zone.active;active.dataset.active='';activeLabel.append(active,document.createTextNode(' Entregas ativas'));card.append(activeLabel);
   const cepLabel=document.createElement('label');cepLabel.textContent='CEPs adicionais ou faixas — um por linha';const ceps=document.createElement('textarea');ceps.rows=3;ceps.value=zone.ceps.join('\n');ceps.dataset.ceps='';cepLabel.append(ceps);card.append(cepLabel);
   const hint=document.createElement('p');hint.textContent='Exemplos: 05186 (prefixo), 05186000 (CEP) ou 05186000-05186999 (faixa). '+(zone.neighborhoods.length?'Também atendemos os CEPs cujo bairro consultado seja: '+zone.neighborhoods.join(', ')+'.':'');card.append(hint);rows.append(card);
  }
  form.hidden=false;
 }
 load.onclick=async()=>{load.disabled=true;message.textContent='Carregando...';try{const d=await api('/admin/delivery-zones');render(d.zones);message.textContent='Tabela carregada.';}catch(e){message.textContent=e.message;}finally{load.disabled=false;}};
 form.onsubmit=async event=>{
  event.preventDefault();const button=form.querySelector('button[type=submit]');button.disabled=true;
  try{
   const changed=zones.map(z=>{const card=rows.querySelector(`[data-zone="${z.id}"]`);return {...z,fee:Number(card.querySelector('[data-fee]').value),active:card.querySelector('[data-active]').checked,ceps:card.querySelector('[data-ceps]').value.split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean)};});
   const d=await api('/admin/delivery-zones',{method:'POST',body:JSON.stringify({zones:changed})});render(d.zones);message.textContent='Fretes salvos. Alterações podem levar cerca de um minuto para aparecer em outras regiões.';
  }catch(e){message.textContent=e.message;}finally{button.disabled=false;}
 };
})();
