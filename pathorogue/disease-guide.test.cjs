"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

function loadGuide() {
  const context = vm.createContext({});
  const source = ["nursing-content.ts", "disease-guide.ts"].map(name => stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, name), "utf8"))
    .replace(/^import[^\n]*\n/gm, "").replace(/export /g, "")).join("\n");
  vm.runInContext(source + "\nthis.api={facts:nursingFacts,getDiseaseGuide,renderDiseaseGuide,definitions:DEFINITIONS};", context);
  return context.api;
}

test("all 96 conditions have authored definitions, lecture-grounded causes and manifestations, and sources", () => {
  const guide = loadGuide();
  const concepts = [...new Set(guide.facts.map(f => f.conceptId))];
  assert.equal(concepts.length, 96);
  assert.equal(Object.keys(guide.definitions).length, 96);
  for (const id of concepts) {
    const result = guide.getDiseaseGuide(id);
    assert(result.definition.length > 55, id);
    assert(result.causes.length > 20, id);
    assert(result.manifestations.length > 20, id);
    assert(result.sources.length > 0, id);
    const risk = guide.facts.find(f => f.conceptId === id && f.subsectionId === "risk");
    const signs = guide.facts.find(f => f.conceptId === id && f.subsectionId === "signs");
    assert.equal(result.causes, risk.answer);
    assert.equal(result.manifestations, signs.answer);
  }
});

test("GI bleeding is described as a symptom or complication, while normal physiology and procedures use honest labels", () => {
  const guide = loadGuide();
  const bleed = guide.getDiseaseGuide("GI_gi_bleed");
  assert(bleed.definition.includes("rather than a disease itself"));
  assert(bleed.causes.includes("Ulcers"));
  assert(bleed.manifestations.includes("black tarry stool"));
  assert.equal(guide.getDiseaseGuide("PATH_REN_ADH").causesLabel, "Normal regulation and relevant influences");
  assert.equal(guide.getDiseaseGuide("REN_dialysis").causesLabel, "Reasons it may be needed");
  assert(guide.getDiseaseGuide("PATH_MSK_osteoblast").definition.includes("bone-forming cells"));
});

test("rendered guide has all three sections and escapes bank text", () => {
  const guide = loadGuide();
  const fact = guide.facts.find(f => f.conceptId === "GI_gi_bleed");
  fact.concept = '<script>alert("unsafe")</script>';
  const risk = guide.facts.find(f => f.conceptId === fact.conceptId && f.subsectionId === "risk");
  risk.answer += " <unsafe>";
  const rendered = guide.renderDiseaseGuide(fact);
  assert(rendered.includes('class="ng-disease-guide"'));
  assert(rendered.includes("About this condition"));
  assert(rendered.includes("What it is:"));
  assert(rendered.includes("Causes and risk factors:"));
  assert(rendered.includes("Clinical manifestations:"));
  assert(!rendered.includes("<script>"));
  assert(rendered.includes("&lt;unsafe&gt;"));
  assert.throws(() => guide.getDiseaseGuide("missing-concept"), /Incomplete condition guide/);
});
