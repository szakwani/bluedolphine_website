/**
 * Blue Dolphin Enterprise (BDE) — Main JavaScript
 * Features:
 *  - Sticky / scroll-aware navbar
 *  - Mobile hamburger menu
 *  - Smooth-scroll active-link highlighting
 *  - Scroll-reveal animations (Intersection Observer)
 *  - Animated stat counters
 *  - Contact form validation & submission feedback
 *  - Back-to-top button
 *  - Dynamic footer year
 */

'use strict';

/* ------------------------------------------------------------------
   Utility: debounce
------------------------------------------------------------------ */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}


/* ------------------------------------------------------------------
   1. Sticky Navbar
------------------------------------------------------------------ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ------------------------------------------------------------------
   2. Mobile Menu Toggle
------------------------------------------------------------------ */
(function initMobileMenu() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  }

  hamburger.addEventListener('click', function () {
    const isOpen = !mobileMenu.hidden;
    if (isOpen) {
      closeMenu();
    } else {
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.hidden = false;
    }
  });

  // Close menu when any link is clicked
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (navbar && !navbar.contains(e.target)) closeMenu();
  });
})();


/* ------------------------------------------------------------------
   3. Scroll-Reveal Animations (Intersection Observer)
------------------------------------------------------------------ */
(function initScrollReveal() {
  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Make all reveal elements immediately visible
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(function (el) {
      el.classList.add('in-view');
    });
    return;
  }

  const options = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, options);

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(function (el) {
    observer.observe(el);
  });
})();


/* ------------------------------------------------------------------
   4. Animated Stat Counters
------------------------------------------------------------------ */
(function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString();
      return;
    }

    const duration = 1800; // ms
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ------------------------------------------------------------------
   5. Active Nav Link on Scroll
------------------------------------------------------------------ */
(function initActiveLinks() {
  const sections  = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  function setActive() {
    let current = '';
    const scrollY = window.scrollY + 120;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.removeAttribute('aria-current');
      if (link.getAttribute('href') === '#' + current) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  window.addEventListener('scroll', debounce(setActive, 50), { passive: true });
  setActive();
})();


/* ------------------------------------------------------------------
   6. Contact Form Validation & Submission Feedback
------------------------------------------------------------------ */
(function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic client-side validation
    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const service = form.querySelector('#service');
    const message = form.querySelector('#message');

    clearErrors(form);

    let valid = true;

    if (!name.value.trim()) {
      showFieldError(name, 'Please enter your full name.');
      valid = false;
    }

    if (!isValidEmail(email.value)) {
      showFieldError(email, 'Please enter a valid email address.');
      valid = false;
    }

    if (!service.value) {
      showFieldError(service, 'Please select a service.');
      valid = false;
    }

    if (!message.value.trim() || message.value.trim().length < 20) {
      showFieldError(message, 'Please provide shipment details (at least 20 characters).');
      valid = false;
    }

    if (!valid) {
      status.textContent = 'Please fix the errors above and try again.';
      status.className = 'form-note error';
      return;
    }

    // Simulate form submission
    // UPDATE: Replace this simulation with a real fetch() POST to your backend/form service
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    status.textContent = '';
    status.className = 'form-note';

    // Simulated async delay — replace with actual fetch() call
    setTimeout(function () {
      status.textContent = '✓ Thank you! Your request has been received. We\'ll be in touch within 24 hours.';
      status.className = 'form-note success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send My Request';
    }, 1200);
  });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    const errId = field.id + '-error';
    const err = document.createElement('span');
    err.id = errId;
    err.setAttribute('role', 'alert');
    err.style.cssText = 'color:#e74c3c;font-size:0.8rem;margin-top:0.2rem;display:block;';
    err.textContent = message;
    field.setAttribute('aria-describedby', errId);
    field.parentNode.appendChild(err);
  }

  function clearErrors(frm) {
    frm.querySelectorAll('[role="alert"]').forEach(function (el) { el.remove(); });
    frm.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.style.borderColor = '';
      el.removeAttribute('aria-describedby');
    });
  }
})();


/* ------------------------------------------------------------------
   7. Back-to-Top Button
------------------------------------------------------------------ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleVisibility() {
    btn.hidden = window.scrollY < 400;
  }

  window.addEventListener('scroll', debounce(toggleVisibility, 50), { passive: true });
  toggleVisibility();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ------------------------------------------------------------------
   8. Dynamic Footer Year
------------------------------------------------------------------ */
(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ------------------------------------------------------------------
   9. Smooth anchor navigation offset compensation
      (accounts for fixed navbar height)
------------------------------------------------------------------ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')
        ? document.getElementById('navbar').offsetHeight
        : 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
