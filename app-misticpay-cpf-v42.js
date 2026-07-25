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
  grid.innerHTML=list.length?list.map(p=>`<article class="menu-card"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/503042.jpg'"><button class="favorite ${favorites.includes(p.id)?'active':''}" onclick="toggleFavorite(${p.id})" aria-label="Favoritar">${favorites.includes(p.id)?'♥':'♡'}</button>${p.badge?`<span class="badge">${p.badge}</span>`:''}</div><div class="menu-card-content"><small>${p.category}</small><h3>${p.name}</h3>${p.description&&p.description.trim()?`<p>${p.description}</p>`:''}<footer><span class="price">${fmt(p.price)}</span><button class="add" onclick="add(${p.id})" aria-label="Adicionar ${p.name} ao carrinho" title="Adicionar ao carrinho"><b>+</b></button></footer></div></article>`).join(''):'<p class="empty">Nenhum item encontrado.</p>';
}
search.oninput=render;render();
let itemAddedTimer;
function showItemAdded(id){
  const toast=document.querySelector('#itemAddedToast');
  const text=document.querySelector('#itemAddedText');
  if(!toast||!text)return;
  const product=products[id];
  text.textContent=product?`${product.name} adicionado ao carrinho`:'Item adicionado ao carrinho';
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  toast.setAttribute('aria-hidden','false');
  document.querySelector('#floatingCart')?.classList.add('cart-bump');
  clearTimeout(itemAddedTimer);
  itemAddedTimer=setTimeout(()=>{
    toast.classList.remove('show');
    toast.setAttribute('aria-hidden','true');
    document.querySelector('#floatingCart')?.classList.remove('cart-bump');
  },2200);
}
function add(id){cart[id]=(cart[id]||0)+1;updateCart();showItemAdded(id)}
function change(id,d){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];updateCart();if(d>0)showItemAdded(id)}function updateCart(){const ids=Object.keys(cart);const cartQty=ids.reduce((s,id)=>s+cart[id],0);const topCartCount=document.querySelector('#cartCount');if(topCartCount)topCartCount.textContent=cartQty;document.querySelector('#floatingCartCount').textContent=cartQty;document.querySelector('#cartItems').innerHTML=ids.length?ids.map(id=>{const p=products[id],q=cart[id];return `<div class="cart-item"><div><h4>${p.name}</h4><small>${fmt(p.price)} cada</small></div><div class="qty"><button onclick="change(${id},-1)">−</button><b>${q}</b><button onclick="change(${id},1)">+</button><button class="remove" onclick="change(${id},-${q})">remover</button></div></div>`}).join(''):'<div class="empty">Seu carrinho está vazio.</div>';updateOrderSummary()}
const overlay=document.querySelector('#cartOverlay');const floatingCart=document.querySelector('#floatingCart');document.documentElement.appendChild(floatingCart);const openCartPanel=()=>{overlay.style.display='';overlay.removeAttribute('aria-hidden');overlay.classList.add('open');document.body.classList.add('cart-open')};const closeCartPanel=()=>{overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');overlay.style.display='none';document.body.classList.remove('cart-open')};const topCartButton=document.querySelector('#openCart');if(topCartButton)topCartButton.onclick=openCartPanel;floatingCart.onclick=openCartPanel;document.querySelector('#closeCart').onclick=closeCartPanel;const itemAddedToast=document.querySelector('#itemAddedToast');if(itemAddedToast)itemAddedToast.onclick=()=>{itemAddedToast.classList.remove('show');openCartPanel()};overlay.onclick=e=>{if(e.target===overlay)closeCartPanel()};const DELIVERY_FEE=10;
const PERUS_CEP_PREFIXES=new Set(['05201','05202','05203','05204','05205','05206','05207','05208','05209','05210','05211','05212','05215','05230']);
const fulfillmentSelect=document.querySelector('#fulfillment');
const cepInput=document.querySelector('#deliveryCep');
const streetInput=document.querySelector('#deliveryStreet');
const numberInput=document.querySelector('#deliveryNumber');
const neighborhoodInput=document.querySelector('#deliveryNeighborhood');
const complementInput=document.querySelector('#deliveryComplement');
const cityInput=document.querySelector('#deliveryCity');
const stateInput=document.querySelector('#deliveryState');
const referenceInput=document.querySelector('#deliveryReference');
const addressInput=document.querySelector('#address');
const cepStatus=document.querySelector('#cepStatus');
const areaMessage=document.querySelector('#deliveryAreaMessage');
const deliveryWhatsapp=document.querySelector('#deliveryWhatsapp');
const normalizeText=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const deliveryCepDigits=()=>String(cepInput?.value||'').replace(/\D/g,'');
const isPerusCep=()=>{const cep=deliveryCepDigits();return cep.length===8&&PERUS_CEP_PREFIXES.has(cep.slice(0,5));};
const isDelivery=()=>fulfillmentSelect.value==='Entrega';
function composeAddress(){
  const parts=[];
  const street=streetInput?.value.trim(),num=numberInput?.value.trim(),bairro=neighborhoodInput?.value.trim(),comp=complementInput?.value.trim(),city=cityInput?.value.trim(),uf=stateInput?.value.trim(),ref=referenceInput?.value.trim();
  if(street)parts.push(`${street}${num?`, ${num}`:''}`); if(comp)parts.push(comp); if(bairro)parts.push(bairro); if(city)parts.push(`${city}${uf?` - ${uf}`:''}`); if(ref)parts.push(`Referência: ${ref}`);
  if(addressInput)addressInput.value=parts.join(' - ');
  return addressInput?.value||'';
}
function getSubtotal(){return Object.keys(cart).reduce((s,id)=>s+products[id].price*cart[id],0)}
function deliveryValid(){return !isDelivery()||isPerusCep()}
function updateCheckoutAvailability(){
  composeAddress();
  const valid=deliveryValid();
  [document.querySelector('#checkout'),document.querySelector('#mercadoPagoCheckout'),document.querySelector('#pagBankCheckout')].forEach(btn=>{if(btn)btn.disabled=isDelivery()&&!valid});
  if(!isDelivery()){areaMessage.hidden=true;deliveryWhatsapp.hidden=true;return}
  const bairro=neighborhoodInput?.value.trim();
  const cep=deliveryCepDigits();
  if(cep.length!==8){areaMessage.hidden=false;areaMessage.className='delivery-area-message pending';areaMessage.textContent='Digite o CEP para verificar a área de entrega.';deliveryWhatsapp.hidden=true;return}
  if(valid){areaMessage.hidden=false;areaMessage.className='delivery-area-message success';areaMessage.textContent='✓ CEP atendido na região de Perus. Taxa fixa de R$ 10,00.';deliveryWhatsapp.hidden=true}
  else{areaMessage.hidden=false;areaMessage.className='delivery-area-message blocked';areaMessage.textContent='Este CEP está fora da entrega automática de Perus. Consulte o valor do frete pelo WhatsApp.';deliveryWhatsapp.hidden=false;deliveryWhatsapp.href=`https://wa.me/5511981341569?text=${encodeURIComponent(`Olá! Gostaria de consultar o valor do frete. CEP: ${cepInput?.value||''}. Bairro: ${bairro||'não informado'}.`)}`}
}
function updateOrderSummary(){
  const subtotal=getSubtotal(),fee=isDelivery()?DELIVERY_FEE:0,total=subtotal+fee;
  document.querySelector('#cartSubtotal').textContent=fmt(subtotal);
  document.querySelector('#deliveryFee').textContent=fmt(fee);
  document.querySelector('#deliveryFeeLabel').classList.toggle('muted-fee',!isDelivery());
  document.querySelector('#deliveryFeeInfo').textContent=isDelivery()?'CEP atendido em Perus: taxa fixa de R$ 10,00.':'Retirada no local: sem taxa de entrega.';
  document.querySelector('#cartTotal').textContent=fmt(total);
  updateCheckoutAvailability();
}
const atualizarRecebimento=()=>{document.querySelector('#addressWrap').classList.toggle('hidden',!isDelivery());updateOrderSummary()};
fulfillmentSelect.onchange=atualizarRecebimento;
['input','change'].forEach(ev=>[numberInput,complementInput,referenceInput].forEach(el=>el?.addEventListener(ev,()=>{composeAddress();updateCheckoutAvailability()})));
async function buscarCep(){
  const cep=(cepInput?.value||'').replace(/\D/g,'');
  if(cep.length!==8){cepStatus.textContent='Informe um CEP com 8 números.';cepStatus.className='cep-status error';return}
  cepStatus.textContent='Buscando endereço...';cepStatus.className='cep-status loading';
  try{const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);if(!r.ok)throw new Error('Falha na consulta');const d=await r.json();if(d.erro)throw new Error('CEP não encontrado');streetInput.value=d.logradouro||'';neighborhoodInput.value=d.bairro||'';cityInput.value=d.localidade||'';stateInput.value=d.uf||'';cepStatus.textContent='Endereço encontrado. Informe o número.';cepStatus.className='cep-status success';numberInput.focus();composeAddress();updateOrderSummary();localStorage.setItem('ep-delivery-address',JSON.stringify({cep:cepInput.value,street:streetInput.value,bairro:neighborhoodInput.value,city:cityInput.value,state:stateInput.value}))}catch(e){streetInput.value='';neighborhoodInput.value='';cityInput.value='';stateInput.value='';cepStatus.textContent='CEP não encontrado. Confira os números e tente novamente.';cepStatus.className='cep-status error';updateOrderSummary()}
}
cepInput?.addEventListener('input',()=>{const d=cepInput.value.replace(/\D/g,'').slice(0,8);cepInput.value=d.replace(/(\d{5})(\d)/,'$1-$2');if(d.length===8)buscarCep();else{neighborhoodInput.value='';updateOrderSummary()}});
document.querySelector('#searchCep')?.addEventListener('click',buscarCep);
try{const saved=JSON.parse(localStorage.getItem('ep-delivery-address')||'null');if(saved){cepInput.value=saved.cep||'';streetInput.value=saved.street||'';neighborhoodInput.value=saved.bairro||'';cityInput.value=saved.city||'';stateInput.value=saved.state||''}}catch{}
atualizarRecebimento();
const paymentSelect=document.querySelector('#payment');
const cpfWrap=document.querySelector('#cpfWrap');
const cpfInput=document.querySelector('#customerCpf');
const pixButton=document.querySelector('#mercadoPagoCheckout');
const pixSecurity=document.querySelector('#pixSecurity');
const pagBankButton=document.querySelector('#pagBankCheckout');
function atualizarFormaPagamento(){
  const isPix=paymentSelect.value==='Pix';
  const isCard=['Cartão de débito','Cartão de crédito'].includes(paymentSelect.value);
  document.querySelector('#changeWrap').classList.toggle('hidden',paymentSelect.value!=='Dinheiro');
  cpfWrap.classList.toggle('hidden',!isPix);
  pixButton.classList.toggle('hidden',!isPix);
  pagBankButton?.classList.toggle('hidden',!isCard);
  pixSecurity.classList.toggle('hidden',!(isPix||isCard));
  if(!isPix) cpfInput.value='';
}
paymentSelect.onchange=atualizarFormaPagamento;
atualizarFormaPagamento();
updateOrderSummary();
cpfInput.addEventListener('input',()=>{
  const d=cpfInput.value.replace(/\D/g,'').slice(0,11);
  cpfInput.value=d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
});
document.querySelector('#checkout').onclick=()=>{const ids=Object.keys(cart);if(!ids.length)return alert('Adicione pelo menos um item ao pedido.');const name=document.querySelector('#customerName').value.trim();if(!name)return alert('Informe seu nome.');const fulfillment=fulfillmentSelect.value,address=composeAddress();if(isDelivery()){if(!cepInput.value||!streetInput.value)return alert('Informe um CEP válido.');if(!numberInput.value.trim())return alert('Informe o número do endereço.');if(!isPerusCep()){deliveryWhatsapp.click();return}}const payment=document.querySelector('#payment').value,change=document.querySelector('#change').value.trim(),notes=document.querySelector('#notes').value.trim();const subtotal=getSubtotal(),fee=isDelivery()?DELIVERY_FEE:0,total=subtotal+fee;let msg=`Olá! Quero fazer um pedido no Espetinho Perus.%0A%0A*Cliente:* ${encodeURIComponent(name)}%0A*Forma:* ${encodeURIComponent(fulfillment)}%0A`;if(address)msg+=`*CEP:* ${encodeURIComponent(cepInput.value)}%0A*Endereço:* ${encodeURIComponent(address)}%0A`;msg+=`*Pagamento:* ${encodeURIComponent(payment)}%0A`;if(payment==='Dinheiro'&&change)msg+=`*Troco para:* ${encodeURIComponent(change)}%0A`;msg+=`%0A*Itens:*%0A`;ids.forEach(id=>{const p=products[id],q=cart[id];msg+=`${q}x ${encodeURIComponent(p.name)} — ${encodeURIComponent(fmt(p.price*q))}%0A`});msg+=`%0A*Produtos:* ${encodeURIComponent(fmt(subtotal))}%0A*Taxa de entrega:* ${encodeURIComponent(fmt(fee))}%0A*Total:* ${encodeURIComponent(fmt(total))}`;if(notes)msg+=`%0A%0A*Observações:* ${encodeURIComponent(notes)}`;window.open(`https://wa.me/5511981341569?text=${msg}`,'_blank')};


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


// V9.7 — Área do cliente
function epLoadJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
function epSaveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function epSaveCustomerProfileFromForm(){
  const current=epLoadJson('ep-customer-profile',{});
  const profile={...current,
    name:document.querySelector('#customerName')?.value.trim()||current.name||'',
    email:document.querySelector('#customerEmail')?.value.trim()||current.email||'',
    phone:(document.querySelector('#customerPhone')?.value||'').replace(/\D/g,'')||current.phone||'',
    cpf:(document.querySelector('#customerCpf')?.value||'').replace(/\D/g,'')||current.cpf||''
  };
  if(typeof isDelivery==='function'&&isDelivery()){
    profile.address={
      cep:document.querySelector('#deliveryCep')?.value||'',
      street:document.querySelector('#deliveryStreet')?.value||'',
      number:document.querySelector('#deliveryNumber')?.value||'',
      neighborhood:document.querySelector('#deliveryNeighborhood')?.value||'',
      complement:document.querySelector('#deliveryComplement')?.value||'',
      reference:document.querySelector('#deliveryReference')?.value||''
    };
  }
  epSaveJson('ep-customer-profile',profile);
  if(profile.phone)localStorage.setItem('ep-client-session',profile.phone);
  return profile;
}
function epSaveCustomerOrder(payload,extra={}){
  if(!payload)return;
  const profile=epSaveCustomerProfileFromForm();
  const list=epLoadJson('ep-customer-orders',[]);
  const subtotal=(payload.items||[]).reduce((sum,item)=>{
    const product=(typeof products!=='undefined'?products:[]).find(p=>p.name===item.name);
    return sum+(Number(product?.price||0)*Number(item.quantity||0));
  },0);
  const record={...payload,...extra,
    customer:{...(payload.customer||{}),phone:profile.phone||payload.customer?.phone},
    created_at:Date.now(),
    estimated_total:subtotal+Number(payload.delivery_fee||0)
  };
  const index=list.findIndex(item=>item.order_id===record.order_id);
  if(index>=0)list[index]={...list[index],...record};else list.unshift(record);
  epSaveJson('ep-customer-orders',list.slice(0,50));
}
function epAttachTrackingToken(orderId,token,extra={}){
  if(!token)return;
  const list=epLoadJson('ep-customer-orders',[]);
  const index=list.findIndex(item=>item.order_id===orderId);
  if(index>=0){list[index]={...list[index],...extra,tracking_token:token};epSaveJson('ep-customer-orders',list)}
}

function getOrderPayload(requireCpf=true){
  const ids=Object.keys(cart);
  if(!ids.length){ alert('Adicione pelo menos um item ao pedido.'); return null; }
  const name=document.querySelector('#customerName').value.trim();
  if(!name){ alert('Informe seu nome.'); return null; }
  const email=document.querySelector('#customerEmail').value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Informe um e-mail válido para gerar o Pix.'); return null; }
  const phone=document.querySelector('#customerPhone')?.value.trim()||'';
  if(!phone){ alert('Informe seu telefone.'); return null; }
  const cpf=(document.querySelector('#customerCpf')?.value||'').replace(/\D/g,'');
  if(requireCpf&&!validarCpf(cpf)){ alert('Informe um CPF válido para gerar o Pix.'); document.querySelector('#customerCpf')?.focus(); return null; }
  const fulfillment=fulfillmentSelect.value;
  const address=composeAddress();
  if(isDelivery()){
    if(!cepInput.value||!streetInput.value){ alert('Informe um CEP válido.'); return null; }
    if(!numberInput.value.trim()){ alert('Informe o número do endereço.'); return null; }
    if(!isPerusCep()){ alert('Este CEP está fora da entrega automática de Perus. Consulte o frete pelo WhatsApp.'); deliveryWhatsapp.click(); return null; }
  }
  const notes=document.querySelector('#notes').value.trim();
  const payload={
    customer:{name,email,phone,cpf,document:cpf,fulfillment,address,cep:cepInput?.value||'',bairro:neighborhoodInput?.value||'',notes},
    delivery_fee:isDelivery()?DELIVERY_FEE:0,
    items:ids.map(id=>({name:products[id].name,quantity:cart[id]})),
    order_id:`EP-${Date.now()}`,
    site_url:window.location.origin
  };
  epSaveCustomerOrder(payload);
  return payload;
}

async function iniciarCheckoutPagBank(){
  const payload=getOrderPayload(false);
  if(!payload) return;
  const metodo=paymentSelect.value==='Cartão de débito'?'DEBIT_CARD':'CREDIT_CARD';
  const original=pagBankButton.textContent;
  pagBankButton.disabled=true;
  pagBankButton.textContent='Abrindo PagBank...';
  try{
    const response=await fetch('https://summer-field-09b7.alanasdls.workers.dev/criar-checkout-pagbank',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,payment_method:metodo})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.checkout_url) throw new Error(data.erro||data.detalhes||'Não foi possível abrir o PagBank.');
    if(data.tracking_token){localStorage.setItem('ep-last-tracking-token',data.tracking_token);epAttachTrackingToken(payload.order_id,data.tracking_token,{payment_provider:'pagbank',checkout_id:data.checkout_id});}
    localStorage.setItem('ep-last-order',JSON.stringify({...payload,payment_provider:'pagbank',checkout_id:data.checkout_id,tracking_token:data.tracking_token}));
    window.location.href=data.checkout_url;
  }catch(e){alert(e.message);}
  finally{pagBankButton.disabled=false;pagBankButton.textContent=original;}
}
if(pagBankButton) pagBankButton.onclick=iniciarCheckoutPagBank;

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
      if(token){localStorage.setItem('ep-last-tracking-token',token);const last=epLoadJson('ep-customer-orders',[])[0];if(last)epAttachTrackingToken(last.order_id,token,{payment_provider:'pix',payment_status:'approved'});setTimeout(()=>{window.location.href=`pedido.html?token=${encodeURIComponent(token)}`},1500);}
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


// ===== Horário de pedidos — Espetinho Perus =====
const STORE_TIMEZONE='America/Sao_Paulo';
function storeNowParts(){
  const parts=new Intl.DateTimeFormat('pt-BR',{timeZone:STORE_TIMEZONE,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
  const obj=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const dayMap={'dom.':0,'seg.':1,'ter.':2,'qua.':3,'qui.':4,'sex.':5,'sáb.':6,'sab.':6};
  return {day:dayMap[obj.weekday]??new Date().getDay(),minutes:Number(obj.hour)*60+Number(obj.minute),time:`${obj.hour}:${obj.minute}`};
}
function storeScheduleInfo(){
  const {day,minutes,time}=storeNowParts();
  let open=1080,close=null;
  if([3,4,0].includes(day)) close=1320;
  if([5,6].includes(day)) close=1380;
  const isOpen=close!==null&&minutes>=open&&minutes<close;
  return {isOpen,day,minutes,time,close};
}
function nextOpeningLabel(){
  const names=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const now=storeScheduleInfo();
  if(now.close!==null&&now.minutes<1080) return `Hoje às 18h`;
  for(let add=1;add<=7;add++){
    const d=(now.day+add)%7;
    if([0,3,4,5,6].includes(d)) return `${names[d][0].toUpperCase()+names[d].slice(1)} às 18h`;
  }
  return 'Quarta-feira às 18h';
}
function applyStoreSchedule(){
  const info=storeScheduleInfo();
  const title=document.querySelector('#storeScheduleTitle');
  const desc=document.querySelector('#storeScheduleDescription');
  const status=document.querySelector('#storeStatusText');
  const box=document.querySelector('#storeSchedule');
  const checkoutButtons=[document.querySelector('#mercadoPagoCheckout'),document.querySelector('#pagBankCheckout'),document.querySelector('#checkout')].filter(Boolean);
  if(info.isOpen){
    if(title) title.textContent=`Pedidos abertos agora • até ${info.close===1380?'23h':'22h'}`;
    if(desc) desc.textContent='Monte seu pedido e escolha entrega ou retirada.';
    if(status) status.textContent=`Aberto agora • até ${info.close===1380?'23h':'22h'}`;
    box?.classList.add('open'); box?.classList.remove('closed');
    checkoutButtons.forEach(btn=>{btn.disabled=false;btn.classList.remove('store-closed-button');btn.removeAttribute('data-store-closed')});
  }else{
    if(title) title.textContent='Pedidos fechados no momento';
    if(desc) desc.textContent=`Próxima abertura: ${nextOpeningLabel()}. Você pode consultar o cardápio e montar o carrinho.`;
    if(status) status.textContent=`Fechado agora • abre ${nextOpeningLabel().toLowerCase()}`;
    box?.classList.add('closed'); box?.classList.remove('open');
    checkoutButtons.forEach(btn=>{btn.disabled=true;btn.classList.add('store-closed-button');btn.dataset.storeClosed='1'});
  }
  document.body.classList.toggle('store-is-closed',!info.isOpen);
}
function ensureStoreOpen(){
  if(storeScheduleInfo().isOpen) return true;
  alert(`Pedidos fechados no momento. Próxima abertura: ${nextOpeningLabel()}.`);
  return false;
}
window.addEventListener('DOMContentLoaded',()=>{applyStoreSchedule();setInterval(applyStoreSchedule,30000)});
// Proteção adicional caso algum manipulador tente finalizar fora do horário.
document.addEventListener('click',e=>{
  const btn=e.target.closest('#mercadoPagoCheckout,#pagBankCheckout,#checkout');
  if(btn&&!storeScheduleInfo().isOpen){e.preventDefault();e.stopImmediatePropagation();ensureStoreOpen();}
},true);


// Área do cliente — preenchimento automático e repetir pedido
(function(){
  const profile=epLoadJson('ep-customer-profile',{});
  const set=(selector,value)=>{const el=document.querySelector(selector);if(el&&value&&!el.value)el.value=value};
  set('#customerName',profile.name);
  set('#customerEmail',profile.email);
  set('#customerPhone',profile.phone);
  set('#customerCpf',profile.cpf);
  if(profile.address){
    set('#deliveryCep',profile.address.cep);
    set('#deliveryStreet',profile.address.street);
    set('#deliveryNumber',profile.address.number);
    set('#deliveryNeighborhood',profile.address.neighborhood);
    set('#deliveryComplement',profile.address.complement);
    set('#deliveryReference',profile.address.reference);
    setTimeout(()=>{if(typeof composeAddress==='function')composeAddress();if(typeof updateCheckoutAvailability==='function')updateCheckoutAvailability()},150);
  }
  const repeat=epLoadJson('ep-repeat-items',[]);
  if(repeat.length&&typeof products!=='undefined'&&typeof cart!=='undefined'){
    repeat.forEach(item=>{
      const product=products.find(p=>String(p.name).toLowerCase()===String(item.name).toLowerCase());
      if(product)cart[product.id]=Number(item.quantity||1);
    });
    localStorage.removeItem('ep-repeat-items');
    if(typeof updateCart==='function')updateCart();
    else if(typeof renderCart==='function')renderCart();
    setTimeout(()=>document.querySelector('#mobileCartButton')?.click(),400);
  }
})();
