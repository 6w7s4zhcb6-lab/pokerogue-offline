import { clinicalExplanation } from "./question-builder";
import { nursingFacts, type NursingFact } from "./nursing-content";

export type OptionRationale = { option: string; correct: boolean; explanation: string; source: string; coverage: "bank" | "authored" | "unmapped" };
const normalize = (value: string) => value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const concepts = new Map<string, NursingFact[]>();
const options = new Map<string, NursingFact[]>();
for (const fact of nursingFacts) {
  const members = concepts.get(fact.conceptId) || [];
  members.push(fact); concepts.set(fact.conceptId, members);
  for (const label of [fact.answer, fact.concept]) {
    const key = normalize(label), matches = options.get(key) || [];
    matches.push(fact); options.set(key, matches);
  }
}
function mechanism(fact: NursingFact): string {
  const members = concepts.get(fact.conceptId) || [fact];
  return members.find(item => item.subsectionId === "mechanism")?.answer
    || members.find(item => item.subsectionId === "recognition")?.why || fact.why;
}
function clinicalReason(fact: NursingFact, supplied = fact.why): string {
  const pathophysiology = mechanism(fact);
  // Expanded subsection why fields sometimes merely repeat their answer.
  // Include the separately curated mechanism so feedback explains the link.
  return supplied.startsWith(`${fact.concept} —`) && !supplied.includes(pathophysiology)
    ? `Pathophysiology: ${pathophysiology} ${supplied}` : supplied;
}
function correspondingFact(option: string, fact: NursingFact): NursingFact | undefined {
  const matches = (options.get(normalize(option)) || []).filter(item => item.id !== fact.id);
  return matches.find(item => item.conceptId !== fact.conceptId && item.subsectionId === fact.subsectionId)
    || matches.find(item => item.subsectionId === "mechanism") || matches[0];
}
export function explainOptions(fact: NursingFact, renderedOptions: readonly string[], answers: readonly string[], rationale: string): OptionRationale[] {
  return renderedOptions.map(option => {
    const correct = answers.includes(option);
    const authored=clinicalExplanation(fact,option);
    if(authored)return {option,correct,explanation:authored,source:fact.source,coverage:"authored"};
    const specific = (correct ? SATA_POSITIVE[fact.id]?.[option] : null) || SPECIFIC[option];
    if (specific) return { option, correct, explanation: `${specific} ${correct ? "" : `For this scenario: ${clinicalReason(fact, rationale)}`}`.trim(), source: fact.source, coverage: "authored" };
    if (correct) return { option, correct, explanation: clinicalReason(fact, rationale), source: fact.source, coverage: "bank" };
    const other = correspondingFact(option, fact);
    if (other) return {
      option, correct,
      explanation: `For ${other.concept} (${other.subsectionName}), the comparison pattern is: ${clinicalReason(other)} This question concerns ${fact.concept}: ${clinicalReason(fact, rationale)}`,
      source: `${fact.source}; comparison: ${other.source}`, coverage: "bank",
    };
    // The build's coverage test rejects this branch before publishing. Keeping
    // it readable also makes a newly added fact fail gracefully during editing.
    return { option, correct, explanation: `The documented scenario is ${fact.cue} The supported interpretation is: ${clinicalReason(fact, rationale)} This alternative would require evidence beyond that documented pattern.`, source: fact.source, coverage: "unmapped" };
  });
}
export function explainRationaleOptions(fact: NursingFact, choices: readonly string[], correctRationale: string): OptionRationale[] {
  return choices.map(option => {
    if (option === correctRationale) return { option, correct: true, explanation: clinicalReason(fact, correctRationale), source: fact.source, coverage: "bank" };
    const other = nursingFacts.find(candidate => candidate.why === option);
    return {
      option, correct: false,
      explanation: other ? `This explanation concerns ${other.concept}: ${mechanism(other)} The question instead concerns ${fact.concept}: ${mechanism(fact)}`
        : `The supported mechanism in this scenario is ${clinicalReason(fact, correctRationale)}`,
      source: other ? `${other.source}; scenario: ${fact.source}` : fact.source, coverage: other ? "bank" : "unmapped",
    };
  });
}

// Authored option-level clarifications. The source bank remains unchanged.
// Clinical cross-checks: NIDDK (kidney physiology/cirrhosis), AAOS (compartment
// syndrome), NIAMS (inflammatory vs degenerative arthritis), CDC (HBV/HDV).
// https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work
// https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis/definition-facts
// https://www.orthoinfo.org/bodypart/kneelower-leg/compartment-syndrome/
// https://www.niams.nih.gov/health-topics/rheumatoid-arthritis
// https://www.cdc.gov/hepatitis-d/about/index.html
// https://www.niddk.nih.gov/health-information/kidney-disease/anemia
// https://www.niddk.nih.gov/health-information/kidney-disease/mineral-bone-disorder
// https://openstax.org/books/anatomy-and-physiology-2e/pages/26-4-acid-base-balance
const SATA_POSITIVE: Record<string, Record<string, string>> = {
  PATH_GI_vomit: {
    "Loss of gastric hydrochloric acid": "Vomiting removes hydrogen and chloride in gastric fluid, initiating the acid loss in this scenario.",
    "Primary rise in serum bicarbonate relative to acid": "Removing gastric hydrogen ions increases bicarbonate relative to acid, producing the metabolic alkalosis pattern.",
    "Metabolic alkalosis": "The primary disturbance is metabolic because acid is lost through gastric fluid rather than carbon dioxide through ventilation.",
  },
  PATH_GI_Crohn: {
    "Transmural bowel wall inflammation": "Full-thickness inflammation explains why Crohn disease can produce fistulas, strictures and deeper-wall complications.",
    "Discontinuous skip lesions": "Affected bowel can alternate with relatively unaffected segments, unlike the continuous pattern typical of ulcerative colitis.",
    "Inflammation that can involve different regions of the gastrointestinal tract": "Crohn disease is not restricted to rectum and colon; its distribution can involve other GI regions.",
  },
  PATH_REN_pyeloneph: {
    "Fever": "Fever supplies systemic infection evidence; together with the renal-region findings it supports upper-tract involvement.",
    "Flank pain": "Pain over the kidney/flank region adds an upper-tract finding beyond isolated bladder dysuria or urgency.",
    "Costovertebral angle tenderness": "Tenderness in the costovertebral angle localizes concern to the renal region and supports pyelonephritis in this combined pattern.",
  },
  PATH_REN_nephrotic: {
    "Marked proteinuria": "Damage to the glomerular filtration barrier allows excessive protein to enter urine; this is the defining nephrotic loss.",
    "Hypoalbuminemia": "Large urinary albumin losses can reduce circulating albumin when production cannot replace the loss.",
    "Edema": "Reduced circulating albumin lowers vascular oncotic pressure, and renal sodium retention can further promote fluid accumulation.",
  },
  PATH_MSK_compartment: {
    "Severe pain out of proportion to the injury": "Escalating pressure reduces tissue perfusion, making disproportionate pain a concerning early finding.",
    "Pain with passive stretch": "Passive stretch tensions muscle inside the high-pressure compartment and can increase ischemic pain.",
    "New paresthesias": "Pressure and impaired perfusion can compromise nerves, producing new tingling or sensory change even while pulses remain palpable.",
  },
  PATH_MSK_rhabdo: {
    "Markedly increased creatine kinase": "Skeletal-muscle cell injury releases intracellular creatine kinase, so a marked increase supports muscle breakdown.",
    "Dark urine from myoglobin": "Damaged muscle releases myoglobin, which can enter the urine and darken it; this is different from a ligament-only injury.",
    "Risk of acute kidney injury": "Released myoglobin and associated physiological stresses can injure renal tubules and reduce kidney function.",
  },
};
const SPECIFIC: Record<string, string> = {
  "Respiratory acidosis": "Respiratory acidosis begins with retained carbon dioxide from inadequate ventilation, distinguished from a primary metabolic change due to gastrointestinal fluid loss.",
  "Respiratory alkalosis": "Respiratory alkalosis begins with excess carbon dioxide loss through increased ventilation, distinguished from primary gastrointestinal acid or bicarbonate loss.",
  "Lactic acidosis": "Lactic acidosis involves lactate accumulation; isolated gastric acid loss does not establish that process.",
  "Compensated respiratory acidosis": "Compensated respiratory acidosis requires primary carbon dioxide retention with renal compensation, not gastric acid loss alone.",
  "Primary loss of bicarbonate in stool": "Stool bicarbonate loss is a diarrheal acidosis mechanism; the stem instead describes loss of gastric acid.",
  "Metabolic acidosis as the expected direct effect": "Direct loss of gastric acid increases bicarbonate relative to acid, favoring alkalosis rather than acidosis.",
  "Primary respiratory alkalosis from increased ventilation": "Hyperventilation causes a respiratory carbon dioxide change; it is not the direct effect of losing gastric hydrochloric acid.",
  "Isolated hypoxemia": "Hypoxemia means low blood oxygen, not the bicarbonate loss causing the primary disturbance here.",
  "Isolated respiratory compensation": "Respiratory compensation responds to a metabolic disturbance; it does not name the primary stool-bicarbonate loss.",
  "Excessive relaxation of the upper esophageal sphincter": "Achalasia impairs opening of the lower esophageal sphincter, not excessive upper-sphincter relaxation.",
  "Transient gastric outlet spasm": "Gastric outlet spasm affects stomach emptying; it does not explain esophageal retention and failed lower-sphincter relaxation.",
  "Loss of pyloric tone": "The pylorus controls passage from stomach to duodenum, not the lower esophageal outflow defect.",
  "Increased duodenal peristalsis": "Duodenal motility is downstream of the stomach; achalasia is an esophageal motility and sphincter disorder.",
  "Overproduction of stomach acid": "Acid overproduction does not explain the impaired esophageal peristalsis and lower-sphincter relaxation defining achalasia.",
  "Inguinal hernia": "Inguinal herniation occurs through the groin, not the diaphragm.",
  "Umbilical hernia": "Umbilical herniation passes through the abdominal wall near the umbilicus, not the esophageal hiatus.",
  "Rectal prolapse": "Rectal prolapse involves displaced rectal tissue through the anus, not stomach through the diaphragm.",
  "Duodenal ulcer": "A duodenal ulcer is a mucosal defect; it does not describe anatomical herniation of the stomach.",
  "Lie flat immediately after eating": "Lying flat after a meal removes gravity-assisted clearance and can promote reflux.",
  "Eat a large meal shortly before bedtime": "A large bedtime meal leaves more gastric contents near recumbency, increasing the opportunity for nocturnal reflux.",
  "Increase tight abdominal clothing": "Tight clothing can raise abdominal pressure and promote reflux rather than reduce it.",
  "Drink peppermint immediately before bed": "Peppermint can worsen reflux in susceptible people; it is not the reflux-reducing measure requested here.",
  "Sleep prone after eating": "Prone sleep immediately after eating does not provide the meal-to-bed interval and head elevation sought here.",
  "Pain is invariably worse immediately after any food": "Invariably is too absolute: classic duodenal-ulcer pain may improve with food and return later.",
  "Pain occurs only with urination": "Pain only with urination suggests urinary irritation, not the characteristic meal-related epigastric ulcer pattern.",
  "Pain is relieved by coughing": "Cough relief is not the characteristic acid/meal-related behavior of duodenal-ulcer pain.",
  "Pain is isolated to the right shoulder": "Isolated shoulder pain does not match the typical epigastric and meal-related pattern.",
  "Pain always starts with bloody diarrhea": "Bloody diarrhea suggests a lower-intestinal inflammatory or bleeding pattern, not the defining duodenal-ulcer symptom pattern.",
  "Inflammation limited to the mucosa": "Crohn disease can extend through all bowel-wall layers; a mucosal-only description misses its transmural nature.",
  "Inflammation limited to the submucosa": "Submucosal-only inflammation excludes the full-thickness involvement that can occur in Crohn disease.",
  "Inflammation confined to the serosa": "Serosal-only disease excludes the mucosal and deeper-wall involvement of transmural inflammation.",
  "Inflammation isolated to blood vessels": "Isolated vascular inflammation is not the characteristic patchy, full-thickness bowel disease.",
  "Inflammation only in the rectal lining": "Rectal-lining-only inflammation excludes both the broader distribution and deeper-wall disease possible in Crohn disease.",
  "Inflammation necessarily limited to the rectum and colon": "Crohn disease can affect regions beyond the rectum and colon, unlike this claimed restriction.",
  "Continuous mucosal inflammation beginning in the rectum": "Continuous rectal-to-proximal mucosal disease is the characteristic ulcerative-colitis contrast to Crohn skip lesions.",
  "No involvement of deeper bowel wall layers": "Crohn disease is transmural; denying deeper-wall disease removes the mechanism behind fistulas and strictures.",
  "Transmural skip lesions": "Transmural skip lesions are characteristic of Crohn disease, rather than continuous ulcerative-colitis mucosal inflammation.",
  "Isolated small-bowel granulomas": "Isolated small-bowel granulomatous disease does not match continuous colonic inflammation beginning in the rectum.",
  "Patchy jejunal inflammation": "Patchy jejunal disease is outside the characteristic rectum-to-proximal-colon distribution.",
  "Inflammation limited to the pancreas": "Pancreatic inflammation concerns pancreatitis, not the colonic mucosa.",
  "Inflammation limited to the muscularis propria": "Muscularis-only inflammation omits the mucosal involvement central to ulcerative colitis.",
  "Uncomplicated diverticulosis without inflammation": "Diverticulosis means diverticula are present; diverticulitis adds the inflammation responsible for the acute pattern.",
  "Duodenal reflux": "Duodenal reflux does not describe inflammation around a colonic diverticular outpouching.",
  "Small-intestinal volvulus": "Volvulus is twisting with obstruction, rather than inflammation of diverticula.",
  "Esophageal spasm": "Esophageal spasm is an upper-gastrointestinal motility problem, not an inflamed colonic diverticulum.",
  "Uncomplicated constipation": "Uncomplicated constipation does not account for the acute localized inflammatory signs supporting appendicitis.",
  "Chronic pancreatitis": "Chronic pancreatitis involves a different organ and time course from this acute appendiceal pattern.",
  "Increased pulmonary arterial pressure": "Pulmonary arterial pressure belongs to the lung circulation; portal hypertension affects venous drainage through the liver.",
  "Reduced systemic venous pressure": "A fall in systemic venous pressure does not explain increased resistance within the portal venous pathway.",
  "Increased coronary perfusion": "Coronary perfusion supplies heart muscle and is not the portal circulation affected by hepatic scarring.",
  "Improved hepatic blood flow": "Fibrotic resistance impedes rather than improves portal blood flow through the liver.",
  "Elevated intracranial pressure": "Intracranial pressure concerns the skull, not the portal venous pressure driving collateral vessels.",
  "Insulin": "Insulin regulates glucose uptake; ammonia is the nitrogenous toxin implicated here.",
  "Erythropoietin": "Erythropoietin is a kidney-produced hormone that stimulates red-cell production in bone marrow.",
  "Bicarbonate alone": "Bicarbonate buffers acid-base changes; it is not the implicated nitrogenous waste product.",
  "Surfactant": "Surfactant reduces surface tension in lung alveoli, not hepatic nitrogenous-waste accumulation.",
  "Troponin": "Troponin is a cardiac contractile/regulatory protein used as a myocardial-injury marker, not the implicated hepatic toxin.",
  "Asterixis": "Asterixis is a motor sign associated with encephalopathy, not free fluid in the peritoneal cavity.",
  "Hematemesis": "Hematemesis means vomiting blood and indicates gastrointestinal bleeding.",
  "Anasarca confined to the lungs": "Anasarca is generalized edema; lung-confined fluid is neither generalized edema nor peritoneal ascites.",
  "Melena": "Melena is black tarry stool containing digested blood, not excess fecal fat.",
  "Hematochezia": "Hematochezia means red blood passed rectally, not the fatty stool pattern of malabsorption.",
  "Tenesmus": "Tenesmus is a persistent urge to defecate, not excess stool fat.",
  "Dysphagia": "Dysphagia means difficulty swallowing, not malabsorption producing fatty stools.",
  "Loop of Henle": "The loop of Henle modifies tubular water and solute handling after initial filtration; it is not the glomerular blood filter.",
  "Collecting duct": "The collecting duct modifies final urine after plasma has passed through the glomerular filter.",
  "Distal tubule": "The distal tubule adjusts filtrate downstream; initial blood filtration occurs at glomerular capillaries.",
  "Renal pelvis": "The renal pelvis collects urine for drainage, rather than filtering plasma across a capillary barrier.",
  "Ureter": "The ureter transports urine to the bladder and has no glomerular filtration membrane.",
  "Angiotensin I": "Angiotensin I is a RAAS intermediate, not the hormone directly increasing collecting-duct water permeability.",
  "Calcitonin": "Calcitonin regulates calcium rather than mediating ADH-dependent water conservation.",
  "Glucagon": "Glucagon raises blood glucose; it is not the antidiuretic signal increasing renal water reabsorption.",
  "Angiotensin II": "Angiotensin II is downstream in the cascade activated by renin, not the initiating kidney enzyme.",
  "Aldosterone": "Aldosterone is an adrenal hormone stimulated downstream of renin, rather than the kidney enzyme initiating RAAS.",
  "ADH": "ADH promotes renal water reabsorption; renin initiates the angiotensin cascade.",
  "Cortisol": "Cortisol is an adrenal glucocorticoid, not the kidney enzyme initiating RAAS.",
  "ANP": "ANP promotes natriuresis after atrial stretch; it does not initiate the renin response to low renal perfusion.",
  "Ureteral smooth muscle": "Ureteral smooth muscle propels urine and does not form the protein-selective blood-filtration barrier.",
  "Bladder detrusor": "The detrusor empties the bladder; plasma-protein filtration is determined in the glomerulus.",
  "External sphincter": "The external sphincter controls urine release rather than protein passage across the renal filter.",
  "Distal urethra": "The distal urethra is an outflow structure, not the glomerular protein-selective membrane.",
  "Interstitial cystitis": "Interstitial cystitis is a chronic bladder pain syndrome, not a urinary calculus producing renal colic.",
  "Uncomplicated pyelonephritis": "Pyelonephritis is renal infection, rather than the stone-related obstruction causing this colic pattern.",
  "Chronic glomerulosclerosis": "Glomerulosclerosis scars filtering structures; it does not describe a calculus moving through the urinary tract.",
  "Pyelonephritis": "Pyelonephritis is renal infection; hydronephrosis specifically describes collecting-system dilation from impaired drainage.",
  "Renal cortical infarct": "A cortical infarct is ischemic tissue injury, not collecting-system dilation from backed-up urine.",
  "Overflow incontinence": "Overflow leakage arises when the bladder fails to empty adequately, unlike cough-triggered pressure leakage.",
  "Functional incontinence": "Functional incontinence reflects difficulty reaching or using a toilet, not leakage caused by increased abdominal pressure.",
  "Reflex incontinence": "Reflex incontinence concerns impaired neural control rather than the cough/sneeze pressure trigger.",
  "Total incontinence": "Total incontinence implies continuous or near-continuous loss, not episodic exertional leakage.",
  "Urge incontinence": "Urge incontinence accompanies sudden compelling urgency, unlike leakage triggered by coughing.",
  "Renal cell carcinoma": "Renal cell carcinoma is a renal malignancy; dysuria and frequency alone do not establish that diagnosis.",
  "Ureteral calculus with obstruction": "An obstructing ureteral stone produces an obstruction/colic pattern rather than isolated bladder irritation.",
  "Acute glomerulonephritis": "Glomerulonephritis injures renal filtering structures, often with urine protein/blood abnormalities, rather than a lower-tract infection pattern alone.",
  "Isolated cystitis": "Isolated cystitis is bladder infection without the upper-tract/systemic findings supporting pyelonephritis.",
  "Urethral stricture only": "A urethral stricture narrows the outflow tract; it does not itself identify infection of renal tissue.",
  "Uncomplicated asymptomatic bacteriuria": "Asymptomatic bacteriuria lacks attributable symptoms, conflicting with this symptomatic systemic presentation.",
  "Suprapubic discomfort without systemic features is diagnostic by itself": "Suprapubic discomfort alone does not establish renal infection; upper-tract and systemic evidence provide the distinction.",
  "Urinary urgency alone proves renal infection": "Urgency is a lower-tract symptom and cannot alone prove infection of renal tissue.",
  "A painless isolated stress leak with coughing": "A painless cough-related leak fits stress incontinence, not a febrile upper-tract infection.",
  "Acute bacterial pyelonephritis": "Bacterial pyelonephritis is renal infection, unlike a chronic bladder-pain syndrome without proven infection.",
  "Hydronephrosis due to stone": "Stone-related hydronephrosis involves obstructed drainage and dilation, not the stated noninfectious bladder-pain pattern.",
  "Overt bacterial cystitis": "Bacterial cystitis requires infection evidence and is not interchangeable with bladder pain after infection is excluded.",
  "Renal abscess": "A renal abscess is a focal kidney infection, not a chronic bladder-centered pain syndrome.",
  "Poststreptococcal nephritis": "Poststreptococcal nephritis is an immune glomerular disorder, not a bladder-pain syndrome.",
  "Pure prerenal azotemia": "Prerenal azotemia reflects low renal perfusion and does not explain the heavy urinary protein loss defining nephrotic syndrome.",
  "Simple urinary retention": "Retention impairs bladder emptying rather than causing a glomerular leak of large amounts of protein.",
  "Uncomplicated cystitis": "Uncomplicated cystitis is bladder infection, not the cause of the marked protein loss and hypoalbuminemia described.",
  "Acute urethritis": "Urethritis affects the urethra and does not explain a nephrotic glomerular protein leak.",
  "Renal colic alone": "Colic suggests urinary obstruction; alone it does not explain nephrotic protein loss and edema.",
  "Primary complete obstruction of ureteral outflow": "Complete ureteral obstruction is a postrenal outflow problem, whereas nephrotic protein leakage originates at the glomerulus.",
  "Isolated urinary urgency with normal protein excretion": "Normal protein excretion contradicts the heavy urinary protein loss required for nephrotic syndrome.",
  "An elevated serum albumin due to urinary protein loss": "Urinary albumin loss tends to lower serum albumin; reduced vascular oncotic pressure contributes to edema.",
  "Bladder urothelium": "Bladder urothelium lines urine-storage tissue, not the glomerular filtering structures injured here.",
  "Ureteral wall": "The ureteral wall is an outflow structure rather than a renal glomerular capillary barrier.",
  "Renal pelvis only": "The renal pelvis collects urine after filtration; pelvis-only disease does not identify glomerular injury.",
  "External urethral sphincter": "The external sphincter regulates continence rather than glomerular filtration.",
  "Prostate": "The prostate surrounds the proximal urethra and is not the glomerular filtration membrane.",
  "Isolated stress incontinence": "Stress leakage does not explain an abrupt decline in filtration with rising nitrogenous waste.",
  "Uncomplicated prostatitis": "Uncomplicated prostatitis is local inflammation and does not itself identify the abrupt filtration decline described.",
  "Isolated polyuria": "Urine volume alone cannot define AKI; polyuria can occur in some phases and does not replace creatinine/GFR evidence.",
  "Normal age-related variation": "Rapid deterioration differs from gradual age-related changes and indicates acute kidney dysfunction needs assessment.",
  "Renal cortical hypertrophy": "Cortical enlargement is an anatomical finding, not the defining abrupt loss of renal filtration.",
  "Acute uncomplicated cystitis": "Acute uncomplicated cystitis does not establish renal damage or reduced filtration persisting over months.",
  "Simple nephrolithiasis": "A urinary stone alone does not establish the persistent loss of renal function defining CKD.",
  "Transient urinary retention": "Transient retention is short-lived drainage difficulty, whereas CKD requires persistent renal abnormality.",
  "Isolated ureteritis": "Ureteritis affects an outflow tube and is not equivalent to chronic impairment of renal filtration.",
  "Functional stress incontinence": "Incontinence concerns urinary control and does not itself establish chronic renal parenchymal dysfunction.",
  "Isolated metabolic alkalosis only": "An isolated alkalosis diagnosis does not address excess extracellular potassium acting on cardiac excitability.",
  "Loss of all muscle tone only": "Potassium affects cardiac conduction as well as skeletal muscle, so a muscle-only description misses the principal safety concern.",
  "Increased bone mineralization": "Increased bone mineralization is not the immediate electrical risk produced by excess potassium.",
  "Reduced risk of arrhythmia": "Hyperkalemia can increase dangerous conduction and arrhythmia risks rather than reduce them.",
  "Isolated respiratory alkalosis": "Respiratory alkalosis is a carbon-dioxide disturbance, not potassium-related cardiac electrical instability.",
  "Immediate final remodeling": "Remodeling is a later healing phase, not the immediate first stage after fracture.",
  "Progressive bone resorption without callus": "Successful repair forms reparative tissue and callus rather than consisting only of progressive bone resorption.",
  "Necrotic stage only": "Necrosis alone does not describe the organized hematoma-to-callus-to-remodeling repair sequence.",
  "Infectious stage in every fracture": "Infection is a complication, not a necessary stage of every fracture.",
  "No tissue formation": "Normal repair requires formation of new tissue and callus, so no tissue formation contradicts healing.",
  "Osteoclast": "Osteoclasts resorb bone; osteoblasts produce new bone matrix.",
  "Mature erythrocyte": "Mature erythrocytes transport gases and do not synthesize bone matrix.",
  "Neutrophil": "Neutrophils provide inflammatory defense rather than bone-matrix production.",
  "Chondroclast alone": "Chondroclasts resorb cartilage rather than performing the osteoblast role of bone-matrix production.",
  "Fibrocyte only": "Fibrocytes maintain connective tissue but are not the bone-forming osteoblasts asked for here.",
  "Isolated uncomplicated muscle spasm": "Muscle spasm misses the contamination and deep-infection risk of a wound communicating with a fracture.",
  "Reduced tissue contamination": "Communication with the environment increases rather than reduces tissue-contamination opportunities.",
  "Increased bone density": "An open fracture does not inherently increase bone density; wound communication and infection risk are the issue.",
  "Hyperthyroidism": "Hyperthyroidism is an endocrine disorder rather than a direct local consequence of fracture-wound communication.",
  "Improved healing without intervention": "An open wound does not guarantee easier repair; contamination and tissue damage can complicate healing.",
  "Routine postinjury soreness": "Disproportionate or escalating pain with neurovascular symptoms exceeds the expected routine-soreness pattern.",
  "Benign delayed union": "Delayed union concerns healing time and does not explain acute pressure-related tissue ischemia.",
  "Simple osteoarthritis": "Osteoarthritis is chronic degenerative joint disease, not rapidly rising pressure in a closed muscle compartment.",
  "Noninflammatory fibromyalgia": "Fibromyalgia does not explain this acute injured-limb pressure and ischemia pattern.",
  "Improving pain after elevation and analgesia excludes the syndrome": "Symptom improvement alone cannot categorically exclude compartment syndrome; concerning patterns require continued assessment.",
  "Palpable distal pulses rule out the syndrome": "A large-artery pulse can remain palpable while capillary perfusion within the compartment is compromised.",
  "A normal capillary refill alone excludes the syndrome": "Normal capillary refill alone cannot exclude developing compartment pressure or replace full clinical assessment.",
  "Normal pulses exclude compartment syndrome": "A palpable pulse can persist despite impaired tissue perfusion inside a high-pressure compartment.",
  "Absent pulse is always the earliest sign": "Pulse loss is late and unreliable; disproportionate pain and passive-stretch pain can appear earlier.",
  "The diagnosis requires an infection first": "Bleeding or swelling after injury can raise compartment pressure without preceding infection.",
  "Only nerves are affected, not muscle": "Pressure-related ischemia can injure muscle as well as nerves.",
  "A warm foot rules out compartment syndrome": "Skin warmth does not establish adequate perfusion within every compartment and cannot exclude the syndrome alone.",
  "Strain": "A strain affects muscle or tendon, whereas a sprain injures a ligament.",
  "Dislocation": "Dislocation is loss of normal joint-surface alignment, distinct from a ligament sprain alone.",
  "Osteomyelitis": "Osteomyelitis is infection of bone, distinct from a ligament injury, reduced bone mass or defective mineralization.",
  "Complete dislocation": "Complete dislocation loses all joint-surface contact, whereas subluxation retains partial contact.",
  "Open fracture": "An open fracture is a bone break communicating with a wound, not partial joint dislocation.",
  "Sprain alone": "A sprain describes ligament damage and does not itself name partial loss of joint alignment.",
  "Bone infarction": "Bone infarction is ischemic bone injury rather than displacement of joint surfaces.",
  "Isolated osteoarthritis": "Osteoarthritis affects joints and does not explain extensive skeletal-muscle breakdown with myoglobin release.",
  "Simple tendon strain": "An uncomplicated tendon strain does not establish widespread muscle-cell breakdown and its renal complications.",
  "Achalasia": "Achalasia affects esophageal motility, not release of intracellular skeletal-muscle contents.",
  "Glomerular hyperfiltration": "Hyperfiltration does not describe myoglobin-related tubular injury after muscle breakdown.",
  "No release of intracellular potassium": "Damaged skeletal muscle can release intracellular potassium, creating hyperkalemia risk.",
  "Decreased creatine kinase is the defining finding": "Creatine kinase typically rises with muscle injury; a decrease is not the defining rhabdomyolysis finding.",
  "The injury affects only ligaments, not skeletal muscle": "Rhabdomyolysis affects skeletal-muscle cells, not only ligaments, and releases their intracellular contents.",
  "Acute fracture hematoma": "A fracture hematoma is an early response to a break, not chronic loss of bone mass.",
  "Septic arthritis": "Septic arthritis is infection within a joint, distinct from reduced bone mass or a widespread noninflammatory pain syndrome.",
  "Decreases serum calcium": "PTH acts to increase serum calcium; claiming a decrease reverses its principal effect.",
  "Has no effect on calcium": "PTH is a major regulator of calcium, so no effect contradicts its physiological role.",
  "Only increases blood glucose": "Blood-glucose regulation is not the principal action being tested for parathyroid hormone.",
  "Only decreases sodium": "Sodium reduction does not describe PTH's calcium-regulating role.",
  "Directly eliminates vitamin D": "PTH promotes renal activation of vitamin D rather than directly eliminating vitamin D.",
  "Involucrum": "Involucrum is new bone around infected/necrotic bone; sequestrum is the dead separated fragment.",
  "Osteoid": "Osteoid is unmineralized bone matrix, not a separated necrotic fragment.",
  "Callus": "Callus is reparative fracture-healing tissue rather than the dead fragment in osteomyelitis.",
  "Bursa": "A bursa reduces friction around a joint; it is not a fragment of dead bone.",
  "Synovial membrane": "Synovium lines the joint capsule and is not detached necrotic bone.",
  "Osteoarthritis isolated to one hip": "A mechanically affected single hip does not match a symmetric small-joint inflammatory polyarthritis.",
  "Simple acute gout of a single great toe": "An isolated acute great-toe crystal attack differs from a persistent symmetric inflammatory joint pattern.",
  "Fibromyalgia alone": "Fibromyalgia produces widespread pain and associated symptoms without the characteristic inflammatory joint findings of an inflammatory arthritis.",
  "Acute muscle strain": "An acute muscle strain is localized soft-tissue injury rather than systemic inflammatory joint disease.",
  "Acute osteomyelitis": "Osteomyelitis is bone infection, not the chronic joint/cartilage degeneration of osteoarthritis.",
  "Systemic lupus erythematosus": "Lupus is systemic autoimmune disease and is not synonymous with a mechanical degenerative joint pattern.",
  "Gouty tophus": "A tophus is associated with urate deposition in gout, not the defining cartilage degeneration of osteoarthritis.",
  "Osteoarthritis of the hand": "Hand osteoarthritis is peripheral degenerative disease, unlike the inflammatory axial/spinal pattern here.",
  "Acute gout": "Acute gout is a crystal-related attack rather than a chronic axial inflammatory pattern.",
  "Isolated shoulder dislocation": "Shoulder dislocation is traumatic malalignment and does not explain inflammatory spinal stiffness.",
  "Compartment syndrome": "Compartment syndrome causes pressure-related ischemia, whereas gout involves urate-crystal-associated joint inflammation.",
  "Active osteomyelitis": "Osteomyelitis is bone infection, not the widespread noninflammatory pain syndrome described.",
  "Acute gouty arthritis": "Acute gout is a focal inflammatory crystal attack and differs from widespread fibromyalgia pain.",
  "The scarred liver secretes excess albumin, causing fluid to move into the peritoneum despite lower portal pressure.": "Advanced hepatic synthetic dysfunction can lower albumin; excess albumin secretion reverses this mechanism.",
  "Cirrhosis suppresses renin and aldosterone, causing rapid renal sodium loss into the abdomen.": "Cirrhotic circulatory changes can activate sodium-retaining RAAS responses; suppression with rapid sodium loss reverses the proposed pathway.",
  "Hepatic scarring increases renal filtration enough to pull fluid directly through the bladder wall.": "Ascites reflects vascular/peritoneal fluid balance, not filtration pulling fluid through the bladder wall.",
  "Increased plasma oncotic pressure drives fluid out of the blood vessels into the peritoneum.": "Higher plasma oncotic pressure draws water toward vessels; lower oncotic pressure can favor fluid leaving them.",
  "Hepatic bile production directly turns into intraperitoneal fluid without any vascular pressure change.": "Ascites involves altered pressures and sodium/water balance, not bile directly becoming peritoneal fluid.",
  "Liver fibrosis lowers portal venous pressure and increases blood supply only to the hepatic artery.": "Fibrotic resistance raises portal pressure; lowering pressure reverses the mechanism recruiting collaterals.",
  "Reduced pressure in the vena cava directly collapses esophageal vessels, making them dilate.": "Portal hypertension recruits collateral veins; low caval pressure collapsing vessels does not explain their dilation.",
  "Bile duct obstruction converts arteries into distended veins without elevated portal resistance.": "Arteries do not become varicose veins; portal resistance redirects venous flow through collateral routes.",
  "Increased albumin synthesis directly expands esophageal capillaries without pressure changes.": "Albumin changes do not replace the portal-pressure mechanism driving esophageal collateral veins.",
  "Esophageal varices result only from primary infection of esophageal veins.": "Varices reflect altered venous pressures/flow and do not require primary infection of the veins.",
  "Increased hepatic synthesis of every clotting protein is the major cause of bruising.": "Reduced clotting-factor synthesis, not uniformly increased synthesis, can contribute to impaired coagulation.",
  "Direct bone mineral loss is the primary mechanism of prolonged INR in liver disease.": "Bone mineral loss does not directly explain prolonged INR; clotting-factor production and vitamin K status matter.",
  "Extra bile in the bloodstream increases vitamin K absorption and causes severe hypocoagulability.": "Bile-related fat malabsorption can impair vitamin K absorption; increased absorption reverses that proposed mechanism.",
  "Cirrhosis uniformly destroys red cells but leaves platelets and coagulation factors entirely normal.": "Cirrhosis can involve thrombocytopenia and impaired coagulation-factor production; normal platelets/factors cannot be assumed.",
  "Bleeding is caused solely by increased fibrinogen synthesis.": "Bleeding tendency is not explained solely by increased fibrinogen production; hepatic and platelet-related factors may contribute.",
  "Improved liver ammonia disposal raises blood ammonia and produces confusion.": "Effective ammonia disposal would reduce accumulation; impaired clearance and shunting support rising toxins.",
  "Portal blood is completely filtered by normal hepatocytes before entering systemic veins.": "Portosystemic shunting bypasses normal hepatic processing, contradicting complete filtration by healthy hepatocytes.",
  "Excess insulin secretion from the gallbladder directly causes asterixis in every patient.": "The gallbladder does not secrete insulin; impaired hepatic toxin clearance is the mechanism under review.",
  "All altered mental status in cirrhosis is caused exclusively by primary brain infection.": "Altered mental status in cirrhosis has multiple possible causes and does not require primary brain infection.",
  "Lower nitrogenous waste production is itself responsible for worsening encephalopathy.": "Less nitrogenous-waste production alone does not explain toxin accumulation; reduced clearance and shunting are relevant.",
  "A urethral stone blocks urine drainage downstream from the kidneys.": "A urinary drainage blockage is postrenal; prerenal dysfunction begins with inadequate renal blood delivery.",
  "Immune complexes injure the glomerular filtration membrane directly.": "Immune glomerular damage is intrinsic renal injury rather than an initial perfusion deficit.",
  "Renal tubular cells are destroyed first by an intrinsic nephrotoxin.": "Nephrotoxic tubular destruction is intrinsic renal injury, not uncomplicated prerenal hypoperfusion.",
  "A bladder malignancy mechanically obstructs both ureters.": "Mechanical ureteral obstruction is postrenal, not the perfusion-based mechanism asked for.",
  "Creatinine is produced faster because of muscle hypertrophy without any change in filtration.": "Muscle-related creatinine production differs from a perfusion-related reduction in filtration.",
  "Temporary volume depletion with fully preserved renal structures is always intrinsic AKI.": "Volume depletion with preserved renal structures is initially prerenal; intrinsic AKI involves renal tissue injury.",
  "A distended urinary bladder without tissue injury is the definition of intrinsic AKI.": "A distended bladder can signal postrenal outflow obstruction, not intrinsic parenchymal injury by definition.",
  "A ureteral obstruction is intrinsic simply because it is near the kidneys.": "Ureteral obstruction remains postrenal regardless of its proximity to the kidneys.",
  "Excess oral water intake is the only cause of intrinsic AKI.": "Intrinsic AKI can reflect ischemic, toxic or inflammatory tissue injury; excess water alone does not define it.",
  "All intrinsic AKI preserves filtration and lowers serum creatinine.": "Intrinsic injury can reduce filtration and raise creatinine, so low creatinine/preserved filtration cannot define every case.",
  "Intravascular volume loss lowers renal blood flow with unobstructed urine.": "Low renal blood flow with patent drainage is a prerenal mechanism, not obstruction.",
  "A circulating toxin directly destroys proximal tubules with unobstructed urine.": "Direct toxin injury of tubules is intrinsic AKI rather than obstructed outflow.",
  "Inflammation of glomeruli causes hematuria without obstructing outflow.": "Glomerular inflammation is intrinsic renal injury when urinary outflow is not obstructed.",
  "Normal ureter flow increases GFR by raising renal pelvic pressure.": "Obstruction-related collecting-system pressure can oppose filtration; normal flow does not improve GFR by raising pelvic pressure.",
  "An isolated unilateral ureteral blockage always causes complete kidney failure when the other kidney is healthy.": "A functioning unobstructed contralateral kidney can maintain filtration; unilateral blockage does not always cause complete failure.",
  "Advanced kidney failure causes excessive calcitriol production and complete PTH suppression.": "Reduced vitamin D activation and secondary PTH responses matter in CKD; excess calcitriol with complete PTH suppression reverses that pattern.",
  "Phosphate is invariably low because renal excretion markedly increases in advanced CKD.": "Reduced phosphate excretion can cause retention, not invariable high excretion and low phosphate.",
  "Renal failure raises albumin production and prevents all skeletal effects.": "Albumin synthesis does not eliminate CKD-related phosphate, vitamin D and PTH disturbances affecting bone.",
  "CKD directly converts osteoblasts into intestinal villi without modifying calcium metabolism.": "Osteoblasts do not become intestinal villi; disturbed mineral handling and hormones connect CKD to skeletal changes.",
  "Bone changes in CKD occur only after traumatic fracture.": "CKD mineral/bone abnormalities can begin before a fracture and do not require trauma.",
  "Increased renal erythropoietin production suppresses marrow activity.": "Erythropoietin stimulates erythropoiesis; inadequate renal production is a major CKD-anemia mechanism.",
  "Loss of bile from kidneys destroys circulating red blood cells as the primary mechanism.": "Kidneys do not lose bile as the primary cause of CKD anemia; insufficient erythropoietin signaling is relevant.",
  "Increased vitamin D activation causes excess red-cell destruction.": "Increased vitamin D activation is not the primary erythropoietin-deficiency mechanism of CKD anemia.",
  "Renal failure causes bone marrow to produce more red cells without any erythropoietin.": "Marrow erythropoiesis depends on erythropoietin; renal failure does not guarantee more red-cell output without it.",
  "A normal serum creatinine is required for CKD-related erythropoietin deficiency.": "Normal creatinine is not required for CKD-related erythropoietin deficiency; renal dysfunction and anemia can coexist.",
  "Symmetric MCP swelling and prolonged morning stiffness are specific signs of simple mechanical overuse.": "Symmetric MCP swelling with prolonged stiffness supports inflammatory synovitis rather than mechanical overuse alone.",
  "Rheumatoid arthritis usually has no inflammatory synovitis and affects only isolated large joints.": "Rheumatoid arthritis features inflammatory synovitis and commonly involves multiple small joints.",
  "Osteoarthritis always begins with immune pannus and systemic inflammation.": "Immune pannus is associated with rheumatoid synovitis; it does not define osteoarthritis.",
  "Rheumatoid arthritis can be diagnosed solely from the absence of joint warmth.": "Absence of warmth alone cannot diagnose rheumatoid arthritis; the joint pattern and broader evidence matter.",
  "Both diseases require identical autoimmune laboratory findings for confirmation.": "RA and OA differ in mechanism; OA does not require the autoimmune laboratory findings used in RA assessment.",
  "G1: normal or increased eGFR at or above 90 mL/min/1.73 m².": "G1 begins at 90; the documented eGFR lies in the lower G4 interval of 15–29.",
  "G2: mildly decreased eGFR of 60–89 mL/min/1.73 m².": "G2 spans 60–89, above the documented G4 interval of 15–29.",
  "G3a: mildly to moderately decreased eGFR of 45–59 mL/min/1.73 m².": "G3a spans 45–59, not the 15–29 interval defining G4.",
  "G3b: moderately to severely decreased eGFR of 30–44 mL/min/1.73 m².": "G3b spans 30–44, immediately above the G4 interval of 15–29.",
  "G5: kidney failure with eGFR below 15 mL/min/1.73 m².": "G5 is below 15; an eGFR within 15–29 is G4 rather than G5.",
  "The initiation phase in which there is never a decline in kidney blood flow.": "The initiation phase may involve a renal perfusion decline; never excludes a recognized initiating mechanism.",
  "The maintenance phase is always characterized by unlimited urine output and complete normal renal function.": "Maintenance can include persistent renal dysfunction and does not guarantee unlimited urine or normal filtration.",
  "The chronic end-stage phase is automatically diagnosed after one day of high urine output.": "A day of high urine output does not establish chronic end-stage disease; chronicity requires persistent abnormalities.",
  "A period of increased urine output rules out prior kidney injury.": "A diuretic recovery phase can follow AKI, so increased output does not negate preceding injury.",
  "The phase can only occur if serum creatinine is below all reference values.": "Diuretic recovery does not require creatinine below reference values; filtration and concentrating recovery may lag.",
  "Urine stagnation mechanically removes more bacteria than regular voiding.": "Regular flow washes organisms out; stagnation reduces this mechanical clearance.",
  "An indwelling catheter restores all the bladder defense mechanisms of an uninstrumented urinary tract.": "Catheters can bypass natural barriers and provide an infection route/surface rather than restore every defense.",
  "The kidney normally sterilizes all bacteria by secreting gastric hydrochloric acid.": "Kidneys do not secrete gastric hydrochloric acid to sterilize urine; urinary flow and host defenses matter.",
  "No bacteria can survive in any urine regardless of pH and bladder conditions.": "Urinary conditions do not make bacteria universally unable to survive; organisms can persist in urinary infection.",
  "Normal urinary flora always cause pyelonephritis in every adult.": "Bacterial presence does not inevitably cause pyelonephritis; colonization, lower infection and upper infection differ.",
  "Transverse fracture — a single break perpendicular to the long axis of bone.": "Transverse describes a perpendicular fracture line, not fragmentation into several pieces.",
  "Oblique fracture — a single angled line across the bone.": "Oblique describes an angled fracture line, whereas multiple fragments define the comminuted pattern here.",
  "Spiral fracture — a twisting fracture line around the shaft.": "Spiral describes a twisting fracture line and is not synonymous with multiple fragments.",
  "Greenstick fracture — partial bending and break, typically in a child.": "Greenstick is an incomplete bend/break, unlike the several fragments described.",
  "Open fracture — fracture that communicates with an overlying wound.": "Open describes wound communication; comminuted describes fragmentation, and either feature can occur independently.",
  "Hepatitis D is transmitted exclusively through contaminated water and does not depend on HBV.": "HDV depends on HBV for its life cycle and is not exclusively waterborne or independent of HBV.",
  "Hepatitis B requires hepatitis D coinfection to replicate.": "The dependency runs from HDV to HBV; HBV does not require HDV to replicate.",
  "Hepatitis D is a bacterial complication of cholelithiasis.": "HDV is viral hepatitis associated with HBV, not a bacterial complication of gallstones.",
  "Vaccination against hepatitis A is the only way to prevent hepatitis D.": "Preventing HBV infection can prevent HBV-dependent HDV acquisition; hepatitis A vaccination is not the sole preventive mechanism.",
  "Hepatitis D infects only kidneys and never causes liver disease.": "HDV affects the liver; it is not an infection restricted to kidneys."
};
