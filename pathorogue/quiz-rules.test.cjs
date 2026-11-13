'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const { test } = require('node:test');

function loadQuiz() {
  const folder = __dirname;
  const storage = new Map();
  const {context,load}=require('./clinical-test-loader.cjs').loadClinicalContext({
    console,window:{localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}},
    recordStudyAnswer(){},repairMarkup:()=>"",initStudyLauncher(){},
    createQuizEffects:()=>({showQuestion(){},answer(){},settled(){},dispose(){}}),createQuizBattleHUD:()=>({dispose(){}}),
  });
  load('disease-guide.ts',['getDiseaseGuide','renderDiseaseGuide']);
  load('question-rationales.ts',['explainOptions','explainRationaleOptions']);
  const quiz=stripTypeScriptTypes(fs.readFileSync(path.join(folder,'nursing-gate.ts'),'utf8')).replace(/^import[^\n]*\r?\n/gm,'').replace(/export /g,'');
  vm.runInContext('(()=>{'+quiz + `\nthis.quiz = {
    facts: nursingFacts, levels: LEVELS, difficulties: DIFFICULTY,
    state: () => state,
    reset: () => { state = emptyState(); prepared = []; },
    retentionConcept, normalizeState, makeQuestion, takeQuestion, recordAnswer, conceptMastered, readState,
    explainOptions, explainRationaleOptions, renderAnswerFeedback, buildChoices,isIdentification,getClinicalCase,
    keyboard: (event, dialog, doc) => { this.document = doc; activeGate = true; shade = dialog; try { blockGameplayKeys(event); } finally { activeGate = false; shade = null; } },
    runGate: async (mode, responses) => {
      hud = { querySelectorAll: () => [], querySelector: () => null, innerHTML: '' };
      this.document = {
        getElementById() { return null; }, addEventListener() {}, removeEventListener() {},
        createElement: () => ({ setAttribute() {}, appendChild() {}, remove() {} }),
        body: { appendChild() {} },
      };
      const asked = [];
      askQuestion = async (q, number, required, kind) => {
        asked.push({ id: q.fact.id, concept: q.fact.conceptId, subsection: q.fact.subsectionId, number, required, kind });
        return responses.shift();
      };
      const passed = await openNursingGate(mode);
      return { passed, asked, activeGate };
    },
  };})()`, context, { filename: 'nursing-gate.test.bundle.js' });
  return context.quiz;
}

function answer(quiz, fact, correct, review = false) {
  quiz.recordAnswer(quiz.makeQuestion(fact, review), correct);
}

test('bank contains 96 concepts and 687 independent, uniquely named subsections', () => {
  const quiz = loadQuiz();
  assert.equal(quiz.facts.length, 687);
  assert.equal(new Set(quiz.facts.map(f => f.id)).size, 687);
  const concepts = Map.groupBy(quiz.facts, f => f.conceptId);
  assert.equal(concepts.size, 96);
  for (const facts of concepts.values()) {
    assert.ok(facts.length >= 3);
    assert.equal(new Set(facts.map(f => f.subsectionId)).size, facts.length);
    for (const f of facts) assert.ok(f.answer && f.why && f.source);
  }
});

test('overdue reviews anchor a check, never interrupt its concept or repeat its subsection', () => {
  const quiz = loadQuiz();
  const first = quiz.facts[0];
  const other = quiz.facts.find(f => f.conceptId !== first.conceptId);
  answer(quiz, first, false);
  answer(quiz, other, false);
  quiz.state().banks.patho.total = 100;
  const used = new Set();
  const q1 = quiz.takeQuestion(null, used);
  assert.equal(q1.fact.id, first.id);
  assert.equal(q1.isReview, true);
  used.add(q1.fact.id);
  for (let i = 0; i < 2; i++) {
    const q = quiz.takeQuestion(q1.fact.conceptId, used);
    assert.equal(q.fact.conceptId, q1.fact.conceptId);
    assert.ok(!used.has(q.fact.id));
    used.add(q.fact.id);
  }
  assert.equal(used.size, 3);
  assert.equal(quiz.takeQuestion(null, new Set()).fact.id, first.id);
});

test('a missed subsection needs due +10, +20 and +50 retests; early correct answers cannot master it', () => {
  const quiz = loadQuiz();
  const fact = quiz.facts[0];
  const unrelated = quiz.facts.find(f => f.conceptId !== fact.conceptId);
  answer(quiz, fact, false);
  const item = quiz.state().banks.patho.items[fact.id];
  assert.equal(item.dueAt, 11);
  answer(quiz, fact, true);
  assert.equal(item.step, 0);
  assert.equal(item.mastered, false);
  for (const [step, interval] of [[1, 20], [2, 50], [3, 0]]) {
    while (quiz.state().banks.patho.total < item.dueAt) answer(quiz, unrelated, true);
    const q = quiz.takeQuestion(null, new Set());
    assert.equal(q.fact.id, fact.id);
    assert.equal(q.isReview, true);
    quiz.recordAnswer(q, true);
    assert.equal(item.step, step);
    assert.equal(item.mastered, step === 3);
    assert.equal(item.dueAt, interval ? quiz.state().banks.patho.total + interval : 0);
  }
  assert.equal(quiz.conceptMastered(fact.conceptId), false);
  for (const f of quiz.facts.filter(f => f.conceptId === fact.conceptId && f.id !== fact.id)) answer(quiz, f, true);
  assert.equal(quiz.conceptMastered(fact.conceptId), true);
  answer(quiz, fact, false);
  assert.equal(item.step, 0);
  assert.equal(item.mastered, false);
  assert.equal(quiz.conceptMastered(fact.conceptId), false);
});

test('all ten tiers use authored single-best-answer cases with explicit explanations', () => {
  const quiz = loadQuiz();
  assert.equal(quiz.levels.length, 10);
  assert.equal(new Set(quiz.difficulties.map(d => JSON.stringify(d))).size, 10);
  for (let level = 0; level < 10; level++) {
    for (const fact of quiz.facts) {
    quiz.state().banks.patho.tier = level;
    const q = quiz.makeQuestion(fact, false);
    assert.equal(q.level, level);
    if (q.isSelectAll) continue;
    assert(q.options.length>=3 && q.options.length<=quiz.difficulties[level].choices, fact.id);
    assert.equal(q.rationaleOptions.length, quiz.difficulties[level].rationales, fact.id);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.equal(q.rationaleOptions.length,0);
    assert.equal(q.answer,quiz.getClinicalCase(fact).answer);
    }
  }
});

test('difficulty climbs on ten correct answers, drops on three misses and stays within ten tiers', () => {
  const quiz = loadQuiz();
  const fact = quiz.facts[0];
  for (let i = 0; i < 100; i++) answer(quiz, fact, true);
  assert.equal(quiz.state().banks.patho.tier, 9);
  for (let i = 0; i < 3; i++) answer(quiz, fact, false);
  assert.equal(quiz.state().banks.patho.tier, 8);
  for (let i = 0; i < 30; i++) answer(quiz, fact, false);
  assert.equal(quiz.state().banks.patho.tier, 0);
});

test('player attack and capture need three correct, and one miss stops each check', async () => {
  for (const [mode, required] of [['attack', 3], ['capture', 3]]) {
    const quiz = loadQuiz();
    const result = await quiz.runGate(mode, Array(required).fill(true));
    assert.equal(result.passed, true);
    assert.equal(result.asked.length, required);
    assert.equal(new Set(result.asked.map(q => q.concept)).size, 1);
    assert.equal(new Set(result.asked.map(q => q.subsection)).size, required);
    assert.equal(result.activeGate, false);
    const failure = await quiz.runGate(mode, [true, false, true]);
    assert.equal(failure.passed, false);
    assert.equal(failure.asked.length, 2);
    assert.equal(failure.activeGate, false);
  }
});

test('answer totals and per-subsection progress survive offline storage round-trip', () => {
  const quiz = loadQuiz();
  const fact = quiz.facts[0];
  answer(quiz, fact, true);
  answer(quiz, fact, false);
  const restored = quiz.readState();
  assert.equal(restored.totalAnswers, 2);
  assert.equal(restored.correctAnswers, 1);
  assert.equal(restored.banks.patho.items[fact.id].attempts, 2);
  assert.equal(restored.banks.patho.items[fact.id].correct, 1);
  assert.equal(restored.banks.patho.items[fact.id].misses, 1);
});

test('identification questions come first and never appear later in a gate', async () => {
  const q=loadQuiz();
  for(let i=0;i<40;i++) {
    const result=await q.runGate('attack',[true,true,true]);
    const questions=result.asked.map(a=>q.facts.find(f=>f.id===a.id));
    const identification=questions.filter(q.isIdentification);
    if(identification.length) {assert(q.isIdentification(questions[0]));assert.equal(identification.length,1);}
  }
});

test('Easy uses three distinct options, simple stems, and the known ambiguous pairs are excluded',()=>{
  const q=loadQuiz();q.state().banks.patho.tier=0;
  for(const f of q.facts){const item=q.makeQuestion(f,false);assert.equal(item.options.length,3,f.id);assert(!item.stem.includes('A clinician is reviewing'));assert(!item.stem.includes('At change of shift'));assert.equal(item.rationaleOptions.length,0);}

});

test('enemy-turn compatibility calls return without opening a gate or recording progress',async()=>{
  const q=loadQuiz();const before=q.state().totalAnswers;const result=await q.runGate('defense',[]);assert.equal(result.passed,true);assert.equal(result.asked.length,0);assert.equal(q.state().totalAnswers,before);
});

test('every authored clinical option has its specific explanation and source',()=>{
 const q=loadQuiz();for(const f of q.facts){const c=q.getClinicalCase(f);for(const foils of [c.foils,...(c.harderFoils?[c.harderFoils]:[])]){const items=q.explainOptions(f,[c.answer,...foils.map(o=>o.text)],[c.answer],c.why);assert.equal(items.filter(i=>i.correct).length,1);for(const item of items){assert.equal(item.coverage,'authored',f.id);assert(item.explanation.length>=10,f.id);assert(item.source.length>0,f.id);}}}
});

test('correct feedback keeps all rationales collapsed, wrong feedback automatically shows each option', () => {
  const quiz = loadQuiz();
  const q = quiz.makeQuestion(quiz.facts[0], false);
  const correct = quiz.renderAnswerFeedback(q, true, 1, 3, 'capture');
  assert(correct.includes('id="ng-reveal-rationales"'));
  assert(correct.includes('id="ng-option-rationales" hidden'));
  assert(correct.includes('aria-expanded="false"'));
  assert.equal((correct.match(/class="ng-option-rationale"/g) || []).length, q.options.length);
  const wrong = quiz.renderAnswerFeedback(q, false, 1, 3, 'capture');
  assert(!wrong.includes('id="ng-option-rationales" hidden'));
  assert(wrong.includes('aria-expanded="true"'));
  assert(wrong.includes('Your ball is kept'));
  assert.equal((wrong.match(/class="ng-option-rationale"/g) || []).length, q.options.length);
  const expert = { ...quiz.facts[0], expert: { answer: 'Verified expert interpretation', why: 'The expert variant has its own supplied clinical explanation.', cue: 'Expert findings.', task: 'Choose the interpretation.' } };
  quiz.state().banks.patho.tier = 5;
  const advanced = quiz.makeQuestion(expert, false);
  const explanations = quiz.explainOptions(expert, advanced.options, advanced.answers, advanced.rationale);
  assert.equal(explanations.find(item => item.correct).explanation, quiz.getClinicalCase(expert).why);
});

test('shared distractor definitions are contrasted with the current scenario without leaking another scenario', () => {
  const quiz = loadQuiz();
  const diarrhea = quiz.facts.find(f => f.id === 'PATH_GI_diarrhea');
  const respiratory = quiz.explainOptions(diarrhea, ['Respiratory acidosis'], [diarrhea.answer], diarrhea.why)[0];
  assert(respiratory.explanation.includes('carbon dioxide'));
  assert(respiratory.explanation.includes('bicarbonate'));
  assert(!respiratory.explanation.includes('vomiting'));
  const adh = quiz.facts.find(f => f.id === 'PATH_REN_ADH');
  const epo = quiz.explainOptions(adh, ['Erythropoietin'], [adh.answer], adh.why)[0];
  assert(epo.explanation.includes('red-cell'));
  assert(!epo.explanation.includes('hepatic'));
});

test('keyboard reveal toggles with Enter/Space, Tab stays in the modal and ordinary Enter continues', () => {
  const quiz = loadQuiz(), clicks = { reveal: 0, continue: 0, answer: 0 }, doc = {};
  const button = (id, action) => ({ id, hidden: false, closest: () => null, getClientRects: () => [{}], focus() { doc.activeElement = this; }, click: action });
  const reveal = button('ng-reveal-rationales', () => clicks.reveal++);
  const proceed = button('ng-continue', () => clicks.continue++);
  const answer = button('answer', () => clicks.answer++);
  const dialog = { querySelectorAll: () => [reveal, proceed], querySelector: selector => selector.includes('#ng-continue') ? proceed : selector.includes('data-answer="1"') ? answer : null };
  const press = (key, shiftKey = false) => {
    const event = { type: 'keydown', key, shiftKey, repeat: false, target: doc.activeElement, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
    quiz.keyboard(event, dialog, doc); assert(event.prevented && event.stopped);
  };
  doc.activeElement = reveal;
  press('Enter'); press(' ');
  assert.equal(clicks.reveal, 2); assert.equal(clicks.continue, 0);
  press('Tab'); assert.equal(doc.activeElement, proceed);
  press('Enter'); assert.equal(clicks.continue, 1);
  press('Tab'); assert.equal(doc.activeElement, reveal);
  press('Tab', true); assert.equal(doc.activeElement, proceed);
  press('2'); assert.equal(clicks.answer, 1);
});


test('mastered concepts rotate after 12 answers, survive reload, and a missed check revokes subsection mastery',()=>{
 const q=loadQuiz();const ids=[...new Set(q.facts.map(f=>f.conceptId))].sort().slice(0,2);const b=q.state().banks.patho;
 b.total=100;for(const f of q.facts.filter(f=>ids.includes(f.conceptId)))b.items[f.id]={attempts:1,correct:1,misses:0,lastSeenAt:1,step:0,dueAt:0,mastered:true};
 b.retentionAt=100;b.total=111;assert.equal(q.retentionConcept(),null);
 b.total=112;assert.equal(q.retentionConcept(),ids[0]);assert.equal(q.retentionConcept(),null);
 const restored=q.normalizeState(JSON.parse(JSON.stringify(q.state())));assert.equal(restored.banks.patho.retentionAt,112);
 b.total=124;assert.equal(q.retentionConcept(),ids[1]);
 const f=q.facts.find(f=>f.conceptId===ids[1]);q.recordAnswer(q.makeQuestion(f,true),false);
 assert.equal(q.conceptMastered(ids[1]),false);assert.equal(b.items[f.id].dueAt,b.total+10);
});


