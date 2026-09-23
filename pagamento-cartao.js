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
  function show(data){
    if(!data.order_id)return;
    $('amount').textContent=money(data.total);$('orderLabel').textContent='Pedido '+data.order_id;
    $('pay').textContent='Pagar '+money(data.total)+' no crédito';
    $('tracking').href='/pedido.html?token='+encodeURIComponent(token);
    if(!loaded){
      const c=data.customer||{};Object.entries({name:c.name,holderName:c.name,email:c.email,phone:c.phone,cpf:c.cpf,postalCode:c.cep,addressNumber:c.number}).forEach(([id,value])=>{if(value)$(id).value=value;});loaded=true;
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
    }else say('Confira o total e preencha os dados do cartão. Pagamento em 1 vez.');
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
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!form.reportValidity())return;
    const [expiryMonth,expiryYear]=$('expiry').value.split('/');
    let card={attempt_id:crypto.randomUUID(),creditCard:{holderName:$('holderName').value,number:$('cardNumber').value.replace(/\D/g,''),expiryMonth,expiryYear,ccv:$('ccv').value},creditCardHolderInfo:{name:$('name').value,cpfCnpj:$('cpf').value,email:$('email').value,phone:$('phone').value,postalCode:$('postalCode').value,addressNumber:$('addressNumber').value}};
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
