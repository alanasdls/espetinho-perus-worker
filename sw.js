const CACHE = 'espetinho-perus-v101-nomes-oficiais-20260817';
const PRECACHE = [
  './', './index.html', './pedido.html','./cliente.html','./cliente.css?v=20260815-v95-fidelidade-resgate','./cliente.js?v=20260815-v95-fidelidade-resgate', './pedido.css?v=20260724-v2', './pedido.js?v=20260724-v3', './admin.html', './admin.css?v=20260727-v79-admin-studio', './admin.js?v=20260727-v79-admin-studio', './admin-catalog.json?v=20260727-v79', './styles.css?v=20260725-cart-black-v73', './app-misticpay-cpf-v44.js?v=20260817-v101-nomes-oficiais', './pagamento-sucesso.html', './pagamento-pendente.html', './pagamento-falhou.html',
  './manifest.webmanifest', './manifest-admin.webmanifest', './alerta-pedido.wav?v=20260724-v4', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './assets/products/azeitona-20260723.webp',
  './assets/products/batata-com-calabresa-ou-frango-600g-20260723.webp',
  './assets/products/batata-com-cheddar-e-bacon-600g-20260723.webp',
  './assets/products/batata-simples-600g-20260723.webp',
  './assets/products/calabresa-acebolada-600g-20260723.webp',
  './assets/products/camarao-20260723.webp',
  './assets/products/carne-20260723.webp',
  './assets/products/carne-e-bacon-20260723.webp',
  './assets/products/carne-e-calabresa-20260723.webp',
  './assets/products/carne-seca-com-mandioca-600g-20260723.webp',
  './assets/products/cebola-empanada-20260723.webp',
  './assets/products/contra-file-acebolado-600g-20260723.webp',
  './assets/products/frango-20260723.webp',
  './assets/products/frango-a-passarinho-1kg-20260723.webp',
  './assets/products/isca-de-frango-empanado-600g-20260723.webp',
  './assets/products/isca-de-tilapia-600g-20260723.webp',
  './assets/products/kafta-20260723.webp',
  './assets/products/kafta-com-queijo-20260723.webp',
  './assets/products/linguica-apimentada-20260723.webp',
  './assets/products/linguica-calabresa-20260723.webp',
  './assets/products/linguica-toscana-20260723.webp',
  './assets/products/mandioca-com-bacon-600g-20260723.webp',
  './assets/products/medalhao-de-frango-20260723.webp',
  './assets/products/meia-calabresa-meia-frango-20260723.webp',
  './assets/products/pao-de-alho-20260723.webp',
  './assets/products/pernil-20260723.webp',
  './assets/products/pernil-e-bacon-20260723.webp',
  './assets/products/picanha-grelhada-600g-20260723.webp',
  './assets/products/porcao-da-casa-1-2kg-20260723.webp',
  './assets/products/queijo-coalho-20260723.webp',
  './assets/products/salame-com-azeitonas-20260723.webp',
  './assets/products/torresmo-600g-20260723.webp',
  './assets/products/tulipa-20260723.webp',
  './x-burguer.webp',
  './x-salada.webp',
  './x-bacon.webp',
  './x-contra-file.webp',
  './x-calabresa.webp',
  './x-toscana.webp',
  './x-kafta.webp',
  './adicional-batata-frita.webp',
  './adicional-batata-cheddar-bacon.webp',
  './hamburguer-extra.webp',
  './budweiser-330ml.webp',
  './heineken-long-neck.webp',
  './heineken-zero.webp',
  './corona-330ml.webp',
  './corona-zero.webp',
  './stella-long-neck.webp',
  './itaipava-269ml.webp',
  './original-269ml.webp',
  './skol-269ml.webp',
  './amstel-269ml.webp',
  './roleta-russa-ipa.webp',
  './eisenbahn-weizenbier.webp',
  './eisenbahn-pale-ale.webp',
  './red-bull-tradicional.webp',
  './red-bull-sabores.webp',
  './agua-tonica.webp',
  './coca-cola-350ml.webp',
  './coca-cola-zero-350ml.webp',
  './agua-de-coco.webp',
  './agua-sem-gas.webp',
  './agua-com-gas.webp',
  './schweppes-350ml.webp',
  './soda-limonada-350ml.webp',
  './guarana-zero-350ml.webp',
  './guarana-350ml.webp',
  './fanta-uva-350ml.webp',
  './fanta-laranja-350ml.webp',
  './caipirinha-licor-43.webp',
  './caipirinha-vodka-morango.webp',
  './caipirinha-cachaca-morango.webp',
  './caipirinha-vodka-maracuja.webp',
  './caipirinha-saque-maracuja.webp',
  './caipirinha-cachaca-maracuja.webp',
  './caipirinha-cachaca-limao.webp',
  './caipirinha-saque-limao.webp',
  './caipirinha-vodka-limao.webp',
  './batida.webp',
  './lokas-lager-355ml.webp',
  './insano-american-ipa-473ml.webp',
  './insanos-american-lager-355ml.webp',
  './insanos-session-ipa-473ml.webp',
  './nkoz-american-ipa-473ml.webp',
  './nkoz-saisson-ipa-473ml.webp',
  './red-bull-zero-250ml.webp',
  './red-bull-melancia-250ml.webp',
  './red-bull-tropical-250ml.webp',
  './caracu-350ml.webp',
  './xeque-mate.webp',
  './smirnoff-ice.webp',
  './negroni.webp',
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request, {cache:'no-store'}).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});

self.addEventListener('push',event=>{let data={};try{data=event.data?event.data.json():{}}catch(_){data={title:'Espetinho Perus',body:event.data?.text()||'Seu pedido foi atualizado.'}}event.waitUntil(self.registration.showNotification(data.title||'Espetinho Perus',{body:data.body||'Seu pedido foi atualizado.',icon:data.icon||'icon-192.png',badge:'icon-192.png',tag:data.tag||'pedido',data:{url:data.url||'pedido.html'},vibrate:[250,120,250],requireInteraction:Boolean(data.requireInteraction),renotify:true,silent:false}))});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=event.notification.data?.url||'pedido.html';event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c){c.navigate(url);return c.focus()}}return clients.openWindow(url)}))});
