import { nursingFacts, type NursingFact } from "./nursing-content";
import { questionOverrides } from "./question-quality-data";

const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
export function isIdentification(f: NursingFact): boolean { return clean(f.answer) === clean(f.concept); }
const builderShuffle = <T>(items: readonly T[]): T[] => { const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; };
const common = new Set("a an the and or of in on for to with from can may be is are as by which this that it its cause causes caused develop occur include includes associated treatment risk factors patients condition disease clinical primary main other no not than into reduced increased".split(" "));
const tokens=(s:string)=>new Set(clean(s).split(" ").filter(w=>w.length>3&&!common.has(w)));
const overlap=(a:Set<string>,b:Set<string>)=>[...a].filter(w=>b.has(w)).length;
const families = [
 /blood|bleed|anemi|hypovol|perfusion|shock|volume|dehydrat|fluid|chloride|electrolyte|acid.base/i,
 /infect|bacter|sepsis|abscess|inflamm|immune/i,
 /malabsorp|nutri|vitamin|weight loss|malnutri/i,
 /potassium|hyperkal|arrhythm|cardiac rhythm/i,
 /bone|fracture|calcium|phosph|calcitriol|osteop/i,
 /obstruct|obstip|retention|block.*flow/i,
 /cancer|carcinoma|tumor|malignan|metasta/i,
];
const distinctive = /esophag|gastr|duoden|pylori|ileum|coloni|colorect|rectal|bowel|bile|bilirubin|pancrea|amylase|lipase|hepat|portal|varic|diarrh|vomit|stool|melena|hematemes|steator|glomer|nephr|renal|kidney|ureter|urethr|bladder|urinar|cystit|pyel|\bGFR\b|creatinin|potassium|aldosterone|antidiuretic|erythropoiet|dialys|osteob|osteoc|fractur|callus|compartment|fasciotom|fascial|tendon|ligament|muscle|rhabdomyo|myoglobin|urate|uric|gout|tophi|articul|synov|joint|cartilage|rheumat|fibromyalg/i;
const testAnchor=/manometr|endoscop|colonosco|biopsy|urea breath|stool antigen|HAV IgM|HCV RNA|HBsAg|HDV|anti.HCV|urine cultur|urinalysis|joint.fluid|crystal|DXA|bone density|compartment.pressure|myoglobin|MRI|radiograph|ultrasound.*(kidney|urinar|gall|biliar)|electromyog/i;
const managementAnchor=/fasciotom|reduction|pylori|lactulose|rifaximin|gluten|myotom|botulinum|LES|bisphosph|DMARD|urate.lower|uric.acid.lower|dialysis|renal replacement|insulin.*potassium|pancreatic.enzyme|colectom|cholecyst|parathyroid|fracture|immobiliz|tetanus|weight.bearing|reflux|acid suppress|NSAIDs.*avoid|avoid NSAIDs/i;
const structural=/Barrett|esophag.*stricture|fistula|stricture|perforat|tophi|ankylos|joint.*deform|erosion|fracture|bone.*deform|kyphos|nerve.*compress|avascular|gallstone|renal.*scar|kidney.*scar|ureter.*obstruct|adhesion|instability|dislocation|subluxation|joint.*degenerat|loss.*alignment|esophag.*dilat/i;
const poolCache=new Map<string,string[]>();
export function safeDistractors(f:NursingFact): string[] {
  const cached=poolCache.get(f.id);if(cached)return [...cached];
  const target=tokens(f.answer), targetContext=`${f.concept} ${f.answer}`;
  const eligible=nursingFacts.filter(other=>other.subsectionId===f.subsectionId&&other.topic!==f.topic&&other.conceptId!==f.conceptId).filter(other=>{
    const s=other.answer;
    if(!distinctive.test(s))return false;
    if(f.subsectionId==="tests"&&!testAnchor.test(s))return false;
    if(f.subsectionId==="management"&&!managementAnchor.test(s))return false;
    if(f.subsectionId==="complications"&&!structural.test(s))return false;
    // Fragility/pathologic fractures can follow malignancy, kidney or liver
    // disease; they are unsafe generic wrong answers across organ systems.
    if(f.subsectionId==="complications"&&/fractur|osteop|bone|calcium|mineral/i.test(s))return false;
    if(families.some(re=>re.test(targetContext)&&re.test(s)))return false;
    return overlap(target,tokens(s)) <= 1;
  });
  const unique=[...new Set(eligible.map(other=>other.answer))];poolCache.set(f.id,unique);return [...unique];
}
export function buildChoices(f:NursingFact, level:number, count:number): {stem:string;answer:string;distractors:string[]} {
  const variant=level>=5&&f.expert?{...f,...f.expert}:f;
  const answer=variant.answer;
  const override=questionOverrides[f.id];
  const generated=/^A clinician is reviewing/.test(f.cue);
  const diagnosis=isIdentification(f);
  let stem=`${variant.cue} ${variant.task}`.replace(/^A clinical case is described as follows:\s*/i,"").replace(/\s+/g," ").trim();
  if(generated){
    const lead:Record<string,string>={risk:`Which is a recognized cause or risk factor for ${f.concept}?`,mechanism:`What is the main mechanism behind ${f.concept}?`,signs:`Which finding pattern is characteristic of ${f.concept}?`,complications:`Which complication is directly associated with ${f.concept}?`,tests:`Which assessment specifically evaluates ${f.concept}?`,management:`Which treatment approach targets ${f.concept}?`};
    stem=lead[f.subsectionId]||stem;
    const physiologyRisk:Record<string,string>={PATH_REN_ADH:"Which pair of direct homeostatic signals stimulates ADH release?",PATH_REN_Renin:"Which physiological changes trigger renin release?",PATH_REN_nephron:"Which conditions can interfere with normal nephron function?",PATH_MSK_stages:"What starts the fracture-healing process?",PATH_MSK_osteoblast:"Which process supports normal bone remodeling?",PATH_MSK_PTH:"What regulates parathyroid hormone release?"};
    if(f.subsectionId==="risk"&&physiologyRisk[f.conceptId])stem=physiologyRisk[f.conceptId];
  }
  if(override && answer===f.answer)stem=override.stem;
  let choices:string[];
  if(override && answer===f.answer) choices=builderShuffle(override.distractors);
  else if(generated) choices=builderShuffle(safeDistractors(f));
  else if(diagnosis) {
    // Diagnosis alternatives have the same response type but come from clearly
    // different systems. Never use an underlying cause as a competing diagnosis.
    choices=builderShuffle(nursingFacts.filter(o=>o.topic!==f.topic && isIdentification(o)).map(o=>o.answer));
  } else choices=builderShuffle([...(variant.close||[]),...f.foils]); // individually authored core/specialized items
  choices=[...new Set(choices)].filter(s=>clean(s)!==clean(answer));
  // Spread Easy alternatives across systems and avoid overlapping alternatives.
  const selected:string[]=[];
  for(const candidate of choices){
    const category=(s:string)=>clean(s).replace(/\b(compensated|uncompensated|acute|chronic|severe|mild|primary|secondary)\b/g,"").replace(/\s+/g," ").trim();
    if(level===0 && selected.some(s=>category(s)===category(candidate)))continue;
    if(level===0 && generated && !override && selected.some(s=>overlap(tokens(s),tokens(candidate))>2))continue;
    selected.push(candidate);if(selected.length===count-1)break;
  }
  if(selected.length<2)throw new Error(`No distinct reviewed alternatives for ${f.id}: ${selected.length}/2`);
  return {stem,answer,distractors:selected};
}


