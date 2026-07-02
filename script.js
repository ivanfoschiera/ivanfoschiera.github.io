// foschiera.com — behavior. Loaded with defer; all motion respects
// prefers-reduced-motion (final values/states are always in the HTML).
document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Current year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach(el => revealObs.observe(el));
}

// Stat count-up (skipped under reduced motion — real values are already in the markup)
if (!reducedMotion.matches) {
  const animCount = (el, target, suffix, dur) => {
    const start = performance.now();
    (function step(ts) {
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  };
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const t = parseInt(e.target.dataset.target, 10);
        if (!isNaN(t)) animCount(e.target, t, e.target.dataset.suffix || '', 1200);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-target]').forEach(el => countObs.observe(el));
}

// Mobile menu
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const iconMenu = document.getElementById('icon-menu');
const iconClose = document.getElementById('icon-close');

function setMenu(open) {
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  iconMenu.classList.toggle('hidden', open);
  iconClose.classList.toggle('hidden', !open);
}
menuToggle.addEventListener('click', () => setMenu(mobileMenu.hidden));
mobileMenu.addEventListener('click', e => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !mobileMenu.hidden) {
    setMenu(false);
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 768px)').addEventListener('change', e => {
  if (e.matches) setMenu(false);
});

// Compact header on mobile: hide on scroll down, reveal on scroll up
const header = document.getElementById('site-header');
const mobileViewport = window.matchMedia('(max-width: 767px)');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (!mobileViewport.matches || !mobileMenu.hidden) {
    header.classList.remove('header-hidden');
    lastY = y;
    return;
  }
  if (y > lastY + 8 && y > 120) header.classList.add('header-hidden');
  else if (y < lastY - 8 || y <= 120) header.classList.remove('header-hidden');
  lastY = y;
}, { passive: true });
