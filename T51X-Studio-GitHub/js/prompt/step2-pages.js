/* ── prompt/step2-pages.js
   스텝 2: 페이지 구성
   - HTML 템플릿 + 페이지 추가·삭제·편집·하위페이지 로직
   ▸ sitemap import, 페이지 템플릿 등 새 컴포넌트는 renderStep2() 안에 추가
─────────────────────────────────────────────────────── */

function renderStep2() {
  return /* html */`
    <div class="card-title" style="margin-bottom:6px">
      ② 페이지 구성
      <span style="color:var(--muted);font-size:11px;text-transform:none;letter-spacing:0">
        여러 페이지를 추가해서 한 번에 프롬프트 생성
      </span>
      <span id="page-counter" class="section-counter"></span>
    </div>
    <div id="prompt-page-list" class="section-list"></div>
    <div class="add-section-row" style="align-items:flex-end;margin-top:10px">
      <div style="display:flex;flex-direction:column;gap:4px;flex:0 0 74px">
        <label style="margin-bottom:0">페이지 ID</label>
        <input id="new-p-id" placeholder="01, 02 ...">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex:1">
        <label style="margin-bottom:0">페이지명</label>
        <input id="new-p-name" placeholder="Home, About Us ...">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex:2">
        <label style="margin-bottom:0">특이사항 (선택)</label>
        <input id="new-p-note" placeholder="이 페이지만의 특이사항">
      </div>
      <button class="btn btn-ghost" onclick="addPromptPage()" style="white-space:nowrap;flex-shrink:0">+ 추가</button>
    </div>
    <div class="hint" style="margin-top:10px">
      💡 각 페이지 항목의 <strong style="color:var(--accent2)">＋ 하위</strong> 버튼을 클릭하면
      하위 페이지(2뎁스)를 바로 추가할 수 있습니다.
    </div>
  `;
}

/* ── 페이지 렌더링 ── */
function renderPromptPageList() {
  const el = document.getElementById('prompt-page-list');
  if (!el) return;
  if (promptPages.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:10px 0">페이지를 추가하세요 (여러 개 가능)</div>';
  } else {
    el.innerHTML = promptPages.map((p, i) => {
      const isSub = !!p.parentId;
      const subClass = isSub ? ' sub-page' : '';
      const badgeStyle = isSub
        ? 'class="sub-page-badge"'
        : 'class="section-badge" style="background:#1a2e20;color:#5dca80;min-width:36px;text-align:center"';
      const addSubBtn = !isSub
        ? `<button class="add-sub-page-btn" onclick="openAddSubPage(${i})" title="하위 페이지 추가">＋ 하위</button>`
        : '';
      return `
        <div class="section-item${subClass}" title="더블클릭으로 수정" ondblclick="editPageItem(${i})">
          ${isSub ? '<span style="color:var(--accent);font-size:11px;flex-shrink:0">↳</span>' : ''}
          <span ${badgeStyle}>${escapeHtml(p.id)}</span>
          <span class="section-name" style="font-weight:600">${escapeHtml(p.name)}</span>
          <span class="section-note">${escapeHtml(p.note || '')}</span>
          ${addSubBtn}
          <button class="section-del" onclick="removePromptPage(${i})">×</button>
        </div>
      `;
    }).join('');
  }
  updateCounters();
}

function openAddSubPage(parentIdx) {
  const parent = promptPages[parentIdx];
  if (!parent) return;
  const existing = document.getElementById('sub-page-inline-form');
  if (existing) existing.remove();
  const el = document.getElementById('prompt-page-list');
  const items = el.querySelectorAll('.section-item');
  let insertAfterIdx = parentIdx;
  for (let j = parentIdx + 1; j < promptPages.length; j++) {
    if (promptPages[j].parentId === parent.id) insertAfterIdx = j;
    else break;
  }
  const form = document.createElement('div');
  form.id = 'sub-page-inline-form';
  form.style.cssText = 'margin-left:20px;border-left:2px solid var(--accent);padding:10px 12px;background:#14141a;border-radius:0 6px 6px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:4px;margin-bottom:4px';
  form.innerHTML = `
    <span style="font-size:10px;color:var(--accent2);font-weight:700;white-space:nowrap">↳ ${escapeHtml(parent.name)}의 하위 페이지</span>
    <input id="sub-p-id" placeholder="ID (예: 03-D)" style="width:80px;background:var(--surface2);border:1px solid var(--accent);border-radius:5px;color:var(--text);font-size:12px;padding:5px 8px;outline:none;font-family:inherit">
    <input id="sub-p-name" placeholder="페이지명 (예: Works Detail)" style="flex:1;min-width:100px;background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:12px;padding:5px 8px;outline:none;font-family:inherit">
    <input id="sub-p-note" placeholder="특이사항 (선택)" style="flex:2;min-width:120px;background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:12px;padding:5px 8px;outline:none;font-family:inherit">
    <button class="btn btn-ghost" style="font-size:11px;padding:5px 12px;border-color:var(--accent);color:var(--accent2)" onclick="commitAddSubPage('${parent.id}', ${insertAfterIdx})">＋ 추가</button>
    <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px" onclick="document.getElementById('sub-page-inline-form').remove()">✕</button>
  `;
  const refItem = items[insertAfterIdx];
  if (refItem && refItem.nextSibling) el.insertBefore(form, refItem.nextSibling);
  else el.appendChild(form);
  document.getElementById('sub-p-id').focus();
  form.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') commitAddSubPage(parent.id, insertAfterIdx);
      if (e.key === 'Escape') form.remove();
    });
  });
}

function commitAddSubPage(parentId, insertAfterIdx) {
  const id   = (document.getElementById('sub-p-id')?.value || '').trim();
  const name = (document.getElementById('sub-p-name')?.value || '').trim();
  const note = (document.getElementById('sub-p-note')?.value || '').trim();
  if (!id || !name) { showToast('❌ 하위 페이지 ID와 이름을 입력하세요'); return; }
  if (promptPages.find(p => p.id === id)) { showToast('❌ 이미 사용 중인 ID입니다'); return; }
  pushUndoState();
  promptPages.splice(insertAfterIdx + 1, 0, { id, name, note, parentId });
  if (!pageSections[id]) pageSections[id] = [];
  document.getElementById('sub-page-inline-form')?.remove();
  renderPromptPageList();
  renderPageSectionTabs();
  triggerAutoSave();
  showToast(`✅ 하위 페이지 "${name}" 추가됨`);
}

function editPageItem(i) {
  const p = promptPages[i];
  if (!p) return;
  const el = document.getElementById('prompt-page-list');
  const items = el.querySelectorAll('.section-item');
  const item = items[i];
  if (!item || item.querySelector('input')) return;
  pushUndoState();
  item.innerHTML = `
    <input class="page-inline-input" id="pedit-id-${i}" value="${escapeHtml(p.id)}" placeholder="ID" style="width:52px;flex-shrink:0">
    <input class="page-inline-input" id="pedit-name-${i}" value="${escapeHtml(p.name)}" placeholder="페이지명" style="flex:1">
    <input class="page-inline-input" id="pedit-note-${i}" value="${escapeHtml(p.note||'')}" placeholder="특이사항" style="flex:2">
    <button class="section-del" style="background:#1a3d30;color:var(--green);border-radius:4px" onclick="commitPageEdit(${i})">✓</button>
    <button class="section-del" onclick="renderPromptPageList()">✕</button>
  `;
  item.ondblclick = null;
  const nameInput = document.getElementById('pedit-name-' + i);
  if (nameInput) { nameInput.focus(); nameInput.select(); }
  item.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') commitPageEdit(i);
      if (e.key === 'Escape') renderPromptPageList();
    });
  });
}

function commitPageEdit(i) {
  const idVal   = (document.getElementById('pedit-id-' + i)?.value || '').trim();
  const nameVal = (document.getElementById('pedit-name-' + i)?.value || '').trim();
  const noteVal = (document.getElementById('pedit-note-' + i)?.value || '').trim();
  if (!idVal || !nameVal) { showToast('❌ ID와 이름은 필수입니다'); return; }
  const oldId = promptPages[i].id;
  if (oldId !== idVal && pageSections[oldId]) {
    pageSections[idVal] = pageSections[oldId];
    delete pageSections[oldId];
    if (_activePageTab === oldId) _activePageTab = idVal;
  }
  promptPages[i] = { id: idVal, name: nameVal, note: noteVal, ...(promptPages[i].parentId ? { parentId: promptPages[i].parentId } : {}) };
  renderPromptPageList();
  renderPageSectionTabs();
  triggerAutoSave();
  showToast('✅ 수정됐습니다');
}

function addPromptPage() {
  const id   = document.getElementById('new-p-id').value.trim();
  const name = document.getElementById('new-p-name').value.trim();
  const note = document.getElementById('new-p-note').value.trim();
  if (!id || !name) { showToast('❌ 페이지 ID와 이름을 입력하세요'); return; }
  pushUndoState();
  promptPages.push({ id, name, note });
  if (!pageSections[id]) pageSections[id] = [];
  renderPromptPageList();
  renderPageSectionTabs();
  document.getElementById('new-p-id').value   = '';
  document.getElementById('new-p-name').value = '';
  document.getElementById('new-p-note').value = '';
  document.getElementById('new-p-id').focus();
  triggerAutoSave();
}

function removePromptPage(i) {
  pushUndoState();
  const removed = promptPages[i];
  promptPages.splice(i, 1);
  if (removed && pageSections[removed.id]) delete pageSections[removed.id];
  if (_activePageTab === removed?.id) _activePageTab = promptPages[0]?.id || null;
  renderPromptPageList();
  renderPageSectionTabs();
  triggerAutoSave();
}
