"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {loadClinicalContext}=require("./clinical-test-loader.cjs");
test('difficulty bands deterministically change case detail and distractor closeness',()=>{
 const {context:c}=loadClinicalContext(),f=c.nursingFacts.find(f=>f.id==='GI_pancreatic_cancer');
 const easy=c.buildChoices(f,0),hard=c.buildChoices(f,9),source=c.getClinicalCase(f);
 assert.equal(easy.stem,source.stem);assert(hard.stem.length<=easy.stem.length);assert.equal(hard.distractors.length,3);
 assert.deepEqual(Array.from(hard.distractors),Array.from(source.harderFoils.map(o=>o.text)));
 for(let n=0;n<10;n++)assert.equal(c.buildChoices(f,9).stem,hard.stem);
});
test("every one of the 687 subsections has an authored, unique clinical case and option explanations",()=>{
 const {context:c}=loadClinicalContext();const report=c.validateClinicalBank();assert.equal(report.cases,687);assert.equal(report.advanced,687);
 for(const f of c.nursingFacts){const item=c.getClinicalCase(f);assert(item.stem.length>=60,f.id);assert(item.stem.includes("?"),f.id);assert(item.why.length>=20,f.id);assert(item.foils.every(o=>o.why.length>=15),f.id);}
});
test("all ten tiers use the authored case key with three Easy choices or four later choices",()=>{
 const {context:c}=loadClinicalContext();assert.equal(new Set(c.CLINICAL_DIFFICULTY.map(d=>JSON.stringify(d))).size,10);
 for(let level=0;level<10;level++)for(const f of c.nursingFacts){const item=c.buildChoices(f,level),source=c.getClinicalCase(f);assert.equal(item.answer,source.answer,f.id);assert.equal(item.distractors.length,level===0?2:3,f.id);assert(!item.distractors.includes(item.answer),f.id);assert(item.stem===source.stem||item.stem===source.harderStem,f.id);for(const o of [item.answer,...item.distractors])assert(item.optionReasons[o],`${f.id}: ${o}`);if(level===0)assert.equal(item.advanced,false);if(level===9)assert.equal(item.advanced,true);}
});
test("diagnosis and procedure questions do not disclose their keyed answer or call procedures diseases",()=>{
 const {context:c}=loadClinicalContext();const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 for(const f of c.nursingFacts){const item=c.getClinicalCase(f);if(item.kind==="diagnosis"){assert(!normalize(item.stem).includes(normalize(item.answer)),f.id);if(item.harderStem)assert(!normalize(item.harderStem).includes(normalize(item.answer)),f.id);}if(item.kind==="treatment"||item.kind==="test")assert(!/which (?:named )?disease|what disease/i.test(item.stem),f.id);}
 const dialysis=c.nursingFacts.find(f=>f.conceptId==="REN_dialysis"&&f.subsectionId==="recognition");assert.equal(c.getClinicalCase(dialysis).kind,"treatment");assert.equal(c.identificationLabel(dialysis),"Identify the treatment");
});
