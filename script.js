// ===== 설정 =====
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxM8pNBBnAxRyoIYHO8be82IzlTCPYOcRRjq_aoiTvcyoprVNhfXQx_KsZlVSVGJlhn/exec"; // ← 본인 GAS 웹앱 URL
const BACKEND_TOKEN = document.querySelector('meta[name="backend-token"]')?.content || "";

// ===== 엘리먼트 =====
const $q = document.getElementById("q");
const $go = document.getElementById("go");
const $chips = document.getElementById("chips");
const $alert = document.getElementById("alert");
const $result = document.getElementById("result");
const $answer = document.getElementById("answer");
const $spinner = document.getElementById("spinner");
const $ping = document.getElementById("ping");

// ===== 유틸 =====
function showAlert(msg) {
  $alert.textContent = msg;
  $alert.hidden = false;
}
function hideAlert() { $alert.hidden = true; }
function setBusy(on) {
  $spinner.hidden = !on;
  $result.setAttribute("aria-busy", on ? "true" : "false");
  $go.disabled = on;
  $q.disabled = on;
}
function htmlEscape(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ===== 메인 전송 =====
async function ask(query) {
  const text = (query ?? $q.value).trim();
  if (!text) { showAlert("질문을 입력하세요."); return; }
  hideAlert(); setBusy(true);
  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text, token: BACKEND_TOKEN || undefined })
    });

    // 네트워크 응답 체크
    if (!res.ok) {
      const t = await res.text().catch(()=> "");
      throw new Error(`응답 오류 ${res.status} ${res.statusText} ${t ? "- " + t.slice(0,200) : ""}`);
    }

    // JSON 파싱
    let data;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await res.json();
    else {
      const t = await res.text();
      try { data = JSON.parse(t); } catch { throw new Error("JSON 파싱 실패: " + t.slice(0,300)); }
    }

    // 결과 표시
    const ans = (data && typeof data.answer === "string" && data.answer.trim())
      ? data.answer
      : "응답이 비어 있습니다.";

    $answer.innerHTML = htmlEscape(ans).replace(/\n/g, "<br/>");
    $result.hidden = false;

    if (Array.isArray(data?.recs) && data.recs.length) {
      const list = data.recs
        .map(r => `<li>${htmlEscape(r.name)} <small>[${htmlEscape(r.place_id)}] · 점수:${htmlEscape(String(r.score))}</small></li>`)
        .join("");
      $answer.insertAdjacentHTML("beforeend", `<hr><div style="font-weight:700;margin-bottom:6px">추천</div><ol>${list}</ol>`);
    }
  } catch (err) {
    console.error(err);
    showAlert("오류 발생: 서버 연결/배포 설정을 확인하세요.");
  } finally {
    setBusy(false);
  }
}

// ===== 이벤트 =====
$go.addEventListener("click", () => ask());
$q.addEventListener("keydown", e => { if (e.key === "Enter") ask(); });
$chips.addEventListener("click", e => {
  const btn = e.target.closest("button[data-q]");
  if (!btn) return;
  $q.value = btn.dataset.q;
  ask(btn.dataset.q);
});
$ping.addEventListener("click", async () => {
  hideAlert(); setBusy(true);
  try {
    const url = new URL(WEBAPP_URL);
    const res = await fetch(url, { method: "GET" }); // doGet()이 'OK'를 반환해야 함
    const t = await res.text();
    showAlert(`연결 OK: ${res.status} ${t.slice(0,100)}`);
  } catch (e) {
    console.error(e);
    showAlert("연결 실패: 웹앱 URL/권한을 확인하세요.");
  } finally {
    setBusy(false);
  }
});

// 페이지 로드시 포커스
window.addEventListener("load", () => $q.focus());
