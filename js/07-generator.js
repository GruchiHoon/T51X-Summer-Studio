/* ── 07-generator — 페이지 MD 파일 생성기 ── */

// ══════════════════════════════════
// PAGE FILE GENERATOR
// ══════════════════════════════════
function generatePageFile() {
  const id = document.getElementById('g-id').value.trim();
  const name = document.getElementById('g-name').value.trim();
  const sections = document.getElementById('g-sections').value || genSections.length || 0;
  const status = document.getElementById('g-status').value;
  const priority = document.getElementById('g-priority').value;
  const note = document.getElementById('g-note').value.trim();
  const layout = document.getElementById('g-layout').value;

  if (!id || !name) { showToast('❌ 페이지 ID와 이름을 입력하세요'); return; }

  const today = new Date().toISOString().slice(0,10);
  const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const filename = `${id.length <= 2 ? id.padStart(2,'0') : id}-${slug}.md`;
  document.getElementById('gen-filename-preview').textContent = filename;

  const sectionTable = genSections.length > 0
    ? genSections.map((s, i) => {
        const num = String(i+1).padStart(2,'0');
        const spec = SL_SPECS[s.type];
        return `| ${name.replace(/\s/g,'')}-${num} | ${s.note?.split('/')[0]?.trim() || spec?.name || s.type} | [[${s.type}]] | ${s.note || '기본 스펙 적용'} |`;
      }).join('\n')
    : '| - | 섹션 추가 필요 | - | - |';

  const md = `---
tags: [page, ${status}]
page-id: "${id}"
page-name: ${name}
sections: ${sections}
status: ${status}
priority: ${priority}
layout: "${layout}"
updated: ${today}
project-info: "[[project-info]]"
navigation: "[[CL-navigation]]"
footer: "[[CL-footer]]"
---

# 📄 ${id} — ${name}

> **레이아웃**: ${layout}
${note ? '> **특이사항**: ' + note : ''}

상위: [[sitemap]] | 프로젝트: [[project-info]]
규칙: [[DS-wireframe-rules]] | [[DS-annotation-rules]]

---

## 🧩 공통 컴포넌트

- **네비게이션**: [[CL-navigation]] — [[project-info]] 참조
- **Footer**: [[CL-footer]] — [[project-info]] 참조

---

## 섹션 구성

| 섹션 ID | 제목 | 섹션 유형 | 특이사항 |
|--------|------|---------|--------|
${sectionTable}

> 섹션 유형 상세 스펙은 각 링크([[SL-*]])를 참조하세요.
> 아래에는 **이 페이지의 특이사항만** 기록합니다.

---

## 특이사항 메모

*(Figma 작업 시 발생하는 이 페이지 고유의 조정 사항을 여기에 기록)*

---

## ✅ 체크리스트

- [ ] 섹션 페이지 번호 전부 표기
- [ ] 이미지 영역 크로스 표시
- [ ] 버튼 라벨 대문자
- [ ] 아이콘 박스 ICON 텍스트
- [ ] 클릭 동작 주석 명시
- [ ] 미정 에셋 → [[asset-checklist]] 등록
`;

  document.getElementById('gen-output').textContent = md;
  showToast(`📄 ${filename} 생성 완료!`);
}

function downloadGenMd() {
  const content = document.getElementById('gen-output').textContent;
  if (!content.trim() || content.includes('여기에')) { showToast('❌ 먼저 파일을 생성하세요'); return; }
  const id = document.getElementById('g-id').value || '00';
  const name = document.getElementById('g-name').value || 'page';
  const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const filename = `${id.length <= 2 ? id.padStart(2,'0') : id}-${slug}.md`;
  downloadFile(content, filename);
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  showToast(`📥 ${filename} 다운로드 시작`);
}

