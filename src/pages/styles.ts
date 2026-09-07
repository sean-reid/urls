export const CSS = `
:root{--paper:#f4f1ea;--ink:#171512;--muted:#6b665d;--rule:#cfc9bd;--accent:#7a1f1f;--field:#fbf9f5}
@media (prefers-color-scheme:dark){:root{--paper:#161514;--ink:#e6e1d7;--muted:#9a948a;--rule:#3a3733;--accent:#d0665f;--field:#1e1c1a}}
@font-face{font-family:"Source Serif 4";src:url(/fonts/source-serif-4-regular.woff2) format("woff2");font-weight:400;font-display:optional}
@font-face{font-family:"Source Serif 4";src:url(/fonts/source-serif-4-semibold.woff2) format("woff2");font-weight:600;font-display:optional}
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);font:16px/1.5 "Source Serif 4",Georgia,"Times New Roman",serif;-webkit-text-size-adjust:100%}
body{margin:0 auto;padding:0 20px;max-width:760px}
a{color:inherit}
header{display:flex;justify-content:space-between;align-items:baseline;gap:8px 24px;flex-wrap:wrap;padding:22px 0 14px;border-bottom:1px solid var(--ink)}
header a{text-decoration:none}
header .name{font-weight:600}
nav{display:flex;gap:20px}
nav a{color:var(--muted);padding:4px 0}
nav a:hover,nav a[aria-current]{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
main{padding:36px 0 56px}
h1{font-size:28px;font-weight:600;line-height:1.2;margin:0 0 10px;letter-spacing:-.01em}
h2{font-size:20px;font-weight:600;margin:40px 0 10px}
h2:first-of-type{margin-top:32px}
p{margin:0 0 14px}
.lede{color:var(--muted);margin-bottom:32px}
.muted{color:var(--muted)}
code,pre,.url{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace}
code{font-size:.9em}
pre{font-size:13px;line-height:1.55;margin:0 0 16px;padding:14px;background:var(--field);border:1px solid var(--rule);overflow-x:auto}
label.field{display:block;font-weight:600;margin-bottom:8px}
input[type=text]{width:100%;font:inherit;font-size:18px;min-height:48px;padding:10px 14px;border:1px solid var(--ink);border-radius:0;background:var(--field);color:inherit}
input::placeholder{color:var(--muted)}
fieldset{border:0;padding:0;margin:30px 0 0;min-width:0}
legend{font-weight:600;padding:0;margin-bottom:8px}
.group{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:16px 0 4px}
.group:first-child{padding-top:4px}
.styles{border-bottom:1px solid var(--rule)}
.style{display:grid;grid-template-columns:auto 11.5em 1fr;column-gap:12px;align-items:baseline;padding:9px 0;min-height:44px;border-top:1px solid var(--rule);cursor:pointer}
.style code{display:block;font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
input[type=radio]{accent-color:var(--ink);width:16px;height:16px;margin:0;position:relative;top:2px}
.lengths{display:flex;flex-wrap:wrap;gap:0 28px}
.lengths label{display:inline-flex;align-items:center;gap:10px;min-height:44px;cursor:pointer}
input[type=number]{width:5.5em;font:inherit;padding:6px 8px;min-height:36px;border:1px solid var(--rule);border-radius:0;background:var(--field);color:inherit}
button{font:inherit;font-weight:600;border-radius:0;cursor:pointer;min-height:48px}
.primary{background:var(--ink);color:var(--paper);border:1px solid var(--ink);padding:10px 30px;margin-top:30px}
.primary:hover{opacity:.88}
.primary:disabled{opacity:.6;cursor:default}
.secondary{background:transparent;color:var(--ink);border:1px solid var(--ink);padding:6px 18px;min-height:44px}
.secondary:hover{background:var(--field)}
:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.result{margin-top:40px;border-top:1px solid var(--ink);padding-top:18px}
.url{font-size:14px;line-height:1.6;margin:0;padding:14px;background:var(--field);border:1px solid var(--rule);word-break:break-all;overflow-wrap:anywhere;white-space:pre-wrap;user-select:all}
.meta{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:12px;color:var(--muted)}
.copied{color:var(--accent);border-color:var(--accent)}
.error{color:var(--accent);margin:18px 0 0}
table{border-collapse:collapse;width:100%;margin:0 0 16px;font-size:15px}
th,td{text-align:left;vertical-align:top;padding:8px 12px 8px 0;border-bottom:1px solid var(--rule)}
th{font-weight:600}
td code{white-space:nowrap}
.plans{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:8px}
.plan{border-top:1px solid var(--ink);padding-top:14px}
.plan h2{margin:0 0 4px}
.price{font-size:28px;margin:0 0 16px}
.plan ul{margin:0;padding:0;list-style:none}
.plan li{padding:6px 0;border-bottom:1px solid var(--rule)}
footer{border-top:1px solid var(--rule);padding:18px 0 40px;color:var(--muted);font-size:14px}
footer p{margin:0}
@media (max-width:640px){
.style{grid-template-columns:auto 1fr;row-gap:2px}
.style code{grid-column:2}
.plans{grid-template-columns:1fr}
h1{font-size:24px}
}
`.trim();
