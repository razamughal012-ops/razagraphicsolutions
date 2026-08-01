(() => {
  'use strict';

  /* ==========================================================
     THEME (light/dark) — applied first to avoid a flash of
     the wrong theme on load. Preference saved in localStorage.
     ========================================================== */
  const THEME_KEY = 'rgs-theme';
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || 'dark');

  document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
      });
    }
  });

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
     SITE SETTINGS (founder photo + logo) — managed via /admin CMS
     ========================================================== */
  fetch('content/settings.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : Promise.reject()))
    .then(data => {
      const frame = document.getElementById('aboutFrameInner');
      if (frame && data.founder_photo) {
        frame.innerHTML = `<img src="${data.founder_photo}" alt="Muhammad Bilal Sarwar, founder of Raza Graphic Solutions" loading="lazy">`;
      }
      if (data.logo) {
        const navMark = document.getElementById('navLogoMark');
        const loaderInitials = document.getElementById('loaderInitials');
        if (navMark) navMark.innerHTML = `<img src="${data.logo}" alt="Raza Graphic Solutions logo">`;
        if (loaderInitials) loaderInitials.outerHTML = `<img src="${data.logo}" alt="Raza Graphic Solutions logo">`;
      }
    })
    .catch(() => { /* keep initials placeholder */ });

  /* ==========================================================
     PORTFOLIO DATA + RENDER
     Content lives in /content/portfolio.json, editable via the
     admin CMS at /admin. Falls back to sensible defaults if the
     file can't be fetched (e.g. an offline preview).

     Categories are free text (typed in the CMS) — the filter
     buttons above the grid are generated automatically from
     whatever categories exist in the data, so a brand-new
     category typed in the CMS gets its own working filter
     button with no code changes needed.
     ========================================================== */
  const defaultPortfolioItems = [
    { title: 'Lumen Skincare — Brand Identity', category: 'Branding', image: '', gallery: [],
      desc: 'A full identity system for a skincare brand entering a crowded market — logo, packaging language and a colour system built to feel calm and premium.',
      client: 'Lumen Skincare', role: 'Brand Identity', year: '2025' },
    { title: 'Orchid Retail — Sale Poster', category: 'Posters', image: '', gallery: [],
      desc: 'A bold seasonal sale poster designed to work across in-store print and social, built around a single strong focal point.',
      client: 'Orchid Retail', role: 'Poster Design', year: '2025' },
    { title: 'Northline Coffee — Logo Mark', category: 'Logos', image: '', gallery: [],
      desc: 'A minimal wordmark and icon for an independent coffee roaster, designed to work as small as a cup sleeve and as large as signage.',
      client: 'Northline Coffee', role: 'Logo Design', year: '2024' },
  ];

  let portfolioItems = defaultPortfolioItems;
  const grid = document.getElementById('portfolioGrid');
  const filtersEl = document.getElementById('portfolioFilters');

  function renderPortfolio() {
    grid.innerHTML = portfolioItems.map((item, i) => `
      <button type="button" class="portfolio-item" data-category="${(item.category || '').toLowerCase()}" data-index="${i}" aria-label="View ${item.title}">
        ${item.image
          ? `<img class="portfolio-item__img" src="${item.image}" alt="${item.title}" loading="lazy">`
          : `<span class="portfolio-item__visual" aria-hidden="true">RGS</span>`}
        <span class="portfolio-item__overlay">
          <span class="portfolio-item__cat">${item.category || ''}</span>
          <span class="portfolio-item__title">${item.title}</span>
        </span>
      </button>
    `).join('');
  }

  function renderFilters() {
    const categories = [...new Set(portfolioItems.map(i => i.category).filter(Boolean))];
    filtersEl.innerHTML = `<button class="filter-btn is-active" data-filter="all" role="tab" aria-selected="true">All</button>` +
      categories.map(cat => `<button class="filter-btn" data-filter="${cat.toLowerCase()}" role="tab" aria-selected="false">${cat}</button>`).join('');
  }

  renderPortfolio(); // paint immediately with fallback data, then swap in real content
  renderFilters();

  fetch('content/portfolio.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : Promise.reject()))
    .then(data => {
      if (Array.isArray(data.items) && data.items.length) {
        portfolioItems = data.items;
        renderPortfolio();
        renderFilters();
      }
    })
    .catch(() => { /* keep fallback data — fine for offline/preview contexts */ });

  /* ==========================================================
     PORTFOLIO FILTER (event-delegated — filter buttons are
     generated dynamically, so listeners attach to the container)
     ========================================================== */
  const items = () => Array.from(document.querySelectorAll('.portfolio-item'));

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    items().forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('is-hidden', !match);
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

  function setLightboxImage(src, alt) {
    lightboxMedia.innerHTML = src ? `<img src="${src}" alt="${alt}" loading="lazy">` : 'RGS';
  }

  function openLightbox(index) {
    const list = visibleItems();
    if (!list.length) return;
    currentIndex = index;
    const el = list[currentIndex];
    const data = portfolioItems[parseInt(el.dataset.index, 10)];
    const allImages = [data.image, ...(Array.isArray(data.gallery) ? data.gallery : [])].filter(Boolean);

    setLightboxImage(allImages[0], data.title);
    lightboxTitle.textContent = data.title;
    lightboxCategory.textContent = data.category || '';
    lightboxDesc.textContent = data.desc || '';
    const facts = {};
    if (data.client) facts.Client = data.client;
    if (data.role) facts.Role = data.role;
    if (data.year) facts.Year = data.year;
    lightboxFacts.innerHTML = Object.entries(facts)
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

    // Thumbnail strip only appears when a project has more than one image
    const thumbsEl = document.getElementById('lightboxThumbs');
    if (allImages.length > 1) {
      thumbsEl.innerHTML = allImages.map((src, i) => `
        <button type="button" class="lightbox__thumb ${i === 0 ? 'is-active' : ''}" data-src="${src}" aria-label="View image ${i + 1}">
          <img src="${src}" alt="" loading="lazy">
        </button>
      `).join('');
      thumbsEl.style.display = 'flex';
    } else {
      thumbsEl.innerHTML = '';
      thumbsEl.style.display = 'none';
    }

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lastFocused = document.activeElement;
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  }

  document.getElementById('lightboxThumbs')?.addEventListener('click', (e) => {
    const thumb = e.target.closest('.lightbox__thumb');
    if (!thumb) return;
    document.querySelectorAll('.lightbox__thumb').forEach(t => t.classList.remove('is-active'));
    thumb.classList.add('is-active');
    setLightboxImage(thumb.dataset.src, lightboxTitle.textContent);
  });

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
     MASCOT ASSISTANT
     ========================================================== */
  const mascotQA = [
    { q: "What's your typical turnaround time?",
      a: "Most single deliverables (a logo, a poster, a thumbnail) take 2–4 days. Full brand identities or video projects typically take 1–3 weeks depending on scope." },
    { q: "How many revisions are included?",
      a: "Every project includes a set number of revision rounds agreed upfront in the scope, and we keep refining together until it truly fits your brand." },
    { q: "Do you work with clients outside Pakistan?",
      a: "Yes — the majority of recent clients are international. All communication, briefs and delivery happen remotely over WhatsApp, email or your preferred tool." },
    { q: "What do you need from me to get started?",
      a: "A short brief covering your goals, audience, brand references (if any) and deadline. We'll follow up with a couple of clarifying questions before starting work." },
    { q: "How do payments work?",
      a: "Typically a deposit upfront with the balance on delivery; for larger projects, split into milestones. Full details are confirmed in writing before work begins." },
  ];

  const mascotWidget = document.getElementById('mascotWidget');
  const mascotBubble = document.getElementById('mascotBubble');
  const mascotAvatar = document.getElementById('mascotAvatar');
  const mascotPanel = document.getElementById('mascotPanel');
  const mascotPanelBody = document.getElementById('mascotPanelBody');
  const mascotPanelClose = document.getElementById('mascotPanelClose');

  function renderMascotQuestions() {
    mascotPanelBody.innerHTML =
      mascotQA.map((item, i) => `<button type="button" class="mascot__q" data-qi="${i}">${item.q}</button>`).join('') +
      `<a class="mascot__whatsapp" href="https://wa.me/923088739526" target="_blank" rel="noopener">Something else? Chat on WhatsApp</a>`;
  }

  function renderMascotAnswer(i) {
    const item = mascotQA[i];
    mascotPanelBody.innerHTML = `
      <button type="button" class="mascot__back" id="mascotBack">&larr; Back to questions</button>
      <p class="mascot__answer">${item.a}</p>
      <a class="mascot__whatsapp" href="https://wa.me/923088739526" target="_blank" rel="noopener">Ask on WhatsApp instead</a>
    `;
    document.getElementById('mascotBack').addEventListener('click', renderMascotQuestions);
  }

  if (mascotWidget) {
    renderMascotQuestions();

    // Entrance: slide in shortly after the loader clears, then show the
    // welcome bubble for a few seconds before it fades on its own.
    setTimeout(() => {
      mascotWidget.classList.add('is-visible');
      setTimeout(() => mascotBubble.classList.add('is-shown'), 300);
      setTimeout(() => mascotBubble.classList.remove('is-shown'), 5500);
    }, 1600);

    mascotAvatar.addEventListener('click', () => {
      const open = mascotPanel.classList.toggle('is-open');
      mascotPanel.setAttribute('aria-hidden', String(!open));
      mascotAvatar.setAttribute('aria-expanded', String(open));
      mascotBubble.classList.remove('is-shown');
      if (open) renderMascotQuestions();
    });

    mascotPanelClose.addEventListener('click', () => {
      mascotPanel.classList.remove('is-open');
      mascotPanel.setAttribute('aria-hidden', 'true');
      mascotAvatar.setAttribute('aria-expanded', 'false');
    });

    mascotPanelBody.addEventListener('click', (e) => {
      const qBtn = e.target.closest('.mascot__q');
      if (qBtn) renderMascotAnswer(parseInt(qBtn.dataset.qi, 10));
    });

    document.addEventListener('click', (e) => {
      if (!mascotPanel.classList.contains('is-open')) return;
      if (!mascotWidget.contains(e.target)) {
        mascotPanel.classList.remove('is-open');
        mascotPanel.setAttribute('aria-hidden', 'true');
        mascotAvatar.setAttribute('aria-expanded', 'false');
      }
    });
  }

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
