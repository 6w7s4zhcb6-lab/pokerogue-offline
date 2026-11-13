import { nursingFacts, type NursingFact } from "./nursing-content";
import { buildChoices, isIdentification, identificationLabel } from "./question-builder";
import { getClinicalCase } from "./clinical-bank";
import { caseVariants } from "./clinical-review-bank";
import { getDiseaseGuide, renderDiseaseGuide } from "./disease-guide";
import { explainOptions } from "./question-rationales";
import { canOpenStudy, studyRunId } from "./battle-context";

const KEY = "pokerogue.study-center.v1";
type Attempt = { fact: string; correct: boolean; assisted: boolean; at: number };
type Confusion = { fact: string; option: string; misses: number; repairs: string[]; resolved: boolean };
type Study = { runId?: string; run: Attempt[]; runs: { at: number; victory: boolean; attempts: Attempt[] }[]; clinic: Attempt[]; clinicCases?:Record<string,string[]>; confusions: Record<string, Confusion> };
const empty = (): Study => ({ run: [], runs: [], clinic: [], confusions: {} });
function read(): Study {
  try { const s = JSON.parse(window.localStorage.getItem(KEY) || "null"); if (s && Array.isArray(s.run) && Array.isArray(s.runs) && Array.isArray(s.clinic) && s.confusions && typeof s.confusions === "object") return s; } catch {}
  return empty();
}
let study = read();
const save = () => { try { window.localStorage.setItem(KEY, JSON.stringify(study)); } catch {} };
const html = (x: unknown) => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] || c));
const factById = (id: string) => nursingFacts.find(f => f.id === id);
export function recordStudyAnswer(fact: NursingFact, selected: string[], correct: boolean, clinic = false, assisted = false) {
  if (!clinic) { const id = studyRunId(); if (id && study.runId && id !== study.runId && study.run.length) { study.runs.push({at:Date.now(),victory:false,attempts:[...study.run]});study.runs=study.runs.slice(-20);study.run=[]; } if(id)study.runId=id; }
  const attempt = { fact: fact.id, correct, assisted, at: Date.now() };
  const ledger = clinic ? study.clinic : study.run;
  ledger.push(attempt); if (ledger.length > 5000) ledger.shift();
  if (!correct) for (const option of selected.filter(s => s !== getClinicalCase(fact).answer)) {
    const key = JSON.stringify([fact.id, option]);
    const c = study.confusions[key] ||= { fact: fact.id, option, misses: 0, repairs: [], resolved: false };
    c.misses++; c.repairs = []; c.resolved = false;
  }
  if (correct && !assisted) for (const c of Object.values(study.confusions)) {
    if (c.misses >= 2 && factById(c.fact)?.conceptId === fact.conceptId && c.fact !== fact.id) {
      if (!c.repairs.includes(fact.id)) c.repairs.push(fact.id);
      c.resolved = c.repairs.length >= 2;
    }
  }
  save();
}
export function repairMarkup(fact: NursingFact): string {
  const matches = Object.values(study.confusions).filter(c => c.misses >= 2 && !c.resolved && factById(c.fact)?.conceptId === fact.conceptId);
  return matches.map(c => {
    const original = factById(c.fact)!;
    const caseItem=getClinicalCase(original);
    const explanation = explainOptions(original, [caseItem.answer, c.option], [caseItem.answer], caseItem.why);
    return `<aside class="ng-feedback ng-repair"><strong>Misconception repair · ${c.misses} repeated misses</strong><p>${html(original.concept)} · ${html(original.subsectionName)}</p>${explanation.map(e => `<p><b>${e.correct ? "Supported pattern" : "Previously confused option"}:</b> ${html(e.option)}<br/>${html(e.explanation)}</p>`).join("")}<p>Practice two other subsections of this concept without hints to resolve this confusion.</p></aside>`;
  }).join("");
}
function summary(attempts: Attempt[]): string {
  if (!attempts.length) return "<p>No battle answers recorded for this run yet.</p>";
  const groups = new Map<string, { right: number; total: number }>();
  for (const a of attempts) { const f = factById(a.fact); if (!f) continue; const label = f.subsectionName; const g = groups.get(label) || { right: 0, total: 0 }; g.total++; if (a.correct) g.right++; groups.set(label, g); }
  const ranked = [...groups].sort((a,b) => b[1].right/b[1].total - a[1].right/a[1].total);
  const weak = [...ranked].reverse().filter(([, g]) => g.right < g.total).slice(0,3);
  const strong = ranked.filter(([, g]) => g.right > 0).slice(0,3);
  return `<p>${attempts.filter(a=>a.correct).length}/${attempts.length} battle answers correct.</p><p><strong>Strongest observed areas:</strong> ${strong.map(([n,g])=>`${html(n)} (${g.right}/${g.total})`).join(", ") || "More practice needed"}</p><p><strong>Next study steps:</strong></p><ol>${weak.map(([n,g])=>`<li>Review ${html(n)} (${g.right}/${g.total}), then try a different subsection of the same concept.</li>`).join("") || "<li>Try an unseen subsection in the practice clinic.</li>"}<li>Work through any recurring confusions listed below.</li><li>Return to the mastery tracker for your scheduled 10/20/50 reviews.</li></ol>`;
}
let overlay: HTMLElement | null = null;
let previousFocus: HTMLElement | null = null;
function keyBlock(e: KeyboardEvent) {
  e.stopImmediatePropagation();
  if (e.key === "Escape") { e.preventDefault(); close(); }
  if (e.key === "Tab") {
    const controls = [...(overlay?.querySelectorAll<HTMLElement>("button:not([disabled]),select") || [])].filter(e=>!e.hidden && !e.closest("[hidden]"));
    if (controls.length) { e.preventDefault(); const i=controls.indexOf(document.activeElement as HTMLElement); controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length].focus(); }
  }
}
function close() { overlay?.remove(); overlay = null; document.removeEventListener("keydown", keyBlock, true); document.removeEventListener("keyup", keyBlock, true); previousFocus?.focus(); }
function mount() {
  if (document.getElementById("ng-overlay")) return false;
  previousFocus = document.activeElement as HTMLElement;
  overlay = document.createElement("div"); overlay.id = "ng-overlay"; overlay.dataset.studyCenter = "true";
  overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true"); overlay.setAttribute("aria-label", "Study clinic and run debrief");
  document.body.appendChild(overlay);
  document.addEventListener("keydown", keyBlock, true); document.addEventListener("keyup", keyBlock, true);
  return true;
}
function view(body: string) {
  if (!overlay) return;
  overlay.innerHTML = `<style>#ng-overlay[data-study-center] .ng-action{background:#20354d;border:1px solid #688ba4;border-radius:8px;padding:8px 12px;color:#eff5ff}#ng-overlay[data-study-center] select{color:#111;background:white;max-width:100%}</style><div id="ng-question-host"><div class="ng-dialog"><button class="ng-action" id="ng-study-close" style="float:right">Close</button>${body}</div></div>`;
  overlay.querySelector("#ng-study-close")?.addEventListener("click", close);
  overlay.querySelector<HTMLElement>("button")?.focus();
}
export function openStudyCenter(ended = false) {
  if (!ended && !canOpenStudy()) return;
  if (!mount()) return;
  const concepts = [...new Map(nursingFacts.map(f => [f.conceptId, f])).values()];
  const pending = Object.values(study.confusions).filter(c=>c.misses>=2 && !c.resolved);
  const resolved = Object.values(study.confusions).filter(c=>c.resolved).length;
  const latest = study.runs.at(-1);
  view(`<h2>${ended ? "End-of-run study debrief" : "Practice clinic & study debrief"}</h2>${summary(ended ? latest?.attempts || [] : study.run)}<p>Recurring confusions: ${pending.length} pending · ${resolved} resolved.</p>${pending.slice(0,8).map(c=>`<p>${html(factById(c.fact)?.concept)}: ${html(c.option)} · ${c.misses} misses · ${c.repairs.length}/2 independent repair subsections</p>`).join("")}<h3>Practice clinic</h3><p>Practice safely outside battles. Hints and clinic answers never change battle mastery, difficulty or your run.</p><label>Topic <select id="ng-clinic-topic" style="max-width:100%"><option value="weak">My weak areas / misconception repair</option>${concepts.map(f=>`<option value="${html(f.conceptId)}">${html(f.concept)}</option>`).join("")}</select></label><p><button class="ng-submit" id="ng-clinic-start">Start five practice questions</button></p><p>Clinic totals: ${study.clinic.filter(a=>!a.assisted).length} independent attempts · ${study.clinic.filter(a=>a.assisted).length} hint-assisted attempts.</p>${latest && !ended ? `<details><summary>Last completed run</summary>${summary(latest.attempts)}</details>` : ""}`);
  overlay!.querySelector("#ng-clinic-start")?.addEventListener("click", () => {
    const topic = overlay!.querySelector<HTMLSelectElement>("#ng-clinic-topic")!.value;
    let pool = nursingFacts.filter(f=>topic === "weak" || f.conceptId === topic);
    if (topic === "weak") {
      const weak = new Set([...study.run,...(latest?.attempts || []),...study.clinic].filter(a=>!a.correct).map(a=>factById(a.fact)?.conceptId));
      for (const c of pending) weak.add(factById(c.fact)?.conceptId);
      if (weak.size) pool = pool.filter(f=>weak.has(f.conceptId));
      pool = [...pool].sort((a,b)=>Number(study.clinic.some(c=>c.fact===a.id))-Number(study.clinic.some(c=>c.fact===b.id)));
    } else pool = [...pool].sort(()=>Math.random()-.5);
    // Use fresh subsections, avoiding the original mistaken item when repairing.
    const original = new Set(pending.map(c=>c.fact));
    pool = [...pool.filter(f=>!original.has(f.id)), ...pool.filter(f=>original.has(f.id))];
    pool=pool.sort((a,b)=>Number(!caseVariants(a).some(v=>!study.clinicCases?.[a.id]?.includes(v.id)))-Number(!caseVariants(b).some(v=>!study.clinicCases?.[b.id]?.includes(v.id))));
    const selected:NursingFact[]=[];let hasIdentification=false;
    for(const fact of pool){if(isIdentification(fact)&&hasIdentification)continue;selected.push(fact);hasIdentification ||= isIdentification(fact);if(selected.length===5)break;}
    selected.sort((a,b)=>Number(isIdentification(b))-Number(isIdentification(a)));
    practice(selected, 0, []);
  });
}
function practice(pool: NursingFact[], index: number, results: Attempt[]) {
  if (!overlay) return;
  if (index >= pool.length) { view(`<h2>Clinic complete</h2><p>${results.filter(a=>a.correct).length}/${results.length} correct · ${results.filter(a=>a.assisted).length} hint-assisted.</p><p>Battle mastery and difficulty were unchanged.</p><button id="ng-clinic-again" class="ng-submit">Back to study center</button>`); overlay!.querySelector("#ng-clinic-again")?.addEventListener("click",()=>{close();openStudyCenter();}); return; }
  const f=pool[index], seen=study.clinicCases?.[f.id] || (study.clinic.some(a=>a.fact===f.id)?["base"]:[]);
  const clinical=buildChoices(f,0,seen), options=[clinical.answer,...clinical.distractors].sort(()=>Math.random()-.5);
  (study.clinicCases ||= {})[f.id]=[...seen.filter(id=>id!==clinical.caseId),clinical.caseId].slice(-5);save();
  overlay.dataset.clinicFact = f.id;
  let assisted=false, hint=0, graded=false;
  view(`<h2>Practice clinic · ${index+1}/${pool.length}</h2><p>${isIdentification(f)?html(identificationLabel(f)):html(f.concept)} · ${html(f.subsectionName)}</p>${isIdentification(f)?"":repairMarkup(f)}<p>${html(clinical.stem)}</p><button id="ng-clinic-hint" class="ng-action">Hint 1: background clue</button><p id="ng-clinic-hint-text" aria-live="polite"></p><div class="ng-answers">${options.map((o,i)=>`<button class="ng-option" data-clinic-answer="${i}">${html(o)}</button>`).join("")}</div><div id="ng-clinic-feedback" aria-live="polite"></div>`);
  overlay!.querySelector("#ng-clinic-hint")?.addEventListener("click",()=>{
    if (graded) return; assisted=true; hint++;
    overlay!.querySelector("#ng-clinic-hint-text")!.textContent=hint===1 ? getDiseaseGuide(f).definition : clinical.rationale;
    const button=overlay!.querySelector<HTMLButtonElement>("#ng-clinic-hint")!; button.textContent="Hint 2: explanation"; if(hint>=2)button.disabled=true;
  });
  overlay!.querySelectorAll<HTMLButtonElement>("[data-clinic-answer]").forEach(b=>b.addEventListener("click",()=>{
    if(graded)return; graded=true; const selected=options[Number(b.dataset.clinicAnswer)],correct=selected===clinical.answer;
    recordStudyAnswer(f,[selected],correct,true,assisted); results.push({fact:f.id,correct,assisted,at:Date.now()});
    overlay!.querySelectorAll<HTMLButtonElement>("[data-clinic-answer],#ng-clinic-hint").forEach(b=>b.disabled=true);
    overlay!.querySelector("#ng-clinic-feedback")!.innerHTML=`<div class="ng-feedback"><b>${correct?"Correct":"Incorrect"}${assisted?" · hint-assisted":" · independent"}</b>${renderDiseaseGuide(f)}${explainOptions(f,options,[clinical.answer],clinical.rationale).map(e=>`<p><strong>${html(e.option)}:</strong> ${html(clinical.optionReasons[e.option]||e.explanation)}</p>`).join("")}<button class="ng-next" id="ng-clinic-next">${index+1===pool.length?"Finish clinic":"Next question"}</button><div style="clear:both"></div></div>`;
    const next=overlay!.querySelector<HTMLButtonElement>("#ng-clinic-next")!;next.addEventListener("click",()=>practice(pool,index+1,results));next.focus();
  }));
}
export function finishStudyRun(victory: boolean) {
  study.runs.push({ at: Date.now(), victory, attempts: [...study.run] }); study.runs=study.runs.slice(-20); study.run=[];save();
  if(typeof document!=="undefined")openStudyCenter(true);
}
export function initStudyLauncher() {
  if(document.getElementById("ng-study-launcher"))return;
  const b=document.createElement("button");b.id="ng-study-launcher";b.textContent="Study clinic & debrief";
  b.style.cssText="position:fixed;left:8px;top:8px;z-index:2147483000;padding:9px;border-radius:10px;background:#14243d;color:#eff5ff;border:1px solid #67abce;cursor:pointer";
  b.addEventListener("click",()=>{if(canOpenStudy())openStudyCenter();else {b.textContent="Open at title or battle command menu";setTimeout(()=>b.textContent="Study clinic & debrief",2500);}});document.body.appendChild(b);
}


