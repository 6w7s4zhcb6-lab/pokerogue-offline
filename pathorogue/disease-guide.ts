import { nursingFacts, type NursingFact } from "./nursing-content";

// Plain-language definitions accompany the lecture bank's cause and signs
// subsections. A symptom, a normal process and a test are not labeled diseases.
// GI bleeding cross-check: https://www.niddk.nih.gov/health-information/digestive-diseases/gastrointestinal-bleeding/definition-facts
// Kidney physiology cross-check: https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work
const DEFINITIONS: Record<string, string> = {
  PATH_GI_vomit: "Vomiting is forceful expulsion of stomach contents. Repeated loss of gastric acid can cause metabolic alkalosis, an acid-base disturbance in which bicarbonate is increased relative to acid.",
  PATH_GI_diarrhea: "Diarrhea is the passage of loose or watery stools. Loss of bicarbonate in intestinal fluid can cause metabolic acidosis, an acid-base disturbance rather than a separate bowel disease.",
  PATH_GI_achalasia: "Achalasia is an esophageal movement disorder in which the lower esophageal sphincter does not relax normally and coordinated movement of food down the esophagus is impaired.",
  PATH_GI_hernia: "A hiatal hernia occurs when part of the stomach moves upward through the esophageal opening in the diaphragm into the chest.",
  PATH_GI_gerd: "Gastroesophageal reflux disease is recurrent backflow of stomach contents into the esophagus that causes troublesome symptoms or complications.",
  PATH_GI_duodenal: "A duodenal peptic ulcer is an open sore in the lining of the duodenum, the first part of the small intestine.",
  PATH_GI_Crohn: "Crohn disease is a chronic inflammatory bowel disease that can affect different parts of the digestive tract in separated patches and involve the full thickness of the bowel wall.",
  PATH_GI_UC: "Ulcerative colitis is a chronic inflammatory bowel disease affecting the lining of the colon. Inflammation usually begins in the rectum and extends continuously through part or all of the colon.",
  PATH_GI_diverticulitis: "Diverticulitis is inflammation of one or more diverticula, small pouches that can form in the bowel wall, usually in the colon.",
  PATH_GI_appendix: "Acute appendicitis is inflammation of the appendix, a small pouch attached to the beginning of the large intestine.",
  PATH_GI_portal: "Portal hypertension is abnormally high pressure in the portal venous system. Esophageal varices are enlarged collateral veins that can develop in the esophagus and may bleed.",
  PATH_GI_ammonia: "Hepatic encephalopathy is impaired brain function associated with liver dysfunction or blood bypassing the liver. Accumulating substances such as ammonia contribute to altered mental status.",
  PATH_GI_ascites: "Ascites is abnormal fluid accumulation in the abdominal peritoneal cavity. It is a complication that can occur with advanced liver disease, rather than a disease by itself.",
  PATH_GI_steatorrhea: "Steatorrhea means excess fat in the stool because fat has not been digested or absorbed adequately. It is a manifestation of an underlying digestive or absorptive problem.",
  PATH_REN_nephron: "Glomerular filtration is a normal kidney process that moves water and small dissolved substances from blood into the nephron while normally retaining blood cells and most large proteins.",
  PATH_REN_ADH: "Antidiuretic hormone, also called vasopressin, is a normal hormone that helps conserve body water by increasing water reabsorption in the kidney collecting ducts.",
  PATH_REN_Renin: "Renin is a kidney-released enzyme that initiates the renin-angiotensin-aldosterone system, a normal response helping regulate blood pressure and sodium and fluid balance.",
  PATH_REN_protein: "Proteinuria means an abnormally increased amount of protein in urine. It is a finding that may reflect damage to the kidney filtration barrier or other renal processes.",
  PATH_REN_urolith: "Urolithiasis is the formation or presence of stones made of crystallized substances within the urinary tract.",
  PATH_REN_hydroneph: "Hydronephrosis is dilation of the kidney's urine-collecting spaces, usually because urine drainage is obstructed or impaired.",
  PATH_REN_stress: "Stress urinary incontinence is urine leakage during activities that raise abdominal pressure, such as coughing, sneezing or lifting.",
  PATH_REN_cystitis: "Cystitis is inflammation of the bladder. The clinical pattern in this bank concerns bladder inflammation caused by a bacterial urinary infection.",
  PATH_REN_pyeloneph: "Acute pyelonephritis is an infection involving the kidney and renal pelvis, commonly arising when bacteria ascend from the lower urinary tract.",
  PATH_REN_interstitial: "Interstitial cystitis, or bladder pain syndrome, is a chronic pattern of bladder-associated pain or discomfort and urinary symptoms without an active identifiable infection explaining them.",
  PATH_REN_nephrotic: "Nephrotic syndrome is a group of findings caused by excessive protein loss through the kidneys, typically including heavy proteinuria, low blood albumin and edema.",
  PATH_REN_glomer: "Glomerulonephritis is inflammation of the glomeruli, the kidney's microscopic filtering structures, which can impair filtration and allow blood or protein into urine.",
  PATH_REN_AKI: "Acute kidney injury is an abrupt reduction in kidney function that impairs filtration and the regulation or removal of fluid and waste products.",
  PATH_REN_CKD: "Chronic kidney disease is a persistent abnormality of kidney structure or function lasting at least three months. It may progress and affect fluid balance, waste clearance and kidney hormone functions.",
  PATH_REN_hyperK: "Hyperkalemia is an abnormally high concentration of potassium in the blood. It is an electrolyte disturbance that can disrupt cardiac electrical activity.",
  PATH_MSK_stages: "Fracture healing is the normal repair process after a bone breaks. It progresses through bleeding and inflammation, formation of reparative tissue and callus, and remodeling.",
  PATH_MSK_osteoblast: "Osteoblasts are bone-forming cells that produce osteoid, the organic matrix that later mineralizes. Their work is balanced with bone resorption during normal remodeling.",
  PATH_MSK_open: "An open fracture is a broken bone that communicates with the outside environment through a wound, increasing the opportunity for contamination and infection.",
  PATH_MSK_compartment: "Acute compartment syndrome is dangerously increased pressure within a closed tissue compartment that reduces local blood flow and threatens muscles and nerves.",
  PATH_MSK_compartment2: "Acute compartment syndrome is impaired tissue perfusion caused by high pressure within a closed compartment. A palpable distal pulse does not exclude the condition because small-vessel perfusion can fail first.",
  PATH_MSK_sprain: "A sprain is stretching or tearing of a ligament, the tissue connecting bones at a joint. A strain instead involves muscle or tendon.",
  PATH_MSK_sublux: "Subluxation is a partial dislocation: joint surfaces lose some, but not all, of their normal contact.",
  PATH_MSK_rhabdo: "Rhabdomyolysis is breakdown of skeletal muscle with release of intracellular substances, including myoglobin and potassium, into the bloodstream.",
  PATH_MSK_osteoporosis: "Osteoporosis is reduced bone strength associated with low bone mass and deterioration of bone structure, increasing susceptibility to fragility fractures.",
  PATH_MSK_PTH: "Parathyroid hormone is a normal hormone that helps raise blood calcium when calcium levels are low through effects on bone, the kidneys and vitamin D activation.",
  PATH_MSK_osteomalacia: "Osteomalacia is inadequate mineralization of newly formed bone in adults, leaving bone softer and less strong than normal.",
  PATH_MSK_osteoM: "Osteomyelitis is an infection of bone. A sequestrum is a separated piece of dead bone that can develop within an infected area.",
  PATH_MSK_RA: "Rheumatoid arthritis is a chronic systemic autoimmune inflammatory disease that primarily affects synovial joints and can damage cartilage and bone.",
  PATH_MSK_OA: "Osteoarthritis is a disorder of the whole joint involving degeneration of cartilage and changes in surrounding bone and other joint tissues.",
  PATH_MSK_AS: "Ankylosing spondylitis is an inflammatory form of arthritis mainly involving the sacroiliac joints and spine, sometimes progressing to bony fusion.",
  PATH_MSK_gout: "Gout is an inflammatory arthritis caused by deposition of monosodium urate crystals in joints and related tissues.",
  PATH_MSK_fibro: "Fibromyalgia is a chronic condition characterized by widespread pain and increased pain sensitivity, often accompanied by fatigue and sleep disturbance.",
  GI_constipation: "Constipation is difficult, infrequent or incomplete passage of stool. Fecal impaction is a retained mass of hardened stool that cannot be passed normally.",
  GI_gi_bleed: "Gastrointestinal bleeding is blood loss from somewhere in the digestive tract. It is a symptom or complication of an underlying condition, rather than a disease itself.",
  GI_dysphagia: "Dysphagia means difficulty swallowing. Problems moving food or liquid safely through the mouth, throat or esophagus can create a risk of aspiration into the airway.",
  GI_PUD: "Peptic ulcer disease involves open sores in the lining of the stomach or duodenum where acid and pepsin can injure inadequately protected tissue.",
  GI_gastric_ulcer: "A gastric ulcer is an open sore in the lining of the stomach and is one form of peptic ulcer disease.",
  GI_gastritis: "Gastritis is inflammation of the stomach lining, which may be associated with injury to its protective surface.",
  GI_gastrectomy: "Gastrectomy is surgery to remove part or all of the stomach. This topic concerns problems that may follow that surgery, including altered emptying, digestion and nutrient absorption.",
  GI_obstruction: "Intestinal obstruction is a blockage that prevents normal movement of intestinal contents through the bowel.",
  GI_diverticulosis: "Diverticulosis means the presence of diverticula, small pouches in the bowel wall, without the active inflammation that defines diverticulitis.",
  GI_hepatitisA: "Hepatitis A is a liver infection caused by hepatitis A virus. It usually produces an acute illness and does not become chronic hepatitis A infection.",
  GI_hepatitisB: "Hepatitis B is a liver infection caused by hepatitis B virus. It can be acute or persist as a chronic infection.",
  GI_hepatitisC: "Hepatitis C is a liver infection caused by hepatitis C virus. Persistent infection may lead to chronic liver inflammation, fibrosis and cirrhosis.",
  GI_hepatitisD: "Hepatitis D is liver infection caused by hepatitis D virus, which depends on hepatitis B virus to establish infection and can worsen liver disease.",
  GI_hepatitisE: "Hepatitis E is liver infection caused by hepatitis E virus. It commonly causes acute hepatitis; persistent infection can occur in some immunocompromised people.",
  GI_cirrhosis: "Cirrhosis is advanced scarring and structural distortion of the liver, with regenerative nodules that interfere with normal blood flow and liver function.",
  GI_jaundice: "Jaundice is yellow discoloration of the skin and the whites of the eyes caused by bilirubin accumulation. It is a sign of an underlying process, not a diagnosis by itself.",
  GI_cholelithiasis: "Cholelithiasis means gallstones, solid deposits formed from components of bile, usually within the gallbladder.",
  GI_cholecystitis: "Acute cholecystitis is inflammation of the gallbladder, most commonly associated with persistent blockage of the cystic duct by a gallstone.",
  GI_pancreatitis: "Acute pancreatitis is sudden inflammation and injury of the pancreas associated with inappropriate activation of digestive enzymes within pancreatic tissue.",
  GI_colorectal_cancer: "Colorectal cancer is a malignant tumor arising in the colon or rectum, often developing through changes in precancerous polyps.",
  GI_pancreatic_cancer: "Pancreatic adenocarcinoma is a malignant tumor usually arising from cells lining pancreatic ducts.",
  GI_liver_cancer: "Hepatocellular carcinoma is a primary liver cancer arising from hepatocytes, the main functional cells of the liver.",
  GI_gastric_cancer: "Gastric cancer is a malignant tumor of the stomach. The principal type considered in this bank is adenocarcinoma arising from the stomach lining.",
  REN_renal_tests: "Renal diagnostic tests evaluate kidney function or possible urinary tract disease. Blood tests and urinalysis provide different information about filtration, urine contents and potential injury.",
  REN_obstruction: "Urinary tract obstruction is a partial or complete blockage of urine flow at some point in the urinary tract.",
  REN_overflow: "Overflow urinary incontinence is leakage from a bladder that does not empty adequately and becomes excessively full.",
  REN_urge: "Urge urinary incontinence is involuntary urine leakage associated with a sudden compelling urge to urinate, often involving involuntary bladder contractions.",
  REN_functional: "Functional urinary incontinence occurs when mobility, cognition or environmental barriers prevent timely toilet use despite possible preservation of bladder control.",
  REN_retention: "Urinary retention is an inability to empty the bladder adequately. It can occur suddenly or persist as incomplete emptying over time.",
  REN_stricture: "A urethral stricture is narrowing of the urethra from scar tissue or fibrosis that restricts urine flow.",
  REN_UTI: "A urinary tract infection is an infection in part of the urinary system, such as the urethra, bladder or kidneys.",
  REN_urethritis: "Urethritis is inflammation of the urethra, the tube carrying urine from the bladder out of the body; infectious and noninfectious causes are possible.",
  REN_chronic_pyelo: "Chronic pyelonephritis is chronic kidney scarring and inflammation associated with repeated or persistent upper urinary infection, often with reflux or obstruction.",
  REN_poststrep: "Poststreptococcal glomerulonephritis is immune-mediated inflammation of the kidney filters that develops after certain streptococcal infections.",
  REN_dialysis: "Dialysis is a treatment that removes selected wastes and excess fluid and helps correct electrolyte or acid-base problems when kidney function is inadequate. Hemodialysis uses an external filter; peritoneal dialysis uses the abdominal peritoneal membrane.",
  REN_acidosis: "Metabolic acidosis in kidney failure is an acid-base disturbance in which impaired renal acid handling allows acid to accumulate and reduces available bicarbonate.",
  REN_anemia: "Anemia of chronic kidney disease is a reduction in red blood cells or hemoglobin associated in part with inadequate kidney production of erythropoietin, the hormone that stimulates red-cell production.",
  GI_celiac: "Celiac disease is an immune-mediated disorder in which gluten exposure damages the small-intestinal lining in susceptible people and can impair nutrient absorption.",
  GI_CF: "Cystic fibrosis is an inherited disorder of the CFTR protein. Thick pancreatic secretions can obstruct ducts, reducing delivery of digestive enzymes and causing pancreatic insufficiency.",
  GI_peritonitis: "Secondary peritonitis is inflammation and infection of the abdominal peritoneal lining caused by contamination from another abdominal process, such as a perforated bowel.",
  GI_liver_metastasis: "Liver metastases are cancer deposits in the liver that spread from a primary cancer elsewhere in the body, rather than originating in liver cells.",
  REN_BPH: "Benign prostatic hyperplasia is noncancerous enlargement of prostate tissue that can narrow the bladder outlet and obstruct urinary flow.",
  REN_PKD: "Polycystic kidney disease is an inherited disorder involving multiple fluid-filled kidney cysts that can enlarge the kidneys and damage functioning tissue.",
  REN_nephrosclerosis: "Hypertensive nephrosclerosis is chronic kidney injury associated with long-standing high blood pressure and damage to small renal blood vessels.",
  REN_lupus_nephritis: "Lupus nephritis is kidney inflammation caused by systemic lupus erythematosus, commonly involving immune-complex injury of the glomeruli.",
  MSK_fracture: "A fracture is a break in the continuity of a bone. Fracture classifications describe features such as the pattern, completeness, displacement and whether there is an open wound.",
  MSK_healing: "Delayed union is fracture healing that is slower than expected, nonunion is failure to achieve bony union, and malunion is healing in an unsatisfactory alignment.",
  MSK_fat_embolus: "Fat embolism syndrome is a clinical syndrome in which fat embolization and an inflammatory response cause organ dysfunction, particularly affecting the lungs and brain after major bone injury.",
  MSK_strain: "A strain is stretching or tearing of muscle or tendon. It differs from a sprain, which affects a ligament.",
  MSK_dislocation: "A complete joint dislocation occurs when the bones forming a joint lose all normal contact at their articulating surfaces.",
};

const PHYSIOLOGY = new Set(["PATH_REN_nephron", "PATH_REN_ADH", "PATH_REN_Renin", "PATH_MSK_stages", "PATH_MSK_osteoblast", "PATH_MSK_PTH"]);
const PROCEDURES = new Set(["REN_renal_tests", "REN_dialysis"]);
const escapeGuideHtml = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);

export type DiseaseGuide = { name: string; definition: string; causes: string; manifestations: string; sources: string[]; causesLabel: string; manifestationsLabel: string };
export function getDiseaseGuide(factOrConceptId: NursingFact | string): DiseaseGuide {
  const id = typeof factOrConceptId === "string" ? factOrConceptId : factOrConceptId.conceptId;
  const facts = nursingFacts.filter(f => f.conceptId === id);
  const risk = facts.find(f => f.subsectionId === "risk");
  const signs = facts.find(f => f.subsectionId === "signs");
  const definition = DEFINITIONS[id];
  if (!facts.length || !definition || !risk || !signs) throw new Error(`Incomplete condition guide: ${id}`);
  return {
    name: facts[0].concept,
    definition,
    causes: risk.answer,
    manifestations: signs.answer,
    sources: [...new Set([risk.source, signs.source, facts.find(f => f.subsectionId === "mechanism")?.source].filter((source): source is string => !!source))],
    causesLabel: PHYSIOLOGY.has(id) ? "Normal regulation and relevant influences" : PROCEDURES.has(id) ? "Reasons it may be needed" : "Causes and risk factors",
    manifestationsLabel: PHYSIOLOGY.has(id) ? "Expected effects and findings" : PROCEDURES.has(id) ? "Relevant clinical findings" : "Clinical manifestations",
  };
}

export function renderDiseaseGuide(fact: NursingFact): string {
  const guide = getDiseaseGuide(fact);
  return `<section class="ng-disease-guide" data-guide-concept="${escapeGuideHtml(fact.conceptId)}" aria-label="About this condition"><h3>About this condition</h3><p><strong>${escapeGuideHtml(guide.name)}</strong></p><p><strong>What it is:</strong> ${escapeGuideHtml(guide.definition)}</p><p><strong>${escapeGuideHtml(guide.causesLabel)}:</strong> ${escapeGuideHtml(guide.causes)}</p><p><strong>${escapeGuideHtml(guide.manifestationsLabel)}:</strong> ${escapeGuideHtml(guide.manifestations)}</p><small class="ng-rationale-source">Study sources: ${guide.sources.map(escapeGuideHtml).join("; ")}</small></section>`;
}
