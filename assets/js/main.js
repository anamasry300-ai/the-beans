import { loadProducts } from './products.js';
import { renderCart, openCart, closeCart, addToCart } from './cart.js';
import { escapeHtml } from './utils.js';

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}
function initCart() {
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('drawer-backdrop')?.addEventListener('click', closeCart);
  renderCart();
}
function markActive() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href && href === path) a.setAttribute('aria-current','page');
  });
}
function imgSrc(p) { return p.image || 'assets/images/product-placeholder.svg'; }
function hydrateFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  loadProducts().then(products => {
    const featured = products.filter(p => p.featured).slice(0,4);
    grid.innerHTML = featured.map(cardHtml).join('') || '<p class="muted">No featured products.</p>';
    bindAdd(grid);
  }).catch(() => { grid.innerHTML = '<p class="state error">Could not load products.</p>'; });
}
function cardHtml(p) {
  return `
  <article class="product-card">
    <a href="product.html?id=${encodeURIComponent(p.id)}"><img src="${imgSrc(p)}" alt="${escapeHtml(p.name)} coffee bag illustration" loading="lazy" onerror="this.src='assets/images/product-placeholder.svg';this.onerror=null;"></a>
    <div class="product-body">
      <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></h3>
      <p class="small muted">${escapeHtml(p.origin)}</p>
      <p class="price">$${Number(p.priceUsd).toFixed(2)}</p>
      <div class="product-actions">
        <select data-weight="${p.id}">${p.weights.map(w=>`<option value="${w}">${w}g</option>`).join('')}</select>
        <button class="btn btn-primary" data-add="${p.id}">Add</button>
      </div>
    </div>
  </article>`;
}
function bindAdd(grid) {
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.getAttribute('data-add');
    loadProducts().then(products => {
      const p = products.find(x=>x.id===id);
      if (!p) return;
      const sel = grid.querySelector('select[data-weight="' + id + '"]');
      const w = sel ? parseInt(sel.value,10) : p.weights[0];
      addToCart(p,w,1);
    });
  });
}

initNav();
initCart();
markActive();
hydrateFeatured();
