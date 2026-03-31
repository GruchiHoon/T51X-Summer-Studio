/* ── prompt/step3-sections.js
   스텝 3: 섹션 구성
   - HTML 템플릿 + 섹션 추가·삭제·편집·드래그 로직
   ▸ 새 섹션 타입 추가 시 renderStep3()의 <select> 옵션에만 추가하면 됨
   ▸ renderSectionList, editSectionItem, bindSectionDrag 등 공유 함수 포함
─────────────────────────────────────────────────────── */

function renderStep3() {
  return /* html */`
    <div class="card-title" style="margin-bottom:8px">
      ③ 섹션 구성
      <span style="color:var(--muted);font-size:11px;text-transform:none;letter-spacing:0">
        페이지별로 섹션을 따로 구성하세요
      </span>
      <span id="section-counter" class="section-counter"></span>
    </div>
    <div id="section-no-pages" class="page-sec-empty" style="display:none">
      ② 페이지 구성 단계에서 페이지를 먼저 추가하세요.<br>
      페이지를 추가하면 각 페이지별로 섹션을 따로 구성할 수 있습니다.
    </div>
    <div id="section-page-tabs-wrap" style="display:none">
      <div class="page-sec-tabs" id="page-sec-tabs"></div>
      <div id="section-list" class="section-list"></div>
      <div class="add-section-row" style="margin-top:8px">
        <select id="new-section-type">
          <option value="">섹션 유형 선택</option>
          <optgroup label="Hero">
            <option value="SL-hero-fullscreen">전체화면 Hero</option>
            <option value="SL-hero-split">좌우분할 Hero</option>
            <option value="SL-hero-image-overlay">이미지+오버레이 Hero</option>
          </optgroup>
          <optgroup label="본문">
            <option value="SL-content-twocol">좌우 2단 본문</option>
            <option value="SL-content-singlecol">단일 컬럼 본문</option>
            <option value="SL-content-quote">인용구 블록</option>
            <option value="커스텀">커스텀 (직접 입력)</option>
          </optgroup>
          <optgroup label="그리드">
            <option value="SL-grid-card3">3열 카드 그리드</option>
            <option value="SL-grid-card4">4열 카드 그리드</option>
            <option value="SL-grid-masonry">메이슨리 그리드</option>
          </optgroup>
          <optgroup label="기타">
            <option value="SL-stats-bar">수치 하이라이트 띠</option>
            <option value="SL-gallery-full">풀폭 갤러리</option>
            <option value="SL-form-contact">문의 폼</option>
            <option value="SL-form-apply">지원/신청 폼</option>
            <option value="SL-filter-tabs">필터 탭</option>
            <option value="SL-pagination">페이지네이션</option>
            <option value="SL-cta-banner">CTA 배너</option>
            <option value="SL-logo-strip">로고 띠</option>
            <option value="SL-list-table">테이블 리스트</option>
            <option value="SL-list-accordion">아코디언 리스트</option>
          </optgroup>
        </select>
        <input id="new-section-note" placeholder="섹션 제목 및 특이사항 (예: Hero 비주얼 / 100%×600px)">
        <button class="btn btn-ghost" onclick="addSection()" style="white-space:nowrap">+ 추가</button>
      </div>
      <div class="hint" style="margin-top:8px">
        💡 탭을 클릭해 페이지 전환. 각 페이지 섹션은 독립 저장됩니다. 드래그로 순서 변경 가능.
      </div>
    </div>
  `;
}

/* ── 섹션 탭 렌더링 ── */
function renderPageSectionTabs() {
  const noPages = document.getElementById('section-no-pages');
  const wrap    = document.getElementById('section-page-tabs-wrap');
  const tabsEl  = document.getElementById('page-sec-tabs');
  const listEl  = document.getElementById('section-list');
  if (!noPages || !wrap || !tabsEl || !listEl) return;

  if (promptPages.length === 0) {
    noPages.style.display = 'block';
    wrap.style.display    = 'none';
    updateCounters();
    return;
  }
  noPages.style.display = 'none';
  wrap.style.display    = 'block';

  if (!_activePageTab || !promptPages.find(p => p.id === _activePageTab)) {
    _activePageTab = promptPages[0].id;
  }

  const groups = [];
  promptPages.forEach(p => {
    if (!p.parentId) {
      groups.push({ parent: p, children: [] });
    } else {
      const g = groups.find(g => g.parent && g.parent.id === p.parentId);
      if (g) g.children.push(p);
      else groups.push({ parent: null, children: [p] });
    }
  });

  let tabsHtml = '<div class="page-sec-tabs-wrap">';
  groups.forEach(g => {
    tabsHtml += '<div style="display:flex;flex-direction:column;gap:3px">';
    if (g.parent) {
      const p = g.parent;
      const cnt = (pageSections[p.id] || []).length;
      const isActive = p.id === _activePageTab;
      tabsHtml += `<button class="page-sec-tab ${isActive ? 'active' : ''}"
        onclick="switchPageSectionTab('${p.id}')"
        title="${p.id} — ${p.name}">${escapeHtml(p.name + (cnt > 0 ? ' · ' + cnt : ''))}</button>`;
    }
    if (g.children.length > 0) {
      tabsHtml += '<div style="display:flex;gap:3px;flex-wrap:wrap;padding-left:8px;border-left:2px solid var(--accent)">';
      g.children.forEach(child => {
        const cnt = (pageSections[child.id] || []).length;
        const isActive = child.id === _activePageTab;
        tabsHtml += `<button class="page-sec-tab sub-tab ${isActive ? 'active' : ''}"
          onclick="switchPageSectionTab('${child.id}')"
          title="${child.id} — ${child.name}">${escapeHtml(child.name + (cnt > 0 ? ' · ' + cnt : ''))}</button>`;
      });
      tabsHtml += '</div>';
    }
    tabsHtml += '</div>';
  });
  tabsHtml += '</div>';
  tabsEl.innerHTML = tabsHtml;

  renderSectionList('section-list', pageSections[_activePageTab] || []);
  updateCounters();
}

function switchPageSectionTab(pageId) {
  _activePageTab = pageId;
  renderPageSectionTabs();
}

function addSection() {
  const type = document.getElementById('new-section-type').value;
  const note = document.getElementById('new-section-note').value.trim();
  if (!type) { showToast('❌ 섹션 유형을 선택하세요'); return; }
  pushUndoState();
  if (_activePageTab) {
    if (!pageSections[_activePageTab]) pageSections[_activePageTab] = [];
    pageSections[_activePageTab].push({ type, note });
    renderPageSectionTabs();
  } else {
    promptSections.push({ type, note });
    renderSectionList('section-list', promptSections);
  }
  document.getElementById('new-section-note').value = '';
  document.getElementById('new-section-type').value = '';
  triggerAutoSave();
}

function removeSection(listId, i) {
  pushUndoState();
  if (listId === 'section-list') {
    if (_activePageTab && pageSections[_activePageTab]) {
      pageSections[_activePageTab].splice(i, 1);
      renderPageSectionTabs();
    } else {
      promptSections.splice(i, 1);
      renderSectionList('section-list', promptSections);
    }
  } else {
    genSections.splice(i, 1);
    renderSectionList('gen-section-list', genSections);
  }
  triggerAutoSave();
}

/* ── 섹션 리스트 공통 렌더 (step3 + generator 공유) ── */
function renderSectionList(listId, sections) {
  const el = document.getElementById(listId);
  if (!el) return;
  if (sections.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:10px">섹션을 추가하세요</div>';
  } else {
    el.innerHTML = sections.map((s, i) => `
      <div class="section-item" draggable="true" data-list="${listId}" data-idx="${i}"
           title="더블클릭으로 수정" ondblclick="editSectionItem('${listId}',${i})">
        <span class="drag-handle" title="드래그로 순서 변경">⠿</span>
        <span class="section-badge">${s.type === '커스텀' ? 'CUSTOM' : s.type.replace('SL-','')}</span>
        <span class="section-name">${escapeHtml(s.note || (SL_SPECS[s.type] ? SL_SPECS[s.type].name : s.type))}</span>
        <button class="section-del" onclick="removeSection('${listId}', ${i})">×</button>
      </div>
    `).join('');
  }
  bindSectionDrag(listId, sections);
  updateCounters();
}

function editSectionItem(listId, i) {
  const arr = (listId === 'section-list')
    ? (_activePageTab && pageSections[_activePageTab] ? pageSections[_activePageTab] : promptSections)
    : genSections;
  const s = arr[i];
  if (!s) return;
  const el = document.getElementById(listId);
  const items = el.querySelectorAll('.section-item');
  const item = items[i];
  if (!item || item.querySelector('input') || item.querySelector('select')) return;
  pushUndoState();
  item.draggable = false;
  item.ondblclick = null;
  const typeGroups = [
    { group: 'Hero',  keys: ['SL-hero-fullscreen','SL-hero-split','SL-hero-image-overlay'] },
    { group: '본문',  keys: ['SL-content-twocol','SL-content-singlecol','SL-content-quote'] },
    { group: '그리드',keys: ['SL-grid-card3','SL-grid-card4','SL-grid-masonry'] },
    { group: '기타',  keys: ['SL-stats-bar','SL-gallery-full','SL-form-contact','SL-form-apply',
                              'SL-filter-tabs','SL-pagination','SL-cta-banner','SL-logo-strip',
                              'SL-list-table','SL-list-accordion','커스텀'] },
  ];
  const optionsHtml = typeGroups.map(g =>
    `<optgroup label="${g.group}">${g.keys.map(k =>
      `<option value="${k}" ${k === s.type ? 'selected' : ''}>${SL_SPECS[k] ? SL_SPECS[k].name : k}</option>`
    ).join('')}</optgroup>`
  ).join('');
  item.innerHTML = `
    <span class="drag-handle" style="color:var(--border)">⠿</span>
    <select id="sedit-type-${listId}-${i}" style="background:var(--surface2);border:1px solid var(--accent);border-radius:5px;color:var(--text);font-size:11px;padding:2px 4px;outline:none;flex-shrink:0;max-width:140px">${optionsHtml}</select>
    <input class="page-inline-input" id="sedit-note-${listId}-${i}" value="${escapeHtml(s.note||'')}" placeholder="특이사항" style="flex:1">
    <button class="section-del" style="background:#1a3d30;color:var(--green);border-radius:4px" onclick="commitSectionEdit('${listId}',${i})">✓</button>
    <button class="section-del" onclick="${listId === 'section-list' ? 'renderPageSectionTabs()' : `renderSectionList('${listId}', genSections)`}">✕</button>
  `;
  const inp = document.getElementById('sedit-note-' + listId + '-' + i);
  if (inp) {
    inp.focus(); inp.select();
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') commitSectionEdit(listId, i);
      if (e.key === 'Escape') {
        if (listId === 'section-list') renderPageSectionTabs();
        else renderSectionList(listId, genSections);
      }
    });
  }
}

function commitSectionEdit(listId, i) {
  const typeVal = (document.getElementById('sedit-type-' + listId + '-' + i)?.value || '').trim();
  const noteVal = (document.getElementById('sedit-note-' + listId + '-' + i)?.value || '').trim();
  const arr = (listId === 'section-list')
    ? (_activePageTab && pageSections[_activePageTab] ? pageSections[_activePageTab] : promptSections)
    : genSections;
  if (!arr[i]) return;
  arr[i] = { ...arr[i], ...(typeVal ? { type: typeVal } : {}), note: noteVal };
  if (listId === 'section-list') renderPageSectionTabs();
  else renderSectionList(listId, arr);
  triggerAutoSave();
  showToast('✅ 수정됐습니다');
}

/* ── 드래그 앤 드롭 ── */
let _dragSrcIdx = null;
let _dragListId = null;

function bindSectionDrag(listId, sections) {
  const el = document.getElementById(listId);
  if (!el) return;
  const items = el.querySelectorAll('.section-item');
  items.forEach(item => {
    item.addEventListener('dragstart', e => {
      _dragSrcIdx = parseInt(item.dataset.idx);
      _dragListId = item.dataset.list;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      el.querySelectorAll('.section-item').forEach(i => i.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      el.querySelectorAll('.section-item').forEach(i => i.classList.remove('drag-over'));
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', e => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const targetIdx = parseInt(item.dataset.idx);
      if (_dragSrcIdx === null || _dragSrcIdx === targetIdx || _dragListId !== listId) return;
      pushUndoState();
      let arr = (listId === 'section-list')
        ? (_activePageTab && pageSections[_activePageTab] ? pageSections[_activePageTab] : promptSections)
        : genSections;
      const moved = arr.splice(_dragSrcIdx, 1)[0];
      arr.splice(targetIdx, 0, moved);
      _dragSrcIdx = null;
      if (listId === 'section-list' && _activePageTab) renderPageSectionTabs();
      else renderSectionList(listId, arr);
      triggerAutoSave();
    });
  });
}

/* ── Generator용 섹션 추가 (07-generator.js에서 사용) ── */
function addGenSection() {
  const type = document.getElementById('gen-new-type').value;
  const note = document.getElementById('gen-new-note').value.trim();
  if (!type) { showToast('❌ 섹션 유형을 선택하세요'); return; }
  genSections.push({ type, note });
  renderSectionList('gen-section-list', genSections);
  document.getElementById('gen-new-note').value = '';
  document.getElementById('gen-new-type').value = '';
}
