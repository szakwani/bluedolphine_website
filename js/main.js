/**
 * Blue Dolphin Enterprise (BDE) — Main JavaScript
 * Features:
 *  - Scroll progress bar + scroll-aware navbar
 *  - Mobile hamburger menu
 *  - Scroll-reveal animations (Intersection Observer)
 *  - Animated stat counters
 *  - Contact form validation & AJAX submission (Formspree)
 *  - Back-to-top button
 *  - Dynamic footer year
 */

'use strict';

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------
   1. Navbar state + scroll progress bar
------------------------------------------------------------------ */
(function initScrollChrome() {
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const y = window.scrollY;

    if (navbar) navbar.classList.toggle('scrolled', y > 40);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? (y / max) * 100 + '%' : '0%';
    }

    if (backToTop) backToTop.hidden = y < 600;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();

/* ------------------------------------------------------------------
   2. Mobile menu
------------------------------------------------------------------ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!hamburger || !menu) return;

  function setOpen(open) {
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    menu.classList.toggle('open', open);
  }

  hamburger.addEventListener('click', () => {
    setOpen(!hamburger.classList.contains('open'));
  });

  // Close after choosing a destination
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) setOpen(false);
  });
})();

/* ------------------------------------------------------------------
   3. Scroll-reveal animations
------------------------------------------------------------------ */
(function initReveals() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ------------------------------------------------------------------
   4. Animated stat counters
------------------------------------------------------------------ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  function animate(el) {
    const target = parseInt(el.dataset.target, 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('en-US');
      return;
    }

    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

/* ------------------------------------------------------------------
   5. Contact form (Formspree AJAX)
------------------------------------------------------------------ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Native validation with visible feedback
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector('.btn-submit');
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'form-note';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        status.textContent =
          'Request received. A BDE logistics advisor will reply within 24 hours.';
        status.classList.add('success');
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      status.textContent =
        'Something went wrong sending your request. Please try again, or email info@bluedolphinent.com directly.';
      status.classList.add('error');
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });
})();

/* ------------------------------------------------------------------
   6. Footer year
------------------------------------------------------------------ */
(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();
