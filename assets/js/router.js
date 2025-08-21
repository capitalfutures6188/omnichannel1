/**
 * 超薄前端路由（支援 GitHub Pages）
 * - 乾淨路徑：/about-us、/openings ...
 * - 404 深連結回轉：同用 App Shell；直接交給本路由處理
 * - ?p=/path 後備：若你想用 query 方式導入也可
 * - #hash 支援：載入後捲動到對應錨點
 */

//// ── 環境偵測：以 router.js 所在路徑作為 Base Path（相容使用者頁與專案頁） ──
const SCRIPT_URL = (() => {
  // 優先 currentScript，退而求其次用 <script src> 推導
  const s = document.currentScript && document.currentScript.src;
  try { return new URL(s || './router.js', window.location.href); }
  catch { return new URL('./router.js', window.location.href); }
})();
const BASE_PATH = SCRIPT_URL.pathname.replace(/\/[^\/]*$/, '/') || '/'; // e.g. "/repo/" 或 "/"

/** Route 對應的 page 名稱（/pages/${name}.html） */
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

//// ── 小工具 ──
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const $app = () => qs('#app');

/** 取得相對於 BASE_PATH 的 SPA 路徑 */
function getRelativePath() {
  const url = new URL(window.location.href);
  const qp = url.searchParams.get('p');
  // 1) 優先 ?p= 參數（可用於 404 回轉）
  let rawPath = qp || url.pathname;
  // 2) 去掉 BASE_PATH 前綴，保留開頭斜線
  if (rawPath.startsWith(BASE_PATH)) rawPath = rawPath.slice(BASE_PATH.length - 1);
  // 清尾斜線
  const clean = rawPath.replace(/\/+$/, '') || '/';
  return clean;
}

/** 高亮當前導覽 */
function highlightActiveNav() {
  const rel = getRelativePath();
  qsa('a[data-route]').forEach(a => {
    const r = a.getAttribute('data-route');
    a.classList.toggle('nav-link-active', r === rel);
  });
}

/** 綁定內部連結（含 data-link，也自動攔截站內 /path） */
function bindLinks() {
  qsa('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    // 1) 外部連結、mailto、tel、下載檔案：放行
    if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:|#)/i.test(href) || /\.[a-z0-9]{2,8}(\?.*)?$/i.test(href)) {
      a.setAttribute('rel', 'noopener');
      return;
    }
    // 2) 攔截站內相對或絕對路由
    a.addEventListener('click', e => {
      // 僅攔截左鍵且無特殊鍵
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const to = href.startsWith('/') ? href : ('/' + href.replace(/^\/+/, ''));
      navigate(to + (a.hash || '')); // 保留 hash
    });
  });
}

/** 載入 /pages/${name}.html */
async function loadPage(name) {
  const pageURL = new URL(`pages/${name}.html`, `${window.location.origin}${BASE_PATH}`).href;
  const res = await fetch(pageURL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`載入失敗：${name} (${res.status})`);
  const html = await res.text();
  $app().innerHTML = html;

  // 綁定事件與高亮
  bindLinks();
  highlightActiveNav();

  // 若有 #hash，嘗試捲動
  if (location.hash) {
    const target = qs(location.hash, $app()) || qs(location.hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // 以分頁 <h1> 動態設定標題（若存在）
  const h1 = qs('h1', $app());
  if (h1 && h1.textContent) {
    document.title = `${h1.textContent.trim()}｜群益期貨 Careers`;
  } else {
    document.title = '群益期貨｜通路事業部 Careers';
  }
}

/** 解析目前路徑並載頁 */
function route() {
  const rel = getRelativePath();
  const page = ROUTES[rel] || 'home';
  loadPage(page).catch(() => loadPage('home'));
}

/** 內部導頁（pushState） */
function navigate(to) {
  const abs = new URL(to.replace(/^\//, ''), `${window.location.origin}${BASE_PATH}`).pathname + location.search + location.hash;
  history.pushState({}, '', abs);
  route();
}

// 事件：返回鍵、初始載入
window.addEventListener('popstate', route);
document.addEventListener('DOMContentLoaded', () => {
  bindLinks();
  route();
});
