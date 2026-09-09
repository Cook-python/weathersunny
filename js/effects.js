window.WSFx = (function () {
  'use strict';

  function query(condition) {
    return !!(window.matchMedia && window.matchMedia(condition).matches);
  }

  var reduce = query('(prefers-reduced-motion: reduce)');
  var finePointer = query('(pointer: fine)');
  var TILT = 5;
  var SELECTOR = '.project, .stat, .article-item, .profile-card';

  function closest(node, selector) {
    if (!node || !node.closest) return null;
    return node.closest(selector);
  }

  function initTilt() {
    if (reduce || !finePointer) return;

    document.addEventListener('pointermove', function (event) {
      var card = closest(event.target, SELECTOR);
      if (!card) return;
      var rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (event.clientX - rect.left) / rect.width;
      var py = (event.clientY - rect.top) / rect.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', ((px - 0.5) * TILT * 2).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - py) * TILT * 2).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    }, { passive: true });

    document.addEventListener('pointerout', function (event) {
      var card = closest(event.target, SELECTOR);
      if (!card) return;
      if (event.relatedTarget && card.contains(event.relatedTarget)) return;
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    }, { passive: true });
  }

  function initParallax() {
    if (reduce) return;
    var pending = false;
    var apply = function () {
      var top = window.pageYOffset || document.documentElement.scrollTop || 0;
      var shift = Math.max(-46, Math.min(46, top * 0.04));
      document.documentElement.style.setProperty('--par', shift.toFixed(1) + 'px');
      document.documentElement.style.setProperty('--par-neg', (-shift).toFixed(1) + 'px');
      pending = false;
    };
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  }

  function sameDocument(url) {
    return url.pathname === window.location.pathname && url.search === window.location.search;
  }

  function initTransitions() {
    if (reduce) return;

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = closest(event.target, 'a[href]');
      if (!link || link.hasAttribute('download')) return;
      if (link.target && link.target !== '_self') return;

      var url;
      try {
        url = new URL(link.getAttribute('href'), window.location.href);
      } catch (error) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.hash && sameDocument(url)) return;
      if (sameDocument(url)) return;

      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(function () { window.location.href = url.href; }, 170);
      window.setTimeout(function () { document.body.classList.remove('is-leaving'); }, 2500);
    });

    window.addEventListener('pageshow', function () {
      document.body.classList.remove('is-leaving');
    });
  }

  function skeletons(container, count) {
    if (!container) return;
    var markup = '';
    for (var i = 0; i < (count || 6); i += 1) {
      markup += '<div class="skeleton" aria-hidden="true">' +
        '<div class="skeleton-thumb shimmer"></div>' +
        '<div class="skeleton-body">' +
          '<div class="skeleton-line shimmer" style="width:78%"></div>' +
          '<div class="skeleton-line shimmer" style="width:46%"></div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = markup;
  }

  function stagger(nodes, step) {
    nodes.forEach(function (node, index) {
      node.setAttribute('data-delay', String(Math.min(index, 8) * (step || 60)));
    });
  }

  function init() {
    initTilt();
    initParallax();
    initTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    skeletons: skeletons,
    stagger: stagger,
    reduce: reduce
  };
})();
