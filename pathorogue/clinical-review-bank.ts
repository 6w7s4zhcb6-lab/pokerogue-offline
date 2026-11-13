import { nursingFacts, type NursingFact } from "./nursing-content";
import { getClinicalCase } from "./clinical-bank";
import { giReviewVariants } from "./clinical-review-gi";
import { renalReviewVariants } from "./clinical-review-renal";
import { mskReviewVariants } from "./clinical-review-msk";

/** Authored new clinical situations, preserving the subsection's learning target. */
export const reviewVariants: Record<string,[string,string,string]> = {...giReviewVariants,...renalReviewVariants,...mskReviewVariants};
export function caseVariants(fact:NursingFact) {
  const item=getClinicalCase(fact),reviews=reviewVariants[fact.id];
  if(!reviews || reviews.length!==3)throw new Error(`Missing fresh review cases for ${fact.id}`);
  return [{id:"base",stem:item.stem},...(item.harderStem && item.harderStem!==item.stem ? [{id:"advanced",stem:item.harderStem}]:[]),...reviews.map((stem,index)=>({id:`review-${index+1}`,stem}))];
}
export function validateReviewBank() {
  const ids=new Set(nursingFacts.map(f=>f.id)),stems=new Set(Object.values(reviewVariants).flat());
  if(Object.keys(reviewVariants).length!==ids.size || stems.size!==ids.size*3)throw new Error("Fresh review case coverage or uniqueness failed");
  for(const id of Object.keys(reviewVariants))if(!ids.has(id))throw new Error(`Unknown review case ${id}`);
  const existing=new Set(nursingFacts.flatMap(f=>{const c=getClinicalCase(f);return [c.stem,...(c.harderStem?[c.harderStem]:[])];}));
  for(const f of nursingFacts)for(const stem of reviewVariants[f.id]||[]) {
    if(stem.length<60 || !stem.includes("?") || existing.has(stem))throw new Error(`Invalid or repeated review vignette ${f.id}`);
    if(/clinician is reviewing|following patient.care scenario/i.test(stem))throw new Error(`Templated review vignette ${f.id}`);
    const c=getClinicalCase(f),normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    if(c.kind==="diagnosis" && normalize(stem).includes(normalize(c.answer)))throw new Error(`Diagnosis disclosed by review vignette ${f.id}`);
  }
  return {subsections:ids.size,freshReviewCases:stems.size};
}
