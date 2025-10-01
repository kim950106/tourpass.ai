// ================================
// 2025 투어패스 워크숍 AI 어시스턴트
// - 검색창 입력 → GAS 백엔드 POST 호출 → 답변 출력
// ================================

// 백엔드 엔드포인트 URL (Google Apps Script 배포 주소 입력)
const API_URL = "https://script.google.com/macros/s/AKfycbxM8pNBBnAxRyoIYHO8be82IzlTCPYOcRRjq_aoiTvcyoprVNhfXQx_KsZlVSVGJlhn/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const input = document.querySelector("#query");
  const resultBox = document.querySelector("#result");
  const loading = document.querySelector("#loading");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) {
      resultBox.innerHTML = "❗ 검색어를 입력하세요.";
      return;
    }

    resultBox.innerHTML = "";
    loading.style.display = "block";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          last_place_id: "",
          token: ""
        }),
      });

      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

      const data = await res.json();
      console.log("✅ 응답 데이터:", data);

      if (data.answer) {
        resultBox.innerHTML = `<div class="answer-box">${data.answer.replace(/\n/g, "<br>")}</div>`;
      } else if (data.error) {
        resultBox.innerHTML = `<div class="error">❌ 오류: ${data.error}</div>`;
      } else {
        resultBox.innerHTML = `<div class="error">⚠️ 응답을 처리하지 못했습니다.</div>`;
      }

    } catch (err) {
      console.error("❌ 요청 실패:", err);
      resultBox.innerHTML = `<div class="error">🚨 연결 오류: ${err.message}</div>`;
    } finally {
      loading.style.display = "none";
    }
  });
});
