/* ==========================================================================
   EXCLUSIVE — products.js
   Fetches product data from https://dummyjson.com/products (only allowed
   API). Renders all product-driven sections on the home page, plus
   search, category filter, quick-view modal, and skeleton loading.
   ========================================================================== */

const API_BASE = 'https://dummyjson.com';

/* ---------------------------------------------------------------------
   Fetch helpers
--------------------------------------------------------------------- */
async function fetchProducts(limit = 20, skip = 0){
  const res = await fetch(`${API_BASE}/products?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products;
}

async function fetchCategories(){
  const res = await fetch(`${API_BASE}/products/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function fetchByCategory(category){
  const res = await fetch(`${API_BASE}/products/category/${category}`);
  if (!res.ok) throw new Error('Failed to fetch category');
  const data = await res.json();
  return data.products;
}

async function searchProductsAPI(q){
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.products;
}

/* ---------------------------------------------------------------------
   Deterministic "fake discount" so cards look consistent between renders
--------------------------------------------------------------------- */
function pseudoDiscount(product){
  return Math.round(product.discountPercentage || 10);
}
function oldPrice(product){
  const discount = pseudoDiscount(product) / 100;
  return (product.price / (1 - discount)).toFixed(2);
}

/* ---------------------------------------------------------------------
   Card + skeleton rendering
--------------------------------------------------------------------- */
function skeletonCard(){
  return `<div class="skeleton skeleton-card"></div>`;
}

function starRow(rating){
  const full = Math.round(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < full ? '★' : '☆';
  return stars;
}

function productCardHTML(p){
  const isFav = Favorites.has(p.id);
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="p-thumb">
      <span class="p-badge">-${pseudoDiscount(p)}%</span>
      <button class="p-fav ${isFav ? 'active' : ''}" aria-label="Toggle favorite">${isFav ? '♥' : '♡'}</button>
      <button class="p-quick" aria-label="Quick view">👁</button>
      <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
      <button class="p-cart-cta"><span data-i18n="add_to_cart">Add To Cart</span></button>
    </div>
    <div class="p-info">
      <h4>${p.title}</h4>
      <div class="p-price">
        <span class="new">$${p.price}</span>
        <span class="old">$${oldPrice(p)}</span>
      </div>
      <div class="p-rating">
        <span>${starRow(p.rating)}</span>
        <span class="count">(${Math.round(p.rating * 20)})</span>
      </div>
    </div>
  </div>`;
}

function wireCard(cardEl, product){
  cardEl.querySelector('.p-cart-cta')?.addEventListener('click', () => Cart.add(product, 1));
  cardEl.querySelector('.p-fav')?.addEventListener('click', (e) => {
    const nowFav = Favorites.toggle(product);
    e.currentTarget.classList.toggle('active', nowFav);
    e.currentTarget.textContent = nowFav ? '♥' : '♡';
  });
  cardEl.querySelector('.p-quick')?.addEventListener('click', () => openQuickView(product));
  observeNew(cardEl);
}

function renderInto(container, products){
  if (!container) return;
  container.innerHTML = products.map(productCardHTML).join('');
  [...container.children].forEach((card, i) => wireCard(card, products[i]));
}

function showSkeletons(container, count){
  if (!container) return;
  container.innerHTML = Array.from({ length: count }).map(skeletonCard).join('');
}

/* ---------------------------------------------------------------------
   Quick view modal
--------------------------------------------------------------------- */
function ensureModal(){
  let modal = document.querySelector('#quick-view-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'quick-view-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" aria-label="Close">✕</button>
      <div class="modal-img"><img alt=""></div>
      <div class="modal-info">
        <h3></h3>
        <div class="p-rating"></div>
        <div class="p-price" style="margin-top:12px;"></div>
        <p class="desc"></p>
        <div class="modal-actions">
          <button class="btn btn-primary modal-add-cart" data-i18n="add_to_cart">Add To Cart</button>
          <button class="btn btn-outline modal-add-fav">♡ Favorite</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeQuickView(); });
  modal.querySelector('.modal-close').addEventListener('click', closeQuickView);
  return modal;
}

function openQuickView(product){
  const modal = ensureModal();
  modal.querySelector('img').src = product.thumbnail;
  modal.querySelector('h3').textContent = product.title;
  modal.querySelector('.p-rating').innerHTML = `<span style="color:var(--star)">${starRow(product.rating)}</span> <span class="count">(${Math.round(product.rating*20)} reviews)</span>`;
  modal.querySelector('.p-price').innerHTML = `<span class="new">$${product.price}</span> <span class="old">$${oldPrice(product)}</span>`;
  modal.querySelector('.desc').textContent = product.description;
  const addBtn = modal.querySelector('.modal-add-cart');
  const favBtn = modal.querySelector('.modal-add-fav');
  favBtn.textContent = Favorites.has(product.id) ? '♥ Favorited' : '♡ Favorite';
  addBtn.onclick = () => Cart.add(product, 1);
  favBtn.onclick = () => {
    const isFav = Favorites.toggle(product);
    favBtn.textContent = isFav ? '♥ Favorited' : '♡ Favorite';
  };
  modal.classList.add('open');
}
function closeQuickView(){
  document.querySelector('#quick-view-modal')?.classList.remove('open');
}

/* ---------------------------------------------------------------------
   Home page sections
--------------------------------------------------------------------- */
async function initHomeSections(){
  const flashTrack = document.querySelector('#flash-sale-track');
  const bestTrack = document.querySelector('#best-selling-track');
  const ourGrid = document.querySelector('#our-products-grid');
  const heroSlider = document.querySelector('.hero-slider');

  if (!flashTrack && !bestTrack && !ourGrid && !heroSlider) return;

  showSkeletons(flashTrack, 6);
  showSkeletons(bestTrack, 4);
  showSkeletons(ourGrid, 6);

  try {
    const products = await fetchProducts(40, 0);

    // Hero: iPhone products
    if (heroSlider){
      const iphones = products.filter(p => p.title.toLowerCase().includes('iphone'));
      buildHeroSlides(heroSlider, iphones.length ? iphones : products.slice(0, 3));
    }

    if (flashTrack) renderInto(flashTrack, products.slice(0, 10));
    if (bestTrack) renderInto(bestTrack, [...products].sort((a,b) => b.rating - a.rating).slice(0, 8));
    if (ourGrid) renderInto(ourGrid, products.slice(10, 16));

  } catch (err){
    console.error(err);
    showToast('Could not load products. Please check your connection.', 'error');
  }
}

function buildHeroSlides(root, items){
  const track = document.createElement('div');
  root.querySelectorAll('.hero-slide').forEach(s => s.remove());
  const dotsWrap = root.querySelector('.hero-dots');
  items.slice(0, 4).forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <div class="txt">
        <small>🍎 <span data-i18n="hero_tag">${p.title}</span></small>
        <h2 data-i18n="hero_title">Up to ${pseudoDiscount(p)}% off Voucher</h2>
        <a href="#our-products-grid" data-i18n="hero_shop">Shop Now →</a>
      </div>
      <img src="${p.thumbnail}" alt="${p.title}">
    `;
    root.insertBefore(slide, root.querySelector('.hero-arrow.prev'));
  });
  new HeroSlider(root);
}

/* ---------------------------------------------------------------------
   Category rail linking (home page left sidebar)
--------------------------------------------------------------------- */
async function initCategoryFilter(){
  const links = document.querySelectorAll('.category-rail a, .cat-pill');
  if (!links.length) return;
  links.forEach(link => {
    link.addEventListener('click', async (e) => {
      const cat = link.getAttribute('data-category');
      if (!cat) return;
      e.preventDefault();
      const grid = document.querySelector('#our-products-grid');
      if (!grid) return;
      showSkeletons(grid, 6);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        const products = await fetchByCategory(cat);
        renderInto(grid, products.slice(0, 9));
      } catch(err){
        showToast('Could not load category', 'error');
      }
    });
  });
}

/* ---------------------------------------------------------------------
   Search
--------------------------------------------------------------------- */
function initSearch(){
  const forms = document.querySelectorAll('.search-box');
  forms.forEach(box => {
    const input = box.querySelector('input');
    const btn = box.querySelector('button');
    const run = async () => {
      const q = input.value.trim();
      if (!q) return;
      const grid = document.querySelector('#our-products-grid');
      if (!grid){ window.location.href = `index.html?q=${encodeURIComponent(q)}`; return; }
      showSkeletons(grid, 6);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        const results = await searchProductsAPI(q);
        renderInto(grid, results.slice(0, 12));
        if (!results.length) grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No products found for "${q}"</p>`;
      } catch(err){
        showToast('Search failed', 'error');
      }
    };
    btn?.addEventListener('click', run);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  });

  // If arrived via ?q= from another page
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q){
    const input = document.querySelector('.search-box input');
    if (input){ input.value = q; }
    const grid = document.querySelector('#our-products-grid');
    if (grid){
      showSkeletons(grid, 6);
      searchProductsAPI(q).then(results => renderInto(grid, results.slice(0, 12))).catch(() => {});
    }
  }
}

/* ---------------------------------------------------------------------
   "View All Products" — loads a larger batch into Our Products grid
--------------------------------------------------------------------- */
function initViewAllButtons(){
  document.querySelectorAll('.js-view-all').forEach(btn => {
    btn.addEventListener('click', async () => {
      const grid = document.querySelector('#our-products-grid');
      if (!grid) return;
      showSkeletons(grid, 9);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        const products = await fetchProducts(24, 0);
        renderInto(grid, products);
      } catch(err){
        showToast('Could not load products', 'error');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHomeSections();
  initCategoryFilter();
  initSearch();
  initViewAllButtons();
});
