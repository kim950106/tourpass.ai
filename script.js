:root{
  --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; --panel:#f8fafc;
  --brand:#5b46ff; --ok:#10b981; --shadow:0 10px 40px rgba(2,6,23,.08);
  --radius:16px;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:'Pretendard',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;
  color:var(--ink);
  background:
    radial-gradient(1200px 600px at 10% -10%, #eef2ff 0%, transparent 60%),
    radial-gradient(900px 500px at 90% 110%, #fdf2f8 0%, transparent 60%),
    #fff;
}

.site-head{max-width:980px; margin:28px auto 0; padding:0 16px}
.brand{display:flex; align-items:center; gap:12px}
.brand-mark{font-size:28px}
.brand-title{font-weight:800; font-size:clamp(20px,3.6vw,28px)}
.brand-sub{color:var(--muted); font-size:13px}

.shell{max-width:980px; margin:18px auto; padding:0 16px}

.searchbar{
  display:flex; gap:10px; align-items:center;
  border:1px solid var(--line); border-radius:999px; padding:14px 16px;
  background:#fff; box-shadow:var(--shadow);
}
.q{flex:1; border:none; outline:none; font-size:16px}
.btn-search{
  border:none; border-radius:999px; padding:10px 18px;
  background:var(--brand); color:#fff; font-weight:700; cursor:pointer;
}
.btn-search:active{transform:translateY(1px)}

.chips{display:flex; gap:10px; margin:12px 0 0; flex-wrap:wrap}
.chip{
  border:1px solid var(--line); background:#fff; border-radius:999px;
  padding:8px 12px; cursor:pointer;
}
.chip:hover{background:#f8f9ff}

.alert{
  margin-top:12px; padding:12px 14px; border-radius:10px;
  background:#fee2e2; color:#b91c1c; border:1px solid #fecaca;
}

.result{
  margin-top:20px; background:var(--panel); border:1px solid var(--line);
  border-radius:var(--radius); padding:16px;
}
.res-head{display:flex; align-items:center; gap:8px; margin-bottom:8px}
.res-title{margin:0; font-size:16px}
.answer{
  background:#fff; border:1px solid var(--line); border-radius:12px;
  padding:14px; line-height:1.7; white-space:pre-wrap;
}

.spinner{
  width:16px; height:16px; border-radius:50%;
  border:2px solid var(--brand); border-top-color:transparent;
  animation:spin 1s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

.site-foot{
  max-width:980px; margin:16px auto 28px; padding:0 16px; color:var(--muted);
  display:flex; align-items:center; gap:10px;
}
.btn-ping{
  border:1px solid var(--line); background:#fff; border-radius:10px;
  padding:6px 10px; cursor:pointer;
}
