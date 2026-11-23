/* main.js — header behaviour, mega menu, search overlay, mobile drawer, back-to-top */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Sticky header: compact on scroll, hide on scroll-down, show on scroll-up ---------- */
  var header = $('#header');
  var toTop = $('#toTop');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 60);
    var openMenu = $('.has-menu.is-open');
    if (y > 420 && y > lastY + 4 && !openMenu) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 420) header.classList.remove('is-hidden');
    toTop.classList.toggle('is-visible', y > 900);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Mega menu / dropdowns ---------- */
  var menus = $$('.has-menu');
  function closeMenus(except) {
    menus.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('is-open');
      var b = $('.nav__link', li);
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  menus.forEach(function (li) {
    var btn = $('.nav__link', li);
    var timer;
    function open() { clearTimeout(timer); closeMenus(li); li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    function close() { timer = setTimeout(function () { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, 140); }
    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', close);
    btn.addEventListener('click', function () {
      li.classList.contains('is-open') ? (li.classList.remove('is-open'), btn.setAttribute('aria-expanded', 'false')) : open();
    });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) close();
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-menu')) closeMenus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenus(); closeSearch(); closeDrawer(); }
  });

  /* ---------- Search overlay ---------- */
  var search = $('#search');
  var searchOpenBtn = $('#searchOpen');
  var lastFocus = null;
  function openSearch() {
    lastFocus = document.activeElement;
    search.hidden = false;
    requestAnimationFrame(function () { search.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#q').focus(); }, 250);
  }
  function closeSearch() {
    if (search.hidden) return;
    search.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { search.hidden = true; }, 420);
    if (lastFocus) lastFocus.focus();
  }
  searchOpenBtn.addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  search.addEventListener('click', function (e) { if (e.target === search) closeSearch(); });

  /* ---------- Mobile drawer ---------- */
  var drawer = $('#drawer');
  var backdrop = $('#drawerBackdrop');
  var drawerOpenBtn = $('#drawerOpen');
  function openDrawer() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawerOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#drawerClose').focus(); }, 300);
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    drawerOpenBtn.focus();
  }
  drawerOpenBtn.addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  $$('.drawer__group > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      $$('.drawer__group > button').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 991) closeDrawer(); });

  /* ---------- In-page anchor links: close overlays ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () { closeDrawer(); });
  });




document.addEventListener("DOMContentLoaded", function () {

  const video = document.getElementById("showcaseVideo");

  if (!video) return;

  const frame = video.closest(".showcase__video-frame");
  const overlay = document.getElementById("videoOverlay");

  const playButton = document.getElementById("videoPlay");
  const toggleButton = document.getElementById("videoToggle");
  const muteButton = document.getElementById("videoMute");
  const fullscreenButton = document.getElementById("videoFullscreen");

  const progress = document.getElementById("videoProgress");
  const progressBar = frame.querySelector(".showcase__progress");

  const currentTime = document.getElementById("videoTime");
  const duration = document.getElementById("videoDuration");


  // Format video time
  function formatTime(seconds) {

    if (!Number.isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;

  }


  // Play video
  async function playVideo() {

    try {

      await video.play();

      overlay.classList.add("is-hidden");
      frame.classList.add("is-playing");

      toggleButton.setAttribute("aria-label", "Pause video");

    } catch (error) {

      console.error("Video playback failed:", error);

    }

  }


  // Pause video
  function pauseVideo() {

    video.pause();

    overlay.classList.remove("is-hidden");
    frame.classList.remove("is-playing");

    toggleButton.setAttribute("aria-label", "Play video");

  }


  // Main play button
  playButton.addEventListener("click", playVideo);


  // Play / pause button
  toggleButton.addEventListener("click", function () {

    if (video.paused) {
      playVideo();
    } else {
      pauseVideo();
    }

  });


  // Video events
  video.addEventListener("play", function () {

    overlay.classList.add("is-hidden");
    frame.classList.add("is-playing");

  });


  video.addEventListener("pause", function () {

    frame.classList.remove("is-playing");

    if (!video.ended) {
      overlay.classList.remove("is-hidden");
    }

  });


  video.addEventListener("ended", function () {

    overlay.classList.remove("is-hidden");
    frame.classList.remove("is-playing");

    video.currentTime = 0;

  });


  // Update progress
  video.addEventListener("timeupdate", function () {

    if (!video.duration) return;

    const percentage = (video.currentTime / video.duration) * 100;

    progress.style.width = percentage + "%";

    currentTime.textContent = formatTime(video.currentTime);

  });


  // Update duration
  video.addEventListener("loadedmetadata", function () {

    duration.textContent = formatTime(video.duration);

  });


  // Click progress bar to seek
  progressBar.addEventListener("click", function (event) {

    if (!video.duration) return;

    const rect = progressBar.getBoundingClientRect();

    const position = (event.clientX - rect.left) / rect.width;

    video.currentTime = position * video.duration;

  });


  // Mute / unmute
  muteButton.addEventListener("click", function () {

    video.muted = !video.muted;

    muteButton.setAttribute(
      "aria-label",
      video.muted ? "Unmute video" : "Mute video"
    );

    muteButton.style.opacity = video.muted ? ".5" : "1";

  });


  // Fullscreen
  fullscreenButton.addEventListener("click", async function () {

    try {

      if (!document.fullscreenElement) {

        if (frame.requestFullscreen) {
          await frame.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }

      } else {

        await document.exitFullscreen();

      }

    } catch (error) {

      console.error("Fullscreen unavailable:", error);

    }

  });


  // Initialize video state
  video.muted = false;

});





/* ==========================================
   CHAMPIONSHIP HERO INTERACTIONS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  const hero = document.querySelector(".champion-hero");

  if (!hero) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* ========================================
     1. SCROLL REVEAL
  ======================================== */

  const revealElements = hero.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {

    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });

  } else {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry, index) => {

          if (!entry.isIntersecting) return;

          entry.target.style.transitionDelay =
            `${Math.min(index * 100, 400)}ms`;

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

        });

      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  }


  /* ========================================
     2. ANIMATED STATISTICS
  ======================================== */

  const counters = hero.querySelectorAll(".counter");

  function animateCounter(element) {

    if (element.dataset.animated === "true") return;

    element.dataset.animated = "true";

    const target = parseFloat(element.dataset.target);
    const decimals = parseInt(element.dataset.decimals || "0", 10);
    const duration = 1800;

    if (reducedMotion) {
      element.textContent = target.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      return;
    }

    const startTime = performance.now();

    function updateCounter(currentTime) {

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      // Smooth ease-out
      const eased = 1 - Math.pow(1 - progress, 4);

      const currentValue = target * eased;

      element.textContent = currentValue.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }

    }

    requestAnimationFrame(updateCounter);

  }


  if ("IntersectionObserver" in window) {

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            animateCounter(entry.target);

            observer.unobserve(entry.target);

          }

        });

      },
      { threshold: 0.7 }
    );

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });

  } else {

    counters.forEach(animateCounter);

  }


  /* ========================================
     3. DESKTOP 3D IMAGE MOVEMENT
  ======================================== */

 var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Count-up for the two real numbers (4.5 and 15+) */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var t0 = null, dur = 1600;
    el.textContent = (0).toFixed(dec);
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    }
    setTimeout(function () { requestAnimationFrame(tick); }, 900);
  });

  /* Gentle 3D tilt on the product frame (fine pointers only) */
  var panel = document.querySelector("[data-tilt]");
  if (!panel || reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var host = panel.parentElement;
  host.addEventListener("mousemove", function (e) {
    var r = host.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;
    var y = (e.clientY - r.top) / r.height - 0.5;
    panel.style.transform = "perspective(1200px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 4).toFixed(2) + "deg)";
  });
  host.addEventListener("mouseleave", function () { panel.style.transform = ""; });
})();
