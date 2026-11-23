/* interactions.js — Swiper sliders, FAQ accordion, product read-more, product image hover */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Swiper sliders ---------- */
  // function initSwipers() {
  //   if (typeof Swiper === 'undefined') return;

  //   new Swiper('.prod-swiper', {
  //     slidesPerView: 1.12,
  //     spaceBetween: 18,
  //     speed: 700,
  //     grabCursor: true,
  //     watchOverflow: true,
  //     navigation: { prevEl: '#prodPrev', nextEl: '#prodNext' },
  //     pagination: { el: '.prod-pagination', clickable: true },
  //     breakpoints: {
  //       568:  { slidesPerView: 2.05, spaceBetween: 20 },
  //       992:  { slidesPerView: 3,    spaceBetween: 24 },
  //       1280: { slidesPerView: 3.25, spaceBetween: 28 }
  //     },
  //     a11y: { enabled: true }
  //   });

  //   new Swiper('.testi-swiper', {
  //     slidesPerView: 1.08,
  //     spaceBetween: 18,
  //     speed: 800,
  //     grabCursor: true,
  //     loop: false,
  //     navigation: { prevEl: '#testiPrev', nextEl: '#testiNext' },
  //     pagination: { el: '.testi-pagination', clickable: true },
  //     breakpoints: {
  //       640:  { slidesPerView: 1.6, spaceBetween: 22 },
  //       992:  { slidesPerView: 2.2, spaceBetween: 26 },
  //       1280: { slidesPerView: 2.6, spaceBetween: 30 }
  //     },
  //     a11y: { enabled: true }
  //   });
  // }

  const pad = (n) => String(n).padStart(2, "0");
  const cur = document.getElementById("tcCur");
  const total = document.getElementById("tcTotal");
  const bar = document.getElementById("tcBar");

  const tc = new Swiper("#tcSwiper", {
    slidesPerView: 1.08,
    spaceBetween: 16,
    speed: 800,
    grabCursor: true,
    keyboard: { enabled: true },
    a11y: { enabled: true },
    navigation: { prevEl: "#tcPrev", nextEl: "#tcNext", disabledClass: "swiper-button-disabled" },
    breakpoints: {
      700:  { slidesPerView: 2, spaceBetween: 20 },
      1100: { slidesPerView: 3, spaceBetween: 28 }
    },
    on: {
      init(s)        { update(s); },
      slideChange(s) { update(s); },
      resize(s)      { update(s); }
    }
  });

  function update(s) {
    const n = s.slides.length;
    const perView = Math.ceil(s.params.slidesPerView);
    total.textContent = pad(n);
    cur.textContent = pad(Math.min(s.activeIndex + perView, n));        // last visible card
    bar.style.transform = "scaleX(" + Math.min((s.activeIndex + perView) / n, 1) + ")";
  }




  document.documentElement.classList.add("js");
  const rows = document.querySelectorAll(".cmp__row:not(.cmp__row--head)");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add("is-in"), i * 90);
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  rows.forEach((r) => io.observe(r));

  /* ---------- FAQ accordion (single-open) ---------- */
  function initAccordion() {
    var items = $$('.acc');
    function set(item, open) {
      item.classList.toggle('is-open', open);
      $('.acc__btn', item).setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    items.forEach(function (item) {
      if ($('.acc__btn', item).getAttribute('aria-expanded') === 'true') item.classList.add('is-open');
      $('.acc__btn', item).addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (i) { set(i, false); });
        set(item, willOpen);
      });
    });
  }

  /* ---------- Product description read-more ---------- */
  function initReadMore() {
    $$('.pcard').forEach(function (card) {
      var desc = $('.pcard__desc', card);
      var btn = $('.pcard__more', card);
      if (!desc || !btn) return;
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        desc.classList.toggle('is-clamped', expanded);
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        btn.textContent = expanded ? 'Read more' : 'Read less';
        if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 60);
      });
    });
  }

  /* ---------- Product image hover: zoom follows pointer ---------- */
  function initProductHover() {
    if (!window.matchMedia('(hover:hover)').matches) return;
    $$('.pcard__media').forEach(function (media) {
      media.addEventListener('mousemove', function (e) {
        var r = media.getBoundingClientRect();
        media.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        media.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      media.addEventListener('mouseleave', function () {
        media.style.removeProperty('--ox'); media.style.removeProperty('--oy');
      });
    });
  }
  


document.querySelectorAll("[data-brand-slider]").forEach((slider) => {

  const viewport = slider.querySelector(".brand-slider__viewport");
  const track = slider.querySelector(".brand-slider__track");
  const slides = [...track.querySelectorAll(".brand-item")];

  const prevBtn = slider.querySelector(".brand-slider__prev");
  const nextBtn = slider.querySelector(".brand-slider__next");

  const dotsContainer = slider.querySelector(".brand-slider__dots");
  const currentText = slider.querySelector(".brand-current");
  const totalText = slider.querySelector(".brand-total");

  if (!slides.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let index = 0;
  let visible = 3;
  let maxIndex = 0;
  let timer = null;
  let startX = 0;
  let endX = 0;

  const autoplayDelay = 3500;


  // Determine responsive slides
  function getVisibleSlides() {

  if (window.innerWidth <= 360) return 1;
  if (window.innerWidth <= 567) return 2;
  if (window.innerWidth <= 991) return 3;

  return 6;
}


  // Calculate slider dimensions
  function getStep() {

    const slide = slides[0];
    const trackStyle = getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 0;

    return slide.getBoundingClientRect().width + gap;
  }


  // Build pagination
  function buildDots() {

    dotsContainer.innerHTML = "";

    maxIndex = Math.max(0, slides.length - visible);

    for (let i = 0; i <= maxIndex; i++) {

      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "brand-slider__dot";
      dot.setAttribute("aria-label", `Go to brand slide ${i + 1}`);

      dot.addEventListener("click", () => {
        goTo(i);
        restartAutoplay();
      });

      dotsContainer.appendChild(dot);

    }

    totalText.textContent = String(maxIndex + 1).padStart(2, "0");
  }


  // Update slider
  function updateSlider() {

    const step = getStep();

    track.style.transform = `translate3d(${-index * step}px, 0, 0)`;

    currentText.textContent = String(index + 1).padStart(2, "0");

    [...dotsContainer.children].forEach((dot, i) => {

      dot.classList.toggle("is-active", i === index);

      if (i === index) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }

    });

    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }


  // Go to specific slide
  function goTo(newIndex) {

    if (newIndex > maxIndex) {
      index = 0;
    } else if (newIndex < 0) {
      index = maxIndex;
    } else {
      index = newIndex;
    }

    updateSlider();
  }


  // Navigation
  nextBtn.addEventListener("click", () => {
    goTo(index + 1);
    restartAutoplay();
  });

  prevBtn.addEventListener("click", () => {
    goTo(index - 1);
    restartAutoplay();
  });


  // Autoplay
  function startAutoplay() {

    stopAutoplay();

    if (reducedMotion.matches || maxIndex === 0) return;

    timer = setInterval(() => {
      goTo(index + 1);
    }, autoplayDelay);

  }


  function stopAutoplay() {

    if (timer) {
      clearInterval(timer);
      timer = null;
    }

  }


  function restartAutoplay() {

    stopAutoplay();
    startAutoplay();

  }


  // Pause on hover
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);

  // Pause when keyboard-focused
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", (event) => {

    if (!slider.contains(event.relatedTarget)) {
      startAutoplay();
    }

  });


  // Touch swipe
  viewport.addEventListener("touchstart", (event) => {

    startX = event.changedTouches[0].clientX;

  }, { passive: true });


  viewport.addEventListener("touchend", (event) => {

    endX = event.changedTouches[0].clientX;

    const distance = startX - endX;

    if (Math.abs(distance) > 50) {

      if (distance > 0) {
        goTo(index + 1);
      } else {
        goTo(index - 1);
      }

      restartAutoplay();

    }

  }, { passive: true });


  // Responsive resize
  function handleResize() {

    const newVisible = getVisibleSlides();

    if (newVisible !== visible) {

      visible = newVisible;
      index = 0;

      buildDots();

    } else {

      index = Math.min(index, Math.max(0, slides.length - visible));

    }

    updateSlider();
    restartAutoplay();

  }


  window.addEventListener("resize", handleResize);


  // Reduced motion preference changes
  reducedMotion.addEventListener?.("change", restartAutoplay);


  // Initialize
  visible = getVisibleSlides();

  buildDots();
  updateSlider();
  startAutoplay();

});


  function init() { initSwipers(); initAccordion(); initReadMore(); initProductHover(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
