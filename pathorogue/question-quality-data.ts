import { nursingFacts } from "./nursing-content";

export type ReviewedQuestion = { stem: string; distractors: string[] };
const byId = new Map(nursingFacts.map(f => [f.id, f]));
const answer = (id: string): string => {
  const fact = byId.get(id);
  if (!fact) throw new Error(`Reviewed question references a missing fact: ${id}`);
  return fact.answer;
};

// These choices were reviewed as contrasts to the question's stated criterion.
// A statement may be true for another condition; that never makes it a valid
// distractor unless it fails the specific causal/anatomic/test criterion here.
// The original curated answer is retained for progress and rationale matching.
// GI bleeding cross-check: NIDDK Symptoms & Causes of GI Bleeding:
// https://www.niddk.nih.gov/health-information/digestive-diseases/gastrointestinal-bleeding/symptoms-causes
// Renal syndrome cross-checks: NIDDK Nephrotic Syndrome in Adults and NKF AKI:
// https://www.niddk.nih.gov/health-information/kidney-disease/nephrotic-syndrome-adults
// https://www.kidney.org/kidney-topics/acute-kidney-injury-aki
// IBD cross-checks: NIDDK Crohn's Disease and Ulcerative Colitis:
// https://www.niddk.nih.gov/health-information/digestive-diseases/crohns-disease/definition-facts
// https://www.niddk.nih.gov/health-information/digestive-diseases/ulcerative-colitis/definition-facts
// Malabsorption and persistent HBV consequences:
// https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/treatment
// https://www.cdc.gov/hepatitis-b/hcp/clinical-overview/
// Direct ADH homeostatic signals and cause-directed PTHrP management:
// https://www.ncbi.nlm.nih.gov/books/NBK526069/
// https://www.endocrine.org/clinical-practice-guidelines/hypercalcemia
const rows: [string, string, string[]][] = [];
function add(id: string, stem: string, ids: string[]) { rows.push([id, stem, ids]); }

const structuralMechanisms = ["PATH_MSK_gout__mechanism", "PATH_MSK_osteoporosis__mechanism", "PATH_MSK_sprain__mechanism", "PATH_REN_stress__mechanism", "PATH_GI_achalasia__mechanism"];
const distinctSigns = ["PATH_MSK_gout__signs", "PATH_MSK_compartment__signs", "PATH_REN_stress__signs", "PATH_MSK_osteoporosis__signs", "REN_BPH__signs"];
const distinctTests = ["PATH_MSK_gout__tests", "PATH_MSK_osteoporosis__tests", "PATH_GI_achalasia__tests", "GI_hepatitisA__tests", "GI_celiac__tests"];
const distinctManagement = ["GI_celiac__management", "PATH_GI_achalasia__management", "PATH_MSK_gout__management", "PATH_MSK_compartment__management", "PATH_REN_stress__management"];
const nonBleedingComplications = ["PATH_MSK_gout__complications", "PATH_MSK_osteoporosis__complications", "PATH_MSK_sprain__complications", "PATH_REN_stress__complications", "PATH_GI_gerd__complications"];

add("GI_gi_bleed", "A patient vomits blood and passes black, tarry stool. Which condition do these findings directly indicate?", ["PATH_MSK_compartment", "PATH_REN_nephrotic", "PATH_MSK_gout", "PATH_REN_cystitis", "PATH_MSK_sprain"]);
add("GI_gi_bleed__risk", "Which option lists lesions in the digestive tract that can directly bleed into the gut?", ["PATH_MSK_gout__risk", "PATH_MSK_sprain__risk", "PATH_REN_stress__risk", "REN_urge__risk", "PATH_MSK_fibro__risk"]);
add("GI_gi_bleed__mechanism", "An upper GI bleed produces black, tarry stool. Which process explains this change in stool appearance?", structuralMechanisms);
add("GI_gi_bleed__signs", "Which finding specifically suggests blood in the digestive tract?", distinctSigns);
// Do not use dehydration, electrolyte loss, anemia from another source, or any
// other bleeding syndrome as a supposedly false alternative in this question.
add("GI_gi_bleed__complications", "A patient is losing a large amount of blood through a GI bleed. Which complication results directly from losing circulating blood volume and red cells?", nonBleedingComplications);
add("GI_gi_bleed__tests", "For suspected ongoing GI blood loss, which assessment checks its effect on circulation and red-cell levels while investigating the bleeding source?", distinctTests);
add("GI_gi_bleed__management", "A patient has ongoing GI bleeding and unstable circulation. Which plan directly addresses the blood loss and its source?", distinctManagement);

add("PATH_GI_vomit__mechanism", "Repeated vomiting removes gastric acid. Which mechanism explains the resulting primary metabolic alkalosis?", structuralMechanisms);
add("PATH_GI_diarrhea__mechanism", "A patient loses bicarbonate-rich fluid in repeated watery stools. Which mechanism explains the resulting primary acid-base disturbance?", structuralMechanisms);
add("PATH_GI_vomit__complications", "A patient repeatedly loses gastric fluid and chloride through vomiting. Which complication follows directly from those losses?", nonBleedingComplications);
add("PATH_GI_diarrhea__complications", "A patient has prolonged high-volume watery diarrhea. Which group of problems follows directly from losing intestinal fluid and electrolytes?", nonBleedingComplications);

add("PATH_GI_Crohn__mechanism", "Which pattern describes the location and full-thickness inflammation characteristic of Crohn disease?", ["PATH_GI_UC__mechanism", "PATH_GI_achalasia__mechanism", "PATH_MSK_gout__mechanism", "PATH_REN_stress__mechanism", "PATH_REN_nephrotic__mechanism"]);
add("PATH_GI_UC__mechanism", "Which pattern describes the continuous colonic mucosal inflammation characteristic of ulcerative colitis?", ["PATH_GI_Crohn__mechanism", "PATH_GI_achalasia__mechanism", "PATH_MSK_gout__mechanism", "PATH_REN_stress__mechanism", "PATH_REN_nephrotic__mechanism"]);
add("PATH_GI_Crohn__complications", "Crohn disease can inflame the full thickness of the bowel wall. Which complication group is specifically linked to that penetrating and narrowing bowel-wall injury?", ["PATH_MSK_gout__complications", "PATH_MSK_osteoporosis__complications", "PATH_MSK_sprain__complications", "PATH_REN_stress__complications", "PATH_GI_gerd__complications"]);
add("PATH_GI_UC__complications", "A patient has longstanding ulcerative colitis. Which complication group specifically includes dangerous colonic dilation and increased colorectal cancer risk?", nonBleedingComplications);
add("GI_celiac__mechanism", "In celiac disease, how does injury to small-intestinal villi cause nutrient malabsorption?", structuralMechanisms);
add("GI_celiac__tests", "Which evaluation specifically tests for celiac-related antibodies and small-intestinal mucosal injury?", ["PATH_MSK_gout__tests", "PATH_MSK_osteoporosis__tests", "PATH_GI_achalasia__tests", "GI_hepatitisA__tests", "PATH_REN_nephrotic__tests"]);
add("GI_celiac__management", "Which dietary treatment removes the trigger for ongoing small-intestinal injury in celiac disease?", ["PATH_GI_achalasia__management", "PATH_MSK_gout__management", "PATH_MSK_compartment__management", "PATH_REN_stress__management", "REN_BPH__management"]);
add("GI_celiac__complications", "Untreated celiac disease reduces nutrient absorption in the small intestine. Which complication group follows directly from inadequate nutrient absorption?", ["PATH_MSK_gout__complications", "PATH_MSK_sprain__complications", "PATH_GI_gerd__complications", "PATH_MSK_compartment__complications", "PATH_REN_cystitis__complications"]);
add("GI_hepatitisB__complications", "Which long-term liver complications are associated with persistent hepatitis B infection?", nonBleedingComplications);

add("PATH_REN_nephrotic__mechanism", "In nephrotic syndrome, what directly explains heavy urinary protein loss and falling plasma albumin?", structuralMechanisms);
add("PATH_REN_nephrotic__signs", "Which finding group is characteristic of heavy glomerular protein loss with nephrotic syndrome?", ["PATH_MSK_gout__signs", "PATH_MSK_compartment__signs", "PATH_REN_stress__signs", "PATH_MSK_osteoporosis__signs", "PATH_GI_achalasia__signs"]);
add("PATH_REN_nephrotic__tests", "Which laboratory pattern directly demonstrates nephrotic protein loss from blood into urine?", distinctTests);
add("PATH_REN_glomer__mechanism", "How does inflammation of the glomerular filter reduce filtration while allowing blood and protein into urine?", structuralMechanisms);
add("PATH_REN_glomer__tests", "A patient is being evaluated for inflammatory injury of the glomeruli. Which investigation specifically looks for RBC casts and assesses renal function?", distinctTests);
add("PATH_REN_AKI__mechanism", "A patient's kidney function deteriorates over hours to days. Which mechanism describes the resulting acute loss of kidney excretory function?", structuralMechanisms);
add("PATH_REN_CKD__mechanism", "Which mechanism describes the loss of filtration and endocrine functions as functioning nephrons are progressively lost in chronic kidney disease?", structuralMechanisms);
add("PATH_REN_CKD__tests", "Which time-based finding supports chronic kidney disease rather than a new, brief decline in kidney function?", distinctTests);
add("PATH_REN_AKI__AKI_prerenal", "A volume-depleted patient has a fall in kidney filtration before structural kidney damage occurs. Which mechanism defines this prerenal problem?", ["PATH_REN_AKI__AKI_intrinsic", "PATH_REN_AKI__AKI_postrenal", "PATH_GI_achalasia__mechanism", "PATH_MSK_gout__mechanism", "PATH_REN_stress__mechanism"]);
add("PATH_REN_AKI__AKI_intrinsic", "A nephrotoxin directly damages renal tubular cells. Which mechanism places this acute kidney injury in the intrinsic category?", ["PATH_REN_AKI__AKI_prerenal", "PATH_REN_AKI__AKI_postrenal", "PATH_GI_achalasia__mechanism", "PATH_MSK_gout__mechanism", "PATH_REN_stress__mechanism"]);
add("PATH_REN_AKI__AKI_postrenal", "A urinary blockage reduces filtration by increasing pressure upstream of the obstruction. Which mechanism defines this postrenal acute kidney injury?", ["PATH_REN_AKI__AKI_prerenal", "PATH_REN_AKI__AKI_intrinsic", "PATH_GI_achalasia__mechanism", "PATH_MSK_gout__mechanism", "PATH_REN_stress__mechanism"]);
add("PATH_REN_CKD__CKD_anemia", "In CKD, which mechanism directly reduces the bone marrow's production of red blood cells?", ["PATH_REN_CKD__CKD_bone", "PATH_GI_achalasia__mechanism", "PATH_MSK_gout__mechanism", "PATH_REN_stress__mechanism", "PATH_MSK_osteoporosis__mechanism"]);
add("PATH_REN_ADH__risk", "Which normal homeostatic signals directly stimulate ADH release to conserve body water?", ["PATH_MSK_PTH__risk", "PATH_MSK_gout__risk", "PATH_MSK_osteoblast__risk", "PATH_GI_achalasia__risk", "REN_urge__risk"]);
add("PATH_MSK_PTH__management", "Calcium dysregulation is traced to a PTH-related endocrine disorder or a PTHrP-producing malignancy. Which plan targets the identified cause?", ["PATH_GI_achalasia__management", "PATH_MSK_gout__management", "PATH_REN_stress__management", "REN_BPH__management", "PATH_REN_cystitis__management"]);

export const questionOverrides: Record<string, ReviewedQuestion> = Object.fromEntries(rows.map(([id, stem, ids]) => {
  const correct = answer(id);
  const distractors = ids.map(answer);
  if (new Set(distractors).size !== 5 || distractors.includes(correct)) throw new Error(`Invalid reviewed choices: ${id}`);
  return [id, { stem, distractors }];
}));
