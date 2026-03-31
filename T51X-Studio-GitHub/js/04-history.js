/* ── 04-history — 히스토리 저장·복원, 자동저장 ── */

// ══════════════════════════════════
// HISTORY SYSTEM (Claude 스타일)
// ══════════════════════════════════
const HISTORY_KEY = 'wps_history';
const HISTORY_MAX = 30;
let currentHistoryId = null;

function getHistory() {
  try { return JSON.parse(_ls.get(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(list) {
  _ls.set(HISTORY_KEY, JSON.stringify(list));
}

function saveCurrentToHistory(isNew) {
  const state = getProjectState();
  if (!state.project && !state.client && promptPages.length === 0 && promptSections.length === 0) return null;
  const list = getHistory();
  const now = new Date();
  const dateStr = now.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (currentHistoryId && !isNew) {
    const idx = list.findIndex(h => h.id === currentHistoryId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], state, updatedAt: dateStr, name: state.project || state.client || '이름 없음' };
      saveHistory(list);
      renderHistoryList();
      return currentHistoryId;
    }
  }

  const id = `h_${Date.now()}`;
  const item = { id, name: state.project || state.client || '이름 없음', state, createdAt: dateStr, updatedAt: dateStr };
  list.unshift(item);
  if (list.length > HISTORY_MAX) list.pop();
  saveHistory(list);
  currentHistoryId = id;
  renderHistoryList();
  return id;
}

function loadFromHistory(id) {
  const list = getHistory();
  const item = list.find(h => h.id === id);
  if (!item) return;
  applyProjectState(item.state);
  currentHistoryId = id;
  renderHistoryList();
  showToast(`📂 "${item.name}" 불러왔습니다`);
}



function vaultReset() {
  // 기존 vault 파일 데이터 전체 삭제
  const folders = vaultGetFolders();
  folders.forEach(f => {
    vaultGetFiles(f.id).forEach(fname => _ls.remove(VAULT_FILE(f.id, fname)));
  });
  _ls.remove(VAULT_KEY);
  // 상태 초기화
  vaultActiveFolderId = null;
  vaultActiveFile     = null;
  vaultDirty          = false;
  // 빌트인 폴더/파일로 재초기화
  vaultInit();
  // 에디터 빈 상태로 복원
  const empty = document.getElementById('vault-editor-empty');
  const main  = document.getElementById('vault-editor-main');
  if (empty) empty.style.display = 'flex';
  if (main)  main.style.display  = 'none';
  const outlineList = document.getElementById('vault-outline-list');
  if (outlineList) outlineList.innerHTML = '<div class="vault-outline-empty">파일을 열면<br>목차가 표시됩니다</div>';
  const outlineStats = document.getElementById('vault-outline-stats');
  if (outlineStats) outlineStats.style.display = 'none';
  const si = document.getElementById('vault-search-input');
  if (si) { si.value = ''; _vaultSearchQ = ''; }
}

function newProject() {
  // 현재 작업이 있으면 자동 저장
  const state = getProjectState();
  const hasContent = state.project || state.client || promptPages.length > 0 || promptSections.length > 0;
  if (hasContent) saveCurrentToHistory(false);
  // 폼 초기화
  clearPromptForm();
  currentHistoryId = null;

  // 슬롯 전체 초기화 (데이터 + 폴더 구조 리셋)
  const slotFolders = getFolders();
  slotFolders.forEach(f => {
    for (let i = 1; i <= (f.slotCount || SLOT_MAX); i++) {
      _ls.remove(getSlotKey(f.id, i));
    }
  });
  _ls.remove(FOLDERS_KEY);
  currentSlot = null;
  activeFolderId = null;
  ensureDefaultFolder();
  updateSlotUI();

  // MD Vault 초기화
  vaultReset();

  // 새 프로젝트를 빈 상태로 히스토리에 즉시 추가
  const now = new Date();
  const dateStr = now.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const id = `h_${Date.now()}`;
  const defaultName = '새 프로젝트';
  const emptyState = getProjectState();
  const list = getHistory();
  list.unshift({ id, name: defaultName, state: emptyState, createdAt: dateStr, updatedAt: dateStr });
  if (list.length > HISTORY_MAX) list.pop();
  saveHistory(list);
  currentHistoryId = id;

  renderHistoryList();
  // AI 프롬프트 탭으로 이동
  showPage('prompt');
  showToast('✨ 새 프로젝트를 시작합니다');
  // 이름 바로 편집 모드 진입
  setTimeout(() => startRenameHistory(id, { stopPropagation: () => {} }), 80);
}

function renderHistoryList() {
  const el = document.getElementById('history-list');
  if (!el) return;
  const list = getHistory();
  if (list.length === 0) {
    el.innerHTML = '<div class="sidebar-empty">저장된 프로젝트가 없습니다.<br>작업 후 자동 저장됩니다.</div>';
    return;
  }
  el.innerHTML = list.map(item => `
    <div class="history-item ${item.id === currentHistoryId ? 'active' : ''}" onclick="loadFromHistory('${item.id}')" ondblclick="startRenameHistory('${item.id}', event)">
      <div class="history-item-name" id="hname-${item.id}">${escapeHtml(item.name)}</div>
      <input class="history-item-rename" id="hrename-${item.id}"
        value="${escapeHtml(item.name)}"
        onclick="event.stopPropagation()"
        onkeydown="handleRenameKey('${item.id}', event)"
        onblur="commitRename('${item.id}')" />
      <div class="history-item-meta">${item.updatedAt}</div>
      <button class="history-item-del" onclick="deleteFromHistory('${item.id}', event)" title="삭제">×</button>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function startRenameHistory(id, e) {
  e.stopPropagation();
  const nameEl = document.getElementById('hname-' + id);
  const inputEl = document.getElementById('hrename-' + id);
  if (!nameEl || !inputEl) return;
  nameEl.style.display = 'none';
  inputEl.style.display = 'block';
  inputEl.focus();
  inputEl.select();
}

function commitRename(id) {
  const nameEl = document.getElementById('hname-' + id);
  const inputEl = document.getElementById('hrename-' + id);
  if (!nameEl || !inputEl) return;
  const newName = inputEl.value.trim() || '이름 없음';
  // localStorage 업데이트
  const list = getHistory();
  const idx = list.findIndex(h => h.id === id);
  if (idx !== -1) {
    list[idx].name = newName;
    saveHistory(list);
  }
  nameEl.textContent = newName;
  nameEl.style.display = '';
  inputEl.style.display = 'none';
}

function handleRenameKey(id, e) {
  if (e.key === 'Enter') { e.preventDefault(); commitRename(id); }
  if (e.key === 'Escape') {
    const list = getHistory();
    const item = list.find(h => h.id === id);
    const inputEl = document.getElementById('hrename-' + id);
    const nameEl = document.getElementById('hname-' + id);
    if (inputEl && item) inputEl.value = item.name;
    if (nameEl) { nameEl.style.display = ''; }
    if (inputEl) inputEl.style.display = 'none';
  }
}

// 페이지 이탈 전 자동 저장 (새로고침/탭 닫기)
window.addEventListener('beforeunload', () => {
  const state = getProjectState();
  const hasContent = state.project || state.client || promptPages.length > 0 || promptSections.length > 0;
  if (hasContent) saveCurrentToHistory(false);
});

// ══════════════════════════════════
// 실시간 자동저장
// ══════════════════════════════════
let _autoSaveTimer = null;

function triggerAutoSave() {
  // 활성 프로젝트 없으면 자동으로 새 히스토리 항목 생성
  if (!currentHistoryId) {
    const state = getProjectState();
    const hasContent = state.project || state.client || (promptPages && promptPages.length > 0);
    if (!hasContent) return;
    saveCurrentToHistory(true);
  }
  const dot = document.getElementById('autosave-dot');
  if (dot) { dot.classList.remove('saved'); dot.classList.add('saving'); }
  clearTimeout(_autoSaveTimer);
  
  _autoSaveTimer = setTimeout(() => {
    saveCurrentToHistory(false);
    if (dot) { dot.classList.remove('saving'); dot.classList.add('saved'); }
    setTimeout(() => { if (dot) dot.classList.remove('saved'); }, 3000);
  }, 800);
}

function attachAutoSaveListeners() {
  const containers = ['page-dashboard', 'page-prompt', 'page-generator'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.addEventListener('input', triggerAutoSave);
      container.addEventListener('change', triggerAutoSave);
      // 👇 버튼 클릭(페이지/섹션 추가 등) 시에도 무조건 자동저장 발동!
      container.addEventListener('click', triggerAutoSave); 
    }
  });
}

