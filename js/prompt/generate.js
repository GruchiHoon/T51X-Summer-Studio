/* ── prompt/generate.js
   프롬프트 생성 + MD 선택·추출·다운로드
   - generatePrompt(): Claude/Figma 프롬프트 텍스트 조합
   - downloadMd(), initMdSelectPanel(), buildSelectedMdContent() 등
   ▸ 프롬프트 템플릿 수정 시 이 파일만 편집
─────────────────────────────────────────────────────── */

function generatePrompt() {
  const proj = document.getElementById('p-project').value || '웹사이트 프로젝트';
  const client = document.getElementById('p-client').value || '클라이언트';
  const font = document.getElementById('p-font').value || 'Pretendard';
  const resolution = document.getElementById('p-resolution').value || '1920×1080px';
  const gnb = document.getElementById('p-gnb').value;
  const notes = document.getElementById('p-notes').value;
  const footerSpec = buildFooterSpec();
  const ratio = document.getElementById('p-ratio').value;
  const wfStyle = document.getElementById('p-wf-style').value;

  // ── 와이어프레임 스타일별 상세 시각 규칙 ──
  function buildWfStyleGuide(style) {
    if (style.startsWith('순수 와이어프레임')) return `
### 와이어프레임 시각 규칙 — 순수 와이어프레임 (색상 없음)
- **배경**: 흰색(#FFFFFF) 또는 밝은 회색(#F8F8F8)
- **모든 색상 금지**: 브랜드 컬러, 파스텔, 그라디언트 일체 사용 금지
- **도형**: 테두리선(stroke 1~2px, #000000 또는 #333333)만 사용, fill 없음
- **이미지 영역**: 흰 배경 + 사선 크로스(X) + "IMAGE" 텍스트, 테두리 1px #999
- **버튼**: 테두리 박스(border 1~2px #000) + 대문자 텍스트, 배경 없음
- **아이콘**: 정사각형 테두리 박스(border 1px #999) + "ICON" 텍스트
- **텍스트 플레이스홀더**: 가로줄 블록(높이 8~12px, fill #CCCCCC) 또는 "Lorem ipsum"
- **강조**: 굵기(bold) 또는 밑줄로만 구분, 색상 강조 금지
- **레이아웃 표시**: 얇은 점선(dashed 1px #CCCCCC)으로 그리드/컬럼 구획
- **주석**: 검정 실선 화살표 + 검정 텍스트 라벨`;

    if (style.startsWith('로우파이')) return `
### 와이어프레임 시각 규칙 — 로우파이 (Lo-Fi · 초기 아이디어 스케치 수준)
> 로우파이는 아이디어를 빠르게 구체화하는 초기 단계입니다. 시각적 완성도보다 **구조와 흐름** 전달이 목적입니다.
- **전체 원칙**: 핸드스케치처럼 거칠고 심플하게. 정교한 디자인 요소 일체 배제
- **배경**: 흰색(#FFFFFF) 단일 사용, 섹션 구분은 1px 수평선으로만
- **컬러**: 검정(#000000)과 연회색(#CCCCCC) 2가지만 사용. 그 외 색상 금지
- **이미지 영역**: 빈 사각형 테두리(1px #999) + 대각선 X선 하나 + "img" 소문자 텍스트만
- **버튼**: 단순 사각형 테두리(1px #000) + 텍스트. 배경색·그림자 없음
- **아이콘**: 작은 정사각형 테두리(1px #999) + "i" 또는 간단한 기호 하나
- **텍스트**: 제목은 굵은 한 줄 텍스트, 본문은 회색 가로줄 2~3개로 대체
- **레이아웃**: 얇은 점선으로 영역 구획만. 컬럼·간격 수치 불필요
- **카드/패널**: 단순 사각형 테두리만. fill·shadow·radius 없음
- **흐름 표시**: 화면 전환 동작은 화살표(→)와 짧은 텍스트 레이블로만 표시
- **주석 최소화**: 꼭 필요한 동작 설명만 간단히. 스펙 수치 불필요`;

    if (style.startsWith('미드파이')) return `
### 와이어프레임 시각 규칙 — 미드파이 (Mid-Fi · 와이어프레임 · 기본 색상 일부 적용)
> 미드파이는 UI 기획서 수준입니다. 정확한 색상값·폰트 크기보다 **기능 흐름과 레이아웃 구조** 표현이 핵심입니다.
- **배경**: 흰색 기본, 강조 섹션은 연한 브랜드 컬러 10% tint 또는 #F5F0FF 계열
- **기본 컬러**: 브랜드 메인 컬러 1가지만 제한 사용 (버튼 Primary, 활성 탭, 강조 텍스트)
- **서브 컬러**: 중간 회색(#888) 보조로 사용
- **이미지 영역**: #DDDDDD fill + 대각선 크로스 + "IMAGE" 텍스트, 실제 이미지 없음
- **버튼 Primary**: 브랜드 컬러 fill + 흰 텍스트(border-radius 4~6px)
- **버튼 Secondary**: 테두리 1px 브랜드 컬러 + 브랜드 컬러 텍스트
- **아이콘**: 정사각형 박스, 브랜드 컬러 10% tint fill + "ICON" 텍스트
- **카드**: 흰 배경 + border 1px #E0E0E0 + border-radius 8px + subtle shadow
- **타이포**: 제목 #111 굵게 / 본문 #444 / 보조 #888 / 링크 브랜드 컬러
- **활성 상태**: 브랜드 컬러 강조, 비활성 #CCCCCC
- **배지/태그**: 브랜드 컬러 배경 10% + 브랜드 컬러 텍스트
- **워크플로우 필수**: 버튼·링크 클릭 시 화면 전환 동작을 빨간 화살표 + 설명으로 반드시 표기
- **주석**: 주황 점선 박스(#FF6600) + 기능 동작 텍스트 라벨`;

    if (style.startsWith('하이파이')) return `
### 와이어프레임 시각 규칙 — 하이파이 (Hi-Fi · 실제 UI 디자인 수준)
> 하이파이는 출시 직전 수준의 시각적 완성도를 목표로 합니다. 폰트 사이즈·아이콘·색상 등 시각 영역을 구체적으로 정의하고, 실제 이미지·컬러·아이콘을 직접 채워넣어 완성합니다.

#### 이미지
- **실제 이미지 필수**: 이미지 플레이스홀더(X박스) 사용 금지. 섹션 콘텐츠와 어울리는 실제 이미지를 Unsplash URL로 직접 삽입
  - Hero 배경: 프로젝트·브랜드 분위기에 맞는 고화질 와이드 이미지
  - 카드 썸네일: 각 카드 내용에 맞는 구체적 이미지
  - 인물/팀: 자연스러운 비즈니스 인물 사진
  - 제품/서비스: 해당 카테고리에 맞는 오브젝트 이미지
  - Unsplash 포맷 예시: https://images.unsplash.com/photo-[ID]?w=1200&q=80

#### 색상
- **브랜드 컬러 전체 팔레트 구성 후 적용**: 프로젝트 분위기에 맞는 Primary / Secondary / Accent / Surface / Text 컬러를 직접 정하여 일관성 있게 사용
- 다크/라이트 모드 구분 명확히
- 버튼, 배경, 텍스트, 구분선, 카드 각각에 실제 색상코드(HEX) 명시
- 그라디언트 필요 시 적용 (방향, 색상코드 기재)

#### 아이콘
- **실제 아이콘 SVG 인라인 삽입 또는 아이콘 이름 명시**: "ICON" 텍스트 박스 사용 금지
- 사용 아이콘 라이브러리: Lucide Icons 또는 Heroicons 기준으로 어울리는 아이콘 이름 명시
- 아이콘 크기: 16px / 20px / 24px / 32px 중 맥락에 맞게 선택
- 아이콘 색상: 브랜드 컬러 또는 텍스트 컬러와 통일

#### 타이포그래피
- 실제 폰트 크기 계층: H1 48~64px / H2 32~40px / H3 24~28px / Body 15~16px / Caption 12px
- 폰트 굵기: 제목 700~800 / 본문 400~500 / 캡션 400
- 줄간격: 제목 1.2 / 본문 1.7 / 캡션 1.5
- 텍스트는 Lorem ipsum 대신 실제 카피 또는 현실적 더미 텍스트 사용

#### 컴포넌트
- 버튼: 실제 디자인 스타일(그라디언트·그림자 포함), hover 상태 주석
- 카드: 실제 shadow(box-shadow 수치), border-radius 12~16px, padding 수치 기재
- 인터랙션 상태: Default / Hover / Active / Disabled 모두 주석 명시
- 간격: 8px 그리드 기반, 실제 padding·margin 수치(px) 기재

#### 반응형 & 주석
- Desktop → Tablet → Mobile 레이아웃 변화 주석 포함
- 주석: 파란 실선 박스(#0066CC) + 크기·색상코드·동작 포함한 상세 스펙 라벨`;

    return `\n### 와이어프레임 스타일\n- ${style}`;
  }
  const wfStyleGuide = buildWfStyleGuide(wfStyle);
  const responsive = document.getElementById('p-responsive').value;
  const colorTheme = document.getElementById('p-color-theme').value;
  const interaction = document.getElementById('p-interaction').value;
  const imageRule = document.getElementById('p-image-rule').value;
  const textRule = document.getElementById('p-text-rule').value;
  const accessibility = document.getElementById('p-accessibility').value;

  if (promptPages.length === 0) { showToast('❌ 페이지를 먼저 추가하세요 (② 페이지 구성)'); return; }

  const today    = new Date().toISOString().slice(0,10);
  const isSingle = promptPages.length === 1;

  function buildSectionText(sections) {
    return sections.map((s, i) => {
      const spec = SL_SPECS[s.type];
      const num  = String(i+1).padStart(2,'0');
      return `섹션 ${num}: ${s.note || spec?.name || s.type}\n  유형: ${s.type}\n  스펙: ${spec?.spec || '직접 입력'}\n  ${s.note ? '특이사항: '+s.note : ''}`;
    }).join('\n\n');
  }

  // ── Claude용 ──
  const pageBlocks = promptPages.map((p, idx) => {
    const sections     = pageSections[p.id] || [];
    const sectionText  = buildSectionText(sections);
    const header       = isSingle
      ? `### 제작 요청 페이지: ${p.id} — ${p.name}`
      : `### 페이지 ${idx+1}: ${p.id} — ${p.name}`;
    return `---\n${header}\n${p.note ? '> '+p.note+'\n' : ''}\n#### 섹션 구성 (${sections.length}개)\n\n${sectionText || '(섹션 없음)'}`;
  }).join('\n\n');

  const claudePrompt = `## 와이어프레임 제작 요청 — ${proj}

### 프로젝트 공통 설정
- 프로젝트: ${proj} (${client})
- 기준 해상도: ${resolution} / 비율 ${ratio}
- 폰트: ${font}
- 스타일: ${wfStyle}
${wfStyleGuide}
- 반응형 기준: ${responsive}
- 색상 테마: ${colorTheme}
- 텍스트: ${textRule}
- 이미지 처리: ${imageRule}
- GNB: ${gnb === '없음' ? '사용 안 함' : gnb + ' 방식 사용 (최상단 고정)'}
- 푸터: ${footerSpec ? footerSpec : '미사용'}
- 인터랙션: ${interaction}
- 접근성: ${accessibility}
- 버튼: 테두리 박스 + 대문자 라벨
- 아이콘: 정사각형 테두리 박스 + "ICON" 텍스트 필수
- 반응형: 가로 스크롤 금지, 100vw×100vh 기준
${notes ? '\n### 클라이언트 특이사항\n' + notes : ''}

${pageBlocks}

---

### 요청 사항
위 공통 설정과 섹션 구성을 바탕으로 ${isSingle ? `페이지 ${promptPages[0].id} (${promptPages[0].name})의` : `총 ${promptPages.length}개 페이지 각각의`} 와이어프레임 스펙 MD를 작성해주세요.
각 섹션별로 레이아웃, 요소, 치수, 클릭 동작을 상세히 기술해주세요.
생성일: ${today}`;

  // ── Figma AI용 ──
  const figmaPageList = isSingle ? '' :
    `\nPAGES TO CREATE:\n${promptPages.map((p,i) =>
      `${i+1}. ${p.id} — ${p.name}${p.note ? ' ('+p.note+')' : ''}`
    ).join('\n')}\n`;

  const figmaPrompt = `Create ${isSingle ? `a wireframe for page "${promptPages[0].name}"` : `wireframes for ${promptPages.length} pages`} of ${proj}.

PROJECT SETTINGS:
- Resolution: ${resolution} (${ratio} ratio)
- Font: ${font}
- Style: ${wfStyle}
${wfStyleGuide.replace(/^###/gm,'##').replace(/\*\*/g,'')}
- Responsive: ${responsive}
- Color theme: ${colorTheme}
- Image placeholders: ${imageRule}
- Text: ${textRule}
- Navigation: ${gnb === '없음' ? 'None' : gnb}
- Footer: ${footerSpec ? footerSpec : 'None'}
- Interactions: ${interaction}
- Accessibility: ${accessibility}
- Buttons: bordered box with UPPERCASE label text
- Icon areas: square bordered box with "ICON" text inside
- No horizontal scrolling at any viewport size
${figmaPageList}
${promptPages.map((p,idx) => {
  const sections = pageSections[p.id] || [];
  return `PAGE ${idx+1}: ${p.id} — ${p.name}\nSECTION STRUCTURE (${sections.length} sections):\n${
    sections.map((s,i) => {
      const spec = SL_SPECS[s.type];
      return `${i+1}. ${s.note || spec?.name || s.type}: ${spec?.spec || 'custom section'}`;
    }).join('\n') || '(no sections)'
  }`;
}).join('\n\n')}

REQUIREMENTS:
- Page number at bottom-right of each section
- All image areas must have #EEEEEE fill + diagonal cross marks
${footerSpec ? `- Global footer: ${footerSpec}` : '- No footer'}
- Annotate all click actions with red dotted box + description
- No horizontal scrolling at any viewport size`;

  document.getElementById('output-claude').textContent = claudePrompt;
  document.getElementById('output-figma').textContent = figmaPrompt;


  // ── MD용 ──
  const mdContent = promptPages.map(p => {
    const sections = pageSections[p.id] || [];
    const slug     = p.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    const secTable = sections.map((s,i) => {
      const num  = String(i+1).padStart(2,'0');
      const spec = SL_SPECS[s.type];
      return `| ${p.name.replace(/\s/g,'')}-${num} | ${s.note?.split('/')[0]?.trim() || spec?.name || s.type} | [[${s.type}]] | ${s.note || '기본 스펙 적용'} |`;
    }).join('\n');
    const secDetailBlocks = sections.length > 0
      ? '\n\n---\n\n## 섹션 상세\n\n' + sections.map((s, i) => {
          const num  = String(i+1).padStart(2,'0');
          const spec = SL_SPECS[s.type];
          return `### 섹션 ${num} — ${s.note?.split('/')[0]?.trim() || spec?.name || s.type}\n\n- **유형**: \`${s.type}\`\n- **스펙**: ${spec?.spec || '커스텀'}\n- **특이사항**: ${s.note || '없음'}`;
        }).join('\n\n')
      : '';
    return `<!-- 파일명: ${p.id.padStart(2,'0')}-${slug}.md -->
---
tags: [page, wip]
page-id: "${p.id}"
page-name: ${p.name}
sections: ${sections.length}
status: wip
updated: ${today}
project-info: "[[project-info]]"
navigation: "[[CL-navigation]]"
footer: "${footerSpec ? '[[CL-footer]]' : '없음'}"
---

# 📄 ${p.id} — ${p.name}

> ${p.note || ''}

상위: [[sitemap]] | 프로젝트: [[project-info]]

---

## 섹션 구성

| 섹션 ID | 제목 | 섹션 유형 | 특이사항 |
|--------|------|---------|--------|
${secTable || '| — | 섹션 없음 | — | — |'}
${secDetailBlocks}

---

## 특이사항 메모

*(Figma 작업 시 이 페이지 고유의 조정 사항 기록)*

---

## ✅ 체크리스트

- [ ] 섹션 페이지 번호 전부 표기
- [ ] 이미지 영역 크로스 표시
- [ ] 버튼 라벨 대문자
- [ ] 아이콘 박스 ICON 텍스트
- [ ] 클릭 동작 주석 명시
- [ ] 미정 에셋 → [[asset-checklist]] 등록
`;
  }).join('\n\n---\n\n');

  document.getElementById('output-md').textContent = mdContent;
  initMdSelectPanel();
  showToast(`✨ ${promptPages.length}개 페이지 프롬프트 5종 생성 완료!`);
  saveCurrentToHistory(false);
}

function downloadMd() {
  const content = document.getElementById('output-md').textContent;
  if (!content.trim()) { showToast('❌ 먼저 프롬프트를 생성하세요'); return; }
  const today = new Date().toISOString().slice(0,10);
  if (promptPages.length === 1) {
    const p = promptPages[0];
    const slug = p.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    downloadFile(content, `${p.id.padStart(2,'0')}-${slug}.md`);
  } else {
    downloadFile(content, `pages-bundle-${today}.md`);
  }
}

// ══════════════════════════════════
// MD 선택 추출 시스템
// ══════════════════════════════════

/* _mdBlocks: 생성된 전체 블록 데이터를 저장
  [{
    type: 'page' | 'gnb' | 'footer',
    id: string,          // page id or 'gnb'/'footer'
    name: string,
    content: string,     // 전체 MD 텍스트
    sections: [{idx, name, type, content}],  // page만 해당
    selected: bool,
    sectionsOpen: bool,
    selectedSections: Set<number>,  // 선택된 섹션 인덱스
  }]
*/
let _mdBlocks = [];

function initMdSelectPanel() {
  _mdBlocks = [];
  const today = new Date().toISOString().slice(0,10);
  const footerSpec = buildFooterSpec();
  const gnb = document.getElementById('p-gnb').value;

  // 페이지 블록 생성
  promptPages.forEach(p => {
    const sections = pageSections[p.id] || [];
    const slug = p.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    const secTable = sections.map((s,i) => {
      const num = String(i+1).padStart(2,'0');
      const spec = SL_SPECS[s.type];
      return `| ${p.name.replace(/\s/g,'')}-${num} | ${s.note?.split('/')[0]?.trim() || spec?.name || s.type} | [[${s.type}]] | ${s.note || '기본 스펙 적용'} |`;
    }).join('\n');
    const secDetailFull = sections.length > 0
      ? '\n\n---\n\n## 섹션 상세\n\n' + sections.map((s,i) => {
          const num = String(i+1).padStart(2,'0');
          const spec = SL_SPECS[s.type];
          return `### 섹션 ${num} — ${s.note?.split('/')[0]?.trim() || spec?.name || s.type}\n\n- **유형**: \`${s.type}\`\n- **스펙**: ${spec?.spec || '커스텀'}\n- **특이사항**: ${s.note || '없음'}`;
        }).join('\n\n')
      : '';

    const pageContent = `<!-- 파일명: ${p.id.padStart(2,'0')}-${slug}.md -->
---
tags: [page, wip]
page-id: "${p.id}"
page-name: ${p.name}
sections: ${sections.length}
status: wip
updated: ${today}
project-info: "[[project-info]]"
navigation: "[[CL-navigation]]"
footer: "${footerSpec ? '[[CL-footer]]' : '없음'}"
---

# 📄 ${p.id} — ${p.name}

> ${p.note || ''}

상위: [[sitemap]] | 프로젝트: [[project-info]]

---

## 섹션 구성

| 섹션 ID | 제목 | 섹션 유형 | 특이사항 |
|--------|------|---------|--------|
${secTable || '| — | 섹션 없음 | — | — |'}
${secDetailFull}

---

## 특이사항 메모

*(Figma 작업 시 이 페이지 고유의 조정 사항 기록)*

---

## ✅ 체크리스트

- [ ] 섹션 페이지 번호 전부 표기
- [ ] 이미지 영역 크로스 표시
- [ ] 버튼 라벨 대문자
- [ ] 아이콘 박스 ICON 텍스트
- [ ] 클릭 동작 주석 명시
- [ ] 미정 에셋 → [[asset-checklist]] 등록
`;

    // 섹션별 개별 MD 콘텐츠
    const sectionBlocks = sections.map((s, i) => {
      const num = String(i+1).padStart(2,'0');
      const spec = SL_SPECS[s.type];
      const secName = s.note?.split('/')[0]?.trim() || spec?.name || s.type;
      return {
        idx: i,
        name: `섹션 ${num} — ${secName}`,
        type: s.type,
        content: `<!-- 섹션: ${p.id}-${num} ${secName} -->

## 섹션 ${num} — ${secName}

- **페이지**: ${p.id} — ${p.name}
- **유형**: \`${s.type}\`
- **스펙**: ${spec?.spec || '커스텀'}
- **특이사항**: ${s.note || '없음'}
`
      };
    });

    _mdBlocks.push({
      type: 'page', id: p.id, name: `${p.id} — ${p.name}`,
      content: pageContent,
      sections: sectionBlocks,
      selected: true,
      sectionsOpen: false,
      selectedSections: new Set(sectionBlocks.map((_,i) => i))
    });
  });

  // GNB 블록
  if (gnb && gnb !== '없음') {
    const gnbContent = `---
tags: [component, navigation, gnb]
updated: ${today}
---

# 🧭 GNB (Global Navigation Bar)

## 설정값

| 항목 | 값 |
|------|-----|
| GNB 유형 | ${gnb} |
| 프로젝트 | ${document.getElementById('p-project').value || '-'} |
| 클라이언트 | ${document.getElementById('p-client').value || '-'} |

## 스펙

\`\`\`
유형: ${gnb}
위치: 화면 상단 고정 (sticky)
반응형: ${document.getElementById('p-responsive').value}
\`\`\`

## 체크리스트

- [ ] 로고 영역 크기 확인
- [ ] 메뉴 항목 연결 확인
- [ ] 모바일 대응 확인
- [ ] 활성 메뉴 상태 표시 확인
`;
    _mdBlocks.push({
      type: 'gnb', id: 'gnb', name: 'GNB (네비게이션)',
      content: gnbContent, sections: [], selected: true,
      sectionsOpen: false, selectedSections: new Set()
    });
  }

  // 푸터 블록
  if (footerSpec) {
    const footerContent = `---
tags: [component, footer]
updated: ${today}
---

# 🦶 Footer (글로벌 푸터)

## 설정값

| 항목 | 값 |
|------|-----|
| 푸터 유형 | ${document.getElementById('p-footer-type').value} |
| 높이 | ${document.getElementById('p-footer-height').value} |
| 로고 | ${document.getElementById('p-footer-logo').value} |
| SNS 아이콘 | ${document.getElementById('p-footer-sns').value} |
| 개인정보처리방침 | ${document.getElementById('p-footer-privacy').value} |

## 스펙 요약

\`\`\`
${footerSpec}
\`\`\`

## 체크리스트

- [ ] 로고 영역 확인
- [ ] SNS 링크 연결 확인
- [ ] 개인정보처리방침 링크 확인
- [ ] 카피라이트 텍스트 확인
- [ ] 모바일 대응 확인
`;
    _mdBlocks.push({
      type: 'footer', id: 'footer', name: '푸터 (Footer)',
      content: footerContent, sections: [], selected: true,
      sectionsOpen: false, selectedSections: new Set()
    });
  }

  renderMdSelectPanel();
  refreshMdPreview();
}

function renderMdSelectPanel() {
  const body = document.getElementById('md-select-body');
  if (!body) return;
  if (_mdBlocks.length === 0) {
    body.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:16px 0">프롬프트를 먼저 생성하세요</div>';
    return;
  }

  body.innerHTML = _mdBlocks.map((block, bi) => {
    if (block.type === 'gnb' || block.type === 'footer') {
      const icon = block.type === 'gnb' ? '🧭' : '🦶';
      const desc = block.type === 'gnb' ? 'GNB · 네비게이션 MD 추출' : '푸터 컴포넌트 MD 추출';
      return `<div class="md-special-row" onclick="mdToggleBlock(${bi},event)">
        <input type="checkbox" class="md-chk" ${block.selected?'checked':''} onclick="mdToggleBlock(${bi},event)" onchange="mdToggleBlock(${bi},event)">
        <span class="md-special-icon">${icon}</span>
        <span class="md-special-label">${block.name}</span>
        <span class="md-special-desc">${desc}</span>
      </div>`;
    }
    // page 타입
    const secCount = block.sections.length;
    const selSecCount = block.selectedSections.size;
    const secBadge = secCount > 0
      ? `<span class="md-page-badge">${selSecCount}/${secCount} 섹션</span>`
      : `<span class="md-page-badge">섹션 없음</span>`;
    const arrowCls = block.sectionsOpen ? 'open' : '';
    const secListHtml = secCount > 0 && block.sectionsOpen
      ? `<div class="md-sec-list">${block.sections.map((sec, si) => {
          const checked = block.selectedSections.has(si);
          return `<div class="md-sec-row" onclick="mdToggleSec(${bi},${si},event)">
            <input type="checkbox" class="md-chk" ${checked?'checked':''} onclick="mdToggleSec(${bi},${si},event)" onchange="mdToggleSec(${bi},${si},event)">
            <span class="md-sec-badge">${String(si+1).padStart(2,'0')}</span>
            <span class="md-sec-label">${escapeHtml(sec.name)}</span>
          </div>`;
        }).join('')}</div>`
      : '';

    return `<div class="md-page-group">
      <div class="md-page-row">
        <input type="checkbox" class="md-chk" ${block.selected?'checked':''} onclick="mdToggleBlock(${bi},event)" onchange="mdToggleBlock(${bi},event)">
        <span class="md-page-toggle ${arrowCls}" onclick="mdToggleOpen(${bi},event)">${secCount>0?'›':''}</span>
        <span class="md-page-label" onclick="mdToggleOpen(${bi},event)">${escapeHtml(block.name)}</span>
        ${secBadge}
      </div>
      ${secListHtml}
    </div>`;
  }).join('');
}

function mdToggleBlock(bi, e) {
  e.stopPropagation();
  const block = _mdBlocks[bi];
  // 체크박스 클릭이면 그 상태 그대로, 행 클릭이면 토글
  if (e.target.type === 'checkbox') {
    block.selected = e.target.checked;
  } else {
    block.selected = !block.selected;
  }
  // 페이지면 모든 섹션도 동기화
  if (block.type === 'page') {
    if (block.selected) {
      block.selectedSections = new Set(block.sections.map((_,i)=>i));
    } else {
      block.selectedSections.clear();
    }
  }
  renderMdSelectPanel();
  refreshMdPreview();
}

function mdToggleSec(bi, si, e) {
  e.stopPropagation();
  const block = _mdBlocks[bi];
  const checked = e.target.type === 'checkbox' ? e.target.checked : !block.selectedSections.has(si);
  if (checked) block.selectedSections.add(si);
  else block.selectedSections.delete(si);
  // 하나라도 선택되면 페이지도 선택
  block.selected = block.selectedSections.size > 0;
  renderMdSelectPanel();
  refreshMdPreview();
}

function mdToggleOpen(bi, e) {
  e.stopPropagation();
  _mdBlocks[bi].sectionsOpen = !_mdBlocks[bi].sectionsOpen;
  renderMdSelectPanel();
}

function mdSelectAll(val) {
  _mdBlocks.forEach(block => {
    block.selected = val;
    if (block.type === 'page') {
      if (val) block.selectedSections = new Set(block.sections.map((_,i)=>i));
      else block.selectedSections.clear();
    }
  });
  renderMdSelectPanel();
  refreshMdPreview();
}

function buildSelectedMdContent() {
  const parts = [];
  _mdBlocks.forEach(block => {
    if (!block.selected) return;
    if (block.type === 'gnb' || block.type === 'footer') {
      parts.push(block.content);
      return;
    }
    // 페이지: 섹션 전부 선택이면 전체 MD, 일부면 선택된 섹션만
    const allSelected = block.selectedSections.size === block.sections.length;
    const noneSelected = block.selectedSections.size === 0;
    if (noneSelected) return;
    if (allSelected || block.sections.length === 0) {
      parts.push(block.content);
    } else {
      // 부분 선택: 페이지 헤더 + 선택된 섹션 상세만
      const p = promptPages.find(p => p.id === block.id);
      const today = new Date().toISOString().slice(0,10);
      const footerSpec = buildFooterSpec();
      const slug = p ? p.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') : block.id;
      const selSections = block.sections.filter((_,i) => block.selectedSections.has(i));
      const secTable = selSections.map(sec => {
        const sidx = block.sections.indexOf(sec);
        const s = (pageSections[block.id] || [])[sidx];
        if (!s) return '';
        const num = String(sidx+1).padStart(2,'0');
        const spec = SL_SPECS[s.type];
        return `| ${(p?.name||block.id).replace(/\s/g,'')}-${num} | ${s.note?.split('/')[0]?.trim() || spec?.name || s.type} | [[${s.type}]] | ${s.note || '기본 스펙 적용'} |`;
      }).filter(Boolean).join('\n');
      const secDetails = selSections.map(sec => sec.content).join('\n\n');
      parts.push(`<!-- 파일명: ${(p?.id||block.id).padStart(2,'0')}-${slug}.md (부분 선택) -->
---
tags: [page, wip, partial]
page-id: "${block.id}"
page-name: ${p?.name || block.id}
sections-selected: ${selSections.length}
updated: ${today}
---

# 📄 ${block.id} — ${p?.name || block.id} (선택된 섹션)

> ${p?.note || ''}

---

## 선택된 섹션 구성 (${selSections.length}개)

| 섹션 ID | 제목 | 섹션 유형 | 특이사항 |
|--------|------|---------|--------|
${secTable || '| — | — | — | — |'}

---

## 섹션 상세

${secDetails}
`);
    }
  });
  return parts.join('\n\n---\n\n');
}

function refreshMdPreview() {
  const content = buildSelectedMdContent();
  document.getElementById('output-md').textContent = content || '(선택된 항목이 없습니다)';
}

function downloadMdSelected() {
  const content = buildSelectedMdContent();
  if (!content.trim()) { showToast('❌ 추출할 항목을 선택하세요'); return; }
  const today = new Date().toISOString().slice(0,10);
  const selectedPages = _mdBlocks.filter(b => b.selected && b.type === 'page');
  const hasSpecial = _mdBlocks.some(b => b.selected && (b.type === 'gnb' || b.type === 'footer'));
  let fname;
  if (selectedPages.length === 1 && !hasSpecial) {
    const p = promptPages.find(p => p.id === selectedPages[0].id);
    const slug = p ? p.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') : selectedPages[0].id;
    fname = `${selectedPages[0].id.padStart(2,'0')}-${slug}.md`;
  } else {
    fname = `md-export-${today}.md`;
  }
  downloadFile(content, fname);
}
