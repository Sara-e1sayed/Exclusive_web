/* ==========================================================================
   EXCLUSIVE — cart.js
   Shopping cart + favorites, persisted in localStorage.
   Exposes window.Cart and window.Favorites used across all pages.
   ========================================================================== */

const CART_KEY = 'exclusive_cart';
const FAV_KEY  = 'exclusive_favorites';
const COUPONS  = { SAVE10: 0.10, EXCLUSIVE20: 0.20 };

/* ---------------------------------------------------------------------
   Storage helpers
--------------------------------------------------------------------- */
function readStore(key){
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch(e){ return []; }
}
function writeStore(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

/* ---------------------------------------------------------------------
   Cart API
--------------------------------------------------------------------- */
const Cart = {
  items(){ return readStore(CART_KEY); },

  add(product, qty = 1){
    const items = this.items();
    const existing = items.find(i => i.id === product.id);
    if (existing) existing.qty += qty;
    else items.push({
      id: product.id, title: product.title, price: product.price,
      image: product.thumbnail || (product.images && product.images[0]) || '',
      qty
    });
    writeStore(CART_KEY, items);
    this.refreshBadge();
    bumpBadge('.cart-badge');
    showToast(`${product.title} added to cart`);
  },

  updateQty(id, qty){
    const items = this.items();
    const it = items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, qty);
    writeStore(CART_KEY, items);
    this.refreshBadge();
  },

  remove(id){
    const items = this.items().filter(i => i.id !== id);
    writeStore(CART_KEY, items);
    this.refreshBadge();
    showToast('Item removed from cart', 'error');
  },

  clear(){ writeStore(CART_KEY, []); this.refreshBadge(); },

  subtotal(){ return this.items().reduce((s, i) => s + i.price * i.qty, 0); },

  count(){ return this.items().reduce((s, i) => s + i.qty, 0); },

  refreshBadge(){
    document.querySelectorAll('.cart-badge').forEach(b => b.textContent = this.count());
  }
};

/* ---------------------------------------------------------------------
   Favorites API
--------------------------------------------------------------------- */
const Favorites = {
  items(){ return readStore(FAV_KEY); },

  has(id){ return this.items().some(i => i.id === id); },

  toggle(product){
    let items = this.items();
    if (this.has(product.id)){
      items = items.filter(i => i.id !== product.id);
      writeStore(FAV_KEY, items);
      showToast(`${product.title} removed from favorites`, 'error');
    } else {
      items.push({
        id: product.id, title: product.title, price: product.price,
        image: product.thumbnail || (product.images && product.images[0]) || ''
      });
      writeStore(FAV_KEY, items);
      showToast(`${product.title} added to favorites`);
    }
    this.refreshBadge();
    bumpBadge('.fav-badge');
    return this.has(product.id);
  },

  refreshBadge(){
    document.querySelectorAll('.fav-badge').forEach(b => b.textContent = this.items().length);
  }
};

function bumpBadge(selector){
  document.querySelectorAll(selector).forEach(b => {
    b.classList.remove('bump');
    void b.offsetWidth; // restart animation
    b.classList.add('bump');
  });
}

/* ---------------------------------------------------------------------
   Cart page rendering
--------------------------------------------------------------------- */
function renderCartPage(){
  const tbody = document.querySelector('#cart-table-body');
  const emptyState = document.querySelector('#cart-empty');
  const table = document.querySelector('.cart-table-wrap');
  if (!tbody) return;

  const items = Cart.items();
  if (!items.length){
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    document.querySelector('.cart-bottom')?.style.setProperty('display', 'none');
    updateCartTotals();
    return;
  }
  if (table) table.style.display = '';
  if (emptyState) emptyState.style.display = 'none';
  document.querySelector('.cart-bottom')?.style.removeProperty('display');

  tbody.innerHTML = items.map(i => `
    <tr data-id="${i.id}">
      <td>
        <div class="cart-prod">
          <img src="${i.image}" alt="${i.title}" loading="lazy">
          <span>${i.title}</span>
        </div>
      </td>
      <td>$${i.price.toFixed(2)}</td>
      <td>
        <div class="qty-box">
          <button class="qty-dec" aria-label="Decrease">−</button>
          <span>${i.qty}</span>
          <button class="qty-inc" aria-label="Increase">+</button>
        </div>
      </td>
      <td>$${(i.price * i.qty).toFixed(2)}</td>
      <td><button class="remove-btn" aria-label="Remove">✕</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    const id = Number(row.dataset.id);
    row.querySelector('.qty-inc').addEventListener('click', () => {
      const it = Cart.items().find(i => i.id === id);
      Cart.updateQty(id, it.qty + 1);
      renderCartPage();
    });
    row.querySelector('.qty-dec').addEventListener('click', () => {
      const it = Cart.items().find(i => i.id === id);
      if (it.qty <= 1) return;
      Cart.updateQty(id, it.qty - 1);
      renderCartPage();
    });
    row.querySelector('.remove-btn').addEventListener('click', () => {
      Cart.remove(id);
      renderCartPage();
    });
  });

  updateCartTotals();
}

let appliedDiscount = 0;

function updateCartTotals(){
  const subtotal = Cart.subtotal();
  const shipping = subtotal > 0 ? (subtotal > 140 ? 0 : 15) : 0;
  const discount = subtotal * appliedDiscount;
  const total = Math.max(0, subtotal - discount + shipping);

  document.querySelectorAll('.js-subtotal').forEach(el => el.textContent = `$${subtotal.toFixed(2)}`);
  document.querySelectorAll('.js-shipping').forEach(el => el.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`);
  document.querySelectorAll('.js-total').forEach(el => el.textContent = `$${total.toFixed(2)}`);
  document.querySelectorAll('.js-discount-row').forEach(el => el.style.display = discount > 0 ? '' : 'none');
  document.querySelectorAll('.js-discount').forEach(el => el.textContent = `-$${discount.toFixed(2)}`);
}

function initCouponForm(){
  const form = document.querySelector('#coupon-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = form.querySelector('input').value.trim().toUpperCase();
    if (COUPONS[code]){
      appliedDiscount = COUPONS[code];
      showToast(`Coupon applied: ${code} (-${COUPONS[code]*100}%)`);
    } else {
      appliedDiscount = 0;
      showToast('Invalid coupon code', 'error');
    }
    updateCartTotals();
  });
}

/* ---------------------------------------------------------------------
   Checkout page rendering
--------------------------------------------------------------------- */
function renderCheckoutSummary(){
  const list = document.querySelector('#checkout-items');
  if (!list) return;
  const items = Cart.items();
  list.innerHTML = items.map(i => `
    <div class="summary-row">
      <span>${i.title} × ${i.qty}</span>
      <span>$${(i.price * i.qty).toFixed(2)}</span>
    </div>
  `).join('') || `<p style="color:var(--text-muted);font-size:14px;">Your cart is empty.</p>`;
  updateCartTotals();
}

function initCheckoutForm(){
  const form = document.querySelector('#checkout-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(input => {
      const field = input.closest('.field');
      if (!input.value.trim()){
        field?.classList.add('error');
        valid = false;
      } else {
        field?.classList.remove('error');
      }
    });
    if (!Cart.items().length){
      showToast('Your cart is empty', 'error');
      return;
    }
    if (!valid){
      showToast('Please fill in all required fields', 'error');
      return;
    }
    Cart.clear();
    showToast('Order placed successfully!');
    setTimeout(() => { window.location.href = 'account.html'; }, 1200);
  });
}

/* ---------------------------------------------------------------------
   Wishlist page rendering (uses items saved via the heart icon)
--------------------------------------------------------------------- */
function wishlistCardHTML(item){
  return `
  <div class="product-card reveal" data-id="${item.id}">
    <div class="p-thumb">
      <button class="p-fav active" aria-label="Remove from wishlist">♥</button>
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <button class="p-cart-cta"><span data-i18n="add_to_cart">Add To Cart</span></button>
    </div>
    <div class="p-info">
      <h4>${item.title}</h4>
      <div class="p-price"><span class="new">$${item.price}</span></div>
    </div>
  </div>`;
}

function renderWishlistPage(){
  const grid = document.querySelector('#wishlist-grid');
  const emptyState = document.querySelector('#wishlist-empty');
  if (!grid) return;

  const items = Favorites.items();
  if (!items.length){
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  grid.style.display = '';
  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = items.map(wishlistCardHTML).join('');
  [...grid.children].forEach(card => {
    const id = Number(card.dataset.id);
    const item = items.find(i => i.id === id);
    card.querySelector('.p-fav').addEventListener('click', () => {
      Favorites.toggle(item);
      renderWishlistPage();
    });
    card.querySelector('.p-cart-cta').addEventListener('click', () => {
      Cart.add(item, 1);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.refreshBadge();
  Favorites.refreshBadge();
  renderCartPage();
  initCouponForm();
  renderCheckoutSummary();
  initCheckoutForm();
  renderWishlistPage();
});
