/*
 * Clean City – site-wide behaviour (WEDE5020 Part 3)
 *  - mobile navigation menu
 *  - hero video pause/play control (and "reduce motion" respect)
 *  - scroll-reveal animations and animated counters
 *  - image gallery with lightbox
 * Plain JavaScript (no framework). jQuery widgets live in ui.js.
 */
(function () {
  'use strict';

  var doc = document;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- Date helpers (shared by listings.js and forms.js) ---------- */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function parseISO(iso) {
    var p = String(iso).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function formatLong(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function formatShort(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); }
  function toISO(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var menu = doc.getElementById('navLinks');
    var openBtn = doc.querySelector('.menu-toggle');
    var closeBtn = doc.querySelector('.menu-close');
    if (!menu || !openBtn) { return; }

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && closeBtn) { closeBtn.focus(); }
      if (!open && doc.activeElement && menu.contains(doc.activeElement)) { openBtn.focus(); }
    }

    openBtn.addEventListener('click', function () { setOpen(true); });
    if (closeBtn) { closeBtn.addEventListener('click', function () { setOpen(false); }); }
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) { setOpen(false); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); }
    });
  }

  /* ---------- Hero video control ---------- */
  function initHeroVideo() {
    var video = doc.querySelector('.header-video');
    var btn = doc.querySelector('.video-toggle');
    if (!video) { return; }

    var saveData = navigator.connection && navigator.connection.saveData;
    if (reducedMotion || saveData) {
      // Respect the visitor's settings: show the poster image only.
      try { video.pause(); } catch (e) { /* ignore */ }
      video.removeAttribute('autoplay');
      video.setAttribute('preload', 'none');
      if (btn) { btn.setAttribute('aria-pressed', 'true'); btn.querySelector('.fa-solid').className = 'fa-solid fa-play'; btn.setAttribute('aria-label', 'Play background video'); }
    }
    if (!btn) { return; }

    btn.addEventListener('click', function () {
      var paused = video.paused;
      var icon = btn.querySelector('.fa-solid');
      if (paused) {
        var p = video.play();
        if (p && p.catch) { p.catch(function () { /* autoplay blocked */ }); }
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Pause background video');
        if (icon) { icon.className = 'fa-solid fa-pause'; }
      } else {
        video.pause();
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Play background video');
        if (icon) { icon.className = 'fa-solid fa-play'; }
      }
    });
  }

  /* ---------- Scroll reveal + animated counters ---------- */
  function formatNumber(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) { return; }
    if (reducedMotion) { el.textContent = formatNumber(target) + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) { start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(target * eased) + suffix;
      if (progress < 1) { window.requestAnimationFrame(step); }
    }
    window.requestAnimationFrame(step);
  }

  function initReveal() {
    var items = doc.querySelectorAll('[data-reveal]');
    var counters = doc.querySelectorAll('[data-count]');

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = formatNumber(parseFloat(el.getAttribute('data-count'))) + (el.getAttribute('data-suffix') || '');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        if (entry.target.hasAttribute('data-count')) { runCounter(entry.target); }
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
    Array.prototype.forEach.call(counters, function (el) { io.observe(el); });
  }

  /* ---------- Gallery lightbox ---------- */
  function initLightbox() {
    var links = Array.prototype.slice.call(doc.querySelectorAll('a.lightbox-link'));
    if (!links.length) { return; }

    var overlay = doc.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.hidden = true;

    var figure = doc.createElement('figure');
    figure.className = 'lightbox-figure';
    var img = doc.createElement('img');
    img.className = 'lightbox-img';
    img.alt = '';
    var caption = doc.createElement('figcaption');
    caption.className = 'lightbox-caption';
    figure.appendChild(img);
    figure.appendChild(caption);

    function makeBtn(cls, label, icon) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'lightbox-btn ' + cls;
      b.setAttribute('aria-label', label);
      var i = doc.createElement('i');
      i.className = 'fa-solid ' + icon;
      i.setAttribute('aria-hidden', 'true');
      b.appendChild(i);
      return b;
    }
    var closeBtn = makeBtn('lightbox-close', 'Close image viewer', 'fa-xmark');
    var prevBtn = makeBtn('lightbox-prev', 'Previous image', 'fa-chevron-left');
    var nextBtn = makeBtn('lightbox-next', 'Next image', 'fa-chevron-right');
    var counter = doc.createElement('p');
    counter.className = 'lightbox-count';
    counter.setAttribute('aria-live', 'polite');

    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(figure);
    overlay.appendChild(nextBtn);
    overlay.appendChild(counter);
    doc.body.appendChild(overlay);

    var index = 0;
    var lastFocus = null;

    function show(i) {
      index = (i + links.length) % links.length;
      var link = links[index];
      var thumb = link.querySelector('img');
      img.src = link.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      caption.textContent = link.getAttribute('data-caption') || (thumb ? thumb.alt : '');
      counter.textContent = (index + 1) + ' of ' + links.length;
    }
    function open(i) {
      lastFocus = doc.activeElement;
      show(i);
      overlay.hidden = false;
      doc.body.classList.add('no-scroll');
      closeBtn.focus();
    }
    function close() {
      overlay.hidden = true;
      doc.body.classList.remove('no-scroll');
      img.removeAttribute('src');
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }

    links.forEach(function (link, i) {
      link.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(); } });

    doc.addEventListener('keydown', function (e) {
      if (overlay.hidden) { return; }
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowLeft') { show(index - 1); }
      else if (e.key === 'ArrowRight') { show(index + 1); }
      else if (e.key === 'Tab') {
        // keep keyboard focus inside the viewer
        var focusable = [closeBtn, prevBtn, nextBtn];
        var pos = focusable.indexOf(doc.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? pos - 1 : pos + 1;
        focusable[(next + focusable.length) % focusable.length].focus();
      }
    });
  }

  function init() {
    initNav();
    initHeroVideo();
    initReveal();
    initLightbox();
  }

  window.CC = window.CC || {};
  window.CC.formatNumber = formatNumber;
  window.CC.dates = { parseISO: parseISO, startOfDay: startOfDay, formatLong: formatLong, formatShort: formatShort, toISO: toISO };

  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
