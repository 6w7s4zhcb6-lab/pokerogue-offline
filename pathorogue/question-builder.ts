import type { NursingFact } from "./nursing-content";
import { getClinicalCase } from "./clinical-bank";
import { caseVariants } from "./clinical-review-bank";
/** Ten tiers progressively introduce authored reduced-cue cases. No wording generator. */
export const CLINICAL_DIFFICULTY = [
  {choices:3,advanced:0},{choices:4,advanced:0},{choices:4,advanced:.1},{choices:4,advanced:.25},{choices:4,advanced:.4},
  {choices:4,advanced:.55},{choices:4,advanced:.7},{choices:4,advanced:.85},{choices:4,advanced:.95},{choices:4,advanced:1},
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
  const advanced=level>0&&Math.random()<tier.advanced;
  const variants=caseVariants(fact),preferred=variants.find(v=>v.id===(advanced?"advanced":"base"))||variants[0];
  const unused=variants.filter(v=>!seenCases.includes(v.id));
  // A repeat learning target gets a genuinely different authored scenario.
  // Only answered/displayed cases enter history; prefetch does not consume one.
  const selected=seenCases.length ? unused.find(v=>v.id.startsWith("review-"))||unused.find(v=>v.id===preferred.id)||unused[0]||[...variants].sort((a,b)=>seenCases.indexOf(a.id)-seenCases.indexOf(b.id))[0] : preferred;
  const foils=(advanced&&c.harderFoils?c.harderFoils:c.foils).slice(0,tier.choices-1);
  const optionReasons:Record<string,string> = Object.fromEntries([[c.answer,c.why],...foils.map(o=>[o.text,o.why])]);
  return {caseId:selected.id,stem:selected.stem,answer:c.answer,distractors:foils.map(o=>o.text),rationale:c.why,optionReasons,advanced:!!(advanced&&(c.harderStem||c.harderFoils))};
}
export function clinicalExplanation(fact:NursingFact,option:string):string|null {
  const c=getClinicalCase(fact);if(option===c.answer)return c.why;
  return [...c.foils,...(c.harderFoils||[])].find(o=>o.text===option)?.why||null;
}
