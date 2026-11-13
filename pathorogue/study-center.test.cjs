const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const {stripTypeScriptTypes}=require('node:module');
function load(storage=new Map()){
 const {context:c,load:loadModule}=require('./clinical-test-loader.cjs').loadClinicalContext({window:{localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}},canOpenStudy:()=>true,studyRunId:()=>"test-run"});
 loadModule('disease-guide.ts',['getDiseaseGuide','renderDiseaseGuide']);loadModule('question-rationales.ts',['explainOptions','explainRationaleOptions']);
 const source=stripTypeScriptTypes(fs.readFileSync(path.join(__dirname,'study-center.ts'),'utf8')).replace(/^import[^\n]*\n/gm,'').replace(/export /g,'');
 vm.runInContext(source+'\nthis.api={recordStudyAnswer,repairMarkup,finishStudyRun,facts:nursingFacts,state:()=>study};',c);return c.api;
}
test('repeated specific wrong options trigger repair; hints cannot resolve it; two fresh subsections can',()=>{
 const q=load(),f=q.facts[0],wrong=f.foils[0];
 q.recordStudyAnswer(f,[wrong],false);assert.equal(q.repairMarkup(f),'');
 q.recordStudyAnswer(f,[wrong],false);assert(q.repairMarkup(f).includes('Misconception repair'));
 const other=q.facts.filter(x=>x.conceptId===f.conceptId&&x.id!==f.id);
 q.recordStudyAnswer(other[0],[other[0].answer],true,true,true);assert(!Object.values(q.state().confusions)[0].resolved);
 q.recordStudyAnswer(other[0],[other[0].answer],true,true,false);
 q.recordStudyAnswer(other[0],[other[0].answer],true,true,false);assert(!Object.values(q.state().confusions)[0].resolved);
 q.recordStudyAnswer(other[1],[other[1].answer],true,true,false);assert(Object.values(q.state().confusions)[0].resolved);
});
test('clinic assisted/independent records stay outside battle ledger; run summary persists across reload',()=>{
 const storage=new Map(),q=load(storage),f=q.facts[0];
 q.recordStudyAnswer(f,[f.answer],true,true,true);assert.equal(q.state().run.length,0);
 q.recordStudyAnswer(f,[f.answer],true);q.finishStudyRun(false);
 assert.equal(q.state().run.length,0);assert.equal(q.state().runs[0].attempts.length,1);
 const reloaded=load(storage);assert.equal(reloaded.state().clinic[0].assisted,true);assert.equal(reloaded.state().runs.length,1);
});
test('installer hooks the confirmed run ending, including victory, after the retry choice',()=>{
 const install=fs.readFileSync(path.join(__dirname,'install.cjs'),'utf8');
 assert(install.includes('handleGameOver(): void {'));assert(install.includes('finishStudyRun(this.isVictory)'));
});
