/* ============================================================
   ELITE CUTS STUDIO - AUTO LANGUAGE SWITCH
   Detects browser language, auto-swaps to Spanish if es-*.
   No visible toggle -- fully automatic.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'ecs-lang';

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.startsWith('es') ? 'es' : 'en';
  }

  function applyLang(lang) {
    var els = document.querySelectorAll('[data-es]');
    els.forEach(function (el) {
      if (!el.dataset.en) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'es' ? el.dataset.es : el.dataset.en;
    });

    document.documentElement.lang = lang;

    var titleEl = document.querySelector('title[data-es]');
    if (titleEl) {
      if (!titleEl.dataset.en) titleEl.dataset.en = titleEl.textContent;
      titleEl.textContent = lang === 'es' ? titleEl.dataset.es : titleEl.dataset.en;
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyLang(getPreferred());
    });
  } else {
    applyLang(getPreferred());
  }
})();
