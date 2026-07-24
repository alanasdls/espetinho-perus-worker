const API = 'https://summer-field-09b7.alanasdls.workers.dev';
const $ = (s) => document.querySelector(s);
let key = localStorage.getItem('ep-admin-key') || '';
let orders = [];
let filter = 'ativos';
let timer = null;
let knownPaid = new Set();
let audioCtx = null;
let adminSwRegistration = null;
let orderAlarm = null;

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

function showPanel() {
  $('#login').hidden = true;
  $('#panel').hidden = false;
  loadOrders(true);
  clearInterval(timer);
  timer = setInterval(() => loadOrders(false), 5000);
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
    adminSwRegistration = await navigator.serviceWorker.register('./sw.js?v=20260724-v3', { scope: './' });
    await navigator.serviceWorker.ready;
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    orderAlarm = orderAlarm || new Audio('./alerta-pedido.wav?v=20260724-v4');
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
      orderAlarm = new Audio('./alerta-pedido.wav?v=20260724-v4');
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
  try {
    const data = await api('/admin/orders');
    orders = data.pedidos || [];
    await notifyNew(orders, initial);
    $('#connection').textContent = `Online • ${new Date().toLocaleTimeString('pt-BR')}`;
    $('#connection').className = 'connection ok';
    render();
  } catch (error) {
    $('#connection').textContent = error.message;
    $('#connection').className = 'connection bad';
    if (error.message.includes('Senha')) logout();
  }
}

function visible(order) {
  if (filter === 'todos') return true;
  if (filter === 'ativos') return order.payment_status === 'approved' && !['finalizado', 'cancelado'].includes(order.order_status);
  return order.order_status === filter || order.payment_status === filter;
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
  const today = new Date().toLocaleDateString('pt-BR');
  const paidToday = orders.filter((order) => order.payment_status === 'approved' && new Date(order.paid_at || order.updated_at).toLocaleDateString('pt-BR') === today);
  $('#paidToday').textContent = paidToday.length;
  $('#revenueToday').textContent = fmt(paidToday.reduce((sum, order) => sum + Number(order.total || 0), 0));
  $('#pendingCount').textContent = orders.filter((order) => order.payment_status === 'approved' && !['finalizado', 'cancelado'].includes(order.order_status)).length;
  const list = orders.filter(visible);
  $('#orders').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">Nenhum pedido neste filtro.</div>';
}

function card(order) {
  const paid = order.payment_status === 'approved';
  const items = (order.items || []).map((item) => `<li><b>${item.quantity}x</b> ${esc(item.name)} — ${fmt(item.subtotal)}</li>`).join('');
  const phone = order.customer?.phone ? `<p>📞 ${esc(order.customer.phone)}</p>` : '';
  const address = order.customer?.address ? `<p>📍 ${esc(order.customer.address)}</p>` : '';
  const notes = order.customer?.notes ? `<p>📝 ${esc(order.customer.notes)}</p>` : '';
  const statusOptions = ['recebido', 'em_preparo', 'pronto_retirada', 'saiu_entrega', 'finalizado', 'cancelado']
    .map((status) => `<option value="${status}" ${order.order_status === status ? 'selected' : ''}>${labels[status]}</option>`)
    .join('');
  return `<article class="order ${paid ? 'approved' : 'awaiting'}">
    <div class="order-head"><div><h2>Pedido ${esc(order.order_id)}</h2><small>${date(order.created_at)}</small></div>
    <div class="badges"><span class="badge ${paid ? 'paid' : 'wait'}">${paid ? 'PIX PAGO' : 'PIX ' + esc(order.payment_status || 'pendente').toUpperCase()}</span><span class="badge">${labels[order.order_status] || esc(order.order_status)}</span></div></div>
    <div class="order-body"><div><ul class="items">${items}</ul><p class="total">Total: ${fmt(order.total)}</p></div>
    <div class="customer"><p><b>👤 ${esc(order.customer?.name || 'Cliente')}</b></p>${phone}<p>📦 ${esc(order.customer?.fulfillment || 'Não informado')}</p>${address}${notes}</div></div>
    <div class="status-actions"><label>Status do pedido</label><div class="estimate-admin">Tempo estimado: <input class="estimate-input" type="number" min="0" max="240" value="${Number(order.estimated_minutes||25)}"> min</div><select class="status-select" data-order-id="${esc(order.order_id)}" data-current="${esc(order.order_status)}">${statusOptions}</select></div>
  </article>`;
}

$('#orders').addEventListener('change', async (event) => {
  const select = event.target.closest('.status-select');
  if (!select) return;
  const previous = select.dataset.current;
  const orderId = select.dataset.orderId;
  const status = select.value;
  select.disabled = true;
  try {
    await api('/admin/orders/' + encodeURIComponent(orderId), {
      method: 'PATCH',
      body: JSON.stringify({ order_status: status, estimated_minutes: Number(select.closest('.status-actions').querySelector('.estimate-input')?.value || 25) })
    });
    select.dataset.current = status;
    await loadOrders(false);
  } catch (error) {
    select.value = previous;
    alert(`Não foi possível atualizar o status.\n${error.message}`);
  } finally {
    select.disabled = false;
  }
});

if (key) showPanel();
