import { loadProducts } from './products.js';
import { addToCart } from './cart.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');
const root = document.getElementById('product-detail');

loadProducts().then(products => {
  const p = products.find(x=>x.id===id);
  if (!p) { root.innerHTML = '<p class="state error">Product not found.</p>'; return; }
  const img = p.image || 'assets/images/product-placeholder.svg';
  root.innerHTML = `
    <div class="product-detail-grid">
      <img src="${img}" alt="${p.name} coffee bag illustration" loading="lazy" onerror="this.src='assets/images/product-placeholder.svg';this.onerror=null;">
      <div>
        <h1>${p.name}</h1>
        <p class="muted">Origin: ${p.origin} · Roast: ${p.roast} · Process: ${p.process}</p>
        <p>${p.description}</p>
        <p><strong>Flavor notes:</strong> ${(p.flavor||[]).join(', ')}</p>
        <p class="price">$${Number(p.priceUsd).toFixed(2)}</p>
        <div class="product-actions">
          <select id="weight-select" aria-label="Choose weight">${(p.weights||[]).map(w=>`<option value="${w}">${w}g</option>`).join('')}</select>
          <button class="btn btn-primary" id="add-btn">Add to cart</button>
        </div>
      </div>
    </div>`;
  document.getElementById('add-btn')?.addEventListener('click', () => {
    const w = parseInt(document.getElementById('weight-select').value,10);
    addToCart(p,w,1);
  });
}).catch(() => { if (root) root.innerHTML = '<p class="state error">Could not load product.</p>'; });
