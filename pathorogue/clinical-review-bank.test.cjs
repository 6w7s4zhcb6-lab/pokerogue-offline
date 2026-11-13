const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadClinicalContext}=require('./clinical-test-loader.cjs');
test('all687 learning targets have three original review cases and no diagnosis giveaway',()=>{
 const {context:c}=loadClinicalContext();const result=c.validateReviewBank();assert.equal(result.subsections,687);assert.equal(result.freshReviewCases,2061);
});
test('every difficulty selects unseen clinical scenarios before reusing one',()=>{
 const {context:c}=loadClinicalContext();for(let level=0;level<10;level++)for(const fact of c.nursingFacts){const history=[],stems=new Set();const cases=c.caseVariants(fact);
   for(let i=0;i<cases.length;i++){const q=c.buildChoices(fact,level,history);assert(!stems.has(q.stem),`${fact.id} / tier${level}`);stems.add(q.stem);history.push(q.caseId);assert.equal(q.answer,c.getClinicalCase(fact).answer);for(const option of [q.answer,...q.distractors])assert(q.optionReasons[option]);}
 }
});
test('nephrotic calf-swelling reviews distinguish the coagulation risk from competing infection',()=>{
 const {context:c}=loadClinicalContext();const id='PATH_REN_nephrotic__complications';
 assert(c.getClinicalCase(id).harderFoils.some(o=>/cellulitis/i.test(o.text)));
 for(const stem of c.reviewVariants[id])assert(/coagul|blood clots/i.test(stem),'The case must distinguish the coagulation complication from cellulitis');
});
