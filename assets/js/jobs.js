// ===== 職缺資料（自行編輯） =====
const JOBS = [
  {
    id: 'ops-analyst',
    tag: '幕僚／企劃',
    title: '專案整合幕僚',
    summary: '支援主管追專案、整合資源與流程，讓策略真正被執行。',
    responsibilities: [
      '統整處室進度與風險預警、製作文書與提案架構',
      '跨部門溝通協調、制度優化與 KPI 追蹤',
    ],
    requirements: [
      '條理分明、主動溝通，擅長文件與簡報結構',
      '熟悉 Excel / PowerPoint 或 Google Workspace',
    ],
    location: '台北市（內湖／信義）',
    employmentType: '全職',
    applyLink: '/apply',
  },
  {
    id: 'securities-channel',
    tag: '前線推廣',
    title: '證券通路業務',
    summary: '走進分公司，結合制度與商品推廣，讓期貨真的推得動。',
    responsibilities: [
      '規劃教育／活動、協助話術與激勵制度',
      '據點輔導與成效追蹤，連結總公司與現場',
    ],
    requirements: [
      '樂於互動、具企劃與執行力，能配合外勤',
      '對期貨／選擇權有基本概念（可培訓）',
    ],
    location: '台灣各主要都會區（需出差）',
    employmentType: '全職',
    applyLink: '/apply',
  },
  {
    id: 'digital-lead',
    tag: '主管職',
    title: '數位通路業務科長',
    summary: '帶隊打造數位化業務模式，橫跨線上線下與跨商品推動。',
    responsibilities: [
      '拓展數位通路與異業合作、社群與議題策略',
      '績效檢核與轉換率管理、培育與複製團隊',
    ],
    requirements: [
      '具帶人經驗或數位成長案例，重視資料化管理',
      '熟悉行銷漏斗、CRM 或自動化工具佳',
    ],
    location: '台北市',
    employmentType: '全職',
    applyLink: '/apply',
  },
  {
    id: 'digital-rep',
    tag: '數位業務',
    title: '數位通路業務員',
    summary: '用內容與工具建立信任關係，系統化培養長期客戶。',
    responsibilities: [
      '經營期貨／選擇權客戶、策略分享與市場觀點',
      '講座／LINE 導客、工具引導與教育互動',
    ],
    requirements: [
      '願意學習、善於溝通，樂於分享觀點與知識',
      '有社群／簡報／教學經驗更佳',
    ],
    location: '台北／新北（可視情況彈性）',
    employmentType: '全職／實習',
    applyLink: '/apply',
  },
  {
    id: 'admin-planner',
    tag: '營運中台',
    title: '行政企劃人員',
    summary: '設計制度、儀表板與 SOP，讓資訊透明、事情變簡單。',
    responsibilities: [
      '獎勵機制、跨商品激勵與業績追蹤機制',
      '營運報表、SOP 與行政後勤、專案執行追蹤',
    ],
    requirements: [
      '數據意識與文件力，細心、負責，能獨立完成任務',
      '具資料視覺化或自動化經驗佳（如 AppSheet / Data Studio）',
    ],
    location: '台北市',
    employmentType: '全職',
    applyLink: '/apply',
  },
];

// ====== 工具 ======
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = (sel, root = document) => root.querySelector(sel);

// ====== Modal 控制 ======
function openJobModal(jobId) {
  const data = JOBS.find(j => j.id === jobId);
  if (!data) return;

  $('#jobModalTitle').textContent = `${data.title}｜${data.tag}`;
  $('#jobModalSummary').textContent = data.summary;

  const resp = $('#jobModalResp'); resp.innerHTML = '';
  data.responsibilities.forEach(t => {
    const li = document.createElement('li'); li.textContent = t; resp.appendChild(li);
  });
  const req = $('#jobModalReq'); req.innerHTML = '';
  data.requirements.forEach(t => {
    const li = document.createElement('li'); li.textContent = t; req.appendChild(li);
  });
  $('#jobMeta').textContent = `地點：${data.location}｜性質：${data.employmentType}`;
  $('#jobApplyBtn').setAttribute('href', data.applyLink || '/apply');

  document.body.classList.add('modal-open');
  $('#jobModal').classList.remove('hidden');
}
function closeJobModal() {
  document.body.classList.remove('modal-open');
  $('#jobModal').classList.add('hidden');
}
function bindModalEvents() {
  $('#jobModalClose')?.addEventListener('click', closeJobModal);
  $('#jobModalClose2')?.addEventListener('click', closeJobModal);
  $('#jobModalOverlay')?.addEventListener('click', closeJobModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#jobModal').classList.contains('hidden')) closeJobModal();
  });
}

// ====== 職缺卡渲染 ======
function renderJobs() {
  const grid = $('#jobs-grid');
  if (!grid) return;

  grid.innerHTML = JOBS.map(j => `
    <article class="p-6 rounded-xl bg-white border shadow-sm hover:shadow transition">
      <div class="text-sm text-slate-500">${j.tag}</div>
      <h3 class="mt-1 text-lg font-bold">${j.title}</h3>
      <p class="mt-2 text-sm text-slate-700">${j.summary}</p>
      <div class="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span>地點：${j.location}</span><span>｜</span><span>性質：${j.employmentType}</span>
      </div>
      <div class="mt-4">
        <button data-job="${j.id}"
          class="px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 focus:outline-none">
          查看詳情
        </button>
      </div>
    </article>
  `).join('');

  // 綁定按鈕
  $$('button[data-job]').forEach(btn => {
    btn.addEventListener('click', () => openJobModal(btn.getAttribute('data-job')));
  });
}

// ====== Router Hook：每次頁面載入後觸發 ======
window.onPageLoad = function(pageName) {
  // 開啟 /openings 頁時渲染職缺，並綁定 Modal 事件
  if (pageName === 'openings') {
    renderJobs();
    bindModalEvents();
  }
};
