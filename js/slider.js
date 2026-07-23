/* ==========================================================================
   EXCLUSIVE — slider.js
   Hero slider (auto + dots + arrows) and generic track sliders
   (used for flash-sale products, categories row, etc.)
   ========================================================================== */

class HeroSlider {
  constructor(root, { interval = 4500 } = {}){
    this.root = root;
    this.slides = [...root.querySelectorAll('.hero-slide')];
    this.dotsWrap = root.querySelector('.hero-dots');
    this.index = 0;
    this.interval = interval;
    this.timer = null;
    if (this.slides.length) this.build();
  }
  build(){
    this.slides.forEach((s, i) => s.classList.toggle('active', i === 0));
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => this.go(i));
      this.dotsWrap?.appendChild(dot);
    });
    this.root.querySelector('.hero-arrow.prev')?.addEventListener('click', () => this.go(this.index - 1));
    this.root.querySelector('.hero-arrow.next')?.addEventListener('click', () => this.go(this.index + 1));
    this.root.addEventListener('mouseenter', () => this.stop());
    this.root.addEventListener('mouseleave', () => this.start());
    this.start();
  }
  go(i){
    this.index = (i + this.slides.length) % this.slides.length;
    this.slides.forEach((s, idx) => s.classList.toggle('active', idx === this.index));
    this.dotsWrap?.querySelectorAll('button').forEach((d, idx) => d.classList.toggle('active', idx === this.index));
  }
  start(){ this.stop(); this.timer = setInterval(() => this.go(this.index + 1), this.interval); }
  stop(){ if (this.timer) clearInterval(this.timer); }
}

class TrackSlider {
  constructor(wrapSelector, { step = 1 } = {}){
    this.wrap = document.querySelector(wrapSelector);
    if (!this.wrap) return;
    this.track = this.wrap.querySelector('.p-track') || this.wrap.querySelector('.cat-track');
    this.step = step;
    this.offset = 0;
    const container = this.wrap.closest('section') || document;
    this.prevBtn = container.querySelector(`[data-slide-prev="${wrapSelector.replace('#','')}"]`);
    this.nextBtn = container.querySelector(`[data-slide-next="${wrapSelector.replace('#','')}"]`);
    this.prevBtn?.addEventListener('click', () => this.slide(-1));
    this.nextBtn?.addEventListener('click', () => this.slide(1));
  }
  slide(dir){
    if (!this.track) return;
    const card = this.track.firstElementChild;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 22; // gap
    const visible = Math.floor(this.wrap.getBoundingClientRect().width / cardWidth) || 1;
    const maxOffset = -(cardWidth * (this.track.children.length - visible));
    this.offset += dir * cardWidth * this.step;
    if (this.offset > 0) this.offset = 0;
    if (this.offset < maxOffset) this.offset = maxOffset < 0 ? maxOffset : 0;
    this.track.style.transform = `translateX(${this.offset}px)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-slider').forEach(el => new HeroSlider(el));
  new TrackSlider('#flash-sale-track');
  new TrackSlider('#best-selling-track');
  new TrackSlider('#category-track', { step: 2 });
});
