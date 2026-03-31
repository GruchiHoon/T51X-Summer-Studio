/* ── 05-slots — 폴더 기반 슬롯 매니저 ── */

// ══════════════════════════════════
// SAVE / LOAD SYSTEM — 폴더 기반 슬롯
// ══════════════════════════════════
const SLOT_MAX = 100;
const FOLDERS_KEY = 'wps_folders';   // 폴더 메타데이터
const DEFAULT_FOLDER_ID = 'folder_default';

let currentSlot = null;       // { folderId, slotNum }
let activeFolderId = null;    // 슬롯 패널에서 보여주는 폴더

/* ── 폴더 메타 구조:
  [{ id, name, slotCount(max) }, ...]
   슬롯 실 데이터: wps_slot_{folderId}_{num}
──────────────────────────────────── */

function getFolders() {
  try { return JSON.parse(_ls.get(FOLDERS_KEY)) || []; }
  catch { return []; }
}
function saveFolders(list) { _ls.set(FOLDERS_KEY, JSON.stringify(list)); }

function ensureDefaultFolder() {
  let folders = getFolders();
  if (!folders.find(f => f.id === DEFAULT_FOLDER_ID)) {
    folders.unshift({ id: DEFAULT_FOLDER_ID, name: '기본 폴더', slotCount: SLOT_MAX });
    saveFolders(folders);
  }
  return getFolders();
}

function getSlotKey(folderId, num) { return `wps_slot_${folderId}_${num}`; }

function getFolderSlots(folderId) {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  const max = folder ? folder.slotCount : SLOT_MAX;
  const slots = [];
  for (let i = 1; i <= max; i++) {
    const raw = _ls.get(getSlotKey(folderId, i));
    slots.push({ num: i, data: raw ? JSON.parse(raw) : null });
  }
  return slots;
}

function countFolderFilled(folderId) {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  const max = folder ? folder.slotCount : SLOT_MAX;
  let count = 0;
  for (let i = 1; i <= max; i++) {
    if (_ls.get(getSlotKey(folderId, i))) count++;
  }
  return count;
}

/* ── 모달 열기/닫기 ── */
function openSlotManager() {
  ensureDefaultFolder();
  const folders = getFolders();
  if (!activeFolderId || !folders.find(f => f.id === activeFolderId)) {
    activeFolderId = folders[0]?.id || DEFAULT_FOLDER_ID;
  }
  renderFolderList();
  renderSlotGrid(activeFolderId);
  document.getElementById('slot-manager-overlay').classList.add('open');
}
function closeSlotManager() {
  document.getElementById('slot-manager-overlay').classList.remove('open');
}
function closeSlotManagerOutside(e) {
  if (e.target === document.getElementById('slot-manager-overlay')) closeSlotManager();
}

/* ── 폴더 렌더 ── */
function renderFolderList() {
  const folders = getFolders();
  const el = document.getElementById('folder-list');
  if (!el) return;
  el.innerHTML = folders.map(f => {
    const filled = countFolderFilled(f.id);
    const isActive = f.id === activeFolderId;
    const isDefault = f.id === DEFAULT_FOLDER_ID;
    return `<div class="folder-item${isActive ? ' active' : ''}"
      onclick="selectFolder('${f.id}')"
      ondblclick="slotRenameFolderInline('${f.id}',event)"
      title="${isDefault ? '' : '더블클릭으로 이름 변경'}">
      <span class="folder-icon">📁</span>
      <span class="folder-label" id="slotflabel-${f.id}">${escHtml(f.name)}</span>
      <span class="folder-count${filled > 0 ? ' filled' : ''}">${filled}</span>
    </div>`;
  }).join('');
}

let _slotFolderRenaming = false;

function slotRenameFolderInline(fid, e) {
  e.stopPropagation();
  if (_slotFolderRenaming) return;
  if (fid === DEFAULT_FOLDER_ID) { showToast('❌ 기본 폴더는 이름을 변경할 수 없습니다'); return; }
  const labelEl = document.getElementById('slotflabel-' + fid);
  if (!labelEl) return;
  const folders = getFolders();
  const folder = folders.find(f => f.id === fid);
  if (!folder) return;
  _slotFolderRenaming = true;
  const current = folder.name;
  const input = document.createElement('input');
  input.className = 'folder-rename-input';
  input.value = current;
  input.style.cssText = 'flex:1;min-width:0;max-width:110px;';
  labelEl.replaceWith(input);
  input.focus(); input.select();
  let committed = false;
  function commit() {
    if (committed) return;
    committed = true;
    _slotFolderRenaming = false;
    const newName = input.value.trim() || current;
    folder.name = newName;
    saveFolders(folders);
    renderFolderList();
    renderSlotGrid(activeFolderId);
    if (newName !== current) showToast(`✅ "${newName}"으로 변경됐습니다`);
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { committed = true; _slotFolderRenaming = false; input.value = current; renderFolderList(); renderSlotGrid(activeFolderId); }
  });
}

function selectFolder(id) {
  if (_slotFolderRenaming) return;
  activeFolderId = id;
  renderFolderList();
  renderSlotGrid(id);
}

/* ── 슬롯 그리드 렌더 ── */
function renderSlotGrid(folderId) {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  const nameEl = document.getElementById('slot-panel-folder-name');
  if (nameEl) nameEl.textContent = folder ? folder.name : '';

  const slots = getFolderSlots(folderId);
  const grid = document.getElementById('slot-grid');
  if (!grid) return;
  grid.innerHTML = slots.map(s => {
    const isCurrent = currentSlot && currentSlot.folderId === folderId && currentSlot.slotNum === s.num;
    const filled = !!s.data;
    let cls = 'slot-card';
    if (filled) cls += ' filled';
    if (isCurrent) cls += ' active';
    const numLabel = `슬롯 ${s.num}`;
    const name = filled ? (s.data.slotLabel || s.data.project || '이름 없음') : '';
    const meta = filled ? `저장: ${s.data.savedAt || ''}` : '';
    const delBtn = filled
      ? `<button class="slot-del-btn" onclick="deleteSlot('${folderId}',${s.num},event)" title="삭제">×</button>`
      : '';
    // 더블클릭 시 onclick 억제: data-dblclick-pending 플래그 활용
    return `<div class="${cls}"
      data-fid="${folderId}" data-num="${s.num}" data-filled="${filled}"
      onclick="handleSlotCardClick(this,'${folderId}',${s.num})"
      ondblclick="slotRenameInline('${folderId}',${s.num},event)"
      title="${filled ? '더블클릭으로 이름 변경' : ''}">
      <div class="slot-card-dot"></div>
      <div class="slot-card-num">${numLabel}</div>
      ${filled
        ? `<div class="slot-card-name" id="slotname-${folderId}-${s.num}">${escHtml(name)}</div><div class="slot-card-meta">${escHtml(meta)}</div>`
        : `<div class="slot-card-empty">비어 있음 — 클릭하여 저장</div>`}
      ${delBtn}
    </div>`;
  }).join('');
}

/* 더블클릭과 단일클릭 구분 — 더블클릭 시 단일클릭 동작 억제 */
let _slotClickTimer = null;
function handleSlotCardClick(el, folderId, num) {
  if (_slotClickTimer) return; // 더블클릭 진행 중이면 무시
  _slotClickTimer = setTimeout(() => {
    _slotClickTimer = null;
    clickSlotCard(folderId, num);
  }, 220);
}

function slotRenameInline(folderId, num, e) {
  e.stopPropagation();
  // 더블클릭이 감지되면 단일클릭 타이머 취소
  if (_slotClickTimer) { clearTimeout(_slotClickTimer); _slotClickTimer = null; }
  const raw = _ls.get(getSlotKey(folderId, num));
  if (!raw) return; // 빈 슬롯은 이름 변경 불가
  const state = JSON.parse(raw);
  const nameEl = document.getElementById(`slotname-${folderId}-${num}`);
  if (!nameEl) return;
  const current = state.slotLabel || state.project || '이름 없음';
  const input = document.createElement('input');
  input.style.cssText = 'width:100%;background:var(--surface);border:1px solid var(--accent);border-radius:4px;color:var(--text);font-size:12px;font-weight:700;padding:2px 6px;outline:none;font-family:inherit;box-sizing:border-box;';
  input.value = current;
  nameEl.replaceWith(input);
  input.focus(); input.select();
  let committed = false;
  function commit() {
    if (committed) return;
    committed = true;
    const newName = input.value.trim() || current;
    state.slotLabel = newName;
    _ls.set(getSlotKey(folderId, num), JSON.stringify(state));
    renderFolderList();
    renderSlotGrid(folderId);
    updateSlotUI();
    if (newName !== current) showToast(`✅ 슬롯 이름이 "${newName}"으로 변경됐습니다`);
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { committed = true; renderSlotGrid(folderId); }
  });
  input.addEventListener('click', ev => ev.stopPropagation());
  input.addEventListener('dblclick', ev => ev.stopPropagation());
}

function clickSlotCard(folderId, num) {
  const raw = _ls.get(getSlotKey(folderId, num));
  if (!raw) {
    // 빈 슬롯 → 현재 상태 저장
    if (confirm(`슬롯 ${num}이 비어 있습니다. 현재 상태를 여기에 저장할까요?`)) {
      const state = getProjectState();
      _ls.set(getSlotKey(folderId, num), JSON.stringify(state));
      currentSlot = { folderId, slotNum: num };
      updateSlotUI();
      renderFolderList();
      renderSlotGrid(folderId);
      showToast(`💾 슬롯 ${num}에 저장됐습니다 — ${state.project || '미입력'}`);
    }
    return;
  }
  const state = JSON.parse(raw);
  if (!confirm(`슬롯 ${num} (${state.project || '?'}) 을 불러올까요?\n현재 작업 중인 내용은 사라집니다.`)) return;
  applyProjectState(state);
  currentSlot = { folderId, slotNum: num };
  updateSlotUI();
  renderFolderList();
  renderSlotGrid(folderId);
  showToast(`📂 슬롯 ${num} — ${state.project || ''} 불러왔습니다`);
}

function deleteSlot(folderId, num, e) {
  e.stopPropagation();
  if (!confirm(`슬롯 ${num}을 삭제할까요?`)) return;
  _ls.remove(getSlotKey(folderId, num));
  if (currentSlot && currentSlot.folderId === folderId && currentSlot.slotNum === num) {
    currentSlot = null;
    updateSlotUI();
  }
  renderFolderList();
  renderSlotGrid(folderId);
  showToast('🗑 슬롯이 삭제됐습니다');
}

/* ── 폴더 추가/삭제/이름변경 ── */
function addFolder() {
  const name = prompt('새 폴더 이름을 입력하세요');
  if (!name || !name.trim()) return;
  const folders = getFolders();
  const id = `folder_${Date.now()}`;
  folders.push({ id, name: name.trim(), slotCount: SLOT_MAX });
  saveFolders(folders);
  activeFolderId = id;
  renderFolderList();
  renderSlotGrid(id);
}

function renameFolderPrompt() {
  if (!activeFolderId) return;
  const folders = getFolders();
  const folder = folders.find(f => f.id === activeFolderId);
  if (!folder) return;
  if (activeFolderId === DEFAULT_FOLDER_ID) { showToast('❌ 기본 폴더는 이름을 변경할 수 없습니다'); return; }
  const newName = prompt('새 이름을 입력하세요', folder.name);
  if (!newName || !newName.trim()) return;
  folder.name = newName.trim();
  saveFolders(folders);
  renderFolderList();
  renderSlotGrid(activeFolderId);
}

function deleteFolderPrompt() {
  if (!activeFolderId) return;
  if (activeFolderId === DEFAULT_FOLDER_ID) { showToast('❌ 기본 폴더는 삭제할 수 없습니다'); return; }
  const folders = getFolders();
  const folder = folders.find(f => f.id === activeFolderId);
  if (!confirm(`폴더 "${folder?.name}"과 안의 슬롯을 모두 삭제할까요?`)) return;
  // 슬롯 데이터 삭제
  for (let i = 1; i <= (folder?.slotCount || SLOT_MAX); i++) {
    _ls.remove(getSlotKey(activeFolderId, i));
  }
  const newList = folders.filter(f => f.id !== activeFolderId);
  saveFolders(newList);
  if (currentSlot && currentSlot.folderId === activeFolderId) { currentSlot = null; updateSlotUI(); }
  activeFolderId = newList[0]?.id || DEFAULT_FOLDER_ID;
  renderFolderList();
  renderSlotGrid(activeFolderId);
  showToast('🗑 폴더가 삭제됐습니다');
}

/* ── 전체 삭제 ── */
function clearAllSlots() {
  if (!confirm(`모든 폴더의 슬롯을 전체 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;
  const folders = getFolders();
  folders.forEach(f => {
    for (let i = 1; i <= (f.slotCount || SLOT_MAX); i++) {
      _ls.remove(getSlotKey(f.id, i));
    }
  });
  currentSlot = null;
  updateSlotUI();
  if (document.getElementById('slot-manager-overlay').classList.contains('open')) {
    renderFolderList();
    if (activeFolderId) renderSlotGrid(activeFolderId);
  }
  showToast('🗑 전체 슬롯이 삭제됐습니다');
}

/* ── 상단 바 chip 업데이트 ── */
function updateSlotUI() {
  const chip = document.getElementById('slot-current-chip');
  const label = document.getElementById('slot-current-label');
  if (!chip || !label) return;
  if (!currentSlot) {
    chip.className = 'slot-current-chip empty';
    label.textContent = '선택 없음';
    return;
  }
  const raw = _ls.get(getSlotKey(currentSlot.folderId, currentSlot.slotNum));
  const folders = getFolders();
  const folder = folders.find(f => f.id === currentSlot.folderId);
  if (raw) {
    const state = JSON.parse(raw);
    chip.className = 'slot-current-chip';
    const displayName = state.slotLabel || state.project || '';
    label.textContent = `${folder ? folder.name + ' › ' : ''}슬롯 ${currentSlot.slotNum}  ${displayName.slice(0,10)}`;
  } else {
    chip.className = 'slot-current-chip empty';
    label.textContent = '선택 없음';
    currentSlot = null;
  }
}

/* ── 현재 상태 저장 (상단 바 버튼) ── */
function saveToSlot() {
  ensureDefaultFolder();
  if (!currentSlot) {
    // 비어있는 첫 슬롯 자동 선택
    const folders = getFolders();
    let found = null;
    outer: for (const f of folders) {
      for (let i = 1; i <= (f.slotCount || SLOT_MAX); i++) {
        if (!_ls.get(getSlotKey(f.id, i))) { found = { folderId: f.id, slotNum: i }; break outer; }
      }
    }
    if (!found) found = { folderId: DEFAULT_FOLDER_ID, slotNum: 1 };
    currentSlot = found;
  }
  const state = getProjectState();
  _ls.set(getSlotKey(currentSlot.folderId, currentSlot.slotNum), JSON.stringify(state));
  updateSlotUI();
  if (document.getElementById('slot-manager-overlay').classList.contains('open')) {
    renderFolderList();
    renderSlotGrid(currentSlot.folderId);
  }
  showToast(`💾 슬롯 ${currentSlot.slotNum}에 저장됐습니다 — ${state.project || '미입력'}`);
}

/* ── 슬롯 삭제 (상단 바 버튼) ── */
function clearSlotPrompt() {
  if (!currentSlot) { showToast('❌ 먼저 슬롯 관리에서 슬롯을 선택하세요'); return; }
  if (!confirm(`슬롯 ${currentSlot.slotNum}을 삭제할까요?`)) return;
  _ls.remove(getSlotKey(currentSlot.folderId, currentSlot.slotNum));
  currentSlot = null;
  updateSlotUI();
  showToast('🗑 슬롯이 삭제됐습니다');
}

/* ── 히스토리 saveCurrentToHistory 내 슬롯키 호환 유지 ── */function applyProjectState(state) {
  if (!state) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };

  // AI 프롬프트 기본 및 푸터 복구
  set('p-project', state.project);
  set('p-client', state.client);
  set('p-font', state.font);
  set('p-resolution', state.resolution);
  set('p-ratio', state.ratio);
  set('p-wf-style', state.wfStyle);
  set('p-responsive', state.responsive);
  set('p-color-theme', state.colorTheme);
  set('p-gnb', state.gnb);
  set('p-interaction', state.interaction);
  set('p-image-rule', state.imageRule);
  set('p-text-rule', state.textRule);
  set('p-accessibility', state.accessibility);
  set('p-notes', state.notes);
  set('p-footer-type', state.footerType);
  set('p-footer-height', state.footerHeight);
  set('p-footer-logo', state.footerLogo);
  set('p-footer-sns', state.footerSns);
  set('p-footer-privacy', state.footerPrivacy);
  set('p-footer-custom', state.footerCustom || '');

  const footerRow = document.getElementById('footer-custom-row');
  if (footerRow) footerRow.style.display = state.footerType === '커스텀' ? 'grid' : 'none';

  // [핵심] 페이지, 섹션 배열 복구
  promptPages = state.pages || [];
  promptSections = state.sections || [];
  pageSections = state.pageSections || {};

  if (Object.keys(pageSections).length === 0 && promptSections.length > 0 && promptPages.length > 0) {
    pageSections[promptPages[0].id] = JSON.parse(JSON.stringify(promptSections));
  }

  _activePageTab = promptPages.length > 0 ? promptPages[0].id : null;

  // 데이터만 넣지 않고 화면 렌더링 강제 실행!
  if (typeof renderPromptPageList === 'function') renderPromptPageList();
  if (typeof renderPageSectionTabs === 'function') renderPageSectionTabs();
  if (typeof updateCounters === 'function') updateCounters();

  // 대시보드 복구
  set('sitemap-input', state.sitemapInput || '');
  if (state.sitemapInput && typeof parseSitemap === 'function') {
    parseSitemap();
  } else if (typeof clearDashboard === 'function') {
    clearDashboard();
  }

  // 페이지 생성기 복구
  set('g-id', state.genId || '');
  set('g-name', state.genName || '');
  set('g-sections', state.genSectionsCount || '');
  set('g-status', state.genStatus || 'wip');
  set('g-priority', state.genPriority || 'P1');
  set('g-note', state.genNote || '');
  set('g-layout', state.genLayout || '스크롤 페이지');

  genSections = state.genSections || [];
  if (typeof renderSectionList === 'function') renderSectionList('gen-section-list', genSections);
}
