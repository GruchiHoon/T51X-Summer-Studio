/* ── 08-dashboard — Sitemap 파싱, 대시보드, 프리셋 ── */

// ══════════════════════════════════
// DASHBOARD
// ══════════════════════════════════
let allPages = [];

const T51_SITEMAP = `| ID | 페이지명 | 섹션 수 | 기획 | 디자인 | 개발 | 우선순위 | 비고 |
|----|---------|--------|------|--------|------|--------|------|
| 01 | Home | 9 | ✅ done | ✅ done | 🚧 wip | P1 | 전체화면 슬라이드 |
| 02 | About Us | 4 | ✅ done | ✅ done | ✅ done | P1 |  |
| 03 | Works | 3 | ✅ done | 🚧 wip | ⬜ todo | P1 | 그리드+필터 |
| 03-D | Works Detail | 5 | ✅ done | ⬜ todo | ⬜ todo | P1 | 템플릿 재사용 |
| 04 | Story | 3 | ✅ done | ✅ done | ⬜ todo | P2 |  |
| 04-D | Story Detail | 3 | ✅ done | ⬜ todo | ⬜ todo | P2 | 블로그형 |
| 05 | T51 AI | 5 | ✅ done | 🚧 wip | ⬜ todo | P1 | AI 허브 |
| 05-D | AI Detail | 6 | 🚧 wip | ⬜ todo | ⬜ todo | P1 | 재사용 템플릿 |
| 06 | Recruit | 5 | ✅ done | ⬜ todo | ⬜ todo | P2 |  |
| 07 | Contact | 3 | ✅ done | ✅ done | ⬜ todo | P1 | 문의 폼 |`;

function loadT51Sample() {
  document.getElementById('sitemap-input').value = T51_SITEMAP;
  parseSitemap();
}

function parseSitemap() {
  const input = document.getElementById('sitemap-input').value;
  const lines = input.split('\n').filter(l => l.trim().startsWith('|') && !l.includes('---') && !l.toLowerCase().includes('페이지명') && !l.toLowerCase().includes('page'));
  
  // Detect format: new (기획/디자인/개발) vs legacy (상태 단일컬럼)
  const headerLine = input.split('\n').find(l => l.trim().startsWith('|') && (l.toLowerCase().includes('기획') || l.toLowerCase().includes('디자인') || l.toLowerCase().includes('개발')));
  const isNewFormat = !!headerLine;

  function parseStatus(raw) {
    const s = (raw || '').toLowerCase();
    if (s.includes('done') || s.includes('✅') || s.includes('완료') || s.includes('approved')) return 'done';
    if (s.includes('wip') || s.includes('🚧') || s.includes('review') || s.includes('진행')) return 'wip';
    if (s.includes('hold') || s.includes('🔴') || s.includes('보류')) return 'hold';
    return 'todo';
  }

  allPages = lines.map(line => {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 3) return null;
    const id = cols[0] || '';
    const name = cols[1] || '';
    const sections = parseInt(cols[2]) || 0;
    let planStatus, designStatus, devStatus, priority, note;
    if (isNewFormat) {
      // | ID | 페이지명 | 섹션 수 | 기획 | 디자인 | 개발 | 우선순위 | 비고 |
      planStatus   = parseStatus(cols[3]);
      designStatus = parseStatus(cols[4]);
      devStatus    = parseStatus(cols[5]);
      priority = cols[6]?.match(/P[123]/)?.[0] || '';
      note = cols[7] || '';
    } else {
      // Legacy: single status column
      const unified = parseStatus(cols[3]);
      planStatus = designStatus = devStatus = unified;
      priority = cols[4]?.match(/P[123]/)?.[0] || '';
      note = cols[5] || '';
    }
    // Overall status: worst-case
    const allStatuses = [planStatus, designStatus, devStatus];
    let status = 'done';
    if (allStatuses.includes('todo')) status = 'todo';
    else if (allStatuses.includes('wip')) status = 'wip';
    else if (allStatuses.includes('hold')) status = 'hold';
    return { id, name, sections, status, planStatus, designStatus, devStatus, priority, note };
  }).filter(Boolean);

  if (allPages.length === 0) { showToast('❌ 파싱 실패 — 표 형식을 확인하세요'); return; }
  renderDashboard(allPages);
  showToast(`✅ ${allPages.length}개 페이지 파싱 완료`);
}

function renderDashboard(pages) {
  const done = pages.filter(p => p.status === 'done').length;
  const wip = pages.filter(p => p.status === 'wip').length;
  const hold = pages.filter(p => p.status === 'hold').length;
  const todo = pages.filter(p => p.status === 'todo').length;
  const total = pages.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-wip').textContent = wip;
  document.getElementById('stat-hold').textContent = todo + hold;

  // Role-based counts
  const roles = ['plan', 'design', 'dev'];
  const keys  = ['planStatus', 'designStatus', 'devStatus'];
  roles.forEach((role, i) => {
    const key = keys[i];
    const doneN = pages.filter(p => p[key] === 'done').length;
    const wipN  = pages.filter(p => p[key] === 'wip').length;
    const todoN = pages.filter(p => p[key] === 'todo' || p[key] === 'hold').length;
    document.getElementById(`num-${role}-done`).textContent = doneN;
    document.getElementById(`num-${role}-wip`).textContent  = wipN;
    document.getElementById(`num-${role}-todo`).textContent = todoN;
  });

  document.getElementById('main-progress').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-detail').textContent = `완료 ${done} / 진행중 ${wip} / 미착수 ${todo}${hold > 0 ? ` / 보류 ${hold}` : ''} — 총 ${total}개`;

  renderPageTable(pages);
  document.getElementById('dashboard-output').style.display = 'block';
}

function renderPageTable(pages) {
  const tbody = document.getElementById('page-table-body');
  function roleSelect(pageIdx, role, current, onChange) {
    const cls = current === 'done' ? 'val-done' : current === 'wip' ? 'val-wip' : 'val-todo';
    return `<select class="role-status-select ${cls}" onchange="${onChange}">
      <option value="done" ${current==='done'?'selected':''}>✅ 완료</option>
      <option value="wip"  ${current==='wip' ?'selected':''}>🚧 진행중</option>
      <option value="todo" ${current==='todo'?'selected':''}>⬜ 미착수</option>
      <option value="hold" ${current==='hold'?'selected':''}>🔴 보류</option>
    </select>`;
  }
  function secRoleSelect(pageIdx, secIdx, role, current) {
    const cls = current === 'done' ? 'val-done' : current === 'wip' ? 'val-wip' : 'val-todo';
    return `<select class="sec-role-select ${cls}" onchange="updateSecStatus(${pageIdx},${secIdx},'${role}',this)">
      <option value="done" ${current==='done'?'selected':''}>✅ 완료</option>
      <option value="wip"  ${current==='wip' ?'selected':''}>🚧 진행중</option>
      <option value="todo" ${current==='todo'?'selected':''}>⬜ 미착수</option>
      <option value="hold" ${current==='hold'?'selected':''}>🔴 보류</option>
    </select>`;
  }
  let html = '';
  pages.forEach((p) => {
    const globalIdx = allPages.indexOf(p);
    const prio = p.priority === 'P1' ? `<span class="priority-p1">P1</span>`
      : p.priority === 'P2' ? `<span class="priority-p2">P2</span>`
      : p.priority ? `<span class="priority-p3">${p.priority}</span>` : '';
    const secCount = p.sections || 0;
    const secBtnLabel = secCount > 0 ? `<button class="sec-num-btn" onclick="toggleSecDetail(${globalIdx},event)" title="섹션별 세부 진행률 보기">${secCount}개 ▾</button>` : `<span style="color:var(--muted)">-</span>`;
    html += `<tr data-status="${p.status}" data-pageidx="${globalIdx}">
      <td><code style="font-size:12px;color:var(--accent2)">${p.id}</code></td>
      <td style="font-weight:600">${p.name}</td>
      <td style="text-align:center">${secBtnLabel}</td>
      <td>${roleSelect(globalIdx, 'planStatus', p.planStatus || 'todo', `updateRoleStatus(${globalIdx},'planStatus',this)`)}</td>
      <td>${roleSelect(globalIdx, 'designStatus', p.designStatus || 'todo', `updateRoleStatus(${globalIdx},'designStatus',this)`)}</td>
      <td>${roleSelect(globalIdx, 'devStatus', p.devStatus || 'todo', `updateRoleStatus(${globalIdx},'devStatus',this)`)}</td>
      <td>${prio}</td>
      <td style="color:var(--muted);font-size:12px">${p.note}</td>
    </tr>`;
    // 섹션 상세 행 (숨김 상태로 미리 삽입)
    if (secCount > 0) {
      const secs = p.secDetails || [];
      // secDetails 없으면 초기화
      if (!p.secDetails) {
        p.secDetails = Array.from({length: secCount}, (_, i) => ({
          name: `섹션 ${String(i+1).padStart(2,'0')}`,
          planStatus: 'todo', designStatus: 'todo', devStatus: 'todo'
        }));
      }
      const secRows = p.secDetails.map((sec, si) => {
        const pC = sec.planStatus === 'done' ? 'val-done' : sec.planStatus === 'wip' ? 'val-wip' : 'val-todo';
        const dC = sec.designStatus === 'done' ? 'val-done' : sec.designStatus === 'wip' ? 'val-wip' : 'val-todo';
        const vC = sec.devStatus === 'done' ? 'val-done' : sec.devStatus === 'wip' ? 'val-wip' : 'val-todo';
        return `<tr>
          <td style="color:var(--muted);font-size:10px;padding:4px 8px;width:60px">${String(si+1).padStart(2,'0')}</td>
          <td style="padding:4px 8px;cursor:text" ondblclick="startSecNameEdit(this,${globalIdx},${si})" title="더블클릭으로 이름 변경"><span class="sec-name-text" style="font-size:11px;color:var(--text);display:inline-block;min-width:60px;padding:2px 4px;border-radius:3px;border:1px solid transparent">${escapeHtml(sec.name)}</span></td>
          <td style="padding:4px 8px">${secRoleSelect(globalIdx, si, 'planStatus', sec.planStatus)}</td>
          <td style="padding:4px 8px">${secRoleSelect(globalIdx, si, 'designStatus', sec.designStatus)}</td>
          <td style="padding:4px 8px">${secRoleSelect(globalIdx, si, 'devStatus', sec.devStatus)}</td>
        </tr>`;
      }).join('');
      html += `<tr class="sec-detail-row" id="sec-detail-${globalIdx}" style="display:none">
        <td colspan="8">
          <div class="sec-detail-wrap">
            <div class="sec-detail-title">📋 ${p.name} — 섹션별 세부 진행률</div>
            <table class="sec-detail-table">
              <thead><tr><th>#</th><th>섹션명</th><th>기획</th><th>디자인</th><th>개발</th></tr></thead>
              <tbody>${secRows}</tbody>
            </table>
          </div>
        </td>
      </tr>`;
    }
  });
  tbody.innerHTML = html;
}

function toggleSecDetail(pageIdx, e) {
  e.stopPropagation();
  const row = document.getElementById('sec-detail-' + pageIdx);
  if (!row) return;
  const isHidden = row.style.display === 'none';
  row.style.display = isHidden ? 'table-row' : 'none';
  // 버튼 화살표 토글
  const btn = document.querySelector(`tr[data-pageidx="${pageIdx}"] .sec-num-btn`);
  if (btn) {
    const p = allPages[pageIdx];
    btn.innerHTML = isHidden
      ? `${p.sections}개 ▴`
      : `${p.sections}개 ▾`;
  }
}

function updateSecName(pageIdx, secIdx, name) {
  if (!allPages[pageIdx].secDetails) return;
  allPages[pageIdx].secDetails[secIdx].name = name;
}

function startSecNameEdit(td, pageIdx, secIdx) {
  // 이미 편집 중이면 무시
  if (td.querySelector('input')) return;
  const span = td.querySelector('.sec-name-text');
  if (!span) return;
  const currentName = allPages[pageIdx]?.secDetails?.[secIdx]?.name || span.textContent;

  const input = document.createElement('input');
  input.value = currentName;
  input.style.cssText = 'background:var(--surface2);border:1px solid var(--accent);border-radius:4px;color:var(--text);font-size:11px;width:100%;outline:none;font-family:inherit;padding:2px 6px;box-sizing:border-box;';

  function commit() {
    const newName = input.value.trim() || currentName;
    updateSecName(pageIdx, secIdx, newName);
    span.textContent = newName;
    if (td.contains(input)) td.replaceChild(span, input);
    span.style.borderColor = 'transparent';
    showToast('✏️ 섹션명 변경: ' + newName);
  }

  function cancel() {
    if (td.contains(input)) td.replaceChild(span, input);
    span.style.borderColor = 'transparent';
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.removeEventListener('blur', commit); cancel(); }
  });
  input.addEventListener('dblclick', e => e.stopPropagation());

  span.style.borderColor = 'var(--accent)';
  td.replaceChild(input, span);
  input.focus();
  input.select();
}

function updateSecStatus(pageIdx, secIdx, role, selectEl) {
  const val = selectEl.value;
  if (!allPages[pageIdx].secDetails) return;
  allPages[pageIdx].secDetails[secIdx][role] = val;
  selectEl.className = 'sec-role-select ' + (val === 'done' ? 'val-done' : val === 'wip' ? 'val-wip' : 'val-todo');
}

function filterPages(status) {
  const pages = status === 'all' ? allPages : allPages.filter(p => p.status === status);
  renderPageTable(pages);
}

function updateRoleStatus(idx, role, selectEl) {
  const val = selectEl.value;
  allPages[idx][role] = val;
  // Update overall status (worst-case)
  const p = allPages[idx];
  const all = [p.planStatus, p.designStatus, p.devStatus];
  if (all.every(s => s === 'done')) p.status = 'done';
  else if (all.includes('wip')) p.status = 'wip';
  else if (all.includes('hold')) p.status = 'hold';
  else p.status = 'todo';
  // Update select styling
  selectEl.className = 'role-status-select ' + (val === 'done' ? 'val-done' : val === 'wip' ? 'val-wip' : 'val-todo');
  // Recompute dashboard stats only (no table re-render to preserve focus)
  const done = allPages.filter(p => p.status === 'done').length;
  const wip  = allPages.filter(p => p.status === 'wip').length;
  const hold = allPages.filter(p => p.status === 'hold').length;
  const todo = allPages.filter(p => p.status === 'todo').length;
  const total = allPages.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-wip').textContent  = wip;
  document.getElementById('stat-hold').textContent = todo + hold;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('main-progress').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-detail').textContent = `완료 ${done} / 진행중 ${wip} / 미착수 ${todo}${hold > 0 ? ` / 보류 ${hold}` : ''} — 총 ${total}개`;
  const roles = ['plan', 'design', 'dev'];
  const keys  = ['planStatus', 'designStatus', 'devStatus'];
  roles.forEach((r, i) => {
    const key = keys[i];
    document.getElementById(`num-${r}-done`).textContent = allPages.filter(p => p[key] === 'done').length;
    document.getElementById(`num-${r}-wip`).textContent  = allPages.filter(p => p[key] === 'wip').length;
    document.getElementById(`num-${r}-todo`).textContent = allPages.filter(p => p[key] === 'todo' || p[key] === 'hold').length;
  });
}

function clearDashboard() {
  document.getElementById('sitemap-input').value = '';
  document.getElementById('dashboard-output').style.display = 'none';
  allPages = [];
}

function exportReport() {
  if (allPages.length === 0) { showToast('❌ 먼저 sitemap을 파싱하세요'); return; }
  const done = allPages.filter(p => p.status === 'done').length;
  const pct = Math.round((done / allPages.length) * 100);
  const today = new Date().toISOString().slice(0,10);
  const content = `# 프로젝트 진행 보고서
생성일: ${today}

## 진행률: ${pct}% (${done}/${allPages.length})

| ID | 페이지명 | 섹션 | 상태 | 우선순위 | 비고 |
|----|---------|------|------|--------|------|
${allPages.map(p => `| ${p.id} | ${p.name} | ${p.sections} | ${p.status} | ${p.priority} | ${p.note} |`).join('\n')}
`;
  downloadFile(content, `progress-report-${today}.md`);
}

// ══════════════════════════════════
// PRESETS
// ══════════════════════════════════
function loadT51HomePreset() {
  // ── 전체 페이지 구성 (01 Home ~ 07 Contact + 상세 페이지) ──
  promptPages = [
    { id: '01',   name: 'Home',              note: '전체화면 슬라이드 9개 시퀀스. 한 화면에 합치지 말 것.' },
    { id: '02',   name: 'About Us',          note: '스크롤 페이지 / Contact Us 섹션 포함하지 않음' },
    { id: '03',   name: 'Works',             note: '스크롤 페이지 / 카드 클릭 → Works Project Detail 이동' },
    { id: '03-D', name: 'Works Detail',      note: '스크롤 가능 / Works 그리드 카드 클릭 시 진입', parentId: '03' },
    { id: '04',   name: 'Story',             note: '스크롤 페이지 / 카드 클릭 → Story Detail 이동' },
    { id: '04-D', name: 'Story Detail',      note: '블로그/브런치 형식 / 단일 컬럼 중심 / 최대 폭 800px', parentId: '04' },
    { id: '05',   name: 'T51 AI',            note: 'AI 허브 페이지 / Contact Us 섹션 포함하지 않음' },
    { id: '05-D', name: 'T51 AI Detail',     note: 'AI 프로젝트 상세 페이지 템플릿 / Contact Us 미포함', parentId: '05' },
    { id: '06',   name: 'Recruit',           note: '스크롤 가능' },
    { id: '07',   name: 'Contact',           note: '스크롤 가능' },
  ];
  renderPromptPageList();

  // ── 공통 푸터 설정 (T51형) ──
  document.getElementById('p-footer-type').value    = '2단 — 로고+메뉴(좌) / 회사정보+SNS(우) (T51형)';
  document.getElementById('p-footer-height').value  = '약 200px';
  document.getElementById('p-footer-logo').value    = '텍스트 로고 박스 [ LOGO ]';
  document.getElementById('p-footer-sns').value     = '[ICON] × 3개';
  document.getElementById('p-footer-privacy').value = '포함';
  document.getElementById('footer-custom-row').style.display = 'none';

  // ── 페이지별 섹션 정의 ──

  // 01 — Home (9개 전체화면 슬라이드)
  const sec01 = [
    { type: 'SL-hero-fullscreen', note: 'Home-01 인트로 / [ 0 ] 400×200px 점선 / 하단 라벨 12px 회색' },
    { type: 'SL-hero-fullscreen', note: 'Home-02 T51 등장 포인트 / [ 51 ] 400×200px 실선 (멈춤 상태)' },
    { type: '커스텀',              note: 'Home-03 51 내부 Zoom-in / 배경 #EEEEEE + 원형 뷰포트 박스 600px 점선' },
    { type: 'SL-hero-fullscreen', note: 'Home-04 T51 브랜드 슬로건 / T51 박스 300×60px + 슬로건 800×120px 점선' },
    { type: '커스텀',              note: 'Home-05 T51X 진입 시그널 / 배경 #EEEEEE + 대형 X 쉐입 600px 대각선 점선×2' },
    { type: 'SL-hero-fullscreen', note: 'Home-06 T51X 브랜드 슬로건 / T51X 박스 300×60px + 슬로건 800×120px 점선' },
    { type: 'SL-hero-split',      note: 'Home-07 작업 방향성 / 좌: T51 & T51X 라벨 + Lorem ipsum 3~4줄 / 우: 이미지' },
    { type: '커스텀',              note: 'Home-08 51과 X 결합 / [ 51 ] → [ X ] → [ 51X ] 결합 표현 400×150px 굵은 테두리' },
    { type: '커스텀',              note: 'Home-09 최종 통합 비주얼 / 배경 #EEEEEE + 비주얼 1200×500px + 슬로건 800×80px' },
  ];

  // 02 — About Us
  const sec02 = [
    { type: 'SL-hero-image',   note: 'About-01 Hero / 100%×400px 이미지 + 오버레이 "About Us" 48px 굵게 + 서브 18px' },
    { type: 'SL-hero-split',   note: 'About-02 Who We Are / 좌: "Who We Are" 24px + 본문 4~5줄×2단 / 우: 이미지 100%×320px' },
    { type: 'SL-grid-card2',   note: 'About-03 T51 & T51X 소개 / 좌카드: 이미지+T51 제목+본문 / 우카드: 이미지+T51X 제목+본문 / 각 카드 폭 48%' },
    { type: 'SL-stats',        note: 'About-04 수치 하이라이트 / 배경 #F5F5F5 높이 160px / 4항목 균등: 연혁·프로젝트·클라이언트·팀원 (00+)' },
  ];

  // 03 — Works
  const sec03 = [
    { type: 'SL-filter-tabs',  note: 'Works-01 Header/Filter / "Works" 32px + SORT BY ▼ 드롭다운 + ALL / POPULAR / RECENT / TOP RATED 탭' },
    { type: 'SL-grid-card3',   note: 'Works-02 Project Grid / 카드 560×340px / 이미지 80%+프로젝트명 20% / 클릭 → Works Detail' },
    { type: 'SL-pagination',   note: 'Works-03 Pagination / [ < ] 1 2 3 … 9 [ > ] 중앙 정렬' },
  ];

  // 03-D — Works Project Detail
  const sec03D = [
    { type: 'SL-hero-image',   note: 'Works-Detail-01 Hero 비주얼 / 100%×600px / 좌하단 오버레이: 프로젝트명 48px + 태그 박스 + 연도' },
    { type: '커스텀',           note: 'Works-Detail-02 프로젝트 개요 / 좌30%: Overview 테이블(Client·Category·Year·Role) / 우65%: Description 5~6줄' },
    { type: 'SL-hero-split',   note: 'Works-Detail-03 Creative Direction / 소제목+수평선 / 좌: 본문 4~5줄 / 우: 이미지 100%×400px' },
    { type: '커스텀',           note: 'Works-Detail-04 Visual Output / 풀폭 700px → 2열 각48%×480px → 풀폭 700px → 3열 각31%×320px' },
    { type: 'SL-grid-card3',   note: 'Works-Detail-05 Related Projects / 3열 카드 폭30%×280px / 이미지80%+프로젝트명+클라이언트명' },
  ];

  // 04 — Story
  const sec04 = [
    { type: 'SL-filter-tabs',  note: 'Story-01 Header/Category Tab / "Story" 32px + ALL / CULTURE / INSIGHT 탭' },
    { type: 'SL-grid-card3',   note: 'Story-02 Content Grid / 카드 420×300px / 썸네일60%+카테고리+날짜+제목2줄+댓글수 / 클릭 → Story Detail' },
    { type: 'SL-pagination',   note: 'Story-03 Pagination / [ < ] 1 2 3 … [ > ] 중앙 정렬' },
  ];

  // 04-D — Story Detail
  const sec04D = [
    { type: '커스텀',           note: 'Story-Detail-01 Hero/타이틀 / 카테고리 태그+날짜 → 대제목 36~42px → 서브 18px → 작성자 아바타+이름+날짜 → 대표 이미지 100%×500px' },
    { type: '커스텀',           note: 'Story-Detail-02 본문 콘텐츠 / 최대 800px 단일 컬럼 / 텍스트·소제목·인용구·이미지(본문폭/풀폭/2열)·태그 블록 조합' },
    { type: 'SL-hero-split',   note: 'Story-Detail-03 이전/다음 글 / 수평선 / 좌: ← 이전 글 제목+썸네일 140px / 우: 다음 글 → 제목+썸네일 140px' },
  ];

  // 05 — T51 AI
  const sec05 = [
    { type: 'SL-hero-image',   note: 'T51AI-01 Hero / 100%×480px + 중앙 오버레이: AI Projects 태그 + "T51 AI" 64px + 서브 20px + 프로젝트 살펴보기 버튼 220×52px' },
    { type: 'SL-hero-split',   note: 'T51AI-02 AI 비전 소개 / 좌50%: Our AI Vision 28px + 본문 4~5줄×2 + 더알아보기 버튼 / 우50%: 이미지 100%×360px' },
    { type: 'SL-stats',        note: 'T51AI-03 수치 하이라이트 / 배경 #F5F5F5 높이 160px / 4항목: AI프로젝트·적용서비스·처리데이터·사용고객 (00+)' },
    { type: 'SL-grid-card3',   note: 'T51AI-04 AI 프로젝트 그리드 / ALL·LIVE·COMING SOON 필터 탭 / 카드: 이미지+상태뱃지+프로젝트명+카테고리+설명+출시연도+자세히보기 / 신규 추가 주석 표기' },
    { type: '커스텀',           note: 'T51AI-05 기술스택/파트너십 / 배경 흰색 상하 1px 선 높이 100px / Technology & Partners 좌측 + [LOGO]×6개 가로 나열 120×40px' },
  ];

  // 05-D — T51 AI Project Detail
  const sec05D = [
    { type: 'SL-hero-image',   note: 'T51AI-D-01 Hero / 100%×480px / 좌하단 오버레이: 상태뱃지 + 프로젝트명 52px + 카테고리 태그 + 서브 18px + Since 연도' },
    { type: '커스텀',           note: 'T51AI-D-02 프로젝트 개요 / 좌30%: Overview 테이블(Project·Category·Status·Launch·Platform) / 우65%: Description 5~6줄' },
    { type: 'SL-grid-card3',   note: 'T51AI-D-03 Key Features / 카드 3열 균등 / 각 카드: ICON 64×64px + 제목 18px + 설명 3~4줄 중앙 정렬' },
    { type: '커스텀',           note: 'T51AI-D-04 Screenshots / 풀폭 600px → 2열 각48%×400px → 3열 각31%×280px' },
    { type: 'SL-stats',        note: 'T51AI-D-05 성과 하이라이트 / 배경 #F5F5F5 높이 160px / 4항목: 적용모델·연동서비스·처리데이터·사용고객 (00+)' },
    { type: 'SL-grid-card3',   note: 'T51AI-D-06 Other AI Projects / 카드 3열 폭30%×260px / 이미지70%+상태뱃지+프로젝트명+카테고리 / 하단: ← T51 AI 전체보기 링크' },
  ];

  // 06 — Recruit
  const sec06 = [
    { type: '커스텀',           note: 'Recruit-01 상단 타이틀 / "Recruit" 32px + 수평선 + 서브타이틀 16px 회색' },
    { type: 'SL-grid-card4',   note: 'Recruit-02 인재상 / 4열 카드 균등 / 각 카드: ICON 60×60px 중앙 + 제목 16px + 설명 2~3줄 13px 회색' },
    { type: 'SL-grid-card3',   note: 'Recruit-03 복지 및 근무환경 / 3열×2행 그리드 / 각 카드: ICON 48×48px 좌 + 우: 항목제목 16px + 설명 1~2줄' },
    { type: '커스텀',           note: 'Recruit-04 채용 공고 목록 / 행 높이 80px 하단 구분선 / 좌: 포지션명+분야태그 / 우: 접수방법+지원하기 버튼' },
    { type: '커스텀',           note: 'Recruit-05 근무조건·제출서류 / 근무형태·근무시간·면봉 표 2열 / 제출서류 안내 텍스트 + 이메일주소복사 버튼' },
  ];

  // 07 — Contact
  const sec07 = [
    { type: '커스텀',           note: 'Contact-01 프로젝트 문의 폼 / 키워드 드롭다운+pill 태그 14개 / 의뢰 2열 인풋×4 / 내용 텍스트에어리어 180px + 파일첨부 + 개인정보동의 + 문의하기 버튼' },
    { type: '커스텀',           note: 'Contact-02 문구 영역 / "무엇이든 물어보세요." 36~40px 굵게 / "디지털 컨설턴트가 답변해 드립니다." 36~40px 굵게' },
    { type: '커스텀',           note: 'Contact-03 연락처 / "연락처" 24px + 수평선 / 이메일 문의 라벨+주소 / 전화 문의 라벨+Tel+Fax 가로 배치' },
  ];

  // ── pageSections 등록 ──
  pageSections = {
    '01':   JSON.parse(JSON.stringify(sec01)),
    '02':   JSON.parse(JSON.stringify(sec02)),
    '03':   JSON.parse(JSON.stringify(sec03)),
    '03-D': JSON.parse(JSON.stringify(sec03D)),
    '04':   JSON.parse(JSON.stringify(sec04)),
    '04-D': JSON.parse(JSON.stringify(sec04D)),
    '05':   JSON.parse(JSON.stringify(sec05)),
    '05-D': JSON.parse(JSON.stringify(sec05D)),
    '06':   JSON.parse(JSON.stringify(sec06)),
    '07':   JSON.parse(JSON.stringify(sec07)),
  };

  // 첫 탭(01 Home) 활성화
  promptSections = JSON.parse(JSON.stringify(sec01));
  _activePageTab = '01';
  renderPageSectionTabs();
  showToast('📌 T51 전체 페이지 프리셋 로드 완료');
}

function loadWorksPreset() {
  document.getElementById('g-id').value = '03';
  document.getElementById('g-name').value = 'Works';
  document.getElementById('g-sections').value = '3';
  document.getElementById('g-note').value = '카드 클릭 → [[03-D-works-detail]] 이동';
  document.getElementById('g-layout').value = '스크롤 페이지';
  genSections = [
    { type: 'SL-filter-tabs', note: 'Header/Filter / "Works" 32px + ALL / POPULAR / RECENT / TOP RATED 탭' },
    { type: 'SL-grid-card3', note: 'Project Grid / 카드 560×340px / 클릭 → Works Detail' },
    { type: 'SL-pagination', note: 'Pagination / [ < ] 1 2 3 … 9 [ > ]' },
  ];
  renderSectionList('gen-section-list', genSections);
  generatePageFile();
  showToast('📌 Works 프리셋 로드 완료');
}

function loadStoryPreset() {
  document.getElementById('g-id').value = '04';
  document.getElementById('g-name').value = 'Story';
  document.getElementById('g-sections').value = '3';
  document.getElementById('g-note').value = '카드 클릭 → [[04-D-story-detail]] 이동';
  document.getElementById('g-layout').value = '스크롤 페이지';
  genSections = [
    { type: 'SL-filter-tabs', note: 'Header/Category Tab / "Story" 32px + ALL / CULTURE / INSIGHT 탭' },
    { type: 'SL-grid-card3', note: 'Content Grid / 카드 420×300px / 썸네일60%+카테고리+날짜+제목+댓글수 / 클릭 → Story Detail' },
    { type: 'SL-pagination', note: 'Pagination / [ < ] 1 2 3 … [ > ]' },
  ];
  renderSectionList('gen-section-list', genSections);
  generatePageFile();
  showToast('📌 Story 프리셋 로드 완료');
}
function clearGenForm() {
  genSections = [];
  renderSectionList('gen-section-list', genSections);
  document.getElementById('gen-output').textContent = '';
  ['g-id','g-name','g-sections','g-note'].forEach(id => document.getElementById(id).value = '');
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

