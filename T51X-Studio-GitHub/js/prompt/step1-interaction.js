/* ── prompt/step1-interaction.js
   스텝 1-C: 인터랙션·에셋·접근성 설정
   - GNB 유형, 인터랙션 수준, 이미지 처리, 텍스트 처리, 접근성
   ▸ 애니메이션 프리셋, 전환효과 선택 등 새 컴포넌트는 renderStep1Interaction() 안에 추가
─────────────────────────────────────────────────────── */

function renderStep1Interaction() {
  return /* html */`
    <!-- 1-C: 인터랙션·에셋 -->
    <div class="form-row">
      <div>
        <label>GNB 유형</label>
        <select id="p-gnb">
          <optgroup label="── 햄버거 계열 ──">
            <option value="햄버거 메뉴 + 슬라이드 패널 우측 (T51형)">햄버거 + 슬라이드 패널 우측 ← T51형</option>
            <option value="햄버거 메뉴 + 슬라이드 패널 좌측">햄버거 + 슬라이드 패널 좌측</option>
            <option value="햄버거 메뉴 + 풀스크린 오버레이">햄버거 + 풀스크린 오버레이</option>
            <option value="햄버거 메뉴 + 드롭다운 패널 하단">햄버거 + 드롭다운 패널 (하단 펼침)</option>
          </optgroup>
          <optgroup label="── 고정 메뉴바 계열 ──">
            <option value="풀 메뉴바 — 로고 좌측 + 메뉴 중앙">풀 메뉴바 — 로고 좌측 + 메뉴 중앙</option>
            <option value="풀 메뉴바 — 로고 중앙 + 메뉴 양측">풀 메뉴바 — 로고 중앙 + 메뉴 양측</option>
            <option value="투명 메뉴바 (스크롤 시 배경 채움)">투명 메뉴바 — 스크롤 시 배경 채움</option>
            <option value="사이드바 고정 메뉴 (좌측 세로)">사이드바 — 좌측 세로 고정</option>
          </optgroup>
          <optgroup label="── 기타 ──">
            <option value="없음">없음 (GNB 미사용)</option>
          </optgroup>
        </select>
      </div>
      <div>
        <label>인터랙션 수준</label>
        <select id="p-interaction">
          <option value="없음 (정적 와이어프레임)">없음 (정적 와이어프레임)</option>
          <option value="기본 클릭 인터랙션 (Navigate To)">기본 클릭 인터랙션</option>
          <option value="호버 상태 포함">호버 상태 포함</option>
          <option value="전체 인터랙션 (애니메이션 포함)">전체 인터랙션</option>
        </select>
      </div>
    </div>
    <div class="form-row triple">
      <div>
        <label>이미지 처리 방식</label>
        <select id="p-image-rule">
          <option value="#EEEEEE 사각형 + 대각선 크로스">#EEEEEE + 크로스 (기본)</option>
          <option value="실제 이미지 URL 삽입">실제 이미지 URL</option>
          <option value="Unsplash 플레이스홀더">Unsplash 플레이스홀더</option>
          <option value="AI 생성 이미지">AI 생성 이미지</option>
        </select>
      </div>
      <div>
        <label>텍스트 처리</label>
        <select id="p-text-rule">
          <option value="모든 본문 Lorem Ipsum 처리">Lorem Ipsum (기본)</option>
          <option value="실제 텍스트 콘텐츠 사용">실제 텍스트 사용</option>
          <option value="한국어 Lorem 처리">한국어 Lorem</option>
        </select>
      </div>
      <div>
        <label>접근성 레벨</label>
        <select id="p-accessibility">
          <option value="기본 (별도 명시 없음)">기본</option>
          <option value="WCAG 2.1 AA 준수">WCAG 2.1 AA</option>
          <option value="WCAG 2.1 AAA 준수">WCAG 2.1 AAA</option>
        </select>
      </div>
    </div>
  `;
}
