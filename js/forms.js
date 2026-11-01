/*
 * Clean City – form validation and processing (WEDE5020 Part 3)
 *
 *  enquiry.html : validates -> submits with AJAX (jQuery) -> shows an answer about
 *                 cost / availability worked out from js/data.js
 *  contact.html : validates -> compiles an email -> visitor sends it to the
 *                 recipient set in js/config.js (mailto link)
 *
 * Security notes: every value is trimmed and stripped of control characters, user
 * text is only ever written with textContent (never innerHTML), mailto parts are
 * URL-encoded, line breaks are removed from single-line fields (no header
 * injection) and a hidden honeypot field catches simple bots.
 */
(function ($) {
  'use strict';

  var CONFIG = window.CC_CONFIG || {};
  var DATA = window.CC_DATA || { areas: [], events: [], pricing: {} };
  var dates = (window.CC && window.CC.dates) || null;

  /* ---------- helpers ---------- */
  function clean(s) {
    return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function cleanMultiline(s) {
    return String(s == null ? '' : s).replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function money(n) { return 'R' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function areaOf(id) {
    for (var i = 0; i < DATA.areas.length; i++) { if (DATA.areas[i].id === id) { return DATA.areas[i]; } }
    return null;
  }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* ---------- validators (each returns '' when valid, otherwise the message) ---------- */
  var NAME_RE = /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF'\u2019.\- ]*$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^(\+27|0)[1-9][0-9]{8}$/;

  var V = {
    fullName: function (raw) {
      var v = clean(raw);
      if (!v) { return 'Please enter your full name.'; }
      if (v.length < 2) { return 'Your name must be at least 2 characters.'; }
      if (v.length > 60) { return 'Your name must be 60 characters or fewer.'; }
      if (!NAME_RE.test(v)) { return 'Use letters, spaces, hyphens, apostrophes and full stops only.'; }
      return '';
    },
    email: function (raw) {
      var v = clean(raw);
      if (!v) { return 'Please enter your email address.'; }
      if (v.length > 100) { return 'Your email address is too long.'; }
      if (!EMAIL_RE.test(v)) { return 'Enter a valid email address, for example name@example.com.'; }
      return '';
    },
    phone: function (raw) {
      var v = clean(raw).replace(/[\s\-()]/g, '');
      if (!v) { return ''; } // optional
      if (!PHONE_RE.test(v)) { return 'Enter a South African number such as 082 345 6789 or +27 82 345 6789.'; }
      return '';
    },
    required: function (label) {
      return function (raw) { return clean(raw) ? '' : 'Please choose ' + label + '.'; };
    },
    oneOf: function (label, allowed) {
      return function (raw) {
        var v = clean(raw);
        if (!v) { return 'Please choose ' + label + '.'; }
        return allowed.indexOf(v) === -1 ? 'Please choose one of the options listed.' : '';
      };
    },
    text: function (label, min, max) {
      return function (raw) {
        var v = cleanMultiline(raw);
        if (!v) { return 'Please enter ' + label + '.'; }
        if (v.length < min) { return 'Please write at least ' + min + ' characters (you have ' + v.length + ').'; }
        if (v.length > max) { return 'Please keep it to ' + max + ' characters or fewer (you have ' + v.length + ').'; }
        return '';
      };
    },
    singleLine: function (label, min, max) {
      return function (raw) {
        var v = clean(raw);
        if (!v) { return 'Please enter ' + label + '.'; }
        if (v.length < min) { return 'Please write at least ' + min + ' characters.'; }
        if (v.length > max) { return 'Please keep it to ' + max + ' characters or fewer.'; }
        return '';
      };
    },
    integerBetween: function (label, min, max) {
      return function (raw) {
        var v = clean(raw);
        if (!v) { return 'Please enter ' + label + '.'; }
        if (!/^\d+$/.test(v)) { return 'Use whole numbers only.'; }
        var n = parseInt(v, 10);
        if (n < min || n > max) { return 'Enter a number from ' + min + ' to ' + max + '.'; }
        return '';
      };
    },
    futureDate: function (today) {
      return function (raw) {
        var v = clean(raw);
        if (!v) { return 'Please choose a date.'; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { return 'Enter the date as day, month and year.'; }
        var d = dates.parseISO(v);
        if (isNaN(d.getTime()) || dates.toISO(d) !== v) { return 'That date does not exist.'; }
        var t = startOfDay(today || new Date());
        if (d < t) { return 'Please choose today or a date in the future.'; }
        if (d > addDays(t, 365)) { return 'Please choose a date within the next 12 months.'; }
        return '';
      };
    },
    consent: function (checked) {
      return checked ? '' : 'Please tick the box so we may use your details to reply.';
    }
  };

  /* ---------- field UI helpers ---------- */
  function errorBox(input) { return document.getElementById(input.id + '-error'); }

  function showError(input, message) {
    var box = errorBox(input);
    var group = input.closest('.form-group');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (group) { group.classList.add('is-invalid'); }
      if (box) { box.textContent = message; }
    } else {
      input.removeAttribute('aria-invalid');
      if (group) { group.classList.remove('is-invalid'); }
      if (box) { box.textContent = ''; }
    }
  }

  /**
   * rules: { fieldName: function(value, input) -> message } — only visible fields are checked.
   * Returns the first invalid input (or null).
   */
  function validateForm(form, rules) {
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) { return; }
      var group = input.closest('[data-field-group]');
      if (group && group.hidden) { showError(input, ''); return; }
      var message = input.type === 'checkbox' ? rules[name](input.checked, input) : rules[name](input.value, input);
      showError(input, message);
      if (message && !firstInvalid) { firstInvalid = input; }
    });
    return firstInvalid;
  }

  function liveValidation(form, rules) {
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) { return; }
      var evt = (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'date') ? 'change' : 'blur';
      input.addEventListener(evt, function () {
        var group = input.closest('[data-field-group]');
        if (group && group.hidden) { return; }
        showError(input, input.type === 'checkbox' ? rules[name](input.checked, input) : rules[name](input.value, input));
      });
      // clear the error as soon as the visitor starts fixing it
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') { showError(input, rules[name](input.type === 'checkbox' ? input.checked : input.value, input)); } });
    });
  }

  function attachCounter(textarea, counter, max) {
    function update() { counter.textContent = cleanMultiline(textarea.value).length + ' / ' + max + ' characters'; }
    textarea.addEventListener('input', update);
    update();
  }

  /* =====================================================================
   * ENQUIRY FORM
   * ===================================================================== */
  var TYPES = {
    volunteer:   { label: 'Volunteering',                     needsArea: true,  needsDate: true,  qty: { label: 'How many volunteers?',          hint: 'From 1 to 20 people.',  min: 1, max: 20 },  dateLabel: 'Preferred volunteer date' },
    pickup:      { label: 'Household pick-up quote',          needsArea: true,  needsDate: true,  qty: { label: 'Bags of recyclables per pick-up', hint: 'From 1 to 50 bags.',  min: 1, max: 50 },  dateLabel: 'Preferred first pick-up date' },
    business:    { label: 'Business collection quote',        needsArea: true,  needsDate: false, qty: { label: 'Number of bins',                hint: 'From 1 to 30 bins.',   min: 1, max: 30 } },
    workshop:    { label: 'Book a Recycling 101 workshop',    needsArea: true,  needsDate: true,  qty: { label: 'Group size',                    hint: 'From 5 to 100 people.', min: 5, max: 100 }, dateLabel: 'Preferred workshop date' },
    partnership: { label: 'Partnership or sponsorship',       needsArea: false, needsDate: false, qty: null },
    general:     { label: 'General question',                 needsArea: false, needsDate: false, qty: null }
  };

  function nextWeekday(from, weekday) {
    var d = startOfDay(from);
    while (d.getDay() !== weekday) { d = addDays(d, 1); }
    return d;
  }

  function reference(today, rng) {
    var r = Math.floor((rng ? rng() : Math.random()) * 9000) + 1000;
    return 'CC-' + dates.toISO(today).replace(/-/g, '') + '-' + r;
  }

  /**
   * Works out the answer shown after a valid enquiry.
   * values: { type, area, quantity, date, email, fullName }
   * Returns { heading, lines[], highlight, reference }
   */
  function buildEnquiryResponse(values, today, rng) {
    today = startOfDay(today || new Date());
    var type = values.type;
    var area = areaOf(values.area);
    var qty = parseInt(values.quantity, 10);
    var P = DATA.pricing;
    var lines = [];
    var highlight = '';
    var heading = 'Thank you, ' + clean(values.fullName).split(' ')[0] + '.';

    if (type === 'volunteer') {
      var wanted = values.date ? dates.parseISO(values.date) : today;
      var upcoming = DATA.events.filter(function (e) { return e.area === area.id && dates.parseISO(e.date) >= today; })
        .sort(function (a, b) { return dates.parseISO(a.date) - dates.parseISO(b.date); });
      var afterWanted = upcoming.filter(function (e) { return dates.parseISO(e.date) >= wanted; });
      var fits = afterWanted.filter(function (e) { return e.spotsLeft >= qty; });
      highlight = 'Volunteering is free.';
      if (fits.length) {
        var e1 = fits[0];
        lines.push('Good news: we have room for ' + plural(qty, 'volunteer', 'volunteers') + ' at ' + e1.name + ' on ' + dates.formatLong(dates.parseISO(e1.date)) + ' (' + e1.time + ').');
        lines.push(plural(e1.spotsLeft, 'place is', 'places are') + ' still open. We meet at the ' + area.place + '. Gloves and bags are provided.');
        if (fits.length > 1) { lines.push('Other dates in ' + area.name + ': ' + fits.slice(1, 3).map(function (e) { return e.name + ' (' + dates.formatShort(dates.parseISO(e.date)) + ')'; }).join(', ') + '.'); }
      } else if (afterWanted.length) {
        var e2 = afterWanted[0];
        lines.push('The closest event on or after your date is ' + e2.name + ' on ' + dates.formatLong(dates.parseISO(e2.date)) + ', but only ' + plural(e2.spotsLeft, 'place is', 'places are') + ' left.');
        lines.push('Our team can split your group across events, or you can pick a later date.');
      } else {
        lines.push('We have no scheduled events in ' + area.name + ' on or after your preferred date yet.');
        lines.push('Our team will contact you as soon as the next one is planned.');
      }
    } else if (type === 'pickup') {
      var extra = Math.max(0, qty - P.pickup.includedBags);
      var cost = P.pickup.base + extra * P.pickup.extraBag;
      var wantedP = values.date ? dates.parseISO(values.date) : today;
      var tomorrow = addDays(today, 1);
      var first = nextWeekday(wantedP < tomorrow ? tomorrow : wantedP, area.pickupDay);
      highlight = 'Estimated cost: ' + money(cost) + ' per pick-up.';
      lines.push('That covers ' + plural(qty, 'bag', 'bags') + ' (the base price includes ' + P.pickup.includedBags + ' bags, then ' + money(P.pickup.extraBag) + ' for each extra bag).');
      lines.push('Pick-ups in ' + area.name + ' happen every ' + WEEKDAYS[area.pickupDay] + '. The first available pick-up on or after your date is ' + dates.formatLong(first) + '.');
    } else if (type === 'business') {
      var extraBins = Math.max(0, qty - P.business.includedBins);
      var monthly = P.business.base + extraBins * P.business.extraBin;
      highlight = 'Estimated cost: ' + money(monthly) + ' per month.';
      lines.push('That covers ' + plural(qty, 'bin', 'bins') + ' (the base price includes ' + P.business.includedBins + ' bins, then ' + money(P.business.extraBin) + ' for each extra bin).');
      lines.push('We collect in ' + area.name + ' every ' + WEEKDAYS[area.pickupDay] + '. A team member will contact you to confirm the final quote and arrange a site visit.');
    } else if (type === 'workshop') {
      var extraPeople = Math.max(0, qty - P.workshop.includedPeople);
      var fee = P.workshop.base + extraPeople * P.workshop.extraPerson;
      var wantedW = values.date ? dates.parseISO(values.date) : today;
      var nextPublic = DATA.events.filter(function (e) { return e.type === 'Workshop' && e.area === area.id && dates.parseISO(e.date) >= wantedW; })
        .sort(function (a, b) { return dates.parseISO(a.date) - dates.parseISO(b.date); })[0];
      highlight = 'Estimated cost: ' + money(fee) + ' for ' + plural(qty, 'person', 'people') + '.';
      lines.push('A private session costs ' + money(P.workshop.base) + ' for up to ' + P.workshop.includedPeople + ' people, plus ' + money(P.workshop.extraPerson) + ' for each extra person.');
      lines.push(nextPublic
        ? 'Our next public workshop in ' + area.name + ' is ' + nextPublic.name + ' on ' + dates.formatLong(dates.parseISO(nextPublic.date)) + ' (' + plural(nextPublic.spotsLeft, 'place', 'places') + ' left). Private sessions can be arranged for ' + dates.formatLong(wantedW) + ', subject to confirmation.'
        : 'We can arrange a private session on or near ' + dates.formatLong(wantedW) + ', subject to confirmation.');
    } else if (type === 'partnership') {
      highlight = 'Partnerships start from ' + money(P.partnership[0].monthly) + ' per month.';
      P.partnership.forEach(function (t) { lines.push(t.name + ' – ' + money(t.monthly) + ' per month: ' + t.perk + '.'); });
      lines.push('A member of our partnerships team will contact you to discuss what suits your organisation.');
    } else {
      highlight = 'We usually reply within 2 business days.';
      lines.push('Thank you for your question. Our team will reply by email.');
      lines.push('In the meantime you can browse our services and upcoming events for quick answers.');
    }

    return { heading: heading, lines: lines, highlight: highlight, reference: reference(today, rng) };
  }

  function sendToServer(payload) {
    var d = $.Deferred();
    if (!CONFIG.formEndpoint) {
      // Demo mode: nothing leaves the browser.
      setTimeout(function () { d.resolve({ demo: true }); }, 500);
      return d.promise();
    }
    return $.ajax({
      url: CONFIG.formEndpoint,
      method: 'POST',
      data: JSON.stringify(payload),
      contentType: 'application/json',
      dataType: 'json',
      headers: { Accept: 'application/json' },
      timeout: 10000
    });
  }

  function initEnquiry() {
    var form = document.getElementById('enquiry-form');
    if (!form || !$) { return; }
    form.noValidate = true;

    var typeSel = form.elements.type;
    var qtyGroup = form.querySelector('[data-field="quantity"]');
    var qtyLabel = qtyGroup.querySelector('label .label-text');
    var qtyHint = document.getElementById('quantity-hint');
    var areaGroup = form.querySelector('[data-field="area"]');
    var dateGroup = form.querySelector('[data-field="date"]');
    var dateLabel = dateGroup.querySelector('label .label-text');
    var statusBox = document.getElementById('form-status');
    var panel = document.getElementById('enquiry-response');
    var submitBtn = form.querySelector('button[type="submit"]');

    // date limits
    var today = startOfDay(new Date());
    form.elements.date.min = dates.toISO(today);
    form.elements.date.max = dates.toISO(addDays(today, 365));

    function currentType() { return TYPES[typeSel.value] || null; }

    function applyType() {
      var t = currentType();
      areaGroup.hidden = !(t && t.needsArea);
      dateGroup.hidden = !(t && t.needsDate);
      qtyGroup.hidden = !(t && t.qty);
      if (t && t.qty) {
        qtyLabel.textContent = t.qty.label;
        qtyHint.textContent = t.qty.hint;
        form.elements.quantity.min = t.qty.min;
        form.elements.quantity.max = t.qty.max;
      }
      if (t && t.needsDate) { dateLabel.textContent = t.dateLabel; }
    }

    var rules = {
      fullName: V.fullName,
      email: V.email,
      phone: V.phone,
      type: V.oneOf('what your enquiry is about', Object.keys(TYPES)),
      area: function (v) { var t = currentType(); return (t && t.needsArea) ? V.oneOf('your area', DATA.areas.map(function (a) { return a.id; }))(v) : ''; },
      quantity: function (v) { var t = currentType(); return (t && t.qty) ? V.integerBetween('a number', t.qty.min, t.qty.max)(v) : ''; },
      date: function (v) { var t = currentType(); return (t && t.needsDate) ? V.futureDate(new Date())(v) : ''; },
      message: V.text('your message', 10, 500),
      consent: V.consent
    };

    typeSel.addEventListener('change', function () {
      applyType();
      // re-check fields whose rules depend on the type
      ['area', 'quantity', 'date'].forEach(function (n) { showError(form.elements[n], ''); });
    });
    liveValidation(form, rules);
    attachCounter(form.elements.message, document.getElementById('message-count'), 500);

    // Pre-fill from links such as enquiry.html?type=volunteer&area=hillbrow
    var params = new URLSearchParams(window.location.search);
    if (TYPES[params.get('type')]) { typeSel.value = params.get('type'); }
    if (areaOf(params.get('area'))) { form.elements.area.value = params.get('area'); }
    applyType();

    function setStatus(msg, kind) {
      statusBox.textContent = msg;
      statusBox.className = 'form-status' + (kind ? ' is-' + kind : '');
      statusBox.hidden = !msg;
    }

    function showResponse(result, values, demo) {
      panel.textContent = '';
      var h = document.createElement('h2'); h.textContent = result.heading; h.id = 'response-heading'; panel.appendChild(h);
      var hl = document.createElement('p'); hl.className = 'response-highlight'; hl.textContent = result.highlight; panel.appendChild(hl);
      result.lines.forEach(function (l) { var p = document.createElement('p'); p.textContent = l; panel.appendChild(p); });
      var ref = document.createElement('p'); ref.className = 'response-ref';
      ref.textContent = 'Your reference: ' + result.reference + '. We will reply to ' + clean(values.email) + '.';
      panel.appendChild(ref);
      if (demo) {
        var d = document.createElement('p'); d.className = 'response-demo';
        d.textContent = 'Demo mode: this enquiry was checked and answered in your browser, and nothing was sent to our team yet.';
        panel.appendChild(d);
      }
      var again = document.createElement('button'); again.type = 'button'; again.className = 'hero-btn blue-btn'; again.textContent = 'Send another enquiry';
      again.addEventListener('click', function () { panel.hidden = true; form.hidden = false; form.reset(); applyType(); attachReset(); form.elements.fullName.focus(); });
      panel.appendChild(again);
      form.hidden = true;
      panel.hidden = false;
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }
    function attachReset() { Array.prototype.forEach.call(form.querySelectorAll('.form-group'), function (g) { g.classList.remove('is-invalid'); }); setStatus('', ''); document.getElementById('message-count').textContent = '0 / 500 characters'; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      var bad = validateForm(form, rules);
      if (bad) {
        setStatus('Please fix the highlighted fields and try again.', 'error');
        bad.focus();
        return;
      }
      // honeypot: real visitors never see or fill this field
      if (form.elements.website.value) { showResponse({ heading: 'Thank you.', lines: [], highlight: '', reference: '' }, { email: '' }, false); return; }

      var t = currentType();
      var values = {
        fullName: clean(form.elements.fullName.value),
        email: clean(form.elements.email.value),
        phone: clean(form.elements.phone.value).replace(/[\s\-()]/g, ''),
        type: typeSel.value,
        area: t.needsArea ? form.elements.area.value : '',
        quantity: t.qty ? clean(form.elements.quantity.value) : '',
        date: t.needsDate ? clean(form.elements.date.value) : '',
        message: cleanMultiline(form.elements.message.value)
      };

      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      var oldLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      setStatus('Sending your enquiry…', 'info');

      sendToServer(values).done(function (resp) {
        var result = buildEnquiryResponse(values, new Date());
        setStatus('', '');
        showResponse(result, values, !!(resp && resp.demo));
      }).fail(function () {
        setStatus('Sorry, we could not send your enquiry just now. Please check your connection and try again, or email ' + CONFIG.recipientEmail + '.', 'error');
      }).always(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = oldLabel;
      });
    });
  }

  /* =====================================================================
   * CONTACT FORM
   * ===================================================================== */
  var MESSAGE_TYPES = {
    general: 'General question',
    feedback: 'Feedback or suggestion',
    media: 'Media or press',
    dumping: 'Report illegal dumping',
    complaint: 'Complaint'
  };

  function buildEmail(values, recipient) {
    var to = clean(recipient);
    var subject = '[Website] ' + MESSAGE_TYPES[values.messageType] + ': ' + clean(values.subject);
    var body = [
      'Hello Clean City team,',
      '',
      cleanMultiline(values.message),
      '',
      '--',
      'Name: ' + clean(values.fullName),
      'Email: ' + clean(values.email),
      'Phone: ' + (clean(values.phone) || 'not provided'),
      'Message type: ' + MESSAGE_TYPES[values.messageType],
      'Sent from the Clean City website contact form'
    ].join('\n');
    var href = 'mailto:' + encodeURIComponent(to).replace(/%40/g, '@') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return { to: to, subject: subject, body: body, mailto: href };
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) { return navigator.clipboard.writeText(text); }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.className = 'visually-hidden';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); } finally { document.body.removeChild(ta); }
    });
  }

  function initContact() {
    var form = document.getElementById('contact-form');
    if (!form) { return; }
    form.noValidate = true;
    var statusBox = document.getElementById('form-status');
    var preview = document.getElementById('email-preview');

    var rules = {
      fullName: V.fullName,
      email: V.email,
      phone: V.phone,
      messageType: V.oneOf('the type of message', Object.keys(MESSAGE_TYPES)),
      subject: V.singleLine('a subject', 5, 80),
      message: V.text('your message', 20, 1000),
      consent: V.consent
    };
    liveValidation(form, rules);
    attachCounter(form.elements.message, document.getElementById('message-count'), 1000);

    var params = new URLSearchParams(window.location.search);
    if (MESSAGE_TYPES[params.get('type')]) { form.elements.messageType.value = params.get('type'); }

    function setStatus(msg, kind) {
      statusBox.textContent = msg;
      statusBox.className = 'form-status' + (kind ? ' is-' + kind : '');
      statusBox.hidden = !msg;
    }

    function row(label, value, cls) {
      var wrap = document.createElement('div'); wrap.className = 'email-row';
      var l = document.createElement('span'); l.className = 'email-label'; l.textContent = label;
      var v = document.createElement(cls === 'body' ? 'pre' : 'span'); v.className = 'email-value'; v.textContent = value;
      wrap.appendChild(l); wrap.appendChild(v); return wrap;
    }

    function showPreview(mail) {
      preview.textContent = '';
      var h = document.createElement('h2'); h.textContent = 'Your email is ready to send'; preview.appendChild(h);
      var intro = document.createElement('p');
      intro.textContent = 'Check the message below. Choose “Open in my email app” and press send in your email program.';
      preview.appendChild(intro);
      preview.appendChild(row('To', mail.to));
      preview.appendChild(row('Subject', mail.subject));
      preview.appendChild(row('Message', mail.body, 'body'));

      var actions = document.createElement('div'); actions.className = 'preview-actions';
      var send = document.createElement('a'); send.className = 'hero-btn blue-btn'; send.href = mail.mailto; send.textContent = 'Open in my email app';
      var copy = document.createElement('button'); copy.type = 'button'; copy.className = 'hero-btn ghost-btn'; copy.textContent = 'Copy email text';
      var edit = document.createElement('button'); edit.type = 'button'; edit.className = 'hero-btn ghost-btn'; edit.textContent = 'Edit my message';
      var note = document.createElement('p'); note.className = 'copy-note'; note.setAttribute('role', 'status');
      copy.addEventListener('click', function () {
        copyText('To: ' + mail.to + '\nSubject: ' + mail.subject + '\n\n' + mail.body)
          .then(function () { note.textContent = 'Copied. You can paste it into any email program.'; })
          .catch(function () { note.textContent = 'Copying was blocked by your browser. Please select the text and copy it manually.'; });
      });
      edit.addEventListener('click', function () { preview.hidden = true; form.hidden = false; form.elements.message.focus(); });
      actions.appendChild(send); actions.appendChild(copy); actions.appendChild(edit);
      preview.appendChild(actions); preview.appendChild(note);
      form.hidden = true;
      preview.hidden = false;
      preview.setAttribute('tabindex', '-1');
      preview.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      var bad = validateForm(form, rules);
      if (bad) { setStatus('Please fix the highlighted fields and try again.', 'error'); bad.focus(); return; }
      if (form.elements.website.value) { return; } // honeypot
      var values = {
        fullName: form.elements.fullName.value,
        email: form.elements.email.value,
        phone: form.elements.phone.value,
        messageType: form.elements.messageType.value,
        subject: form.elements.subject.value,
        message: form.elements.message.value
      };
      showPreview(buildEmail(values, CONFIG.recipientEmail));
    });
  }

  function init() { initEnquiry(); initContact(); }

  window.CC = window.CC || {};
  window.CC.forms = { validators: V, clean: clean, cleanMultiline: cleanMultiline, buildEnquiryResponse: buildEnquiryResponse, buildEmail: buildEmail, TYPES: TYPES, MESSAGE_TYPES: MESSAGE_TYPES };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window.jQuery);
