const API = 'https://summer-field-09b7.alanasdls.workers.dev';
const $ = (s) => document.querySelector(s);
let key = localStorage.getItem('ep-admin-key') || '';
let orders = [];
let filter = 'ativos';
let period = localStorage.getItem('ep-dashboard-period') || 'today';
let searchTerm = '';
let activeTab = 'ordersTab';
let timer = null;
let ordersSocket = null;
let ordersSocketReconnect = null;
let knownPaid = new Set();
let audioCtx = null;
let adminSwRegistration = null;
let orderAlarm = null;


let realtimeUnseen = new Set(JSON.parse(localStorage.getItem('ep-unseen-orders') || '[]'));
let realtimeAlarmTimer = null;
let realtimeLastSuccess = 0;
let realtimeLoading = false;

function saveRealtimeUnseen() {
  localStorage.setItem('ep-unseen-orders', JSON.stringify([...realtimeUnseen]));
}

function acknowledgeRealtimeOrders() {
  realtimeUnseen.clear();
  saveRealtimeUnseen();
  stopRealtimeAlarm();
  updateRealtimeHeader();
  renderRealtimeBoard();
}

function updateRealtimeHeader() {
  const counter = document.getElementById('newOrdersCounter');
  const text = document.getElementById('realtimeText');
  if (counter) {
    counter.textContent = `${realtimeUnseen.size} ${realtimeUnseen.size === 1 ? 'novo' : 'novos'}`;
    counter.classList.toggle('has-new', realtimeUnseen.size > 0);
  }
  if (text) {
    text.textContent = realtimeLastSuccess
      ? `Online • última sincronização ${new Date(realtimeLastSuccess).toLocaleTimeString('pt-BR')}`
      : 'Conectando ao servidor…';
  }
  document.title = realtimeUnseen.size
    ? `(${realtimeUnseen.size}) Novos pedidos | Espetinho Perus`
    : 'Painel de Pedidos | Espetinho Perus';
}

function startRealtimeAlarm() {
  if (!realtimeUnseen.size || realtimeAlarmTimer) return;
  playOrderAlarm();
  realtimeAlarmTimer = setInterval(() => {
    if (!realtimeUnseen.size) return stopRealtimeAlarm();
    playOrderAlarm();
    if (navigator.vibrate) navigator.vibrate([300, 120, 300]);
  }, 8000);
}

function stopRealtimeAlarm() {
  clearInterval(realtimeAlarmTimer);
  realtimeAlarmTimer = null;
  if (orderAlarm) {
    try { orderAlarm.pause(); orderAlarm.currentTime = 0; } catch (_) {}
  }
}

function realtimeStatus(order) {
  if (order.payment_status !== 'approved') return 'aguardando_pagamento';
  return order.order_status || 'recebido';
}

function nextRealtimeStatus(status) {
  return ({
    recebido: 'em_preparo',
    em_preparo: 'pronto_retirada',
    pronto_retirada: 'saiu_entrega',
    saiu_entrega: 'finalizado'
  })[status] || '';
}

function shortOrderCard(order) {
  const elapsed = elapsedInfo(order);
  const status = realtimeStatus(order);
  const unseen = realtimeUnseen.has(String(order.order_id));
  const next = nextRealtimeStatus(status);
  const itemSummary = (order.items || []).slice(0, 4)
    .map(item => `${Number(item.quantity || 1)}x ${esc(item.name || 'Item')}`).join('<br>');
  const more = (order.items || []).length > 4 ? `<small>+ ${(order.items || []).length - 4} itens</small>` : '';
  return `<article class="board-order ${elapsed.cls || 'ok'} ${unseen ? 'unseen-order' : ''}" data-order-id="${esc(order.order_id)}">
    <div class="board-order-top">
      <div><strong>${esc(order.order_id)}</strong><small>${esc(order.customer?.name || 'Cliente')}</small></div>
      <span class="board-time">${elapsed.mins} min</span>
    </div>
    <div class="board-items">${itemSummary || 'Sem itens'}${more}</div>
    <div class="board-meta">
      <span>${esc(order.customer?.fulfillment || 'Não informado')}</span>
      <b>${fmt(order.total)}</b>
    </div>
    <div class="board-actions">
      ${next ? `<button class="board-next-status" data-order-id="${esc(order.order_id)}" data-status="${next}">${labels[next] || next}</button>` : ''}
      <button class="board-open-order" data-order-id="${esc(order.order_id)}">Detalhes</button>
    </div>
  </article>`;
}

function renderRealtimeBoard() {
  const board = document.getElementById('realtimeBoard');
  if (!board) return;

  const columns = [
    ['recebido', 'Novos', '🆕'],
    ['em_preparo', 'Em preparo', '👨‍🍳'],
    ['pronto_retirada', 'Prontos', '✅'],
    ['saiu_entrega', 'Em entrega', '🛵'],
    ['finalizado', 'Finalizados', '✔']
  ];

  const paid = orders.filter(order => order.payment_status === 'approved');
  board.innerHTML = columns.map(([status, title, icon]) => {
    let list = paid.filter(order => realtimeStatus(order) === status);
    if (status === 'finalizado') {
      list = list.sort((a,b) => orderMoment(b) - orderMoment(a)).slice(0, 12);
    } else {
      list = list.sort((a,b) => orderMoment(a) - orderMoment(b));
    }
    return `<section class="board-column status-${status}">
      <header><div><span>${icon}</span><strong>${title}</strong></div><b>${list.length}</b></header>
      <div class="board-column-body">${list.length ? list.map(shortOrderCard).join('') : '<div class="board-empty">Nenhum pedido</div>'}</div>
    </section>`;
  }).join('');
}

async function realtimePatchStatus(orderId, status) {
  const order = orders.find(item => String(item.order_id) === String(orderId));
  try {
    await api('/admin/orders/' + encodeURIComponent(orderId), {
      method: 'PATCH',
      body: JSON.stringify({
        order_status: status,
        estimated_minutes: Number(order?.estimated_minutes || 25)
      })
    });
    realtimeUnseen.delete(String(orderId));
    saveRealtimeUnseen();
    await loadOrders(false);
  } catch (error) {
    alert(`Não foi possível atualizar o status.\n${error.message}`);
  }
}

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (v) => new Date(v).toLocaleString('pt-BR');

function authHeaders() {
  return { 'X-Admin-Key': key, 'Content-Type': 'application/json' };
}

async function api(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error('Senha inválida. Entre novamente.');
  if (!response.ok) throw new Error(data.erro || data.detalhes || `Falha HTTP ${response.status}.`);
  return data;
}

function connectOrdersSocket() {
  clearTimeout(ordersSocketReconnect);
  if (!key || document.visibilityState === 'hidden') return;
  if (ordersSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(ordersSocket.readyState)) return;
  ordersSocket = new WebSocket(API.replace(/^http/, 'ws') + '/admin/realtime?key=' + encodeURIComponent(key));
  ordersSocket.onopen = () => {
    const text = document.getElementById('realtimeText');
    if (text) text.textContent = 'Online • WebSocket em tempo real';
  };
  ordersSocket.onmessage = (event) => {
    if (event.data === 'pong') return;
    loadOrders(false);
  };
  ordersSocket.onerror = () => { try { ordersSocket.close(); } catch (_) {} };
  ordersSocket.onclose = () => {
    ordersSocket = null;
    const text = document.getElementById('realtimeText');
    if (text) text.textContent = 'Reconectando • modo econômico';
    ordersSocketReconnect = setTimeout(connectOrdersSocket, 5000);
  };
}


function showPanel() {
  document.body.classList.add('authenticated');
  $('#login').hidden = true;
  $('#login').style.display = 'none';
  $('#panel').hidden = false;
  loadOrders(true);
  connectOrdersSocket();
  clearInterval(timer);
  timer = setInterval(() => { if (document.visibilityState === 'visible') loadOrders(false); }, 60000);
}

function logout() {
  localStorage.removeItem('ep-admin-key');
  key = '';
  location.reload();
}

$('#loginBtn').onclick = async () => {
  key = $('#keyInput').value.trim();
  if (!key) return;
  try {
    await api('/admin/orders');
    localStorage.setItem('ep-admin-key', key);
    showPanel();
  } catch (error) {
    $('#loginError').textContent = error.message;
  }
};

$('#keyInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') $('#loginBtn').click();
});
$('#logoutBtn').onclick = logout;
$('#refreshBtn').onclick = () => loadOrders(false);

$('#filters').onclick = (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  filter = button.dataset.filter;
  document.querySelectorAll('#filters button').forEach((item) => item.classList.toggle('active', item === button));
  render();
};

async function enableAlerts() {
  try {
    if (!window.isSecureContext) throw new Error('Abra o painel pelo endereço HTTPS.');
    if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new Error('Este navegador não oferece notificações.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permissão de notificação não concedida.');
    adminSwRegistration = await navigator.serviceWorker.register('./sw.js?v=20260725-v10-realtime', { scope: './' });
    await navigator.serviceWorker.ready;
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    orderAlarm = orderAlarm || new Audio('./alerta-pedido.wav?v=20260725-v10');
    orderAlarm.preload = 'auto';
    orderAlarm.volume = 1;
    // Desbloqueia a reprodução de áudio durante o toque do usuário.
    await orderAlarm.play();
    orderAlarm.pause();
    orderAlarm.currentTime = 0;
    beep();
    await adminSwRegistration.showNotification('Alertas ativados', {
      body: 'Novos pedidos pagos aparecerão na central de notificações e também emitirão som.',
      icon: './icon-192.png', badge: './icon-192.png', tag: 'admin-alertas-teste',
      data: { url: './admin.html' }, requireInteraction: false
    });
    $('#alertsBtn').textContent = '🔔 Alertas ativos';
  } catch (error) {
    alert(error.message || 'Não foi possível ativar os alertas neste navegador.');
  }
}
$('#alertsBtn').onclick = enableAlerts;

async function playOrderAlarm() {
  try {
    if (!orderAlarm) {
      orderAlarm = new Audio('./alerta-pedido.wav?v=20260725-v10');
      orderAlarm.preload = 'auto';
      orderAlarm.volume = 1;
    }
    orderAlarm.currentTime = 0;
    await orderAlarm.play();
  } catch (_) {
    // Fallback para o alerta sintetizado quando o navegador bloquear o arquivo de áudio.
    beep();
  }
}

function beep() {
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.7);
}

async function notifyNew(list, initial) {
  const paid = list.filter((order) => order.payment_status === 'approved');
  if (initial) {
    knownPaid = new Set(paid.map((order) => order.order_id));
    return;
  }
  for (const order of paid) {
    if (!knownPaid.has(order.order_id)) {
      await playOrderAlarm();
      if (Notification.permission === 'granted') {
        const reg = adminSwRegistration || await navigator.serviceWorker.ready.catch(() => null);
        if (reg) {
          await reg.showNotification('Novo pedido pago!', {
            body: `${order.customer?.name || 'Cliente'} • ${fmt(order.total)} • ${order.order_id}`,
            icon: './icon-192.png', badge: './icon-192.png', tag: `admin-${order.order_id}`,
            data: { url: './admin.html' }, requireInteraction: true, vibrate: [250, 120, 250]
          });
        }
      }
      knownPaid.add(order.order_id);
    }
  }
}

async function loadOrders(initial = false) {
  if (realtimeLoading) return;
  realtimeLoading = true;
  try {
    const previousIds = new Set(orders.filter(order => order.payment_status === 'approved').map(order => String(order.order_id)));
    const data = await api('/admin/orders');
    const incoming = data.pedidos || [];
    if (!initial) {
      incoming.filter(order => order.payment_status === 'approved').forEach(order => {
        const id = String(order.order_id);
        if (!previousIds.has(id) && !knownPaid.has(order.order_id)) realtimeUnseen.add(id);
      });
      if (realtimeUnseen.size) {
        saveRealtimeUnseen();
        startRealtimeAlarm();
      }
    }
    orders = incoming;
    await notifyNew(orders, initial);
    realtimeLastSuccess = Date.now();
    $('#connection').textContent = `Online • ${new Date().toLocaleTimeString('pt-BR')}`;
    $('#connection').className = 'connection ok';
    updateRealtimeHeader();
    render();
  } catch (error) {
    $('#connection').textContent = error.message;
    $('#connection').className = 'connection bad';
    const realtimeText = document.getElementById('realtimeText');
    if (realtimeText) realtimeText.textContent = 'Conexão interrompida • tentando novamente…';
    if (error.message.includes('Senha')) logout();
  } finally {
    realtimeLoading = false;
  }
}


function paymentKind(order) {
  const raw = [
    order.payment_method,
    order.payment_method_name,
    order.payment_type,
    order.payment_provider,
    order.payment?.method,
    order.payment?.type,
    order.customer?.payment
  ].filter(Boolean).join(' ').toLowerCase();
  if (raw.includes('debit')) return 'debit';
  if (raw.includes('credit') || raw.includes('cartão de crédito') || raw.includes('cartao de credito')) return 'credit';
  if (raw.includes('cash') || raw.includes('dinheiro')) return 'cash';
  if (raw.includes('pix') || raw.includes('mistic')) return 'pix';
  if (raw.includes('pagbank') || raw.includes('card') || raw.includes('cartão') || raw.includes('cartao')) return 'credit';
  return 'other';
}

function paymentLabel(order) {
  return ({pix:'PIX',credit:'CARTÃO DE CRÉDITO',debit:'CARTÃO DE DÉBITO',cash:'DINHEIRO',other:'OUTRO'})[paymentKind(order)];
}

function orderMoment(order) {
  const value = order.paid_at || order.updated_at || order.created_at;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function inSelectedPeriod(order) {
  const d = orderMoment(order);
  const now = new Date();
  if (period === 'all') return true;
  if (period === 'today') return d.toDateString() === now.toDateString();
  if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === '7days') {
    const start = new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate()-6);
    return d >= start && d <= now;
  }
  return true;
}

function renderPaymentChart(summary) {
  const chart = $('#paymentChart');
  if (!chart) return;
  const rows = [
    ['Pix', summary.pix, 'pix'],
    ['Crédito', summary.credit, 'credit'],
    ['Débito', summary.debit, 'debit'],
    ['Dinheiro', summary.cash, 'cash']
  ];
  const max = Math.max(1, ...rows.map(([,data]) => data.total));
  chart.innerHTML = rows.map(([label,data,kind]) => `<div class="chart-row"><span>${label}</span><div class="chart-track"><i class="chart-bar ${kind}" style="width:${Math.max(data.total ? 4 : 0,(data.total/max)*100)}%"></i></div><b>${fmt(data.total)}</b></div>`).join('');
}

function visible(order) {
  const filterOk = filter === 'todos' ? true :
    filter === 'ativos' ? order.payment_status === 'approved' && !['finalizado','cancelado'].includes(order.order_status) :
    order.order_status === filter || order.payment_status === filter;
  if (!filterOk) return false;
  if (!searchTerm) return true;
  const haystack = [order.order_id, order.customer?.name, order.customer?.phone, order.customer?.address]
    .filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(searchTerm);
}

const labels = {
  aguardando_pagamento: 'Aguardando Pix',
  recebido: 'Recebido',
  em_preparo: 'Em preparo',
  pronto_retirada: 'Pronto para retirada',
  saiu_entrega: 'Saiu para entrega',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado'
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function render() {
  const paidPeriod = orders.filter((order) => order.payment_status === 'approved' && inSelectedPeriod(order));
  const revenue = paidPeriod.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const summary = {
    pix: { total: 0, count: 0 }, credit: { total: 0, count: 0 },
    debit: { total: 0, count: 0 }, cash: { total: 0, count: 0 }, other: { total: 0, count: 0 }
  };
  paidPeriod.forEach((order) => {
    const kind = paymentKind(order);
    summary[kind].total += Number(order.total || 0);
    summary[kind].count += 1;
  });
  $('#paidToday').textContent = paidPeriod.length;
  $('#paidTodayLabel').textContent = `${paidPeriod.length} ${paidPeriod.length === 1 ? 'pedido pago' : 'pedidos pagos'}`;
  $('#revenueToday').textContent = fmt(revenue);
  $('#avgTicket').textContent = fmt(paidPeriod.length ? revenue / paidPeriod.length : 0);
  $('#pendingCount').textContent = orders.filter((order) => order.payment_status === 'approved' && !['finalizado', 'cancelado'].includes(order.order_status)).length;
  ['pix','credit','debit','cash'].forEach((kind) => {
    $('#' + kind + 'Total').textContent = fmt(summary[kind].total);
    $('#' + kind + 'Count').textContent = `${summary[kind].count} ${summary[kind].count === 1 ? 'pedido' : 'pedidos'}`;
  });
  renderPaymentChart(summary);
  const list = orders.filter(visible);
  $('#orders').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">Nenhum pedido neste filtro.</div>';
  renderEnterprise();
  renderRealtimeBoard();
  updateRealtimeHeader();
}

function elapsedInfo(order) {
  const start = new Date(order.created_at).getTime();
  const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
  const cls = mins >= 20 ? 'late' : mins >= 10 ? 'warn' : '';
  return { mins, cls };
}

function phoneLink(phone) { return String(phone || '').replace(/\D/g,''); }

function card(order) {
  const paid = order.payment_status === 'approved';
  const items = (order.items || []).map((item) => `<li><b>${item.quantity}x</b> ${esc(item.name)} <span>— ${fmt(item.subtotal)}</span></li>`).join('');
  const phoneRaw = order.customer?.phone || '';
  const phone = phoneRaw ? `<p>📞 ${esc(phoneRaw)}</p>` : '';
  const address = order.customer?.address ? `<p>📍 ${esc(order.customer.address)}</p>` : '';
  const notes = order.customer?.notes ? `<div class="notes"><b>Observações</b><br>${esc(order.customer.notes)}</div>` : '';
  const elapsed = elapsedInfo(order);
  const statuses = ['recebido','em_preparo','pronto_retirada','saiu_entrega','finalizado','cancelado'];
  const quick = statuses.map(status => `<button class="quick-status-btn ${order.order_status===status?'current':''}" data-order-id="${esc(order.order_id)}" data-status="${status}">${labels[status]}</button>`).join('');
  const vip = Number(order.customer?.order_count || 0) >= 5 ? '<span class="vip">CLIENTE VIP</span>' : '';
  const whatsapp = phoneRaw ? `<a class="mini-btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/55${phoneLink(phoneRaw)}"><svg class="whatsapp-logo" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a12.7 12.7 0 0 0-11 19.1L3.4 28.6l6.7-1.8A12.8 12.8 0 1 0 16 3Zm0 23.2c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4A10.4 10.4 0 1 1 16 26.2Zm5.8-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.5 8.5 0 0 1-2.5-1.6 9.4 9.4 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6.3-.6c.1-.2 0-.5 0-.7s-.7-1.8-1-2.4c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.2 1 3.4 1.1 4.6.9.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.2-.1-.4-.2-.7-.3Z"/></svg><span>Ver WhatsApp</span></a>` : '';
  return `<article class="order ${paid ? 'approved' : 'awaiting'}">
    <div class="order-head"><div><h2>Pedido ${esc(order.order_id)}</h2><small>${date(order.created_at)}</small></div>
    <div class="badges"><span class="badge payment ${paymentKind(order)}">${esc(paymentLabel(order))}</span><span class="badge ${paid ? 'paid' : 'wait'}">${paid ? 'PAGO' : esc(order.payment_status || 'pendente').toUpperCase()}</span></div></div>
    <div class="order-body"><ul class="items">${items}</ul><div class="order-total"><span>Total</span><strong>${fmt(order.total)}</strong></div>
    <div class="customer-box"><p><b>👤 ${esc(order.customer?.name || 'Cliente')}</b>${vip}</p>${phone}<p>📦 ${esc(order.customer?.fulfillment || 'Não informado')}</p>${address}<div class="customer-actions">${whatsapp}<button class="mini-btn print-btn" data-order-id="${esc(order.order_id)}">Reimprimir</button></div>${notes}</div></div>
    <div class="status-strip"><div class="status-title"><span>${labels[order.order_status] || esc(order.order_status)}</span><span class="elapsed ${elapsed.cls}">${elapsed.mins} min</span></div>
    <div class="quick-status">${quick}</div><div class="estimate-row">Tempo estimado <input class="estimate-input" type="number" min="0" max="240" value="${Number(order.estimated_minutes||25)}"> min</div></div>
  </article>`;
}

$('#orders').addEventListener('click', async (event) => {
  const statusBtn = event.target.closest('.quick-status-btn');
  if (statusBtn) {
    const card = statusBtn.closest('.order');
    const orderId = statusBtn.dataset.orderId;
    const status = statusBtn.dataset.status;
    card.querySelectorAll('.quick-status-btn').forEach(b => b.disabled = true);
    try {
      await api('/admin/orders/' + encodeURIComponent(orderId), {
        method: 'PATCH',
        body: JSON.stringify({ order_status: status, estimated_minutes: Number(card.querySelector('.estimate-input')?.value || 25) })
      });
      await loadOrders(false);
    } catch (error) { alert(`Não foi possível atualizar o status.\n${error.message}`); }
    return;
  }
  const printBtn = event.target.closest('.print-btn');
  if (printBtn) {
    const order = orders.find(o => String(o.order_id) === String(printBtn.dataset.orderId));
    if (!order) return;
    const win = window.open('', '_blank', 'width=420,height=720');
    const items = (order.items||[]).map(i => `<p>${i.quantity}x ${esc(i.name)} — ${fmt(i.subtotal)}</p>`).join('');
    win.document.write(`<html><head><title>${esc(order.order_id)}</title><style>body{font:16px monospace;padding:18px}h1{text-align:center;font-size:22px}hr{border:0;border-top:1px dashed #000}</style></head><body><h1>ESPETINHO PERUS</h1><hr><b>Pedido ${esc(order.order_id)}</b><p>${date(order.created_at)}</p><hr>${items}<hr><h2>Total: ${fmt(order.total)}</h2><p>${esc(order.customer?.name||'Cliente')}</p><p>${esc(order.customer?.phone||'')}</p><p>${esc(order.customer?.fulfillment||'')}</p><p>${esc(order.customer?.notes||'')}</p><script>window.print();<\/script></body></html>`);
    win.document.close();
  }
});

$('#searchInput').addEventListener('input', (event) => { searchTerm = event.target.value.trim().toLowerCase(); render(); });
document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
  activeTab = button.dataset.tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === button));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active-panel', p.id === activeTab));
}));

const periodSelect = $('#periodSelect');
if (periodSelect) { periodSelect.value = period; periodSelect.onchange = () => { period = periodSelect.value; localStorage.setItem('ep-dashboard-period', period); render(); }; }



// ============================================================
// V9.6 — PAINEL ENTERPRISE
// ============================================================
let performancePeriod = localStorage.getItem('ep-performance-period') || '7days';

function periodMatch(order, selectedPeriod) {
  const d = orderMoment(order);
  const now = new Date();
  if (selectedPeriod === 'all') return true;
  if (selectedPeriod === 'today') return d.toDateString() === now.toDateString();
  if (selectedPeriod === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (selectedPeriod === '7days') {
    const start = new Date(now);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - 6);
    return d >= start && d <= now;
  }
  return true;
}

function enterpriseFulfillment(order) {
  const raw = [
    order.customer?.fulfillment,
    order.fulfillment,
    order.delivery_type,
    order.order_type
  ].filter(Boolean).join(' ').toLowerCase();

  if (raw.includes('entrega') || raw.includes('delivery')) return 'delivery';
  if (raw.includes('retirada') || raw.includes('pickup') || raw.includes('balcão') || raw.includes('balcao')) return 'pickup';
  return 'other';
}

function enterpriseUpdateClock() {
  const el = document.getElementById('enterpriseClock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('pt-BR', {
    weekday:'long', day:'2-digit', month:'long'
  }) + ' • ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
}

function renderOperationalStatus() {
  const paid = orders.filter(order => order.payment_status === 'approved');
  const selected = paid.filter(inSelectedPeriod);
  const countStatus = status => selected.filter(order => order.order_status === status).length;

  const set = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  set('statusReceived', countStatus('recebido'));
  set('statusPreparing', countStatus('em_preparo'));
  set('statusReady', countStatus('pronto_retirada'));
  set('statusDelivery', countStatus('saiu_entrega'));
  set('statusDone', countStatus('finalizado'));
  set('statusWaiting', orders.filter(order => order.payment_status !== 'approved').length);
}

function renderHourlyEnterprise() {
  const container = document.getElementById('hourlyChart');
  if (!container) return;

  const selected = orders.filter(order => order.payment_status === 'approved' && inSelectedPeriod(order));
  const hours = Array.from({length:24}, (_, hour) => ({hour, total:0, count:0}));

  selected.forEach(order => {
    const d = orderMoment(order);
    const h = d.getHours();
    hours[h].total += Number(order.total || 0);
    hours[h].count += 1;
  });

  const max = Math.max(1, ...hours.map(item => item.total));
  const peak = hours.reduce((best, item) => item.total > best.total ? item : best, hours[0]);

  const peakLabel = document.getElementById('peakHourLabel');
  if (peakLabel) peakLabel.textContent = peak.total ? `Pico: ${String(peak.hour).padStart(2,'0')}h` : 'Sem dados';

  container.innerHTML = hours.map(item => {
    const height = item.total ? Math.max(6, (item.total / max) * 100) : 2;
    return `<div class="hour-column" title="${String(item.hour).padStart(2,'0')}h • ${item.count} pedidos • ${fmt(item.total)}">
      <i style="height:${height}%"></i>
      <small>${String(item.hour).padStart(2,'0')}</small>
    </div>`;
  }).join('');
}

function renderFulfillmentEnterprise() {
  const selected = orders.filter(order => order.payment_status === 'approved' && inSelectedPeriod(order));
  const counts = {delivery:0,pickup:0,other:0};
  selected.forEach(order => counts[enterpriseFulfillment(order)]++);
  const total = Math.max(1, selected.length);
  const pct = Math.round((counts.delivery / total) * 100);

  const ring = document.getElementById('fulfillmentRing');
  if (ring) ring.style.setProperty('--delivery-pct', `${pct}%`);

  const values = {
    deliveryPercent:`${pct}%`,
    deliveryCount:counts.delivery,
    pickupCount:counts.pickup,
    otherFulfillmentCount:counts.other
  };
  Object.entries(values).forEach(([id,value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function renderTopProducts(selected) {
  const el = document.getElementById('topProducts');
  if (!el) return;

  const map = new Map();
  selected.forEach(order => {
    (order.items || []).forEach(item => {
      const name = String(item.name || 'Produto');
      const current = map.get(name) || {name, qty:0, total:0};
      current.qty += Number(item.quantity || 0);
      current.total += Number(item.subtotal || 0);
      map.set(name, current);
    });
  });

  const ranking = [...map.values()].sort((a,b) => b.qty - a.qty || b.total - a.total).slice(0,8);
  el.innerHTML = ranking.length ? ranking.map((item,index) => `
    <li>
      <span class="rank">${index + 1}</span>
      <div><strong>${esc(item.name)}</strong><small>${item.qty} unidades</small></div>
      <b>${fmt(item.total)}</b>
    </li>`).join('') : '<li><div><strong>Sem vendas no período</strong><small>O ranking aparecerá após os pedidos.</small></div></li>';
}

function renderDailyEnterprise(selected) {
  const el = document.getElementById('dailyChart');
  if (!el) return;

  const map = new Map();
  selected.forEach(order => {
    const d = orderMoment(order);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const current = map.get(key) || {date:new Date(d.getFullYear(),d.getMonth(),d.getDate()), total:0, count:0};
    current.total += Number(order.total || 0);
    current.count += 1;
    map.set(key,current);
  });

  let rows = [...map.values()].sort((a,b) => a.date - b.date);
  if (rows.length > 14) rows = rows.slice(-14);
  const max = Math.max(1, ...rows.map(row => row.total));

  el.innerHTML = rows.length ? rows.map(row => {
    const height = Math.max(5,(row.total/max)*100);
    return `<div class="day-column" title="${row.count} pedidos • ${fmt(row.total)}">
      <i style="height:${height}%"></i>
      <strong>${row.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</strong>
      <small>${row.count} ped.</small>
    </div>`;
  }).join('') : '<div class="empty">Sem vendas no período selecionado.</div>';
}

function renderTopCustomers(selected) {
  const el = document.getElementById('topCustomers');
  if (!el) return;

  const map = new Map();
  selected.forEach(order => {
    const name = String(order.customer?.name || 'Cliente');
    const phone = String(order.customer?.phone || '');
    const key = phone.replace(/\D/g,'') || name.toLowerCase();
    const current = map.get(key) || {name, phone, count:0, total:0};
    current.count++;
    current.total += Number(order.total || 0);
    map.set(key,current);
  });

  const ranking = [...map.values()].sort((a,b) => b.total - a.total).slice(0,6);
  el.innerHTML = ranking.length ? ranking.map((item,index) => `
    <article class="customer-rank-card">
      <span>#${index + 1} • ${item.count} ${item.count === 1 ? 'pedido' : 'pedidos'}</span>
      <strong>${esc(item.name)}</strong>
      <b>${fmt(item.total)}</b>
    </article>`).join('') : '<div class="empty">Sem clientes no período.</div>';
}

function renderPerformanceEnterprise() {
  const selected = orders.filter(order => order.payment_status === 'approved' && periodMatch(order, performancePeriod));

  const active = orders.filter(order =>
    order.payment_status === 'approved' &&
    !['finalizado','cancelado'].includes(order.order_status)
  );

  const avgMinutes = active.length
    ? Math.round(active.reduce((sum,order) => sum + elapsedInfo(order).mins,0) / active.length)
    : 0;

  const largest = selected.reduce((best,order) =>
    Number(order.total || 0) > Number(best?.total || 0) ? order : best, null);

  const customerCount = new Map();
  selected.forEach(order => {
    const key = String(order.customer?.phone || order.customer?.name || '').toLowerCase();
    if (key) customerCount.set(key,(customerCount.get(key)||0)+1);
  });
  const repeats = [...customerCount.values()].filter(count => count > 1).length;

  const allPaid = orders.filter(order => order.payment_status === 'approved' && periodMatch(order, performancePeriod));
  const completed = allPaid.filter(order => order.order_status === 'finalizado').length;
  const completion = allPaid.length ? Math.round((completed/allPaid.length)*100) : 0;

  const values = {
    avgOpenTime:`${avgMinutes} min`,
    largestOrder:largest ? fmt(largest.total) : fmt(0),
    largestOrderId:largest ? `Pedido ${largest.order_id}` : 'sem pedidos',
    repeatCustomers:repeats,
    completionRate:`${completion}%`
  };
  Object.entries(values).forEach(([id,value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  renderTopProducts(selected);
  renderDailyEnterprise(selected);
  renderTopCustomers(selected);
}

function renderEnterprise() {
  enterpriseUpdateClock();
  renderOperationalStatus();
  renderHourlyEnterprise();
  renderFulfillmentEnterprise();
  renderPerformanceEnterprise();
}

setInterval(enterpriseUpdateClock,1000);

const performancePeriodSelect = document.getElementById('performancePeriodSelect');
if (performancePeriodSelect) {
  performancePeriodSelect.value = performancePeriod;
  performancePeriodSelect.addEventListener('change', () => {
    performancePeriod = performancePeriodSelect.value;
    localStorage.setItem('ep-performance-period',performancePeriod);
    renderPerformanceEnterprise();
  });
}



document.getElementById('acknowledgeOrdersBtn')?.addEventListener('click', acknowledgeRealtimeOrders);

document.getElementById('realtimeBoard')?.addEventListener('click', async (event) => {
  const next = event.target.closest('.board-next-status');
  if (next) {
    next.disabled = true;
    await realtimePatchStatus(next.dataset.orderId, next.dataset.status);
    return;
  }
  const open = event.target.closest('.board-open-order, .board-order');
  if (open) {
    const id = open.dataset.orderId || open.closest('.board-order')?.dataset.orderId;
    if (!id) return;
    realtimeUnseen.delete(String(id));
    saveRealtimeUnseen();
    if (!realtimeUnseen.size) stopRealtimeAlarm();
    filter = 'todos';
    document.querySelectorAll('#filters button').forEach(button =>
      button.classList.toggle('active', button.dataset.filter === 'todos'));
    searchTerm = String(id).toLowerCase();
    const search = document.getElementById('searchInput');
    if (search) search.value = id;
    render();
    document.getElementById('orders')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
});

setInterval(() => {
  document.querySelectorAll('.order .elapsed, .board-order .board-time').forEach(() => {});
  renderRealtimeBoard();
}, 30000);


if (key) showPanel();


document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadOrders(false);
    connectOrdersSocket();
  } else if (ordersSocket) {
    try { ordersSocket.close(1000, 'painel oculto'); } catch (_) {}
  }
});
