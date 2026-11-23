/* animations.js — GSAP + ScrollTrigger. Progressive enhancement: if GSAP fails to load or the
   visitor prefers reduced motion, nothing is hidden and all content stays visible. */
(function () {
  'use strict';
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var EASE = 'power3.out';

  /* ---------- Split text into masked words ---------- */
  function splitWords(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.className = 'wi'; i.textContent = t;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    })(el);
    return el.querySelectorAll('.wi');
  }

  function setup() {
    /* ---------- Hero intro ---------- */
    var heroWords = [];
    $$('.hero [data-split]').forEach(function (el) { heroWords = heroWords.concat(Array.prototype.slice.call(splitWords(el))); });
    var tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.from(heroWords, { yPercent: 115, duration: 1.1, stagger: .07 })
      .from('[data-hero="fade"]', { y: 24, opacity: 0, duration: .9, stagger: .12 }, '-=.7')
      .from('[data-hero="visual"]', { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power4.inOut' }, 0.1)
      .from('.hero__badge', { y: 30, opacity: 0, duration: .8 }, '-=.4');

    /* ---------- Text reveal for section headings ---------- */
    $$('[data-split]:not(.hero [data-split])').forEach(function (el) {
      var words = splitWords(el);
      gsap.from(words, {
        yPercent: 110, duration: 1, ease: EASE, stagger: .06,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* ---------- Generic fade-up reveals ---------- */
    $$('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* ---------- Staggered groups ---------- */
    $$('[data-stagger]').forEach(function (group) {
      gsap.from(group.children, {
        y: 50, opacity: 0, duration: .9, ease: EASE, stagger: .12,
        scrollTrigger: { trigger: group, start: 'top 88%', once: true }
      });
    });

    /* ---------- Product + review cards stagger on first view ---------- */
    [['.prod-swiper .swiper-slide', '.prod-swiper'], ['.testi-swiper .swiper-slide', '.testi-swiper']].forEach(function (p) {
      gsap.from(p[0], {
        y: 60, opacity: 0, duration: 1, ease: EASE, stagger: .14,
        scrollTrigger: { trigger: p[1], start: 'top 85%', once: true }
      });
    });

    /* ---------- Image parallax ---------- */
    $$('[data-parallax]').forEach(function (img) {
      var amt = parseFloat(img.getAttribute('data-parallax')) || 8;
      gsap.fromTo(img, { yPercent: -amt * .5 }, {
        yPercent: amt * .5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* ---------- Section image mask reveals ---------- */
    $$('.craft__img, .why__figure, .month__frame, .cta__frame').forEach(function (el) {
      gsap.from(el, {
        clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    /* ---------- Collection cards (varied entrances) ---------- */
    $$('.cat').forEach(function (cat, i) {
      gsap.from(cat.querySelector('.cat__body'), {
        y: 30, opacity: 0, duration: .9, delay: .15 + i * .05, ease: EASE,
        scrollTrigger: { trigger: cat, start: 'top 85%', once: true }
      });
    });

    /* ---------- Process timeline: animated connecting line + step pop ---------- */
    var steps = document.querySelector('.steps');
    if (steps) {
      gsap.to('.steps__fill', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: steps, start: 'top 70%', end: 'bottom 55%', scrub: .6 }
      });
      gsap.from('.step', {
        y: 50, opacity: 0, duration: .9, ease: EASE, stagger: .15,
        scrollTrigger: { trigger: steps, start: 'top 82%', once: true }
      });
    }

    /* ---------- Comparison rows ---------- */
    gsap.from('.cmp__row', {
      y: 30, opacity: 0, duration: .8, ease: EASE, stagger: .12,
      scrollTrigger: { trigger: '.cmp', start: 'top 80%', once: true }
    });

    /* ---------- FAQ items ---------- */
    gsap.from('.acc', {
      y: 24, opacity: 0, duration: .8, ease: EASE, stagger: .1,
      scrollTrigger: { trigger: '.faq__list', start: 'top 85%', once: true }
    });

    /* ---------- Counters (only the stats that exist on the original site: 15+ years, 4.5 rating) ---------- */
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var obj = { v: 0 };
      el.textContent = (0).toFixed(dec) + suffix;
      gsap.to(obj, {
        v: end, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: function () { el.textContent = obj.v.toFixed(dec) + suffix; }
      });
    });

    /* ---------- Section background transition: gentle fade of the dark CTA ---------- */
    gsap.from('.cta__bg', {
      opacity: 0, duration: 1.4,
      scrollTrigger: { trigger: '.cta', start: 'top 80%', once: true }
    });
  }

  /* Run after layout + fonts are ready so triggers measure correctly */
  function start() { setup(); window.addEventListener('load', function () { ScrollTrigger.refresh(); }); }
  if (document.readyState === 'complete') start();
  else window.addEventListener('DOMContentLoaded', start);

  /* Refresh triggers when fonts finish loading */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
