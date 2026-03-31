/* ── 01-config — 로그인 게이트, 스토리지 래퍼, 전역 상수·변수 ── */

/* ── T51X Summer Studio — app.js ── */

// ══════════════════════════════════════════════════
// 로그인 게이트 & ID 기반 스토리지 네임스페이스
// localStorage 기반 (로컬 파일 file:// 환경 호환)
// ══════════════════════════════════════════════════
(function() {
  // 로그인 토큰 확인 (localStorage 사용 — file:// 환경에서도 파일간 유지됨)
  const user = localStorage.getItem('51x_session_user');
  if (!user) {
    window.location.href = 'login.html';
  }
})();

function getCurrentUser() {
  return localStorage.getItem('51x_session_user') || 'guest';
}

// 모든 localStorage 키를 user-id 네임스페이스로 격리
function _sk(key) {
  return '51x_' + getCurrentUser() + '_' + key;
}

// localStorage 래퍼 (전역에서 사용)
const _ls = {
  get: (k)    => localStorage.getItem(_sk(k)),
  set: (k, v) => localStorage.setItem(_sk(k), v),
  remove: (k) => localStorage.removeItem(_sk(k)),
  // 현재 유저 키 전체 리스트
  keys: (prefix) => {
    const ns = '51x_' + getCurrentUser() + '_' + (prefix || '');
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(ns)) result.push(k.slice(('51x_' + getCurrentUser() + '_').length));
    }
    return result;
  }
};

function logout() {
  localStorage.removeItem('51x_session_user');
  window.location.href = 'login.html';
}

// DOM 준비 후 유저 표시
// (유저 표시는 initApp()에서 처리)

// ══════════════════════════════════
// SECTION TYPES DATA
// ══════════════════════════════════
const SL_SPECS = {
  'SL-hero-fullscreen': { name: '전체화면 Hero', spec: '배경 이미지 100%×480~600px #EEEEEE 크로스 / 대제목 48~64px 굵게 중앙 / 서브 18~20px 회색 / CTA 버튼 선택 / 페이지번호 우측하단' },
  'SL-hero-split': { name: '좌우분할 Hero', spec: '좌측 50%: 소제목 24~28px + 수평선 + 본문 4~5줄 14px + 버튼 선택 / 우측 50%: 이미지 100%×320px #EEEEEE' },
  'SL-hero-image-overlay': { name: '이미지+오버레이 Hero', spec: '이미지 100%×400px #EEEEEE 크로스 / 오버레이 위치 중앙(기본) 또는 좌하단(Detail형) / 대제목 48px 굵게 / 서브 18px 회색' },
  'SL-content-twocol': { name: '좌우 2단 본문', spec: '좌측 50%: 소제목 24px + 수평선 + 본문 4~5줄×2블록 14px + 버튼 선택 / 우측 50%: 이미지 100%×320px #EEEEEE' },
  'SL-content-singlecol': { name: '단일 컬럼 본문', spec: '중앙정렬 max 800px / 블록 조합: 텍스트 16px 줄간격 1.8 / 소제목 22px / 인용구 좌측수직선+16px기울임 / 이미지 본문폭 800×480px / 풀폭 100%×600px / 2열 48%×360px / 태그영역' },
  'SL-content-quote': { name: '인용구 블록', spec: '좌측 4px 굵은 수직선 / 들여쓰기 텍스트 16px 기울임 회색 / max 800px 단일컬럼 내에서 사용' },
  'SL-grid-card3': { name: '3열 카드 그리드', spec: '카드 3열 gap 24px / 이미지 상단 70~80% #EEEEEE 크로스 / 텍스트 하단 / 카드 높이 280~340px / 클릭 동작 주석 필수' },
  'SL-grid-card4': { name: '4열 카드 그리드', spec: '카드 4열 균등 / ICON 박스 60×60px 테두리 중앙 / 제목 16px 굵게 / 설명 13px 회색 2~3줄 / 전체 중앙 정렬' },
  'SL-grid-masonry': { name: '메이슨리 그리드', spec: '다양한 높이 카드 혼합 / 열 3개 기본 / 이미지 크기 다양하게' },
  'SL-stats-bar': { name: '수치 하이라이트 띠', spec: '배경 #F5F5F5 전체폭 높이 160px / 4항목 균등 배치 / 숫자 [00+] 36px 굵게 / 라벨 14px 회색' },
  'SL-gallery-full': { name: '풀폭 이미지 갤러리', spec: '풀폭 100%×700px → 2열 48%×480px×2 → 풀폭 100%×700px → 3열 31%×320px×3 순서로 구성' },
  'SL-gallery-mixed': { name: '혼합 갤러리', spec: '다양한 비율 이미지 혼합 / 3열 기본 / gap 16px' },
  'SL-form-contact': { name: '문의 폼', spec: '소제목+수평선 / 키워드 태그 pill 가로나열 / 인풋 2열(회사명+담당인 / 연락처+이메일) / 텍스트에어리어 전체폭 180px / 파일첨부 / 개인정보 체크박스 / 제출버튼 200×48px 중앙' },
  'SL-form-apply': { name: '지원/신청 폼', spec: '개인정보 인풋 2열 / 파일첨부 (25MB 이하) / 개인정보처리방침 동의 체크박스 / 제출버튼' },
  'SL-filter-tabs': { name: '필터 탭', spec: '탭 버튼 테두리박스 13px 가로나열 / 선택상태 배경 #000 텍스트 #FFF 반전 / 탭 수 3~6개 권장' },
  'SL-pagination': { name: '페이지네이션', spec: '[ < ] [ 1 ] [ 2 ] [ 3 ] [ … ] [ N ] [ > ] 중앙정렬 / 영역 높이 60px / 버튼 40×40px / 현재페이지 강조' },
  'SL-cta-banner': { name: 'CTA 배너', spec: '대형 텍스트 2줄 36~40px 굵게 좌측정렬 / CTA 버튼 200×48px' },
  'SL-logo-strip': { name: '로고/파트너 띠', spec: '배경 흰색 상하 1px 선 높이 100px / 소제목 16px 굵게 좌측 / LOGO 박스 ×6개 120×40px 테두리 균등간격' },
  'SL-list-table': { name: '테이블 리스트', spec: '2열 테이블 (항목|내용) / 각 행 높이 60~80px / 하단 구분선' },
  'SL-list-accordion': { name: '아코디언 리스트', spec: '질문 텍스트 행 + 클릭 펼침 답변 / 화살표 아이콘 우측' },
  '커스텀': { name: '커스텀 섹션', spec: '특이사항에 직접 스펙을 입력하세요' },
};

// ══════════════════════════════════
// PROMPT SECTIONS STATE
// ══════════════════════════════════
let promptSections = [];   // 레거시/프리셋 호환용
let pageSections   = {};   // { pageId: [{type,note}, ...] }
let _activePageTab = null;
let genSections = [];
let promptPages = [];

