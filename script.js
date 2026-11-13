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

  // Safety net: IntersectionObserver delivery can stall (throttled/restored
  // tabs, energy saver). Content must never stay hidden, so a scroll-driven
  // sweep reveals anything already in view; it retires once everything shown.
  let pending = Array.from(revealEls);
  let queued = false;
  const sweep = () => {
    queued = false;
    pending = pending.filter(el => {
      if (el.classList.contains('visible')) return false;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 40 && r.bottom > 0) {
        el.classList.add('visible');
        revealObs.unobserve(el);
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', onSweepScroll);
      window.removeEventListener('resize', onSweepScroll);
    }
  };
  const onSweepScroll = () => {
    if (!queued) { queued = true; setTimeout(sweep, 120); }
  };
  window.addEventListener('scroll', onSweepScroll, { passive: true });
  window.addEventListener('resize', onSweepScroll, { passive: true });
  setTimeout(sweep, 900);
}

// Stat count-up (skipped under reduced motion — real values are already in the markup)
if (!reducedMotion.matches && ('IntersectionObserver' in window)) {
  const animCount = (el, target, prefix, suffix, decimals, dur) => {
    const start = performance.now();
    (function step(ts) {
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const value = decimals > 0
        ? (ease * target).toFixed(decimals)
        : Math.round(ease * target);
      el.textContent = prefix + value + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  };
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const t = parseFloat(e.target.dataset.target);
        const decimals = parseInt(e.target.dataset.decimals || '0', 10);
        if (!isNaN(t)) animCount(
          e.target,
          t,
          e.target.dataset.prefix || '',
          e.target.dataset.suffix || '',
          decimals,
          1200
        );
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
window.matchMedia('(min-width: 1024px)').addEventListener('change', e => {
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

// Selected work: progressive enhancement of real anchors into accessible tabs.
// No JS = three readable articles. No autoplay or dependency on animations.
const caseSelector = document.querySelector('[data-case-selector]');
if (caseSelector) {
  const tabs = Array.from(caseSelector.querySelectorAll('a'));
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));

  const selectCase = (index, { focus = false, updateHash = false, reveal = true } = {}) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    // A panel may have been hidden when the reveal observer first ran.
    if (reveal) panels[index].querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    if (focus) tabs[index].focus();
    if (updateHash) history.replaceState(null, '', tabs[index].hash);
  };

  caseSelector.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => {
      // Preserve opening a case link in another tab with modifier keys.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectCase(index, { updateHash: true });
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectCase(next, { focus: true, updateHash: true });
    });
  });
  const caseFromHash = () => tabs.findIndex(tab => tab.hash === location.hash);
  selectCase(Math.max(0, caseFromHash()), { reveal: false });
  window.addEventListener('hashchange', () => {
    const index = caseFromHash();
    if (index !== -1) {
      selectCase(index);
      // Career-card anchors can target a panel that was hidden on click.
      // Reveal it first, then bring the selected case below the sticky header.
      panels[index].scrollIntoView();
    }
  });
}

// Glass skin: a glint follows the pointer across each pane (see glass.css).
// Purely decorative; skipped on touch devices, in the classic skin, and in the
// soft glass skin (which has no pointer light at all).
if (document.documentElement.dataset.skin === 'glass' && document.documentElement.dataset.glass !== 'soft' && window.matchMedia('(hover: hover)').matches) {
  const panes = '.card, .contact-card, .case-study-card, .hero-snapshot';
  document.addEventListener('pointermove', e => {
    const pane = e.target instanceof Element ? e.target.closest(panes) : null;
    if (!pane) return;
    const r = pane.getBoundingClientRect();
    pane.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    pane.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
}

// Glass skin: liquid-glass edge refraction. Each slab gets its own SVG
// displacement map (a rounded-rect "lens" matching its size and radius), so
// the page behind is bent inward around the perimeter while the centre stays
// flat. Only Chromium can use an SVG filter as a backdrop-filter; other
// browsers keep the CSS frost + bevel from glass.css.
(function () {
  const root = document.documentElement;
  if (root.dataset.skin !== 'glass') return;
  if (!(navigator.userAgentData || window.chrome) || !('ResizeObserver' in window)) return;
  if (!window.matchMedia('(hover: hover) and (min-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  const defs = svg.appendChild(document.createElementNS(NS, 'defs'));
  document.body.appendChild(svg);

  // Soft glass (the default) leans on the lens instead of highlights: no frost,
  // no brightness lift, and a physically shaped rim (see bezel below).
  const soft = root.dataset.glass === 'soft';
  const lens = soft
    ? { bandMax: 36, bandOfHalf: 0.46, bandOfRadius: 2.2, depth: 1.05, bright: 1 }
    : { bandMax: 24, bandOfHalf: 0.36, bandOfRadius: 1.3, depth: 0.9, bright: 1.06 };

  // Soft glass bezel: how far a ray is shifted at each point across the rim,
  // for a slab whose edge is rounded like a squircle. Height of the surface at
  // x (0 = outer edge, 1 = where the slab goes flat) is (1 - (1-x)^4)^(1/4);
  // its slope gives the surface normal, Snell's law (air 1.0 -> glass 1.5)
  // gives the bend, and the shift is the glass thickness there times the tan
  // of that bend. The result is nearly zero at the very edge, peaks just
  // inside it and eases to nothing, which is what makes the rim read as thick
  // glass instead of a soft smear. Normalised to a 0..1 lookup table.
  const bezel = new Float32Array(257);
  (function () {
    let peak = 0;
    for (let i = 0; i <= 256; i++) {
      const x = i / 256, u = 1 - x, body = 1 - u * u * u * u;
      if (body <= 0) { bezel[i] = 0; continue; }
      const height = Math.pow(body, 0.25);
      const slope = (u * u * u) / Math.pow(body, 0.75);
      const inAngle = Math.atan(slope);
      const outAngle = Math.asin(Math.sin(inAngle) / 1.5);
      bezel[i] = height * Math.tan(inAngle - outAngle);
      if (bezel[i] > peak) peak = bezel[i];
    }
    for (let i = 0; i <= 256; i++) bezel[i] /= peak;
  })();

  // [selector, frost in px once refraction is on, saturation]. Frost is kept
  // light here: a clear slab is what lets the bent edge show.
  const groups = soft ? [
    ['.card, .contact-card, .case-study-card, .senna-block', 0, 1.25],
    ['.hero-snapshot', 2.5, 1.3],
    ['#site-header > nav', 4, 1.35],
    ['#mobile-menu', 16, 1.6],
    ['.billboard-section', 0, 1.25],
    ['#top .btn-primary, #top a.pill, #top .chip, .eyebrow, footer p', 0, 1.25],
    ['.case-tab', 0, 1.25]
  ] : [
    ['.card, .contact-card, .case-study-card, .senna-block', 3, 1.8],
    ['.hero-snapshot', 8, 1.8],
    ['#site-header > nav', 8, 1.85],
    ['#mobile-menu', 16, 1.85],
    ['.billboard-section', 4, 1.8],
    ['#top .btn-primary, #top a.pill, #top .chip, .eyebrow, footer p', 2, 1.8],
    ['.case-tab', 3, 1.8]
  ];
  const slabs = '.card, .contact-card, .case-study-card, .hero-snapshot, .billboard-section, #site-header > nav';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let seq = 0;

  // Lens map: R/G hold the x/y offset (128 = none). Inside the rim band the
  // sample point is pushed toward the slab's interior, strongest at the edge.
  function lensMap(w, h, r, band, depth) {
    // Soft glass has a sharp peak just inside the edge, so it needs a finer map
    const q = soft ? Math.min(1, 720 / Math.max(w, h))
      : Math.min(1, 520 / Math.max(w, h), 0.5 * Math.max(1, 60 / Math.min(w, h)));
    const cw = Math.max(2, Math.round(w * q)), ch = Math.max(2, Math.round(h * q));
    canvas.width = cw; canvas.height = ch;
    const img = ctx.createImageData(cw, ch);
    const d = img.data, hx = w / 2, hy = h / 2;
    // Distance to the edge uses the real corner radius; the bend direction
    // uses a rounder concentric corner (at least as wide as the band), so a
    // band wider than the radius turns the corner without a crease.
    const rd = Math.min(Math.max(r, band), hx, hy);
    for (let j = 0; j < ch; j++) {
      const py = (j + 0.5) / q - hy, ay = Math.abs(py) - (hy - r), by = Math.abs(py) - (hy - rd);
      for (let i = 0; i < cw; i++) {
        const px = (i + 0.5) / q - hx, ax = Math.abs(px) - (hx - r), bx = Math.abs(px) - (hx - rd);
        let nx = 0, ny = 0, dist;
        if (ax > 0 && ay > 0) dist = r - Math.hypot(ax, ay);
        else dist = r - Math.max(ax, ay);
        if (bx > 0 && by > 0) { const len = Math.hypot(bx, by) || 1; nx = bx / len; ny = by / len; }
        else if (bx > by) nx = 1;
        else ny = 1;
        let m = 0;
        if (dist >= 0 && dist < band) {
          if (soft) m = bezel[Math.round(dist / band * 256)];
          else { const t = 1 - dist / band; m = t * t; }
        }
        const k = (j * cw + i) * 4;
        d[k]     = 128 - Math.round(127 * m * nx * Math.sign(px));
        d[k + 1] = 128 - Math.round(127 * m * ny * Math.sign(py));
        d[k + 2] = 128; d[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return { url: canvas.toDataURL(), scale: 2 * depth };
  }

  function apply(el, blur, sat) {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (w < 8 || h < 8) return;
    const half = Math.min(w, h) / 2;
    const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, half);
    let band = Math.max(8, Math.min(lens.bandMax, half * lens.bandOfHalf));
    if (r > 0) band = Math.min(band, Math.max(8, r * lens.bandOfRadius));
    const map = lensMap(w, h, r, band, band * lens.depth);

    let f = el._lens;
    if (!f) {
      f = el._lens = document.createElementNS(NS, 'filter');
      f.id = 'lens-' + (++seq);
      f.setAttribute('color-interpolation-filters', 'sRGB');
      f.setAttribute('filterUnits', 'userSpaceOnUse');
      f.setAttribute('x', '0'); f.setAttribute('y', '0');
      const im = f.appendChild(document.createElementNS(NS, 'feImage'));
      im.setAttribute('x', '0'); im.setAttribute('y', '0');
      im.setAttribute('preserveAspectRatio', 'none');
      im.setAttribute('result', 'lens');
      const dm = f.appendChild(document.createElementNS(NS, 'feDisplacementMap'));
      dm.setAttribute('in', 'SourceGraphic'); dm.setAttribute('in2', 'lens');
      dm.setAttribute('xChannelSelector', 'R'); dm.setAttribute('yChannelSelector', 'G');
      defs.appendChild(f);
    }
    const im = f.firstChild, dm = f.lastChild;
    f.setAttribute('width', w); f.setAttribute('height', h);
    im.setAttribute('width', w); im.setAttribute('height', h);
    im.setAttribute('href', map.url);
    dm.setAttribute('scale', map.scale);
    el.style.backdropFilter = 'url(#' + f.id + ')' + (blur ? ' blur(' + blur + 'px)' : '') + ' saturate(' + sat + ') brightness(' + lens.bright + ')';
  }

  const pending = new Map();
  let timer = 0;
  const flush = () => { timer = 0; pending.forEach((cfg, el) => apply(el, cfg[0], cfg[1])); pending.clear(); };
  const ro = new ResizeObserver(entries => {
    entries.forEach(e => { if (e.target._cfg) pending.set(e.target, e.target._cfg); });
    if (!timer) timer = setTimeout(flush, 60);
  });
  groups.forEach(([sel, blur, sat]) => {
    document.querySelectorAll(sel).forEach(el => {
      // Glass nested inside a slab has no page behind it to bend
      if (el.parentElement && el.parentElement.closest(slabs)) return;
      el._cfg = [blur, sat];
      ro.observe(el);
    });
  });
})();
