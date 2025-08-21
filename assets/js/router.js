/* ---------- SPA Router (GitHub Pages base-safe) ---------- */

// 自動偵測 Base Path（使用者站 "/"；專案站 "/<repo>/"）
const BASE = (() => {
  // 若 <base href> 存在則優先
  const baseEl = document.querySelector('base[href]');
  if (baseEl) {
    const u = new URL(baseEl.getAttribute('href'), location.origin);
    return u.pathname.endsWith('/') ? u.pathname : u.pathname + '/';
  }
  // 由 router.js 的實際路徑推回 repo 名：/REPO/assets/js/router.js
  const s = document.querySelector('script[src$="router.js"]');
  if (s) {
    try {
      const abs = new URL(s.getAttribute('src'), location.href).pathname;
      const m = abs.match(/^\/([^/]+)\/assets\/js\/router\.js$/);
      if (m) return `/${m[1]}/`;
    } catch {}
  }
  // 一般 github.io 專案站
  const parts = location.pathname.split('/').filter(Boolean);
  if (location.hostname.endsWith('github.io') && parts.length > 0 && !parts[0].includes('.')) {
    return `/${parts[0]}/`;
  }
  return '/';
})();

const ROUTES = {
  '/': 'home',
  '/home': 'home',
  '/highlights': 'highlights',
  '/about-us': 'about-us',
  '/openings': 'openings',
  '/benefits-life': 'benefits-life',
  '/career-path': 'career-path',
  '/apply': 'apply',
  '/faq': 'faq',
};

const app = document.getElementById('app');
const join = (base, path) => (base.endsWith('/') ? base.slice(0, -1) : base) + path; // path 需以 / 開頭
const stripBase = (pathname) => (BASE !== '/' && pathname.startsWith(BASE) ? pathname.slice(BASE.length - 1) || '/' : pathname || '/');

// 載入子頁（一定加上 BASE）
async function load(name, { replace = false } = {}) {
  try {
    const res = await fetch(join(BASE, `/pages/${name}.html`), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    app.innerHTML = await res.text();
  } catch (err) {
    console.error('[router] load error:', err);
    app.innerHTML = `
      <section class="py-16 text-center">
        <h1 class="text-3xl md:text-4xl font-black text-primary mb-4">找不到頁面</h1>
        <p class="opacity-80"><a href="/home">回首頁</a></p>
      </section>`;
  }

  initPageFeatures(name);
  window.scrollTo({ top: 0, behavior: 'auto' });

  // 標記導覽 active（你的 header 仍是 #anchor 也可）
  document.querySelectorAll('header a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const onThis = href === `/${name}` || (name === 'home' && (href === '/' || href === '#home'));
    if (onThis) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });

  // pushState：網址也要帶 BASE
  const finalPath = name === 'home' ? '/' : `/${name}`;
  const url = join(BASE, finalPath);
  if (replace) history.replaceState({ name }, '', url);
  else history.pushState({ name }, '', url);
}

function navigate(path, opts = {}) { return load(ROUTES[path] || 'home', opts); }

// 站內連結攔截（含 #about-us → /about-us）
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^(https?:|mailto:|tel:)/i.test(href)) return; // 外部放行
  if (href.startsWith('#')) {
    const seg = href.slice(1);
    if (seg && ROUTES['/' + seg]) { e.preventDefault(); navigate('/' + seg); }
    return;
  }
  if (ROUTES[href]) { e.preventDefault(); navigate(href); }
});

// 返回/前進
window.addEventListener('popstate', () => {
  const path = stripBase(location.pathname) || '/';
  const name = ROUTES[path] ? ROUTES[path] : 'home';
  load(name, { replace: true });
});

// 首次啟動（支援 404.html 回轉的 ?p=）
(function bootstrap() {
  const p = new URLSearchParams(location.search).get('p');
  const initialPath = p ? (p.replace(BASE, '/') || '/') : (stripBase(location.pathname) || '/');
  const name = ROUTES[initialPath] ? ROUTES[initialPath] : 'home';
  load(name, { replace: true });
})();

/* 下面保留你的頁面初始化（jobs / benefits / faq …）——原樣即可 */
function initPageFeatures(name){ /* 略（沿用你現有的） */ }

