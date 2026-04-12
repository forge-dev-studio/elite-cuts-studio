/* ============================================================
   ELITE CUTS STUDIO - AUTO LANGUAGE SWITCH
   Detects browser language, auto-swaps to Spanish if es-*.
   Manual EN/ES toggle persists in localStorage.
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

    // Update html lang attr
    document.documentElement.lang = lang;

    // Update toggle button text
    var btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';

    // Update page title if data attribute exists
    var titleEl = document.querySelector('title[data-es]');
    if (titleEl) {
      if (!titleEl.dataset.en) titleEl.dataset.en = titleEl.textContent;
      titleEl.textContent = lang === 'es' ? titleEl.dataset.es : titleEl.dataset.en;
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function toggle() {
    var current = localStorage.getItem(STORAGE_KEY) || getPreferred();
    applyLang(current === 'es' ? 'en' : 'es');
  }

  // Inject toggle button into nav
  function injectToggle() {
    // Try multiple nav selectors for different page layouts
    var nav = document.querySelector('.site-nav .nav-links')
           || document.querySelector('.site-nav')
           || document.querySelector('nav');
    if (!nav) return;

    var btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle language');
    btn.style.cssText = 'background:transparent;border:2px solid rgba(255,255,255,.35);color:#fff;font-family:"Bebas Neue",sans-serif;font-size:.78rem;letter-spacing:.15em;padding:5px 12px;border-radius:3px;cursor:pointer;transition:border-color .2s,color .2s;margin-left:12px;';
    btn.addEventListener('mouseenter', function () { btn.style.borderColor = 'var(--orange)'; btn.style.color = 'var(--orange)'; });
    btn.addEventListener('mouseleave', function () { btn.style.borderColor = 'rgba(255,255,255,.35)'; btn.style.color = '#fff'; });
    btn.addEventListener('click', toggle);
    nav.appendChild(btn);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectToggle();
      applyLang(getPreferred());
    });
  } else {
    injectToggle();
    applyLang(getPreferred());
  }
})();
