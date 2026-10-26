import { escapeHtml } from './utils.js';

const KEY = 'thebeans_cart_v1';
function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function write(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

export function getCart() { return read(); }
export function cartCount() { return read().reduce((s,i)=>s+i.qty,0); }
export function addToCart(product, weight, qty=1) {
  const items = read();
  const key = product.id + '-' + weight;
  const found = items.find(i => i.key === key);
  if (found) found.qty += qty;
  else items.push({ key, id: product.id, name: product.name, price: product.priceUsd, weight, qty, image: product.image });
  write(items);
  renderCart();
  openCart();
}
export function updateQty(key, qty) {
  const items = read();
  const it = items.find(i=>i.key===key);
  if (!it) return;
  if (qty <= 0) removeItem(key);
  else { it.qty = qty; write(items); renderCart(); }
}
export function removeItem(key) {
  write(read().filter(i=>i.key!==key));
  renderCart();
}
export function clearCart() { write([]); renderCart(); }
export function cartTotal() { return read().reduce((s,i)=>s+i.price*i.qty,0); }

export function renderCart() {
  const items = read();
  const list = document.getElementById('cart-items');
  const total = document.getElementById('cart-total');
  const count = document.getElementById('cart-count');
  if (count) count.textContent = cartCount();
  if (!list) return;
  list.innerHTML = items.length ? items.map(i => `
    <div class='cart-item'>
      <div>
        <strong>${escapeHtml(i.name)}</strong><br>
        <span class='small muted'>${escapeHtml(i.weight)}g</span>
      </div>
      <div class='cart-item-actions'>
        <button class='icon-btn' onclick="updateQty('${i.key}', ${i.qty-1})">-</button>
        <span>${i.qty}</span>
        <button class='icon-btn' onclick="updateQty('${i.key}', ${i.qty+1})">+</button>
        <button class='icon-btn' onclick="removeItem('${i.key}')">x</button>
      </div>
    </div>
  `).join('') : '<p class="muted">Your cart is empty.</p>';
  if (total) total.textContent = '$' + cartTotal().toFixed(2);
}

export function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('drawer-backdrop')?.classList.add('open');
}
export function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('drawer-backdrop')?.classList.remove('open');
}

window.updateQty = updateQty;
window.removeItem = removeItem;
