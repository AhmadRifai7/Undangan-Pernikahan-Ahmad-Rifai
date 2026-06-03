/**
 * main.js — Undangan Digital v5
 * GSAP · Lenis · Three.js · Magnetic UI
 */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const WEDDING_DATE = new Date('2026-06-09T08:00:00');

// Panel generator hanya untuk Anda — buka: https://situs-anda.netlify.app/?admin
const ADMIN_QUERY = 'admin';

let lenis = null;
let cover3d = null;
let hero3d = null;
let footer3d = null;

/* ── Three.js bootstrap ── */
function initCover3D() {
  if (prefersReducedMotion || !window.initWedding3D) return;
  const el = document.getElementById('three-cover');
  if (el && !cover3d) cover3d = window.initWedding3D(el, { particleCount: window.innerWidth < 768 ? 320 : 800 });
}

function initHero3D() {
  if (prefersReducedMotion || !window.initWedding3D) return;
  const el = document.getElementById('three-hero');
  if (el && !hero3d) hero3d = window.initWedding3D(el, { particleCount: window.innerWidth < 768 ? 240 : 560 });
}

function initFooter3D() {
  if (prefersReducedMotion || !window.initWedding3D) return;
  const el = document.getElementById('three-footer');
  if (el && !footer3d) {
    footer3d = window.initWedding3D(el, {
      particleCount: window.innerWidth < 768 ? 120 : 200,
      showRings: false,
    });
  }
}

window.addEventListener('wedding3d-ready', initCover3D);
if (window.initWedding3D) initCover3D();

/* ── Lenis smooth scroll ── */
function initSmoothScroll() {
  if (prefersReducedMotion || typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── Loading ── */
window.addEventListener('load', () => {
  initCover3D();

  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) {
      ls.classList.add('fade-out');
      setTimeout(() => ls.remove(), 1000);
    }
    loadWishes();
    updateCountdown();
    if (!prefersReducedMotion) initAmbientMotion();
  }, 1400);
});

/* ── Link generator (hanya mode admin) ── */
(function initLinkGen() {
  const params = new URLSearchParams(location.search);
  const namaTamu = params.get('to') || params.get('nama');
  const isAdmin = params.has(ADMIN_QUERY);
  const cover = document.getElementById('cover');
  const linkGen = document.getElementById('linkGen');

  if (namaTamu) {
    // Tamu — link personal
    const el = document.getElementById('nama-tamu');
    if (el) el.textContent = decodeURIComponent(namaTamu);
    linkGen?.classList.add('hidden');
    cover?.classList.add('is-visible');
  } else if (isAdmin) {
    // Anda (admin) — generator link
    linkGen?.classList.remove('hidden');
    cover?.classList.remove('is-visible');
  } else {
    // URL umum tanpa ?to= — langsung undangan (tamu tidak lihat generator)
    linkGen?.classList.add('hidden');
    cover?.classList.add('is-visible');
  }
})();

function generateLink() {
  const name = document.getElementById('gen-nama').value.trim();
  const result = document.getElementById('gen-result');
  const hint = document.getElementById('gen-hint');
  if (!name) {
    result.style.display = 'none';
    hint.style.display = 'none';
    return;
  }
  const url = `${location.origin}${location.pathname}?to=${encodeURIComponent(name)}`;
  result.textContent = url;
  result.style.display = 'block';
  hint.style.display = 'block';
}

function copyGenLink() {
  const text = document.getElementById('gen-result').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => showToast('Link disalin'));
}

function shareWA() {
  const name = document.getElementById('gen-nama').value.trim();
  if (!name) {
    showToast('Masukkan nama tamu dulu');
    return;
  }
  const url = `${location.origin}${location.pathname}?to=${encodeURIComponent(name)}`;
  const msg = encodeURIComponent(
    `Wilujeng sumping 🌸\nKami mengundang ${name} di pernikahan kami.\n\n${url}`
  );
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function showBatch() {
  document.getElementById('gen-single').hidden = true;
  document.getElementById('gen-batch').hidden = false;
}

function showSingle() {
  document.getElementById('gen-batch').hidden = true;
  document.getElementById('gen-single').hidden = false;
}

function generateBatch() {
  const names = document.getElementById('batch-names').value
    .split('\n').map(n => n.trim()).filter(Boolean);
  if (!names.length) return;
  const list = document.getElementById('batch-list');
  list.innerHTML = '';
  names.forEach(name => {
    const url = `${location.origin}${location.pathname}?to=${encodeURIComponent(name)}`;
    const item = document.createElement('div');
    item.className = 'batch-item';
    item.innerHTML = `
      <span style="min-width:100px;color:var(--gold-light)">${name}</span>
      <span style="flex:1;font-size:11px;opacity:.65;word-break:break-all">${url}</span>
      <button type="button" class="batch-copy" data-url="${encodeURIComponent(url)}">Salin</button>
    `;
    item.querySelector('.batch-copy').onclick = () => {
      copyText(decodeURIComponent(item.querySelector('.batch-copy').dataset.url), 'Link');
    };
    list.appendChild(item);
  });
  list.style.display = 'block';
}

function copyAllLinks() {
  const names = document.getElementById('batch-names').value
    .split('\n').map(n => n.trim()).filter(Boolean);
  const links = names.map(n =>
    `${n}: ${location.origin}${location.pathname}?to=${encodeURIComponent(n)}`
  ).join('\n');
  navigator.clipboard.writeText(links).then(() => showToast(`${names.length} link disalin`));
}

function skipToInvitation() {
  document.getElementById('linkGen').classList.add('hidden');
  document.getElementById('cover').classList.add('is-visible');
}

/* ── Open invitation ── */
async function openInvitation() {
  const cover = document.getElementById('cover');
  const btn = cover.querySelector('.open-btn');

  if (btn) gsap.to(btn, { scale: 0.95, opacity: 0.6, duration: 0.2 });

  if (cover3d) await cover3d.fadeOut(0.7);

  gsap.to(cover, {
    opacity: 0,
    duration: 0.9,
    ease: 'power3.inOut',
    onComplete: () => {
      cover.classList.remove('is-visible');
      cover.style.display = 'none';
      cover3d?.destroy();
      cover3d = null;

      const main = document.getElementById('main');
      main.classList.add('visible');

      initHero3D();
      initFooter3D();
      initSmoothScroll();
      initAnimations();
      initMagnetic();
      initCoupleTilt();
      tryPlayMusic();
    },
  });
}

/* ── Music ── */
let musicPlaying = false;
let musicStarted = false;

function tryPlayMusic() {
  const audio = document.getElementById('bgMusic');
  if (!audio || musicStarted) return;

  const musicPlayer = document.getElementById('musicPlayer');
  if (musicPlayer) {
    musicPlayer.style.display = 'flex';
    musicPlayer.classList.add('active');
  }

  musicStarted = true;
  audio.volume = 0;
  audio.currentTime = 0;

  audio.play()
    .then(() => {
      musicPlaying = true;
      document.getElementById('musicIcon')?.classList.remove('paused');
      const fadeIn = setInterval(() => {
        if (audio.volume < 0.45) {
          audio.volume = Math.min(0.5, audio.volume + 0.02);
        } else {
          audio.volume = 0.5;
          clearInterval(fadeIn);
        }
      }, 80);
    })
    .catch(() => {
      musicStarted = false;
      document.getElementById('musicIcon')?.classList.add('paused');
    });
}
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const icon = document.getElementById('musicIcon');
  if (!audio) return;

  if (musicPlaying) {
    // Fade out lalu pause
    const fadeOut = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05);
      } else {
        audio.volume = 0;
        audio.pause();
        musicPlaying = false;
        icon?.classList.add('paused');
        clearInterval(fadeOut);
      }
    }, 50);
  } else {
    audio.volume = 0;
    audio.play()
      .then(() => {
        musicPlaying = true;
        icon?.classList.remove('paused');
        const fadeIn = setInterval(() => {
          if (audio.volume < 0.45) {
            audio.volume = Math.min(0.5, audio.volume + 0.05);
          } else {
            audio.volume = 0.5;
            clearInterval(fadeIn);
          }
        }, 50);
      })
      .catch(err => console.log('Play failed:', err));
  }
}

/* ── Cursor ── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (cursor && follower && !prefersReducedMotion) {
  document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'power2.out' });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.4, ease: 'power2.out' });
  });

  document.querySelectorAll('a, button, [data-magnetic], .gallery-item, .event-card, .gift-card, .music-player, .open-btn, .couple-img').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
}

/* ── Countdown ── */
function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];
  if (diff <= 0) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return;
  }
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val).padStart(2, '0');
  };
  set('cd-days', Math.floor(diff / 86400000));
  set('cd-hours', Math.floor((diff % 86400000) / 3600000));
  set('cd-mins', Math.floor((diff % 3600000) / 60000));
  set('cd-secs', Math.floor((diff % 60000) / 1000));
}
setInterval(updateCountdown, 1000);

/* ── Ambient CSS orbs ── */
function initAmbientMotion() {
  const orbs = document.querySelectorAll('[data-float]');
  orbs.forEach((orb, i) => {
    gsap.to(orb, {
      y: () => gsap.utils.random(-32, 32),
      x: () => gsap.utils.random(-24, 24),
      duration: 8 + i,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });
}

/* ── Couple card 3D tilt ── */
function initCoupleTilt() {
  if (prefersReducedMotion) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: x * 12,
        rotateX: -y * 12,
        transformPerspective: 800,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ── Magnetic ── */
function initMagnetic() {
  if (prefersReducedMotion) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.18, y: y * 0.18, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/* ── GSAP animations ── */
function initAnimations() {
  const bar = document.getElementById('progress-bar');
  if (bar) {
    ScrollTrigger.create({
      onUpdate: self => { bar.style.width = `${self.progress * 100}%`; },
    });
  }

  const reveal = (sel, from, to) => {
    gsap.utils.toArray(sel).forEach(el => {
      gsap.fromTo(el, from, {
        ...to,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });
  };

  reveal('.reveal', { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
  reveal('.reveal-left', { opacity: 0, x: -48 }, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' });
  reveal('.reveal-right', { opacity: 0, x: 48 }, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' });
  reveal('.reveal-scale', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' });

  /* Hero text — cinematic */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-eyebrow', { opacity: 0, letterSpacing: '0.8em', duration: 1.2 })
    .from('.hero-sunda', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
    .from('.hero-bismillah', { opacity: 0, y: 24, duration: 1 }, '-=0.5')
    .from('.hero-label', { opacity: 0, y: 20, duration: 0.9 }, '-=0.6')
    .from('.couple-signature-block--hero .couple-signature', { opacity: 0, y: 50, scale: 0.96, duration: 1.2 }, '-=0.4')
    .from('.couple-signature-block--hero .save-the-date', { opacity: 0, y: 20, duration: 0.9 }, '-=0.7')
    .from('.hero-scroll', { opacity: 0, y: 12, duration: 0.8 }, '-=0.3');

  /* Parallax decor */
  ['#heroGarland', '#heroKembangL', '#heroKembangR'].forEach((sel, i) => {
    const node = document.querySelector(sel);
    if (!node) return;
    gsap.to(node, {
      yPercent: -30 - i * 15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.8 },
    });
  });

  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title.querySelectorAll('em, span'), {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: title, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.countdown-item').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, delay: i * 0.1, ease: 'back.out(1.5)' });
      },
    });
  });

  gsap.utils.toArray('.gallery-item').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 32 }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.07,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    });
  });

  gsap.utils.toArray('.rundown-item').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, x: -24 }, {
      opacity: 1,
      x: 0,
      duration: 0.75,
      delay: i * 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.rundown-list', start: 'top 82%' },
    });
  });
}

/* ── Lightbox ── */
function openLightbox(src) {
  if (!src) return;
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  gsap.fromTo('.lightbox img', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  gsap.to('.lightbox img', {
    scale: 0.95,
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    },
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ── Utils ── */
function copyText(text, label) {
  navigator.clipboard.writeText(text).then(() => showToast(`${label} disalin`)).catch(() => {});
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}
