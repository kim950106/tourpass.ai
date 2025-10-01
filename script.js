/* =========================
 * Frontend Controller
 * - GitHub Pages에서 실행
 * - Google Apps Script WebApp으로 POST
 * ========================= */

// ✅ 반드시 본인 GAS 웹앱 URL로 교체하세요
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxM8pNBBnAxRyoIYHO8be82IzlTCPYOcRRjq_aoiTvcyoprVNhfXQx_KsZlVSVGJlhn/exec";

// (선택) meta[name=backend-token] 에 값이 있으면 함께 보냅니다.
function getBackendToken() {
  const m = document.querySelector('meta[name="backend-token"]');
  return (m && m.content) ? m.content : "";
}

const $q = document.getElementById("q");
const $go = document.getElementById("go");
const $chips = document.querySelectorAll(".chip");
const $alert = document.getElementById("alert");
const $result = document.getElementById("result");
const $spinner = document.getElementById("spinner");
const $answer = document.getElementById("answer");
const $ping = document.getElementById("ping");

// UX: 로딩 토글
function busy(on) {
  $spinner.hidden = !on;
  $result.setAttribute("aria-busy", on ? "true" : "false");
  $go.disabled = on; $q.disabled = on;
}

// 알림 표시
function showAlert(msg) {
  $alert.textContent = msg;
  $alert.hidden = !msg;
}

// HTML escape
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[s]);
}

// 결과 렌더
function showAnswer(text, recs){
  $result.hidden = false;
  let html = escapeHtml(text || "응답이 없습니다.").replace(/\n/g,'<br/>');
  if (Array.isArray(recs) && recs.length) {
    const list = recs.map(r=>`<li>${escapeHtml(r.name)} <small>[${escapeHtml(r.place_id)}] · 점수:${escapeHtml(String(r.score))}</small></li>`).join("");
    html += `<hr style="margin:12px 0; opacity:.3;"><div style="font-weight:700; margin-bottom:6px;">다음 가맹점 추천</div><ol style="margin:0; padding-left:18px">${list}</ol>`;
  }
  $answer.innerHTML = html;
}

// 메인 호출
async function ask() {
  const text = $q.value.trim();
  if (!text) { $q.focus(); return; }
  showAlert("");
  $result.hidden = false;
  busy(true);

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: text,
        token: getBackendToken() || undefined
      })
    });

    // GAS에서 JSON 반환 필수
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    if (data.error) {
      showAlert("❌ 서버 오류: " + data.error);
      showAnswer("");
      return;
    }
    showAnswer(data.answer, data.recs);
  } catch (err) {
    console.error(err);
    showAlert("❌ 오류 발생: 서버 연결을 확인하세요.");
    showAnswer("");
  } finally {
    busy(false);
  }
}

// 이벤트
$go.addEventListener("click", ask);
$q.addEventListener("keydown", (e)=>{ if (e.key === "Enter") ask(); });
$chips.forEach(btn => btn.addEventListener("click", ()=>{
  $q.value = btn.dataset.q || "";
  $q.focus();
}));

// 헬스 체크(옵션)
$ping.addEventListener("click", async ()=>{
  showAlert("");
  try {
    // doGet이 'OK'를 반환하면 성공
    const res = await fetch(WEBAPP_URL, { method: "GET" });
    const text = await res.text();
    if (text && text.toUpperCase().includes("OK")) {
      showAlert("✅ 백엔드 연결 정상입니다.");
    } else {
      showAlert("⚠️ 백엔드 응답이 비정상입니다: " + text.slice(0,120));
    }
  } catch (e) {
    showAlert("❌ 연결 실패: " + e.message);
  }
});
