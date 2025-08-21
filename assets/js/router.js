/**
 * Router for GitHub Pages (works when router.js is under /assets/js/)
 * - Clean paths: /about-us, /openings ...
 * - 404 deep-link fallback supported (same shell)
 * - ?p=/path fallback supported
 * - #hash scroll supported
 */

/* ---- Base path detection (repo root), independent of script location ---- */
(function() {
  const scriptUrl = new URL(document.currentScript?.src || './assets/js/router.js', location.href);
  const scriptPath = scriptUrl.pathname; // e.g. /my-repo/assets/js/router.js  or /router.js

  // Derive repo base path (the path segment before "assets/js/router.js" if present)
  let base = '/';
  if (scriptPath.includes('/assets/js/')) {
    base = scriptPath.split('/assets/js/')[0] || '/'; // => "/my-repo"
  } else {
    base = scriptPath.replace(/\/[^\/]*$/, '');        // => "" or "/my-repo"
  }
  if (!base.endsWith('/')) base += '/';

  // expose
  window.__APP_BASE_PATH__ = base;
})();

/* ---- Routes ---- */
const ROUTES = {
  '/': 'home',
  '/home': 'home',
  '/about-us': 'about-us',
  '/openings': 'openings',
  '/benefits-life': 'benefits-life',
  '/career-path': 'career-path',
  '/apply': 'apply',
  '/faq': 'faq',
  '/contact': 'contact',
};

/* ---- Utils ---- */
const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const $app = () => qs('#app');

function getRelativePath() {
  const base = window.__APP_BASE_PATH__ || '/';
  const url  = new URL(location.href);
  const qp   = url.searchParams.get('p');

  let raw = qp || url.pathname;              // prefer ?p=
  if (raw.startsWith(base)) raw = raw.slice(base.length - 1); // keep leading "/"
  const clean = raw.replace(/\/+$/, '') || '/';
  return clean;
}

function highlightActiveNav() {
  const rel = getRelativePath();
  qsa('a[data-route]').forEach(a => {
    const r = a.getAttribute('data-route');
    a.classList.toggle('nav-link-active', r === rel);
  });
}

function bindLinks() {
  qsa('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    // external, mailto, tel, hash, file downloads -> pass through
    if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:|#)/i.test(href) || /\.[a-z0-9]{2,8}(\?.*)?$/i.test(href)) return;

    a.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const to = href.startsWith('/') ? href : ('/' + href.replace(/^\/+/, ''));
      navigate(to + (a.hash || ''));
    });
  });
}

async function loadPage(name) {
  const base = window.__APP_BASE_PATH__ || '/';
  const pageURL = new URL(`pages/${name}.html`, `${location.origin}${base}`).href;
  const res = await fetch(pageURL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`載入失敗：${name} (${res.status})`);
  const html = await res.text();
  $app().innerHTML = html;

  bindLinks();
  highlightActiveNav();

  if (location.hash) {
    const target = qs(location.hash, $app()) || qs(location.hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const h1 = qs('h1', $app());
  document.title = h1?.textContent?.trim()
    ? `${h1.textContent.trim()}｜群益期貨 Careers`
    : '群益期貨｜通路事業部 Careers';

  // allow page hook (for jobs.js rendering)
  window.onPageLoad && window.onPageLoad(name);
}

function route() {
  const rel  = getRelativePath();
  const page = ROUTES[rel] || 'home';
  loadPage(page).catch(() => loadPage('home'));
}

function navigate(to) {
  const base = window.__APP_BASE_PATH__ || '/';
  const abs  = new URL(to.replace(/^\//, ''), `${location.origin}${base}`).pathname + location.search + location.hash;
  history.pushState({}, '', abs);
  route();
}

window.addEventListener('popstate', route);
document.addEventListener('DOMContentLoaded', () => {
  bindLinks();
  route();
});
