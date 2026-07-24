const CACHE = 'espetinho-perus-v41-cpf-misticpay-20260724';
const PRECACHE = [
  './', './index.html', './pedido.html', './pedido.css?v=20260724-v2', './pedido.js?v=20260724-v3', './admin.html', './admin.css?v=20260724-status3', './admin.js?v=20260724-v4', './styles.css?v=20260724-cpf-misticpay-v41', './app-20260724-mp2-worker.js?v=20260724-cpf-misticpay-v41', './pagamento-sucesso.html', './pagamento-pendente.html', './pagamento-falhou.html',
  './manifest.webmanifest', './alerta-pedido.wav?v=20260724-v4', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
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
  './assets/products/tulipa-20260723.webp'
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
