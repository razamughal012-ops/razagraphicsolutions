(() => {
  'use strict';

  /* ==========================================================
     LOADER
     ========================================================== */
  let loaderHidden = false;
  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
  }
  // Normal path: hide shortly after everything (fonts, etc.) has loaded.
  window.addEventListener('load', () => setTimeout(hideLoader, 500));
  // Safety net: some environments (sandboxed previews, blocked/slow font
  // requests) never fire 'load'. Never leave the visitor staring at the
  // loader for more than 2.5s regardless of network conditions.
  setTimeout(hideLoader, 2500);

  /* ==========================================================
     YEAR
     ========================================================== */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ==========================================================
     CUSTOM CURSOR (fine-pointer devices only)
     ========================================================== */
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isFinePointer) {
    const cursor = document.getElementById('cursor');
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let rx = cx, ry = cy;

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cursor.classList.add('is-active');
    });

    function renderCursor() {
      rx += (cx - rx) * 0.18;
      ry += (cy - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    const hoverTargets = 'a, button, .portfolio-item, input, select, textarea, .accordion__trigger';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.remove('is-hover');
    });
  }

  /* ==========================================================
     PARTICLE BACKGROUND (hero canvas)
     ========================================================== */
  const canvas = document.getElementById('particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }
    function makeParticles() {
      const count = Math.min(70, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 162, 77, ${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize(); makeParticles(); draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
  }

  /* ==========================================================
     HERO TYPING EFFECT
     ========================================================== */
  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    const phrases = ['Graphic Designer', 'Video Editor', 'Brand Storyteller', 'Creative Studio'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      typingEl.textContent = phrases[0];
    } else {
      let pIndex = 0, charIndex = 0, deleting = false;
      function typeTick() {
        const phrase = phrases[pIndex];
        if (!deleting) {
          charIndex++;
          typingEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === phrase.length) {
            deleting = true;
            setTimeout(typeTick, 1400);
            return;
          }
        } else {
          charIndex--;
          typingEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            pIndex = (pIndex + 1) % phrases.length;
          }
        }
        setTimeout(typeTick, deleting ? 35 : 65);
      }
      typeTick();
    }
  }

  /* ==========================================================
     SCROLL PROGRESS + STICKY NAV + BACK TO TOP + ACTIVE LINK
     ========================================================== */
  const nav = document.getElementById('siteNav');
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = navLinks
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + '%';

    nav.classList.toggle('is-scrolled', scrollTop > 40);
    backToTop.classList.toggle('is-visible', scrollTop > 600);

    let current = sections[0];
    const line = scrollTop + window.innerHeight * 0.3;
    sections.forEach(sec => { if (sec.offsetTop <= line) current = sec; });
    navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current.id));
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ==========================================================
     MOBILE NAV
     ========================================================== */
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.getElementById('navLinks');

  function closeMenu() {
    navLinksEl.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  navToggle.addEventListener('click', () => {
    const open = navLinksEl.classList.toggle('is-open');
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(l => l.addEventListener('click', closeMenu));

  /* ==========================================================
     SCROLL REVEAL
     ========================================================== */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), (i % 4) * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ==========================================================
     ANIMATED COUNTERS
     ========================================================== */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));

  /* ==========================================================
     SKILL BARS
     ========================================================== */
  const skillBars = document.querySelectorAll('.skill-bar');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const pct = bar.dataset.percent;
      bar.querySelector('.skill-bar__fill').style.width = pct + '%';
      skillObserver.unobserve(bar);
    });
  }, { threshold: 0.4 });
  skillBars.forEach(bar => skillObserver.observe(bar));

  /* ==========================================================
     SITE SETTINGS (founder photo) — managed via /admin CMS
     ========================================================== */
  fetch('content/settings.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : Promise.reject()))
    .then(data => {
      const frame = document.getElementById('aboutFrameInner');
      if (frame && data.founder_photo) {
        frame.innerHTML = `<img src="${data.founder_photo}" alt="Muhammad Bilal Sarwar, founder of Raza Graphic Solutions" loading="lazy">`;
      }
    })
    .catch(() => { /* keep initials placeholder */ });

  /* ==========================================================
     PORTFOLIO DATA + RENDER
     Content lives in /content/portfolio.json, editable via the
     admin CMS at /admin. Falls back to sensible defaults if the
     file can't be fetched (e.g. an offline preview).
     ========================================================== */
  const defaultPortfolioItems = [
    { title: 'Lumen Skincare — Brand Identity', category: 'branding', label: 'Branding', image: '',
      desc: 'A full identity system for a skincare brand entering a crowded market — logo, packaging language and a colour system built to feel calm and premium.',
      client: 'Lumen Skincare', role: 'Brand Identity', year: '2025' },
    { title: 'Orchid Retail — Sale Poster', category: 'posters', label: 'Posters', image: '',
      desc: 'A bold seasonal sale poster designed to work across in-store print and social, built around a single strong focal point.',
      client: 'Orchid Retail', role: 'Poster Design', year: '2025' },
    { title: 'Northline Coffee — Logo Mark', category: 'logos', label: 'Logos', image: '',
      desc: 'A minimal wordmark and icon for an independent coffee roaster, designed to work as small as a cup sleeve and as large as signage.',
      client: 'Northline Coffee', role: 'Logo Design', year: '2024' },
  ];

  let portfolioItems = defaultPortfolioItems;
  const grid = document.getElementById('portfolioGrid');

  function renderPortfolio() {
    grid.innerHTML = portfolioItems.map((item, i) => `
      <button type="button" class="portfolio-item" data-category="${item.category}" data-index="${i}" aria-label="View ${item.title}">
        ${item.image
          ? `<img class="portfolio-item__img" src="${item.image}" alt="${item.title}" loading="lazy">`
          : `<span class="portfolio-item__visual" aria-hidden="true">RGS</span>`}
        <span class="portfolio-item__overlay">
          <span class="portfolio-item__cat">${item.label}</span>
          <span class="portfolio-item__title">${item.title}</span>
        </span>
      </button>
    `).join('');
  }

  renderPortfolio(); // paint immediately with fallback data, then swap in real content

  fetch('content/portfolio.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : Promise.reject()))
    .then(data => {
      if (Array.isArray(data.items) && data.items.length) {
        portfolioItems = data.items;
        renderPortfolio();
      }
    })
    .catch(() => { /* keep fallback data — fine for offline/preview contexts */ });

  /* ==========================================================
     PORTFOLIO FILTER
     ========================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = () => Array.from(document.querySelectorAll('.portfolio-item'));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      items().forEach(item => {
        const match = filter === 'all' || item.dataset.category.includes(filter);
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ==========================================================
     LIGHTBOX
     ========================================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightboxMedia');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxFacts = document.getElementById('lightboxFacts');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;
  let lastFocused = null;

  function visibleItems() { return items().filter(i => !i.classList.contains('is-hidden')); }

  function openLightbox(index) {
    const list = visibleItems();
    if (!list.length) return;
    currentIndex = index;
    const el = list[currentIndex];
    const data = portfolioItems[parseInt(el.dataset.index, 10)];
    lightboxMedia.innerHTML = data.image
      ? `<img src="${data.image}" alt="${data.title}" loading="lazy">`
      : 'RGS';
    lightboxTitle.textContent = data.title;
    lightboxCategory.textContent = data.label;
    lightboxDesc.textContent = data.desc || '';
    const facts = {};
    if (data.client) facts.Client = data.client;
    if (data.role) facts.Role = data.role;
    if (data.year) facts.Year = data.year;
    lightboxFacts.innerHTML = Object.entries(facts)
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lastFocused = document.activeElement;
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function step(dir) {
    const list = visibleItems();
    if (!list.length) return;
    currentIndex = (currentIndex + dir + list.length) % list.length;
    openLightbox(currentIndex);
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.portfolio-item');
    if (!card) return;
    const list = visibleItems();
    openLightbox(list.indexOf(card));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => step(-1));
  lightboxNext.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowLeft') { step(-1); return; }
    if (e.key === 'ArrowRight') { step(1); return; }

    if (e.key === 'Tab') {
      const focusable = Array.from(lightbox.querySelectorAll('button')).filter(el => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  /* ==========================================================
     FAQ ACCORDION
     ========================================================== */
  document.querySelectorAll('.accordion__item').forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.accordion__item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion__panel').style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
    });
  });

  /* ==========================================================
     CONTACT FORM (front-end only — no backend wired up)
     ========================================================== */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      formStatus.textContent = 'Please fill in all required fields.';
      return;
    }
    formStatus.textContent = 'Thank you — your message has been noted. I\u2019ll reply within 24 hours.';
    form.reset();
  });

})();
