/* ==========================================================================
   EXCLUSIVE — main.js
   Core site-wide behavior: dark mode, i18n/RTL, header, mobile nav,
   toasts, scroll reveal, countdown timers, back-to-top, page loader.
   ========================================================================== */

/* ---------------------------------------------------------------------
   0. Page loader — hide once DOM is ready
--------------------------------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) setTimeout(() => loader.classList.add('hide'), 250);
});

/* ---------------------------------------------------------------------
   1. Translations (English / Arabic)
--------------------------------------------------------------------- */
const I18N = {
  en: {
    topbar: "Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!",
    brand: "Exclusive",
    nav_home: "Home", nav_contact: "Contact", nav_about: "About",
    nav_signup: "Sign Up", nav_login: "Login",
    search_ph: "What are you looking for?",
    manage_account: "Manage My Account", my_orders: "My Orders", logout: "Logout",
    cat_women: "Woman's Fashion", cat_men: "Men's Fashion", cat_electronics: "Electronics",
    cat_home: "Home & Lifestyle", cat_medicine: "Medicine", cat_sports: "Sports & Outdoor",
    cat_baby: "Baby's & Toys", cat_grocery: "Groceries & Pets", cat_beauty: "Health & Beauty",
    hero_tag: "iPhone 14 Series", hero_title: "Up to 10% off Voucher", hero_shop: "Shop Now",
    todays_eyebrow: "Today's", todays_title: "Flash Sales", view_all: "View All Products",
    cat_eyebrow: "Categories", cat_title: "Browse By Category",
    best_eyebrow: "This Month", best_title: "Best Selling Products",
    banner_cat: "Categories", banner_title: "Enhance Your Music Experience", banner_buy: "Buy Now",
    products_eyebrow: "Our Products", products_title: "Explore Our Products",
    featured_eyebrow: "Featured", featured_title: "New Arrival",
    ps5_title: "PlayStation 5", ps5_desc: "Black and White version of the PS5 coming out on sale.",
    women_coll: "Women's Collections", speakers_title: "Speakers", speakers_desc: "Amazon wireless speakers",
    perfume_title: "Perfume", perfume_desc: "GUCCI INTENSE OUD EDP",
    srv_1_t: "FREE AND FAST DELIVERY", srv_1_d: "Free delivery for all orders over $140",
    srv_2_t: "24/7 CUSTOMER SERVICE", srv_2_d: "Friendly 24/7 customer support",
    srv_3_t: "MONEY BACK GUARANTEE", srv_3_d: "We return money within 30 days",
    footer_subscribe: "Subscribe", footer_get: "Get 10% off your first order",
    footer_support: "Support", footer_account: "Account", footer_quicklink: "Quick Link", footer_app: "Download App",
    my_account: "My Account", login_register: "Login / Register", cart: "Cart", wishlist: "Wishlist",
    privacy: "Privacy Policy", terms: "Terms Of Use", faq: "FAQ", contact: "Contact",
    copyright: "Copyright Rimel 2022. All right reserved.",
    add_to_cart: "Add To Cart", quick_view: "Quick View", send_msg: "Send Your Message",
  },
  ar: {
    topbar: "تخفيضات الصيف على جميع ملابس السباحة وتوصيل مجاني - خصم 50%!",
    brand: "إكسكلوسيف",
    nav_home: "الرئيسية", nav_contact: "اتصل بنا", nav_about: "من نحن",
    nav_signup: "إنشاء حساب", nav_login: "تسجيل الدخول",
    search_ph: "عن ماذا تبحث؟",
    manage_account: "إدارة حسابي", my_orders: "طلباتي", logout: "تسجيل الخروج",
    cat_women: "أزياء نسائية", cat_men: "أزياء رجالية", cat_electronics: "إلكترونيات",
    cat_home: "المنزل ونمط الحياة", cat_medicine: "أدوية", cat_sports: "رياضة وأنشطة خارجية",
    cat_baby: "أطفال وألعاب", cat_grocery: "بقالة وحيوانات أليفة", cat_beauty: "صحة وجمال",
    hero_tag: "سلسلة آيفون 14", hero_title: "خصم يصل إلى 10%", hero_shop: "تسوق الآن",
    todays_eyebrow: "اليوم", todays_title: "تخفيضات سريعة", view_all: "عرض كل المنتجات",
    cat_eyebrow: "الفئات", cat_title: "تصفح حسب الفئة",
    best_eyebrow: "هذا الشهر", best_title: "الأكثر مبيعاً",
    banner_cat: "الفئات", banner_title: "عزز تجربتك الموسيقية", banner_buy: "اشترِ الآن",
    products_eyebrow: "منتجاتنا", products_title: "استكشف منتجاتنا",
    featured_eyebrow: "مميز", featured_title: "وصل حديثاً",
    ps5_title: "بلايستيشن 5", ps5_desc: "النسخة الأبيض والأسود من PS5 متوفرة الآن للبيع.",
    women_coll: "تشكيلة نسائية", speakers_title: "سماعات", speakers_desc: "سماعات أمازون اللاسلكية",
    perfume_title: "عطر", perfume_desc: "غوتشي إنتنس عود",
    srv_1_t: "توصيل سريع ومجاني", srv_1_d: "توصيل مجاني لجميع الطلبات فوق 140$",
    srv_2_t: "خدمة عملاء على مدار الساعة", srv_2_d: "دعم عملاء ودود على مدار الساعة",
    srv_3_t: "ضمان استرداد الأموال", srv_3_d: "نعيد أموالك خلال 30 يوماً",
    footer_subscribe: "اشترك", footer_get: "احصل على خصم 10% على طلبك الأول",
    footer_support: "الدعم", footer_account: "الحساب", footer_quicklink: "روابط سريعة", footer_app: "حمّل التطبيق",
    my_account: "حسابي", login_register: "تسجيل الدخول / إنشاء حساب", cart: "السلة", wishlist: "المفضلة",
    privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", faq: "الأسئلة الشائعة", contact: "اتصل بنا",
    copyright: "حقوق النشر ريميل 2022. جميع الحقوق محفوظة.",
    add_to_cart: "أضف للسلة", quick_view: "عرض سريع", send_msg: "أرسل رسالتك",
  }
};

function getLang(){ return localStorage.getItem('exclusive_lang') || 'en'; }

function applyTranslations(){
  const lang = getLang();
  const dict = I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  document.querySelectorAll('.lang-switcher').forEach(sel => sel.value = lang);
}

function setLang(lang){
  localStorage.setItem('exclusive_lang', lang);
  applyTranslations();
}

/* ---------------------------------------------------------------------
   2. Dark / Light mode
--------------------------------------------------------------------- */
function getTheme(){ return localStorage.getItem('exclusive_theme') || 'light'; }

function applyTheme(){
  document.documentElement.classList.toggle('dark', getTheme() === 'dark');
}

function toggleTheme(){
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('exclusive_theme', next);
  applyTheme();
}

/* ---------------------------------------------------------------------
   3. Toast notifications
--------------------------------------------------------------------- */
function ensureToastWrap(){
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap){
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  return wrap;
}

function showToast(message, type = 'success'){
  const wrap = ensureToastWrap();
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `<span class="dot"></span><span>${message}</span>`;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

/* ---------------------------------------------------------------------
   4. Header: sticky shadow, mobile nav, profile dropdown
--------------------------------------------------------------------- */
function initHeader(){
  const header = document.querySelector('header.site-header');
  if (header){
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-overlay');
  const closeBtn = document.querySelector('.close-mobile');
  const openMobile = () => { mobileNav?.classList.add('open'); overlay?.classList.add('open'); };
  const closeMobile = () => { mobileNav?.classList.remove('open'); overlay?.classList.remove('open'); };
  hamburger?.addEventListener('click', openMobile);
  closeBtn?.addEventListener('click', closeMobile);
  overlay?.addEventListener('click', closeMobile);

  const profileWrap = document.querySelector('.profile-wrap');
  const profileBtn = document.querySelector('.profile-trigger');
  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileWrap.classList.toggle('open');
  });
  document.addEventListener('click', () => profileWrap?.classList.remove('open'));

  // Theme toggle
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Language switcher
  document.querySelectorAll('.lang-switcher').forEach(sel => {
    sel.addEventListener('change', (e) => setLang(e.target.value));
  });

  // Reflect logged-in state
  updateAuthUI();
}

function updateAuthUI(){
  const user = JSON.parse(localStorage.getItem('exclusive_user') || 'null');
  document.querySelectorAll('.login-link').forEach(el => el.style.display = user ? 'none' : '');
  document.querySelectorAll('.profile-wrap').forEach(el => el.style.display = user ? 'flex' : 'none');
  document.querySelectorAll('.profile-name').forEach(el => { if (user) el.textContent = user.name; });
}

/* ---------------------------------------------------------------------
   5. Back to top
--------------------------------------------------------------------- */
function initBackToTop(){
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------------------------------------------------------------------
   6. Scroll reveal
--------------------------------------------------------------------- */
function initScrollReveal(){
  const targets = document.querySelectorAll('.reveal-up, .product-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        entry.target.classList.add('reveal');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => io.observe(t));
}
// Re-run for elements injected later (products loaded async)
function observeNew(el){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('reveal');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  io.observe(el);
}

/* ---------------------------------------------------------------------
   7. Countdown timers — data-deadline-days attribute
--------------------------------------------------------------------- */
function initCountdowns(){
  document.querySelectorAll('[data-countdown-days]').forEach(box => {
    const days = parseFloat(box.getAttribute('data-countdown-days')) || 4;
    const end = Date.now() + days * 24 * 60 * 60 * 1000;
    const d = box.querySelector('.d'), h = box.querySelector('.h'), m = box.querySelector('.m'), s = box.querySelector('.s');
    function tick(){
      const diff = Math.max(0, end - Date.now());
      const D = Math.floor(diff / 86400000);
      const H = Math.floor((diff % 86400000) / 3600000);
      const M = Math.floor((diff % 3600000) / 60000);
      const S = Math.floor((diff % 60000) / 1000);
      if (d) d.textContent = String(D).padStart(2,'0');
      if (h) h.textContent = String(H).padStart(2,'0');
      if (m) m.textContent = String(M).padStart(2,'0');
      if (s) s.textContent = String(S).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
  });
}

/* ---------------------------------------------------------------------
   8. Init
--------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  applyTranslations();
  initHeader();
  initBackToTop();
  initScrollReveal();
  initCountdowns();
});
