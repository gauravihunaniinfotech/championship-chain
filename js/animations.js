/* animations.js — floating elements (no library needed) + GSAP scroll animations */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* =====================================================
     1. FLOATING ANIMATION
     Uses the CSS `translate` / `rotate` properties through the Web Animations API,
     so it never clashes with your hover `transform` effects or with GSAP.
     [selector, amplitude (px), duration (ms), tilt (deg)]
  ===================================================== */
  function initFloating() {
    if (reduce || !Element.prototype.animate) return;

    var groups = [
      ['.wy__visual',      14, 7000, 1.2],   // Why section photo
      ['.mo__visual',      16, 7600, 1.0],   // Chain of the Month photo
      ['.cta__visual',     16, 7200, 1.2],   // Final CTA photo
      ['.sc__badge',        5, 5200, 0],     // video logo badge
      ['.pr-step__img',    10, 5600, 0],     // process step images
      ['.wy-card__icon',    6, 4600, 0],     // why-card icons
      ['.cf-card__icon',    6, 4600, 0],     // craftsmanship icons
      ['.mo-perk img',      5, 4400, 0],     // perk icons
      ['.pf-card__price',   4, 4200, 0]      // product price badges
    ];

    // only animate while on screen
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var anim = e.target._float;
          if (!anim) return;
          if (e.isIntersecting) anim.play(); else anim.pause();
        });
      }, { rootMargin: '120px' });
    }

    groups.forEach(function (g) {
      $$(g[0]).forEach(function (el, i) {
        var amp = g[1];
        var dur = g[2] + (i % 3) * 450;       // slightly different speed per item
        var phase = -(dur * ((i * 0.37) % 1)); // different starting point per item

        var anim = el.animate(
          [
            { translate: '0 0',                 rotate: '0deg' },
            { translate: '0 ' + (-amp) + 'px',  rotate: (g[3] || 0) + 'deg' }
          ],
          {
            duration: dur,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out',
            delay: phase
          }
        );

        if (io) {
          anim.pause();
          el._float = anim;
          io.observe(el);
        }
      });
    });
  }

  /* =====================================================
     2. GSAP SCROLL ANIMATIONS
  ===================================================== */
  function initGsap() {
    if (reduce) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var EASE = 'power3.out';
    // clearing these afterwards keeps your CSS hover effects working
    var CLEAR = 'transform,opacity,transition';

    /* ---- section headings ---- */
    $$('.cs__head,.wy__head,.tb__head,.cf__head,.pr__head,.pf__head,.vs__head,.tc__head,.fq__intro,.mo__copy')
      .forEach(function (el) {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 1, ease: EASE, clearProps: CLEAR,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });

    /* ---- generic [data-reveal] / [data-stagger] (final CTA) ---- */
    $$('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1, ease: EASE, clearProps: CLEAR,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    $$('[data-stagger]').forEach(function (group) {
      gsap.from(group.children, {
        y: 40, opacity: 0, duration: .9, ease: EASE, stagger: .12, clearProps: CLEAR,
        scrollTrigger: { trigger: group, start: 'top 90%', once: true }
      });
    });

    /* ---- image mask reveals ---- */
    $$('.sc__frame,.wy__frame,.mo__frame,.cta__frame').forEach(function (el) {
      gsap.from(el, {
        clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power4.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    /* ---- cards: staggered rise per row ---- */
    function batchIn(selector, y) {
      if (!document.querySelector(selector)) return;
      gsap.set(selector, { opacity: 0, y: y || 50, transition: 'none' });
      ScrollTrigger.batch(selector, {
        start: 'top 90%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1, y: 0, duration: .9, ease: EASE, stagger: .12,
            overwrite: true, clearProps: CLEAR
          });
        }
      });
    }

    batchIn('.cs-card');
    batchIn('.wy-card');
    batchIn('.cf-card');
    batchIn('.pr-step');
    batchIn('.pf-card');
    batchIn('.mo-perk', 40);
    batchIn('.fq-item', 30);
    batchIn('.cmp__row:not(.cmp__row--head)', 24);

    /* ---- image parallax (final CTA photo) ---- */
    $$('[data-parallax]').forEach(function (img) {
      var amt = parseFloat(img.getAttribute('data-parallax')) || 8;
      gsap.fromTo(img, { yPercent: -amt * .5 }, {
        yPercent: amt * .5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* ---- hero background: gentle scroll parallax ---- */
    var heroImg = document.querySelector('.hx__img');
    if (heroImg && window.innerWidth > 567) {
      gsap.fromTo(heroImg, { scale: 1.15, yPercent: 0 }, {
        scale: 1.15, yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: '.hx', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    /* ---- CTA background glow fade-in ---- */
    if (document.querySelector('.cta__bg')) {
      gsap.from('.cta__bg', {
        opacity: 0, duration: 1.4,
        scrollTrigger: { trigger: '.cta', start: 'top 80%', once: true }
      });
    }

    /* ---- recalculate positions once everything has loaded ---- */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  function start() {
    try { initFloating(); } catch (err) { console.error('[animations.js] floating:', err); }
    try { initGsap(); } catch (err) { console.error('[animations.js] gsap:', err); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();