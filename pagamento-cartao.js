(() => {
  'use strict';
  const api='https://api.espetinhoperus.com.br';
  const params=new URLSearchParams(location.hash.slice(1));
  const pendingKey='ep-asaas-pending-v1';
  let pending;try{pending=JSON.parse(localStorage.getItem(pendingKey)||'null');}catch{}
  const orderId=params.get('order_id')||pending?.order_id;
  const token=params.get('token')||pending?.tracking_token;
  const $=id=>document.getElementById(id),form=$('cardForm'),message=$('message');
  let busy=false,loaded=false,polls=0,timer;
  const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function say(text,type=''){message.textContent=text;message.className=type;}
  function clearSensitive(){['cardNumber','ccv','expiry','holderName'].forEach(id=>$(id).value='');}
  const digits=value=>String(value||'').replace(/\D/g,'');
  const formatCpf=value=>digits(value).slice(0,11).replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3}\.\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  const formatCep=value=>digits(value).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');
  function formatPhone(value){
    const d=digits(value);
    if(d.length===10||d.length===11)return d.replace(/^(\d{2})(\d{4,5})(\d{4})$/,'($1) $2-$3');
    return String(value||'');
  }
  function syncSummaries(){
    $('holderSummary').textContent=$('name').value.trim()||'Preencha os dados do titular';
    $('holderContact').textContent=$('email').value.trim().replace(/^(.{1,4})[^@]*@/,'$1***@');
    $('billingSummary').textContent=[$('postalCode').value?'CEP '+$('postalCode').value:'',$('addressNumber').value?'Nº '+$('addressNumber').value:''].filter(Boolean).join(' · ')||'Informe o endereço do titular';
  }
  function renderOrder(data){
    const target=$('orderContent');target.replaceChildren();
    if(!Array.isArray(data.items)){const p=document.createElement('p');p.className='hint';p.textContent='Detalhes indisponíveis no momento. Consulte seu carrinho.';target.append(p);return;}
    const list=document.createElement('ul');list.className='order-items';
    for(const item of data.items){
      const row=document.createElement('li'),name=document.createElement('span'),price=document.createElement('strong');
      name.textContent=`${item.quantity}× ${item.name}`;price.textContent=money(item.subtotal??Number(item.quantity)*Number(item.unit_price));row.append(name,price);list.append(row);
    }
    target.append(list);
    const costs=document.createElement('div');costs.className='costs';
    for(const [label,amount,kind] of [['Produtos',data.subtotal,''],['Descontos',data.discount_amount,'discount'],['Taxa de entrega',data.delivery_fee,''],['Total',data.total,'total']]){
      if(amount==null||(kind==='discount'&&!Number(amount)))continue;
      const row=document.createElement('div'),name=document.createElement('span'),value=document.createElement('strong');row.className='cost-row '+kind;name.textContent=label;value.textContent=(kind==='discount'?'− ':'')+money(amount);row.append(name,value);costs.append(row);
    }
    target.append(costs);
    const delivery=data.customer||{},section=document.createElement('div'),title=document.createElement('strong');section.className='fulfillment-summary';
    const pickup=/retirada/i.test(delivery.fulfillment||'');title.textContent=pickup?'Retirada no Espetinho Perus':(delivery.fulfillment||'Entrega');section.append(title);
    const lines=pickup?['Retirada no local.']:[delivery.address||'Endereço não disponível.',delivery.reference?'Referência: '+delivery.reference:''];
    if(delivery.notes)lines.push('Observações: '+delivery.notes);
    for(const text of lines.filter(Boolean)){const line=document.createElement('p');line.textContent=text;section.append(line);}target.append(section);
  }
  function show(data){
    if(!data.order_id)return;
    $('amount').textContent=money(data.total);$('orderLabel').textContent='Pedido • '+data.order_id.slice(-6);
    $('installments').textContent='1× de '+money(data.total);
    $('payLabel').textContent='Pagar '+money(data.total);
    renderOrder(data);
    $('tracking').href='/pedido.html?token='+encodeURIComponent(token);
    if(!loaded){
      const c=data.customer||{};Object.entries({name:c.name,holderName:c.name,email:c.email,phone:c.phone,cpf:c.cpf,postalCode:c.cep,addressNumber:c.number}).forEach(([id,value])=>{if(value)$(id).value=value;});
      $('cpf').value=formatCpf($('cpf').value);$('postalCode').value=formatCep($('postalCode').value);$('phone').value=formatPhone($('phone').value);
      syncSummaries();
      $('holderDetails').open=!['name','cpf','email','phone'].every(id=>$(id).value.trim()&&$(id).checkValidity());
      $('billingDetails').open=!['postalCode','addressNumber'].every(id=>$(id).value.trim()&&$(id).checkValidity());
      loaded=true;
    }
    form.hidden=!data.can_pay;
    $('refresh').hidden=data.can_pay;
    $('tracking').hidden=data.can_pay;
    if(data.status==='approved'){
      clearTimeout(timer);clearSensitive();say('Pagamento aprovado! Seu pedido foi recebido.','success');
      $('refresh').hidden=true;
      try{localStorage.removeItem(pendingKey);localStorage.removeItem('ep-reward-checkout-v1');}catch{}
      // Keep the cart if the customer changed it in another tab after this checkout.
      try{const record=JSON.parse(localStorage.getItem(pendingKey+'-cart')||'null');if(record){for(const [key,value] of Object.entries(record)){if(localStorage.getItem(key)===value)localStorage.removeItem(key);}localStorage.removeItem(pendingKey+'-cart');}}catch{}
    }else if(['refunded','charged_back','cancelled'].includes(data.status)){
      clearTimeout(timer);say('Este pagamento foi cancelado, estornado ou contestado. Consulte o acompanhamento.','error');
    }else if(data.attempt==='refused'){
      say('O cartão não foi aprovado. Confira os dados e tente outro cartão. Após três tentativas, entre em contato com a loja.','error');
    }else if(data.attempt&&data.attempt!=='none'){
      say('Estamos confirmando o pagamento. Não faça outra compra para este pedido.');
      if(polls++<24){clearTimeout(timer);timer=setTimeout(check,5000);}
    }else say('');
  }
  async function request(path,options={}){
    const r=await fetch(api+path+'?order_id='+encodeURIComponent(orderId),{...options,cache:'no-store',headers:{'Content-Type':'application/json','X-Order-Token':token}});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.erro||'Não foi possível confirmar o pagamento.');return data;
  }
  async function check(){
    if(busy||document.hidden)return;
    try{show(await request('/asaas-status'));}catch(e){say(e.message,'error');$('refresh').hidden=false;}
  }
  $('refresh').onclick=check;
  form.addEventListener('invalid',event=>{const group=event.target.closest('details');if(group)group.open=true;},true);
  for(const id of ['name','email','phone','cpf','postalCode','addressNumber'])$(id).addEventListener('input',syncSummaries);
  $('cpf').addEventListener('input',()=>{$('cpf').value=formatCpf($('cpf').value);});
  $('postalCode').addEventListener('input',()=>{$('postalCode').value=formatCep($('postalCode').value);syncSummaries();});
  $('phone').addEventListener('blur',()=>{$('phone').value=formatPhone($('phone').value);});
  $('cvvToggle').onclick=()=>{const expanded=$('cvvHelp').hidden;$('cvvHelp').hidden=!expanded;$('cvvToggle').setAttribute('aria-expanded',String(expanded));};
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!form.reportValidity())return;
    const [expiryMonth,expiryYear]=$('expiry').value.split('/');
    let card={attempt_id:crypto.randomUUID(),creditCard:{holderName:$('holderName').value,number:$('cardNumber').value.replace(/\D/g,''),expiryMonth,expiryYear,ccv:$('ccv').value},creditCardHolderInfo:{name:$('name').value,cpfCnpj:digits($('cpf').value),email:$('email').value,phone:digits($('phone').value),postalCode:digits($('postalCode').value),addressNumber:$('addressNumber').value}};
    busy=true;$('fields').disabled=true;say('Processando pagamento. Aguarde a confirmação.');
    try{show(await request('/pagar-cartao-asaas',{method:'POST',body:JSON.stringify(card)}));}
    catch(e){say(e.message+' Use “Consultar pagamento” antes de tentar novamente.','error');form.hidden=true;$('refresh').hidden=false;}
    finally{card=null;clearSensitive();busy=false;$('fields').disabled=false;}
  });
  $('cardNumber').oninput=()=>{$('cardNumber').value=$('cardNumber').value.replace(/\D/g,'').slice(0,19).replace(/(.{4})/g,'$1 ').trim();};
  $('expiry').oninput=()=>{$('expiry').value=$('expiry').value.replace(/\D/g,'').slice(0,6).replace(/^(\d{2})(\d)/,'$1/$2');};
  addEventListener('pagehide',()=>{clearSensitive();clearTimeout(timer);});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  if(!orderId||!token){say('Abra o pagamento a partir do seu carrinho.','error');return;}
  check();
})();
