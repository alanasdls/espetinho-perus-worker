/* V109: indicação de seção na navegação. Não faz chamadas à API. */
(() => {
  'use strict';
  const nav = document.querySelector('.mobile-app-nav');
  const menu = document.getElementById('cardapio');
  const cart = document.getElementById('cartOverlay');
  if (!nav || !menu) return;
  const homeLink = nav.querySelector('a[href="#inicio"]');
  const menuLink = nav.querySelector('a[href="#cardapio"]');
  const cartButton = document.getElementById('mobileCartButton');
  let pending = false;
  function update() {
    pending = false;
    const current = cart?.classList.contains('open') ? cartButton :
      (menu.getBoundingClientRect().top < window.innerHeight * 0.45 ? menuLink : homeLink);
    for (const el of [homeLink, menuLink, cartButton]) {
      if (!el) continue;
      const active = el === current;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'location');
      else el.removeAttribute('aria-current');
    }
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  if (cart) new MutationObserver(schedule).observe(cart, { attributes: true, attributeFilter: ['class'] });
  update();
})();
