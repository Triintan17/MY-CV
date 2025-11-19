// script.js
// Reveal on scroll with Intersection Observer
// Staggered reveals and animated skill bars

document.addEventListener('DOMContentLoaded', function () {
  // Update year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // Collect all reveal elements
  const reveals = document.querySelectorAll('.reveal');

  // Intersection Observer options
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.12
  };

  // Observer callback
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // If the target is a section container, reveal its children with stagger
        const el = entry.target;
        // Apply is-visible to element itself
        el.classList.add('is-visible');

        // If the element contains multiple reveal children, stagger them
        const children = el.querySelectorAll ? el.querySelectorAll('.reveal') : [];
        if (children && children.length > 1) {
          children.forEach((child, idx) => {
            // Add slight incremental delay
            child.style.transitionDelay = `${Math.min(0.12 * idx, 0.6)}s`;
            child.classList.add('is-visible');
          });
        }

        // Special case: if element contains skill bars, animate them
        const skillBars = el.querySelectorAll ? el.querySelectorAll('.skill-bar-inner') : [];
        if (skillBars && skillBars.length) {
          skillBars.forEach((bar, idx) => {
            const pct = parseInt(bar.getAttribute('data-percent') || '0', 10);
            // small timeout to allow transitionDelay to take effect for smoothness
            setTimeout(() => {
              bar.style.width = `${pct}%`;
            }, idx * 80);
          });
        }

        // Reveal progress on direct skill items too
        if (el.classList.contains('skill') || el.classList.contains('skills-grid')) {
          const bars = el.querySelectorAll('.skill-bar-inner');
          bars.forEach((bar, idx) => {
            const pct = parseInt(bar.getAttribute('data-percent') || '0', 10);
            setTimeout(() => bar.style.width = `${pct}%`, idx * 80);
          });
        }

        // Unobserve if you don't need to re-trigger on scroll out-in
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  // Observe each top-level revealable element but avoid observing nested reveal children separately.
  // We'll observe section-level items and key cards to allow staggered reveals.
  const topLevelRevealSelectors = [
    '#hero .reveal',
    '#about .reveal',
    '#skills .reveal',
    '#experience .reveal',
    '#portfolio .reveal',
    '#contact .reveal',
    '.hero-section .reveal',
    '.portfolio-card',
    '.timeline-item',
    '.stat',
    '.skill'
  ];

  // We'll mark the elements we will observe to avoid duplicates
  const toObserve = new Set();

  topLevelRevealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => toObserve.add(el));
  });

  // Fallback: if nothing matched, observe all .reveal
  if (!toObserve.size) {
    reveals.forEach(el => toObserve.add(el));
  }

  toObserve.forEach(el => io.observe(el));

  // Smooth scroll offset for sticky header on anchor links
  const header = document.getElementById('site-header');
  const headerHeight = header ? header.offsetHeight : 80;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Reduce motion respect: if user prefers reduced motion, skip JS-driven animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Immediately reveal all
    document.querySelectorAll('.reveal').forEach(r => {
      r.classList.add('is-visible');
      if (r.querySelectorAll) {
        r.querySelectorAll('.skill-bar-inner').forEach(bar => {
          bar.style.width = bar.getAttribute('data-percent') + '%';
        });
      }
    });
  }
});