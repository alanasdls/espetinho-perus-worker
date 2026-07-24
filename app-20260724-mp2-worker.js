// Build 2026-07-23 cache-fix-2
const products = [
['Espetinhos','Queijo coalho',10.90],['Espetinhos','Pão de alho',10.90],['Espetinhos','Carne',11.90],['Espetinhos','Carne e bacon',12.50],['Espetinhos','Carne e toscana',11.90],['Espetinhos','Carne e calabresa',11.90],['Espetinhos','Frango',11.90],['Espetinhos','Pernil',11.90],['Espetinhos','Pernil e bacon',12.50],['Espetinhos','Tulipa',12.50],['Espetinhos','Coração de frango',11.90],['Espetinhos','Linguiça toscana',11.90],['Espetinhos','Linguiça calabresa',11.90],['Espetinhos','Linguiça apimentada',12.50],['Espetinhos','Medalhão de frango',14.90],['Espetinhos','Camarão',14.90],['Espetinhos','Kafta',14.90],['Espetinhos','Kafta com queijo',18.90],
['Porções','Batata simples 600g',35,'Batata frita'],['Porções','Batata com cheddar e bacon 600g',45],['Porções','Batata com calabresa ou frango 600g',45],['Porções','Frango a passarinho 1kg',39.90,'Acompanha molho'],['Porções','Cebola empanada',39.90],['Porções','Salame com azeitonas',39],['Porções','Azeitona',20],['Porções','Torresmo 600g',39.90],['Porções','Calabresa acebolada 600g',39.90],['Porções','Meia calabresa / meia frango',45],['Porções','Isca de frango empanado 600g',45],['Porções','Mandioca com bacon 600g',39.90],['Porções','Isca de tilápia 600g',69.90],['Porções','Carne seca com mandioca 600g',85.90],['Porções','Contra filé acebolado 600g',79.90],['Porções','Picanha grelhada 600g',95.90,'Acompanha batata rústica e pão'],['Porções','Porção da casa 1,2kg',130,'Batata, contra filé, calabresa, mandioca e pão de alho'],
['Lanches','X-Burguer',22,'Pão brioche, hambúrguer bovino 180g, queijo e molho Billy Jack'],['Lanches','X-Salada',25,'Pão brioche, hambúrguer 180g, queijo, alface, tomate e molho Billy Jack'],['Lanches','X-Bacon',27,'Pão brioche, hambúrguer 180g, queijo, bacon e molho tasty'],['Lanches','X-Contra filé',28],['Lanches','X-Calabresa',25],['Lanches','X-Toscana',25],['Lanches','X-Kafta',25],['Adicionais','Batata frita 150g',8],['Adicionais','Batata frita 150g com cheddar',12],['Adicionais','Hambúrguer extra 180g',10],
['Cervejas','Skol 600ml',15],['Cervejas','Balde Skol 600ml com 3',43.50],['Cervejas','Balde Skol 600ml com 5',72.50],['Cervejas','Original 600ml',16],['Cervejas','Balde Original 600ml com 3',46.50],['Cervejas','Balde Original 600ml com 5',77.50],['Cervejas','Heineken 600ml',19.50],['Cervejas','Balde Heineken 600ml com 3',57],['Cervejas','Balde Heineken 600ml com 5',95],['Cervejas','Budweiser Long Neck 330ml',12.50],['Cervejas','Balde Budweiser Long Neck com 5',60],['Cervejas','Heineken Long Neck 330ml',15],['Cervejas','Heineken Zero Long Neck',15],['Cervejas','Corona Long Neck',15],['Cervejas','Corona Zero Long Neck',15],['Cervejas','Stella Long Neck',15],['Cervejas','Itaipava lata 269ml',5.50],['Cervejas','Skol lata 269ml',6.50],['Cervejas','Original lata 269ml',7],['Cervejas','Cerveja especial 600ml',25],['Cervejas','Cerveja especial Long Neck ou lata',16.50],
['Não alcoólicos','Água',5],['Não alcoólicos','Água com gás',6],['Não alcoólicos','Água tônica',7.50],['Não alcoólicos','Refrigerante lata 350ml',7.50],['Não alcoólicos','Energético Red Bull tradicional',15],['Não alcoólicos','Energético Red Bull sabores',16],['Não alcoólicos','Água de coco 330ml',12],['Não alcoólicos','Limonada suíça copo',15],['Não alcoólicos','Copo de suco com água',12],['Não alcoólicos','Jarra de suco com água',25],['Não alcoólicos','Gelo coco sabores',5],
['Drinks','Caipirinha 400ml',20,'Com cachaça, vodka ou saquê'],['Drinks','Caipirinha com vinho',25],['Drinks','Caipirinha com Licor 43',35],['Drinks','Batida com vodka 330ml',23],['Drinks','Batida com Jurupinga 330ml',28],['Drinks','Espanhola 330ml',25],['Drinks','Frozen 500ml',28],['Drinks','Frozen arretada',25],['Drinks','Morena canela',20],['Drinks','Sex on the Beach',25],['Drinks','Bob Marley',25],['Drinks','Piña Colada',25],['Drinks','Mojito',25],['Drinks','Meia de seda',25],['Drinks','Negroni',30],['Drinks','Moscow Mule',25],['Drinks','Caipirinha zero',18],['Drinks','Batida zero',20],['Drinks','Mojito zero',20],['Drinks','Namoradinha',20],['Drinks','Smirnoff Ice',15],['Drinks','Skol Beats',15],['Drinks','Xeque Mate',15],
['Doses e shots','Pitú / 51 / Velho Barreiro',5],['Doses e shots','Salinas',10],['Doses e shots','Seleta',10],['Doses e shots','Dreher',8],['Doses e shots','Domecq',10],['Doses e shots','Menta',10],['Doses e shots','Contini',15],['Doses e shots','Campari',15],['Doses e shots','Tequila José Cuervo',25],['Doses e shots','Licor 43',25],['Doses e shots','Balena',25],['Doses e shots','Bomberinho',10],['Doses e shots','Maria Mole',12],['Doses e shots','Kariri com mel',15],['Doses e shots','Conhaque com mel',15],
['Whisky e combos','Passaport dose 100ml',15],['Whisky e combos','White Horse dose 100ml',25],['Whisky e combos','Red Label dose 100ml',30],['Whisky e combos','Old Parr dose 100ml',35],['Whisky e combos',"Jack Daniel's dose 100ml",35],['Whisky e combos','Eternity gin dose',5],['Whisky e combos',"Rock's gin dose",15],['Whisky e combos','Bombay gin dose',25],['Whisky e combos','Tanqueray gin dose',30],['Whisky e combos','Beefeater gin dose',30],['Whisky e combos','Smirnoff vodka dose',25],['Whisky e combos','Absolut vodka dose',30],['Whisky e combos','Ciroc vodka dose',35],
['Sobremesas','Taça de sorvete 350ml',25,'Morango ou chocolate, com confeitos'],['Sobremesas','Petit Gateau',25,'Acompanha sorvete de creme'],['Sobremesas','Brownie de chocolate',25,'Acompanha sorvete de creme'],['Sobremesas','Bolo de pote',20,'Consultar disponibilidade']
].map((p,i)=>({id:i,category:p[0],name:p[1],price:p[2],description:p[3]||''}));

const localProductPhotos = {
  'Queijo coalho':'assets/products/queijo-coalho-20260723.webp',
  'Pão de alho':'assets/products/pao-de-alho-20260723.webp',
  'Carne':'assets/products/carne-20260723.webp',
  'Carne e bacon':'assets/products/carne-e-bacon-20260723.webp',
  'Carne e toscana':'assets/products/linguica-toscana-20260723.webp',
  'Linguiça toscana':'assets/products/linguica-toscana-20260723.webp',
  'Carne e calabresa':'assets/products/carne-e-calabresa-20260723.webp',
  'Frango':'assets/products/frango-20260723.webp',
  'Pernil':'assets/products/pernil-20260723.webp',
  'Pernil e bacon':'assets/products/pernil-e-bacon-20260723.webp',
  'Tulipa':'assets/products/tulipa-20260723.webp',
  'Linguiça calabresa':'assets/products/linguica-calabresa-20260723.webp',
  'Linguiça apimentada':'assets/products/linguica-apimentada-20260723.webp',
  'Medalhão de frango':'assets/products/medalhao-de-frango-20260723.webp',
  'Camarão':'assets/products/camarao-20260723.webp',
  'Kafta':'assets/products/kafta-20260723.webp',
  'Kafta com queijo':'assets/products/kafta-com-queijo-20260723.webp',
  'Batata simples 600g':'assets/products/batata-simples-600g-20260723.webp',
  'Batata com cheddar e bacon 600g':'assets/products/batata-com-cheddar-e-bacon-600g-20260723.webp',
  'Batata com calabresa ou frango 600g':'assets/products/batata-com-calabresa-ou-frango-600g-20260723.webp',
  'Frango a passarinho 1kg':'assets/products/frango-a-passarinho-1kg-20260723.webp',
  'Cebola empanada':'assets/products/cebola-empanada-20260723.webp',
  'Salame com azeitonas':'assets/products/salame-com-azeitonas-20260723.webp',
  'Azeitona':'assets/products/azeitona-20260723.webp',
  'Torresmo 600g':'assets/products/torresmo-600g-20260723.webp',
  'Calabresa acebolada 600g':'assets/products/calabresa-acebolada-600g-20260723.webp',
  'Meia calabresa / meia frango':'assets/products/meia-calabresa-meia-frango-20260723.webp',
  'Isca de frango empanado 600g':'assets/products/isca-de-frango-empanado-600g-20260723.webp',
  'Mandioca com bacon 600g':'assets/products/mandioca-com-bacon-600g-20260723.webp',
  'Isca de tilápia 600g':'assets/products/isca-de-tilapia-600g-20260723.webp',
  'Carne seca com mandioca 600g':'assets/products/carne-seca-com-mandioca-600g-20260723.webp',
  'Contra filé acebolado 600g':'assets/products/contra-file-acebolado-600g-20260723.webp',
  'Picanha grelhada 600g':'assets/products/picanha-grelhada-600g-20260723.webp',
  'Porção da casa 1,2kg':'assets/products/porcao-da-casa-1-2kg-20260723.webp',
};

const curatedPhotos = {
  'Espetinhos':[
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&w=900&q=82'
  ],
  'Porções':[
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82'
  ],
  'Lanches':[
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=82'
  ],
  'Adicionais':[
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=82'
  ],
  'Cervejas':[
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=900&q=82'
  ],
  'Não alcoólicos':[
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9a?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=82'
  ],
  'Drinks':[
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=82'
  ],
  'Doses e shots':[
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=900&q=82'
  ],
  'Whisky e combos':[
    'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1527761939622-911909463b5d?auto=format&fit=crop&w=900&q=82'
  ],
  'Sobremesas':[
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=82'
  ]
};
products.forEach((p,index)=>{
  const list=curatedPhotos[p.category]||curatedPhotos['Porções'];
  p.image=localProductPhotos[p.name] || list[index % list.length];
  p.badge = index % 17 === 0 ? 'Mais pedido' : index % 29 === 0 ? 'Destaque' : '';
});
let favorites = JSON.parse(localStorage.getItem('ep-favorites')||'[]');
function toggleFavorite(id){
  favorites = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites,id];
  localStorage.setItem('ep-favorites',JSON.stringify(favorites));
  render();
}
const fmt=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});let active='Todos',cart={};const grid=document.querySelector('#menuGrid'),cats=document.querySelector('#categories'),search=document.querySelector('#search');
['Todos',...new Set(products.map(p=>p.category))].forEach(c=>{const b=document.createElement('button');b.textContent=c;b.className=c==='Todos'?'active':'';b.onclick=()=>{active=c;document.querySelectorAll('.categories button').forEach(x=>x.classList.toggle('active',x===b));render()};cats.appendChild(b)});
function render(){
  const q=search.value.toLowerCase();
  const list=products.filter(p=>(active==='Todos'||p.category===active)&&(p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)));
  grid.innerHTML=list.length?list.map(p=>`<article class="menu-card"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/503042.jpg'"><button class="favorite ${favorites.includes(p.id)?'active':''}" onclick="toggleFavorite(${p.id})" aria-label="Favoritar">${favorites.includes(p.id)?'♥':'♡'}</button>${p.badge?`<span class="badge">${p.badge}</span>`:''}</div><div class="menu-card-content"><small>${p.category}</small><h3>${p.name}</h3><p>${p.description||'Preparado com ingredientes selecionados.'}</p><footer><span class="price">${fmt(p.price)}</span><button class="add" onclick="add(${p.id})">Adicionar <b>+</b></button></footer></div></article>`).join(''):'<p class="empty">Nenhum item encontrado.</p>';
}
search.oninput=render;render();
function add(id){cart[id]=(cart[id]||0)+1;updateCart()}function change(id,d){cart[id]+=d;if(cart[id]<=0)delete cart[id];updateCart()}function updateCart(){const ids=Object.keys(cart);const cartQty=ids.reduce((s,id)=>s+cart[id],0);document.querySelector('#cartCount').textContent=cartQty;document.querySelector('#floatingCartCount').textContent=cartQty;document.querySelector('#cartItems').innerHTML=ids.length?ids.map(id=>{const p=products[id],q=cart[id];return `<div class="cart-item"><div><h4>${p.name}</h4><small>${fmt(p.price)} cada</small></div><div class="qty"><button onclick="change(${id},-1)">−</button><b>${q}</b><button onclick="change(${id},1)">+</button><button class="remove" onclick="change(${id},-${q})">remover</button></div></div>`}).join(''):'<div class="empty">Seu carrinho está vazio.</div>';document.querySelector('#cartTotal').textContent=fmt(ids.reduce((s,id)=>s+products[id].price*cart[id],0))}
const overlay=document.querySelector('#cartOverlay');const floatingCart=document.querySelector('#floatingCart');document.documentElement.appendChild(floatingCart);const openCartPanel=()=>{overlay.style.display='';overlay.removeAttribute('aria-hidden');overlay.classList.add('open');document.body.classList.add('cart-open')};const closeCartPanel=()=>{overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');overlay.style.display='none';document.body.classList.remove('cart-open')};document.querySelector('#openCart').onclick=openCartPanel;floatingCart.onclick=openCartPanel;document.querySelector('#closeCart').onclick=closeCartPanel;overlay.onclick=e=>{if(e.target===overlay)closeCartPanel()};document.querySelector('#fulfillment').onchange=e=>document.querySelector('#addressWrap').classList.toggle('hidden',e.target.value!=='Entrega');
const paymentSelect=document.querySelector('#payment');
const cpfWrap=document.querySelector('#cpfWrap');
const cpfInput=document.querySelector('#customerCpf');
const pixButton=document.querySelector('#mercadoPagoCheckout');
const pixSecurity=document.querySelector('#pixSecurity');
function atualizarFormaPagamento(){
  const isPix=paymentSelect.value==='Pix';
  document.querySelector('#changeWrap').classList.toggle('hidden',paymentSelect.value!=='Dinheiro');
  cpfWrap.classList.toggle('hidden',!isPix);
  pixButton.classList.toggle('hidden',!isPix);
  pixSecurity.classList.toggle('hidden',!isPix);
  if(!isPix) cpfInput.value='';
}
paymentSelect.onchange=atualizarFormaPagamento;
atualizarFormaPagamento();
cpfInput.addEventListener('input',()=>{
  const d=cpfInput.value.replace(/\D/g,'').slice(0,11);
  cpfInput.value=d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
});
document.querySelector('#checkout').onclick=()=>{const ids=Object.keys(cart);if(!ids.length)return alert('Adicione pelo menos um item ao pedido.');const name=document.querySelector('#customerName').value.trim();if(!name)return alert('Informe seu nome.');const fulfillment=document.querySelector('#fulfillment').value,address=document.querySelector('#address').value.trim();if(fulfillment==='Entrega'&&!address)return alert('Informe o endereço de entrega.');const payment=document.querySelector('#payment').value,change=document.querySelector('#change').value.trim(),notes=document.querySelector('#notes').value.trim();const total=ids.reduce((s,id)=>s+products[id].price*cart[id],0);let msg=`Olá! Quero fazer um pedido no Espetinho Perus.%0A%0A*Cliente:* ${encodeURIComponent(name)}%0A*Forma:* ${encodeURIComponent(fulfillment)}%0A`;if(address)msg+=`*Endereço:* ${encodeURIComponent(address)}%0A`;msg+=`*Pagamento:* ${encodeURIComponent(payment)}%0A`;if(payment==='Dinheiro'&&change)msg+=`*Troco para:* ${encodeURIComponent(change)}%0A`;msg+=`%0A*Itens:*%0A`;ids.forEach(id=>{const p=products[id],q=cart[id];msg+=`${q}x ${encodeURIComponent(p.name)} — ${encodeURIComponent(fmt(p.price*q))}%0A`});msg+=`%0A*Total dos itens:* ${encodeURIComponent(fmt(total))}%0A*Taxa de entrega:* consultar no WhatsApp`;if(notes)msg+=`%0A%0A*Observações:* ${encodeURIComponent(notes)}`;window.open(`https://wa.me/5511981341569?text=${msg}`,'_blank')};



function validarCpf(cpf){
  if(!/^\d{11}$/.test(cpf)||/^(\d)\1{10}$/.test(cpf)) return false;
  let soma=0;
  for(let i=0;i<9;i++) soma+=Number(cpf[i])*(10-i);
  let digito=(soma*10)%11;
  if(digito===10) digito=0;
  if(digito!==Number(cpf[9])) return false;
  soma=0;
  for(let i=0;i<10;i++) soma+=Number(cpf[i])*(11-i);
  digito=(soma*10)%11;
  if(digito===10) digito=0;
  return digito===Number(cpf[10]);
}

function getOrderPayload(){
  const ids=Object.keys(cart);
  if(!ids.length){ alert('Adicione pelo menos um item ao pedido.'); return null; }
  const name=document.querySelector('#customerName').value.trim();
  if(!name){ alert('Informe seu nome.'); return null; }
  const email=document.querySelector('#customerEmail').value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Informe um e-mail válido para gerar o Pix.'); return null; }
  const phone=document.querySelector('#customerPhone')?.value.trim()||'';
  if(!phone){ alert('Informe seu telefone.'); return null; }
  const cpf=(document.querySelector('#customerCpf')?.value||'').replace(/\D/g,'');
  if(!validarCpf(cpf)){ alert('Informe um CPF válido para gerar o Pix.'); document.querySelector('#customerCpf')?.focus(); return null; }
  const fulfillment=document.querySelector('#fulfillment').value;
  const address=document.querySelector('#address').value.trim();
  if(fulfillment==='Entrega'&&!address){ alert('Informe o endereço de entrega.'); return null; }
  const notes=document.querySelector('#notes').value.trim();
  return {
    customer:{name,email,phone,cpf,document:cpf,fulfillment,address,notes},
    items:ids.map(id=>({name:products[id].name,quantity:cart[id]})),
    order_id:`EP-${Date.now()}`,
    site_url:window.location.origin
  };
}

const pixOverlay=document.querySelector('#pixOverlay');
// Coloca o modal Pix no nível mais alto da página, evitando sobreposição pelo carrinho no celular.
document.documentElement.appendChild(pixOverlay);
const pixQrImage=document.querySelector('#pixQrImage');
const pixCode=document.querySelector('#pixCode');
const pixStatus=document.querySelector('#pixStatus');
const pixOrderInfo=document.querySelector('#pixOrderInfo');
const pixTicket=document.querySelector('#pixTicket');
let pixPollTimer=null;
let pixTrackingToken='';
function closePixModal(){
  pixOverlay.classList.remove('open');
  pixOverlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('pix-open');
  if(pixPollTimer){clearInterval(pixPollTimer);pixPollTimer=null;}
}
document.querySelector('#closePix').onclick=closePixModal;
pixOverlay.onclick=e=>{if(e.target===pixOverlay)closePixModal()};
document.querySelector('#copyPix').onclick=async()=>{
  try{await navigator.clipboard.writeText(pixCode.value);alert('Código Pix copiado!');}
  catch(_){pixCode.select();document.execCommand('copy');alert('Código Pix copiado!');}
};

async function consultarPix(paymentId){
  try{
    const response=await fetch(`https://summer-field-09b7.alanasdls.workers.dev/pagamento-status?id=${encodeURIComponent(paymentId)}`);
    const data=await response.json();
    if(data.status==='approved'){
      pixStatus.textContent='✅ Pagamento aprovado! Abrindo o acompanhamento do pedido...';
      pixStatus.className='pix-status approved';
      if(pixPollTimer){clearInterval(pixPollTimer);pixPollTimer=null;}
      const token=data.pedido?.tracking_token||pixTrackingToken;
      if(token){localStorage.setItem('ep-last-tracking-token',token);setTimeout(()=>{window.location.href=`pedido.html?token=${encodeURIComponent(token)}`},1500);}
      return;
    }
    if(['rejected','cancelled','refunded','charged_back'].includes(data.status)){
      pixStatus.textContent='❌ O pagamento não foi aprovado. Gere um novo Pix.';
      pixStatus.className='pix-status failed';
      if(pixPollTimer){clearInterval(pixPollTimer);pixPollTimer=null;}
      return;
    }
    pixStatus.textContent='⏳ Aguardando pagamento...';
    pixStatus.className='pix-status';
  }catch(_){/* mantém a tela e tenta novamente */}
}

const mpButton=document.querySelector('#mercadoPagoCheckout');
if(mpButton){
  mpButton.onclick=async()=>{
    const payload=getOrderPayload();
    if(!payload) return;
    const original=mpButton.textContent;
    mpButton.disabled=true;
    mpButton.textContent='Gerando Pix...';
    try{
      const response=await fetch('https://summer-field-09b7.alanasdls.workers.dev/criar-pix',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.qr_code||!data.qr_code_base64) throw new Error(data.erro||data.error||'Não foi possível gerar o Pix.');
      pixTrackingToken=data.tracking_token||'';
      localStorage.setItem('ep-last-order',JSON.stringify({...payload,payment_id:data.payment_id,tracking_token:pixTrackingToken}));
      if(pixTrackingToken)localStorage.setItem('ep-last-tracking-token',pixTrackingToken);
      pixQrImage.src=`data:image/png;base64,${data.qr_code_base64}`;
      pixQrImage.hidden=false;
      pixCode.value=data.qr_code;
      pixOrderInfo.textContent=`Pedido ${data.numero_pedido} • ${fmt(Number(data.total))}`;
      pixStatus.textContent='⏳ Aguardando pagamento...';
      pixStatus.className='pix-status';
      if(data.ticket_url){pixTicket.href=data.ticket_url;pixTicket.hidden=false;}else{pixTicket.hidden=true;}
      closeCartPanel();
      // Garante que a tela de pagamento/carrinho seja totalmente fechada antes de exibir o QR Code.
      overlay.hidden=true;
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      document.body.classList.add('pix-open');
      pixOverlay.classList.add('open');
      pixOverlay.setAttribute('aria-hidden','false');
      consultarPix(data.payment_id);
      pixPollTimer=setInterval(()=>consultarPix(data.payment_id),5000);
    }catch(error){
      alert(error.message||'Não foi possível gerar o Pix.');
    }finally{
      mpButton.disabled=false;
      mpButton.textContent=original;
    }
  };
}
