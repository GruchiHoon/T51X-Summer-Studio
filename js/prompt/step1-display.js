/* ── prompt/step1-display.js
   스텝 1-B: 화면·디스플레이 설정
   - 폰트, 기준 해상도, 비율, 와이어프레임 스타일, 반응형, 색상 테마
   ▸ 브랜드컬러 피커, 다크모드 프리뷰 등 새 컴포넌트는 renderStep1Display() 안에 추가
─────────────────────────────────────────────────────── */

function renderStep1Display() {
  return /* html */`
    <!-- 1-B: 디스플레이 설정 -->
    <div class="form-row triple">
      <div>
        <label>폰트</label>
        <input id="p-font" value="Pretendard" placeholder="Pretendard">
      </div>
      <div>
        <label>기준 해상도</label>
        <input id="p-resolution" value="1920×1080px" placeholder="1920×1080px">
      </div>
      <div>
        <label>기준 비율</label>
        <select id="p-ratio">
          <option value="16:9">16:9 (기본)</option>
          <option value="16:10">16:10</option>
          <option value="4:3">4:3</option>
          <option value="자유">자유 (스크롤)</option>
        </select>
      </div>
    </div>
    <div class="form-row triple">
      <div>
        <label>와이어프레임 스타일</label>
        <select id="p-wf-style">
          <option value="순수 와이어프레임 (색상 없음)">순수 와이어프레임</option>
          <option value="로우파이 (회색 계열)">로우파이 (회색 계열)</option>
          <option value="미드파이 (기본 색상 일부 적용)">미드파이 (색상 일부)</option>
          <option value="하이파이 (실제 디자인에 가까운)">하이파이 (실제 디자인)</option>
        </select>
      </div>
      <div>
        <label>반응형 기준</label>
        <select id="p-responsive">
          <option value="Desktop First (1920px 기준)">Desktop First</option>
          <option value="Mobile First (375px 기준)">Mobile First</option>
          <option value="Desktop + Mobile 병행">Desktop + Mobile 병행</option>
        </select>
      </div>
      <div>
        <label>색상 테마</label>
        <select id="p-color-theme">
          <option value="흰색 배경 (#FFFFFF) + 검정 텍스트">라이트 (흰 배경)</option>
          <option value="검정 배경 (#000000) + 흰색 텍스트">다크 (검정 배경)</option>
          <option value="라이트/다크 모드 병행">라이트/다크 병행</option>
          <option value="브랜드 컬러 적용 (별도 명시)">브랜드 컬러 적용</option>
        </select>
      </div>
    </div>
  `;
}
