/* ── js/firebase.js
   Firebase 초기화 + _ls 래퍼 Firebase 연동
   ─────────────────────────────────────────
   전략: localStorage(빠른 읽기) + Firebase(영구 저장) 동시 운영
   - 읽기: localStorage 우선 (즉시 반환) → Firebase는 백그라운드 동기화
   - 쓰기: localStorage + Firebase 동시 저장
   - 오프라인: localStorage만으로 정상 동작
   ─────────────────────────────────────────
   Firebase DB 구조:
   users/
     {userId}/
       wps_history: "..."
       wps_folders: "..."
       wps_slot_...: "..."
       wps_vault_folders: "..."
       wps_vf_...: "..."
── */

// ── Firebase SDK (CDN, type=module 없이 compat 버전 사용)
// index.html에서 SDK 로드 후 이 파일 실행됨

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDIW5Lxbe909fjfcBaSnGH0CVp8rz7G_Wg",
  authDomain:        "t51x-frloy.firebaseapp.com",
  databaseURL:       "https://t51x-frloy-default-rtdb.firebaseio.com",
  projectId:         "t51x-frloy",
  storageBucket:     "t51x-frloy.firebasestorage.app",
  messagingSenderId: "804393311479",
  appId:             "1:804393311479:web:6cceef34c261d7d3a4c7f2"
};

// Firebase 초기화
let _fbApp  = null;
let _fbDB   = null;
let _fbReady = false;

function _fbInit() {
  try {
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK 미로드 — localStorage 전용 모드');
      return;
    }
    if (!firebase.apps.length) {
      _fbApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      _fbApp = firebase.apps[0];
    }
    _fbDB    = firebase.database();
    _fbReady = true;
    console.log('[Firebase] 초기화 완료');

    // 앱 시작 시 Firebase → localStorage 동기화
    _fbPullAll();
  } catch (e) {
    console.warn('[Firebase] 초기화 실패 — localStorage 전용 모드:', e);
  }
}

// ── Firebase 경로 헬퍼
// DB 키에서 '/' 등 불허 문자를 '_'로 치환
function _fbKey(k) {
  return k.replace(/[.#$/[\]]/g, '_');
}

function _fbUserPath(key) {
  const uid = getCurrentUser();
  return `users/${uid}/${_fbKey(key)}`;
}

// ── Firebase → localStorage 전체 Pull (로그인 직후 1회)
async function _fbPullAll() {
  if (!_fbReady) return;
  const uid = getCurrentUser();
  if (!uid || uid === 'guest') return;

  try {
    const snap = await _fbDB.ref(`users/${uid}`).get();
    if (!snap.exists()) return;

    const data = snap.val();
    Object.entries(data).forEach(([fbKey, value]) => {
      // fbKey는 _fbKey()로 변환된 키 → 원본 키로 복원 불가하므로
      // localStorage에 그대로 저장 (51x_{uid}_ 접두어 붙여서)
      const lsKey = `51x_${uid}_${fbKey}`;
      if (value !== null && value !== undefined) {
        localStorage.setItem(lsKey, value);
      }
    });
    console.log('[Firebase] Pull 완료 —', Object.keys(data).length, '개 키');
  } catch (e) {
    console.warn('[Firebase] Pull 실패:', e);
  }
}

// ── Firebase Push (비동기, 실패해도 localStorage는 유지)
function _fbPush(key, value) {
  if (!_fbReady) return;
  const uid = getCurrentUser();
  if (!uid || uid === 'guest') return;

  _fbDB.ref(_fbUserPath(key)).set(value).catch(e => {
    console.warn('[Firebase] Push 실패:', key, e);
  });
}

function _fbRemove(key) {
  if (!_fbReady) return;
  const uid = getCurrentUser();
  if (!uid || uid === 'guest') return;

  _fbDB.ref(_fbUserPath(key)).remove().catch(e => {
    console.warn('[Firebase] Remove 실패:', key, e);
  });
}

// ══════════════════════════════════════════════════
// _ls 래퍼 오버라이드
// 기존 01-config.js의 _ls를 Firebase 연동 버전으로 교체
// ══════════════════════════════════════════════════
function _fbOverrideLs() {
  // 원본 _sk 함수가 01-config.js에서 이미 정의되어 있음
  // _ls를 Firebase 연동 버전으로 재정의

  // eslint-disable-next-line no-global-assign
  Object.assign(_ls, {

    get: (k) => {
      // localStorage 우선 반환 (즉시, 동기)
      return localStorage.getItem(_sk(k));
    },

    set: (k, v) => {
      // localStorage 즉시 저장
      localStorage.setItem(_sk(k), v);
      // Firebase 비동기 저장
      _fbPush(k, v);
    },

    remove: (k) => {
      localStorage.removeItem(_sk(k));
      _fbRemove(k);
    },

    keys: (prefix) => {
      // 기존 방식 그대로 (localStorage 기반)
      const ns = '51x_' + getCurrentUser() + '_' + (prefix || '');
      const result = [];
      for (let i = 0; i < localStorage.length; i++) {
        const lk = localStorage.key(i);
        if (lk && lk.startsWith(ns)) {
          result.push(lk.slice(('51x_' + getCurrentUser() + '_').length));
        }
      }
      return result;
    }
  });

  console.log('[Firebase] _ls 래퍼 Firebase 연동 완료');
}

// ── DOM 준비 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  _fbInit();
  _fbOverrideLs();
});
