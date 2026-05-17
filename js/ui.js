(function () {
  'use strict';

  function $id(id) { return document.getElementById(id); }

  /* traduccion */
  const LANG_KEY = 'matchon_lang';

  function applyLang(lang) {
    document.querySelectorAll('[data-es][data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll('[data-placeholder-es][data-placeholder-en]').forEach(el => {
      el.placeholder = lang === 'en' ? el.dataset.placeholderEn : el.dataset.placeholderEs;
    });
    const btn = $id('langBtn');
    if (btn) btn.textContent = lang === 'en' ? 'ES' : 'EN';
    localStorage.setItem(LANG_KEY, lang);
  }

  function initTranslation() {
    const btn = $id('langBtn');
    if (!btn) return;
    const saved = localStorage.getItem(LANG_KEY) || 'es';
    applyLang(saved);
    btn.addEventListener('click', () => {
      const current = localStorage.getItem(LANG_KEY) || 'es';
      applyLang(current === 'es' ? 'en' : 'es');
    });
  }

  /* busqueda */
  function initSearch() {
    const input = $id('buscador');
    const btn = $id('btnBuscar');
    const countEl = $id('resultCount');
    if (!input) return;

    function doSearch() {
      const q = input.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.torneo-card');
      let shown = 0;
      cards.forEach(card => {
        const text = (card.dataset.search || card.textContent).toLowerCase();
        const match = !q || text.includes(q);
        card.classList.toggle('hidden-search', !match);
        /* oculta el contenedor padre si es un wrapper directo */
        const wrap = card.closest('[id^="Contenedor_"]');
        if (wrap) wrap.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      if (countEl) {
        countEl.textContent = q
          ? (localStorage.getItem(LANG_KEY) === 'en'
            ? `${shown} result${shown !== 1 ? 's' : ''}`
            : `${shown} resultado${shown !== 1 ? 's' : ''}`)
          : '';
      }
    }

    input.addEventListener('input', doSearch);
    if (btn) btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }

  /* ripple */
  function initRipple() {
    document.addEventListener('click', e => {
      const el = e.target.closest('.ripple-btn');
      if (!el) return;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      const rect = el.getBoundingClientRect();
      wave.style.left = (e.clientX - rect.left) + 'px';
      wave.style.top  = (e.clientY - rect.top)  + 'px';
      el.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    });
  }

  /* sidebar */
  function initNavToggle() {
    const nav    = $id('Bloque_navegacion');
    const toggle = $id('navToggle');
    if (!nav || !toggle) return;

    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      document.body.style.overflow = opened ? 'hidden' : '';
    });

    document.addEventListener('click', e => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 650) {
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* nav activo */
  function initActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#Bloque_navegacion nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href === page) a.classList.add('active-link');
    });
  }

  /* modal */
  function initModals() {
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modal = document.querySelector(trigger.dataset.modalTarget);
        if (modal) modal.classList.add('open');
      });
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const overlay = btn.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('open');
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      }
    });
  }

  /* formularios */
  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        let ok = true;
        form.querySelectorAll('[required]').forEach(field => {
          const err = field.parentElement.querySelector('.form-error');
          if (!field.value.trim()) {
            field.classList.add('error');
            if (err) err.classList.add('visible');
            ok = false;
          } else {
            field.classList.remove('error');
            if (err) err.classList.remove('visible');
          }
        });
        if (ok) {
          const success = form.querySelector('.form-success');
          if (success) {
            success.classList.add('visible');
            form.reset();
            setTimeout(() => success.classList.remove('visible'), 4000);
          }
        }
      });
    });
  }

  /* filtros */
  function initFilters() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const group = chip.closest('.filter-bar');
        if (!group) return;
        group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.dataset.filter || 'all';
        document.querySelectorAll('.torneo-card').forEach(card => {
          const matches = filter === 'all' || (card.dataset.filter || '').includes(filter);
          card.classList.toggle('hidden-search', !matches);
          const wrap = card.closest('[id^="Contenedor_"]');
          if (wrap) wrap.style.display = matches ? '' : 'none';
        });
      });
    });
  }

  /* ajustes */
  function initSettings() {
    if (localStorage.getItem('matchon_theme') === 'dark') {
      document.body.classList.add('dark-theme');
    }
    const themeToggle = $id('themeToggle');
    if (themeToggle) {
      themeToggle.checked = localStorage.getItem('matchon_theme') === 'dark';
      themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', themeToggle.checked);
        localStorage.setItem('matchon_theme', themeToggle.checked ? 'dark' : 'light');
      });
    }
    const langSelect = $id('langSelect');
    if (langSelect) {
      langSelect.value = localStorage.getItem(LANG_KEY) || 'es';
      langSelect.addEventListener('change', () => applyLang(langSelect.value));
    }
  }

  /* init */
  document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initActiveNav();
    initTranslation();
    initSearch();
    initRipple();
    initModals();
    initForms();
    initFilters();
    initSettings();
  });
})();
