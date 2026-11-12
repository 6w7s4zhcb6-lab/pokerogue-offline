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
  const context = vm.createContext({
    console,
    window: { localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) } },
    createQuizEffects: () => ({ showQuestion() {}, answer() {}, settled() {}, dispose() {} }),
  });
  const bank = stripTypeScriptTypes(fs.readFileSync(path.join(folder, 'nursing-content.ts'), 'utf8'))
    .replace('export const nursingFacts', 'const nursingFacts');
  const quiz = stripTypeScriptTypes(fs.readFileSync(path.join(folder, 'nursing-gate.ts'), 'utf8'))
    .replace(/^import .*nursing-content.*;\r?\n/m, '')
    .replace(/^import .*quiz-effects.*;\r?\n/m, '')
    .replace(/export /g, '');
  vm.runInContext(bank + '\n' + quiz + `\nthis.quiz = {
    facts: nursingFacts, levels: LEVELS, difficulties: DIFFICULTY,
    state: () => state,
    reset: () => { state = emptyState(); prepared = []; },
    normalizeState, makeQuestion, takeQuestion, recordAnswer, conceptMastered, readState,
    runGate: async (mode, responses) => {
      hud = { querySelectorAll: () => [], querySelector: () => null, innerHTML: '' };
      this.document = {
        addEventListener() {}, removeEventListener() {},
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
  };`, context, { filename: 'nursing-gate.test.bundle.js' });
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

test('all ten tiers have distinct configurations and high tiers require a curated rationale', () => {
  const quiz = loadQuiz();
  assert.equal(quiz.levels.length, 10);
  assert.equal(new Set(quiz.difficulties.map(d => JSON.stringify(d))).size, 10);
  for (let level = 0; level < 10; level++) {
    for (const fact of quiz.facts) {
    quiz.state().banks.patho.tier = level;
    const q = quiz.makeQuestion(fact, false);
    assert.equal(q.level, level);
    if (q.isSelectAll) continue;
    assert.equal(q.options.length, quiz.difficulties[level].choices, fact.id);
    assert.equal(q.rationaleOptions.length, quiz.difficulties[level].rationales, fact.id);
    assert.equal(new Set(q.options).size, q.options.length);
    if (level >= 5) {
      assert.ok(q.rationaleOptions.includes(q.rationale));
      assert.equal(new Set(q.rationaleOptions).size, q.rationaleOptions.length);
      for (const why of q.rationaleOptions) assert.ok(quiz.facts.some(f => f.why === why));
    }
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

test('attack needs three correct, defense two, and one miss stops either check', async () => {
  for (const [mode, required] of [['attack', 3], ['defense', 2]]) {
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
