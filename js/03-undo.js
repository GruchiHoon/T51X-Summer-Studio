/* ── 03-undo — Undo/Redo 스택 ── */

// ══════════════════════════════════
// UNDO STACK (Ctrl+Z)
// ══════════════════════════════════
const _undoStack = [];
const UNDO_MAX = 50;

function _snapState() {
  return {
    pages: JSON.parse(JSON.stringify(promptPages)),
    pageSections: JSON.parse(JSON.stringify(pageSections)),
    activeTab: _activePageTab
  };
}
function pushUndoState() {
  _undoStack.push(_snapState());
  if (_undoStack.length > UNDO_MAX) _undoStack.shift();
}
function undoLastAction() {
  if (_undoStack.length === 0) { showToast('↩ 되돌릴 내용이 없습니다'); return; }
  const prev = _undoStack.pop();
  promptPages    = prev.pages;
  pageSections   = prev.pageSections;
  _activePageTab = prev.activeTab;
  // 삭제된 페이지 탭이 활성이었으면 첫 페이지로
  if (_activePageTab && !promptPages.find(p => p.id === _activePageTab)) {
    _activePageTab = promptPages[0]?.id || null;
  }
  renderPromptPageList();
  renderPageSectionTabs();
  triggerAutoSave();
  showToast('↩ 되돌렸습니다');
}

