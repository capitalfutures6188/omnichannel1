// ===== SPA Router for static hosting (GitHub Pages friendly) =====
const BASE = (() => {
  const parts = location.pathname.split('/').filter(Boolean);
  if (location.hostname.endsWith('github.io') && parts.length > 0) {
    const first = parts[0];
    if (first && !first.includes('.')) return '/' + first + '/';
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

function stripBase(pathname){
  if (BASE !== '/' && pathname.startsWith(BASE)) return pathname.slice(BASE.length - 1) || '/';
  return pathname || '/';
}
function pageFile(name){ return `${BASE}pages/${name}.html`; }
const app = document.getElementById('app');

async function load(name, {replace=false}={}){
  const res = await fetch(pageFile(name), { cache:'no-cache' });
  app.innerHTML = res.ok ? await res.text() : `<section class="py-16 text-center">
    <h1 class="text-3xl md:text-4xl font-black text-primary mb-4">找不到頁面</h1>
    <p class="opacity-80"><a href="/home" data-link>回首頁</a></p>
  </section>`;

  initPageFeatures(name);
  window.scrollTo({ top: 0, behavior: 'auto' });

  document.querySelectorAll('header a').forEach(a=>{
    const href = a.getAttribute('href') || '';
    const isActive = href === `/${name}` || (name==='home' && (href === '/' || href === '#home'));
    if (isActive) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });

  const finalPath = name === 'home' ? '/' : `/${name}`;
  const url = (BASE.endsWith('/') ? BASE.slice(0,-1) : BASE) + finalPath + (location.hash || '');
  if (replace) history.replaceState({name}, '', url); else history.pushState({name}, '', url);
}

function navigate(path, opts={}){ return load(ROUTES[path] || 'home', opts); }

document.addEventListener('click', (e)=>{
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^(https?:|mailto:|tel:)/i.test(href)) return;
  if (href.startsWith('#')) {
    const seg = href.replace(/^#/, '');
    if (seg && ROUTES['/'+seg]) { e.preventDefault(); navigate('/'+seg); }
    return;
  }
  if (ROUTES[href]) { e.preventDefault(); navigate(href); }
});

window.addEventListener('popstate', ()=>{
  const path = stripBase(location.pathname) || '/';
  const name = ROUTES[path] ? ROUTES[path] : 'home';
  load(name, {replace:true});
});

(function bootstrap(){
  const p = new URLSearchParams(location.search).get('p');
  const initialPath = p ? (p.replace(BASE,'/') || '/') : (stripBase(location.pathname) || '/');
  const name = ROUTES[initialPath] ? ROUTES[initialPath] : 'home';
  load(name, {replace:true});
})();

// ====== Page inits (use global arrays from index.html, copied from your original data) ======
function initPageFeatures(name){
  try {
    if (name === 'home') {
      const el = document.getElementById('job-carousel');
      if (el && Array.isArray(window.jobCarouselItems)) {
        let i = 0;
        function update(){
          el.classList.add('opacity-0');
          setTimeout(()=>{ el.textContent = window.jobCarouselItems[i]; el.classList.remove('opacity-0'); i = (i+1) % window.jobCarouselItems.length; }, 300);
        }
        update();
        if (!el.dataset.bound) { el.dataset.bound = '1'; setInterval(update, 3000); }
      }
    }

    if (name === 'openings') {
      const list = document.getElementById('job-list');
      const overlay = document.getElementById('job-modal-overlay');
      const modal = document.getElementById('job-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalDept = document.getElementById('modal-department');
      const modalBody = document.getElementById('modal-body');

      if (list && Array.isArray(window.jobs)) {
        list.innerHTML = '';
        window.jobs.forEach(job=>{
          const wrap = document.createElement('div');
          wrap.className = 'job-card-trigger bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group';
          wrap.dataset.jobId = job.id;
          wrap.innerHTML = `
            <div class="p-6">
              <div class="flex justify-between items-start gap-4">
                <div>
                  <h3 class="text-xl font-bold text-primary group-hover:text-brand-red transition-colors">${job.title}</h3>
                  <p class="text-sm font-semibold text-secondary-gray mt-1">${job.department}</p>
                </div>
                <div class="text-brand-red text-2xl pt-1 transform transition-transform duration-300 flex-shrink-0 group-hover:translate-x-1">→</div>
              </div>
              <p class="text-gray-600 mt-4 leading-relaxed text-sm">${job.preview}</p>
              <div class="flex flex-wrap gap-2 mt-4">
                ${(job.tags||[]).map(tag=>`<span class="bg-red-100 text-brand-red text-xs font-semibold px-2.5 py-0.5 rounded-full">${tag}</span>`).join('')}
              </div>
            </div>`;
          list.appendChild(wrap);
        });

        function openModal(id){
          const job = window.jobs.find(j=> String(j.id)===String(id));
          if(!job) return;
          modalTitle.textContent = job.title;
          modalDept.textContent = job.department || '';
          modalBody.innerHTML = `
            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-bold text-primary mb-2 border-b-2 border-brand-red pb-1 inline-block">✅ 任務內容</h4>
                <ul class="list-disc list-inside space-y-2 text-gray-700 mt-3 leading-relaxed">
                  ${(job.responsibilities||[]).map(r => `<li>${r}</li>`).join('')}
                </ul>
              </div>
              <div>
                <h4 class="text-lg font-bold text-primary mb-2 border-b-2 border-brand-red pb-1 inline-block">🚀 你會獲得的成長</h4>
                <p class="text-gray-700 mt-3 leading-relaxed">${job.growth||''}</p>
              </div>
              <div>
                <h4 class="text-lg font-bold text-primary mb-2 border-b-2 border-brand-red pb-1 inline-block">👥 我們在找這樣的你</h4>
                <ul class="list-disc list-inside space-y-2 text-gray-700 mt-3 leading-relaxed">
                  ${(job.qualifications||[]).map(q => `<li>${q}</li>`).join('')}
                </ul>
              </div>
            </div>`;
          overlay.classList.add('active'); modal.classList.add('active');
        }

        list.addEventListener('click', (e)=>{ const card = e.target.closest('.job-card-trigger'); if (!card) return; openModal(card.dataset.jobId); });
        document.getElementById('modal-close-btn')?.addEventListener('click', ()=>{ overlay.classList.remove('active'); modal.classList.remove('active'); }, {once:true});
        overlay?.addEventListener('click', ()=>{ overlay.classList.remove('active'); modal.classList.remove('active'); }, {once:true});
      }
    }

    if (name === 'benefits-life') {
      const grid = document.querySelector('#benefits-life .grid.md\\:grid-cols-2');
      if (grid && Array.isArray(window.benefits)) {
        grid.innerHTML = window.benefits.map(b => `
          <div class="card seg-card p-6">
            <div class="flex justify-center mb-4">${b.icon||''}</div>
            <h4 class="text-lg font-bold text-primary mb-2">${b.title||''}</h4>
            <p class="text-sm leading-relaxed">${b.description||''}</p>
          </div>`).join('');
      }
      const photos = window.teamPhotos || [];
      const img = document.getElementById('gallery-image');
      const prev = document.getElementById('prev-btn');
      const next = document.getElementById('next-btn');
      const dots = document.getElementById('gallery-dots');
      if (img && prev && next && dots && photos.length) {
        let i = 0;
        function render(){
          img.src = photos[i];
          dots.innerHTML = photos.map((_,idx)=>`<button data-i="${idx}" class="w-2.5 h-2.5 rounded-full ${idx===i?'bg-red-500':'bg-gray-300'}"></button>`).join('');
        }
        render();
        prev.onclick = ()=>{ i = (i-1+photos.length)%photos.length; render(); };
        next.onclick = ()=>{ i = (i+1)%photos.length; render(); };
        dots.onclick = (e)=>{ const b = e.target.closest('button[data-i]'); if(!b) return; i = +b.dataset.i; render(); };
      }
    }

    if (name === 'career-path') {
      const photos = window.trainingPhotos || [];
      const img = document.getElementById('training-gallery-image');
      const prev = document.getElementById('training-prev-btn');
      const next = document.getElementById('training-next-btn');
      const dots = document.getElementById('training-gallery-dots');
      const cap = document.getElementById('training-caption');
      if (img && prev && next && dots && photos.length) {
        let i = 0;
        function render(){ img.src = photos[i].src; if (cap) cap.textContent = photos[i].caption || ''; dots.innerHTML = photos.map((_,idx)=>`<button data-i="${idx}" class="w-2.5 h-2.5 rounded-full ${idx===i?'bg-red-500':'bg-gray-300'}"></button>`).join(''); }
        render();
        prev.onclick = ()=>{ i = (i-1+photos.length)%photos.length; render(); };
        next.onclick = ()=>{ i = (i+1)%photos.length; render(); };
        dots.onclick = (e)=>{ const b = e.target.closest('button[data-i]'); if(!b) return; i = +b.dataset.i; render(); };
      }
    }

    if (name === 'apply') {
      const box = document.getElementById('apply-steps-container');
      if (box && Array.isArray(window.applySteps)) {
        box.innerHTML = window.applySteps.map(s=>`
          <div class="relative p-6 bg-white rounded-xl shadow seg-card">
            <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center bg-red-100 text-brand-red font-extrabold">${s.number}</div>
            <h4 class="mt-3 font-bold text-primary">${s.title}</h4>
            <p class="text-sm text-slate-600 mt-1">${s.description}</p>
          </div>`).join('');
      }
    }

    if (name === 'faq') {
      const list = document.getElementById('faq-container');
      if (list && Array.isArray(window.faqs)) {
        list.innerHTML = window.faqs.map(item=>`
          <div class="card p-5">
            <button class="accordion-button w-full text-left font-bold text-primary">${item.question}</button>
            <div class="accordion-content mt-3 hidden"><p class="leading-relaxed">${item.answer}</p></div>
          </div>`).join('');
        list.addEventListener('click', (e)=>{ const btn = e.target.closest('.accordion-button'); if(!btn) return; btn.classList.toggle('open'); const next = btn.nextElementSibling; if (next) next.classList.toggle('hidden'); });
      }
    }
  } catch (err) { console.error('[initPageFeatures]', err); }
}
