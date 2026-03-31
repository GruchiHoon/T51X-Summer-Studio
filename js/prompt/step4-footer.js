/* ── prompt/step4-footer.js
   스텝 4: 푸터 설정
   - HTML 템플릿 + 푸터 유형 토글·스펙 빌더
   ▸ 푸터 미리보기, 추가 옵션 등 새 컴포넌트는 renderStep4() 안에 추가
─────────────────────────────────────────────────────── */

function renderStep4() {
  return /* html */`
    <div class="card-title" style="margin-bottom:14px">④ 푸터 설정</div>
    <div class="form-row">
      <div>
        <label>푸터 유형</label>
        <select id="p-footer-type" onchange="onFooterTypeChange()">
          <optgroup label="── 2단 레이아웃 ──">
            <option value="2단 — 로고+메뉴(좌) / 회사정보+SNS(우) (T51형)">2단 — 로고+메뉴 좌 / 회사정보+SNS 우 ← T51형</option>
            <option value="2단 — 로고+설명(좌) / 링크 그룹(우)">2단 — 로고+설명 좌 / 링크 그룹 우</option>
          </optgroup>
          <optgroup label="── 다단 레이아웃 ──">
            <option value="4단 — 로고열 + 링크 그룹 3열 + 하단 카피라이트">4단 — 로고열 + 링크 그룹 3열</option>
            <option value="3단 — 회사정보 / 메뉴 / SNS+연락처">3단 — 회사정보 / 메뉴 / SNS+연락처</option>
          </optgroup>
          <optgroup label="── 심플 ──">
            <option value="심플 1단 — 로고 + 카피라이트 한 줄">심플 1단 — 로고 + 카피라이트</option>
            <option value="심플 센터 정렬 — 로고+메뉴+카피라이트 중앙">심플 센터 — 로고+메뉴+카피라이트 중앙</option>
          </optgroup>
          <optgroup label="── 기타 ──">
            <option value="없음">없음 (푸터 미사용)</option>
            <option value="커스텀">커스텀 (직접 입력)</option>
          </optgroup>
        </select>
      </div>
      <div>
        <label>푸터 높이</label>
        <select id="p-footer-height">
          <option value="약 200px">약 200px (기본)</option>
          <option value="약 120px">약 120px (컴팩트)</option>
          <option value="약 320px">약 320px (대형)</option>
          <option value="콘텐츠 높이에 맞춤">콘텐츠 높이에 맞춤</option>
        </select>
      </div>
    </div>
    <div class="form-row triple">
      <div>
        <label>로고 영역</label>
        <select id="p-footer-logo">
          <option value="텍스트 로고 박스 [ LOGO ]">텍스트 로고 박스</option>
          <option value="이미지 로고 플레이스홀더">이미지 로고 플레이스홀더</option>
          <option value="없음">없음</option>
        </select>
      </div>
      <div>
        <label>SNS 아이콘</label>
        <select id="p-footer-sns">
          <option value="[ICON] × 3개">3개</option>
          <option value="[ICON] × 4개">4개</option>
          <option value="[ICON] × 5개">5개</option>
          <option value="없음">없음</option>
        </select>
      </div>
      <div>
        <label>개인정보처리방침 링크</label>
        <select id="p-footer-privacy">
          <option value="포함">포함</option>
          <option value="미포함">미포함</option>
        </select>
      </div>
    </div>
    <div id="footer-custom-row" class="form-row full" style="display:none">
      <label>커스텀 푸터 스펙 (직접 입력)</label>
      <textarea id="p-footer-custom"
        placeholder="예: 전체폭 3열 레이아웃 / 좌: 로고+슬로건 / 중: 메뉴 2열 / 우: 뉴스레터 구독 인풋 + SNS 3개 / 하단 카피라이트"
        style="min-height:60px"></textarea>
    </div>
    <div class="hint">
      💡 푸터 설정은 프롬프트에 "글로벌 푸터 스펙"으로 포함되어 모든 페이지에 공통 적용됩니다.
    </div>
  `;
}

function onFooterTypeChange() {
  const val = document.getElementById('p-footer-type').value;
  const row = document.getElementById('footer-custom-row');
  if (row) row.style.display = val === '커스텀' ? 'grid' : 'none';
}

function buildFooterSpec() {
  const type = document.getElementById('p-footer-type').value;
  if (!type || type === '없음') return null;
  if (type === '커스텀') {
    const custom = document.getElementById('p-footer-custom').value.trim();
    return custom || '커스텀 푸터 (스펙 미입력)';
  }
  const height  = document.getElementById('p-footer-height').value;
  const logo    = document.getElementById('p-footer-logo').value;
  const sns     = document.getElementById('p-footer-sns').value;
  const privacy = document.getElementById('p-footer-privacy').value;
  return `유형: ${type} / 높이: ${height} / 로고: ${logo} / SNS 아이콘: ${sns} / 개인정보처리방침: ${privacy}`;
}
