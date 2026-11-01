/*
 * Clean City – dynamic content with search, filter and sort (WEDE5020 Part 3)
 * Builds the services list (services.html) and the upcoming events list
 * (get-involved.html) from js/data.js. Text is always inserted with textContent,
 * never as HTML, so the content can't inject markup into the page.
 */
(function () {
  'use strict';

  var dates = window.CC.dates; // from main.js
  var parseISO = dates.parseISO, startOfDay = dates.startOfDay, formatLong = dates.formatLong, formatShort = dates.formatShort;

  function areaById(id) {
    var areas = (window.CC_DATA && window.CC_DATA.areas) || [];
    for (var i = 0; i < areas.length; i++) { if (areas[i].id === id) { return areas[i]; } }
    return null;
  }
  function areaName(id) { var a = areaById(id); return a ? a.name : id; }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined && text !== null) { node.textContent = text; }
    return node;
  }
  function icon(cls) { var i = el('i', 'fa-solid ' + cls); i.setAttribute('aria-hidden', 'true'); return i; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function unique(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }
  function fillSelect(select, firstLabel, values, labelFn) {
    select.textContent = '';
    var all = el('option', '', firstLabel); all.value = 'all'; select.appendChild(all);
    values.forEach(function (v) { var o = el('option', '', labelFn ? labelFn(v) : v); o.value = v; select.appendChild(o); });
  }
  function norm(s) { return String(s || '').toLowerCase(); }

  /* ---------- Services ---------- */
  function serviceCard(s) {
    var card = el('article', 'service-card');
    card.setAttribute('data-reveal', '');
    var head = el('div', 'service-head');
    head.appendChild(icon(s.icon));
    head.appendChild(el('span', 'badge', s.category));
    card.appendChild(head);
    card.appendChild(el('h3', '', s.name));
    card.appendChild(el('p', '', s.description));
    var meta = el('ul', 'meta-list');
    var li1 = el('li'); li1.appendChild(icon('fa-location-dot')); li1.appendChild(document.createTextNode(' ' + s.areas.map(areaName).join(', '))); meta.appendChild(li1);
    var li2 = el('li'); li2.appendChild(icon('fa-tag')); li2.appendChild(document.createTextNode(' ' + s.priceLabel)); meta.appendChild(li2);
    card.appendChild(meta);
    var link = el('a', 'text-link', 'Enquire about this service');
    link.href = 'enquiry.html?type=' + encodeURIComponent(s.enquiryType);
    card.appendChild(link);
    return card;
  }

  function filterServices(list, f) {
    var q = norm(f.query).trim();
    var out = list.filter(function (s) {
      if (f.category !== 'all' && s.category !== f.category) { return false; }
      if (f.area !== 'all' && s.areas.indexOf(f.area) === -1) { return false; }
      if (q) {
        var hay = norm(s.name + ' ' + s.description + ' ' + s.category + ' ' + s.areas.map(areaName).join(' '));
        if (hay.indexOf(q) === -1) { return false; }
      }
      return true;
    });
    out.sort(function (a, b) {
      if (f.sort === 'name-desc') { return a.name < b.name ? 1 : -1; }
      if (f.sort === 'price-asc') { return a.fromPrice - b.fromPrice || (a.name < b.name ? -1 : 1); }
      if (f.sort === 'price-desc') { return b.fromPrice - a.fromPrice || (a.name < b.name ? -1 : 1); }
      return a.name < b.name ? -1 : 1;
    });
    return out;
  }

  function initServices() {
    var host = document.getElementById('service-list');
    var data = window.CC_DATA;
    if (!host || !data) { return; }
    var q = document.getElementById('service-search');
    var cat = document.getElementById('service-category');
    var area = document.getElementById('service-area');
    var sort = document.getElementById('service-sort');
    var clear = document.getElementById('service-clear');
    var count = document.getElementById('service-count');

    fillSelect(cat, 'All categories', unique(data.services.map(function (s) { return s.category; })));
    fillSelect(area, 'All areas', data.areas.map(function (a) { return a.id; }), areaName);

    function render() {
      var results = filterServices(data.services, { query: q.value, category: cat.value, area: area.value, sort: sort.value });
      host.textContent = '';
      results.forEach(function (s) { host.appendChild(serviceCard(s)); });
      count.textContent = results.length === 0 ? 'No services match your search.' :
        'Showing ' + results.length + ' of ' + data.services.length + ' services';
      if (results.length === 0) {
        var empty = el('p', 'empty-state', 'Nothing matched. Try a different word or clear the filters.');
        host.appendChild(empty);
      }
      // cards added after load should still be visible
      Array.prototype.forEach.call(host.querySelectorAll('[data-reveal]'), function (c) { c.classList.add('is-visible'); });
    }

    q.addEventListener('input', debounce(render, 150));
    [cat, area, sort].forEach(function (c) { c.addEventListener('change', render); });
    clear.addEventListener('click', function () { q.value = ''; cat.value = 'all'; area.value = 'all'; sort.value = 'name-asc'; render(); q.focus(); });
    render();
  }

  /* ---------- Events ---------- */
  function upcomingEvents(list, today) {
    var t = startOfDay(today || new Date());
    return list.filter(function (e) { return parseISO(e.date) >= t; });
  }

  function filterEvents(list, f, today) {
    var q = norm(f.query).trim();
    var out = upcomingEvents(list, today).filter(function (e) {
      if (f.type !== 'all' && e.type !== f.type) { return false; }
      if (f.area !== 'all' && e.area !== f.area) { return false; }
      if (q && (norm(e.name + ' ' + e.summary + ' ' + e.type + ' ' + areaName(e.area)).indexOf(q) === -1)) { return false; }
      return true;
    });
    out.sort(function (a, b) {
      if (f.sort === 'date-desc') { return parseISO(b.date) - parseISO(a.date); }
      if (f.sort === 'spots') { return b.spotsLeft - a.spotsLeft; }
      return parseISO(a.date) - parseISO(b.date);
    });
    return out;
  }

  function openEventModal(ev) {
    if (!window.CC || !window.CC.modal) { return; }
    window.CC.modal.open({
      title: ev.name,
      build: function ($body) {
        var body = $body[0];
        var meta = el('ul', 'meta-list');
        [['fa-calendar-days', formatLong(parseISO(ev.date))], ['fa-clock', ev.time], ['fa-location-dot', areaById(ev.area).place + ', ' + areaName(ev.area)],
          ['fa-users', ev.spotsLeft + ' of ' + ev.spots + ' places left']].forEach(function (row) {
          var li = el('li'); li.appendChild(icon(row[0])); li.appendChild(document.createTextNode(' ' + row[1])); meta.appendChild(li);
        });
        body.appendChild(meta);
        body.appendChild(el('p', '', ev.details));
        var link = el('a', 'hero-btn blue-btn', 'Volunteer for this event');
        link.href = 'enquiry.html?type=volunteer&area=' + encodeURIComponent(ev.area);
        body.appendChild(link);
      }
    });
  }

  function eventCard(ev) {
    var card = el('article', 'event-col event-card');
    card.setAttribute('data-reveal', '');
    var img = el('img');
    img.src = ev.poster || ev.photo;
    img.alt = ev.photoAlt;
    img.width = ev.poster ? 800 : 600; img.height = ev.poster ? 600 : 400;
    img.loading = 'lazy'; img.decoding = 'async';
    card.appendChild(img);
    var date = el('div', 'event-date'); date.appendChild(icon('fa-calendar-days')); date.appendChild(document.createTextNode(' ' + formatLong(parseISO(ev.date)))); card.appendChild(date);
    card.appendChild(el('h3', '', ev.name));
    var badges = el('p', 'badge-row');
    badges.appendChild(el('span', 'badge', ev.type));
    badges.appendChild(el('span', 'badge badge-area', areaName(ev.area)));
    var low = ev.spotsLeft <= 10;
    badges.appendChild(el('span', 'badge ' + (low ? 'badge-warn' : 'badge-ok'), ev.spotsLeft + ' places left'));
    card.appendChild(badges);
    card.appendChild(el('p', '', ev.summary));
    var btn = el('button', 'text-link as-button', 'View details');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', function () { openEventModal(ev); });
    card.appendChild(btn);
    return card;
  }

  function initEvents() {
    var host = document.getElementById('event-list');
    var data = window.CC_DATA;
    if (!host || !data) { return; }
    var q = document.getElementById('event-search');
    var type = document.getElementById('event-type');
    var area = document.getElementById('event-area');
    var sort = document.getElementById('event-sort');
    var clear = document.getElementById('event-clear');
    var count = document.getElementById('event-count');

    fillSelect(type, 'All event types', unique(data.events.map(function (e) { return e.type; })));
    fillSelect(area, 'All areas', data.areas.map(function (a) { return a.id; }), areaName);

    function render() {
      var upcoming = upcomingEvents(data.events);
      var results = filterEvents(data.events, { query: q.value, type: type.value, area: area.value, sort: sort.value });
      host.textContent = '';
      results.forEach(function (e) { host.appendChild(eventCard(e)); });
      if (upcoming.length === 0) {
        count.textContent = 'There are no upcoming events right now.';
        host.appendChild(el('p', 'empty-state', 'New events are added regularly. Send us an enquiry to hear about the next one.'));
      } else if (results.length === 0) {
        count.textContent = 'No events match your search.';
        host.appendChild(el('p', 'empty-state', 'Nothing matched. Try a different word or clear the filters.'));
      } else {
        count.textContent = 'Showing ' + results.length + ' of ' + upcoming.length + ' upcoming events';
      }
      Array.prototype.forEach.call(host.querySelectorAll('[data-reveal]'), function (c) { c.classList.add('is-visible'); });
    }

    q.addEventListener('input', debounce(render, 150));
    [type, area, sort].forEach(function (c) { c.addEventListener('change', render); });
    clear.addEventListener('click', function () { q.value = ''; type.value = 'all'; area.value = 'all'; sort.value = 'date-asc'; render(); q.focus(); });
    render();
  }

  function init() { initServices(); initEvents(); }

  window.CC = window.CC || {};
  window.CC.listings = { filterServices: filterServices, filterEvents: filterEvents, upcomingEvents: upcomingEvents };
  window.CC.areaName = areaName;

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
