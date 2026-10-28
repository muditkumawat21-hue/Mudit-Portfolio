/* ============================================================
   MUDIT KUMAWAT — ORIGIN ARC
   script.js — Interactions & animations
   ============================================================ */

'use strict';

/* ── Utility: throttle ── */
function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/* ── Footer year ── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   NAVIGATION — scroll spy + mobile toggle
   ============================================================ */
const mainNav     = document.getElementById('main-nav');
const navToggle   = document.getElementById('nav-toggle');
const navLinks    = document.getElementById('nav-links');
const allNavLinks = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('section[id]');

/* Scroll state */
function onScroll() {
  const scrollY = window.scrollY;

  /* Scrolled class for nav border */
  mainNav.classList.toggle('scrolled', scrollY > 60);

  /* Active section detection */
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - (mainNav.offsetHeight + 80);
    if (scrollY >= top) current = sec.id;
  });

  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });
onScroll(); // run once on load

/* Mobile hamburger */
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open', !expanded);
});

/* Close mobile menu on link click */
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  });
});

/* Close mobile menu on outside click */
document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target)) {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  }
});

/* ============================================================
   SMOOTH SCROLL — handle anchor clicks
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - mainNav.offsetHeight;
    window.scrollTo({ top, behavior: 'smooth' });

    /* Move focus to section for accessibility */
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

/* ============================================================
   INTERSECTION OBSERVER — reveal on scroll
   ============================================================ */
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  /* Make everything immediately visible */
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); /* fire once */
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ============================================================
   PROJECT CARDS — keyboard & pointer enhancements
   ============================================================ */
document.querySelectorAll('.project-card').forEach(card => {
  /* Make the whole card navigate to its link on Enter/Space */
  const link = card.querySelector('.card-link:not(.disabled)');
  if (!link) return;

  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'link');

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      link.click();
    }
  });

  /* Click anywhere on card goes to link */
  card.addEventListener('click', (e) => {
    if (!e.target.closest('a')) link.click();
  });
  card.style.cursor = 'pointer';
});

/* ============================================================
   HERO PARALLAX — subtle ink fleck movement on pointer
   (desktop only, lightweight)
   ============================================================ */
if (!prefersReducedMotion && window.innerWidth > 900) {
  const heroSection = document.querySelector('.hero-section');
  const inkFlecks   = document.querySelector('.ink-flecks');

  if (heroSection && inkFlecks) {
    heroSection.addEventListener('mousemove', throttle((e) => {
      const rect   = heroSection.getBoundingClientRect();
      const cx     = (e.clientX - rect.left) / rect.width  - 0.5; /* -0.5 to 0.5 */
      const cy     = (e.clientY - rect.top)  / rect.height - 0.5;

      inkFlecks.style.transform = `translate(${cx * 18}px, ${cy * 12}px)`;
    }, 30), { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      inkFlecks.style.transform = '';
    });
  }
}

/* ============================================================
   ARTWORK PANEL — subtle tilt on hover
   ============================================================ */
if (!prefersReducedMotion) {
  const artworkPanel = document.querySelector('.artwork-panel');

  if (artworkPanel) {
    artworkPanel.addEventListener('mousemove', throttle((e) => {
      const rect = artworkPanel.getBoundingClientRect();
      const cx   = (e.clientX - rect.left)  / rect.width  - 0.5;
      const cy   = (e.clientY - rect.top)   / rect.height - 0.5;

      artworkPanel.style.transform =
        `translate(-4px, -4px) rotateY(${cx * 6}deg) rotateX(${-cy * 4}deg)`;
    }, 30), { passive: true });

    artworkPanel.addEventListener('mouseleave', () => {
      artworkPanel.style.transform = '';
    });
  }
}

/* ============================================================
   PROJECT CARDS — 3-D micro-tilt on hover (cursor follows)
   ============================================================ */
if (!prefersReducedMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    /* Skip the “add” placeholder card */
    if (card.classList.contains('project-card--add')) return;

    card.addEventListener('mousemove', throttle((e) => {
      const rect = card.getBoundingClientRect();
      const cx   = (e.clientX - rect.left)  / rect.width  - 0.5; /* -0.5 – 0.5 */
      const cy   = (e.clientY - rect.top)   / rect.height - 0.5;

      /* Gentle tilt: max ~4° horizontal, 3° vertical */
      card.style.transform =
        `translate(-3px, -3px) rotateY(${cx * 4}deg) rotateX(${-cy * 3}deg)`;
      card.style.boxShadow =
        `${4 + cx * 4}px ${4 + cy * 4}px 0 var(--crimson-dk)`;
      card.style.borderColor = 'var(--crimson)';
    }, 20), { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.boxShadow  = '';
      card.style.borderColor = '';
    });

    /* Touch: just apply active state on touchstart, remove on end */
    card.addEventListener('touchstart', () => {
      card.style.borderColor = 'var(--crimson)';
    }, { passive: true });
    card.addEventListener('touchend', () => {
      card.style.borderColor = '';
    }, { passive: true });
  });
}

/* ============================================================
   BUTTON RIPPLE — ink splash on click
   ============================================================ */
if (!prefersReducedMotion) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px; top: ${y}px;
        width: 0; height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 0;
        animation: ripple-out 0.55s ease-out forwards;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* Inject ripple keyframe once */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-out {
      to { width: 200px; height: 200px; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   NAV — active-link underline reflow prevention
   ============================================================ */
/* Prevent jump on page load by running spy after fonts settle */
document.fonts.ready.then(() => {
  onScroll();
});

/* ============================================================
   ANIME-OPENING CANVAS — ink streams + energy orbs
   ============================================================ */
if (!prefersReducedMotion) {

  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas ? canvas.getContext('2d') : null;

  if (canvas && ctx) {

    /* ── Sizing ── */
    let W = 0, H = 0;

    function resizeCanvas() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    resizeCanvas();

    /* Debounced resize */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 120);
    }, { passive: true });

    /* ── Particle definitions ── */

    /* INK STREAMS — long, thin vertical brushstrokes drifting down */
    const INK_COUNT   = window.innerWidth < 600 ? 6 : 14;
    const inkStreams   = [];

    function spawnInkStream(forceLeft) {
      const x = forceLeft != null ? forceLeft : Math.random() * W;
      return {
        x,
        y:       -120 - Math.random() * H,           /* start above viewport */
        len:     60  + Math.random() * 110,           /* stroke length px */
        width:   0.4 + Math.random() * 1.0,           /* stroke width */
        speed:   0.15 + Math.random() * 0.35,         /* px per frame */
        opacity: 0.04 + Math.random() * 0.10,         /* very faint */
        drift:   (Math.random() - 0.5) * 0.12,        /* horizontal drift */
        hue:     Math.random() < 0.25 ? 'crimson' : 'paper', /* colour */
      };
    }

    for (let i = 0; i < INK_COUNT; i++) {
      const s = spawnInkStream();
      s.y = Math.random() * H; /* scatter initial y positions */
      inkStreams.push(s);
    }

    /* ENERGY ORBS — soft glowing crimson circles */
    const ORB_COUNT = window.innerWidth < 600 ? 3 : 6;
    const orbs      = [];

    function spawnOrb() {
      return {
        x:       Math.random() * W,
        y:       Math.random() * H,
        r:       8 + Math.random() * 28,
        opacity: 0,
        maxOp:   0.035 + Math.random() * 0.055,
        phase:   Math.random() * Math.PI * 2,          /* breathing offset */
        speed:   0.004 + Math.random() * 0.006,        /* breathing speed */
        driftX:  (Math.random() - 0.5) * 0.08,
        driftY: -(0.04 + Math.random() * 0.08),        /* float upward */
      };
    }

    for (let i = 0; i < ORB_COUNT; i++) orbs.push(spawnOrb());

    /* ── Draw loop ── */
    let frame = 0;
    let rafId;

    function drawFrame() {
      rafId = requestAnimationFrame(drawFrame);
      ctx.clearRect(0, 0, W, H);

      frame++;

      /* — Ink streams — */
      for (const s of inkStreams) {
        /* Move */
        s.y     += s.speed;
        s.x     += s.drift;

        /* Respawn when below screen */
        if (s.y - s.len > H) {
          Object.assign(s, spawnInkStream());
        }

        /* Draw — a thin vertical line with tapered opacity */
        const grad = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y);

        if (s.hue === 'crimson') {
          grad.addColorStop(0,   `rgba(192, 57, 43, 0)`);
          grad.addColorStop(0.4, `rgba(192, 57, 43, ${s.opacity})`);
          grad.addColorStop(1,   `rgba(192, 57, 43, 0)`);
        } else {
          grad.addColorStop(0,   `rgba(245, 240, 232, 0)`);
          grad.addColorStop(0.4, `rgba(245, 240, 232, ${s.opacity})`);
          grad.addColorStop(1,   `rgba(245, 240, 232, 0)`);
        }

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = s.width;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.len);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.restore();
      }

      /* — Energy orbs — */
      for (const o of orbs) {
        /* Breathe opacity */
        o.phase  += o.speed;
        o.opacity = o.maxOp * (0.4 + 0.6 * Math.sin(o.phase));

        /* Drift */
        o.x += o.driftX;
        o.y += o.driftY;

        /* Wrap — respawn at bottom when they float above screen */
        if (o.y + o.r < 0) {
          Object.assign(o, spawnOrb());
          o.y = H + o.r;
        }
        if (o.x < -o.r || o.x > W + o.r) {
          Object.assign(o, spawnOrb());
        }

        /* Draw — radial glow */
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grad.addColorStop(0,   `rgba(192, 57, 43, ${o.opacity})`);
        grad.addColorStop(0.5, `rgba(146, 43, 33, ${o.opacity * 0.4})`);
        grad.addColorStop(1,   `rgba(192, 57, 43, 0)`);

        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawFrame();

    /* Stop canvas when tab is hidden to save battery */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        drawFrame();
      }
    });
  }
}

/* ============================================================
   SCROLL PARALLAX — speed-lines depth shift + hero fade
   ============================================================ */
if (!prefersReducedMotion) {
  const speedLines  = document.querySelector('.hero-section .speed-lines');
  const heroSection = document.getElementById('hero');

  if (speedLines && heroSection) {
    function updateSpeedParallax() {
      const scrollY   = window.scrollY;
      const heroH     = heroSection.offsetHeight;
      const progress  = Math.min(scrollY / heroH, 1); /* 0 at top, 1 at bottom of hero */

      /* Shift speed lines upward as we scroll down = depth parallax */
      const shift = progress * 40;
      speedLines.style.transform = `translateY(-${shift}px)`;

      /* Gradually fade speed lines as content scrolls away */
      speedLines.classList.toggle('hero-scrolled', progress > 0.4);
    }

    window.addEventListener('scroll', throttle(updateSpeedParallax, 16), { passive: true });
    updateSpeedParallax();
  }
}

