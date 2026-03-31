/* ── 02-ui — showPage, 탭전환, showToast, 유틸 ── */

// ══════════════════════════════════
// NAVIGATION
// ══════════════════════════════════
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  // btn이 넘어오면 직접 활성화, 아니면 onclick 속성으로 찾기
  if (btn) {
    btn.classList.add('active');
  } else {
    document.querySelectorAll('.nav-tab').forEach(t => {
      if (t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + id + "'")) {
        t.classList.add('active');
      }
    });
  }
  if (id === 'prompt') renderPageSectionTabs();
}

function switchGenTab(id, btn) {
  document.querySelectorAll('.gen-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('gen-' + id);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
}

function switchStepTab(num) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('spanel-' + num).classList.add('active');
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById('stab-' + i);
    btn.classList.remove('active', 'done');
    if (i < num) btn.classList.add('done');
    else if (i === num) btn.classList.add('active');
  }
  if (num === 3) renderPageSectionTabs();
}

// ══════════════════════════════════
// TOAST
// ══════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function copyOutput(id, btn) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('✅ 클립보드에 복사됐습니다');
    if (btn) { btn.textContent = '✓ 복사됨'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = '복사'; btn.classList.remove('copied'); }, 2000); }
  });
}

