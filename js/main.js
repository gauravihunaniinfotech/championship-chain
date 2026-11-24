/* main.js — header, mega menu, search, drawer, counters, video, brand marquee, FAQ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var menus = [];
  var search, drawer, backdrop, drawerOpenBtn;
  var lastFocus = null, searchTimer = null;

  /* ---------- shared close helpers ---------- */
  function closeMenus(except) {
    menus.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('is-open');
      var b = $('.nav__link', li);
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  function closeSearch() {
    if (!search || search.hidden) return;
    search.classList.remove('is-open');
    document.body.style.overflow = '';
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { search.hidden = true; }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    drawerOpenBtn.focus();
  }

  /* ---------- Sticky header + back to top ---------- */
  function initHeader() {
    var header = $('#header');
    var toTop = $('#toTop');
    if (!header) return;
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 60);
      var openMenu = $('.has-menu.is-open');
      if (y > 420 && y > lastY + 4 && !openMenu) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 420) header.classList.remove('is-hidden');
      if (toTop) toTop.classList.toggle('is-visible', y > 900);
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---------- Mega menu / dropdowns ---------- */
  function initMenus() {
    menus = $$('.has-menu');

    menus.forEach(function (li) {
      var btn = $('.nav__link', li);
      if (!btn) return;
      var timer;

      function open() {
        clearTimeout(timer);
        closeMenus(li);
        li.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
      function close() {
        timer = setTimeout(function () {
          li.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }, 140);
      }

      if (canHover) {
        li.addEventListener('mouseenter', open);
        li.addEventListener('mouseleave', close);
      }

      btn.addEventListener('click', function () {
        if (!canHover && li.classList.contains('is-open')) {
          li.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          open();
        }
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
  }

  /* ---------- Search overlay ---------- */
  function initSearch() {
    search = $('#search');
    var openBtn = $('#searchOpen');
    var closeBtn = $('#searchClose');
    if (!search || !openBtn) return;

    openBtn.addEventListener('click', function () {
      lastFocus = document.activeElement;
      clearTimeout(searchTimer);
      search.hidden = false;
      requestAnimationFrame(function () { search.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      setTimeout(function () { var q = $('#q'); if (q) q.focus(); }, 250);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    search.addEventListener('click', function (e) { if (e.target === search) closeSearch(); });
  }

  /* ---------- Mobile drawer ---------- */
  function initDrawer() {
    drawer = $('#drawer');
    backdrop = $('#drawerBackdrop');
    drawerOpenBtn = $('#drawerOpen');
    var closeBtn = $('#drawerClose');
    if (!drawer || !backdrop || !drawerOpenBtn) return;

    drawerOpenBtn.addEventListener('click', function () {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      drawerOpenBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 300);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    $$('.drawer__group > button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        $$('.drawer__group > button').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });

    $$('.drawer a[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        drawerOpenBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 991) closeDrawer();
    });
  }

  /* ---------- Count-up numbers (4.5 rating, 15+ years) ---------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || reduce) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1600, t0 = null;

      function tick(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    els.forEach(function (el) {
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      el.textContent = (0).toFixed(dec);
    });

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.textContent = parseFloat(el.getAttribute('data-count')).toFixed(parseInt(el.getAttribute('data-decimals') || '0', 10));
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        setTimeout(function () { run(entry.target); }, 500);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Stock section video (set data-video on #scPlay) ----------
     Accepts: YouTube link, Vimeo link, or direct .mp4/.webm file URL */
  function initVideo() {
    var frame = $('#scFrame');
    var btn = $('#scPlay');
    if (!frame || !btn) return;

    function buildPlayer(url) {
      var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
      var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      var el;

      if (yt || vm) {
        el = document.createElement('iframe');
        el.src = yt
          ? 'https://www.youtube.com/embed/' + yt[1] + '?autoplay=1&rel=0&modestbranding=1'
          : 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
        el.allow = 'autoplay; fullscreen; picture-in-picture';
        el.allowFullscreen = true;
        el.title = 'Championship Chains video';
        el.style.border = '0';
      } else {
        el = document.createElement('video');
        el.src = url;
        el.controls = true;
        el.autoplay = true;
        el.playsInline = true;
      }
      el.className = 'sc__video';
      el.style.zIndex = '5';
      return el;
    }

    btn.addEventListener('click', function () {
      var url = (btn.getAttribute('data-video') || '').trim();
      if (!url) {
        console.warn('Add a video link to the data-video attribute on #scPlay.');
        return;
      }
      frame.appendChild(buildPlayer(url));
      frame.classList.add('is-playing');
    });
  }

  /* ---------- Trusted brands marquee ---------- */
  function initMarquee() {
    var SPEED = 50; // px per second

    $$('[data-tb-marquee]').forEach(function (marquee) {
      var track = $('.tb__track', marquee);
      if (!track) return;
      var groups = $$('.tb__group', track);
      if (groups.length < 2) return;
      var a = groups[0], b = groups[1];
      var base = Array.prototype.slice.call(a.children);
      var section = marquee.closest('.tb');
      b.setAttribute('aria-hidden', 'true');

      function build() {
        while (a.children.length > base.length) a.removeChild(a.lastChild);
        var guard = 0;
        while (a.getBoundingClientRect().width < marquee.clientWidth * 1.1 && guard++ < 10) {
          base.forEach(function (el) { a.appendChild(el.cloneNode(true)); });
        }
        b.innerHTML = a.innerHTML;
        var w = a.getBoundingClientRect().width;
        if (section) section.style.setProperty('--tb-duration', Math.max(w / SPEED, 10) + 's');
      }

      var t;
      build();
      window.addEventListener('load', build);
      window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); });
    });
  }

  /* ---------- FAQ accordion (one open at a time) ---------- */
  function initFaq() {
    $$('.fq__list').forEach(function (list) {
      var items = $$('.fq-item', list);

      function setOpen(item, open) {
        item.classList.toggle('is-open', open);
        var b = $('.fq-item__btn', item);
        if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      items.forEach(function (item) {
        var b = $('.fq-item__btn', item);
        if (!b) return;
        b.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');
          items.forEach(function (i) { setOpen(i, false); });
          setOpen(item, willOpen);
        });
      });
    });
  }

  /* ---------- boot (each part isolated so one error can't stop the rest) ---------- */
  function init() {
    [initHeader, initMenus, initSearch, initDrawer, initCounters, initVideo, initMarquee, initFaq]
      .forEach(function (fn) {
        try { fn(); } catch (err) { console.error('[main.js] ' + fn.name + ' failed:', err); }
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();