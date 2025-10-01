/* ============================================
 * Tourpass 워크숍 검색형 챗봇 - script.js
 * - Google Apps Script 웹앱(POST /exec)로 질의
 * - 응답 { answer, recs? } 렌더링
 * ============================================ */

/** 🔗 GAS 웹앱 URL (배포 > 웹앱 > 현재 웹앱 URL) */
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxM8pNBBnAxRyoIYHO8be82IzlTCPYOcRRjq_aoiTvcyoprVNhfXQx_KsZlVSVGJlhn/exec";

/** (옵션) 서버 토큰을 쓰는 경우 스크립트 속성 BACKEND_TOKEN과 동일하게 */
const BACKEND_TOKEN = ""; // 예: 'my-secret-token'

/* ---------- DOM 요소 ---------- */
const $q = document.getElementById("query");
const $result = document.getElementById("result");
const $searchBtn = document.getElementById("searchBtn"); // 버튼 id가 있으면 상태 제어
const $errorBar = document.getElementById("errorBar"); // 에러 표시용(있으면 사용)

/* ---------- 유틸 ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[s]);
}

function setLoading(on) {
  if ($searchBtn) {
    $searchBtn.disabled = on;
    $searchBtn.classList.toggle("is-loading", on);
    $searchBtn.textContent = on ? "검색 중…" : "검색";
  }
  if ($q) $q.disabled = on;
}

function showError(msg) {
  console.error(msg);
  if ($errorBar) {
    $errorBar.textContent = msg;
    $errorBar.style.display = "block";
  } else {
    // 결과 영역에 에러 렌더
    $result.innerHTML =
      `<div class="error">⚠️ ${escapeHtml(msg)}</div>`;
  }
}

function clearError() {
  if ($errorBar) {
    $errorBar.textContent = "";
    $errorBar.style.display = "none";
  }
}

/* ---------- 렌더 ---------- */
function renderAnswer(data) {
  const { answer, recs } = data || {};

  let html = "";
  if (answer && String(answer).trim()) {
    html += `
      <div class="card">
        <div class="card-title">GPT 분석 결과</div>
        <div class="card-body">${escapeHtml(answer).replace(/\n/g, "<br/>")}</div>
      </div>
    `;
  } else {
    html += `
      <div class="card">
        <div class="card-title">GPT 분석 결과</div>
        <div class="card-body muted">응답이 비어 있습니다.</div>
      </div>
    `;
  }

  if (Array.isArray(recs) && recs.length) {
    const items = recs
      .map(
        (r, i) => `
        <li>
          <strong>${escapeHtml(r.name || "-")}</strong>
          <small>(${escapeHtml(r.place_id || "")})</small>
          <span class="chip">점수: ${escapeHtml(String(r.score ?? ""))}</span>
        </li>`
      )
      .join("");
    html += `
      <div class="card">
        <div class="card-title">다음 가맹점 추천 Top${recs.length}</div>
        <div class="card-body">
          <ol class="list">${items}</ol>
        </div>
      </div>
    `;
  }

  $result.innerHTML = html;
}

/* ---------- 액션 ---------- */
async function askChat() {
  clearError();
  const query = ($q?.value || "").trim();
  if (!query) {
    showError("질문을 입력해 주세요.");
    return;
  }

  setLoading(true);
  $result.innerHTML = ""; // 이전 결과 초기화

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // last_place_id는 필요 시 함께 전달하세요.
      body: JSON.stringify({
        query,
        token: BACKEND_TOKEN || undefined,
      }),
      // CORS는 기본 허용이지만, GitHub Pages(HTTPS)에서 호출하세요.
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`서버 오류 ${res.status} - ${text || "응답 본문 없음"}`);
    }

    const data = await res.json();
    renderAnswer(data);
  } catch (err) {
    showError(`오류 발생: ${err.message || err}`);
  } finally {
    setLoading(false);
  }
}

/* 추천 질문 버튼이 data-ask 속성을 갖고 있으면 자동 바인딩 */
function bindQuickAsk() {
  document.querySelectorAll("[data-ask]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-ask") || "";
      if ($q) $q.value = text;
      askChat();
    });
  });
}

/* 외부에서 호출할 수 있게 window로 노출(HTML onclick 대비) */
window.askChat = askChat;
window.quickAsk = function (text) {
  if ($q) $q.value = text || "";
  askChat();
};

/* 엔터키 검색 */
if ($q) {
  $q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") askChat();
  });
}

/* 버튼 id가 있으면 클릭 바인딩 */
if ($searchBtn) {
  $searchBtn.addEventListener("click", askChat);
}

/* 페이지 로드 시 추천 버튼 바인딩 */
document.addEventListener("DOMContentLoaded", bindQuickAsk);
