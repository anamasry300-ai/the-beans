import { loadProducts } from './products.js';

const grid = document.getElementById('origin-grid');
const productsWrap = document.getElementById('origin-products');
const imgFor = (o) => o.image || 'assets/images/origin-placeholder.svg';

fetch('assets/data/origins.json').then(r => {
  if (!r.ok) throw new Error('fetch failed');
  return r.json();
}).then(data => {
  const origins = data.origins || [];
  if (grid) grid.innerHTML = origins.map(o => `
    <article class="origin-card">
      <img src="${imgFor(o)}" alt="${o.name} origin illustration" loading="lazy" onerror="this.src='assets/images/origin-placeholder.svg';this.onerror=null;">
      <h3>${o.name}</h3>
      <p class="small muted">${o.note}</p>
      <a href="#" data-origin="${o.name}">View coffees</a>
    </article>`).join('');
  grid?.querySelectorAll('[data-origin]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const name = a.getAttribute('data-origin');
      loadProducts().then(products => {
        const list = products.filter(p => p.origin === name);
        if (productsWrap) productsWrap.innerHTML = list.length
          ? `<h3>Coffees from ${name}</h3><div class="product-grid">${list.map(p=>`
              <article class="product-card"><a href="product.html?id=${encodeURIComponent(p.id)}"><img src="${p.image || 'assets/images/product-placeholder.svg'}" alt="${p.name} coffee bag illustration" loading="lazy" onerror="this.src='assets/images/product-placeholder.svg';this.onerror=null;"></a><div class="product-body"><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3><p class="price">$${Number(p.priceUsd).toFixed(2)}</p></div></article>`).join('')}</div>`
          : `<p class="muted">No products tagged for ${name}.</p>`;
      });
    });
  });
}).catch(() => { if (grid) grid.innerHTML = '<p class="state error">Could not load origins.</p>'; });
