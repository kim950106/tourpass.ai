# 2025 투어패스 워크숍 AI 어시스턴트 (프론트엔드)

GitHub Pages + Google Apps Script 웹앱을 이용한 경량 챗봇 UI.

## 구성
- `index.html` : 검색형 UI
- `style.css`  : 스타일
- `script.js`  : GAS 웹앱 호출, 결과 출력
- (백엔드) Google Apps Script: `doGet()`/`doPost()` 구현

## 백엔드 준비(GAS)
1) 구글 드라이브에서 **스프레드시트** 생성(시트명: `FAQ`, `AFFILIATES`, `VISITS`).
2) 확장 프로그램 → Apps Script 열기.
3) 제공된 GAS 코드(백엔드)를 붙여넣고 저장.
4) **배포 > 웹 앱 배포**  
   - URL 예: `https://script.google.com/macros/s/AKfycb.../exec`  
   - 액세스 권한: **모든 사용자**(익명 사용 포함)
5) (선택) 스크립트 속성에 `OPENAI_API_KEY` / `BACKEND_TOKEN` 저장.

## 프론트엔드 연결
- `script.js` 상단의 `WEBAPP_URL` 을 본인 GAS URL로 교체.
- (선택) 메타 태그로 토큰 적용:
  ```html
  <meta name="backend-token" content="my-secret-token">
