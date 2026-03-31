/* ── prompt/state.js
   모든 스텝의 필드 값을 읽고(getProjectState) 복원(applyProjectState)하는 공유 레이어.
   새 필드 추가 시 이 파일의 두 함수에만 등록하면 저장·복원이 자동 적용됩니다.
─────────────────────────────────────────────────────── */

function getProjectState() {
  const v = (id, fallback = '') => {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  };

  return {
    // ── 스텝 1-A: 프로젝트 기본 정보 ──
    project    : v('p-project'),
    client     : v('p-client'),
    notes      : v('p-notes'),

    // ── 스텝 1-B: 디스플레이 설정 ──
    font       : v('p-font'),
    resolution : v('p-resolution'),
    ratio      : v('p-ratio'),
    wfStyle    : v('p-wf-style'),
    responsive : v('p-responsive'),
    colorTheme : v('p-color-theme'),

    // ── 스텝 1-C: 인터랙션·에셋 설정 ──
    gnb          : v('p-gnb'),
    interaction  : v('p-interaction'),
    imageRule    : v('p-image-rule'),
    textRule     : v('p-text-rule'),
    accessibility: v('p-accessibility'),

    // ── 스텝 2: 페이지 구성 ──
    pages       : JSON.parse(JSON.stringify(promptPages || [])),
    sections    : JSON.parse(JSON.stringify(promptSections || [])),
    pageSections: JSON.parse(JSON.stringify(pageSections || {})),

    // ── 스텝 4: 푸터 설정 ──
    footerType   : v('p-footer-type'),
    footerHeight : v('p-footer-height'),
    footerLogo   : v('p-footer-logo'),
    footerSns    : v('p-footer-sns'),
    footerPrivacy: v('p-footer-privacy'),
    footerCustom : v('p-footer-custom'),

    // ── 대시보드 ──
    sitemapInput : v('sitemap-input'),

    // ── 페이지 생성기 ──
    genId          : v('g-id'),
    genName        : v('g-name'),
    genSectionsCount: v('g-sections'),
    genStatus      : v('g-status'),
    genPriority    : v('g-priority'),
    genNote        : v('g-note'),
    genLayout      : v('g-layout'),
    genSections    : JSON.parse(JSON.stringify(genSections || [])),

    savedAt: new Date().toLocaleString('ko-KR')
  };
}

function applyProjectState(state) {
  if (!state) return;
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  // ── 스텝 1-A ──
  set('p-project', state.project);
  set('p-client',  state.client);
  set('p-notes',   state.notes);

  // ── 스텝 1-B ──
  set('p-font',         state.font);
  set('p-resolution',   state.resolution);
  set('p-ratio',        state.ratio);
  set('p-wf-style',     state.wfStyle);
  set('p-responsive',   state.responsive);
  set('p-color-theme',  state.colorTheme);

  // ── 스텝 1-C ──
  set('p-gnb',           state.gnb);
  set('p-interaction',   state.interaction);
  set('p-image-rule',    state.imageRule);
  set('p-text-rule',     state.textRule);
  set('p-accessibility', state.accessibility);

  // ── 스텝 2 ──
  promptPages    = state.pages    || [];
  promptSections = state.sections || [];
  pageSections   = state.pageSections || {};

  if (Object.keys(pageSections).length === 0 && promptSections.length > 0 && promptPages.length > 0) {
    pageSections[promptPages[0].id] = JSON.parse(JSON.stringify(promptSections));
  }
  _activePageTab = promptPages.length > 0 ? promptPages[0].id : null;

  if (typeof renderPromptPageList  === 'function') renderPromptPageList();
  if (typeof renderPageSectionTabs === 'function') renderPageSectionTabs();
  if (typeof updateCounters        === 'function') updateCounters();

  // ── 스텝 4 ──
  set('p-footer-type',    state.footerType);
  set('p-footer-height',  state.footerHeight);
  set('p-footer-logo',    state.footerLogo);
  set('p-footer-sns',     state.footerSns);
  set('p-footer-privacy', state.footerPrivacy);
  set('p-footer-custom',  state.footerCustom || '');
  const footerRow = document.getElementById('footer-custom-row');
  if (footerRow) footerRow.style.display = state.footerType === '커스텀' ? 'grid' : 'none';

  // ── 대시보드 ──
  set('sitemap-input', state.sitemapInput || '');
  if (state.sitemapInput && typeof parseSitemap === 'function') parseSitemap();
  else if (typeof clearDashboard === 'function') clearDashboard();

  // ── 페이지 생성기 ──
  set('g-id',      state.genId     || '');
  set('g-name',    state.genName   || '');
  set('g-sections',state.genSectionsCount || '');
  set('g-status',  state.genStatus  || 'wip');
  set('g-priority',state.genPriority|| 'P1');
  set('g-note',    state.genNote   || '');
  set('g-layout',  state.genLayout || '스크롤 페이지');
  genSections = state.genSections || [];
  if (typeof renderSectionList === 'function') renderSectionList('gen-section-list', genSections);
}

function updateCounters() {
  const sc = document.getElementById('section-counter');
  const pc = document.getElementById('page-counter');
  const totalSections = Object.values(pageSections).reduce((s, a) => s + a.length, 0);
  if (sc) sc.textContent = totalSections > 0 ? `전체 ${totalSections}개` : '';
  if (pc) pc.textContent = promptPages.length > 0 ? `${promptPages.length}개` : '';
}


function clearPromptForm() {
  promptSections = [];
  pageSections   = {};
  _activePageTab = null;
  promptPages    = [];
  renderSectionList('section-list', []);
  renderPromptPageList();
  renderPageSectionTabs();
  // 프로젝트 기본 설정 초기화
  document.getElementById('p-project').value = '';
  document.getElementById('p-client').value = '';
  document.getElementById('p-font').value = '';
  document.getElementById('p-resolution').value = '';
  document.getElementById('p-ratio').selectedIndex = 0;
  document.getElementById('p-wf-style').selectedIndex = 0;
  document.getElementById('p-responsive').selectedIndex = 0;
  document.getElementById('p-color-theme').selectedIndex = 0;
  document.getElementById('p-gnb').selectedIndex = 0;
  document.getElementById('p-interaction').selectedIndex = 0;
  document.getElementById('p-image-rule').selectedIndex = 0;
  document.getElementById('p-text-rule').selectedIndex = 0;
  document.getElementById('p-accessibility').selectedIndex = 0;
  document.getElementById('p-notes').value = '';
  document.getElementById('p-footer-type').selectedIndex = 0;
  document.getElementById('p-footer-height').selectedIndex = 0;
  document.getElementById('p-footer-logo').selectedIndex = 0;
  document.getElementById('p-footer-sns').selectedIndex = 0;
  document.getElementById('p-footer-privacy').selectedIndex = 0;
  document.getElementById('p-footer-custom').value = '';
  document.getElementById('footer-custom-row').style.display = 'none';
  // 출력 영역 전체 초기화
  ['output-claude','output-figma','output-md'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  // 페이지 생성 탭 초기화
  genSections = [];
  renderSectionList('gen-section-list', genSections);
  const genOut = document.getElementById('gen-output');
  if (genOut) genOut.textContent = '';
  ['g-id','g-name','g-sections','g-note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const genFilenamePreview = document.getElementById('gen-filename-preview');
  if (genFilenamePreview) genFilenamePreview.textContent = '{번호}-{페이지명}.md';
  // 대시보드 초기화
  clearDashboard();
  updateCounters();
}
