// router.js - minimal SPA router for GitHub Pages
(function(){
  // Base path detection (user vs project pages)
  const BASE = (() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (location.hostname.endsWith('github.io') && parts.length > 0) {
      const first = parts[0];
      if (first && !first.includes('.')) return '/' + first + '/';
    }
    return '/';
  })();

  // Routes
  const ROUTES = {
  "/home": "home",
  "/highlights": "highlights",
  "/about-us": "about-us",
  "/openings": "openings",
  "/benefits-life": "benefits-life",
  "/career-path": "career-path",
  "/apply": "apply",
  "/faq": "faq",
  "/": "home"
};

  const app = document.getElementById('app');

  function stripBase(pathname){
    if (BASE !== '/' && pathname.startsWith(BASE)) return pathname.slice(BASE.length - 1) || '/';
    return pathname || '/';
  }

  function getQueryParam(name){
    const url = new URL(location.href);
    return url.searchParams.get(name);
  }

  async function load(name){
    const url = `${BASE}pages/${name}.html`;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      const html = res.ok ? await res.text() : `<section class="py-16 text-center"><h1 class="text-3xl font-black">找不到頁面</h1></section>`;
      app.innerHTML = html;
    } catch(e){
      app.innerHTML = `<section class="py-16 text-center"><h1 class="text-3xl font-black">找不到頁面</h1></section>`;
    }
    window.scrollTo({ top:0, behavior:'instant' });
    // Re-run page initializers in original script by dispatching DOMContentLoaded again
    try { document.dispatchEvent(new Event('DOMContentLoaded')); } catch(e) { /* ignore */ }
    // Feather icons refresh if present
    if (window.feather && typeof window.feather.replace === 'function') { window.feather.replace(); }
  }

  async function navigate(path, opts={}){
    const name = ROUTES[path] || ROUTES['/'];
    await load(name);
    const finalUrl = (BASE.endsWith('/') ? BASE.slice(0,-1) : BASE) + (path.startsWith('/') ? path : '/' + path);
    if (opts.replace) history.replaceState({path}, '', finalUrl);
    else history.pushState({path}, '', finalUrl);
    // Active nav (if header links use href='/xxx' or '#xxx')
    document.querySelectorAll('header nav a').forEach(a=>{
      const href = a.getAttribute('href');
      const routeHref = href && href.startsWith('#') ? '/' + href.slice(1) : href;
      if (routeHref === path) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
  }

  // Link interception (internal only)
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) || a.target === '_blank') return; // external
    if (href.startsWith('#')) {
      const id = href.slice(1);
      const path = '/' + id;
      if (path in ROUTES) { e.preventDefault(); navigate(path); }
      return;
    }
    if (!(href in ROUTES)) return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', (e)=>{
    const path = e.state?.path || stripBase(location.pathname) || '/';
    navigate(path, { replace: true });
  });

  (function bootstrap(){
    const deep = getQueryParam('p');
    const initialPath = deep || stripBase(location.pathname) || '/';
    navigate(initialPath, { replace: true });
  })();
})();
