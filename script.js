/* ============ ZAVIRO.COM – Interaktion ============ */
(function () {
  'use strict';

  /* ---- Topbar scroll state ---- */
  const topbar = document.getElementById('topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll('.reveal, .reveal-right');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach((el) => io.observe(el));

  /* ---- Number counters ---- */
  const counters = document.querySelectorAll('.counter');
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.target || '0', 10);
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => cio.observe(el));

  /* ---- Active nav link on scroll ---- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const linkMap = new Map(
    Array.from(document.querySelectorAll('.nav-link')).map((a) => [a.getAttribute('href').slice(1), a])
  );
  const sio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        linkMap.forEach((a) => a.classList.remove('active'));
        const active = linkMap.get(e.target.id);
        if (active) active.classList.add('active');
      });
    },
    { threshold: 0.4, rootMargin: '-20% 0px -55% 0px' }
  );
  sections.forEach((s) => sio.observe(s));

  /* ---- Copy buttons (Discord-Handle, E-Mail-Adresse) ---- */
  document.querySelectorAll('[data-copy]').forEach((copyBtn) => {
    copyBtn.addEventListener('click', async () => {
      const value = copyBtn.dataset.copy || '';
      const done = () => {
        const original = copyBtn.innerHTML;
        copyBtn.textContent = '✓ Kopiert!';
        copyBtn.style.borderColor = 'var(--cyan)';
        setTimeout(() => {
          copyBtn.innerHTML = original;
          copyBtn.style.borderColor = '';
        }, 1600);
      };
      try {
        await navigator.clipboard.writeText(value);
        done();
      } catch {
        const code = copyBtn.closest('.contact-box')?.querySelector('code');
        if (!code) return;
        const range = document.createRange();
        range.selectNode(code);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        done();
      }
    });
  });

  /* ---- Particle field ---- */
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, dots;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor((w * h) / 18000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      hue: Math.random() > 0.5 ? '124,92,255' : '24,230,212'
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + d.hue + ',0.7)';
      ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j];
        const dx = d.x - o.x;
        const dy = d.y - o.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(o.x, o.y);
          ctx.strokeStyle = 'rgba(124,92,255,' + (0.14 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    resize();
    window.addEventListener('resize', resize);
    draw();
  }
})();
