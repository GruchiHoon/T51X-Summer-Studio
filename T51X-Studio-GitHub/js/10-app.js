/* ── 10-app.js — initApp, 프롬프트 스텝 주입, 모바일, 가이드 모달 ── */

// ══════════════════════════════════════════════════
// 프롬프트 스텝 패널 HTML 주입
// 각 스텝의 내용을 spanel-N 빈 div에 렌더링
// ══════════════════════════════════════════════════
function initPromptSteps() {
  // 스텝 1 — 기본 설정 (1-A + 1-B + 1-C 합성)
  const p1 = document.getElementById('spanel-1');
  if (p1) {
    p1.innerHTML = `
      <div class="step-body">
        <div class="card-title" style="margin-bottom:14px">① 프로젝트 기본 설정</div>
        ${renderStep1Basic()}
        ${renderStep1Display()}
        ${renderStep1Interaction()}
      </div>
      <div class="step-nav-row" style="padding:14px 20px 16px">
        <div class="step-progress">
          <div class="step-dot active"></div>
          <div class="step-dot"></div>
          <div class="step-dot"></div>
          <div class="step-dot"></div>
        </div>
        <button class="btn btn-primary" onclick="switchStepTab(2)" style="font-size:12px;padding:7px 18px">다음 → 페이지 구성</button>
      </div>
    `;
  }

  // 스텝 2 — 페이지 구성
  const p2 = document.getElementById('spanel-2');
  if (p2) {
    p2.innerHTML = `
      <div class="step-body">
        ${renderStep2()}
      </div>
      <div class="step-nav-row" style="padding:14px 20px 16px">
        <button class="btn btn-ghost" onclick="switchStepTab(1)" style="font-size:12px;padding:7px 16px">← 기본 설정</button>
        <div class="step-progress">
          <div class="step-dot done"></div>
          <div class="step-dot active"></div>
          <div class="step-dot"></div>
          <div class="step-dot"></div>
        </div>
        <button class="btn btn-primary" onclick="switchStepTab(3)" style="font-size:12px;padding:7px 18px">다음 → 섹션 구성</button>
      </div>
    `;
  }

  // 스텝 3 — 섹션 구성
  const p3 = document.getElementById('spanel-3');
  if (p3) {
    p3.innerHTML = `
      <div class="step-body">
        ${renderStep3()}
      </div>
      <div class="step-nav-row" style="padding:14px 20px 16px">
        <button class="btn btn-ghost" onclick="switchStepTab(2)" style="font-size:12px;padding:7px 16px">← 페이지 구성</button>
        <div class="step-progress">
          <div class="step-dot done"></div>
          <div class="step-dot done"></div>
          <div class="step-dot active"></div>
          <div class="step-dot"></div>
        </div>
        <button class="btn btn-primary" onclick="switchStepTab(4)" style="font-size:12px;padding:7px 18px">다음 → 푸터 설정</button>
      </div>
    `;
  }

  // 스텝 4 — 푸터 설정
  const p4 = document.getElementById('spanel-4');
  if (p4) {
    p4.innerHTML = `
      <div class="step-body">
        ${renderStep4()}
      </div>
      <div class="step-nav-row" style="padding:14px 20px 16px">
        <button class="btn btn-ghost" onclick="switchStepTab(3)" style="font-size:12px;padding:7px 16px">← 섹션 구성</button>
        <div class="step-progress">
          <div class="step-dot done"></div>
          <div class="step-dot done"></div>
          <div class="step-dot done"></div>
          <div class="step-dot active"></div>
        </div>
        <button class="btn btn-primary" onclick="generatePrompt()" style="font-size:12px;padding:7px 18px">✨ 프롬프트 생성</button>
      </div>
    `;
  }
}

// ══════════════════════════════════════════════════
// INIT — DOM 준비 완료 후 실행
// ══════════════════════════════════════════════════
function initApp() {
  // 유저 표시
  const u = getCurrentUser();
  const label = document.getElementById('user-label');
  const sub   = document.getElementById('header-user-sub');
  if (label) label.textContent = u;
  if (sub)   sub.textContent   = u;

  // 기본 저장소 생성 (유저별)
  ensureDefaultFolder();

  // 프롬프트 스텝 패널 HTML 주입 (가장 먼저 - DOM 요소 생성)
  initPromptSteps();

  // MD 선택 패널 초기화
  if (typeof initMdSelectPanel === 'function') initMdSelectPanel();

  // Vault 초기화
  vaultInit();

  // UI 렌더링
  renderPageSectionTabs();
  renderSectionList('gen-section-list', genSections);
  renderPromptPageList();
  updateSlotUI();
  updateCounters();
  renderHistoryList();
  attachAutoSaveListeners();

  // 마지막 프로젝트 자동 복원
  const history = getHistory();
  if (history.length > 0) {
    const last = history[0];
    applyProjectState(last.state);
    currentHistoryId = last.id;
    renderHistoryList();
  }
}

// DOM 준비되면 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Enter / Ctrl+Z 전역 키 핸들러
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    const active     = document.activeElement;
    const isEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    const isVaultRaw = active && active.id === 'vault-raw-editor';
    if (!isEditable || isVaultRaw) {
      e.preventDefault();
      undoLastAction();
    }
    return;
  }
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (active && active.id === 'new-p-note')      addPromptPage();
    if (active && active.id === 'new-section-note') addSection();
    if (active && active.id === 'gen-new-note')     addGenSection();
  }
});

// ══════════════════════════════════
// 모바일 사이드바 / 탭바
// ══════════════════════════════════
function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  const isOpen  = sidebar.classList.contains('mobile-open');
  if (isOpen) {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('open');
  } else {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('open');
  }
}

function closeMobileSidebar() {
  document.querySelector('.sidebar').classList.remove('mobile-open');
  document.getElementById('mobile-sidebar-overlay').classList.remove('open');
}

function showPageMobile(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + id + "'"));
  });
  document.querySelectorAll('.mobile-tab-item').forEach(b => b.classList.remove('active'));
  const mtab = document.getElementById('mtab-' + id);
  if (mtab) mtab.classList.add('active');
  closeMobileSidebar();
  if (id === 'prompt') renderPageSectionTabs();
}

// ══════════════════════════════════
// GUIDE MODAL
// ══════════════════════════════════
function openGuide() {
  document.getElementById('guide-overlay').classList.add('open');
}
function closeGuide() {
  document.getElementById('guide-overlay').classList.remove('open');
}
function closeGuideOutside(e) {
  if (e.target === document.getElementById('guide-overlay')) closeGuide();
}
function setGuideLevel(level) {
  const easyPanel   = document.getElementById('guide-easy-panel');
  const detailPanel = document.getElementById('guide-detail-panel');
  const btnEasy     = document.getElementById('glvl-easy');
  const btnDetail   = document.getElementById('glvl-detail');
  if (level === 'easy') {
    easyPanel.classList.add('on');
    detailPanel.style.display = 'none';
    btnEasy.classList.add('active');
    btnDetail.classList.remove('active');
  } else {
    easyPanel.classList.remove('on');
    detailPanel.style.display = 'block';
    btnEasy.classList.remove('active');
    btnDetail.classList.add('active');
    const firstTab     = detailPanel.querySelector('.g-tab-btn');
    const firstContent = detailPanel.querySelector('.g-tab-content');
    if (firstTab && firstContent) {
      detailPanel.querySelectorAll('.g-tab-content').forEach(t => t.classList.remove('on'));
      detailPanel.querySelectorAll('.g-tab-btn').forEach(b => b.classList.remove('on'));
      firstContent.classList.add('on');
      firstTab.classList.add('on');
    }
  }
}

function showGTab(id, btn) {
  document.querySelectorAll('.g-tab-content').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.g-tab-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('gtab-' + id).classList.add('on');
  btn.classList.add('on');
}
