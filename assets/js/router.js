// ------- 路由與環境偵測 -------
const SCRIPT_URL = (() => {
  const s = document.currentScript && document.currentScript.src;
  try { return new URL(s || './router.js', window.location.href); }
  catch { return new URL('./router.js', window.location.href); }
})();
const BASE_PATH = SCRIPT_URL.pathname.replace(/\/[^\/]*$/, '/') || '/';

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

const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const $app = () => qs('#app');

function getRelativePath() {
  const url = new URL(window.location.href);
  const qp = url.searchParams.get('p');
  let rawPath = qp || url.pathname;
  if (rawPath.startsWith(BASE_PATH)) rawPath = rawPath.slice(BASE_PATH.length - 1);
  const clean = rawPath.replace(/\/+$/, '') || '/';
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
    if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:|#)/i.test(href) || /\.[a-z0-9]{2,8}(\?.*)?$/i.test(href)) {
      a.setAttribute('rel', 'noopener');
      return;
    }
    a.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const to = href.startsWith('/') ? href : ('/' + href.replace(/^\/+/, ''));
      navigate(to + (a.hash || ''));
    });
  });
}

async function loadPage(name) {
  const pageURL = new URL(`pages/${name}.html`, `${window.location.origin}${BASE_PATH}`).href;
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

  // 🔔 新增：頁面載入 hook（供 jobs.js 使用）
  window.onPageLoad && window.onPageLoad(name);
}

function route() {
  const rel = getRelativePath();
  const page = ROUTES[rel] || 'home';
  loadPage(page).catch(() => loadPage('home'));
}

function navigate(to) {
  const abs = new URL(to.replace(/^\//, ''), `${window.location.origin}${BASE_PATH}`).pathname + location.search + location.hash;
  history.pushState({}, '', abs);
  route();
}

window.addEventListener('popstate', route);
document.addEventListener('DOMContentLoaded', () => {
  bindLinks();
  route();
});
