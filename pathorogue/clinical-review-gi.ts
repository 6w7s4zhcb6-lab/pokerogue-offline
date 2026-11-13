// Authored follow-up cases retain the original answer and its clinical evidence.
// Clinical cross-checks for gastric injury, dumping timing, and HAV course:
// https://www.niddk.nih.gov/health-information/digestive-diseases/gastritis-gastropathy/symptoms-causes
// https://www.niddk.nih.gov/health-information/digestive-diseases/dumping-syndrome/symptoms-causes
// https://www.cdc.gov/hepatitis-a/about/index.html
export const giReviewVariants: Record<string, [string, string, string]> = {
  PATH_GI_vomit: [
    "Following repeated vomiting during a migraine, a patient has pH 7.48 and bicarbonate 33 mEq/L. Which primary imbalance should the nurse recognize?",
    "A patient unable to retain meals for several days has alkalemia and elevated serum bicarbonate after gastric losses. Which acid-base disorder explains these results?",
    "During evaluation of persistent emesis after anesthesia, blood testing shows pH 7.50 with bicarbonate 35 mEq/L. How should this disturbance be classified?",
  ],
  PATH_GI_vomit__risk: [
    "After discharge for a fracture, a patient vomits following each newly prescribed opioid dose; the abdomen remains soft without bloody stool. Which history supports the suspected drug trigger?",
    "A postoperative patient's soft abdomen and nonbloody stools accompany emesis after analgesic doses. Which detail in the medication timeline most strongly implicates the opioid?",
    "At a pain-clinic follow-up, a patient reports dose-linked vomiting with a new opioid but no abdominal rigidity or bloody stool. Which historical finding supports medication-induced emesis?",
  ],
  PATH_GI_vomit__mechanism: [
    "A patient receiving gastric decompression develops elevated bicarbonate after large volumes of acidic aspirate are removed. Which substance loss initiates the alkalosis?",
    "Repeated emesis removes hydrochloric acid from a patient's stomach. Which direct chemical loss explains the resulting metabolic alkalosis?",
    "After prolonged nasogastric drainage, the nurse links a rising blood pH to gastric fluid removal. What lost component accounts for this disturbance?",
  ],
  PATH_GI_vomit__signs: [
    "Following a day of frequent emesis, a patient has a dry tongue and feels faint while transferring to a chair. Which additional assessment supports extracellular volume loss?",
    "A patient unable to keep down liquids becomes dizzy when rising to use the bathroom. Which blood-pressure finding would corroborate vomiting-related dehydration?",
    "At triage for persistent vomiting, the nurse notes dry oral tissues and positional lightheadedness. Which further finding strengthens the assessment of volume depletion?",
  ],
  PATH_GI_vomit__complications: [
    "While recovering from repeated emesis, a patient develops muscle weakness and ventricular premature beats; potassium is 2.7 mEq/L. Which complication explains the electrical risk?",
    "A patient with prolonged vomiting reports palpitations. Telemetry shows ventricular ectopy and laboratory testing finds potassium 2.9 mEq/L. Which problem needs correction?",
    "During observation for uncontrolled emesis, new weakness and frequent PVCs appear with potassium 2.8 mEq/L. Which electrolyte complication should the nurse prioritize?",
  ],
  PATH_GI_vomit__tests: [
    "A patient returns after two days of vomiting with generalized weakness and poor intake. Which laboratory panel best assesses the fluid, electrolyte, and metabolic consequences?",
    "Before planning replacement for continuing gastric losses, the nurse needs to evaluate potassium depletion, alkalosis, and kidney effects. Which studies provide that information?",
    "In an observation unit, persistent emesis is accompanied by weakness and declining intake. Which blood studies assess common consequences rather than simply seeking an anatomic cause?",
  ],
  PATH_GI_vomit__management: [
    "A patient still vomiting after treatment has low blood pressure when standing and low serum potassium. Which plan corrects the current deficits while addressing their source?",
    "During admission for uncontrolled emesis, orthostatic hypotension and potassium depletion are confirmed. Which combined treatment approach best addresses the physiologic consequences?",
    "A patient with ongoing gastric losses is faint on standing and hypokalemic. Which care plan should accompany investigation of the vomiting trigger?",
  ],
  PATH_GI_diarrhea: [
    "After a large-volume diarrheal illness, a patient has pH 7.29, bicarbonate 16 mEq/L, and increased chloride. Which primary acid-base disturbance is present?",
    "A patient with persistent watery stools develops acidemia, low bicarbonate, and hyperchloremia. Which disturbance explains this gastrointestinal-loss pattern?",
    "In a patient losing frequent liquid stools, blood chemistry shows reduced bicarbonate and increased chloride with pH 7.31. How should the nurse classify the imbalance?",
  ],
  PATH_GI_diarrhea__risk: [
    "A rehabilitation patient develops new watery diarrhea during treatment for pneumonia. Which recent medication exposure is especially relevant when assessing C. difficile risk?",
    "During evaluation of new loose stools after discharge from infection treatment, which treatment history should the nurse emphasize as an infectious-diarrhea risk?",
    "A patient develops frequent watery stools on the fifth day of an antibiotic course. Which exposure belongs in the handoff about a possible healthcare-associated intestinal infection?",
  ],
  PATH_GI_diarrhea__mechanism: [
    "A patient with continuous watery stools develops falling serum bicarbonate. Which intestinal loss directly reduces the circulating buffer supply?",
    "During a severe diarrheal episode, blood tests show metabolic acidosis without a primary ventilation problem. What stool-related process explains the bicarbonate deficit?",
    "A nurse explains why high-output intestinal fluid losses can make blood more acidic. Which mechanism accounts for loss of the body's buffering capacity?",
  ],
  PATH_GI_diarrhea__signs: [
    "After frequent watery bowel movements overnight, a patient reports thirst and cramping. Which pulse and urinary pattern would indicate clinically significant volume depletion?",
    "A patient with ongoing diarrhea has had little oral intake. Which additional assessment would support dehydration rather than fluid retention?",
    "During reassessment after repeated liquid stools, which cardiovascular and renal finding should alert the nurse that circulating volume has fallen?",
  ],
  PATH_GI_diarrhea__complications: [
    "After copious diarrhea, a patient becomes confused with blood pressure 82/48 mm Hg and scant urine. Which complication best accounts for this acute deterioration?",
    "A patient unable to replace diarrheal losses develops oliguria, hypotension, and reduced alertness. Which physiologic complication connects these findings?",
    "During a severe watery-stool illness, an older patient becomes hypotensive and disoriented while urine output falls. Which consequence of fluid loss should the nurse suspect?",
  ],
  PATH_GI_diarrhea__tests: [
    "A patient with continuing diarrhea feels dizzy and is voiding very little. Which initial laboratory studies quantify metabolic losses and effects on renal perfusion?",
    "Before replacing substantial diarrheal losses, the team needs to assess electrolytes, acid-base consequences, and kidney function. Which test set best meets that need?",
    "A patient returns after frequent liquid stools with positional dizziness and oliguria. Which blood tests evaluate the consequences while stool studies investigate the cause?",
  ],
  PATH_GI_diarrhea__management: [
    "During an outbreak of watery diarrhea, a patient has a dry tongue and lightheadedness. Which care priority addresses the existing fluid deficit?",
    "A patient with repeated loose stools cannot match losses with intake and feels faint when upright. Which treatment approach should begin as the cause is investigated?",
    "In a patient reporting ongoing diarrhea, thirst, and positional dizziness, which plan best addresses dehydration and prevents further losses?",
  ],
  PATH_GI_achalasia: [
    "A patient regurgitates retained food at night and struggles with water as well as bread. Testing shows esophageal dilation and failed lower-sphincter relaxation. Which disorder is present?",
    "During evaluation of progressive liquid and solid dysphagia, manometry identifies impaired lower esophageal sphincter relaxation; a dilated esophagus retains food. Which diagnosis explains this pattern?",
    "A patient reports nighttime food regurgitation and difficulty swallowing beverages and meals. A dilated esophagus and a lower sphincter that fails to relax indicate which condition?",
  ],
  PATH_GI_achalasia__risk: [
    "Endoscopy excludes a tumor, ring, or stricture in a patient with primary achalasia. Which underlying neuronal abnormality explains the motility disorder?",
    "A patient with confirmed primary achalasia asks why swallowing fails despite an unobstructed esophageal lumen. Which cellular loss is responsible?",
    "A motility specialist confirms achalasia after excluding mechanical narrowing. Which abnormality in the esophageal nerve supply underlies the diagnosis?",
  ],
  PATH_GI_achalasia__mechanism: [
    "After swallowing dinner, a patient with achalasia later brings up undigested food. How does failure of the distal esophageal sphincter to relax cause this?",
    "An esophagram shows poor emptying across a nonrelaxing lower sphincter in achalasia. Which immediate consequence accounts for subsequent food regurgitation?",
    "A patient with achalasia asks where a swallowed drink remains when the lower esophageal sphincter does not open properly. Which explanation is correct?",
  ],
  PATH_GI_achalasia__signs: [
    "A patient evaluated for achalasia describes coughing awake and regurgitating undigested supper. Which swallowing complaint would fit the same motility disorder?",
    "During an achalasia assessment, the nurse hears about retained food returning at night. Which pattern involving liquids and solids should also be expected?",
    "A patient with a nonrelaxing lower esophageal sphincter reports nighttime coughing. Which eating or drinking difficulty is consistent with this disorder?",
  ],
  PATH_GI_achalasia__complications: [
    "While sleeping, a patient with achalasia regurgitates retained dinner and awakens coughing and choking. Which respiratory complication is the immediate concern?",
    "A patient with poorly emptying esophageal contents begins choking after lying down following a meal. Which complication of achalasia should guide the nurse's airway assessment?",
    "During the night, a patient with untreated achalasia brings food into the mouth and develops sudden coughing. Which hazard makes this event concerning?",
  ],
  PATH_GI_achalasia__tests: [
    "Endoscopy excludes a structural lesion in a patient with liquid and solid dysphagia. Which test directly measures sphincter relaxation and peristalsis to confirm achalasia?",
    "A patient with suspected achalasia needs assessment of esophageal pressure during swallowing. Which diagnostic study best identifies the defining motility defect?",
    "After a contrast study suggests impaired esophageal emptying, which examination measures the lower sphincter's relaxation and organized contractions?",
  ],
  PATH_GI_achalasia__management: [
    "Before pneumatic dilation for achalasia, a patient asks how the procedure will help food reach the stomach. Which intended physiologic effect should the nurse explain?",
    "A patient considering myotomy for a nonrelaxing lower esophageal sphincter asks about the treatment goal. Which change would improve swallowing?",
    "Persistent food retention from achalasia prompts discussion of a sphincter-directed procedure. Which effect is the clinician seeking?",
  ],
  PATH_GI_hernia: [
    "An upper-GI study obtained for post-meal discomfort shows part of the stomach projecting into the chest through the esophageal hiatus. Which structural diagnosis is present?",
    "While reviewing imaging, the nurse sees gastric tissue displaced upward through the diaphragm's esophageal opening. What abnormality does this demonstrate?",
    "Investigation of positional reflux reveals the upper stomach above the diaphragm through its esophageal passage. Which anatomical condition explains that finding?",
  ],
  PATH_GI_hernia__risk: [
    "An adult with central obesity is diagnosed with a sliding hiatal hernia. Which pressure-related factor can favor upward movement of the stomach?",
    "During counseling about a sliding hiatal hernia, a patient asks how excess abdominal weight contributes. Which mechanical factor should the nurse identify?",
    "An older patient with a lax esophageal hiatus asks why persistent abdominal straining may promote a sliding hernia. Which force favors this displacement?",
  ],
  PATH_GI_hernia__mechanism: [
    "Imaging shows the gastroesophageal junction displaced above the diaphragm in a sliding hernia. How can this anatomical change contribute to heartburn?",
    "A patient develops reflux after the upper stomach slides through the hiatus. Which explanation links the altered anatomy with esophageal acid exposure?",
    "During hernia teaching, a patient asks why stomach displacement can allow acid to travel upward. Which effect on the normal reflux barrier is relevant?",
  ],
  PATH_GI_hernia__signs: [
    "A patient with a sliding hiatal hernia reports heartburn after a heavy evening meal. Which additional symptom would support associated gastroesophageal reflux?",
    "During follow-up for a sliding hernia, the nurse asks about symptoms after resting flat following meals. Which report fits acid reflux?",
    "A patient with an uncomplicated sliding hiatal hernia has postprandial burning. Which positional symptom would be consistent with the associated antireflux-barrier problem?",
  ],
  PATH_GI_hernia__complications: [
    "A patient known to have a paraesophageal hernia develops persistent retching, severe chest pressure, and inability to swallow meals. Which complication needs urgent assessment?",
    "After previously tolerating a paraesophageal hernia, a patient suddenly cannot keep down intake and has intense chest discomfort with retching. What dangerous complication is possible?",
    "The nurse receives a call about severe chest discomfort and repeated retching in a patient with a paraesophageal hernia who cannot tolerate liquids. Which complication must be excluded?",
  ],
  PATH_GI_hernia__tests: [
    "A contrast examination is ordered for suspected hiatal hernia after positional reflux. Which anatomical result would confirm the suspected displacement?",
    "During review of an upper-GI contrast series, which finding supports a hiatal hernia in a patient with post-meal discomfort?",
    "A patient asks what the radiologist seeks on the contrast study for a suspected hiatal hernia. Which relationship of stomach to diaphragm establishes the finding?",
  ],
  PATH_GI_hernia__management: [
    "A patient with a small sliding hiatal hernia and reflux asks about resting after lunch. There is no obstruction. Which instruction reduces reflux exposure?",
    "At discharge for uncomplicated sliding hernia symptoms, a patient describes lying flat after every evening meal. Which change should the nurse recommend?",
    "A patient managing a small sliding hiatal hernia without obstructive symptoms asks how to prevent post-meal burning at home. Which habit should be changed?",
  ],
  PATH_GI_gerd: [
    "After evening meals, a patient repeatedly develops burning behind the sternum and an acid taste when reclining. Which condition best explains this symptom pattern?",
    "A patient reports sour material returning to the mouth with postprandial retrosternal burning that worsens in bed. Which disorder is most likely?",
    "At a clinic visit, a patient describes recurrent heartburn and acidic regurgitation after supper, especially when lying flat. Which diagnosis fits?",
  ],
  PATH_GI_gerd__risk: [
    "A patient with frequent nighttime heartburn eats a large supper immediately before bed. Which behavior most directly contributes to the reflux episodes?",
    "When reviewing a symptom diary, the nurse finds heartburn after heavy meals followed by lying on the sofa. Which recurring habit should be targeted?",
    "A night-shift worker eats a large meal and reclines immediately on arriving home, then develops sour regurgitation. Which behavior explains the recurrent trigger?",
  ],
  PATH_GI_gerd__mechanism: [
    "A patient has inappropriate lower esophageal sphincter relaxation between meals. Which resulting exposure produces the burning of gastroesophageal reflux?",
    "During reflux teaching, the nurse explains what happens when the barrier between stomach and esophagus opens between swallows. Which event causes mucosal irritation?",
    "A patient asks why transient lower-sphincter opening can cause heartburn despite normal swallowing. Which movement of digestive contents explains the symptom?",
  ],
  PATH_GI_gerd__signs: [
    "A patient's post-meal retrosternal burning improves with prescribed acid suppression. Which accompanying oral sensation would further support reflux?",
    "During assessment of recurrent heartburn, which report about material returning into the mouth best supports exposure to gastric acid?",
    "A patient receiving treatment for meal-related substernal burning is asked about regurgitation. Which description is characteristic of reflux?",
  ],
  PATH_GI_gerd__complications: [
    "After years of reflux, a patient reports bread and meat increasingly sticking during swallowing. Which reflux-related structural complication may account for this progression?",
    "A patient with chronic acid regurgitation now has gradually worsening solid-food dysphagia. Which complication of repeated esophageal injury should be investigated?",
    "During GERD follow-up, a patient describes a new progressive inability to pass solid food. Which scarring-related problem could explain the change?",
  ],
  PATH_GI_gerd__tests: [
    "A patient treated for reflux develops weight loss and trouble swallowing. Which examination can inspect the esophageal mucosa and obtain a biopsy?",
    "Persistent reflux now accompanies progressive dysphagia and unintended weight loss. Which procedure allows direct assessment of injury and tissue sampling?",
    "The nurse prepares a patient with reflux alarm symptoms, including dysphagia and weight loss, for investigation. Which study can visualize the lining and collect tissue?",
  ],
  PATH_GI_gerd__management: [
    "A patient wakes with acid regurgitation after eating near bedtime. Which combination of bed positioning and meal timing should the nurse recommend?",
    "Despite daytime symptom relief, a patient has reflux when sleeping flat after late snacks. Which home instruction addresses both nighttime triggers?",
    "During discharge teaching for nocturnal GERD, which advice reduces reflux exposure while the patient sleeps?",
  ],
  PATH_GI_duodenal: [
    "A patient with pain several hours after meals gets brief relief from a snack. Endoscopy shows an ulcer crater in the duodenal bulb. Which diagnosis is confirmed?",
    "Nighttime epigastric discomfort prompts endoscopy, which identifies an ulcer in the first duodenal segment. Which diagnosis should appear in the care plan?",
    "A patient evaluated for recurrent fasting epigastric pain has an endoscopically demonstrated duodenal-bulb ulcer. How should this lesion be classified?",
  ],
  PATH_GI_duodenal__risk: [
    "Testing identifies H. pylori in a patient with a duodenal-bulb ulcer. How does this organism contribute to the risk of acid-peptic injury?",
    "A patient asks why a positive H. pylori result matters when the ulcer is in the duodenum. Which explanation connects the infection with ulcer formation?",
    "During counseling for an H. pylori-associated duodenal ulcer, which effect of infection explains its contribution to mucosal breakdown?",
  ],
  PATH_GI_duodenal__mechanism: [
    "A duodenal segment loses protective mucosal defenses but remains exposed to acid and pepsin. Which tissue process explains the resulting ulcer crater?",
    "During teaching about a duodenal ulcer, the nurse describes what happens when mucosal protection cannot withstand gastric secretions. Which mechanism produces the lesion?",
    "A patient asks how a weakened duodenal barrier becomes an open ulcer. Which effect of continued acid-pepsin exposure should be explained?",
  ],
  PATH_GI_duodenal__signs: [
    "A patient reports nighttime gnawing discomfort relieved briefly by a snack. Which recurring pain pattern supports a possible duodenal ulcer?",
    "During a meal-and-symptom review, a patient describes epigastric discomfort several hours after eating. Which pattern is compatible with duodenal ulcer disease?",
    "A patient being assessed for a duodenal ulcer says eating temporarily settles the pain. Which timing of epigastric discomfort fits this history?",
  ],
  PATH_GI_duodenal__complications: [
    "A patient being treated for a duodenal ulcer develops abrupt, severe pain across the abdomen and involuntary rigidity. Which complication requires urgent evaluation?",
    "During an ulcer admission, the patient suddenly reports generalized abdominal pain and the abdomen becomes boardlike. Which complication is most concerning?",
    "A patient with known duodenal ulceration has a sudden change from localized discomfort to diffuse severe pain with guarding and rigidity. Which process should be suspected?",
  ],
  PATH_GI_duodenal__tests: [
    "A patient with persistent fasting epigastric pain needs direct visualization of the duodenal lining. Which diagnostic procedure can demonstrate an ulcer?",
    "The team suspects a duodenal ulcer and wants to inspect the actual mucosal lesion. Which examination provides this confirmation?",
    "Continued nocturnal epigastric symptoms prompt investigation for duodenal ulceration. Which procedure can directly identify the lesion rather than merely detect H. pylori?",
  ],
  PATH_GI_duodenal__management: [
    "A duodenal ulcer is confirmed and H. pylori testing is positive. Which treatment plan addresses the infection while promoting mucosal healing?",
    "After reviewing positive H. pylori results, a patient with a duodenal ulcer asks whether symptom relief alone is enough. Which treatment principle is appropriate?",
    "At discharge for H. pylori-associated duodenal ulceration, which prescribed approach treats the cause and reduces acid injury?",
  ],
  PATH_GI_Crohn: [
    "Evaluation of chronic diarrhea and weight loss shows normal bowel between inflamed segments and inflammation through the full bowel wall. Which disease explains these findings?",
    "A patient with chronic cramping has patchy ileocolonic lesions and transmural inflammation on evaluation. Which inflammatory bowel disorder fits?",
    "During investigation of chronic abdominal pain, diarrhea, and weight loss, studies show skip lesions with full-thickness bowel injury. Which diagnosis is most consistent?",
  ],
  PATH_GI_Crohn__risk: [
    "A patient with Crohn disease asks which ongoing lifestyle exposure is associated with a worse intestinal disease course. Which modifiable factor should counseling address?",
    "During Crohn follow-up, the nurse learns that a patient continues daily cigarette use. Which exposure should be prioritized to improve disease-related risk?",
    "A patient recovering from a Crohn flare wants to reduce factors linked to recurrence and complications. Which modifiable exposure is relevant?",
  ],
  PATH_GI_Crohn__mechanism: [
    "A patient with Crohn disease develops drainage through a tract from bowel to the abdominal skin. Which depth of inflammation permits this fistula?",
    "Imaging shows a fistulous connection between bowel loops in Crohn disease. Which characteristic of the inflammatory injury explains the tract?",
    "During teaching about a Crohn-related enterocutaneous fistula, which feature distinguishes the injury from superficial mucosal inflammation?",
  ],
  PATH_GI_Crohn__signs: [
    "Despite eating adequate meals, a patient with terminal ileal Crohn disease loses weight and has chronic loose stools. Which finding would support impaired absorption?",
    "A dietary review shows sufficient intake in a patient with inflamed terminal ileum and persistent diarrhea. Which additional finding suggests nutrient uptake is inadequate?",
    "During Crohn follow-up, a patient has cramping and weight loss despite adequate calories. Which assessment finding is consistent with intestinal malabsorption?",
  ],
  PATH_GI_Crohn__complications: [
    "A patient with longstanding Crohn disease develops colicky pain, vomiting, and distension; imaging identifies fixed intestinal narrowing. Which complication explains this pattern?",
    "Recurrent Crohn inflammation is followed by post-meal cramps and vomiting. A narrowed bowel segment with upstream dilation is seen. Which complication is present?",
    "A patient with Crohn disease is admitted for distension and emesis, and studies show a fibrotic narrowed intestinal segment. Which obstructive complication should the nurse recognize?",
  ],
  PATH_GI_Crohn__tests: [
    "A patient with chronic diarrhea needs inspection of the terminal ileum and colon plus tissue samples for suspected Crohn disease. Which procedure meets both goals?",
    "The team wants to map ileocolonic mucosal disease and collect biopsies in suspected inflammatory bowel disease. Which investigation should the nurse prepare for?",
    "Persistent cramping and weight loss suggest Crohn disease. Which procedure directly evaluates ileocolonic mucosa while permitting histologic sampling?",
  ],
  PATH_GI_Crohn__management: [
    "An antidiarrheal improves stool frequency in Crohn disease, but the clinician continues immune-directed treatment. Which explanation best describes its purpose?",
    "A patient with Crohn disease asks why biologic therapy is needed when loose stools have improved with symptom medication. What should the nurse explain?",
    "During follow-up, a patient wants to substitute stool-control medication for prescribed Crohn inflammation therapy. Which rationale explains the need for disease-directed treatment?",
  ],
  PATH_GI_UC: [
    "A patient with bloody urgency has continuous inflammation extending proximally from the rectum, mainly within the colonic mucosa. Which inflammatory bowel disease is most consistent?",
    "Colonic biopsies obtained for persistent bloody diarrhea show predominantly mucosal injury in an uninterrupted pattern beginning at the rectum. Which diagnosis fits?",
    "During investigation of bloody stools and tenesmus, endoscopy demonstrates continuous rectocolonic mucosal inflammation. Which disease explains this distribution and depth?",
  ],
  PATH_GI_UC__risk: [
    "A patient with new inflammatory colonic symptoms reports that a sibling has ulcerative colitis. Which background factor is relevant to disease susceptibility?",
    "During evaluation of bloody diarrhea, a patient asks why the clinician requested a history of inflammatory bowel disease in close relatives. Which risk factor is being assessed?",
    "A patient's parent and sister have inflammatory bowel disease. Which history finding contributes to susceptibility when new colitis symptoms develop?",
  ],
  PATH_GI_UC__mechanism: [
    "A biopsy from a patient with ulcerative colitis is discussed alongside a Crohn specimen. Which statement describes the usual depth of UC inflammation?",
    "A patient newly diagnosed with ulcerative colitis asks whether the inflammation usually crosses every bowel-wall layer. Which explanation is accurate?",
    "During teaching about inflammatory bowel disease, which description best characterizes the tissue involvement of typical ulcerative colitis?",
  ],
  PATH_GI_UC__signs: [
    "During a UC flare, a patient repeatedly rushes to the toilet but passes only bloody mucus. Which interpretation links these symptoms to the affected tissue?",
    "A patient with ulcerative colitis reports tenesmus and frequent small bloody stools. Which explanation best accounts for the urgency and bleeding?",
    "At reassessment of active UC, the nurse notes repeated urgent defecation with mucus and blood. Which underlying symptom process does this reflect?",
  ],
  PATH_GI_UC__complications: [
    "A patient hospitalized for severe UC develops fever, rapid pulse, and marked distension; abdominal imaging shows colonic dilation. Which dangerous complication is suspected?",
    "During a severe colitis flare, the abdomen becomes distended and the patient becomes febrile and tachycardic with a dilated colon on radiography. Which complication requires urgent evaluation?",
    "A patient with active ulcerative colitis develops systemic toxicity and striking abdominal enlargement. Imaging confirms a dilated colon. Which complication best fits?",
  ],
  PATH_GI_UC__tests: [
    "A clinically stable patient with chronic bloody diarrhea needs assessment of colonic disease distribution and mucosal histology. Which procedure provides both?",
    "The nurse prepares a stable patient with suspected UC for a study that maps colonic inflammation and obtains tissue. Which procedure is appropriate?",
    "When evaluating persistent bloody stools in a stable patient, which examination permits direct viewing of the colon and collection of mucosal biopsies?",
  ],
  PATH_GI_UC__management: [
    "A patient with UC has no current bloody stools and asks why maintenance anti-inflammatory medication continues. Which treatment goal should the nurse explain?",
    "After a colitis flare settles, a patient plans to stop inflammation-directed therapy. Which purpose explains ongoing treatment between symptomatic episodes?",
    "During remission teaching for ulcerative colitis, a patient asks what prescribed maintenance therapy accomplishes. Which response describes its intended benefit?",
  ],
  PATH_GI_diverticulitis: [
    "After developing fever and focal left-lower-quadrant pain, a patient has CT-confirmed inflammation of sigmoid diverticula. Which diagnosis explains these findings?",
    "A patient presents with left-sided lower abdominal tenderness and fever. Imaging identifies inflamed sigmoid pouches and surrounding inflammation. Which condition is established?",
    "CT obtained for new left-lower abdominal pain and elevated temperature shows sigmoid diverticular inflammation. Which diagnosis should the nurse recognize?",
  ],
  PATH_GI_diverticulitis__risk: [
    "A patient with new focal colonic pain and fever is being assessed for diverticulitis. Which previously identified anatomical finding provides the substrate for this inflammation?",
    "During diverticulitis teaching, a patient asks which pre-existing bowel structure became inflamed. Which finding is necessary for this diagnosis?",
    "A patient previously told about small colonic pouches now develops fever and localized abdominal pain. Which underlying anatomical finding permits diverticulitis?",
  ],
  PATH_GI_diverticulitis__mechanism: [
    "Imaging of acute sigmoid diverticulitis shows pericolic inflammation and a small contained perforation. Which mechanism connects the defect to local inflammation?",
    "A patient asks how a tiny contained leak from a sigmoid pouch produces diverticulitis. Which explanation describes the local inflammatory process?",
    "CT shows inflammatory tissue around a leaking sigmoid diverticulum without free generalized perforation. Which event accounts for the localized reaction?",
  ],
  PATH_GI_diverticulitis__signs: [
    "A patient with suspected sigmoid diverticulitis has fever and new focal abdominal pain. Where would tenderness most commonly be expected?",
    "During examination of a febrile patient with inflammation of sigmoid diverticula, which abdominal region should the nurse expect to be tender?",
    "A patient reports lower abdominal discomfort and fever with suspected sigmoid diverticulitis. Which pain location best matches the affected segment?",
  ],
  PATH_GI_diverticulitis__complications: [
    "Despite treatment for diverticulitis, a patient remains febrile and CT reveals a fluid collection adjacent to the sigmoid colon. Which complication is likely?",
    "A patient with diverticulitis has persistent fever and an encapsulated pericolic fluid collection. Which complication explains the continuing infection?",
    "During reassessment of diverticulitis, localized pain and fever persist; imaging finds a nearby inflammatory collection. Which complication should be reported?",
  ],
  PATH_GI_diverticulitis__tests: [
    "A stable patient has suspected acute diverticulitis with fever and focal left-sided pain. Which imaging study best evaluates pericolic inflammation and a possible collection?",
    "The clinician suspects an abscess complicating acute diverticulitis in a stable adult. Which examination can define the inflammation and adjacent structures?",
    "During initial workup of febrile focal abdominal pain suggesting diverticulitis, which study commonly assesses both bowel inflammation and extraluminal complications?",
  ],
  PATH_GI_diverticulitis__management: [
    "A patient receiving diverticulitis treatment suddenly becomes hypotensive and febrile with diffuse abdominal guarding. Which response should the nurse prioritize?",
    "During observation for diverticulitis, localized tenderness progresses to generalized guarding with fever and falling blood pressure. What action is needed?",
    "A patient with known diverticulitis now has a rigid, diffusely guarded abdomen, fever, and circulatory deterioration. Which nursing response takes priority?",
  ],
  PATH_GI_appendix: [
    "A patient describes vague pain near the navel that migrated to the right lower quadrant, followed by nausea and low fever. Which disorder should be suspected?",
    "During triage, a patient reports that periumbilical discomfort became focal right-lower abdominal pain with nausea and fever. Which diagnosis fits this progression?",
    "Abdominal pain began centrally overnight and now localizes to the right lower abdomen with anorexia, nausea, and low fever. Which condition is most consistent?",
  ],
  PATH_GI_appendix__risk: [
    "Imaging identifies a fecalith blocking the appendix in a patient with acute appendicitis. Which event initiated the inflammatory process?",
    "A patient asks why a hardened stool fragment in the appendix can lead to infection and inflammation. Which initial structural problem should the nurse identify?",
    "During surgical teaching, the clinician describes secretions collecting behind an appendiceal fecalith. Which initiating event led to appendicitis?",
  ],
  PATH_GI_appendix__mechanism: [
    "Secretions accumulate behind a blocked appendiceal lumen and the appendix distends. Which pressure-related change can lead to ischemic tissue injury?",
    "A patient asks why untreated obstruction of the appendix may progress to necrosis. Which effect of increasing intraluminal pressure explains the risk?",
    "An inflamed appendix continues enlarging behind an obstruction. How can this distension compromise tissue viability?",
  ],
  PATH_GI_appendix__signs: [
    "A patient with suspected appendicitis lies still because movement worsens focal right-lower-quadrant pain. Which finding supports nearby peritoneal irritation?",
    "During examination for possible appendicitis, which localized protective abdominal response would support inflammation irritating the peritoneum?",
    "A patient resists movement because of right-lower abdominal tenderness. Which examination finding is consistent with an appendiceal peritoneal response?",
  ],
  PATH_GI_appendix__complications: [
    "A patient with appendicitis develops diffuse abdominal pain, rigidity, fever, and tachycardia after initially localized tenderness. Which complication is suspected?",
    "While awaiting surgery for appendicitis, pain spreads throughout the abdomen with guarding, fever, and a rapid pulse. Which complication is most concerning?",
    "The nurse reassesses appendicitis after sudden generalized pain and a rigid abdomen develop with systemic deterioration. Which process best explains the change?",
  ],
  PATH_GI_appendix__tests: [
    "A child with focal right-lower abdominal pain needs initial appendiceal imaging that avoids ionizing radiation. Which study should the nurse anticipate?",
    "Parents ask which initial study can assess suspected appendicitis without radiation exposure in their child. Which diagnostic option meets that goal?",
    "For a pediatric patient with possible appendicitis, the team chooses a radiation-free initial imaging approach. Which test is appropriate?",
  ],
  PATH_GI_appendix__management: [
    "A patient being evaluated for appendicitis asks for a stimulant laxative to relieve abdominal discomfort. Which nursing response is appropriate?",
    "Before the acute-abdomen workup is complete, a patient with suspected appendicitis requests an enema or laxative. How should the nurse respond?",
    "A patient with focal right-lower pain awaiting appendicitis evaluation believes a laxative will help. Which action is safest at this stage?",
  ],
  PATH_GI_portal: [
    "Endoscopy in a patient with portal hypertension reveals enlarged submucosal venous channels in the distal esophagus. What are these vessels called?",
    "A cirrhotic patient asks about enlarged esophageal veins documented during screening endoscopy. Which term describes this vascular finding?",
    "During review of a cirrhotic patient's endoscopy, the nurse sees dilated collateral veins lining the esophagus. Which finding is present?",
  ],
  PATH_GI_portal__risk: [
    "Progressive hepatic scarring increases portal outflow resistance in a patient with cirrhosis. Which vascular adaptation does this favor?",
    "A patient with cirrhosis asks how difficult portal blood flow through scarred liver tissue affects other veins. Which complication is promoted?",
    "Portal pressure rises as liver fibrosis obstructs normal flow. Which venous change should the nurse associate with this pressure burden?",
  ],
  PATH_GI_portal__mechanism: [
    "A scarred liver obstructs normal portal passage, and esophageal veins enlarge. Which rerouting of blood explains the enlargement?",
    "During teaching about varices, a patient asks why liver scarring affects veins in the esophagus. Which blood-flow mechanism connects these sites?",
    "A patient with portal hypertension develops enlarged lower-esophageal venous channels. How does resistance within the liver produce this collateral circulation?",
  ],
  PATH_GI_portal__signs: [
    "A patient with known varices suddenly vomits bright red blood and feels faint. Which finding indicates the need for immediate attention?",
    "During a variceal follow-up visit, a patient reports large-volume bloody emesis and new positional dizziness. Which symptom pattern is most urgent?",
    "A cirrhotic patient with esophageal varices brings up red blood and becomes lightheaded. Which assessment finding signals acute circulatory danger?",
  ],
  PATH_GI_portal__complications: [
    "During active variceal hemorrhage, a patient's pulse rises and blood pressure falls. Which immediate complication should guide urgent care?",
    "A patient losing blood from ruptured esophageal varices becomes hypotensive and tachycardic. Which complication best explains the hemodynamic changes?",
    "The nurse monitors ongoing bloody emesis from varices as circulation deteriorates. Which acute consequence of major blood loss is most concerning?",
  ],
  PATH_GI_portal__tests: [
    "A patient with cirrhosis needs direct inspection for enlarged esophageal collateral veins. Which procedure provides this view?",
    "The clinician requests a study to visualize suspected esophageal varices in a patient with portal hypertension. Which examination should the nurse prepare for?",
    "During variceal screening, which diagnostic procedure directly displays the esophageal venous lesions rather than only assessing portal flow?",
  ],
  PATH_GI_portal__management: [
    "A patient with cirrhosis is hypotensive while actively vomiting blood from suspected varices. Which immediate nursing action takes priority?",
    "During a variceal hemorrhage, large-volume hematemesis creates airway risk and blood pressure is falling. Which response must begin urgently?",
    "A patient with suspected ruptured esophageal varices arrives with bloody emesis and circulatory instability. What should the nurse prioritize?",
  ],
  PATH_GI_ammonia: [
    "A patient with cirrhosis sleeps through the day, becomes disoriented at night, and has flapping movements of extended hands. Which complication is most likely?",
    "Family members report sleep reversal and confusion in a patient with liver failure; examination reveals asterixis. Which syndrome explains these changes?",
    "During cirrhosis follow-up, new inattention, reversed sleep timing, and irregular flapping of the hands are noted. Which complication should be suspected?",
  ],
  PATH_GI_ammonia__risk: [
    "A patient with cirrhosis becomes inattentive after no bowel movement for several days. How can the constipation precipitate hepatic encephalopathy?",
    "Family reports new confusion in a cirrhotic patient who has become markedly constipated. Which effect of bowel retention is a relevant trigger?",
    "During encephalopathy assessment, the nurse identifies several days of constipation. Which intestinal consequence can contribute to the mental-status change?",
  ],
  PATH_GI_ammonia__mechanism: [
    "A patient with hepatic dysfunction and portosystemic shunting develops confusion. Which handling of intestinal substances contributes to the neurologic effects?",
    "During teaching about encephalopathy, the clinician explains that portal blood bypasses a poorly functioning liver. Which process allows neuroactive substances to accumulate systemically?",
    "A patient asks why impaired liver processing plus collateral shunting can affect thinking. Which pathway explains this encephalopathy mechanism?",
  ],
  PATH_GI_ammonia__signs: [
    "A patient with liver failure extends both arms, but wrist posture repeatedly lapses into irregular flapping. What is this examination finding called?",
    "During a neurologic check in cirrhosis, the patient cannot steadily hold the wrists extended and the hands flap intermittently. Which term describes this?",
    "The nurse asks a patient with hepatic dysfunction to hold the hands outstretched and observes brief irregular posture lapses. Which motor finding is present?",
  ],
  PATH_GI_ammonia__complications: [
    "A patient with hepatic encephalopathy becomes too somnolent to handle oral secretions. Which immediate complication should take priority?",
    "Progressive encephalopathy leaves a patient unable to protect the airway. Which respiratory danger requires urgent nursing attention?",
    "During an encephalopathy admission, alertness declines and the patient no longer manages airway secretions safely. Which complication is the greatest immediate concern?",
  ],
  PATH_GI_ammonia__tests: [
    "A patient with cirrhosis presents with new confusion. Which assessment approach best evaluates possible encephalopathy without overlooking other reversible causes?",
    "The nurse receives an ammonia result for a newly confused cirrhotic patient. Which broader assessment is required to evaluate the clinical change?",
    "Family describes sudden inattention in a patient with liver disease. Which evaluation best addresses encephalopathy triggers and alternative explanations?",
  ],
  PATH_GI_ammonia__management: [
    "Lactulose is prescribed for a patient with liver-related confusion. Which intestinal effect explains its intended benefit?",
    "A patient treated for hepatic encephalopathy asks why a bowel-directed medicine helps thinking. Which lactulose effect should the nurse describe?",
    "During medication teaching for recurrent hepatic encephalopathy, what purpose of lactulose should the nurse emphasize?",
  ],
  PATH_GI_ascites: [
    "A patient's abdomen enlarges during advanced liver disease; shifting dullness and ultrasound demonstrate free peritoneal fluid. Which finding is present?",
    "During cirrhosis assessment, a distended abdomen has shifting dullness and imaging confirms fluid throughout the peritoneal cavity. What is this called?",
    "A patient with liver failure reports increasing abdominal size. Ultrasound shows free abdominal fluid rather than a localized mass. Which diagnosis describes it?",
  ],
  PATH_GI_ascites__risk: [
    "Portal pressure rises and the kidneys retain sodium in a patient with cirrhosis. Which abdominal fluid complication is favored?",
    "A cirrhotic patient asks what can result from portal hypertension combined with renal sodium retention. Which accumulation is most directly promoted?",
    "During liver-disease teaching, the nurse connects high portal pressure and retained sodium with which fluid-related complication?",
  ],
  PATH_GI_ascites__mechanism: [
    "A patient with cirrhosis has splanchnic vasodilation and portal hypertension that activate sodium-retaining hormones. How does this worsen abdominal fluid accumulation?",
    "Despite excess abdominal fluid, a cirrhotic patient's kidneys continue retaining sodium. Which effect of retaining sodium and water sustains ascites?",
    "The nurse explains why hormonally driven renal sodium retention can enlarge ascites in portal hypertension. Which fluid-balance mechanism is involved?",
  ],
  PATH_GI_ascites__signs: [
    "A patient with ascites reports tighter waistbands and earlier fullness during meals. Which measured trend would support increasing peritoneal fluid?",
    "During follow-up for cirrhotic ascites, which change in girth and weight would suggest that abdominal fluid is accumulating?",
    "The nurse tracks a patient's sense of abdominal fullness during ascites treatment. Which objective assessment pattern is consistent with worsening fluid accumulation?",
  ],
  PATH_GI_ascites__complications: [
    "A patient with cirrhotic ascites develops fever, abdominal discomfort, and new confusion without evidence of bowel perforation. Which infection should be considered?",
    "During admission for ascites, unexplained fever and worsening attention accompany diffuse abdominal discomfort; no perforation is identified. Which complication is concerning?",
    "A cirrhotic patient with peritoneal fluid becomes febrile and more confused with abdominal pain in the absence of a known perforation. Which complication requires assessment?",
  ],
  PATH_GI_ascites__tests: [
    "New abdominal fluid is accompanied by fever in a patient with cirrhosis. Which procedure obtains ascitic fluid for leukocyte count and culture?",
    "The team suspects infection in a patient's ascites and needs a fluid specimen. Which procedure allows direct sampling of the peritoneal fluid?",
    "A febrile patient with newly identified ascites needs analysis of the fluid rather than imaging alone. Which diagnostic procedure provides the sample?",
  ],
  PATH_GI_ascites__management: [
    "A patient starts diuretics for cirrhotic ascites. Which monitoring best detects fluid response and renal or electrolyte complications?",
    "During diuretic adjustment for ascites, which combination of daily measurements and laboratory monitoring is particularly important?",
    "The nurse evaluates a patient's response to prescribed ascites diuretics. Which monitoring plan assesses both effectiveness and common treatment risks?",
  ],
  PATH_GI_steatorrhea: [
    "A patient describes bulky, foul-smelling bowel movements with a greasy film that float and resist flushing. Which stool finding is being reported?",
    "During a malabsorption assessment, the nurse hears that stools are oily, bulky, and difficult to flush. What term describes this excess-fat pattern?",
    "A patient brings a history of floating, greasy stools with strong odor and an oily toilet residue. Which clinical finding does this indicate?",
  ],
  PATH_GI_steatorrhea__risk: [
    "A patient with chronic pancreatic injury begins passing greasy stools. Which deficiency of pancreatic digestive function most directly explains the change?",
    "During assessment of fatty stools in chronic pancreatic disease, which reduced intestinal enzyme delivery is most relevant?",
    "A patient asks why damaged pancreatic tissue can lead to stool containing excess fat. Which lost digestive function should the nurse identify?",
  ],
  PATH_GI_steatorrhea__mechanism: [
    "Severe cholestasis reduces bile delivery to a patient's intestine and fatty stools develop. Which role of bile salts explains impaired fat absorption?",
    "A patient with obstructed bile flow asks why stool has become greasy. Which bile-dependent step normally helps absorb digested fat?",
    "During teaching about cholestatic steatorrhea, which intestinal function of bile salts should the nurse describe?",
  ],
  PATH_GI_steatorrhea__signs: [
    "A patient reports an oily film after bowel movements. Which additional trend would support ongoing nutrient malabsorption?",
    "During follow-up for greasy stools, the nurse seeks evidence that nutrients are being lost. Which body-weight finding supports chronic malabsorption?",
    "A patient with persistent fatty stools has adequate reported intake. Which accompanying finding would increase concern about nutrient absorption?",
  ],
  PATH_GI_steatorrhea__complications: [
    "A patient with months of fatty stools develops easy bruising and prolonged clotting studies attributed to malabsorption. Which vitamin deficiency best explains the coagulation change?",
    "Chronic steatorrhea is followed by bleeding gums, bruises, and prolonged clotting time from a vitamin deficit. Which missing nutrient is most relevant?",
    "During a malabsorption admission, a patient has prolonged coagulation testing and easy bruising. Which fat-soluble vitamin deficiency should the nurse connect to these findings?",
  ],
  PATH_GI_steatorrhea__tests: [
    "A patient with unexplained oily stools and weight loss needs direct confirmation of excessive fat loss in stool. Which investigation provides that evidence?",
    "To evaluate a persistent greasy stool film, which test assesses the excess stool constituent rather than occult blood or pathogens?",
    "The clinician suspects fat malabsorption in a patient with floating bulky stools. Which stool analysis directly evaluates this suspicion?",
  ],
  PATH_GI_steatorrhea__management: [
    "Confirmed pancreatic enzyme deficiency causes a patient's greasy stools. Which prescribed meal-related therapy directly improves digestion?",
    "A patient with exocrine pancreatic insufficiency asks how to treat fatty stools during meals. Which replacement approach addresses the deficit?",
    "During discharge teaching for pancreatic maldigestion, which prescribed treatment should accompany food intake to help digest nutrients?",
  ],
  GI_constipation: [
    "An older patient reports liquid stool seepage, but rectal examination finds a large hard stool mass with abdominal fullness. Which problem explains the apparent diarrhea?",
    "A patient with persistent rectal fullness leaks small amounts of watery stool around a palpable hard fecal mass. Which condition should the nurse recognize?",
    "During evaluation of new stool soiling, a hard rectal stool mass is found in a patient with abdominal fullness. Which diagnosis explains the leakage?",
  ],
  GI_constipation__risk: [
    "After surgery, a patient receives opioids and spends most of the day in bed, then develops hard infrequent stools. Which contributing factors should the nurse identify?",
    "A patient recovering from a fracture becomes constipated while taking opioid analgesia and moving very little. Which combination explains the reduced bowel activity?",
    "During a medication and activity review for constipation, opioid use and prolonged bed rest are documented. Which mechanisms contribute most directly?",
  ],
  GI_constipation__mechanism: [
    "A patient's stool remains in the colon for an extended period because transit is slow. Which process makes the retained stool progressively harder?",
    "During constipation teaching, a patient asks why infrequent bowel movement produces dry hard stool. Which effect of prolonged colonic retention explains it?",
    "A patient with markedly slowed colonic motility develops firm stool. Which water-handling change occurs while stool remains in the colon?",
  ],
  GI_constipation__signs: [
    "A patient describes straining and incomplete emptying during bowel movements. Which additional stool pattern supports constipation?",
    "During assessment of abdominal fullness, a patient reports difficult evacuation. Which finding concerning stool frequency and consistency fits constipation?",
    "A patient asks whether repeated straining and a sense of retained stool suggest constipation. Which associated bowel pattern supports that interpretation?",
  ],
  GI_constipation__complications: [
    "A patient with a large fecal impaction develops increasing distension and cannot pass stool or gas. Which complication needs assessment?",
    "During treatment for retained hard stool, abdominal enlargement worsens and flatus stops. Which obstructive complication should the nurse suspect?",
    "A patient with documented fecal impaction now has obstipation and progressive abdominal distension. Which serious consequence may have developed?",
  ],
  GI_constipation__tests: [
    "An older patient has suspected distal impaction with watery overflow leakage. Which focused bedside examination may directly identify the retained stool when appropriate?",
    "To assess a possible hard rectal stool mass causing overflow soiling, which examination can directly evaluate the distal rectum?",
    "A patient reports rectal fullness and small amounts of liquid seepage. Which clinically appropriate examination may confirm distal fecal impaction?",
  ],
  GI_constipation__management: [
    "An opioid-treated patient has constipation without obstruction. Which plan should the nurse discuss to address medication effects, hydration, and activity?",
    "A patient needs ongoing opioid pain control and has hard stools, with obstruction excluded. Which bowel-management approach is appropriate?",
    "During discharge planning for opioid-associated constipation, which individualized approach supports bowel function while accounting for fluid and mobility tolerance?",
  ],
  GI_gi_bleed: [
    "A patient who feels nauseated produces dark granular vomit resembling wet coffee grounds. Which process does this appearance most strongly suggest?",
    "During assessment of emesis, the nurse sees brown-black granules similar to coffee grounds. Which clinical problem should be suspected?",
    "A patient reports vomiting material that looks like coffee grounds rather than undigested food. Which source of concern does this finding indicate?",
  ],
  GI_gi_bleed__risk: [
    "A patient taking nonessential ibuprofen daily develops a bleeding gastric ulcer. Which medication exposure contributed to mucosal injury?",
    "During evaluation of an ulcer hemorrhage, the history reveals regular nonprescription NSAID use. Which exposure is a relevant bleeding contributor?",
    "A patient asks what may have promoted a bleeding gastric ulcer after prolonged daily NSAID use. Which modifiable exposure should be identified?",
  ],
  GI_gi_bleed__mechanism: [
    "After an upper gastrointestinal hemorrhage, a patient passes black tarry stool. Which alteration of blood explains this stool appearance?",
    "A patient asks why bleeding from the stomach can produce very dark sticky stool. Which process accounts for the color change?",
    "During teaching about melena following upper-GI blood loss, which digestive-tract process explains the black tarry appearance?",
  ],
  GI_gi_bleed__signs: [
    "A patient with suspected GI bleeding is pale and lightheaded when upright. Which vital-sign trend supports significant circulating blood loss?",
    "During assessment of possible gastrointestinal hemorrhage, which change in pulse and blood pressure would heighten concern about acute blood loss?",
    "A patient passing bloody stool feels faint. Which additional cardiovascular pattern indicates clinically important loss of circulating volume?",
  ],
  GI_gi_bleed__complications: [
    "A patient rapidly vomits a large volume of blood and blood pressure drops. Which complication results directly from the acute volume loss?",
    "During ongoing massive hematemesis, a patient's circulation deteriorates with hypotension. Which immediate complication is most concerning?",
    "A patient with brisk upper-GI hemorrhage becomes hypotensive as circulating blood volume falls. Which complication should the nurse recognize?",
  ],
  GI_gi_bleed__tests: [
    "After stabilization for continuing hematemesis, a patient needs identification and possible procedural control of the source. Which examination can provide both?",
    "A patient with upper-GI hemorrhage is now stable enough for investigation. Which procedure can inspect the lesion and deliver hemostatic treatment?",
    "The team plans source-directed care after resuscitating a patient with bloody emesis. Which study can visualize and sometimes treat the upper digestive bleeding site?",
  ],
  GI_gi_bleed__management: [
    "A patient is actively vomiting blood with blood pressure 84/50 mm Hg. Which immediate nursing priority addresses the most urgent risks?",
    "During sudden hematemesis, a patient becomes hypotensive and struggles to clear blood from the mouth. What should the nurse prioritize?",
    "A patient arrives with ongoing bloody emesis and circulatory instability. Which initial response should precede routine history and teaching?",
  ],
  GI_dysphagia: [
    "Following a cerebrovascular event, a patient develops immediate coughing with water and a wet voice after swallowing. Which feeding-safety problem should the nurse suspect?",
    "During a post-stroke water screen, the patient coughs after a sip and the voice becomes gurgly. Which problem best explains these findings?",
    "A patient's voice sounds wet after swallowing liquids following a stroke, and coughing occurs during intake. Which disorder creates the immediate feeding risk?",
  ],
  GI_dysphagia__risk: [
    "A patient with a new stroke has facial weakness and reduced alertness. Which function must be screened before food, drink, or oral medicines are offered?",
    "Before giving breakfast to a patient with new neurologic facial weakness, which ability should the nurse assess for safe oral intake?",
    "A patient's alertness and facial movement change after a cerebrovascular event. Which function needs screening before administering oral medication?",
  ],
  GI_dysphagia__mechanism: [
    "A patient has impaired airway closure during swallowing. Which route taken by a food bolus defines aspiration?",
    "During dysphagia teaching, a family asks what happens when swallowed liquid is aspirated. Which movement of material explains the event?",
    "A swallowing evaluation identifies failed airway protection. Which bolus pathway accounts for aspiration rather than safe passage into the stomach?",
  ],
  GI_dysphagia__signs: [
    "While eating, a patient pockets food, swallows repeatedly, and coughs with water. Which observation is most directly relevant to immediate feeding safety?",
    "During lunch assistance, the nurse notes repeated swallowing and coughing after sips. Which finding should guide the assessment of unsafe intake?",
    "A patient leaves food in one cheek and coughs after thin liquids. Which symptom most directly signals a need to reassess oral feeding safety?",
  ],
  GI_dysphagia__complications: [
    "After repeated choking during meals, a dysphagic patient develops fever, productive cough, and a new chest infiltrate. Which complication should be suspected?",
    "A patient with unsafe swallowing develops febrile respiratory illness and a new pulmonary infiltrate after choking episodes. Which complication best fits?",
    "During dysphagia care, repeated meal-related choking is followed by sputum production, fever, and radiographic lung opacity. Which complication is most likely?",
  ],
  GI_dysphagia__tests: [
    "A patient needs dynamic imaging of oral and pharyngeal bolus movement to determine whether aspiration occurs. Which swallowing study can provide this information?",
    "After an abnormal bedside swallowing screen, which investigation can visualize bolus transit and entry into the airway?",
    "The team wants to observe swallowing with contrast and assess aspiration in suspected oropharyngeal dysfunction. Which diagnostic examination meets this goal?",
  ],
  GI_dysphagia__management: [
    "A patient coughs repeatedly during a swallowing screen just before oral medications are due. Which nursing action is appropriate?",
    "While screening swallowing, the nurse observes recurrent coughing after sips. What should happen before the patient receives food or oral medicines?",
    "A patient's bedside swallow screen produces repeated coughing. Which immediate intake plan is appropriate pending specialist evaluation?",
  ],
  GI_PUD: [
    "Endoscopy for persistent epigastric pain shows a definite crater in the gastric mucosa exposed to acid and pepsin. Which disease category describes the lesion?",
    "A patient has an open mucosal crater within the stomach on endoscopy. Which acid-related disease category explains this structural defect?",
    "During evaluation of upper abdominal pain, endoscopy demonstrates a gastric mucosal crater rather than inflammation alone. Which condition category is present?",
  ],
  GI_PUD__risk: [
    "A patient taking daily ibuprofen develops a peptic ulcer. Which effect of NSAIDs on gastric defenses explains this risk?",
    "During counseling about an NSAID-associated ulcer, a patient asks how the medicine weakened the stomach lining. Which mechanism is involved?",
    "Long-term anti-inflammatory analgesic use precedes a patient's peptic ulcer. Which reduction in protective mediators contributes to the injury?",
  ],
  GI_PUD__mechanism: [
    "A patient with an uncomplicated ulcer asks how a prescribed acid-suppressing medicine helps the damaged lining recover. Which explanation is accurate?",
    "During peptic-ulcer teaching, which effect of decreasing acid exposure promotes repair of the mucosal lesion?",
    "A patient asks whether lowering gastric acid assists ulcer healing. Which relationship between injurious factors and tissue repair explains the benefit?",
  ],
  GI_PUD__signs: [
    "A patient with recurring epigastric discomfort reports a new stool change. Which finding suggests the ulcer may now be bleeding?",
    "During assessment of ulcer symptoms, which new bowel finding would indicate digested blood rather than uncomplicated dyspepsia?",
    "A patient with known peptic ulcer disease calls about changed bowel movements. Which description raises concern for hemorrhage?",
  ],
  GI_PUD__complications: [
    "A patient with peptic ulcer disease suddenly develops diffuse severe pain and involuntary abdominal rigidity. Which complication needs urgent evaluation?",
    "While receiving ulcer treatment, a patient develops abrupt generalized abdominal pain with a boardlike abdomen. Which complication should be suspected?",
    "An ulcer patient's pain abruptly spreads throughout the abdomen and rigidity develops. Which dangerous change best explains the peritoneal signs?",
  ],
  GI_PUD__tests: [
    "A patient with an endoscopically confirmed peptic ulcer needs noninvasive testing for H. pylori when medication timing permits. Which test may be used?",
    "The clinician seeks evidence of a treatable H. pylori infection in a patient with an ulcer. Which noninvasive diagnostic option is appropriate when properly timed?",
    "During workup of a peptic ulcer, which test can detect a common gastric bacterial cause through urease activity?",
  ],
  GI_PUD__management: [
    "A patient with an H. pylori-positive ulcer asks why antibiotics and acid suppression are prescribed together. Which treatment purpose explains the combination?",
    "During discharge teaching for an infected peptic ulcer, a patient questions the multi-medicine regimen. Which explanation best addresses its goals?",
    "A patient asks why relief of ulcer pain does not replace the prescribed H. pylori regimen. Which purpose of combined therapy should the nurse explain?",
  ],
  GI_gastric_ulcer: [
    "A patient investigated for epigastric pain and weight loss has a discrete ulcer on the stomach's lesser curvature. Which lesion has endoscopy identified?",
    "Endoscopy obtained for upper abdominal discomfort shows a mucosal crater on the gastric lesser curvature. Which location-specific lesion is present?",
    "During investigation of declining intake, a patient is found to have an ulcer confined to the stomach's lesser curvature. Which diagnosis describes this finding?",
  ],
  GI_gastric_ulcer__risk: [
    "A patient with a naproxen-associated gastric ulcer needs assessment for another major ulcer cause. Which concurrent infection should be considered?",
    "Despite identifying NSAID exposure, the team investigates a common bacterial contributor to a patient's stomach ulcer. Which organism is relevant?",
    "A patient taking anti-inflammatory analgesics has a gastric ulcer. Which infection should still be evaluated as a potentially coexisting cause?",
  ],
  GI_gastric_ulcer__mechanism: [
    "A patient's gastric protective barrier fails and an ulcer forms during continued acid-pepsin exposure. Which imbalance explains the mucosal defect?",
    "During gastric-ulcer education, a patient asks why normal digestive secretions can damage the stomach. Which balance has been disrupted?",
    "A patient develops a gastric ulcer after mucosal defenses are impaired. Which relationship between injury and repair accounts for the lesion?",
  ],
  GI_gastric_ulcer__signs: [
    "A gastric-ulcer patient skips meals because eating worsens epigastric discomfort. Which nutritional consequence should the nurse monitor?",
    "During follow-up, a patient with a stomach ulcer reports avoiding food to prevent meal-associated pain. Which change is a foreseeable concern?",
    "A patient with painful meals from a gastric ulcer begins eating much less. Which intake-related outcome deserves assessment?",
  ],
  GI_gastric_ulcer__complications: [
    "A patient with a gastric ulcer develops hematemesis and a falling hemoglobin concentration. Which complication is present?",
    "During ulcer treatment, the nurse observes bloody vomit and laboratory evidence of declining hemoglobin. Which complication best explains both findings?",
    "A known gastric ulcer is followed by vomiting blood and worsening blood-loss anemia. Which complication has occurred?",
  ],
  GI_gastric_ulcer__tests: [
    "The endoscopist biopsies an irregular gastric ulcer. Which important tissue diagnosis is the sampling intended to assess?",
    "A patient asks why a suspicious stomach ulcer needs biopsy even though its location is already visible. Which concern explains tissue collection?",
    "During endoscopy for a gastric ulcer with concerning features, tissue samples are obtained. What is a major reason for histologic evaluation?",
  ],
  GI_gastric_ulcer__management: [
    "A patient with a gastric ulcer continues taking ibuprofen for joint pain. Which medication-plan question should be raised with the prescriber?",
    "During reconciliation for a newly diagnosed stomach ulcer, daily NSAID use is found. Which review is appropriate to reduce further mucosal injury?",
    "A patient asks how to manage chronic pain after developing a gastric ulcer while taking an NSAID. Which medication decision needs discussion?",
  ],
  GI_gastritis: [
    "Evaluation of epigastric burning and nausea shows inflamed gastric mucosa but no discrete ulcer crater. Which diagnosis describes the endoscopic finding?",
    "A patient with persistent upper abdominal discomfort has gastric mucosal inflammation on endoscopy without an ulcerated defect. Which condition fits?",
    "During investigation of nausea, endoscopy reveals inflammation of the stomach lining and no localized crater. Which diagnosis is supported?",
  ],
  GI_gastritis__risk: [
    "A patient with epigastric nausea reports frequent aspirin use and heavy drinking. Which exposures are relevant to the gastric mucosal injury?",
    "During assessment of an irritated stomach lining, the history includes repeated NSAID doses and substantial alcohol intake. Which risk history matters?",
    "A patient asks which habits may have contributed to gastritis after regular aspirin and alcohol use. Which exposure combination should the nurse identify?",
  ],
  GI_gastritis__mechanism: [
    "Repeated NSAID use damages a patient's gastric defense barrier. Which interaction between stomach contents and the lining permits erosion?",
    "A patient asks why loss of gastric mucosal protection leads to irritation. Which effect of luminal acid explains the injury?",
    "During teaching about NSAID-related gastritis, the nurse explains what happens when the protective barrier is inadequate. Which process causes mucosal damage?",
  ],
  GI_gastritis__signs: [
    "A patient with gastritis develops a change in vomit appearance. Which finding indicates possible bleeding from the gastric mucosa?",
    "During reassessment of nausea and epigastric discomfort, which emesis description should raise concern for mucosal hemorrhage?",
    "A patient treated for an inflamed stomach lining reports new vomiting. Which appearance suggests altered blood rather than uncomplicated nausea?",
  ],
  GI_gastritis__complications: [
    "A patient with autoimmune atrophic gastritis develops macrocytosis and tingling feet. Which nutrient deficiency best explains the blood and neurologic findings?",
    "During follow-up of autoimmune gastric atrophy, anemia with enlarged red cells accompanies numb fingers. Which deficiency should be evaluated?",
    "Longstanding autoimmune gastritis is followed by macrocytic anemia and paresthesias. Which vitamin deficit connects these complications?",
  ],
  GI_gastritis__tests: [
    "Persistent gastric symptoms require direct inspection of the stomach lining and possible tissue sampling. Which procedure provides both?",
    "A patient with continuing epigastric discomfort needs mucosal visualization and biopsy if abnormal tissue is seen. Which diagnostic examination is appropriate?",
    "The clinician plans to inspect suspected gastric inflammation and collect tissue when indicated. Which procedure should the nurse explain?",
  ],
  GI_gastritis__management: [
    "A patient with gastritis has confirmed H. pylori infection. Which treatment principle addresses the identified cause?",
    "After a positive H. pylori result in persistent gastritis, which prescribed approach is necessary beyond temporary symptom relief?",
    "A patient asks whether changing food choices alone will treat H. pylori-associated gastric inflammation. Which treatment principle should guide teaching?",
  ],
  GI_gastrectomy: [
    "After partial stomach surgery, a patient develops cramps, a rapid pulse, and dizziness 15 minutes after a sugary beverage. Which postoperative syndrome fits?",
    "A patient with altered gastric anatomy becomes lightheaded with palpitations and abdominal cramping 20 minutes after dessert. Which complication best matches the timing?",
    "Within half an hour of a sweet supplement after gastric surgery, a patient develops vasomotor symptoms and cramping. Which postoperative disorder is most likely?",
  ],
  GI_gastrectomy__risk: [
    "After total gastrectomy, a patient asks why long-term vitamin B12 supplementation may be needed. Which lost gastric function creates the risk?",
    "During teaching before complete stomach removal, which physiological change explains future vulnerability to B12 malabsorption?",
    "A patient without a stomach is counseled about lifelong nutritional monitoring. Which missing gastric product compromises vitamin B12 uptake?",
  ],
  GI_gastrectomy__mechanism: [
    "A concentrated meal rapidly enters the small bowel after gastric surgery, followed within minutes by dizziness and tachycardia. Which fluid shift explains early dumping?",
    "During teaching about early post-gastrectomy dumping, a patient asks why sweet drinks can cause faintness. Which rapid intestinal fluid movement is responsible?",
    "After partial gastrectomy, a hyperosmolar meal reaches the intestine quickly. Which circulatory effect explains immediate palpitations and lightheadedness?",
  ],
  GI_gastrectomy__signs: [
    "Two hours after dessert following gastric surgery, a patient becomes sweaty and shaky with low blood glucose. Which finding supports late dumping?",
    "A post-gastrectomy patient develops tremulousness and diaphoresis 90 minutes after a sweet meal; glucose is low. Which process accounts for the delayed symptoms?",
    "During follow-up after gastric surgery, symptoms occur two hours after concentrated sugars and testing confirms low glucose. Which late-dumping finding is present?",
  ],
  GI_gastrectomy__complications: [
    "Years after total gastrectomy, a patient has fatigue, enlarged red cells, and distal tingling. Which nutritional complication should be assessed?",
    "A patient without a stomach develops macrocytic anemia and numb feet during long-term follow-up. Which deficiency best explains this combination?",
    "During post-gastrectomy care, new paresthesias accompany fatigue and macrocytosis. Which long-term nutrient deficit is most relevant?",
  ],
  GI_gastrectomy__tests: [
    "A patient reports persistent fatigue after gastric resection. Which laboratory studies best assess anemia from iron or vitamin B12 deficiency?",
    "During nutritional follow-up after gastrectomy, which tests characterize the red-cell pattern and potential iron or B12 deficits?",
    "The team investigates chronic tiredness after stomach surgery. Which laboratory combination evaluates likely nutritional causes of anemia?",
  ],
  GI_gastrectomy__management: [
    "A patient develops early dumping after sweet meals following gastric surgery. Which meal pattern should be discussed with the dietitian?",
    "During dietary counseling for early post-gastrectomy dumping, which approach reduces the size and concentrated-sugar load of meals?",
    "A patient asks how to adjust eating habits after meal-triggered early dumping episodes. Which nutrition plan is generally appropriate?",
  ],
  GI_obstruction: [
    "A patient with cramps, vomiting, distension, and no flatus has CT showing dilated bowel ending at a transition point. Which diagnosis is established?",
    "After abdominal colic and obstipation develop, imaging identifies proximal intestinal dilation with a discrete transition point. Which problem explains the findings?",
    "A patient cannot pass gas and has distension with emesis. CT demonstrates a mechanical transition point and upstream bowel enlargement. Which condition is present?",
  ],
  GI_obstruction__risk: [
    "A patient with several prior laparotomies presents with small-bowel obstruction. Which cause is particularly associated with this operative history?",
    "During workup of an obstructed small bowel, a patient reports previous abdominal operations. Which postoperative process is especially relevant?",
    "A patient asks how abdominal surgery years earlier could contribute to a new bowel obstruction. Which cause should the nurse identify?",
  ],
  GI_obstruction__mechanism: [
    "A patient with complete small-bowel blockage becomes dehydrated while the bowel distends and vomiting continues. Which combined fluid-loss mechanism explains this?",
    "During obstruction teaching, a patient asks why circulation loses fluid even when the abdomen looks enlarged. Which sequestration and loss pattern is responsible?",
    "With a blocked intestine, fluid collects upstream and emesis continues. How does this lead to reduced circulating volume?",
  ],
  GI_obstruction__signs: [
    "A patient with suspected complete bowel obstruction has vomiting and progressive distension. Which additional bowel pattern supports failure of distal passage?",
    "During reassessment of an enlarged abdomen and persistent emesis, which report about stool and gas is consistent with complete obstruction?",
    "A patient being evaluated for bowel blockage has increasing girth. Which additional finding indicates that intestinal contents are not passing distally?",
  ],
  GI_obstruction__complications: [
    "A patient with bowel obstruction develops constant severe pain, fever, guarding, and a rising lactate level. Which complication is most concerning?",
    "Colicky obstruction pain becomes continuous as fever and peritoneal guarding appear with elevated lactate. Which dangerous complication should be suspected?",
    "During obstruction monitoring, severe persistent pain and systemic deterioration accompany abdominal guarding and increasing lactate. Which complication requires urgent evaluation?",
  ],
  GI_obstruction__tests: [
    "A patient with suspected mechanical obstruction needs localization of the transition point and assessment for complications. Which imaging study is commonly used?",
    "The clinician wants to define the level and possible ischemic complications of an intestinal blockage. Which diagnostic examination is appropriate?",
    "During urgent evaluation of vomiting and obstipation, which imaging study can identify a mechanical bowel obstruction and its location?",
  ],
  GI_obstruction__management: [
    "A patient with suspected bowel blockage is vomiting and cannot tolerate liquids. Which intake and supportive-care plan is appropriate during urgent evaluation?",
    "While a mechanical obstruction is assessed, ongoing emesis prevents oral hydration. Which plan addresses losses and accumulated gastrointestinal contents?",
    "During initial care for suspected intestinal obstruction with vomiting, which approach to oral intake, fluids, and decompression is appropriate?",
  ],
  GI_diverticulosis: [
    "Screening colonoscopy shows multiple small colonic pouches without inflammation; the patient has no fever or focal pain. Which condition describes this finding?",
    "A patient without focal tenderness or fever has incidental mucosal outpouchings in the colon. What anatomical diagnosis is present?",
    "During a nonacute colon examination, small pouches are seen without inflammatory changes or a mass. Which diagnosis fits this asymptomatic finding?",
  ],
  GI_diverticulosis__risk: [
    "A patient's diverticula arise where blood vessels penetrate the colonic muscle layer. Which property of these sites favors pouch formation?",
    "During diverticulosis teaching, a patient asks why pouches form at vascular entry points in the colon. Which anatomical feature explains the susceptibility?",
    "An older patient's colonic pouches develop at points of vessel passage through muscle. Which wall characteristic permits this change?",
  ],
  GI_diverticulosis__mechanism: [
    "A colon study demonstrates inner mucosal layers protruding through the muscular wall. Which process explains an acquired diverticular pouch?",
    "A patient asks how uncomplicated colonic diverticula form. Which movement of mucosa and submucosa through the bowel wall is responsible?",
    "During anatomical teaching, the nurse describes a diverticulum containing inner bowel layers beyond a weak muscle layer. Which mechanism is involved?",
  ],
  GI_diverticulosis__signs: [
    "A patient feels well but learns that screening colonoscopy found diverticula. Which statement accurately describes uncomplicated diverticulosis?",
    "During teaching after incidental discovery of colonic pouches, a patient asks why no symptoms occurred. Which response is accurate?",
    "An asymptomatic patient questions a diverticulosis finding on a colon examination. Which explanation about its usual presentation is appropriate?",
  ],
  GI_diverticulosis__complications: [
    "A patient with known colonic diverticula develops substantial painless hematochezia. Which complication should the nurse consider?",
    "During follow-up for diverticulosis, sudden large-volume rectal bleeding occurs without pain. Which complication best fits this presentation?",
    "A patient with previously documented colonic pouches passes a considerable amount of blood painlessly. Which complication is relevant?",
  ],
  GI_diverticulosis__tests: [
    "A patient undergoing an appropriate nonacute evaluation needs direct visualization of colonic diverticula. Which procedure can identify the pouches?",
    "During follow-up after incidental diverticulosis, a patient asks which examination directly viewed the colon's pouches. Which study provides that view?",
    "Outside an acute inflammatory episode, which procedure permits direct inspection of the colonic lumen for diverticula?",
  ],
  GI_diverticulosis__management: [
    "A patient with incidentally found uncomplicated diverticula asks whether an operation is mandatory. Which response accurately describes management?",
    "During counseling for asymptomatic diverticulosis, a patient worries that every pouch must be removed. Which explanation is appropriate?",
    "A patient without diverticular inflammation or complications asks whether the anatomical finding alone requires surgery. What should the nurse explain?",
  ],
  GI_hepatitisA: [
    "After a shared contaminated-food exposure, a patient develops nausea, dark urine, and jaundice with positive anti-HAV IgM. Which infection is confirmed?",
    "A patient with fatigue and jaundice after a restaurant outbreak has anti-HAV IgM detected. Which viral infection explains the illness?",
    "During a foodborne outbreak, a patient develops yellow sclera and dark urine; testing identifies anti-HAV IgM. Which infection is established?",
  ],
  GI_hepatitisA__risk: [
    "A household hepatitis A cluster follows eating food contaminated by stool. Which transmission route explains the shared exposure?",
    "A food handler with hepatitis A contaminates ready-to-eat food through inadequate hand hygiene. Which route places consumers at risk?",
    "Several people acquire hepatitis A after ingesting fecally contaminated water. Which route of viral transmission occurred?",
  ],
  GI_hepatitisA__mechanism: [
    "A patient with acute hepatitis A has elevated AST and ALT. Which liver process accounts for release of these enzymes?",
    "During hepatitis A teaching, a patient asks why aminotransferase levels rise. Which tissue injury explains the laboratory abnormality?",
    "An acute HAV infection produces markedly elevated aminotransferases. Which underlying organ process is reflected in the blood tests?",
  ],
  GI_hepatitisA__signs: [
    "A patient with acute HAV infection develops a change in skin color and urine. Which finding is consistent with disturbed bilirubin handling?",
    "During assessment of hepatitis A with fatigue and poor appetite, which appearance of the eyes and urine would support bilirubin accumulation?",
    "A patient recovering from hepatitis A asks which visible findings reflect impaired bilirubin processing. Which paired changes are consistent?",
  ],
  GI_hepatitisA__complications: [
    "A patient recovering from hepatitis A worries that lifelong chronic infection will develop. Which explanation about its course is correct?",
    "During follow-up after acute HAV illness, a patient asks whether continued viral hepatitis will usually persist for years. Which response is accurate?",
    "A patient with resolved hepatitis A asks whether it behaves like chronic hepatitis B or C. Which statement about HAV is correct?",
  ],
  GI_hepatitisA__tests: [
    "A patient develops jaundice after a recent HAV exposure. Which antibody result supports acute rather than past infection?",
    "The team suspects a recent hepatitis A infection in a patient with new nausea and dark urine. Which serologic marker is most relevant?",
    "During an acute hepatitis evaluation, which HAV serology indicates a recent infection rather than vaccine-associated immunity alone?",
  ],
  GI_hepatitisA__management: [
    "A stable patient with uncomplicated acute hepatitis A has nausea and fatigue. Which care plan supports recovery and limits additional hepatic injury?",
    "During home-care teaching for uncomplicated HAV illness, which hydration, nutrition, and liver-protection approach is appropriate?",
    "A patient with acute hepatitis A can tolerate some oral intake and has no liver failure. Which supportive treatment principle should guide care?",
  ],
  GI_hepatitisB: [
    "After evaluation for fatigue and jaundice, a patient has detectable HBsAg and HBV DNA. Which infection is established by these results?",
    "Testing after a blood exposure identifies surface antigen HBsAg and circulating HBV DNA. Which viral infection is present?",
    "A patient with elevated liver enzymes has positive HBsAg and detectable HBV DNA on follow-up. Which infection do these markers identify?",
  ],
  GI_hepatitisB__risk: [
    "A healthcare worker is punctured by a used needle containing HBV-infected blood. Which transmission route explains this exposure?",
    "During post-exposure evaluation after an HBV-positive blood needlestick, which route of viral entry is relevant?",
    "A patient asks why a contaminated needle injury creates hepatitis B risk. Which mode of transmission should the nurse explain?",
  ],
  GI_hepatitisB__mechanism: [
    "Persistent HBV infection causes inflammatory injury and elevated aminotransferases. Which organ tissue is primarily affected?",
    "During education about chronic hepatitis B, which tissue should the nurse identify as the principal site of viral-associated injury?",
    "A patient asks what part of the digestive system is inflamed during hepatitis B. Which tissue is the main target?",
  ],
  GI_hepatitisB__signs: [
    "A patient with acute hepatitis B has fatigue, nausea, and yellow sclera. Which urine finding would fit the bilirubin-related presentation?",
    "During assessment of acute HBV illness with scleral icterus, which accompanying change is consistent with impaired bilirubin handling?",
    "A patient with symptomatic hepatitis B reports jaundice and poor appetite. Which additional observation would be compatible with this illness?",
  ],
  GI_hepatitisB__complications: [
    "A patient with longstanding chronic HBV infection asks why liver-cancer surveillance is discussed. Which malignancy is a recognized long-term concern?",
    "During follow-up after many years of chronic hepatitis B, which primary hepatic cancer risk should the nurse recognize?",
    "A patient with persistent hepatitis B feels well but needs ongoing oncologic risk assessment. Which liver complication remains relevant?",
  ],
  GI_hepatitisB__tests: [
    "A screening panel returns positive for HBsAg. Which interpretation should guide further evaluation of this patient's infection status?",
    "A patient asks whether a positive hepatitis B surface antigen simply proves vaccination. Which interpretation is accurate?",
    "During review of a reactive HBsAg result, which conclusion is appropriate before characterizing duration and viral activity?",
  ],
  GI_hepatitisB__management: [
    "Susceptible household contacts of a patient with HBV ask how to gain specific protection against infection. Which intervention is relevant?",
    "A patient newly diagnosed with hepatitis B wants to protect uninfected, nonimmune family members. Which preventive measure should be discussed?",
    "During household-contact counseling for HBV, which intervention provides active virus-specific prevention for susceptible members?",
  ],
  GI_hepatitisB__HBV_HDV_compare: [
    "A patient asks why HDV infection depends on the presence of HBV. Which relationship between the viruses explains this requirement?",
    "During teaching about HBV and HDV coinfection, which viral component supplied by HBV makes the HDV life cycle possible?",
    "A learner reviews why hepatitis D occurs in association with hepatitis B. Which dependency correctly describes the two viruses?",
  ],
  GI_hepatitisC: [
    "After a prior blood exposure, a patient has reactive HCV antibodies and detectable HCV RNA. Which current infection is confirmed?",
    "A patient without obvious symptoms has positive HCV antibody testing followed by an RNA result showing active viremia. Which infection is present?",
    "During follow-up of a bloodborne-virus screen, HCV antibodies and HCV RNA are both detected. Which active infection does this establish?",
  ],
  GI_hepatitisC__risk: [
    "A patient with a positive HCV screen reports sharing needles and other injection supplies. Which exposure most directly explains the bloodborne risk?",
    "During hepatitis C counseling, the nurse learns that injection equipment was reused between people. Which behavior is the relevant transmission exposure?",
    "A patient asks which part of shared injection use creates HCV risk. Which contact with contaminated equipment should the nurse identify?",
  ],
  GI_hepatitisC__mechanism: [
    "Persistent untreated HCV is followed by increasing hepatic fibrosis. Which process connects chronic infection with cirrhotic remodeling?",
    "A patient asks how years of hepatitis C can scar the liver. Which relationship between ongoing injury and tissue repair explains progression?",
    "During education about chronic HCV, which mechanism explains why persistent hepatocellular injury can alter liver architecture?",
  ],
  GI_hepatitisC__signs: [
    "Screening reveals detectable HCV RNA in a patient who reports feeling completely well. Which interpretation of the lack of symptoms is appropriate?",
    "A patient with confirmed current HCV infection has no jaundice or discomfort. What should the nurse explain about clinically important infection?",
    "During follow-up of active hepatitis C discovered on screening, a patient believes feeling well excludes meaningful disease. Which interpretation is accurate?",
  ],
  GI_hepatitisC__complications: [
    "A patient with chronic HCV develops cirrhotic scarring. Which primary liver malignancy is a recognized long-term concern?",
    "During education about advanced hepatitis C fibrosis, which cancer complication explains the need for continued liver-risk assessment?",
    "Longstanding HCV has produced extensive hepatic remodeling. Which malignant outcome should the nurse recognize as a related complication?",
  ],
  GI_hepatitisC__tests: [
    "A patient has reactive HCV antibodies on screening. Which next test establishes whether current viremia is present?",
    "After a positive hepatitis C antibody result, a patient asks whether the virus is still present. Which test answers that question?",
    "A patient previously exposed to HCV has persistent antibodies. Which laboratory study distinguishes current infection from a cleared infection?",
  ],
  GI_hepatitisC__management: [
    "A patient with chronic HCV asks about the expected goal of prescribed direct-acting antiviral therapy. Which response accurately describes modern treatment?",
    "During hepatitis C counseling, a patient asks whether treatment can remove the virus rather than merely relieve symptoms. Which outcome is achievable for most treated patients?",
    "A patient considering HCV therapy wants to understand its purpose. Which statement describes the usual viral goal of direct-acting medicines?",
  ],
  GI_hepatitisD: [
    "A patient with chronic HBV develops worsening hepatic injury and detectable HDV RNA. Which additional viral infection is established?",
    "During investigation of deteriorating liver tests in chronic hepatitis B, HDV RNA is detected. Which superimposed infection is present?",
    "An HBsAg-positive patient has new hepatic deterioration and laboratory evidence of circulating HDV RNA. Which additional infection explains this finding?",
  ],
  GI_hepatitisD__risk: [
    "A patient sharing injection equipment already has chronic HBV. Which existing infection supplies the necessary background for hepatitis D susceptibility?",
    "During HDV risk assessment, a patient reports chronic viral hepatitis and injection exposure. Which underlying viral infection is necessary for usual HDV infection?",
    "A patient exposed to HDV asks why a pre-existing HBV infection matters. Which underlying infection creates the required susceptibility?",
  ],
  GI_hepatitisD__mechanism: [
    "A learner asks which HBV-derived component enables productive HDV infection. Which viral material is required?",
    "During hepatitis D education, the nurse explains that HDV needs an envelope component supplied by another virus. Which component is it?",
    "A patient asks what HBV provides to HDV during its life cycle. Which viral proteins are required for this dependency?",
  ],
  GI_hepatitisD__signs: [
    "After an HDV exposure, a patient with HBV develops greater fatigue, jaundice, and aminotransferase elevations. Which interpretation should guide further evaluation?",
    "A patient with chronic HBV has new worsening jaundice and liver enzymes following a potential HDV exposure. What should the nurse consider?",
    "During HBV follow-up, new hepatic deterioration occurs after exposure to HDV. Which evaluation is supported by the symptom and enzyme changes?",
  ],
  GI_hepatitisD__complications: [
    "A patient with chronic HBV acquires HDV and liver function worsens rapidly. Which long-term hepatic complication is a recognized concern?",
    "During counseling after HDV superinfection in chronic hepatitis B, which outcome explains the need for close liver monitoring?",
    "A patient asks whether HDV acquisition can intensify established HBV disease. Which complication should the nurse discuss?",
  ],
  GI_hepatitisD__tests: [
    "An HBsAg-positive patient has unexplained worsening hepatitis. Which additional testing can evaluate suspected HDV infection?",
    "The clinician suspects hepatitis D in a patient with chronic HBV and new hepatic deterioration. Which laboratory approach addresses the additional virus?",
    "During evaluation of possible HDV superinfection, which antibody and viral assay combination may be indicated?",
  ],
  GI_hepatitisD__management: [
    "An uninfected, susceptible patient asks how hepatitis B vaccination can also reduce HDV risk. Which explanation is accurate?",
    "During prevention counseling, a patient asks why avoiding HBV infection protects against hepatitis D. What should the nurse explain?",
    "A patient without HBV or HDV asks about the benefit of HBV immunization for hepatitis D prevention. Which mechanism explains the protection?",
  ],
  GI_hepatitisE: [
    "After drinking contaminated water, a patient develops acute jaundice and has detectable HEV RNA. Which viral infection is confirmed?",
    "A patient returning from travel has malaise and jaundice after an unsafe-water exposure; testing identifies HEV RNA. Which infection is present?",
    "During a waterborne outbreak, a patient with acute hepatitis has a positive HEV RNA result. Which infection is established?",
  ],
  GI_hepatitisE__risk: [
    "Several travelers develop hepatitis E after consuming water contaminated with stool. Which transmission pathway explains the cluster?",
    "A community HEV outbreak follows contamination of drinking water by sewage. Which route of infection is involved?",
    "During hepatitis E teaching after unsafe-water consumption, which route accounts for this exposure?",
  ],
  GI_hepatitisE__mechanism: [
    "A patient with acute HEV has elevated aminotransferases. Which disease process accounts for these hepatocellular enzyme results?",
    "During hepatitis E education, a patient asks why liver-cell enzymes appear in blood. Which inflammatory injury is responsible?",
    "Testing during acute HEV infection shows liver enzyme elevation. Which organ-level process does this finding reflect?",
  ],
  GI_hepatitisE__signs: [
    "A patient with acute hepatitis E has malaise and anorexia. Which visible bilirubin-related finding would fit symptomatic hepatitis?",
    "During assessment of HEV illness, which combination of skin and urine changes supports an acute-hepatitis presentation?",
    "A patient with confirmed hepatitis E asks which appearance changes may accompany fatigue and nausea. Which findings are consistent?",
  ],
  GI_hepatitisE__complications: [
    "A pregnant patient with suspected hepatitis E develops increasing jaundice and lethargy. Which potential complication makes urgent evaluation important?",
    "During pregnancy, acute HEV illness progresses to worsening alertness and deeper jaundice. Which severe outcome must be considered?",
    "A pregnant patient with hepatitis E becomes lethargic rather than improving. Which hepatic complication explains the need for prompt escalation?",
  ],
  GI_hepatitisE__tests: [
    "A patient develops acute hepatitis after an exposure compatible with HEV. Which virus-specific tests can support the suspected diagnosis?",
    "During evaluation of possible hepatitis E after contaminated-water exposure, which serologic or molecular studies are relevant?",
    "The clinician needs laboratory evidence of acute HEV infection. Which testing approach specifically addresses that virus?",
  ],
  GI_hepatitisE__management: [
    "A stable patient with uncomplicated acute HEV can drink but has poor appetite. Which supportive plan is appropriate while watching for deterioration?",
    "During home-care teaching for uncomplicated hepatitis E, which approach supports intake and detects worsening liver-related symptoms?",
    "A patient with acute hepatitis E has no current liver failure and tolerates fluids. Which plan addresses supportive care and ongoing safety assessment?",
  ],
  GI_cirrhosis: [
    "Evaluation after years of liver injury reveals bridging fibrosis, regenerative nodules, and distorted hepatic architecture. Which diagnosis describes these structural changes?",
    "A patient with chronic hepatic injury has diffuse nodular regeneration separated by fibrous bridges. Which disease has remodeled the liver?",
    "During assessment of longstanding liver disease, studies show regenerative nodules and widespread fibrosis disrupting normal architecture. Which diagnosis is established?",
  ],
  GI_cirrhosis__risk: [
    "A patient with years of untreated viral hepatitis develops progressive fibrosis. Which ongoing factor explains the risk of cirrhosis?",
    "During counseling about hepatic scarring, a patient asks why persistent viral hepatitis increases risk. Which chronic process is responsible?",
    "Longstanding untreated hepatitis is followed by increasing liver fibrosis. Which exposure pattern accounts for progression toward cirrhosis?",
  ],
  GI_cirrhosis__mechanism: [
    "Fibrotic nodules increase resistance to blood moving through a patient's liver. Which upstream hemodynamic consequence can develop?",
    "A patient asks how cirrhotic architectural distortion changes portal circulation. Which pressure complication follows increased intrahepatic resistance?",
    "During cirrhosis teaching, the nurse explains that portal blood meets increased resistance in scarred tissue. Which vascular consequence results?",
  ],
  GI_cirrhosis__signs: [
    "A previously stable cirrhotic patient develops abdominal enlargement, ankle edema, and yellow sclera. Which interpretation warrants clinical assessment?",
    "During liver follow-up, new fluid retention and scleral icterus appear in a patient with cirrhosis. How should these findings be interpreted?",
    "A patient with known cirrhosis reports new swelling and abdominal distension with jaundice. Which change in disease status should be considered?",
  ],
  GI_cirrhosis__complications: [
    "After a gastrointestinal hemorrhage, a patient with cirrhosis becomes newly confused. Which complication may have been precipitated?",
    "A cirrhotic patient develops inattention following upper-GI blood loss. Which liver-related neurologic complication should be considered?",
    "During recovery from GI bleeding, a patient with advanced hepatic disease has worsening orientation. Which complication is consistent with this trigger?",
  ],
  GI_cirrhosis__tests: [
    "A patient with cirrhosis bruises easily, raising concern about clotting-protein synthesis. Which laboratory test helps assess this function?",
    "During evaluation of impaired liver synthetic capacity, which coagulation result is relevant in a patient with unexplained bruising?",
    "The clinician wants to assess hepatic contribution to coagulation in chronic liver disease. Which laboratory measure reflects clotting-factor function?",
  ],
  GI_cirrhosis__management: [
    "A patient with mild cirrhosis symptoms asks why alcohol avoidance and ongoing complication care still matter. Which explanation is appropriate?",
    "During liver-disease counseling, a patient thinks few symptoms mean alcohol can safely continue. Which treatment goal should the nurse explain?",
    "A patient with cirrhosis asks what abstinence and continued follow-up aim to accomplish. Which response describes the purpose accurately?",
  ],
  GI_cirrhosis__ascites_cascade: [
    "A cirrhotic patient retains renal sodium despite excess peritoneal fluid and has splanchnic vasodilation. Which circulatory mechanism explains this apparent contradiction?",
    "During ascites teaching, a patient asks why the kidneys conserve sodium while the abdomen contains excess fluid. How does splanchnic vasodilation contribute?",
    "A patient with portal hypertension has dilated splanchnic vessels and sodium retention despite increasing ascites. Which explanation connects effective circulation with renal responses?",
  ],
  GI_cirrhosis__varices_cascade: [
    "Portal flow bypasses a scarred liver through lower-esophageal collateral vessels. Which pressure-and-flow change causes these veins to enlarge?",
    "A patient asks why collateral veins expand when portal blood cannot traverse cirrhotic tissue easily. Which change in the collateral circulation explains varices?",
    "During cirrhosis education, the nurse describes blood rerouting into esophageal veins. Which hemodynamic change stretches these collateral channels?",
  ],
  GI_cirrhosis__bleeding_cascade: [
    "A patient with cirrhosis develops bruising and a prolonged INR. Which loss of hepatic synthetic function contributes to the abnormal clotting test?",
    "During liver-disease follow-up, easy bruising accompanies delayed coagulation on INR testing. Which hepatic production problem helps explain these findings?",
    "A cirrhotic patient asks how liver dysfunction can contribute to prolonged clotting time. Which change in protein production is relevant?",
  ],
  GI_cirrhosis__encephalopathy_cascade: [
    "After portosystemic shunting, a patient develops worsening attention and asterixis. Which effect of bypassing hepatic processing explains the neurologic risk?",
    "A patient with portal blood diverted around the liver becomes inattentive and develops flapping hand movements. How does the bypass affect intestinal neuroactive substances?",
    "During teaching about shunt-related confusion in cirrhosis, which route allows gut-derived substances to influence the brain?",
  ],
  GI_jaundice: [
    "A patient has elevated bilirubin with yellow discoloration of the sclera and skin. Which term describes this clinical finding?",
    "During physical assessment, the nurse notes yellow sclera in a patient with hyperbilirubinemia. What finding should be documented?",
    "A patient's skin and eyes appear yellow as serum bilirubin rises. Which clinical sign does this appearance represent?",
  ],
  GI_jaundice__risk: [
    "A common bile duct stone blocks drainage and a patient becomes jaundiced. Which etiologic category best classifies the bilirubin disturbance?",
    "Imaging confirms a duct stone obstructing bile flow in a jaundiced patient. Which category explains the jaundice?",
    "During jaundice evaluation, the team identifies a mechanical blockage beyond the liver from a bile duct stone. Which category applies?",
  ],
  GI_jaundice__mechanism: [
    "A bile duct obstruction raises conjugated bilirubin and the patient's urine becomes dark. Which property permits this pigment to enter urine?",
    "A patient with obstructive jaundice asks why bilirubin appears in urine. Which characteristic of conjugated bilirubin explains the finding?",
    "During teaching about dark urine from blocked bile drainage, which bilirubin-handling mechanism should the nurse describe?",
  ],
  GI_jaundice__signs: [
    "A patient with biliary obstruction has dark urine. Which stool appearance would support reduced intestinal delivery of bile pigment?",
    "During assessment of obstructive jaundice, which new stool color is consistent with diminished bile entering the bowel?",
    "A patient asks how blocked bile flow can affect bowel movements. Which stool change accompanies reduced pigment delivery?",
  ],
  GI_jaundice__complications: [
    "A patient with obstructive jaundice develops rigors, fever, and right-upper-quadrant pain. Which complication requires urgent evaluation?",
    "During observation for a blocked bile duct, jaundice is joined by fever and shaking chills with right-sided upper abdominal pain. Which infection is concerning?",
    "A jaundiced patient with known biliary obstruction becomes febrile and acutely ill with right-upper abdominal pain. Which complication should be suspected?",
  ],
  GI_jaundice__tests: [
    "A patient with new yellow sclera has fractionated bilirubin and liver enzymes ordered. Which differing disease patterns can these results help distinguish?",
    "During jaundice evaluation, a patient asks why several liver and bilirubin tests are needed. Which processes are assessed by their patterns?",
    "The nurse explains the purpose of direct and indirect bilirubin with liver enzymes in jaundice. Which categories of dysfunction do the patterns help evaluate?",
  ],
  GI_jaundice__management: [
    "A patient with jaundice has a confirmed obstructing bile duct stone. Which care goal addresses the cause rather than the visible color change alone?",
    "During teaching about stone-related obstructive jaundice, which management principle should the nurse emphasize?",
    "A patient asks whether waiting for the yellow skin to fade is enough after imaging confirms blocked bile drainage. Which response is appropriate?",
  ],
  GI_cholelithiasis: [
    "A patient has discrete post-meal right-upper abdominal pain, and ultrasound shows gallstones without wall inflammation. Which diagnosis is established?",
    "After recurrent fatty-meal pain, ultrasound identifies gallbladder calculi but no inflammatory wall changes. Which condition best fits?",
    "A patient is comfortable between episodes of biliary-type pain; imaging shows stones within a noninflamed gallbladder. Which diagnosis is present?",
  ],
  GI_cholelithiasis__risk: [
    "A patient develops cholesterol gallstones during rapid weight loss. Which bile-composition and gallbladder-function changes contribute to the risk?",
    "During counseling about gallstones after rapid weight reduction, which combination favors cholesterol precipitation and stasis?",
    "A patient asks why rapid loss of body weight can promote cholesterol stones. Which bile and emptying changes are relevant?",
  ],
  GI_cholelithiasis__mechanism: [
    "A meal stimulates gallbladder contraction while a stone temporarily blocks the cystic duct. Which mechanism causes biliary pain?",
    "A patient asks why a gallstone causes pain during gallbladder emptying after food. Which pressure-generating event explains biliary colic?",
    "During a transient cystic duct blockage, gallbladder contraction produces an episode of pain. Which mechanical process accounts for it?",
  ],
  GI_cholelithiasis__signs: [
    "A patient is comfortable between attacks of post-meal abdominal pain. Which symptom distribution is compatible with gallstone-related biliary colic?",
    "During gallstone assessment, which pattern of pain location and timing fits episodic biliary colic?",
    "A patient reports intermittent abdominal discomfort after meals with symptom-free intervals. Which pain pattern supports a biliary source?",
  ],
  GI_cholelithiasis__complications: [
    "A gallstone moves from the gallbladder into the common bile duct and jaundice appears. Which complication explains the blocked drainage?",
    "After a stone migrates into the common duct, a patient's bilirubin rises and skin yellows. Which diagnosis describes this complication?",
    "A patient with gallstones develops jaundice and imaging shows a stone lodged in the common bile duct. Which complication is present?",
  ],
  GI_cholelithiasis__tests: [
    "A patient with recurrent biliary-type pain needs an initial study for suspected gallstones. Which imaging examination is commonly selected?",
    "During workup of post-meal right-upper-quadrant pain, which initial imaging study can identify gallbladder calculi?",
    "The clinician suspects gallstones in an adult with recurrent biliary pain. Which diagnostic imaging approach should the nurse anticipate first?",
  ],
  GI_cholelithiasis__management: [
    "Recurrent symptomatic gallstones prompt discussion of definitive treatment. Which procedure may be recommended after appropriate assessment?",
    "A patient has repeated biliary colic from gallbladder stones and asks which operation removes the source. Which procedure is relevant?",
    "During surgical consultation for recurring symptomatic gallstones, which procedure is commonly considered to prevent further gallbladder episodes?",
  ],
  GI_cholecystitis: [
    "A patient with persistent right-upper-quadrant pain and fever stops inspiration during palpation; ultrasound shows stones and wall thickening. Which diagnosis fits?",
    "Fever and sustained right-upper abdominal tenderness accompany gallstones and an inflamed thickened gallbladder wall on ultrasound. Which disease is most consistent?",
    "During evaluation of prolonged right-upper-quadrant pain, inspiratory tenderness and fever accompany gallbladder stones with wall thickening. Which diagnosis is supported?",
  ],
  GI_cholecystitis__risk: [
    "A gallstone remains lodged in the cystic duct and acute gallbladder inflammation follows. Which initiating event caused calculous cholecystitis?",
    "During teaching about gallbladder inflammation, a patient asks how an impacted stone starts the process. Which persistent blockage is responsible?",
    "A patient develops calculous cholecystitis after a stone stops leaving the gallbladder outlet. Which event initiated the disease?",
  ],
  GI_cholecystitis__mechanism: [
    "A gallbladder remains distended behind a blocked outlet. Which pressure-related process contributes to wall inflammation and tissue injury?",
    "During cholecystitis teaching, a patient asks how prolonged obstruction can damage the gallbladder. Which effect of distension explains the risk?",
    "An obstructed gallbladder continues enlarging. Which local circulatory change can cause inflammatory wall injury?",
  ],
  GI_cholecystitis__signs: [
    "During palpation beneath the right costal margin, a patient abruptly stops inhaling because of pain. Which examination sign is present?",
    "The nurse asks a patient to inspire while the right upper abdomen is palpated; pain causes inspiratory arrest. What is this sign called?",
    "A patient with suspected gallbladder inflammation catches the breath during right-upper-quadrant palpation. Which named finding should be documented?",
  ],
  GI_cholecystitis__complications: [
    "A patient with untreated gallbladder inflammation develops peritoneal signs and imaging evidence of wall necrosis. Which complication is suspected?",
    "During cholecystitis monitoring, worsening pain and guarding accompany concern for devitalized gallbladder tissue. Which complication requires urgent assessment?",
    "A patient with acute cholecystitis develops systemic deterioration and peritoneal irritation with possible wall necrosis. Which severe complication is concerning?",
  ],
  GI_cholecystitis__tests: [
    "A patient with suspected cholecystitis undergoes ultrasound. Which combination supports gallbladder inflammation rather than stones alone?",
    "During imaging review for acute gallbladder disease, which ultrasound findings indicate calculi accompanied by inflammatory changes?",
    "The nurse reviews a right-upper-quadrant ultrasound in a febrile patient. Which findings support acute cholecystitis?",
  ],
  GI_cholecystitis__management: [
    "A patient admitted with acute cholecystitis has vomiting and fever while surgery is considered. Which supportive and cause-directed plan is appropriate?",
    "During surgical evaluation for febrile gallbladder inflammation, ongoing emesis limits intake. Which prescribed care approach should the nurse anticipate?",
    "A patient with acute cholecystitis needs inpatient management of pain, fluid loss, and possible infection. Which plan addresses these needs?",
  ],
  GI_pancreatitis: [
    "A patient develops severe epigastric pain extending to the back and vomiting, with lipase four times the upper reference limit. Which diagnosis best fits?",
    "During evaluation of intense upper abdominal pain radiating posteriorly, a patient has emesis and lipase greater than three times normal. Which disorder is most consistent?",
    "A patient with severe back-radiating epigastric pain cannot keep food down; blood testing shows lipase five times the upper limit. Which diagnosis explains the findings?",
  ],
  GI_pancreatitis__risk: [
    "A patient with gallstones develops pancreatic inflammation after a stone migrates distally. Which obstruction mechanism links gallstones with pancreatitis?",
    "During teaching about gallstone pancreatitis, a patient asks how a biliary stone can affect the pancreas. Which drainage problem explains the connection?",
    "A migrating gallstone is associated with acute pancreatic injury. Which blockage near the shared duct outlet can initiate this complication?",
  ],
  GI_pancreatitis__mechanism: [
    "A patient asks why digestive enzymes can injure the pancreas during acute inflammation. Which abnormal activation process explains local tissue damage?",
    "During pancreatitis teaching, the nurse describes autodigestive injury. Which change in the timing and location of enzyme activation is responsible?",
    "An inflamed pancreas develops tissue destruction from its own secretions. Which mechanism permits digestive enzymes to damage the gland?",
  ],
  GI_pancreatitis__signs: [
    "A patient with acute pancreatitis has intense epigastric pain radiating into the back. Which gastrointestinal symptom commonly accompanies this pain?",
    "During assessment of pancreatic inflammation with severe upper abdominal pain, which additional symptom pattern should the nurse expect?",
    "A patient with confirmed acute pancreatitis reports posteriorly radiating epigastric pain. Which accompanying complaint is common?",
  ],
  GI_pancreatitis__complications: [
    "Several weeks after pancreatitis, a patient has a persistent encapsulated fluid collection adjacent to the pancreas. Which post-inflammatory complication fits?",
    "During follow-up after pancreatic inflammation, imaging shows a mature localized fluid collection persisting beside the gland. Which complication is most consistent?",
    "A patient recovering from pancreatitis has an encapsulated peripancreatic fluid collection that remains after several weeks. Which complication should the nurse recognize?",
  ],
  GI_pancreatitis__tests: [
    "A patient with severe epigastric pain is being evaluated for acute pancreatic inflammation. Which serum laboratory finding supports pancreatic injury?",
    "During workup of possible acute pancreatitis, which blood enzyme result provides relevant evidence of pancreatic damage?",
    "The clinician suspects pancreatic inflammation in a patient with back-radiating abdominal pain. Which laboratory abnormality supports the suspicion?",
  ],
  GI_pancreatitis__management: [
    "A patient admitted with pancreatitis has tachycardia and ongoing emesis. Which monitoring priorities address early severity and organ risks?",
    "During initial pancreatitis care, a patient continues vomiting with a rapid pulse. Which nursing assessment plan best identifies deterioration?",
    "A patient with acute pancreatitis needs early inpatient reassessment beyond pain relief. Which fluid, perfusion, and organ-status monitoring is appropriate?",
  ],
  GI_colorectal_cancer: [
    "A patient with iron-deficiency anemia and changed bowel habits has a colonic mass whose biopsy shows adenocarcinoma. Which diagnosis is established?",
    "Persistent alteration in stool pattern and anemia lead to colonoscopy; biopsy of a colonic lesion confirms invasive adenocarcinoma. Which condition is present?",
    "During evaluation of occult blood loss and bowel-habit change, a colonic mass is sampled and malignant adenocarcinoma is found. Which diagnosis fits?",
  ],
  GI_colorectal_cancer__risk: [
    "A patient with decades of ulcerative colitis asks why surveillance continues even during remission. Which cancer-risk association is relevant?",
    "During counseling about longstanding inflammatory colonic disease, which reason explains increased colorectal malignancy surveillance?",
    "A patient with chronic UC questions why the colon is checked for dysplasia. Which relationship between sustained inflammation and malignancy explains the concern?",
  ],
  GI_colorectal_cancer__mechanism: [
    "Pathology shows that a colonic adenoma has progressed to invasive carcinoma. Which cellular behavior distinguishes invasion from a lesion confined to epithelium?",
    "During teaching about an invasive colonic malignancy, which crossing of tissue boundaries explains the term invasive?",
    "A patient asks what changed when an epithelial colon lesion became invasive cancer. Which deeper tissue behavior defines this progression?",
  ],
  GI_colorectal_cancer__signs: [
    "An older patient has unexplained iron-deficiency anemia and a positive occult-stool-blood test. Which concern warrants investigation?",
    "During evaluation of fatigue, iron depletion and hidden blood in stool are found. Which possible chronic source requires further assessment?",
    "A patient without visible rectal bleeding has iron-deficiency anemia and repeated occult blood detection. Which clinical concern remains relevant?",
  ],
  GI_colorectal_cancer__complications: [
    "A patient with a known colonic malignancy develops vomiting, cramping, distension, and inability to pass stool. Which complication is suspected?",
    "During cancer follow-up, a patient with a colon tumor develops progressive obstipation and abdominal enlargement with emesis. Which complication best fits?",
    "A colonic tumor is followed by colicky pain, vomiting, and failure to pass stool. Which mechanical complication should the nurse recognize?",
  ],
  GI_colorectal_cancer__tests: [
    "Imaging identifies a suspicious colonic lesion. Which procedure obtains tissue to establish whether it is malignant?",
    "A patient needs histologic confirmation of a suspected colon tumor. Which examination permits direct lesion sampling?",
    "During workup of a suspicious colonic mass, which procedure supplies the biopsy material needed for diagnosis?",
  ],
  GI_colorectal_cancer__management: [
    "A patient newly diagnosed with colorectal malignancy asks why staging is needed before choosing therapy. Which purpose should the nurse explain?",
    "Before treatment selection for a biopsy-confirmed colon cancer, the team orders staging studies. What information do these studies provide?",
    "During cancer counseling, a patient asks why the biopsy result alone does not determine the full treatment plan. Which role of staging is relevant?",
  ],
  GI_pancreatic_cancer: [
    "Progressive painless jaundice and weight loss lead to discovery of a pancreatic-head mass whose biopsy shows adenocarcinoma. Which diagnosis is confirmed?",
    "A patient with painless worsening jaundice has a solid mass in the pancreatic head and biopsy-proven adenocarcinoma. Which malignancy explains the findings?",
    "During evaluation of weight loss and painless cholestatic jaundice, imaging finds a pancreatic-head lesion and tissue confirms adenocarcinoma. Which diagnosis fits?",
  ],
  GI_pancreatic_cancer__risk: [
    "A patient with long-term cigarette use and chronic pancreatic inflammation asks about pancreatic cancer susceptibility. Which risk factors are relevant?",
    "During cancer-risk counseling, a patient reports smoking for years and longstanding pancreatitis. Which exposures should the nurse associate with pancreatic malignancy?",
    "A patient asks which parts of a history of tobacco use and chronic pancreatitis increase pancreatic cancer concern. Which factor combination matters?",
  ],
  GI_pancreatic_cancer__mechanism: [
    "A pancreatic-head mass compresses the common bile duct and jaundice develops. Which process explains the bilirubin accumulation?",
    "A patient asks how a tumor in the pancreatic head can yellow the skin. Which effect on biliary drainage is responsible?",
    "During teaching about a pancreatic-head malignancy, which mechanism links external bile-duct compression with jaundice?",
  ],
  GI_pancreatic_cancer__signs: [
    "A patient with pancreatic malignancy has poor appetite and progressive jaundice. Which nutritional trend is consistent with the illness?",
    "During assessment of pancreatic cancer, which additional body-weight change would fit progressive malignant disease?",
    "A patient with a pancreatic tumor reports reduced appetite and increasing jaundice. Which accompanying finding should the nurse assess for?",
  ],
  GI_pancreatic_cancer__complications: [
    "A patient with cancer in the pancreatic head has yellow sclera, dark urine, and pale stools. Which complication explains this pigment pattern?",
    "During pancreatic cancer care, pale bowel movements and dark urine accompany worsening jaundice. Which complication is present?",
    "A pancreatic-head tumor is followed by conjugated-pigment dark urine and diminished stool color with jaundice. Which drainage complication is likely?",
  ],
  GI_pancreatic_cancer__tests: [
    "A pancreatic lesion needs targeted tissue sampling through the gastric or duodenal wall under ultrasound guidance. Which procedure provides this?",
    "The clinician plans an ultrasound-guided biopsy of a pancreatic mass using an endoscope from the stomach. Which technique is being described?",
    "During pancreatic tumor evaluation, which endoscopic procedure can guide a needle through the stomach or duodenum into the lesion?",
  ],
  GI_pancreatic_cancer__management: [
    "A patient asks why pancreatic surgery depends on assessment of nearby vessels and distant spread. Which explanation addresses resectability?",
    "Before deciding whether a pancreatic tumor can be removed, the team evaluates invasion and metastases. Why is this necessary?",
    "During treatment planning for pancreatic cancer, a patient questions why surgery is not chosen before staging and vascular review. Which rationale is accurate?",
  ],
  GI_liver_cancer: [
    "In a cirrhotic patient, a new solid hepatic lesion shows arterial enhancement and portal-venous washout; evaluation establishes a hepatocyte-derived malignancy. Which diagnosis fits?",
    "A patient with cirrhosis has a liver mass with arterial-phase enhancement followed by portal-venous washout, confirmed as a primary hepatocellular malignancy. Which diagnosis is present?",
    "Surveillance in cirrhosis detects a solid hepatic mass showing arterial enhancement with later portal-venous washout. Evaluation confirms a hepatocyte-origin cancer. Which diagnosis explains it?",
  ],
  GI_liver_cancer__risk: [
    "A patient with chronic HBV asks why surveillance for a primary liver cancer is recommended. Which viral history creates a recognized risk?",
    "During liver-cancer prevention counseling, a patient has longstanding hepatitis B infection. Which chronic infection is relevant to hepatocellular malignancy risk?",
    "A patient asks why chronic HBV changes the need for hepatic cancer assessment. Which infection-related risk factor should the nurse identify?",
  ],
  GI_liver_cancer__mechanism: [
    "Repeated hepatocyte death and regeneration occur during chronic liver disease before cancer develops. Which process connects these cycles with malignancy?",
    "During teaching about primary liver cancer, a patient asks how years of repeated injury and repair increase risk. Which cellular mechanism is relevant?",
    "A chronically inflamed liver undergoes ongoing cell loss and replacement. How can this environment promote malignant transformation?",
  ],
  GI_liver_cancer__signs: [
    "A patient with cirrhosis develops unexplained weight loss and new right-upper-quadrant discomfort with worsening liver symptoms. Which response is appropriate?",
    "During cirrhosis follow-up, new hepatic-region discomfort and weight loss appear. What should this change prompt?",
    "A previously stable cirrhotic patient reports unintentional weight loss and increasing right-upper abdominal fullness. Which assessment approach is appropriate?",
  ],
  GI_liver_cancer__complications: [
    "A patient with hepatocellular malignancy develops increasing ascites and declining hepatic function. Which consequence should the nurse recognize?",
    "During liver cancer care, worsening peritoneal fluid and impaired synthetic function appear. Which complication is relevant?",
    "A patient with primary liver cancer has progressive ascites and deteriorating liver function. Which type of clinical decline is occurring?",
  ],
  GI_liver_cancer__tests: [
    "Surveillance ultrasound finds a new liver lesion in a high-risk patient. Which next diagnostic approach appropriately characterizes the lesion?",
    "A cirrhotic patient has a newly identified hepatic nodule. Which imaging principle guides further evaluation rather than relying on AFP alone?",
    "During cancer surveillance, a new hepatic mass is detected. Which follow-up assessment should be used to define its diagnostic features?",
  ],
  GI_liver_cancer__management: [
    "A patient with HCC asks why the clinician assesses liver reserve as well as tumor stage. Which factor influences treatment safety and available options?",
    "During planning for hepatocellular cancer therapy, why must the team consider the function of the remaining liver?",
    "A patient asks why two people with similarly staged liver tumors may receive different treatments. Which role of underlying hepatic function explains this?",
  ],
  GI_gastric_cancer: [
    "A patient with early fullness, epigastric discomfort, and weight loss has a stomach mass whose endoscopic biopsy shows adenocarcinoma. Which diagnosis is confirmed?",
    "Persistent early satiety and declining weight prompt endoscopy; a gastric lesion is biopsied and adenocarcinoma is found. Which malignancy is present?",
    "During investigation of weight loss and upper abdominal discomfort, biopsy of a stomach mass establishes adenocarcinoma. Which diagnosis fits the location and histology?",
  ],
  GI_gastric_cancer__risk: [
    "A patient with longstanding H. pylori infection and chronic atrophic gastritis asks about related cancer risk. Which malignancy is relevant?",
    "During counseling about chronic H. pylori-associated gastric atrophy, which cancer should the nurse connect with this history?",
    "A patient asks why chronic atrophic gastritis from H. pylori warrants attention. Which malignancy risk is associated with this gastric inflammatory history?",
  ],
  GI_gastric_cancer__mechanism: [
    "A gastric tumor narrows the outlet as it invades the wall, and a patient vomits retained food. Which mechanical process explains the vomiting?",
    "During teaching about a stomach carcinoma near the pylorus, a patient asks why old food returns in emesis. Which effect of tumor growth is responsible?",
    "A gastric malignancy progressively reduces the outlet diameter. How does this narrowing produce gastric food retention?",
  ],
  GI_gastric_cancer__signs: [
    "A patient loses weight and says a few bites create the sensation of having eaten a full meal. What is this symptom called?",
    "During gastric evaluation, a patient reports becoming full unusually soon after starting meals. Which term describes this finding?",
    "A patient cannot finish meals because fullness develops after only a small amount of food. Which symptom should the nurse document?",
  ],
  GI_gastric_cancer__complications: [
    "A patient with gastric cancer repeatedly vomits food eaten many hours earlier and has fullness with poor intake tolerance. Which complication should be assessed?",
    "During stomach cancer care, retained-food emesis and inability to tolerate meals become persistent. Which mechanical complication is concerning?",
    "A patient with a gastric malignancy develops abdominal fullness and recurrent vomiting of old food. Which outlet complication best fits?",
  ],
  GI_gastric_cancer__tests: [
    "A suspicious stomach lesion needs confirmation of malignant histology. Which test supplies the tissue diagnosis?",
    "During evaluation of a gastric mass, which procedure and analysis establish whether cancer cells are present?",
    "A patient asks how the team will determine whether an abnormal gastric lesion is malignant. Which diagnostic approach is required?",
  ],
  GI_gastric_cancer__management: [
    "A patient with gastric cancer asks why nutrition is assessed before treatment begins. Which effect of the disease makes this important?",
    "During treatment planning for stomach cancer, early fullness and poor intake prompt a dietitian assessment. Which rationale explains this evaluation?",
    "A patient questions the need for nutritional review alongside gastric cancer staging. Which risk from impaired intake and gastric function is relevant?",
  ],
  GI_celiac: [
    "A patient with chronic diarrhea, weight loss, and iron deficiency has positive celiac-specific serology and duodenal villous atrophy. Which disorder explains the findings?",
    "Evaluation of nutrient loss reveals duodenal villous atrophy and positive tissue transglutaminase antibodies in a patient consuming gluten. Which disease is supported?",
    "During workup of chronic loose stools and iron deficiency, positive celiac-specific antibodies accompany biopsy-proven villous atrophy. Which diagnosis fits?",
  ],
  GI_celiac__risk: [
    "A patient with gluten-associated chronic diarrhea reports an affected sibling with celiac disease. Which background factor increases susceptibility?",
    "During celiac evaluation, the history reveals that a parent has the disease. Which familial factor is relevant to the patient's risk?",
    "A patient develops chronic loose stools while eating gluten and has a first-degree relative with confirmed celiac disease. Which risk history matters?",
  ],
  GI_celiac__mechanism: [
    "Gluten-associated villous atrophy is found in a patient with celiac disease. Which change in small-intestinal structure reduces nutrient uptake?",
    "A patient asks how damaged villi cause malabsorption in celiac disease. Which loss of effective intestinal surface explains the deficit?",
    "During celiac teaching, the nurse explains why flattened intestinal villi impair nutrition. Which absorptive change is responsible?",
  ],
  GI_celiac__signs: [
    "A patient with untreated celiac disease has fatigue, loose stools, and declining weight. Which blood finding supports nutrient malabsorption?",
    "During evaluation of ongoing diarrhea in celiac disease, which anemia pattern is consistent with impaired intestinal nutrient uptake?",
    "A patient consuming gluten despite celiac disease reports progressive weight loss and tiredness. Which nutritional finding would support malabsorption?",
  ],
  GI_celiac__complications: [
    "A patient with untreated celiac disease has bone pain and low vitamin D. Which nutrient-absorption mechanism explains the skeletal risk?",
    "During celiac follow-up, poor bone mineralization accompanies a vitamin D deficit. Which intestinal consequence contributes to this complication?",
    "A patient with active celiac malabsorption asks why bone health is being assessed. Which vitamin and mineral deficit can impair mineralization?",
  ],
  GI_celiac__tests: [
    "A patient with possible celiac disease continues eating gluten during evaluation. Which initial antibody test, paired with IgA assessment, is commonly used?",
    "Before starting a gluten-free diet, a patient needs celiac serology. Which blood-test combination accounts for possible IgA deficiency?",
    "During initial evaluation of suspected gluten-related enteropathy while gluten intake continues, which serologic approach is appropriate?",
  ],
  GI_celiac__management: [
    "A patient with biopsy-confirmed celiac disease asks which dietary change removes the immune trigger. Which instruction is correct?",
    "During nutrition teaching for celiac disease, which long-term diet directly addresses the exposure causing intestinal injury?",
    "A patient asks whether simply reducing lactose treats the underlying process in celiac disease. Which dietary instruction targets the cause?",
  ],
  GI_CF: [
    "A patient with cystic fibrosis loses weight despite good intake and passes bulky greasy stools. Which digestive complication most likely causes the nutrient loss?",
    "During cystic fibrosis follow-up, an adolescent has oily stools and poor weight gain despite a strong appetite. Which pancreatic digestive problem fits?",
    "A patient with CF reports persistent fatty stool and weight loss while eating adequate meals. Which complication best explains the maldigestion?",
  ],
  GI_CF__risk: [
    "A child inherits disease-causing CFTR variants from both parents. Which epithelial transport abnormality contributes to pancreatic disease?",
    "During counseling about inherited cystic fibrosis, a family asks how the CFTR defect affects secretions. Which salt-and-water transport mechanism is relevant?",
    "A patient asks why inherited CFTR dysfunction can lead to thick pancreatic secretions. Which epithelial process is altered?",
  ],
  GI_CF__mechanism: [
    "Thick CF secretions plug pancreatic ducts in a patient with fatty stools. Which change in enzyme delivery explains poor fat digestion?",
    "A patient asks why pancreatic duct blockage in cystic fibrosis causes maldigestion. Which effect on intestinal digestive enzymes is responsible?",
    "During CF teaching, the nurse explains how obstructed pancreatic ducts interfere with dietary fat processing. Which delivery deficit occurs?",
  ],
  GI_CF__signs: [
    "A patient with CF-related pancreatic dysfunction has oily stools despite adequate dietary intake. Which growth or weight trend supports inadequate assimilation?",
    "During CF nutrition review, reported calories are sufficient but stool remains greasy. Which additional finding suggests nutrients are not being effectively used?",
    "A child with pancreatic insufficiency eats enough but continues passing fatty stools. Which growth finding warrants concern about maldigestion?",
  ],
  GI_CF__complications: [
    "A patient with poorly treated CF pancreatic insufficiency develops poor night vision and low vitamin levels. Which vitamin group is particularly threatened?",
    "During CF maldigestion follow-up, night-vision impairment raises concern about vitamin loss. Which deficiency pattern is associated with impaired fat digestion?",
    "A patient with ongoing fatty stools from CF has low nutrient levels and difficulty seeing in dim light. Which vitamin group needs assessment?",
  ],
  GI_CF__tests: [
    "A patient with cystic fibrosis needs assessment of pancreatic exocrine output using a stool marker. Which measurement is relevant?",
    "During workup of CF-related maldigestion, which fecal enzyme measurement helps assess pancreatic insufficiency?",
    "The clinician suspects inadequate pancreatic enzyme output in a CF patient with greasy stools. Which stool test can support this assessment?",
  ],
  GI_CF__management: [
    "A patient with pancreatic insufficiency asks when prescribed digestive enzymes should be taken relative to food. Which instruction is appropriate?",
    "During CF medication teaching, the nurse explains how enzyme doses must mix with nutrients. When should replacement be administered?",
    "A patient takes pancreatic enzyme replacement but skips it with snacks. Which timing instruction supports digestion of all food intake?",
  ],
  GI_peritonitis: [
    "A patient with a perforated intestinal wall develops generalized severe abdominal pain, guarding, and pain on movement. Which complication best explains these signs?",
    "After bowel contents leak through a perforation, a patient lies still with diffuse pain and a guarded abdomen. Which inflammatory complication is present?",
    "A bowel perforation is followed by intense widespread abdominal pain worsened by movement and involuntary guarding. Which diagnosis fits this contamination-related presentation?",
  ],
  GI_peritonitis__risk: [
    "A full-thickness gastric ulcer perforates. Which event creates the risk of inflammation within the peritoneal cavity?",
    "During teaching about a perforated stomach ulcer, which movement of gastric contents explains the risk of secondary peritonitis?",
    "A patient asks why an ulcer through the entire stomach wall is dangerous to the abdominal cavity. Which contamination route is created?",
  ],
  GI_peritonitis__mechanism: [
    "A patient with peritonitis avoids coughing and movement because both increase pain. Which effect on inflamed tissue explains this behavior?",
    "During assessment of peritoneal inflammation, the patient lies very still. Why does movement intensify discomfort?",
    "A patient asks why even shifting in bed hurts during peritonitis. Which mechanism involving inflamed peritoneal surfaces explains the pain?",
  ],
  GI_peritonitis__signs: [
    "A patient with suspected perforation has fever and abdominal rigidity. Which protective abdominal response supports peritoneal irritation?",
    "During examination of a febrile patient with possible peritonitis, which involuntary muscle response is consistent with inflamed peritoneal surfaces?",
    "A patient with a suspected leaking viscus has a tender abdomen and tachycardia. Which finding on abdominal examination supports peritoneal involvement?",
  ],
  GI_peritonitis__complications: [
    "A patient with secondary peritonitis becomes confused and hypotensive with falling urine output. Which complication should be suspected?",
    "During treatment of peritoneal infection, blood pressure falls and oliguria develops with altered mentation. Which systemic complication is most concerning?",
    "A patient with abdominal contamination develops impaired circulation, confusion, and scant urine. Which serious complication explains the deterioration?",
  ],
  GI_peritonitis__tests: [
    "A stable patient with suspected perforation-related peritonitis needs source identification and severity assessment. Which diagnostic approach addresses both?",
    "During evaluation of possible abdominal perforation, which combination of clinical perfusion assessment, laboratory work, and imaging is appropriate?",
    "The team assesses a stable patient with suspected secondary peritonitis. Which workup evaluates organ compromise while locating the abdominal source?",
  ],
  GI_peritonitis__management: [
    "A patient with suspected bowel perforation has diffuse guarding and hypotension. Which coordinated treatment plan should take priority?",
    "During an acute-abdomen evaluation, a patient has peritoneal signs and falling blood pressure from suspected perforation. Which urgent care approach is indicated?",
    "A patient with probable gastrointestinal perforation is circulatorily unstable with widespread peritoneal irritation. Which plan addresses circulation, infection, and the source?",
  ],
  GI_liver_metastasis: [
    "Following treatment of a colon carcinoma, a patient develops hepatic lesions whose biopsy matches the earlier colorectal tumor. Which disease process explains the lesions?",
    "A patient with prior rectal adenocarcinoma has new liver masses containing tumor cells matching the original bowel lesion. Which process has occurred?",
    "During follow-up after a colorectal malignancy, multiple hepatic lesions are found and pathology matches the original tumor. Which diagnosis explains their origin?",
  ],
  GI_liver_metastasis__risk: [
    "A patient with a gastrointestinal primary tumor asks why the liver is a common site of spread. Which venous drainage pattern explains susceptibility?",
    "During counseling about colorectal tumor spread, which feature of gastrointestinal blood drainage carries malignant cells toward the liver?",
    "A patient asks how tumor cells from bowel can readily reach hepatic tissue. Which anatomical circulation route is relevant?",
  ],
  GI_liver_metastasis__mechanism: [
    "Malignant cells leave a colon tumor, enter blood, and grow within hepatic tissue. Which process defines this secondary spread?",
    "A patient asks what makes a liver lesion metastatic when its cells originated in a bowel cancer. Which explanation describes the process?",
    "During pathology counseling, hepatic deposits contain cells from an extrahepatic primary tumor. Which mechanism defines metastasis?",
  ],
  GI_liver_metastasis__signs: [
    "A patient with known extrahepatic cancer develops hepatomegaly and increasing right-upper abdominal fullness. Which assessment is appropriate?",
    "During metastatic cancer follow-up, new liver enlargement and right-sided upper abdominal discomfort appear. What should these findings prompt?",
    "A patient with a known primary malignancy reports new hepatic-region fullness and an enlarged liver on examination. Which interpretation is appropriate?",
  ],
  GI_liver_metastasis__complications: [
    "Extensive hepatic tumor deposits are followed by rising bilirubin, ascites, and impaired protein synthesis. Which complication is occurring?",
    "A patient with widespread liver metastases develops worsening fluid accumulation and declining synthetic function with jaundice. Which consequence is relevant?",
    "During care for hepatic metastatic disease, bilirubin rises and new ascites accompanies loss of liver synthetic capacity. Which deterioration should the nurse recognize?",
  ],
  GI_liver_metastasis__tests: [
    "A patient with a previous malignancy has new hepatic lesions. Why might tissue sampling and comparison with the original tumor be necessary?",
    "During workup of liver masses after an extrahepatic cancer, what can biopsy comparison establish about the lesions' origin?",
    "The team compares a hepatic lesion's pathology with a previous bowel tumor. Which diagnostic distinction can this analysis clarify?",
  ],
  GI_liver_metastasis__management: [
    "A patient asks why treatment for secondary liver tumors differs from therapy for a primary liver cancer. Which factors guide the plan?",
    "During planning for hepatic metastases, why does the clinician consider the original tumor's biology, spread, and the patient's condition?",
    "A patient with liver metastases asks which information determines treatment beyond the location in the liver. Which factors are relevant?",
  ],
};
