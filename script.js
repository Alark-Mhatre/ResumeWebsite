document.documentElement.classList.add('js');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ===== 1. Dark mode toggle (remembers the choice) ===== */
const themeToggle = $('#themeToggle');
const htmlEl = document.documentElement;

function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-checked', String(theme === 'dark'));
}

let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(saved || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

/* ===== 2. Responsive menu ===== */
const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
}
menuToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
window.addEventListener('resize', () => { if (window.innerWidth > 1100) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ===== 3. Smooth scrolling navigation ===== */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
});

/* ===== 4. Highlight the current section in the nav ===== */
const sections = $$('main section[id]');
const links = $$('.nav-links a');

function onScroll() {
  const y = window.scrollY;
  let current = sections[0].id;
  sections.forEach(sec => { if (y + 140 >= sec.offsetTop) current = sec.id; });
  if (window.innerHeight + y >= document.body.offsetHeight - 4) current = sections[sections.length - 1].id;
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== 5. Project filters + live counts ===== */
const filters = $$('.filter');
const cards = $$('.project');
const pad = n => String(n).padStart(2, '0');

filters.forEach(btn => {
  const f = btn.dataset.filter;
  const n = f === 'all' ? cards.length : cards.filter(c => c.dataset.cat === f).length;
  $('.count', btn).textContent = pad(n);
  if (n === 0) btn.hidden = true;
});

/* Give the visible cards widths that fill each row (6-column grid) */
function layoutProjects() {
  const vis = cards.filter(c => !c.classList.contains('is-hidden'));
  const n = vis.length;
  vis.forEach((c, i) => {
    c.classList.remove('span-3', 'span-6');
    if (n === 1) c.classList.add('span-6');
    else if (n === 2 || n === 4) c.classList.add('span-3');
    else if (n % 3 !== 0 && i >= n - 2) c.classList.add('span-3');   // e.g. 5 cards -> 3 + 2
  });
}

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    cards.forEach(c => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f));
    layoutProjects();
  });
});
layoutProjects();

/* ===== 5b. Glass highlight follows the cursor on the colour tiles ===== */
$$('.block, .project, .cta').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  el.addEventListener('pointerleave', () => {
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  });
});

/* ===== 6. Marquee: duplicate the track for a seamless loop ===== */
const track = $('#marqueeTrack');
if (track) track.innerHTML += track.innerHTML;

/* ===== 7. Scroll reveal ===== */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('visible'));
}

/* ===== 8. Footer year ===== */
$('#year').textContent = new Date().getFullYear();
