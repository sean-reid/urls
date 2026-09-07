// Progressive enhancement only. The form posts and renders without it.
export const CLIENT = `
(()=>{
const f=document.getElementById("f"),r=document.getElementById("result");
if(!f||!r)return;
const nf=new Intl.NumberFormat("en-US");
const exact=document.getElementById("exact"),num=f.elements.namedItem("exact");
for(const ev of["focus","input"])num.addEventListener(ev,()=>{exact.checked=true});
document.querySelectorAll("[data-copy]").forEach(b=>{b.hidden=false});
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function show(j,ok){
r.hidden=false;r.replaceChildren();
if(!ok){r.append(el("p","error",j.error||"The request could not be completed."));return}
const u=el("p","url",j.url);u.id="out";
const m=el("div","meta");
m.append(el("span",null,nf.format(j.length)+" characters."+(j.minimum?" The destination needs at least this many.":"")));
const c=el("button","secondary","Copy");c.type="button";c.dataset.copy="";m.append(c);
r.append(u,m);u.focus&&u.setAttribute("tabindex","-1");u.focus();
}
f.addEventListener("submit",async e=>{
e.preventDefault();
const d=new FormData(f),b=f.querySelector(".primary");
const len=d.get("length")==="exact"?d.get("exact"):d.get("length");
b.disabled=true;
try{
const res=await fetch("/api/v1/extend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:d.get("url"),style:d.get("style"),length:Number(len)})});
show(await res.json(),res.ok);
}catch{show({error:"The service could not be reached."},false)}
finally{b.disabled=false}
});
document.addEventListener("click",e=>{
const t=e.target.closest("[data-copy]");if(!t)return;
const out=document.getElementById("out");if(!out)return;
navigator.clipboard.writeText(out.textContent).then(()=>{
t.textContent="Copied";t.classList.add("copied");
setTimeout(()=>{t.textContent="Copy";t.classList.remove("copied")},2000);
});
});
})();
`.trim();
