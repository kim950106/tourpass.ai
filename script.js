// ===== 설정 =====
// 본인 GAS 웹앱 /exec URL로 교체하세요.
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxM8pNBBnAxRyoIYHO8be82IzlTCPYOcRRjq_aoiTvcyoprVNhfXQx_KsZlVSVGJlhn/exec";

// (선택) 토큰 사용 시, index.html 메타에 동일 값 입력
const BACKEND_TOKEN =
  document.querySelector('meta[name="backend-token"]')?.content?.trim() || "";

// ===== DOM =====
const $q       = document.getElementById("q");
const $go      = document.getElementById("go");
const $chips   = document.getElementById("chips");
const $alert   = document.getElementById("alert");
const $result  = document.getElementById("result");
const $spinner = document.getElementById("spinner");
const $answer  = document.getElementById("answer");
const $ping    = document.getElementById("ping");

// ===== 유틸 =====
function showAlert(msg, type){
  $alert.textContent = msg;
  $alert.hidden = !msg;
  $alert.className = type === "ok" ? "alert ok" : "alert";
}
function hideAlert(){ $alert.hidden = true; }
function setBusy(b){
  $spinner.hidden = !b;
  $result.setAttribute("aria-busy", b ? "true" : "false");
  $go.disabled = b; $q.disabled = b;
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[s]);
}

// ===== 메인 요청 =====
async function ask(){
  const text = ($q.value || "").trim();
  if(!text){ showAlert("질문을 입력하세요."); return; }

  setBusy(true); hideAlert();
  $result.hidden = false;
  $answer.innerHTML = "";

  try{
    // ✅ 프리플라이트(OPTIONS) 회피: application/json → text/plain
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        query: text,
        token: BACKEND_TOKEN || undefined
        // last_place_id 필요 시 여기에 추가
      })
    });

    if(!res.ok){
      const raw = await res.text().catch(()=> "");
      const msg = `서버 응답 오류: ${res.status} ${res.statusText}\n${raw || "(본문 없음)"}`;
      console.error(msg);
      showAlert("오류 발생: 서버 연결/배포 설정을 확인하세요.");
      $answer.innerHTML = `<pre style="white-space:pre-wrap">${escapeHtml(msg)}</pre>`;
      return;
    }

    // JSON 응답 처리
    let data;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await res.json();
    else {
      const t = await res.text();
      try { data = JSON.parse(t); } catch { throw new Error("JSON 파싱 실패: " + t.slice(0,300)); }
    }

    if(data.error){
      showAlert(`백엔드 오류: ${data.error}`);
      console.error("backend error:", data.error);
    }

    const ans = (typeof data.answer === "string" && data.answer.trim())
      ? data.answer
      : "응답이 비어 있습니다.";

    $answer.innerHTML = escapeHtml(ans).replace(/\n/g,"<br>");

    if(Array.isArray(data.recs) && data.recs.length){
      const list = data.recs
        .map(r=>`<li>${escapeHtml(r.name)} <small>[${escapeHtml(r.place_id)}] · 점수:${escapeHtml(String(r.score))}</small></li>`)
        .join("");
      $answer.insertAdjacentHTML("beforeend", `<hr><div><b>추천 가맹점</b><ol>${list}</ol></div>`);
    }
  }catch(err){
    const emsg = (err && err.message) ? err.message : String(err);
    console.error("fetch error:", err);
    showAlert("네트워크 오류: GAS URL 또는 CORS/배포 권한을 확인하세요.");
    $answer.innerHTML = `<pre style="white-space:pre-wrap">${escapeHtml(emsg)}</pre>`;
  }finally{
    setBusy(false);
  }
}

// ===== 연결 점검 =====
async function ping(){
  hideAlert(); setBusy(true);
  try{
    const res = await fetch(WEBAPP_URL, { method:"GET" }); // doGet()이 'OK' 반환
    const text = await res.text();
    if(res.ok && /OK/i.test(text)){
      showAlert("연결 정상 (doGet: OK)", "ok");
    }else{
      showAlert(`연결 확인 실패: ${res.status} ${res.statusText} / ${text}`);
    }
  }catch(e){
    showAlert(`연결 실패: ${e.message||e}`);
  }finally{
    setBusy(false);
  }
}

// ===== 이벤트 =====
$go.addEventListener("click", ask);
$q.addEventListener("keydown", (e)=>{ if(e.key === "Enter") ask(); });
$chips.addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-q]");
  if(!btn) return;
  $q.value = btn.dataset.q;
  ask();
});
$ping.addEventListener("click", ping);

// 초기 포커스
window.addEventListener("load", ()=> $q.focus());
