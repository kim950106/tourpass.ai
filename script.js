// ===== 설정 =====
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxM8pNBBnAxRyoIYHO8be82IzlTCPYOcRRjq_aoiTvcyoprVNhfXQx_KsZlVSVGJlhn/exec"; // 꼭 최신 /exec
const BACKEND_TOKEN =
  document.querySelector('meta[name="backend-token"]')?.content?.trim() || "";

// ===== DOM =====
const $q       = document.getElementById("q");
const $go      = document.getElementById("go");
const $alert   = document.getElementById("alert");
const $result  = document.getElementById("result");
const $spinner = document.getElementById("spinner");
const $answer  = document.getElementById("answer");
const $ping    = document.getElementById("ping");

// ===== 이벤트 =====
document.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click", ()=>{
    $q.value = chip.dataset.q || chip.textContent.trim();
    ask();
  });
});
$go.addEventListener("click", ask);
$q.addEventListener("keydown", (e)=>{ if(e.key === "Enter") ask(); });
$ping?.addEventListener("click", ping);

// ===== 함수 =====
async function ask(){
  const text = ($q.value || "").trim();
  if(!text){ showAlert("질문을 입력하세요."); return; }

  setBusy(true);
  hideAlert();
  $result.hidden = false;
  $answer.innerHTML = "";

  try{
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: text,
        token: BACKEND_TOKEN || undefined
      })
    });

    // 상태코드 진단 출력
    if(!res.ok){
      const raw = await safeText(res);
      const msg = `서버 응답 오류: ${res.status} ${res.statusText}\n${raw || "(본문 없음)"}`;
      console.error(msg);
      showAlert("오류 발생: 서버 연결/배포 설정을 확인하세요.");
      $answer.innerHTML = `<pre style="white-space:pre-wrap">${escapeHtml(msg)}</pre>`;
      return;
    }

    const data = await res.json();
    if(data.error){
      showAlert(`백엔드 오류: ${data.error}`);
      console.error("backend error:", data.error);
    }

    $answer.innerHTML = data.answer
      ? escapeHtml(data.answer).replace(/\n/g,"<br>")
      : '<span style="color:#64748b">응답이 비었습니다.</span>';

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

async function ping(){
  hideAlert();
  setBusy(true);
  try{
    const res = await fetch(BACKEND_URL, { method:"GET" }); // doGet()이 'OK' 반환
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

// ===== UI 유틸 =====
function setBusy(b){
  $spinner.hidden = !b;
  $result.setAttribute("aria-busy", b ? "true" : "false");
  $go.disabled = b;
  $q.disabled  = b;
}
function showAlert(msg, type){
  $alert.textContent = msg;
  $alert.hidden = false;
  $alert.className = type === "ok" ? "alert ok" : "alert";
}
function hideAlert(){ $alert.hidden = true; }

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[s]);
}
async function safeText(res){ try{ return await res.text(); }catch{ return ""; } }
