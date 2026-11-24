/* interactions.js — testimonials slider (Swiper) */
(function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }

  function initTestimonials() {
    var root = document.getElementById('tcSwiper');
    if (!root || typeof Swiper === 'undefined') return;

    var cur = document.getElementById('tcCur');
    var total = document.getElementById('tcTotal');
    var bar = document.getElementById('tcBar');

    function update(s) {
      var n = s.slides.length;
      var perView = Math.max(1, Math.floor(s.params.slidesPerView));
      var lastVisible = Math.min(s.activeIndex + perView, n);
      if (total) total.textContent = pad(n);
      if (cur) cur.textContent = pad(lastVisible);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(lastVisible / n, 1) + ')';
    }

    new Swiper(root, {
      slidesPerView: 1.08,
      spaceBetween: 16,
      speed: 800,
      grabCursor: true,
      keyboard: { enabled: true },
      a11y: { enabled: true },
      navigation: {
        prevEl: '#tcPrev',
        nextEl: '#tcNext',
        disabledClass: 'swiper-button-disabled'
      },
      breakpoints: {
        700:  { slidesPerView: 2, spaceBetween: 20 },
        1100: { slidesPerView: 3, spaceBetween: 28 }
      },
      on: {
        init: update,
        slideChange: update,
        resize: update,
        breakpoint: update
      }
    });
  }

  function init() {
    try { initTestimonials(); } catch (err) { console.error('[interactions.js]', err); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();