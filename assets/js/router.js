// router.js（極簡版，只做：路由表、fetch 載入、pushState / popstate）

// 自動偵測 GitHub Pages base（使用者站 vs 專案站）
const BASE = (() => {
  const parts = location.pathname.split('/').filter(Boolean);
  if (location.hostname.endsWith('github.io') && parts.length > 0) {
    const first = parts[0];
    if (first && !first.includes('.')) return '/' + first + '/'; // 專案站
  }
  return '/'; // 使用者站
})();

// 路由表：path -> 對應子頁檔名（不加任何新頁）
const ROUTES = {
  '/home': 'home',
  '/highlights': 'highlights',
  '/about-us': 'about-us',
  '/openings': 'openings',
  '/benefits-life': 'benefits-life',
  '/career-path': 'career-path',
  '/apply': 'apply',
  '/faq': 'faq',
  '/': 'home'
};

const app = document.getElementById('app');

// 讀取 ?p=（404 轉址會用到）
function getQueryParam(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

// 去除 BASE（還原邏輯路徑）
function stripBase(pathname){
  if (BASE !== '/' && pathname.startsWith(BASE)) return pathname.slice(BASE.length - 1) || '/';
  return pathname || '/';
}

// 載入子頁
async function load(name){
  const url = `${BASE}pages/${name}.html`;
  const res = await fetch(url, { cache: 'no-cache' });
  app.innerHTML = res.ok ? await res.text() : `<section class="py-16 text-center">
    <h1 class="text-3xl md:text-4xl font-black text-primary mb-4">找不到頁面</h1>
    <p class="opacity-80"><a href="/home" data-link>回首頁</a></p>
  </section>`;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// 導航
async function navigate(path, {replace=false} = {}){
  const name = ROUTES[path] || ROUTES['/'];
  await load(name);
  const finalUrl = (BASE.endsWith('/') ? BASE.slice(0,-1) : BASE) + (path.startsWith('/') ? path : '/' + path);
  if (replace) history.replaceState({path}, '', finalUrl);
  else history.pushState({path}, '', finalUrl);
  // 標記 active（如果你的 header 連結 href 也改成這些路徑）
  document.querySelectorAll('header nav a').forEach(a=>{
    if (a.getAttribute('href') === path) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}

// 連結攔截（站內路徑才攔、外連/錨點不攔）
document.addEventListener('click', (e)=>{
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^https?:\/\//i.test(href) || a.target === '_blank') return; // 外連放行
  if (href.startsWith('#')) return; // hash 放行（不改）
  if (!(href in ROUTES)) return; // 非定義路由放行
  e.preventDefault();
  navigate(href);
});

// popstate
window.addEventListener('popstate', (e)=>{
  const path = e.state?.path || stripBase(location.pathname) || '/';
  navigate(path, {replace:true});
});

// 初次啟動（支援 404.html 轉來的 ?p=）
(function bootstrap(){
  const deep = getQueryParam('p');
  const initialPath = deep || stripBase(location.pathname) || '/';
  navigate(initialPath, {replace:true});
})();
