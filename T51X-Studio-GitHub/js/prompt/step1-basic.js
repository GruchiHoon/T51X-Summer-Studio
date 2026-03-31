/* ── prompt/step1-basic.js
   스텝 1-A: 프로젝트 기본 정보
   - 프로젝트명, 클라이언트명, 특이사항/추가 요구사항
   ▸ 새 기본 정보 필드 추가 시 renderStep1Basic() 안에 추가
─────────────────────────────────────────────────────── */

function renderStep1Basic() {
  return /* html */`
    <!-- 1-A: 기본 정보 -->
    <div class="form-row">
      <div>
        <label>프로젝트명</label>
        <input id="p-project" placeholder="T51 홈페이지 리뉴얼">
      </div>
      <div>
        <label>클라이언트명</label>
        <input id="p-client" placeholder="클라이언트명">
      </div>
    </div>
    <div class="form-row full">
      <label>클라이언트 특이사항 / 추가 요구사항</label>
      <textarea id="p-notes" placeholder="예: T51과 T51X 두 브랜드 동시 소개, Spring AI 현재 운영중(LIVE), SEO 메타태그 포함 필요...">T51(더피프티원)과 T51X 두 브랜드를 동시에 소개. Spring AI: 현재 운영 중인 AI 프로젝트(LIVE). 순수 와이어프레임 스타일.</textarea>
    </div>
  `;
}
