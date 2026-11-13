"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");
function load() {
  const c = vm.createContext({});
  const source = ["nursing-content.ts", "question-rationales.ts", "question-quality-data.ts"].map(file =>
    stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, file), "utf8")).replace(/^import[^\n]*\n/gm, "").replace(/export /g, "")
  ).join("\n");
  vm.runInContext(source + "\nthis.api={facts:nursingFacts,overrides:questionOverrides,explainOptions};", c);
  return c.api;
}
test("the reported GI-bleed complication ambiguity cannot reappear in the reviewed choices", () => {
  const { overrides } = load();
  const question = overrides.GI_gi_bleed__complications;
  assert(question.stem.includes("losing circulating blood volume and red cells"));
  assert(!question.distractors.some(option => /hypovolemia|hypovolemic|electrolyte|anemia|bleeding|fluid.*loss/i.test(option)));
});
test("reviewed questions preserve bank answers and provide five unique, grounded alternatives", () => {
  const { facts, overrides } = load();
  assert.equal(Object.keys(overrides).length, 34);
  const answers = new Set(facts.map(f => f.answer));
  for (const [id, question] of Object.entries(overrides)) {
    const fact = facts.find(f => f.id === id);
    assert(fact, id);
    assert.equal(question.distractors.length, 5, id);
    assert.equal(new Set(question.distractors).size, 5, id);
    assert(!question.distractors.includes(fact.answer), id);
    assert(question.distractors.every(option => answers.has(option)), id);
    assert(question.stem.length < 240, id);
  }
});
test("ADH and PTH choices exclude secondary triggers or alternative treatments that can also fit", () => {
  const { overrides } = load();
  const adh = overrides.PATH_REN_ADH__risk;
  assert(adh.stem.includes("normal homeostatic signals"));
  assert(!adh.distractors.some(option => /vomit|medication|dehydrat|hypovolem|circulating volume|osmolality/i.test(option)));
  const pth = overrides.PATH_MSK_PTH__management;
  assert(pth.stem.includes("identified cause"));
  assert(!pth.distractors.some(option => /dialysis|renal replacement|alkali|calcium|vitamin D|fluids/i.test(option)));
});
test("reviewed alternatives also have option-level rationale coverage", () => {
  const { facts, overrides, explainOptions } = load();
  const missing = [];
  for (const [id, question] of Object.entries(overrides)) {
    const fact = facts.find(f => f.id === id);
    for (const item of explainOptions(fact, question.distractors, [fact.answer], fact.why)) {
      if (item.coverage === "unmapped") missing.push(`${id}: ${item.option}`);
    }
  }
  assert.deepEqual(missing, []);
});
