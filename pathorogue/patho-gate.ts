import { pathoFacts, type PathoFact } from "./patho-facts";
/* PathoRogue: 96 concepts, 687 independently tracked subsections. Offline only. */
type Mode="attack"|"defense";
type Item={seen:number;correct:number;misses:number;step:number;due:number;mastered:boolean;last:number};
type State={version:4;total:number;correct:number;level:number;good:number;bad:number;items:Record<string,Item>};
const KEY="pathorogue.mastery.v4",REVIEW=[10,20,50];
const LEVELS=["Easy","Medium","Hard","Very Hard","Extreme","Hard Extreme","Super Extreme","Ultra Extreme","Sub Max","Max"];
const blank=():State=>({version:4,total:0,correct:0,level:0,good:0,bad:0,items:{}});
let state=blank();
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s?.version===4&&s.items&&typeof s.total==="number")state={...blank(),...s};}
catch(e){console.warn("PathoRogue load",e);}
const pick=<T>(a:T[])=>a[Math.floor(Math.random()*a.length)];
const shuffle=<T>(a:T[])=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const esc=(a:unknown)=>String(a??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const byConcept=new Map<string,PathoFact[]>();
const concepts=new Map<string,{concept:string;group:string;objective:string}>();
for(const f of pathoFacts){const a=byConcept.get(f.conceptId)||[];a.push(f);byConcept.set(f.conceptId,a);concepts.set(f.conceptId,f);}
let hud:HTMLDivElement|null=null,layer:HTMLDivElement|null=null,active=false;
function item(f:PathoFact){return state.items[f.id]||(state.items[f.id]={seen:0,correct:0,misses:0,step:0,due:0,mastered:false,last:0});}
function mastered(id:string){return (byConcept.get(id)||[]).every(f=>state.items[f.id]?.mastered);}
function masterCount(){return pathoFacts.reduce((n,f)=>n+(state.items[f.id]?.mastered?1:0),0);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn("PathoRogue save",e);}drawHud();}
function drawHud(){if(hud)hud.textContent="Patho Quiz · "+state.total+" questions · "+masterCount()+"/"+pathoFacts.length+" subsections · Level "+(state.level+1);}
function initialize(){
 if(layer)return;
 const style=document.createElement("style");
 style.textContent="#pr-hud{position:fixed;top:7px;right:8px;z-index:2147482000;background:#10283af5;color:#e6fff9;border:1px solid #46b7ae;border-radius:10px;padding:8px 12px;cursor:pointer;font:600 12px system-ui}#pr-overlay{position:fixed;inset:0;z-index:2147483000;background:#06131ceF;color:#ecffff;display:none;align-items:center;justify-content:center;padding:12px;overflow:auto;font:14px/1.5 system-ui}#pr-dialog{max-width:820px;width:100%;max-height:94vh;overflow:auto;margin:auto;padding:22px;background:#153149;border:1px solid #4e8597;border-radius:18px}#pr-dialog h2{color:#6eedd3;font-size:22px;margin:4px 0 12px}#pr-dialog p{line-height:1.5}#pr-dialog .pr-muted{color:#b7cbd4;font-size:12px}#pr-dialog button{display:block;width:100%;margin:8px 0;padding:11px 13px;background:#274c64;color:#fff;text-align:left;border:1px solid #668ca0;border-radius:9px;cursor:pointer;font:inherit}#pr-dialog button:hover{background:#34637c}#pr-dialog button:disabled{opacity:.65;cursor:default}#pr-dialog .pr-good{background:#176450}#pr-dialog .pr-bad{background:#7c3842}#pr-dialog .pr-primary{text-align:center;background:#187c70;font-weight:800}#pr-dialog details{border:1px solid #35556b;margin:8px 0;padding:9px;border-radius:9px}#pr-dialog summary{cursor:pointer;font-weight:800}#pr-dialog .pr-item{border-bottom:1px solid #2a4c64;padding:5px;font-size:12px}";
 document.head.appendChild(style);
 hud=document.createElement("div");hud.id="pr-hud";hud.onclick=showTracker;document.body.appendChild(hud);
 layer=document.createElement("div");layer.id="pr-overlay";layer.innerHTML='<div id="pr-dialog"></div>';document.body.appendChild(layer);drawHud();
}
function show(html:string){initialize();document.getElementById("pr-dialog")!.innerHTML=html;layer!.style.display="flex";}
function hide(){if(layer)layer.style.display="none";}
function showTracker(){
 const groups=["GI","REN","MSK"].map(group=>{
  const ids=[...concepts.keys()].filter(id=>concepts.get(id)!.group===group);
  const label=group==="GI"?"Digestive":group==="REN"?"Urinary / Renal":"Musculoskeletal";
  return '<details><summary>'+label+' — '+ids.filter(mastered).length+'/'+ids.length+' concepts</summary>'+ids.map(id=>{
   const sub=byConcept.get(id)||[];const done=sub.filter(f=>state.items[f.id]?.mastered).length;
   return '<details><summary>'+esc(concepts.get(id)!.concept)+' — '+done+'/'+sub.length+'</summary>'+sub.map(f=>{
    const i=state.items[f.id],status=!i?.seen?"Not covered":i.mastered?"Mastered":i.due>state.total?"Review in "+(i.due-state.total)+" answers":"Review due";
    return '<div class="pr-item">'+esc(f.subsection)+': <b>'+esc(status)+'</b></div>';
   }).join("")+'</details>';
  }).join("")+'</details>';
 }).join("");
 show('<div class="pr-muted">Offline Pathophysiology mastery</div><h2>Question and mastery tracker</h2><p><b>'+state.total+'</b> total answers · <b>'+state.correct+'</b> correct · <b>'+LEVELS[state.level]+'</b> difficulty</p><p>'+masterCount()+'/'+pathoFacts.length+' subsections mastered · '+[...concepts.keys()].filter(mastered).length+'/'+concepts.size+' concepts mastered</p>'+groups+'<button class="pr-primary" id="pr-exit">Return to game</button><button id="pr-export">Export save</button><button id="pr-import">Import save</button>');
 document.getElementById("pr-exit")!.onclick=hide;
 document.getElementById("pr-export")!.onclick=()=>{const a=document.createElement("a");a.href="data:application/json,"+encodeURIComponent(JSON.stringify(state));a.download="pathorogue-progress.json";a.click();};
 document.getElementById("pr-import")!.onclick=()=>{const input=document.createElement("input");input.type="file";input.accept=".json";input.onchange=async()=>{try{const file=input.files?.[0];if(!file)return;const v=JSON.parse(await file.text());if(v.version!==4||!v.items||!Number.isFinite(v.total))throw Error("Wrong file");state=v;persist();showTracker();}catch(e){alert("Import failed: "+String(e));}};input.click();};
}
function due(exclude:Set<string>):PathoFact|null{
 const list=pathoFacts.filter(f=>{const i=state.items[f.id];return !exclude.has(f.id)&&i&&i.misses>0&&!i.mastered&&i.due>0&&i.due<=state.total;});
 list.sort((a,b)=>state.items[a.id].due-state.items[b.id].due);
 return list[0]||null;
}
function select(concept:string|null,used:Set<string>):{f:PathoFact;review:boolean}{
 const review=due(used);if(review)return {f:review,review:true};
 const fresh=(a:PathoFact[])=>{const allowed=a.filter(f=>!used.has(f.id));return pick(allowed.filter(f=>!state.items[f.id]?.seen).length?allowed.filter(f=>!state.items[f.id]?.seen):allowed);};
 if(concept){const list=(byConcept.get(concept)||[]).filter(f=>!used.has(f.id));if(list.length)return{f:fresh(list),review:false};}
 const unseen=pathoFacts.filter(f=>!used.has(f.id)&&!state.items[f.id]?.seen);
 if(unseen.length){const touched=new Set(pathoFacts.filter(f=>state.items[f.id]?.seen).map(f=>f.conceptId));const first=unseen.filter(f=>!touched.has(f.conceptId));return{f:pick(first.length?first:unseen),review:false};}
 const allowed=pathoFacts.filter(f=>!used.has(f.id));
 return {f:fresh(allowed.length?allowed:pathoFacts),review:false};
}
function grade(f:PathoFact,correct:boolean,review:boolean){
 const i=item(f),previousDue=i.due;
 state.total++;i.seen++;i.last=state.total;
 if(correct){
  state.correct++;i.correct++;state.good++;state.bad=0;
  if(state.good>=10){state.good=0;state.level=Math.min(9,state.level+1);}
  if(i.misses===0){i.mastered=true;i.due=0;}
  else if(review||previousDue>0&&previousDue<=state.total-1){
   i.step++;if(i.step>=3){i.mastered=true;i.due=0;}else i.due=state.total+REVIEW[i.step];
  }
 }else{
  i.misses++;i.step=0;i.due=state.total+REVIEW[0];i.mastered=false;
  state.good=0;state.bad++;if(state.bad>=3){state.bad=0;state.level=Math.max(0,state.level-1);}
 }
 persist();
}
function createOptions(f:PathoFact):string[]{
 const count=[4,5,6,6,6,4,5,6,6,6][state.level];
 const same=pathoFacts.filter(x=>x.id!==f.id&&x.subsection===f.subsection&&x.group===f.group);
 const similar=pathoFacts.filter(x=>x.id!==f.id&&x.subsection===f.subsection);
 const foils:string[]=[];
 for(const a of shuffle([...same,...similar,...pathoFacts.filter(x=>x.id!==f.id)])){
  if(a.lesson!==f.lesson&&!foils.includes(a.lesson))foils.push(a.lesson);
  if(foils.length>=count-1)break;
 }
 return shuffle([f.lesson,...foils]);
}
const prompts=[
 "Which statement correctly describes the pathophysiology?",
 "Which clinical interpretation is most accurate?",
 "Which explanation is best supported for this condition?",
 "Distinguish this condition from related disease mechanisms.",
 "Several answers may be plausible in other cases. Which best fits here?",
 "Identify the most specific interpretation among related mechanisms.",
 "Differentiate the closely related disease processes.",
 "Choose the statement that is most directly justified by this condition.",
 "Avoid assumptions not established by the condition. Choose the best response.",
 "Critically distinguish the precise mechanism from misleading alternatives."
];
/** Correct gates only enable native PokéRogue accuracy, not guaranteed hits or dodges. */
export function openNursingGate(mode:Mode):Promise<boolean>{
 if(active)return Promise.resolve(false);
 active=true;initialize();
 const required=mode==="attack"?3:2;
 let step=0,concept:string|null=null;
 const used=new Set<string>();
 return new Promise(resolve=>{
  const finish=(passed:boolean)=>{active=false;hide();drawHud();resolve(passed);};
  const next=()=>{
   if(step>=required){finish(true);return;}
   const chosen=select(concept,used);const f=chosen.f;if(!concept)concept=f.conceptId;used.add(f.id);
   const answers=createOptions(f);
   show('<div class="pr-muted">'+(mode==="attack"?"PLAYER ATTACK":"ENEMY ATTACK")+' · '+(step+1)+' of '+required+' · '+esc(LEVELS[state.level])+(chosen.review?" · Due subsection review":"")+'</div><h2>'+esc(f.concept)+'</h2><p class="pr-muted">'+esc(f.subsection)+' · '+esc(f.objective)+'</p><p>'+esc(prompts[state.level])+'</p>'+answers.map((a,i)=>'<button data-choice="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(a)+'</button>').join("")+'<p class="pr-muted">Normal attacks use the same concept with different subsections; scheduled reviews take priority.</p>');
   const box=document.getElementById("pr-dialog")!;
   const btns=[...box.querySelectorAll<HTMLButtonElement>("[data-choice]")];
   btns.forEach(btn=>btn.onclick=()=>{
    if(btn.disabled)return;
    const answered=answers[Number(btn.dataset.choice)],correct=answered===f.lesson;
    grade(f,correct,chosen.review);
    btns.forEach(b=>{b.disabled=true;if(answers[Number(b.dataset.choice)]===f.lesson)b.classList.add("pr-good");else if(b===btn)b.classList.add("pr-bad");});
    const explain=document.createElement("div");
    explain.innerHTML='<h2>'+(correct?"Correct":"Incorrect")+'</h2><p><b>Rationale:</b> '+esc(f.lesson)+'</p><p class="pr-muted">Lecture: '+esc(f.source)+'</p><button class="pr-primary" id="pr-next">'+(correct&&step+1<required?"Next question":"Return to battle")+'</button>';
    box.appendChild(explain);
    document.getElementById("pr-next")!.onclick=()=>{if(!correct)finish(false);else{step++;next();}};
   });
  };
  next();
 });
}
