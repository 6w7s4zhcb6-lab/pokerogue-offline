#!/usr/bin/env node
"use strict";
// Executes the installed upstream MoveEffectPhase methods, with their external
// battle collaborators controlled. Requires Node 24; no test dependencies.
// Usage: node pathorogue/battle-gate.test.cjs ../pokerogue-src
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");
const { spawnSync } = require("node:child_process");
const { test, after } = require("node:test");
const root = path.resolve(process.argv[2] || "pokerogue-src");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "pathorogue-battle-"));
for (const file of ["src/main.ts", "src/phases/move-effect-phase.ts"]) {
  fs.mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true });
  // Accept either pristine or already-installed source. For the latter, load
  // the exact deployed methods without rerunning a non-idempotent installer.
  fs.copyFileSync(path.join(root, file), path.join(fixture, file));
}
let source = fs.readFileSync(path.join(fixture, "src/phases/move-effect-phase.ts"), "utf8");
if (!source.includes("PATHOROGUE_SUBSECTION_GATE_V1")) {
  const result = spawnSync(process.execPath, [path.join(__dirname, "install.cjs"), fixture], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  source = fs.readFileSync(path.join(fixture, "src/phases/move-effect-phase.ts"), "utf8");
}
const javascript = stripTypeScriptTypes(source.replace(/^import[\s\S]*?;\r?\n/gm, ""), { mode: "strip" })
  .replace("export class MoveEffectPhase", "class MoveEffectPhase") + "\nglobalThis.MoveEffectPhase = MoveEffectPhase;";
after(() => fs.rmSync(fixture, { recursive: true, force: true }));

const enums = new Proxy({}, { get: (_, key) => key });
function harness(player = true, passed = true) {
  let resolveGate;
  const calls = [];
  const stats = { starts: 0, completed: 0, accuracy: 0 };
  const user = {
    isPlayer: () => player,
    isActive: () => true,
    turnData: { hitsLeft: -1, hitCount: -1 },
    lapseTags() {},
    stellarTypesBoosted: [],
    hasAbilityWithAttr: () => false,
    getAccuracyMultiplier: () => 1,
    randBattleSeedInt: () => 0,
  };
  const target = {
    isPlayer: () => !player,
    isActive: () => true,
    getBattlerIndex: () => player ? 2 : 0,
    getTag: () => undefined,
    getMoveEffectiveness: () => 1,
  };
  class PokemonPhase {
    constructor(index) { this.battlerIndex = index; this.fieldIndex = 0; }
    getPokemon() { return user; }
    start() { stats.starts++; }
    end() {}
  }
  const move = {
    category: "PHYSICAL", moveTarget: "NEAR_OTHER", id: 1,
    getAttrs: () => [], hasFlag: () => false, hasAttr: () => false,
    calculateBattleAccuracy() { stats.accuracy++; return 100; },
  };
  const context = {
    console,
    PokemonPhase,
    globalScene: {
      currentBattle: { double: false }, getField: () => [target],
      applyModifiers() {},
    },
    MoveCategory: enums, MoveTarget: enums, MoveResult: enums, MoveFlags: enums,
    HitCheckResult: enums, BattlerTagType: enums, BattlerTagLapseType: enums,
    PokemonMultiHitModifier: class {}, SemiInvulnerableTag: class {},
    BooleanHolder: class { constructor(value) { this.value = value; } },
    NumberHolder: class { constructor(value) { this.value = value; } },
    isFieldTargeted: () => false,
    isReflected: () => false,
    applyMoveAttrs() {}, applyAbAttrs() {},
    openNursingGate(mode) {
      calls.push(mode);
      return new Promise(resolve => { resolveGate = () => resolve(passed); });
    },
  };
  vm.createContext(context);
  vm.runInContext(javascript, context);
  const phase = new context.MoveEffectPhase(player ? 0 : 2, [target.getBattlerIndex()], move, 0);
  phase.checkBypassAccAndInvuln = () => false;
  phase.protectedCheck = () => false;
  // Avoid animations and damage processing after testing the original start
  // lifecycle. hitCheck itself is exercised separately against exact source.
  phase.conductHitChecks = () => [];
  phase.postAnimCallback = () => { stats.completed++; };
  return { phase, user, target, move, calls, stats, settle: async () => { resolveGate(); await Promise.resolve(); } };
}

test("the tracker is initialized from game startup, after polyfills", () => {
  const main = fs.readFileSync(path.join(fixture, "src/main.ts"), "utf8");
  assert.match(main, /^import "#app\/polyfills";/);
  assert.match(main, /import \{ initNursingUI \} from "\.\/mods\/nursing-gate"/);
  assert.match(main, /async function startGame\(\): Promise<void> \{\s+initNursingUI\(\);/);
});

for (const [player, mode] of [[true, "attack"], [false, "defense"]]) {
  test(`${mode} suspends the actual phase until its question gate resolves`, async () => {
    const h = harness(player);
    h.phase.start();
    assert.deepEqual(h.calls, [mode]);
    assert.equal(h.stats.starts, 0);
    assert.equal(h.stats.completed, 0);
    // Reentering start while pending must not skip the unanswered quiz.
    h.phase.start();
    assert.equal(h.stats.starts, 0);
    assert.equal(h.calls.length, 1);
    await h.settle();
    assert.equal(h.stats.starts, 1);
    assert.equal(h.stats.completed, 1);
  });
}

test("a wrong attack answer forces a miss before native accuracy", async () => {
  const h = harness(true, false);
  h.phase.start(); await h.settle();
  assert.equal(h.phase.hitCheck(h.target)[0], "MISS");
  assert.equal(h.stats.accuracy, 0);
});

test("a wrong defense answer bypasses enemy accuracy", async () => {
  const h = harness(false, false);
  h.phase.start(); await h.settle();
  h.move.calculateBattleAccuracy = () => { throw Error("Accuracy should be bypassed"); };
  assert.equal(h.phase.hitCheck(h.target)[0], "HIT");
});

test("correct answers preserve the game's native accuracy roll", async () => {
  const h = harness();
  h.phase.start(); await h.settle();
  assert.equal(h.phase.hitCheck(h.target)[0], "HIT");
  assert.equal(h.stats.accuracy, 1);
  h.move.calculateBattleAccuracy = () => 0;
  assert.equal(h.phase.hitCheck(h.target)[0], "MISS");
});

test("immunity and protection remain effective even after a failed defense", async () => {
  const h = harness(false, false);
  h.phase.start(); await h.settle();
  h.target.getMoveEffectiveness = () => 0;
  assert.equal(h.phase.hitCheck(h.target)[0], "NO_EFFECT");
  h.phase.protectedCheck = () => true;
  assert.equal(h.phase.hitCheck(h.target)[0], "PROTECTED");
});

test("spread-move quiz results do not alter same-side hit checks", async () => {
  const h = harness(true, false);
  h.phase.start(); await h.settle();
  h.target.isPlayer = () => true;
  assert.equal(h.phase.hitCheck(h.target)[0], "HIT");
  assert.equal(h.stats.accuracy, 1);
});

test("later strikes and status moves do not open additional gates", () => {
  const h = harness();
  h.user.turnData.hitsLeft = 2;
  h.user.turnData.hitCount = 3;
  h.phase.start();
  assert.equal(h.calls.length, 0);
  assert.equal(h.stats.completed, 1);
  const status = harness();
  status.move.category = "STATUS";
  status.phase.start();
  assert.equal(status.calls.length, 0);
  assert.equal(status.stats.completed, 1);
});
