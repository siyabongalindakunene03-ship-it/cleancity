/*
 * Clean City – interactive widgets built with jQuery (WEDE5020 Part 3)
 *  - accordion  (FAQ)
 *  - tabs       (recycling guide)
 *  - modal      (event details)
 * Each widget follows the matching WAI-ARIA pattern so it also works with a keyboard.
 */
(function ($) {
  'use strict';
  if (!$) { return; }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speed = reduced ? 0 : 220;

  /* ---------- Accordion ---------- */
  function initAccordions() {
    $('[data-accordion]').each(function () {
      var $acc = $(this);
      var $triggers = $acc.find('.accordion-trigger');

      // Start collapsed (content stays visible if JavaScript is off).
      $triggers.each(function () {
        var $t = $(this);
        $('#' + $t.attr('aria-controls')).prop('hidden', true);
        $t.attr('aria-expanded', 'false');
      });

      function toggle($t, open) {
        var $panel = $('#' + $t.attr('aria-controls'));
        $t.attr('aria-expanded', open ? 'true' : 'false');
        $t.closest('.accordion-item').toggleClass('is-open', open);
        if (open) { $panel.stop(true, true).prop('hidden', false).hide().slideDown(speed); }
        else { $panel.stop(true, true).slideUp(speed, function () { $panel.prop('hidden', true); }); }
      }

      $triggers.on('click', function () {
        var $t = $(this);
        var willOpen = $t.attr('aria-expanded') !== 'true';
        if (willOpen) {
          // only one answer open at a time
          $triggers.not($t).filter('[aria-expanded="true"]').each(function () { toggle($(this), false); });
        }
        toggle($t, willOpen);
      });

      $triggers.on('keydown', function (e) {
        var i = $triggers.index(this);
        var target = null;
        if (e.key === 'ArrowDown') { target = $triggers.eq((i + 1) % $triggers.length); }
        else if (e.key === 'ArrowUp') { target = $triggers.eq((i - 1 + $triggers.length) % $triggers.length); }
        else if (e.key === 'Home') { target = $triggers.eq(0); }
        else if (e.key === 'End') { target = $triggers.eq($triggers.length - 1); }
        if (target) { e.preventDefault(); target.trigger('focus'); }
      });
    });
  }

  /* ---------- Tabs ---------- */
  function initTabs() {
    $('[data-tabs]').each(function () {
      var $tabs = $(this);
      var $buttons = $tabs.find('[role="tab"]');
      var $panels = $tabs.find('[role="tabpanel"]');

      function select($btn, focus) {
        $buttons.attr({ 'aria-selected': 'false', tabindex: '-1' }).removeClass('is-active');
        $panels.prop('hidden', true);
        $btn.attr({ 'aria-selected': 'true', tabindex: '0' }).addClass('is-active');
        $('#' + $btn.attr('aria-controls')).prop('hidden', false).hide().fadeIn(speed);
        if (focus) { $btn.trigger('focus'); }
      }

      $buttons.on('click', function () { select($(this), false); });
      $buttons.on('keydown', function (e) {
        var i = $buttons.index(this);
        var n = $buttons.length;
        var target = null;
        if (e.key === 'ArrowRight') { target = $buttons.eq((i + 1) % n); }
        else if (e.key === 'ArrowLeft') { target = $buttons.eq((i - 1 + n) % n); }
        else if (e.key === 'Home') { target = $buttons.eq(0); }
        else if (e.key === 'End') { target = $buttons.eq(n - 1); }
        if (target) { e.preventDefault(); select(target, true); }
      });

      select($buttons.filter('[aria-selected="true"]').first().length ? $buttons.filter('[aria-selected="true"]').first() : $buttons.first(), false);
      $panels.filter(':not([hidden])').show();

      function fromHash(scroll) {
        var id = window.location.hash.replace('#', '');
        if (!id) { return; }
        var $b = $buttons.filter(function () { return $(this).attr('aria-controls') === id; });
        if ($b.length) {
          select($b, false);
          if (scroll && $tabs[0].scrollIntoView) { $tabs[0].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
        }
      }
      fromHash(true);
      $(window).on('hashchange', function () { fromHash(true); });
    });
  }

  /* ---------- Modal ---------- */
  var modalState = { $overlay: null, $last: null };

  function closeModal() {
    var $o = modalState.$overlay;
    if (!$o) { return; }
    $o.fadeOut(speed, function () { $o.remove(); });
    modalState.$overlay = null;
    $('body').removeClass('no-scroll');
    $(document).off('keydown.ccmodal');
    if (modalState.$last && modalState.$last.length) { modalState.$last.trigger('focus'); }
  }

  /**
   * Opens an accessible modal.
   * options.title : heading text
   * options.build : function($body) that fills the modal body using safe DOM methods
   */
  function openModal(options) {
    closeModal();
    modalState.$last = $(document.activeElement);

    var titleId = 'modal-title-' + Date.now();
    var $overlay = $('<div class="modal-overlay"></div>');
    var $dialog = $('<div class="modal" role="dialog" aria-modal="true" tabindex="-1"></div>').attr('aria-labelledby', titleId);
    var $close = $('<button type="button" class="modal-close" aria-label="Close dialog"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>');
    var $title = $('<h2 class="modal-title"></h2>').attr('id', titleId).text(options.title || '');
    var $body = $('<div class="modal-body"></div>');

    if (typeof options.build === 'function') { options.build($body); }
    $dialog.append($close, $title, $body);
    $overlay.append($dialog).hide().appendTo('body').fadeIn(speed);
    $('body').addClass('no-scroll');
    modalState.$overlay = $overlay;
    $dialog.trigger('focus');

    $close.on('click', closeModal);
    $overlay.on('click', function (e) { if (e.target === $overlay[0]) { closeModal(); } });
    $(document).on('keydown.ccmodal', function (e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') { return; }
      var $f = $dialog.find('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])').filter(':visible');
      if (!$f.length) { e.preventDefault(); return; }
      var first = $f[0], last = $f[$f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === $dialog[0])) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  $(function () {
    initAccordions();
    initTabs();
  });

  window.CC = window.CC || {};
  window.CC.modal = { open: openModal, close: closeModal };
})(window.jQuery);
