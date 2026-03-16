/* ===========================
   TEST LVI – MAIN.JS
=========================== */

'use strict';

/* ---------- HAMBURGER MENU ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.setAttribute('aria-hidden', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ---------- HEADER SCROLL SHADOW ---------- */
const siteHeader = document.getElementById('site-header');

if (siteHeader) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
    } else {
      siteHeader.style.boxShadow = 'none';
    }
  }, { passive: true });
}

/* ---------- SCROLL REVEAL (scale 0.85 → 1) ---------- */
const revealEls = document.querySelectorAll('.scroll-reveal');

if (revealEls.length > 0) {
  // Stagger-viiveet peräkkäisille korteille
  const staggerGroups = [
    { selector: '.feature-grid .feature-card',       delay: 0.12 },
    { selector: '.materiaalit-grid .materiaali-card', delay: 0.12 },
    { selector: '.prosessi-step',                     delay: 0.12 },
    { selector: '.takuu-item',                        delay: 0.12 },
    { selector: '.stat-item',                         delay: 0.10 },
  ];

  staggerGroups.forEach(({ selector, delay }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.dataset.delay = (i * delay).toFixed(2);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay * 1000);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));
}

/* ---------- SVG YMPYRÄINDIKAATTORIT (stats) ---------- */
const CIRCUMFERENCE = 2 * Math.PI * 34; // r=34 → ~213.63

function animateCircle(circleEl, pct) {
  const offset = CIRCUMFERENCE - (Math.min(Math.max(pct, 0), 100) / 100) * CIRCUMFERENCE;
  circleEl.style.strokeDashoffset = offset;
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsSection = document.querySelector('.stats-section');

if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-item').forEach((item, i) => {
          const circleFill = item.querySelector('.stat-fill');
          const counterEl  = item.querySelector('.stat-number');

          if (!circleFill || !counterEl) return;

          const pct    = parseFloat(circleFill.dataset.pct  || 0);
          const target = parseInt(counterEl.dataset.target   || 0, 10);
          const delay  = i * 120; // ms stagger

          setTimeout(() => {
            animateCircle(circleFill, pct);
            animateCounter(counterEl, target, 1400);
          }, delay);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statsObserver.observe(statsSection);
}

/* ---------- HERO ROTATING WORD ---------- */
const rotatingEl = document.querySelector('.hero-rotating-word');
const words = ['kuntoon', 'toimivaksi', 'uudistettua'];
let wordIndex = 0;

if (rotatingEl) {
  // Varmista alkutila
  rotatingEl.style.transition = 'opacity 0.5s ease';
  rotatingEl.style.opacity    = '1';

  setInterval(() => {
    rotatingEl.style.opacity = '0';

    setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotatingEl.textContent = words[wordIndex];
      rotatingEl.style.opacity = '1';
    }, 500);
  }, 3000);
}

/* ---------- TARJOUSPYYNTÖLOMAKE ---------- */
const form       = document.getElementById('tarjous-form');
const successMsg = document.getElementById('form-success');
const errorMsg   = document.getElementById('form-error');

if (form && successMsg && errorMsg) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    successMsg.hidden = true;
    errorMsg.hidden   = true;

    const submitBtn   = form.querySelector('button[type="submit"]');
    const originalTxt = submitBtn ? submitBtn.textContent : '';

    if (submitBtn) {
      submitBtn.textContent = 'Lähetetään...';
      submitBtn.disabled    = true;
    }

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        successMsg.hidden = false;
        form.reset();
        // Skrollaa viestin näkyviin
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        errorMsg.hidden = false;
      }
    } catch {
      errorMsg.hidden = false;
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalTxt;
        submitBtn.disabled    = false;
      }
    }
  });
}

/* ---------- FLOATING LABEL – textarea fix ---------- */
// Varmistaa että textarea:n label käyttäytyy oikein kaikissa selaimissa
document.querySelectorAll('.form-group textarea').forEach(ta => {
  // Tarkista alkutila (esim. selain täyttänyt automaattisesti)
  if (ta.value.trim() !== '') {
    const label = ta.parentElement.querySelector('label');
    if (label) label.style.cssText = 'top:0.4rem; font-size:0.75rem; color:var(--c-accent);';
  }
});