(function(){
  function sync(selectId){
    var select=document.getElementById(selectId);
    if(!select)return;
    document.querySelectorAll('[data-select="'+selectId+'"]').forEach(function(btn){
      btn.classList.toggle('active',btn.getAttribute('data-value')===select.value);
    });
    if(selectId==='payment'){
      var whatsapp=document.getElementById('checkout');
      if(whatsapp) whatsapp.style.display=select.value==='Pix'?'none':'';
      var card=document.getElementById('pagBankCheckout');
      if(card && (select.value==='Cartão de débito'||select.value==='Cartão de crédito')){
        card.textContent=select.value==='Cartão de débito'?'Pagar no débito pelo Mercado Pago':'Pagar no crédito pelo Mercado Pago';
      }
    }
  }
  function init(){
    document.querySelectorAll('.toggle-btn[data-select]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=btn.getAttribute('data-select');
        var select=document.getElementById(id);
        if(!select)return;
        select.value=btn.getAttribute('data-value');
        select.dispatchEvent(new Event('change',{bubbles:true}));
        sync(id);
      });
    });
    ['fulfillment','payment'].forEach(function(id){
      var select=document.getElementById(id);
      if(select)select.addEventListener('change',function(){sync(id)});
      sync(id);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
