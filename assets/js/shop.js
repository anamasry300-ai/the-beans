import { loadProducts } from './products.js';
import { addToCart } from './cart.js';
import { escapeHtml } from './utils.js';

const state = { products: [], filters: { q: '', origin: '', roast: '', category: '' } };

function imgSrc(p) { return p.image || 'assets/images/product-placeholder.svg'; }

function render() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  let list = state.products.slice();
  const { q, origin, roast, category } = state.filters;
  if (q) list = list.filter(p => (p.name + ' ' + p.origin + ' ' + (p.flavor||[]).join(' ')).toLowerCase().includes(q.toLowerCase()));
  if (origin) list = list.filter(p => p.origin === origin);
  if (roast) list = list.filter(p => p.roast === roast);
  if (category) list = list.filter(p => p.category === category);
  grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty-state">No products match your filters.</p>';
  document.querySelector('.filters')?.classList.toggle('has-active-filter', !!(q || origin || roast || category));
  bind();
}
function card(p) {
  return `
  <article class="product-card">
    <a href="product.html?id=${encodeURIComponent(p.id)}"><img src="${imgSrc(p)}" alt="${escapeHtml(p.name)} coffee bag illustration" loading="lazy" onerror="this.src='assets/images/product-placeholder.svg';this.onerror=null;"></a>
    <div class="product-body">
      <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></h3>
      <p class="small muted">${escapeHtml(p.origin)} · ${escapeHtml(p.roast)}</p>
      <p class="price">$${Number(p.priceUsd).toFixed(2)}</p>
      <div class="product-actions">
        <select data-weight="${p.id}">${(p.weights||[]).map(w=>`<option value="${w}">${w}g</option>`).join('')}</select>
        <button class="btn btn-primary" data-add="${p.id}">Add</button>
      </div>
    </div>
  </article>`;
}
function bind() {
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-add');
      const p = state.products.find(x=>x.id===id);
      if (!p) return;
      const sel = document.querySelector(`select[data-weight="${id}"]`);
      const w = sel ? parseInt(sel.value,10) : (p.weights && p.weights[0]) || 250;
      addToCart(p,w,1);
    });
  });
}
function populateFilters(products) {
  const origins = [...new Set(products.map(p=>p.origin))];
  const roasts = [...new Set(products.map(p=>p.roast))];
  const cats = [...new Set(products.map(p=>p.category))];
  const oSel = document.getElementById('filter-origin');
  const rSel = document.getElementById('filter-roast');
  const cSel = document.getElementById('filter-category');
  if (oSel) origins.forEach(o => { const opt=document.createElement('option'); opt.value=o; opt.textContent=o; oSel.appendChild(opt); });
  if (rSel) roasts.forEach(r => { const opt=document.createElement('option'); opt.value=r; opt.textContent=r; rSel.appendChild(opt); });
  if (cSel) cats.forEach(c => { const opt=document.createElement('option'); opt.value=c; opt.textContent=c; cSel.appendChild(opt); });
}

loadProducts().then(products => {
  state.products = products;
  populateFilters(products);
  render();
}).catch(() => {
  const grid = document.getElementById('shop-grid');
  if (grid) grid.innerHTML = '<p class="state error">Could not load products.</p>';
});

['search','filter-origin','filter-roast','filter-category'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', (e) => {
    if (id==='search') state.filters.q = e.target.value;
    if (id==='filter-origin') state.filters.origin = e.target.value;
    if (id==='filter-roast') state.filters.roast = e.target.value;
    if (id==='filter-category') state.filters.category = e.target.value;
    render();
  });
});
