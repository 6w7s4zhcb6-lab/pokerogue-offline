import type { NursingFact } from "./nursing-content";
import { getClinicalCase } from "./clinical-bank";
import { caseVariants } from "./clinical-review-bank";
/** Ten tiers progressively introduce authored reduced-cue cases. No wording generator. */
export const CLINICAL_DIFFICULTY = [
  {choices:3,advanced:0,close:0,concise:false,focus:[],description:"Full clinical clues · 3 clearly separated choices"},
  {choices:4,advanced:0,close:0,concise:false,focus:[],description:"Full clinical clues · 4 choices"},
  {choices:4,advanced:1,close:1,concise:false,focus:["mechanism"],description:"Mechanism focus · one closer alternative"},
  {choices:4,advanced:1,close:2,concise:false,focus:["signs","mechanism"],description:"Interpret findings · two closer alternatives"},
  {choices:4,advanced:1,close:2,concise:true,focus:["mechanism","complications"],description:"Concise cases · connect mechanisms and consequences"},
  {choices:4,advanced:1,close:3,concise:true,focus:["tests","mechanism"],description:"Concise cases · closest alternatives · assessment focus"},
  {choices:4,advanced:1,close:3,concise:true,focus:["complications","tests"],description:"Complications and assessment · fewer topic hints"},
  {choices:4,advanced:1,close:3,concise:true,focus:["management","complications"],description:"Nursing priorities · closest alternatives · topic hidden"},
  {choices:4,advanced:1,close:3,concise:true,focus:["management","tests"],description:"Clinical decisions · concise cases · section hints hidden"},
  {choices:4,advanced:1,close:3,concise:true,focus:["management","complications","tests"],description:"Priority decisions · least detailed unused cases · all topic hints hidden"},
] as const;
export function isIdentification(fact:NursingFact):boolean {
  const kind=getClinicalCase(fact).kind;
  return kind==="diagnosis" || fact.subsectionId==="recognition";
}
export function identificationLabel(fact:NursingFact):string {
  const kind=getClinicalCase(fact).kind;
  return kind==="diagnosis"?"Identify the condition":kind==="treatment"?"Identify the treatment":kind==="test"?"Identify the test":"Clinical recognition";
}
export function buildChoices(fact:NursingFact,level:number,seenCases:readonly string[]=[]) {
  const c=getClinicalCase(fact),tier=CLINICAL_DIFFICULTY[Math.max(0,Math.min(9,level))];
  const advanced=tier.advanced>0;
  const variants=caseVariants(fact),preferred=tier.concise ? [...variants.filter(v=>v.id==='base'||v.id==='advanced')].sort((a,b)=>a.stem.length-b.stem.length)[0] : variants[0];
  const unused=variants.filter(v=>!seenCases.includes(v.id));
  // A repeat learning target gets a genuinely different authored scenario.
  // Only answered/displayed cases enter history; prefetch does not consume one.
  const reviews=unused.filter(v=>v.id.startsWith('review-')).sort((a,b)=>tier.concise?a.stem.length-b.stem.length:0);
  const selected=seenCases.length ? reviews[0]||unused.find(v=>v.id===preferred.id)||unused[0]||[...variants].sort((a,b)=>seenCases.indexOf(a.id)-seenCases.indexOf(b.id))[0] : preferred;
  const close=c.harderFoils||c.foils;
  const candidates=[...close.slice(0,tier.close),...c.foils,...close];
  const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const foils:typeof c.foils=[];
  for(const option of candidates){const text=normalize(option.text);if(!foils.some(o=>{const other=normalize(o.text);return text===other||Math.min(text.length,other.length)>12&&(text.startsWith(other+' ')||other.startsWith(text+' '));}))foils.push(option);if(foils.length===tier.choices-1)break;}
  const optionReasons:Record<string,string> = Object.fromEntries([[c.answer,c.why],...foils.map(o=>[o.text,o.why])]);
  return {caseId:selected.id,stem:selected.stem,answer:c.answer,distractors:foils.map(o=>o.text),rationale:c.why,optionReasons,advanced:!!(advanced&&(c.harderStem||c.harderFoils))};
}
export function clinicalExplanation(fact:NursingFact,option:string):string|null {
  const c=getClinicalCase(fact);if(option===c.answer)return c.why;
  return [...c.foils,...(c.harderFoils||[])].find(o=>o.text===option)?.why||null;
}
