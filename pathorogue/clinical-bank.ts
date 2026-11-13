import { nursingFacts, type NursingFact } from "./nursing-content";
import type { ClinicalCase } from "./clinical-types";
import { giCases } from "./clinical-gi";
import { renalCases } from "./clinical-renal";
import { mskCases } from "./clinical-msk";
import { renalAdvancedA } from "./clinical-renal-advanced-a";
import { renalAdvancedB } from "./clinical-renal-advanced-b";
export const clinicalCases: Record<string, ClinicalCase> = { ...giCases, ...renalCases, ...mskCases };
for(const [id,variant] of Object.entries({...renalAdvancedA,...renalAdvancedB})) {
  if(!renalCases[id] || renalAdvancedA[id]&&renalAdvancedB[id])throw new Error(`Invalid advanced renal case ${id}`);
  clinicalCases[id]={...clinicalCases[id],...variant};
}
export function getClinicalCase(fact: NursingFact | string): ClinicalCase {
  const id=typeof fact==="string"?fact:fact.id;
  const item=clinicalCases[id];if(!item)throw new Error(`No authored clinical case for ${id}`);return item;
}
export function validateClinicalBank() {
  const ids=new Set(nursingFacts.map(f=>f.id)),stems=new Set<string>();
  for(const [topic,items] of [["GI",giCases],["REN",renalCases],["MSK",mskCases]] as const)for(const key of Object.keys(items))if(nursingFacts.find(f=>f.id===key)?.topic!==topic)throw new Error(`Case in wrong clinical topic ${key}`);
  for(const key of Object.keys(clinicalCases))if(!ids.has(key))throw new Error(`Unknown clinical case ID ${key}`);
  for(const f of nursingFacts){
    const c=getClinicalCase(f);
    if(!c.stem || !c.answer || !c.why || c.foils.length!==3)throw new Error(`Incomplete clinical case ${f.id}`);
    if(/clinician is reviewing|following patient.care scenario/i.test(c.stem))throw new Error(`Unfocused case wording ${f.id}`);
    if(stems.has(c.stem))throw new Error(`Duplicate clinical vignette ${f.id}`);stems.add(c.stem);
    for(const group of [c.foils,...(c.harderFoils?[c.harderFoils]:[])]){
      if(group.length!==3 || new Set([c.answer,...group.map(o=>o.text)].map(s=>s.toLowerCase().replace(/[^a-z0-9]/g,""))).size!==4)throw new Error(`Nonexclusive option text ${f.id}`);
      if(group.some(o=>!o.why || !o.text))throw new Error(`Missing option explanation ${f.id}`);
    }
  }
  return {cases:Object.keys(clinicalCases).length,advanced:Object.values(clinicalCases).filter(c=>c.harderStem||c.harderFoils).length};
}
