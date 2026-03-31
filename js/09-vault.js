/* ── 09-vault — MD Vault 에디터, 파일트리, 드래그앤드롭 ── */

// ══════════════════════════════════════════════════════════
// MD VAULT SYSTEM
// ══════════════════════════════════════════════════════════
const VAULT_KEY   = 'wps_vault_folders';
const VAULT_FILE  = (fid, fname) => `wps_vf_${fid}_${fname}`;

let vaultActiveFolderId = null;
let vaultActiveFile     = null;
let vaultDirty          = false;

const VAULT_BUILTIN_FOLDERS = [
  // 루트
  { id: 'vf_root',            name: 'T51_Website_MD',   icon: '🗂️', builtin: true, parent: null },
  // 루트 직속
  { id: 'vf_readme',          name: 'README.md',        icon: '📋', builtin: true, parent: 'vf_root', isFile: true },
  { id: 'vf_shared',          name: '_shared',          icon: '🔗', builtin: true, parent: 'vf_root' },
  { id: 'vf_components',      name: '_components',      icon: '🧩', builtin: true, parent: 'vf_root' },
  { id: 'vf_data',            name: '_data',            icon: '🗃️', builtin: true, parent: 'vf_root' },
  { id: 'vf_pages',           name: 'pages',            icon: '📄', builtin: true, parent: 'vf_root' },
  // _components 하위
  { id: 'vf_comp_buttons',    name: 'buttons',          icon: '📁', builtin: true, parent: 'vf_components' },
  { id: 'vf_comp_cards',      name: 'cards',            icon: '📁', builtin: true, parent: 'vf_components' },
  { id: 'vf_comp_footer',     name: 'footer',           icon: '📁', builtin: true, parent: 'vf_components' },
  { id: 'vf_comp_forms',      name: 'forms',            icon: '📁', builtin: true, parent: 'vf_components' },
  { id: 'vf_comp_layout',     name: 'layout',           icon: '📁', builtin: true, parent: 'vf_components' },
  { id: 'vf_comp_navigation', name: 'navigation',       icon: '📁', builtin: true, parent: 'vf_components' },
  { id: 'vf_comp_typography', name: 'typography',       icon: '📁', builtin: true, parent: 'vf_components' },
  // _data 하위
  { id: 'vf_data_copy',       name: 'copy',             icon: '📁', builtin: true, parent: 'vf_data' },
  { id: 'vf_data_assets',     name: 'assets',           icon: '📁', builtin: true, parent: 'vf_data' },
  // dashboard 폴더
  { id: 'vf_dashboard',       name: '_dashboard',       icon: '📊', builtin: true, parent: 'vf_root' },
  // pages 하위
  { id: 'vf_page_home',       name: '01_Home',          icon: '📁', builtin: true, parent: 'vf_pages' },
  { id: 'vf_page_about',      name: '02_About_Us',      icon: '📁', builtin: true, parent: 'vf_pages' },
  { id: 'vf_page_works',      name: '03_Works',         icon: '📁', builtin: true, parent: 'vf_pages' },
  { id: 'vf_page_story',      name: '04_Story',         icon: '📁', builtin: true, parent: 'vf_pages' },
  { id: 'vf_page_t51ai',      name: '05_T51_AI',        icon: '📁', builtin: true, parent: 'vf_pages' },
  { id: 'vf_page_recruit',    name: '06_Recruit',       icon: '📁', builtin: true, parent: 'vf_pages' },
  { id: 'vf_page_contact',    name: '07_Contact',       icon: '📁', builtin: true, parent: 'vf_pages' },
];

const VAULT_BUILTIN_FILES = {
  'vf_readme': {
    'README.md': `---\ntitle: T51_Website_MD — Vault 구조 안내\nupdated: 2026-03-23\n---\n\n# 📋 T51_Website_MD — Vault 구조 안내\n\n이 Vault는 T51/51X 웹사이트 제작 프로젝트의 모든 MD 문서를 관리합니다.\n100페이지 이상의 프로젝트도 이 구조로 일관되게 운영할 수 있습니다.\n\n---\n\n## 폴더 구조\n\n\`\`\`\nT51_Website_MD/\n│\n├── README.md\n├── _shared/\n│   ├── common_settings.md\n│   └── global_components.md\n├── _components/\n│   ├── buttons/buttons.md\n│   ├── cards/cards.md\n│   ├── footer/footer.md\n│   ├── forms/forms.md\n│   ├── layout/layout.md\n│   ├── navigation/navigation.md\n│   └── typography/typography.md\n├── _data/\n│   ├── brand_info.md\n│   ├── copy/ (01~07)\n│   └── assets/ (images, icons)\n└── pages/\n    ├── 01_Home/\n    ├── 02_About_Us/\n    ├── 03_Works/\n    ├── 04_Story/\n    ├── 05_T51_AI/\n    ├── 06_Recruit/\n    └── 07_Contact/\n\`\`\`\n`,
  },
  'vf_shared': {
    'common_settings.md': `---\ntags: [shared, settings]\nupdated: 2026-03-23\n---\n\n# 🔗 공통 설정 — common_settings\n\n> ⚠️ 이 파일을 수정하면 **전체 페이지**에 반영됩니다.\n\n---\n\n## 제작 조건\n\n| 항목 | 값 |\n|------|----|\n| 툴 | Claude (Artifacts) / Figma |\n| 출력 형식 | HTML 와이어프레임 |\n| 언어 | 한국어 |\n| 뷰포트 | Desktop 1440px 기준, Mobile 반응형 |\n\n---\n\n## 시각 규칙\n\n| 항목 | 규칙 |\n|------|------|\n| 배경색 | #FFFFFF (기본) |\n| 이미지 플레이스홀더 | #EEEEEE + 대각선 크로스 |\n| 텍스트 플레이스홀더 | 회색 블록 or Lorem ipsum |\n| 버튼 기본형 | 테두리 1px + 대문자 라벨 |\n| 간격 기준 | 8px 그리드 |\n| 최대 콘텐츠 폭 | 1280px |\n\n---\n\n## 애노테이션 규칙\n\n- \`// [주석]\` — 개발자용 동작 설명\n- \`⚠️\` — 필수 확인 사항\n- \`✅\` — 커스터마이징 가능 항목\n- \`→\` — 클릭/이동 동작 표기\n`,
    'global_components.md': `---\ntags: [shared, components]\nupdated: 2026-03-23\n---\n\n# 🔗 전역 컴포넌트 — global_components\n\n> ⚠️ 이 파일을 수정하면 **전체 페이지**에 반영됩니다.\n\n---\n\n## Logo\n\n| 항목 | 스펙 |\n|------|------|\n| 위치 | 좌측 상단 고정 |\n| 크기 | 높이 32~40px |\n| 동작 | On Click → Home(/) 이동 |\n\n---\n\n## 햄버거 메뉴 버튼\n\n| 항목 | 스펙 |\n|------|------|\n| 위치 | 우측 상단 고정 |\n| 크기 | 40×40px |\n| 동작 | On Click → Slide Menu 열기 |\n\n---\n\n## Slide Menu\n\n| 항목 | 스펙 |\n|------|------|\n| 배경 딤 | rgba(0,0,0,0.5) |\n| 패널 폭 | 55vw (최대 1050px) |\n| 패널 높이 | 100vh |\n| 진입 방향 | 우측 슬라이드 인 |\n\n---\n\n## Footer\n\n[[footer/footer.md]] 참조\n`,
  },
  'vf_comp_buttons': {
    'buttons.md': `---\ntags: [component, buttons]\nupdated: 2026-03-23\n---\n\n# 🧩 버튼 컴포넌트 — BTN-01~07\n\n---\n\n## BTN-01 — CTA 버튼 (대)\n크기: 220×52px / 배경 #000 / 텍스트 #FFF / 대문자\n\n## BTN-02 — CTA 버튼 (중)\n크기: 160~200×44~48px / 배경 #000 / 텍스트 #FFF\n\n## BTN-03 — 아웃라인 버튼\n테두리 1px #000 / 배경 투명 / 텍스트 #000\n\n## BTN-04 — 텍스트 링크 버튼\n\`더 보기 →\` 형태 / 밑줄 / 13~14px\n\n## BTN-05 — 아이콘 + 텍스트 버튼\n좌측 아이콘 20px + 텍스트 / 아웃라인\n\n## BTN-06 — 필 버튼 (컬러)\n배경 브랜드 컬러 / 텍스트 #FFF / 라운드 4px\n\n## BTN-07 — 태그/칩 버튼\n작은 pill 형태 / 12px / 선택 시 배경 채움\n`,
  },
  'vf_comp_cards': {
    'cards.md': `---\ntags: [component, cards]\nupdated: 2026-03-23\n---\n\n# 🧩 카드 컴포넌트 — CARD-01~07\n\n---\n\n## CARD-01 — 포트폴리오 카드\n\`\`\`\n[ 이미지 — 상단 80%, #EEEEEE ]\n프로젝트명 (20px, 굵게)\n[카테고리] [태그]\n설명 (13px, 회색, 2줄)\n연도 | 링크→\n\`\`\`\n\n## CARD-02 — 콘텐츠 카드 (Story)\n\`\`\`\n[ 썸네일 — 상단 60% ]\n[카테고리] 날짜\n제목 2줄 (16px, 굵게)\n댓글수 (12px)\n\`\`\`\n\n## CARD-03 — 아이콘 카드\n아이콘 60×60px / 제목 / 설명 2~3줄\n\n## CARD-04 — 수평 카드\n이미지 좌측 40% / 텍스트 우측 60%\n\n## CARD-05 — 번호 카드\n대형 번호 + 제목 + 설명 / 프로세스 표현용\n\n## CARD-06 — 팀 멤버 카드\n프로필 이미지 원형 / 이름 / 직책 / SNS 링크\n\n## CARD-07 — 채용 포지션 카드\n포지션명 / 고용형태 태그 / 마감일 / 지원하기 버튼\n`,
  },
  'vf_comp_footer': {
    'footer.md': `---\ntags: [component, footer]\nupdated: 2026-03-23\n---\n\n# 🧩 Footer 컴포넌트\n\n---\n\n## 글로벌 푸터 (유형 A — 좌우 2단, T51형)\n\n\`\`\`\n[ LOGO ]   메뉴 | 메뉴 | 메뉴     회사명 | 대표 | 사업자번호\n                               [SNS] [SNS] [SNS]\n                               © 2025 | 개인정보처리방침\n\`\`\`\n\n높이 200px / 배경 #FFFFFF / 상단 1px #CCCCCC\n\n---\n\n## 간소형 푸터 (유형 B — 미니멀)\n\n\`\`\`\n© 2025 T51/51X. All rights reserved.\n\`\`\`\n\n높이 60px / 배경 #FFFFFF / 상단 1px #EEEEEE\n`,
  },
  'vf_comp_forms': {
    'forms.md': `---\ntags: [component, forms]\nupdated: 2026-03-23\n---\n\n# 🧩 폼 요소 — FORM-01~07\n\n---\n\n## FORM-01 — 텍스트 인풋\n높이 48px / 테두리 1px / 포커스 시 강조색\n\n## FORM-02 — 텍스트에어리어\n최소 높이 120px / 리사이즈 수직만 허용\n\n## FORM-03 — 셀렉트 박스\n높이 48px / 커스텀 화살표 아이콘\n\n## FORM-04 — 체크박스\n20×20px / 체크 시 배경 채움\n\n## FORM-05 — 파일 첨부\n점선 테두리 드래그존 / 클릭으로도 업로드\n\n## FORM-06 — 문의 폼 (조합)\n인풋 2열 + 텍스트에어리어 + 파일첨부 + 체크박스 + 제출버튼\n\n## FORM-07 — 지원/신청 폼 (조합)\n인풋 3열 + 포지션 셀렉트 + 자기소개 텍스트에어리어 + 파일첨부 + 제출버튼\n`,
  },
  'vf_comp_layout': {
    'layout.md': `---\ntags: [component, layout]\nupdated: 2026-03-23\n---\n\n# 🧩 레이아웃 패턴 — LAYOUT-01~09\n\n---\n\n## LAYOUT-01 — 전체화면 단일\n100vw × 100vh / 중앙 콘텐츠 / Hero에 주로 사용\n\n## LAYOUT-02 — 좌우 2단 (50:50)\n2열 grid / gap 40~60px / 이미지+텍스트 조합\n\n## LAYOUT-03 — 좌우 2단 (60:40)\n콘텐츠 강조형 / 텍스트 60% + 이미지 40%\n\n## LAYOUT-04 — 좌우 2단 (40:60)\n이미지 강조형 / 이미지 60% + 텍스트 40%\n\n## LAYOUT-05 — 3열 그리드\ngrid 3열 / gap 24~32px / 카드 리스트\n\n## LAYOUT-06 — 4열 그리드\ngrid 4열 / gap 20~24px / 아이콘 카드\n\n## LAYOUT-07 — 단일 컬럼 (중앙 정렬)\nmax-width 800px / 중앙 정렬 / 롱폼 텍스트\n\n## LAYOUT-08 — 메이슨리 그리드\n불규칙 높이 카드 / 이미지 갤러리\n\n## LAYOUT-09 — 풀폭 배너\n100vw × 고정 높이 / 텍스트 or 이미지 배경\n`,
  },
  'vf_comp_navigation': {
    'navigation.md': `---\ntags: [component, navigation]\nupdated: 2026-03-23\n---\n\n# 🧩 네비게이션 컴포넌트\n\n[[_shared/global_components.md]] 의 전역 컴포넌트(Logo, 햄버거, Slide Menu) 정의를 우선 참조\n\n---\n\n## 페이지네이션\n\n\`\`\`\n[ < ]  [ 1 ]  [ 2 ]  [ 3 ]  [ … ]  [ 9 ]  [ > ]\n\`\`\`\n\n| 항목 | 스펙 |\n|------|------|\n| 영역 높이 | 60px |\n| 버튼 크기 | 40×40px |\n| 현재 페이지 | 배경 #000 + 텍스트 #FFF |\n`,
  },
  'vf_comp_typography': {
    'typography.md': `---\ntags: [component, typography]\nupdated: 2026-03-23\n---\n\n# 🧩 타이포그래피 스타일 — TYPE-01~10\n\n---\n\n## TYPE-01 — 대제목 (Hero H1)\n크기: 48~64px / 굵기: 800 / 줄간격: 1.1\n\n## TYPE-02 — 페이지 타이틀 (H1)\n크기: 36~48px / 굵기: 700\n\n## TYPE-03 — 섹션 타이틀 (H2)\n크기: 28~36px / 굵기: 700\n\n## TYPE-04 — 서브 타이틀 (H3)\n크기: 20~24px / 굵기: 600\n\n## TYPE-05 — 카드 타이틀\n크기: 16~20px / 굵기: 600\n\n## TYPE-06 — 본문 (기본)\n크기: 14~16px / 굵기: 400 / 줄간격: 1.7~1.8\n\n## TYPE-07 — 본문 (작게)\n크기: 12~13px / 굵기: 400 / 색상: #888\n\n## TYPE-08 — 라벨/캡션\n크기: 11~12px / 굵기: 600 / 대문자 / 자간 0.5px\n\n## TYPE-09 — 인용구\n크기: 16px / 굵기: 400 기울임 / 좌측 수직선\n\n## TYPE-10 — 숫자/통계\n크기: 40~56px / 굵기: 800 / 강조색\n`,
  },
  'vf_dashboard': {
    'dashboard_overview.md': `---\ntags: [dashboard, overview]\nupdated: 2026-03-23\n---\n\n# 📊 대시보드 — 프로젝트 진행률 관리\n\n> 이 폴더는 프로젝트 진행 현황, 리소스 현황, 이슈 트래킹 등 대시보드 관련 문서를 정리합니다.\n\n---\n\n## 사용 방법\n\n1. 상단 탭의 **📊 대시보드**에서 sitemap 내용을 붙여넣어 파싱합니다.\n2. 파싱된 데이터를 이 폴더의 MD 파일로 정리해 보관합니다.\n3. 진행률·완료·미착수 수치를 주기적으로 갱신하세요.\n\n---\n\n## 폴더 구성 예시\n\n| 파일명 | 용도 |\n|--------|------|\n| dashboard_overview.md | 전체 현황 요약 (이 파일) |\n| sitemap_status.md | 페이지별 상태 스냅샷 |\n| weekly_report.md | 주간 보고 템플릿 |\n| issue_log.md | 이슈 및 블로커 기록 |\n`,
    'sitemap_status.md': `---\ntags: [dashboard, sitemap]\nupdated: 2026-03-23\n---\n\n# 🗺 Sitemap 상태 스냅샷\n\n> 대시보드 탭에서 파싱한 결과를 여기에 붙여넣어 버전 관리하세요.\n\n---\n\n## 최신 스냅샷\n\n*(대시보드 탭 → 🔍 파싱 후 이 파일에 기록)*\n\n| ID | 페이지명 | 기획 | 디자인 | 개발 | 우선순위 |\n|----|---------|------|--------|------|--------|\n| 01 | Home | ✅ done | ⬜ todo | ⬜ todo | P1 |\n\n---\n\n## 변경 이력\n\n| 날짜 | 변경 내용 |\n|------|----------|\n| 2026-03-23 | 초기 생성 |\n`,
    'weekly_report.md': `---\ntags: [dashboard, report]\nupdated: 2026-03-23\n---\n\n# 📋 주간 보고 템플릿\n\n---\n\n## 주간 요약 (YYYY-MM-DD 기준)\n\n| 항목 | 이번 주 | 지난 주 | 변화 |\n|------|--------|--------|------|\n| 전체 페이지 | - | - | - |\n| 완료 | - | - | +- |\n| 진행중 | - | - | +- |\n| 미착수 | - | - | +- |\n| 전체 진행률 | - | - | +- |\n\n---\n\n## 이번 주 완료 항목\n\n- \n\n## 다음 주 예정 항목\n\n- \n\n## 이슈 / 블로커\n\n- \n`,
    'issue_log.md': `---\ntags: [dashboard, issues]\nupdated: 2026-03-23\n---\n\n# 🚨 이슈 & 블로커 로그\n\n---\n\n## 진행 중 이슈\n\n| ID | 내용 | 담당 | 우선순위 | 등록일 |\n|----|------|------|--------|--------|\n| ISS-001 | (이슈 내용) | - | P1 | 2026-03-23 |\n\n---\n\n## 해결된 이슈\n\n| ID | 내용 | 해결일 |\n|----|------|--------|\n| - | - | - |\n`,
  },
  'vf_data': {
    'brand_info.md': `---\ntags: [data, brand]\nupdated: 2026-03-23\n---\n\n# 🗃️ 브랜드 정보 — brand_info\n\n---\n\n## 기본 정보\n\n| 항목 | 내용 |\n|------|------|\n| 회사명 | T51 / 51X Summer Studio |\n| 대표자 | (입력 필요) |\n| 사업자번호 | (입력 필요) |\n| 주소 | (입력 필요) |\n| 대표 이메일 | (입력 필요) |\n| 대표 전화 | (입력 필요) |\n\n---\n\n## SNS 링크\n\n| 채널 | URL |\n|------|-----|\n| Instagram | (입력 필요) |\n| LinkedIn | (입력 필요) |\n| Behance | (입력 필요) |\n| YouTube | (입력 필요) |\n\n---\n\n## 저작권 표기\n\n\`© 2025 T51/51X Summer Studio. All rights reserved.\`\n`,
  },
  'vf_data_copy': {
    '01_Home_copy.md': `---\ntags: [data, copy, page-01]\npage: 01_Home\nupdated: 2026-03-23\n---\n\n# 01 Home — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n- CTA 버튼: (입력 필요)\n`,
    '02_About_Us_copy.md': `---\ntags: [data, copy, page-02]\npage: 02_About_Us\nupdated: 2026-03-23\n---\n\n# 02 About Us — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n`,
    '03_Works_copy.md': `---\ntags: [data, copy, page-03]\npage: 03_Works\nupdated: 2026-03-23\n---\n\n# 03 Works — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n`,
    '04_Story_copy.md': `---\ntags: [data, copy, page-04]\npage: 04_Story\nupdated: 2026-03-23\n---\n\n# 04 Story — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n`,
    '05_T51_AI_copy.md': `---\ntags: [data, copy, page-05]\npage: 05_T51_AI\nupdated: 2026-03-23\n---\n\n# 05 T51 AI — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n`,
    '06_Recruit_copy.md': `---\ntags: [data, copy, page-06]\npage: 06_Recruit\nupdated: 2026-03-23\n---\n\n# 06 Recruit — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n`,
    '07_Contact_copy.md': `---\ntags: [data, copy, page-07]\npage: 07_Contact\nupdated: 2026-03-23\n---\n\n# 07 Contact — 텍스트 문구\n\n---\n\n## Hero 섹션\n\n- 대제목: (입력 필요)\n- 서브타이틀: (입력 필요)\n`,
  },
  'vf_data_assets': {
    'images.md': `---\ntags: [data, assets, images]\nupdated: 2026-03-23\n---\n\n# 🗃️ 이미지 에셋 경로 목록\n\n---\n\n## 공통\n\n| 파일명 | 경로 | 용도 |\n|--------|------|------|\n| logo.svg | /assets/images/logo.svg | 로고 |\n| og-image.jpg | /assets/images/og-image.jpg | OG 썸네일 |\n`,
    'icons.md': `---\ntags: [data, assets, icons]\nupdated: 2026-03-23\n---\n\n# 🗃️ 아이콘 에셋 경로 목록\n\n---\n\n## 아이콘 시스템\n\n| 항목 | 값 |\n|------|----|\n| 라이브러리 | (예: Phosphor Icons / Lucide / 커스텀 SVG) |\n| 기본 크기 | 24×24px |\n| 색상 | 텍스트색 상속 |\n`,
  },
  'vf_page_home': {
    '01_Home.md': `---\ntags: [page, home]\npage-id: "01_Home"\nupdated: 2026-03-23\n---\n\n# 01 Home\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 전체화면 Hero | CTA 버튼 포함 |\n| 2 | Introduction | 스튜디오 소개 | 좌우 2단 |\n| 3 | Works-Preview | 대표 작업 미리보기 | 3열 그리드 |\n| 4 | CTA-Banner | CTA 배너 | |\n`,
  },
  'vf_page_about': {
    '02_About_Us.md': `---\ntags: [page, about]\npage-id: "02_About_Us"\nupdated: 2026-03-23\n---\n\n# 02 About Us\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 페이지 타이틀 Hero | |\n| 2 | Studio-Intro | 스튜디오 소개 | 단일 컬럼 |\n| 3 | Team | 팀 멤버 그리드 | 4열 |\n| 4 | Values | 가치관/비전 | 좌우 2단 |\n`,
  },
  'vf_page_works': {
    '03_Works.md': `---\ntags: [page, works]\npage-id: "03_Works"\nupdated: 2026-03-23\n---\n\n# 03 Works\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 페이지 타이틀 Hero | |\n| 2 | Filter-Tabs | 카테고리 필터 | |\n| 3 | Works-Grid | 포트폴리오 그리드 | 3열 카드 |\n| 4 | Pagination | 페이지네이션 | |\n`,
    '03D_Works_Detail.md': `---\ntags: [page, works, detail]\npage-id: "03D_Works_Detail"\nupdated: 2026-03-23\n---\n\n# 03D Works Detail\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 프로젝트 타이틀 Hero | 풀폭 이미지 |\n| 2 | Project-Info | 프로젝트 기본 정보 | 2열 테이블 |\n| 3 | Content | 프로젝트 상세 콘텐츠 | 단일 컬럼 |\n| 4 | Next-Project | 다음 프로젝트 링크 | |\n`,
  },
  'vf_page_story': {
    '04_Story.md': `---\ntags: [page, story]\npage-id: "04_Story"\nupdated: 2026-03-23\n---\n\n# 04 Story\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 페이지 타이틀 Hero | |\n| 2 | Filter-Tabs | 카테고리 필터 | |\n| 3 | Story-Grid | 콘텐츠 카드 그리드 | 3열 |\n| 4 | Pagination | 페이지네이션 | |\n`,
    '04D_Story_Detail.md': `---\ntags: [page, story, detail]\npage-id: "04D_Story_Detail"\nupdated: 2026-03-23\n---\n\n# 04D Story Detail\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Article-Header | 아티클 헤더 | 카테고리+제목+날짜 |\n| 2 | Article-Content | 본문 | 단일 컬럼 롱폼 |\n| 3 | Related-Posts | 관련 글 | 3열 카드 |\n`,
  },
  'vf_page_t51ai': {
    '05_T51_AI.md': `---\ntags: [page, t51-ai]\npage-id: "05_T51_AI"\nupdated: 2026-03-23\n---\n\n# 05 T51 AI\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 페이지 타이틀 Hero | |\n| 2 | AI-Intro | AI 서비스 소개 | 좌우 2단 |\n| 3 | AI-Products | AI 제품 그리드 | 3열 카드 |\n| 4 | CTA-Banner | CTA 배너 | |\n`,
    '05D_T51_AI_Detail.md': `---\ntags: [page, t51-ai, detail]\npage-id: "05D_T51_AI_Detail"\nupdated: 2026-03-23\n---\n\n# 05D T51 AI Detail\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | AI 제품 타이틀 Hero | |\n| 2 | Product-Detail | 제품 상세 설명 | 단일 컬럼 |\n| 3 | Features | 기능 목록 | 4열 아이콘 카드 |\n| 4 | CTA-Banner | CTA 배너 | |\n`,
  },
  'vf_page_recruit': {
    '06_Recruit.md': `---\ntags: [page, recruit]\npage-id: "06_Recruit"\nupdated: 2026-03-23\n---\n\n# 06 Recruit\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 페이지 타이틀 Hero | |\n| 2 | Culture | 스튜디오 문화 소개 | 좌우 2단 |\n| 3 | Positions | 채용 포지션 목록 | 카드 리스트 |\n| 4 | Apply-CTA | 지원 안내 CTA | |\n`,
  },
  'vf_page_contact': {
    '07_Contact.md': `---\ntags: [page, contact]\npage-id: "07_Contact"\nupdated: 2026-03-23\n---\n\n# 07 Contact\n\n공통 참조: [[_shared/common_settings.md]] | [[_shared/global_components.md]]\n\n---\n\n## 섹션 구성\n\n| 순서 | 섹션 ID | 섹션명 | 비고 |\n|------|---------|--------|------|\n| 1 | Hero | 페이지 타이틀 Hero | |\n| 2 | Contact-Form | 문의 폼 | FORM-06 사용 |\n| 3 | Contact-Info | 연락처/주소 정보 | 좌우 2단 |\n`,
  },
};

function vaultResetToDefault() {
  if (!confirm('⚠️ Vault를 초기화하면 기존 폴더와 파일이 모두 삭제되고\nT51_Website_MD 기본 구조로 리셋됩니다.\n\n계속할까요?')) return;
  // wps_ 로 시작하는 vault 관련 키 전체 삭제
  // 현재 유저 네임스페이스에서 wps_v 로 시작하는 키만 삭제
  _ls.keys('wps_v').forEach(k => _ls.remove(k));
  // 재초기화
  _vaultOpenNodes.clear();
  _vaultOpenNodes.add('vf_root');
  vaultInit();
  vaultActiveFolderId = null;
  vaultActiveFile = null;
  showToast('✅ Vault가 기본 구조로 초기화됐습니다!');
}

function vaultInit() {
  let folders = vaultGetFolders();
  if (folders.length === 0) {
    _ls.set(VAULT_KEY, JSON.stringify(VAULT_BUILTIN_FOLDERS));
    for (const [fid, files] of Object.entries(VAULT_BUILTIN_FILES)) {
      for (const [fname, content] of Object.entries(files)) {
        _ls.set(VAULT_FILE(fid, fname), content);
      }
    }
  }
  vaultRenderFolders();
  vaultUpdateTreeSummary();
}

function vaultGetFolders() {
  try { return JSON.parse(_ls.get(VAULT_KEY)) || []; } catch { return []; }
}
function vaultSaveFolders(list) { _ls.set(VAULT_KEY, JSON.stringify(list)); }

function vaultGetFiles(folderId) {
  const prefix = `wps_vf_${folderId}_`;
  return _ls.keys(prefix).map(k => k.slice(prefix.length)).sort();
}

/* ── 트리 요약 통계 업데이트 ── */
function vaultUpdateTreeSummary() {
  const folders = vaultGetFolders();
  let totalFiles = 0;
  // vf_root는 폴더 카운트에서 제외, 파일 보유 노드만 카운트
  const fileFolders = folders.filter(f => f.id !== 'vf_root');
  fileFolders.forEach(f => {
    totalFiles += vaultGetFiles(f.id).length;
  });
  const fEl = document.getElementById('vstat-folders');
  const fiEl = document.getElementById('vstat-files');
  if (fEl) fEl.textContent = fileFolders.length;
  if (fiEl) fiEl.textContent = totalFiles;
}

/* ── 파일에서 frontmatter tags 추출 ── */
function vaultExtractTags(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return [];
  const tagLine = m[1].split('\n').find(l => l.startsWith('tags:'));
  if (!tagLine) return [];
  const raw = tagLine.replace('tags:', '').trim();
  // [a, b, c] 또는 a, b, c 형태 모두 처리
  return raw.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
}

/* ── 파일 첫 줄 미리보기 (frontmatter 제외) ── */
function vaultExtractPreview(content) {
  const stripped = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const line = stripped.split('\n').find(l => l.trim() && !l.startsWith('#'));
  return line ? line.slice(0, 60) : '';
}

/* ── 현재 정렬 상태 ── */
let _vaultSort = 'name'; // 'name' | 'modified' | 'size'
let _vaultSearchQ = '';

function vaultSetSort(mode) {
  _vaultSort = mode;
  document.querySelectorAll('.vault-sort-btn').forEach(b => b.classList.remove('on'));
  const btn = document.getElementById('vsort-' + mode);
  if (btn) btn.classList.add('on');
  vaultRenderFiles();
}

function vaultSearchFiles(q) {
  _vaultSearchQ = q.trim().toLowerCase();
  vaultRenderFiles();
}

/* ── 트리 열림 상태 관리 ── */
const _vaultOpenNodes = new Set(['vf_root']);

function vaultToggleNode(id, event) {
  event.stopPropagation();
  if (_vaultOpenNodes.has(id)) _vaultOpenNodes.delete(id);
  else _vaultOpenNodes.add(id);
  vaultRenderFolders();
}

function vaultRenderFolders() {
  const el = document.getElementById('vault-folder-list');
  if (!el) return;
  const folders = vaultGetFolders();

  function renderNode(parentId, depth) {
    const children = folders.filter(f => f.parent === parentId);
    if (children.length === 0) return '';
    return children.map(f => {
      const subChildren = folders.filter(c => c.parent === f.id);
      const hasChildren = subChildren.length > 0;
      const isOpen = _vaultOpenNodes.has(f.id);
      const isActive = f.id === vaultActiveFolderId;
      const count = vaultGetFiles(f.id).length;
      const indent = depth * 14;
      const isFile = f.isFile;
      const icon = isFile ? '📄' : (f.icon || '📁');
      const arrowHtml = hasChildren
        ? `<span class="vf-tree-arrow ${isOpen ? 'open' : ''}" onclick="vaultToggleNode('${f.id}', event)">›</span>`
        : `<span class="vf-tree-arrow-placeholder"></span>`;

      return `
        <div class="vf-tree-node">
          <div class="vf-folder-header ${isActive ? 'active' : ''}"
               style="padding-left:${8 + indent}px"
               onclick="vaultSelectFolder('${f.id}')"
               ondblclick="vaultRenameFolderInline('${f.id}',event)"
               title="더블클릭으로 이름 변경"
               draggable="true"
               ondragstart="vaultDragFolderStart(event,'${f.id}')"
               ondragover="vaultDragFolderOver(event,'${f.id}')"
               ondragleave="vaultDragFolderLeave(event)"
               ondrop="vaultDropOnFolder(event,'${f.id}')">
            ${arrowHtml}
            <span class="vf-folder-icon" style="font-size:12px">${icon}</span>
            <span class="vf-folder-name" id="vfname-${f.id}">${escapeHtml(f.name)}</span>
            ${count > 0 ? `<span class="vf-folder-count filled">${count}</span>` : ''}
            ${!f.builtin ? `<button class="section-del" style="width:16px;height:16px;font-size:12px;margin-left:2px" onclick="vaultDeleteFolder('${f.id}',event)" title="삭제">×</button>` : ''}
          </div>
          ${hasChildren && isOpen ? `<div class="vf-tree-children">${renderNode(f.id, depth + 1)}</div>` : ''}
        </div>`;
    }).join('');
  }

  el.innerHTML = renderNode(null, 0);
  vaultUpdateTreeSummary();
}

function vaultRenderFiles() {
  const el = document.getElementById('vault-file-list');
  if (!el) return;
  if (!vaultActiveFolderId) {
    el.innerHTML = '<div style="padding:20px 12px;color:var(--muted);font-size:12px;text-align:center">폴더를 선택하세요</div>';
    document.getElementById('vault-file-count').textContent = '';
    return;
  }
  let files = vaultGetFiles(vaultActiveFolderId);

  // 검색 필터
  if (_vaultSearchQ) {
    files = files.filter(f => f.toLowerCase().includes(_vaultSearchQ));
  }

  // 정렬
  if (_vaultSort === 'size') {
    files = files.slice().sort((a, b) => {
      const sa = (_ls.get(VAULT_FILE(vaultActiveFolderId, a)) || '').length;
      const sb = (_ls.get(VAULT_FILE(vaultActiveFolderId, b)) || '').length;
      return sb - sa;
    });
  } else if (_vaultSort === 'modified') {
    // localStorage에 수정시간 없으므로 저장 순서 역순(키 순서)으로 대체
    files = files.slice().reverse();
  }
  // 'name'은 기본 알파벳순 유지

  const countEl = document.getElementById('vault-file-count');
  if (countEl) countEl.textContent = files.length + '개';

  if (files.length === 0) {
    el.innerHTML = _vaultSearchQ
      ? '<div style="padding:20px 12px;color:var(--muted);font-size:12px;text-align:center">검색 결과가 없습니다</div>'
      : '<div style="padding:20px 12px;color:var(--muted);font-size:12px;text-align:center;line-height:1.6">파일이 없습니다.<br>＋ 파일 버튼으로 추가하세요.</div>';
    return;
  }

  el.innerHTML = files.map(fname => {
    const isActive = vaultActiveFile && vaultActiveFile.folderId === vaultActiveFolderId && vaultActiveFile.name === fname;
    const safeName = fname.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const safeFid  = vaultActiveFolderId.replace(/'/g,"\\'");
    const content  = _ls.get(VAULT_FILE(vaultActiveFolderId, fname)) || '';
    const tags     = vaultExtractTags(content);
    const preview  = vaultExtractPreview(content);
    const size     = content.length > 999 ? (content.length/1000).toFixed(1) + 'K' : content.length + 'B';
    const h2count  = (content.match(/^## /gm) || []).length;

    // 검색어 하이라이트
    let displayName = escapeHtml(fname);
    if (_vaultSearchQ) {
      const idx = fname.toLowerCase().indexOf(_vaultSearchQ);
      if (idx >= 0) {
        displayName = escapeHtml(fname.slice(0, idx))
          + '<mark>' + escapeHtml(fname.slice(idx, idx + _vaultSearchQ.length)) + '</mark>'
          + escapeHtml(fname.slice(idx + _vaultSearchQ.length));
      }
    }

    return `<div class="vf-file ${isActive ? 'active' : ''}" onclick="vaultOpenFile('${safeFid}','${safeName}')"
      draggable="true"
      ondragstart="vaultDragFileStart(event,'${safeFid}','${safeName}')"
      ondragover="event.preventDefault();this.classList.add('drag-over-file')"
      ondragleave="this.classList.remove('drag-over-file')"
      ondrop="this.classList.remove('drag-over-file');vaultDropOnFolder(event,'${safeFid}')">
      <div class="vf-file-top">
        <span class="vf-file-icon">📄</span>
        <span class="vf-file-name">${displayName}</span>
        <button class="vf-file-del" onclick="vaultDeleteFile('${safeFid}','${safeName}',event)" title="삭제">×</button>
      </div>
      ${preview ? `<div class="vf-file-preview">${escapeHtml(preview)}</div>` : ''}
      <div class="vf-file-meta">
        <span class="vf-file-meta-item">${size}</span>
        ${h2count > 0 ? `<span class="vf-file-meta-item">§ ${h2count}</span>` : ''}
      </div>
      ${tags.length > 0 ? `<div class="vf-file-tags">${tags.map(t => `<span class="vf-file-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
}

function vaultOpenFile(folderId, fname) {
  if (vaultDirty) vaultSaveFile(true);
  vaultActiveFile = { folderId, name: fname };
  const content = _ls.get(VAULT_FILE(folderId, fname)) || '';
  const rawEl = document.getElementById('vault-raw-editor');
  rawEl.value = content;
  document.getElementById('vault-current-filename').textContent = fname;
  document.getElementById('vault-editor-empty').style.display = 'none';
  const main = document.getElementById('vault-editor-main');
  main.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden';
  vaultDirty = false;
  vaultSwitchTab('edit');
  vaultRenderFiles();
  vaultRenderOutline(content);
  rawEl.oninput = () => { vaultDirty = true; };
}

/* ── 에디터 입력 시 아웃라인 실시간 업데이트 ── */
let _vaultOutlineTimer = null;
function vaultOnEditorInput() {
  vaultDirty = true;
  clearTimeout(_vaultOutlineTimer);
  _vaultOutlineTimer = setTimeout(() => {
    const content = document.getElementById('vault-raw-editor').value;
    vaultRenderOutline(content);
    vaultSaveFile(true); // 입력이 멈추면 0.4초 뒤에 즉시 파일 자동 저장
  }, 400);
}

/* ── 아웃라인 렌더 ── */
function vaultRenderOutline(content) {
  const listEl  = document.getElementById('vault-outline-list');
  const statsEl = document.getElementById('vault-outline-stats');
  if (!listEl) return;

  // 통계
  const lines   = content.split('\n').length;
  const chars   = content.replace(/\s/g,'').length;
  const h2count = (content.match(/^## /gm) || []).length;
  if (statsEl) {
    statsEl.style.display = 'flex';
    document.getElementById('vo-stat-chars').textContent = chars.toLocaleString();
    document.getElementById('vo-stat-lines').textContent = lines.toLocaleString();
    document.getElementById('vo-stat-h2').textContent    = h2count;
  }

  // 헤딩 추출
  const headings = [];
  content.split('\n').forEach((line, i) => {
    const m = line.match(/^(#{1,4}) (.+)/);
    if (m) headings.push({ level: m[1].length, text: m[2].trim(), line: i });
  });

  if (headings.length === 0) {
    listEl.innerHTML = '<div class="vault-outline-empty">헤딩이 없습니다<br>(# ## ### 사용)</div>';
    return;
  }

  listEl.innerHTML = headings.map(h => {
    const cls = 'h' + h.level;
    const badge = h.level <= 2 ? `<span class="vo-badge">H${h.level}</span>` : '';
    return `<div class="vo-item ${cls}" onclick="vaultJumpToLine(${h.line})" title="${escapeHtml(h.text)}">
      ${badge}<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(h.text)}</span>
    </div>`;
  }).join('');
}

/* ── 아웃라인 클릭 → 에디터 해당 줄로 이동 ── */
function vaultJumpToLine(lineNum) {
  const ta = document.getElementById('vault-raw-editor');
  if (!ta) return;
  const lines = ta.value.split('\n');
  let pos = 0;
  for (let i = 0; i < lineNum && i < lines.length; i++) pos += lines[i].length + 1;
  ta.focus();
  ta.setSelectionRange(pos, pos + (lines[lineNum] || '').length);
  // 스크롤 추정
  const lineH = parseInt(getComputedStyle(ta).lineHeight) || 22;
  ta.scrollTop = lineNum * lineH - ta.clientHeight / 2;
}

function vaultSaveFile(silent) {
  if (!vaultActiveFile) return;
  const content = document.getElementById('vault-raw-editor').value;
  _ls.set(VAULT_FILE(vaultActiveFile.folderId, vaultActiveFile.name), content);
  vaultDirty = false;
  vaultUpdateTreeSummary();
  if (!silent) showToast('💾 저장됐습니다');
}

function vaultSwitchTab(tab) {
  const editBtn    = document.getElementById('vtab-edit');
  const previewBtn = document.getElementById('vtab-preview');
  const raw        = document.getElementById('vault-raw-editor');
  const preview    = document.getElementById('vault-preview-area');
  if (!editBtn) return;
  editBtn.classList.toggle('active', tab === 'edit');
  previewBtn.classList.toggle('active', tab === 'preview');
  if (tab === 'edit') {
    raw.style.display = 'block'; raw.classList.add('active');
    preview.style.display = 'none'; preview.classList.remove('active');
  } else {
    raw.style.display = 'none'; raw.classList.remove('active');
    preview.style.display = 'block'; preview.classList.add('active');
    preview.innerHTML = vaultRenderMarkdown(raw.value);
    preview.querySelectorAll('.wikilink').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); vaultJumpToWikilink(a.dataset.target); })
    );
  }
}

function vaultRenderMarkdown(md) {
  // frontmatter
  md = md.replace(/^---\n([\s\S]*?)\n---\n?/, (_, fm) => {
    const lines = fm.split('\n').map(l => {
      const idx = l.indexOf(':');
      if (idx < 0) return `<div>${escapeHtml(l)}</div>`;
      return `<div><span class="fm-label">${escapeHtml(l.slice(0,idx))}:</span> ${escapeHtml(l.slice(idx+1).trim())}</div>`;
    }).join('');
    return `<div class="fm-block">${lines}</div>\n`;
  });
  // wikilinks
  md = md.replace(/\[\[([^\]]+)\]\]/g, (_, t) =>
    `<a class="wikilink" data-target="${escapeHtml(t)}" href="#">[[${escapeHtml(t)}]]</a>`);
  // code blocks
  md = md.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${escapeHtml(code)}</code></pre>`);
  // inline code  (백틱을 \x60으로 표기해 JS 파서 혼란 방지)
  const inlineCodeRe = new RegExp('\x60([^\x60\\n]+)\x60', 'g');
  md = md.replace(inlineCodeRe, (_, c) => '<code>' + escapeHtml(c) + '</code>');
  // bold+italic
  md = md.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  // headings
  md = md.replace(/^###### (.+)$/gm,'<h6>$1</h6>');
  md = md.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  md = md.replace(/^#### (.+)$/gm,  '<h4>$1</h4>');
  md = md.replace(/^### (.+)$/gm,   '<h3>$1</h3>');
  md = md.replace(/^## (.+)$/gm,    '<h2>$1</h2>');
  md = md.replace(/^# (.+)$/gm,     '<h1>$1</h1>');
  // hr
  md = md.replace(/^---$/gm, '<hr>');
  // tables
  md = md.replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\n?)*)/gm, (_, hdr, rows) => {
    const ths = hdr.split('|').filter(c=>c.trim()).map(c=>`<th>${c.trim()}</th>`).join('');
    const trs = rows.trim().split('\n').filter(Boolean).map(row => {
      const tds = row.split('|').filter(c=>c.trim()).map(c=>`<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });
  // blockquotes
  md = md.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // lists
  md = md.replace(/(^[-*] .+\n?)+/gm, m => `<ul>${m.replace(/^[-*] (.+)$/gm,'<li>$1</li>')}</ul>`);
  md = md.replace(/(^\d+\. .+\n?)+/gm, m => `<ol>${m.replace(/^\d+\. (.+)$/gm,'<li>$1</li>')}</ol>`);
  // paragraphs
  const blocks = md.split(/\n\n+/);
  return blocks.map(p => {
    p = p.trim();
    if (!p) return '';
    if (/^<(h[1-6]|ul|ol|pre|blockquote|table|hr|div)/.test(p)) return p;
    return `<p>${p.replace(/\n/g,'<br>')}</p>`;
  }).join('\n');
}

function vaultJumpToWikilink(target) {
  const fname = target.endsWith('.md') ? target : target + '.md';
  const folders = vaultGetFolders();
  for (const f of folders) {
    if (vaultGetFiles(f.id).includes(fname)) {
      vaultSelectFolder(f.id);
      vaultOpenFile(f.id, fname);
      return;
    }
  }
  showToast(`📄 "${fname}" 파일을 찾을 수 없습니다`);
}

// ══════════════════════════════════
// VAULT 드래그 앤 드롭 (폴더·파일 이동)
// ══════════════════════════════════
let _vaultDragFile = null;   // { folderId, name }
let _vaultDragFolder = null; // folderId

/* 파일 드래그 시작 */
function vaultDragFileStart(event, fid, fname) {
  _vaultDragFile = { folderId: fid, name: fname };
  _vaultDragFolder = null;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', fname);
}

/* 폴더 드래그 시작 */
function vaultDragFolderStart(event, fid) {
  const folders = vaultGetFolders();
  const f = folders.find(x => x.id === fid);
  if (!f || f.builtin) { event.preventDefault(); return; }
  _vaultDragFolder = fid;
  _vaultDragFile = null;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', fid);
}

/* 폴더 위에 드래그오버 */
function vaultDragFolderOver(event, targetFid) {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('drag-over-folder');
}

/* 폴더에서 드래그리브 */
function vaultDragFolderLeave(event) {
  event.currentTarget.classList.remove('drag-over-folder');
}

/* 폴더 위에 드롭 — 파일을 해당 폴더로 이동 */
function vaultDropOnFolder(event, targetFid) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.remove('drag-over-folder');

  if (_vaultDragFile) {
    // 파일 이동
    const { folderId: srcFid, name: fname } = _vaultDragFile;
    if (srcFid === targetFid) return;
    const content = _ls.get(VAULT_FILE(srcFid, fname));
    if (content === null) return;
    const existing = _ls.get(VAULT_FILE(targetFid, fname));
    if (existing !== null && !confirm(`"${fname}"이 대상 폴더에 이미 존재합니다. 덮어쓸까요?`)) return;
    _ls.set(VAULT_FILE(targetFid, fname), content);
    _ls.remove(VAULT_FILE(srcFid, fname));
    if (vaultActiveFile && vaultActiveFile.folderId === srcFid && vaultActiveFile.name === fname) {
      vaultActiveFile = { folderId: targetFid, name: fname };
    }
    _vaultOpenNodes.add(targetFid);
    vaultRenderFolders();
    vaultRenderFiles();
    vaultUpdateTreeSummary();
    showToast(`📁 "${fname}"을 이동했습니다`);
    _vaultDragFile = null;
  } else if (_vaultDragFolder) {
    // 폴더 이동 (부모 변경)
    const srcFid = _vaultDragFolder;
    if (srcFid === targetFid) return;
    const folders = vaultGetFolders();
    const srcFolder = folders.find(f => f.id === srcFid);
    if (!srcFolder || srcFolder.builtin) return;
    // 순환 방지: targetFid가 srcFid의 자손인지 확인
    function isDescendant(parentId, childId) {
      const children = folders.filter(f => f.parent === parentId);
      for (const c of children) {
        if (c.id === childId || isDescendant(c.id, childId)) return true;
      }
      return false;
    }
    if (isDescendant(srcFid, targetFid)) { showToast('❌ 자기 자신의 하위로 이동할 수 없습니다'); return; }
    srcFolder.parent = targetFid;
    vaultSaveFolders(folders);
    _vaultOpenNodes.add(targetFid);
    vaultRenderFolders();
    showToast(`📁 폴더를 이동했습니다`);
    _vaultDragFolder = null;
  }
}

let _vaultFolderRenaming = false;

function vaultRenameFolderInline(fid, e) {
  e.stopPropagation();
  if (_vaultFolderRenaming) return;
  const nameEl = document.getElementById('vfname-' + fid);
  if (!nameEl) return;
  const folders = vaultGetFolders();
  const folder = folders.find(f => f.id === fid);
  if (!folder) return;
  _vaultFolderRenaming = true;
  const current = folder.name;
  const input = document.createElement('input');
  input.style.cssText = 'flex:1;min-width:0;background:var(--surface);border:1px solid var(--accent);border-radius:4px;color:var(--text);font-size:12px;font-weight:600;padding:1px 5px;outline:none;font-family:inherit;max-width:130px;';
  input.value = current;
  nameEl.replaceWith(input);
  input.focus(); input.select();
  let committed = false;
  function commit() {
    if (committed) return;
    committed = true;
    _vaultFolderRenaming = false;
    const newName = input.value.trim() || current;
    folder.name = newName;
    vaultSaveFolders(folders);
    vaultRenderFolders();
    // 파일 패널 제목도 갱신
    const titleEl = document.getElementById('vault-files-pane-title');
    if (titleEl && vaultActiveFolderId === fid) titleEl.textContent = newName;
    if (newName !== current) showToast(`✅ "${newName}"으로 변경됐습니다`);
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { committed = true; _vaultFolderRenaming = false; vaultRenderFolders(); }
  });
  input.addEventListener('click', ev => ev.stopPropagation());
  input.addEventListener('dblclick', ev => ev.stopPropagation());
}

function vaultSelectFolder(fid) {
  if (_vaultFolderRenaming) return;
  if (vaultDirty) vaultSaveFile(true);
  vaultActiveFolderId = fid;
  const folders = vaultGetFolders();
  const folder = folders.find(f => f.id === fid);
  const titleEl = document.getElementById('vault-files-pane-title');
  if (titleEl) titleEl.textContent = folder ? folder.name : '파일';
  // 검색창 초기화
  const si = document.getElementById('vault-search-input');
  if (si) { si.value = ''; _vaultSearchQ = ''; }
  vaultRenderFolders();
  vaultRenderFiles();
}

function vaultAddFolder() {
  const name = prompt('새 폴더 이름:');
  if (!name || !name.trim()) return;
  const folders = vaultGetFolders();
  const id = 'vf_' + Date.now();
  // 현재 선택된 폴더 하위에 추가, 없으면 루트(vf_root) 하위
  const parentId = vaultActiveFolderId || 'vf_root';
  folders.push({ id, name: name.trim(), icon: '📁', builtin: false, parent: parentId });
  vaultSaveFolders(folders);
  _vaultOpenNodes.add(parentId);
  vaultRenderFolders();
  showToast('📁 폴더가 추가됐습니다');
}

function vaultDeleteFolder(fid, e) {
  e.stopPropagation();
  const folders = vaultGetFolders();
  const f = folders.find(x => x.id === fid);
  if (!f || f.builtin) return;
  if (!confirm(`"${f.name}" 폴더와 안의 모든 파일을 삭제할까요?`)) return;
  vaultGetFiles(fid).forEach(fname => _ls.remove(VAULT_FILE(fid, fname)));
  vaultSaveFolders(folders.filter(x => x.id !== fid));
  if (vaultActiveFolderId === fid) { vaultActiveFolderId = null; vaultActiveFile = null; }
  vaultRenderFolders();
  vaultRenderFiles();
  vaultUpdateTreeSummary();
  showToast('🗑 삭제됐습니다');
}

function vaultNewFile() {
  if (!vaultActiveFolderId) { showToast('❌ 먼저 폴더를 선택하세요'); return; }
  const name = prompt('새 파일 이름 (.md):');
  if (!name || !name.trim()) return;
  const fname = name.trim().endsWith('.md') ? name.trim() : name.trim() + '.md';
  const existing = _ls.get(VAULT_FILE(vaultActiveFolderId, fname));
  if (existing !== null && !confirm(`"${fname}"이 이미 존재합니다. 덮어쓸까요?`)) return;
  _ls.set(VAULT_FILE(vaultActiveFolderId, fname), `# ${fname.replace('.md','')}\n\n`);
  vaultRenderFolders();
  vaultRenderFiles();
  vaultOpenFile(vaultActiveFolderId, fname);
  showToast('📄 파일이 생성됐습니다');
}

function vaultDeleteFile(fid, fname, e) {
  e.stopPropagation();
  if (!confirm(`"${fname}"을 삭제할까요?`)) return;
  _ls.remove(VAULT_FILE(fid, fname));
  if (vaultActiveFile && vaultActiveFile.folderId === fid && vaultActiveFile.name === fname) {
    vaultActiveFile = null; vaultDirty = false;
    const empty = document.getElementById('vault-editor-empty');
    const main  = document.getElementById('vault-editor-main');
    if (empty) empty.style.display = 'flex';
    if (main)  main.style.display  = 'none';
  }
  vaultRenderFolders();
  vaultRenderFiles();
  showToast('🗑 삭제됐습니다');
}

function vaultInsertFmt(before, after) {
  const ta = document.getElementById('vault-raw-editor');
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.slice(s, e) || '텍스트';
  ta.value = ta.value.slice(0, s) + before + sel + after + ta.value.slice(e);
  ta.selectionStart = s + before.length;
  ta.selectionEnd   = s + before.length + sel.length;
  ta.focus(); vaultDirty = true;
}
function vaultInsertLine(prefix) {
  const ta = document.getElementById('vault-raw-editor');
  const pos = ta.selectionStart;
  const before = ta.value.slice(0, pos);
  const after  = ta.value.slice(pos);
  const nl = (before === '' || before.endsWith('\n')) ? '' : '\n';
  ta.value = before + nl + prefix + '\n' + after;
  ta.selectionStart = ta.selectionEnd = before.length + nl.length + prefix.length + 1;
  ta.focus(); vaultDirty = true;
}
function vaultInsertTable() {
  vaultInsertAtCursor('\n| 항목 | 내용 |\n|------|------|\n| 값 1 | 내용 1 |\n| 값 2 | 내용 2 |\n');
}
function vaultInsertCodeBlock() {
  vaultInsertAtCursor('\n```\n코드를 입력하세요\n```\n');
}
function vaultInsertAtCursor(text) {
  const ta = document.getElementById('vault-raw-editor');
  const pos = ta.selectionStart;
  ta.value = ta.value.slice(0, pos) + text + ta.value.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos + text.length;
  ta.focus(); vaultDirty = true;
}

let _vaultSaveFileName = '';

function openInsertToVaultModal() {
  const content = document.getElementById('output-md').textContent.trim();
  if (!content) { showToast('❌ 먼저 프롬프트를 생성하세요'); return; }
  // 파일명 계산
  const titleMatch = content.match(/^# (.+)/m);
  const proj = document.getElementById('p-project').value.trim() || 'prompt';
  const dateStr = new Date().toISOString().slice(0,10);
  const raw = titleMatch ? titleMatch[1] : proj;
  const safeName = raw.replace(/[^\w가-힣\- ]/g,'').trim().replace(/ /g,'-') || 'prompt';
  _vaultSaveFileName = `${dateStr}-${safeName}.md`;
  // 파일명 미리보기
  const preview = document.getElementById('vault-save-fname-preview');
  if (preview) preview.textContent = _vaultSaveFileName;
  // 폴더 목록 채우기 (파일 저장 가능한 폴더만: isFile 아닌 것)
  const sel = document.getElementById('vault-save-folder-select');
  if (sel) {
    const folders = vaultGetFolders().filter(f => !f.isFile);
    sel.innerHTML = folders.map(f => {
      const depth = getVaultFolderDepth(f, folders);
      const indent = '\u00A0\u00A0'.repeat(depth);
      return `<option value="${f.id}">${indent}${f.icon || '📁'} ${f.name}</option>`;
    }).join('');
    // 현재 선택된 폴더가 있으면 기본 선택
    if (vaultActiveFolderId) {
      const opt = sel.querySelector(`option[value="${vaultActiveFolderId}"]`);
      if (opt) sel.value = vaultActiveFolderId;
    }
  }
  document.getElementById('vault-save-modal').classList.add('open');
}

function getVaultFolderDepth(folder, allFolders, depth) {
  depth = depth || 0;
  if (!folder.parent) return depth;
  const parent = allFolders.find(f => f.id === folder.parent);
  if (!parent) return depth;
  return getVaultFolderDepth(parent, allFolders, depth + 1);
}

function closeVaultSaveModal() {
  document.getElementById('vault-save-modal').classList.remove('open');
}

function confirmInsertToVault() {
  const content = document.getElementById('output-md').textContent.trim();
  if (!content) { closeVaultSaveModal(); return; }
  const sel = document.getElementById('vault-save-folder-select');
  const targetFid = sel ? sel.value : 'vf_pages';
  const fname = _vaultSaveFileName;
  _ls.set(VAULT_FILE(targetFid, fname), content);
  closeVaultSaveModal();
  // Vault 탭으로 이동
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-vault').classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => { if (t.textContent.includes('MD Vault')) t.classList.add('active'); });
  setTimeout(() => {
    _vaultOpenNodes.add(targetFid);
    // 부모 노드들도 펼치기
    const folders = vaultGetFolders();
    let cur = folders.find(f => f.id === targetFid);
    while (cur && cur.parent) { _vaultOpenNodes.add(cur.parent); cur = folders.find(f => f.id === cur.parent); }
    vaultSelectFolder(targetFid);
    vaultOpenFile(targetFid, fname);
    showToast(`🗂 "${fname}" 저장 완료!`);
  }, 60);
}

function insertPromptToVault() {
  openInsertToVaultModal();
}

// Ctrl+S / Cmd+S 저장
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    const vp = document.getElementById('page-vault');
    if (vp && vp.classList.contains('active')) { e.preventDefault(); vaultSaveFile(false); }
  }
});

// ══════════════════════════════════
// VAULT 내보내기 / 가져오기
// ══════════════════════════════════

/* ── 전체 내보내기: 폴더별 ZIP 없이 각 파일을 순차 다운로드 ── */
function vaultExportAll() {
  const folders = vaultGetFolders();
  let totalFiles = 0;
  const downloads = [];
  folders.forEach(f => {
    const files = vaultGetFiles(f.id);
    files.forEach(fname => {
      const content = _ls.get(VAULT_FILE(f.id, fname)) || '';
      downloads.push({ fname, content, folderName: f.name });
      totalFiles++;
    });
  });
  if (totalFiles === 0) { showToast('❌ 내보낼 파일이 없습니다'); return; }

  // 단일 파일이면 바로 다운로드, 여러 파일이면 모달로 선택
  if (!confirm(`Vault의 파일 ${totalFiles}개를 모두 다운로드할까요?\n(각 파일이 순서대로 다운로드됩니다)`)) return;

  let i = 0;
  function downloadNext() {
    if (i >= downloads.length) {
      showToast(`📤 ${totalFiles}개 파일 내보내기 완료`);
      return;
    }
    const { fname, content } = downloads[i++];
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    setTimeout(downloadNext, 150);
  }
  downloadNext();
}

/* ── 현재 열린 파일만 내보내기 ── */
function vaultExportCurrentFile() {
  if (!vaultActiveFile) { showToast('❌ 먼저 파일을 선택하세요'); return; }
  const content = document.getElementById('vault-raw-editor').value;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = vaultActiveFile.name;
  a.click();
  showToast(`📤 "${vaultActiveFile.name}" 내보내기 완료`);
}

/* ── 파일 선택 가져오기 트리거 ── */
function vaultImportFiles() {
  document.getElementById('vault-import-file-input').value = '';
  document.getElementById('vault-import-file-input').click();
}

/* ── 폴더 열기 가져오기 트리거 ── */
function vaultImportFolder() {
  document.getElementById('vault-import-folder-input').value = '';
  document.getElementById('vault-import-folder-input').click();
}

/* ── 공통: 선택된 파일들 처리 ── */
function vaultHandleImportFiles(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  // md / txt 파일만 필터
  const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.txt'));
  if (mdFiles.length === 0) { showToast('❌ .md 또는 .txt 파일을 선택하세요'); return; }

  // 가져올 대상 폴더 결정
  const targetFolderId = vaultActiveFolderId || (() => {
    // 활성 폴더가 없으면 기본 폴더(vf_pages) 선택
    const folders = vaultGetFolders();
    return folders.length > 0 ? folders[0].id : 'vf_pages';
  })();
  const folders = vaultGetFolders();
  const targetFolder = folders.find(f => f.id === targetFolderId);
  const folderName = targetFolder ? targetFolder.name : '선택된 폴더';

  if (!confirm(`${mdFiles.length}개의 파일을 "${folderName}" 폴더에 가져올까요?\n이미 같은 이름의 파일이 있으면 덮어씁니다.`)) return;

  let loaded = 0;
  let lastName = '';
  mdFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const fname = file.name.endsWith('.md') ? file.name : file.name.replace(/\.txt$/, '.md');
      _ls.set(VAULT_FILE(targetFolderId, fname), content);
      loaded++;
      lastName = fname;
      if (loaded === mdFiles.length) {
        vaultRenderFolders();
        // 폴더 선택 및 마지막 파일 열기
        if (vaultActiveFolderId !== targetFolderId) {
          vaultSelectFolder(targetFolderId);
        } else {
          vaultRenderFiles();
        }
        vaultOpenFile(targetFolderId, lastName);
        showToast(`📂 ${loaded}개 파일을 "${folderName}"에 가져왔습니다`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  });
}function loadHistory(id) {
  const historyList = getHistory();
  const item = historyList.find(h => h.id === id);
  if (!item) return;

  currentHistoryId = id;
  
  // state나 data 중 들어있는 알맹이를 무조건 찾아냄
  const stateData = item.state || item.data || {};
  applyProjectState(stateData);

  document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.querySelector(`.history-item[data-id="${id}"]`);
  if (activeEl) activeEl.classList.add('active');
}
// [기존 함수 덮어쓰기] 히스토리 삭제 함수
async function deleteHistory(id, event) {
  if (event) event.stopPropagation();
  if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;

  const historyList = getHistory();
  const itemIndex = historyList.findIndex(h => h.id === id);
  if (itemIndex === -1) return;

  historyList.splice(itemIndex, 1);
  saveHistory(historyList);

  if (currentHistoryId === id) {
    newProject();
  } else {
    renderHistoryList();
  }
  showToast('🗑️ 프로젝트가 삭제되었습니다.');
}
async function deleteFromHistory(id, e) {
  if (e) e.stopPropagation();

  const list = getHistory();
  const item = list.find(h => h.id === id);
  if (!item) return;

  // 삭제 확인 창
  if (!confirm(`"${item.name}" 항목을 삭제할까요?`)) return;

  // 2. 브라우저 목록에서 제거
  const newList = list.filter(h => h.id !== id);
  saveHistory(newList);

  // 3. 현재 열려있는 프로젝트를 삭제한 경우, 새 프로젝트 상태로 리셋
  if (currentHistoryId === id) {
    if (typeof newProject === 'function') {
      newProject();
    } else {
      currentHistoryId = null;
    }
  }

  renderHistoryList();
  showToast('🗑️ 프로젝트가 완벽하게 삭제되었습니다.');
}
