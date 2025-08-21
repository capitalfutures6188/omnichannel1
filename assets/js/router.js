
// ====== 基本路由表 ======
const ROUTES = {
  "": "home",
  "home": "home",
  "about": "about",
  "open-account": "open-account",
  "tutorial": "tutorial",
  "platform": "platform",
  "domestic-info": "domestic-info",
  "foreign-info": "foreign-info",
  "faq": "faq",
};

// ====== GitHub Pages base（/ 或 /repo/） ======
function getBase() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (location.hostname.endsWith(".github.io") && parts.length) return "/" + parts[0] + "/";
  return "/";
}
const BASE = getBase();
const joinBase = p => BASE === "/" ? p : (BASE.replace(/\/$/,"") + (p.startsWith("/")? p : "/"+p));

// ====== DOM 快捷 ======
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const app = $("#app");

// ====== 手機選單（點外面自動收合） ======
const btn = $('#mobile-menu-button');
const mm  = $('#mobile-menu');
btn?.addEventListener('click', (e)=>{ e.stopPropagation(); mm.classList.toggle('hidden'); });
document.addEventListener('click', (e)=>{
  if(!mm) return;
  if(!mm.classList.contains('hidden')){
    const inside = mm.contains(e.target) || btn.contains(e.target);
    if(!inside) mm.classList.add('hidden');
  }
});

// ====== 服務資料（About 的六大服務 + Modal） ======
const SERVICES = [
  { title:'市場關注商品推播', icon:'bell',        desc:'即時推播重要商品資訊，不錯過任何交易機會。' },
  { title:'總經專家每日解析', icon:'bar-chart-2', desc:'每日宏觀經濟分析，掌握市場大局。' },
  { title:'線上專人交易諮詢', icon:'message-square', desc:'隨時提供線上專人諮詢，解答交易疑問。' },
  { title:'全球商品交易策略', icon:'globe',      desc:'提供全球主要商品交易策略建議。' },
  { title:'客製化交易規劃',   icon:'edit',       desc:'依您的需求與風險承受度打造專屬計畫。' },
  { title:'每週專業投資講座', icon:'youtube',    desc:'定期直播講座，由資深分析師分享觀點。' },
];

// ====== 按需載入頁面（含快取） ======
const cache = new Map();
function pageFile(name){ return joinBase(`pages/${name}.html`); }

async function loadRoute(name, {replace=false, scroll="smooth"} = {}) {
  const file = pageFile(name);
  const html = cache.has(file) ? cache.get(file) : await fetch(file).then(r=>r.text());
  cache.set(file, html);
  app.innerHTML = html;

  // 導覽 active 樣式
  $$('.header-nav [data-route]').forEach(a=>a.removeAttribute('aria-current'));
  $$('.header-nav [data-route="'+name+'"]').forEach(a=>a.setAttribute('aria-current','page'));

  // 乾淨 URL
  const path = name==="home" ? "/" : `/${name}`;
  const url = joinBase(path) + (location.hash || "");
  if (replace) history.replaceState({name}, "", url);
  else history.pushState({name}, "", url);

  // 初始化該頁需要的互動
  initPageFeatures(name);

  // 捲動到頂
  if (scroll) window.scrollTo({ top: 0, behavior: scroll });

  // Feather icons
  if (window.feather) feather.replace();
}

// ====== 解析目前 path -> 路由名 ======
function parsePath(){
  const seg = location.pathname.replace(BASE,"/").replace(/^\/|\/$/g,"") || "";
  return ROUTES[seg] ? ROUTES[seg] : "home";
}

// ====== 404.html 回轉（?p=/about） ======
(function from404(){
  const p = new URLSearchParams(location.search).get("p");
  if (p) {
    const seg = (p.replace(BASE,"/").replace(/^\/|\/$/g,"") || "");
    const name = ROUTES[seg] ? seg : "home";
    history.replaceState({name}, "", joinBase(name==="home" ? "/" : "/"+name));
  }
})();

// ====== 站內導覽攔截（/xxx、data-route） ======
document.addEventListener("click", e=>{
  const a = e.target.closest("a");
  if(!a) return;

  // 外部連結直接放過
  const href = a.getAttribute("href") || "";
  if (/^(https?:|mailto:|tel:)/i.test(href)) return;

  // data-route 或 /xxx 走 SPA
  if (a.dataset.route || href.startsWith("/")) {
    e.preventDefault();
    const url = a.dataset.route ? new URL((joinBase("/")+a.dataset.route), location.origin) : new URL(a.href);
    const seg = (a.dataset.route || url.pathname.replace(BASE,"/").replace(/^\/|\/$/g,"") || "");
    const name = ROUTES[seg] ? seg : "home";
    loadRoute(name);
    // 手機選單點完收合
    if(!mm?.classList.contains('hidden')) mm.classList.add('hidden');
  }
});

// ====== 返回 / 前進 ======
window.addEventListener("popstate", ()=>{
  const name = parsePath();
  loadRoute(name, {replace:true});
});

// ====== 頁面級初始化（tabs、services grid、modal） ======
function initPageFeatures(name){
  // About：六大服務網格 + 點擊開 modal
  if (name === 'about') {
    const grid = document.getElementById('services-grid');
    if (grid) {
      grid.innerHTML = SERVICES.map((s,i)=>`
        <button class="card p-6 text-left w-full" data-service="${i}">
          <i data-feather="${s.icon}" class="h-10 w-10 mb-3 text-brand"></i>
          <h3 class="text-lg font-semibold">${s.title}</h3>
          <p class="text-sm text-slate-600 mt-2">${s.desc}</p>
        </button>
      `).join('');
      if (window.feather) feather.replace();
      grid.addEventListener('click',(e)=>{
        const btn = e.target.closest('[data-service]');
        if(!btn) return;
        openServiceModal(SERVICES[+btn.dataset.service]);
      });
    }
  }

  // 開戶 Tabs
  if (name === 'open-account') {
    const tabs = document.getElementById('tabs');
    if (tabs) {
      const buttons = Array.from(tabs.querySelectorAll('.tab-button'));
      const panels  = Array.from(document.querySelectorAll('#tab-panels .tab-content'));
      buttons.forEach(b=>b.addEventListener('click', ()=>{
        buttons.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        const key = b.dataset.tab;
        panels.forEach(p=>p.classList.toggle('active', p.id === 'tab-'+key));
      }));
    }
  }

  // hash 捲動（例如 /about#team）
  const hash = location.hash.replace(/^#/,'');
  if (hash) {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }
}

// ====== Services Modal ======
const modal = document.getElementById('services-modal');
const modalBody = document.getElementById('services-modal-body');
const modalClose = document.getElementById('services-close');
function openServiceModal(s){
  if(!modal) return;
  modalBody.innerHTML = `
    <h3 class="text-xl font-bold">${s.title}</h3>
    <p class="text-slate-600">${s.desc}</p>
    <div class="mt-4 text-right">
      <a href="#" class="btn btn-primary">了解更多／聯繫我們</a>
    </div>`;
  if (window.feather) feather.replace();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){ modal?.classList.remove('active'); modal?.setAttribute('aria-hidden','true'); }
modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
document.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') closeModal(); });

// ====== 初始載入 ======
loadRoute(parsePath(), {replace:true, scroll:"instant"});
