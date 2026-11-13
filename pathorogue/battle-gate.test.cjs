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
for (const file of ["src/main.ts", "src/phases/move-effect-phase.ts", "src/phases/attempt-capture-phase.ts"]) {
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
const captureJavascript = stripTypeScriptTypes(fs.readFileSync(path.join(fixture, "src/phases/attempt-capture-phase.ts"), "utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm, ""), { mode: "strip" })
  .replace("export class AttemptCapturePhase", "class AttemptCapturePhase") + "\nglobalThis.AttemptCapturePhase = AttemptCapturePhase;";
after(() => fs.rmSync(fixture, { recursive: true, force: true }));

const enums = new Proxy({}, { get: (_, key) => key });
function harness(player = true, passed = true) {
  let resolveGate;
  const calls = [];
  const gateContexts = [];
  const queued = [];
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
      phaseManager: {
        create(name, ...args) { assert.equal(name, "MoveEffectPhase"); return new context.MoveEffectPhase(...args); },
        unshiftPhase(phase) { queued.push(phase); },
      },
    },
    MoveCategory: enums, MoveTarget: enums, MoveResult: enums, MoveFlags: enums,
    HitCheckResult: enums, BattlerTagType: enums, BattlerTagLapseType: enums,
    PokemonMultiHitModifier: class {}, SemiInvulnerableTag: class {},
    BooleanHolder: class { constructor(value) { this.value = value; } },
    NumberHolder: class { constructor(value) { this.value = value; } },
    isFieldTargeted: () => false,
    isReflected: () => false,
    applyMoveAttrs() {}, applyAbAttrs() {},
    readQuizBattleContext: () => ({ player: [{ name: "Player" }], enemy: [{ name: "Enemy" }] }),
    openNursingGate(mode, battle) {
      calls.push(mode);
      gateContexts.push(battle);
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
  return { phase, user, target, move, calls, gateContexts, queued, stats, settle: async () => { resolveGate(); await Promise.resolve(); } };
}

test("the tracker is initialized from game startup, after polyfills", () => {
  const main = fs.readFileSync(path.join(fixture, "src/main.ts"), "utf8");
  assert.match(main, /^import "#app\/polyfills";/);
  assert.match(main, /import \{ initNursingUI \} from "\.\/mods\/nursing-gate"/);
  assert.match(main, /async function startGame\(\): Promise<void> \{\s+initNursingUI\(\);/);
});

for (const [player, mode] of [[true, "attack"]]) {
  test(`${mode} suspends the actual phase until its question gate resolves`, async () => {
    const h = harness(player);
    h.phase.start();
    assert.deepEqual(h.calls, [mode]);
    assert.equal(h.gateContexts[0].player[0].name, "Player");
    assert.equal(h.gateContexts[0].enemy[0].name, "Enemy");
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

test("enemy attacks run immediately without opening any question gate", () => {
  const h = harness(false, false);
  h.phase.start();
  assert.deepEqual(h.calls, []);
  assert.equal(h.stats.starts, 1);
  assert.equal(h.stats.completed, 1);
  assert.equal(h.phase.pathoGateMode, null);
});

test("enemy attacks preserve native accuracy and never gain an automatic hit", () => {
  const h = harness(false, false);
  h.phase.start();
  assert.equal(h.phase.hitCheck(h.target)[0], "HIT");
  assert.equal(h.stats.accuracy, 1);
  h.move.calculateBattleAccuracy = () => { h.stats.accuracy++; return 0; };
  assert.equal(h.phase.hitCheck(h.target)[0], "MISS");
  assert.equal(h.stats.accuracy, 2);
  assert.deepEqual(h.calls, []);
});

test("correct answers preserve the game's native accuracy roll", async () => {
  const h = harness();
  h.phase.start(); await h.settle();
  assert.equal(h.phase.hitCheck(h.target)[0], "HIT");
  assert.equal(h.stats.accuracy, 1);
  h.move.calculateBattleAccuracy = () => 0;
  assert.equal(h.phase.hitCheck(h.target)[0], "MISS");
});

test("enemy attacks preserve native immunity and protection without a quiz", () => {
  const h = harness(false, false);
  h.phase.start();
  h.target.getMoveEffectiveness = () => 0;
  assert.equal(h.phase.hitCheck(h.target)[0], "NO_EFFECT");
  h.phase.protectedCheck = () => true;
  assert.equal(h.phase.hitCheck(h.target)[0], "PROTECTED");
  assert.deepEqual(h.calls, []);
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

for (const player of [true]) {
  for (const passed of [true, false]) {
    test(`attack ${passed ? "passed" : "failed"} verdict carries through CHECK_ALL_HITS without repeating the quiz`, async () => {
      const h = harness(player, passed);
      h.phase.start(); await h.settle();
      h.user.turnData.hitCount = 3;
      h.user.turnData.hitsLeft = 2;
      h.move.hasFlag = flag => flag === "CHECK_ALL_HITS";
      h.move.calculateBattleAccuracy = () => 0;
      h.phase.addNextHitPhase();
      assert.equal(h.queued.length, 1);
      const next = h.queued[0];
      next.checkBypassAccAndInvuln = () => false;
      next.protectedCheck = () => false;
      next.conductHitChecks = h.phase.conductHitChecks;
      next.postAnimCallback = h.phase.postAnimCallback;
      next.start();
      assert.equal(h.calls.length, 1);
      assert.equal(next.pathoGateMode, "attack");
      assert.equal(next.pathoGatePassed, passed);
      assert.equal(next.hitCheck(h.target)[0], "MISS");
    });
  }
}

for (const accuracy of [0, 100]) {
  test(`enemy CHECK_ALL_HITS continuation uses native ${accuracy}% accuracy without questions`, () => {
    const h = harness(false, false);
    h.phase.start();
    h.user.turnData.hitCount = 3;
    h.user.turnData.hitsLeft = 2;
    h.move.hasFlag = flag => flag === "CHECK_ALL_HITS";
    h.move.calculateBattleAccuracy = () => { h.stats.accuracy++; return accuracy; };
    h.phase.addNextHitPhase();
    assert.equal(h.queued.length, 1);
    const next = h.queued[0];
    next.checkBypassAccAndInvuln = () => false;
    next.protectedCheck = () => false;
    next.conductHitChecks = h.phase.conductHitChecks;
    next.postAnimCallback = h.phase.postAnimCallback;
    next.start();
    assert.deepEqual(h.calls, []);
    assert.equal(next.pathoGateMode, null);
    assert.equal(next.hitCheck(h.target)[0], accuracy ? "HIT" : "MISS");
    assert.equal(h.stats.accuracy, 1);
  });
}

test("a spread move hitting an ally cannot bypass a failed attack quiz on later enemy strikes", async () => {
  const h = harness(true, false);
  h.phase.start(); await h.settle();
  const ally = { ...h.target, isPlayer: () => true };
  assert.equal(h.phase.hitCheck(h.target)[0], "MISS");
  assert.equal(h.phase.hitCheck(ally)[0], "HIT");
  h.user.turnData.hitCount = 3;
  h.user.turnData.hitsLeft = 2;
  h.phase.addNextHitPhase();
  const next = h.queued[0];
  next.checkBypassAccAndInvuln = () => false;
  next.protectedCheck = () => false;
  next.conductHitChecks = h.phase.conductHitChecks;
  next.postAnimCallback = h.phase.postAnimCallback;
  next.start();
  assert.equal(next.hitCheck(h.target)[0], "MISS");
  assert.equal(next.hitCheck(ally)[0], "HIT");
  assert.equal(h.calls.length, 1);
});

function captureHarness() {
  let resolveGate, rejectGate;
  const stats = { starts: 0, ends: 0, throws: 0, animations: 0, rng: 0, errors: 0 };
  const calls = [], messages = [];
  const target = {
    hp: 14, y: 10, species: { catchRate: 45 },
    getTag: () => null, getMaxHp: () => 20, isShiny: () => false,
    randBattleSeedInt: () => { stats.rng++; return 255; },
    getFieldPositionOffset: () => [0, 0],
  };
  class PokemonPhase {
    constructor(index) { this.battlerIndex = index; }
    getPokemon() { return target; }
    start() { stats.starts++; }
    end() { stats.ends++; }
  }
  const scene = {
    pokeballCounts: { 0: 5 },
    phaseManager: { queueMessage: value => messages.push(value) },
    addFieldSprite() { stats.throws++; return { setOrigin() {} }; },
    field: { add() {} }, time: { delayedCall() {} },
    tweens: { add() { stats.animations++; } },
  };
  const context = {
    console: { error() { stats.errors++; } }, PokemonPhase,
    BattlerIndex: { ENEMY: 2 }, SubstituteTag: class {},
    globalScene: scene, isBeta: false, isDev: false, IS_TEST: true,
    getPokeballCatchMultiplier: () => 1, getCriticalCaptureChance: () => 0,
    getPokeballAtlasKey: () => "pb", audioManager: { playSound() {} },
    readQuizBattleContext: () => ({ player: [{ name: "Player" }], enemy: [{ name: "Capture target" }] }),
    openNursingGate(mode, battle) {
      calls.push({ mode, battle });
      return new Promise((resolve, reject) => { resolveGate = resolve; rejectGate = reject; });
    },
  };
  vm.createContext(context);
  vm.runInContext(captureJavascript, context);
  const phase = new context.AttemptCapturePhase(0, 0);
  return {
    phase, scene, target, stats, calls, messages,
    settle: async passed => { resolveGate(passed); await Promise.resolve(); },
    fail: async () => { rejectGate(Error("Expected test failure")); await Promise.resolve(); },
  };
}

test("capture waits for its quiz before spending inventory, rolling odds or animating", async () => {
  const h = captureHarness();
  h.phase.start(); h.phase.start();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].mode, "capture");
  assert.equal(h.calls[0].battle.enemy[0].name, "Capture target");
  assert.equal(h.scene.pokeballCounts[0], 5);
  assert.equal(h.stats.starts, 0);
  assert.equal(h.stats.rng, 0);
  assert.equal(h.stats.throws, 0);
  await h.settle(true);
  assert.equal(h.stats.starts, 1);
  assert.equal(h.scene.pokeballCounts[0], 4);
  assert.equal(h.stats.rng, 1);
  assert.equal(h.stats.throws, 1);
  assert.equal(h.stats.animations, 1);
  h.phase.start();
  assert.equal(h.stats.throws, 1);
  assert.equal(h.calls.length, 1);
});

test("a failed capture quiz preserves the ball and ends the selected action", async () => {
  const h = captureHarness();
  h.phase.start(); await h.settle(false);
  assert.equal(h.scene.pokeballCounts[0], 5);
  assert.equal(h.stats.throws, 0);
  assert.equal(h.stats.rng, 0);
  assert.equal(h.stats.ends, 1);
  assert.equal(h.messages.length, 1);
  assert.match(h.messages[0], /No Poké Ball was used/);
  h.phase.start();
  assert.equal(h.stats.ends, 1);
  assert.equal(h.calls.length, 1);
});

test("a rejected capture quiz also preserves inventory and resolves the phase", async () => {
  const h = captureHarness();
  h.phase.start(); await h.fail();
  assert.equal(h.stats.errors, 1);
  assert.equal(h.scene.pokeballCounts[0], 5);
  assert.equal(h.stats.throws, 0);
  assert.equal(h.stats.ends, 1);
});

test("a target gone before or during the capture check consumes no ball", async () => {
  const gone = captureHarness();
  gone.target.hp = 0; gone.phase.start();
  assert.equal(gone.calls.length, 0);
  assert.equal(gone.stats.ends, 1);
  assert.equal(gone.scene.pokeballCounts[0], 5);
  const during = captureHarness();
  during.phase.start(); during.target.hp = 0; await during.settle(true);
  assert.equal(during.stats.ends, 1);
  assert.equal(during.scene.pokeballCounts[0], 5);
});

test("battle snapshot uses real loaded atlas icons, native HP and up to six party slots", () => {
  const contextSource = stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, "battle-context.ts"), "utf8"), { mode: "strip" })
    .replace(/^import[^\n]+\r?\n/m, "").replace(/export function /g, "function ");
  let images = 0;
  const pokemon = (id, active, hp = 10) => ({
    id, hp, name: "Fallback", getNameToRender: () => `Pokémon ${id}`,
    getMaxHp: () => 20, isActive: onField => active && onField,
    getIconAtlasKey: () => "pokemon-icons", getIconId: () => `icon-${id}`,
  });
  const scene = {
    getPlayerParty: () => Array.from({ length: 7 }, (_, i) => pokemon(i, i === 0)),
    getEnemyParty: () => [pokemon(99, true, 5)],
    textures: {
      exists: () => true, get: () => ({ has: () => true }),
      getBase64: (key, frame) => { images++; return `data:image/png;base64,${key}-${frame}`; },
    },
  };
  const context = { globalScene: scene, console: { debug() {}, warn() {} } };
  vm.createContext(context);
  vm.runInContext(contextSource + "\nglobalThis.readBattle = readQuizBattleContext;", context);
  const first = context.readBattle();
  assert.equal(first.player.length, 6);
  assert.equal(first.enemy.length, 1);
  assert.equal(first.player[0].name, "Pokémon 0");
  assert.equal(first.player[0].active, true);
  assert.equal(first.player[1].active, false);
  assert.equal(first.enemy[0].hp, 5);
  assert.equal(first.enemy[0].maxHp, 20);
  assert.match(first.enemy[0].icon, /^data:image\/png/);
  context.readBattle();
  assert.equal(images, 7, "Loaded atlas frames are cached between quiz snapshots");
  scene.textures.exists = () => false;
  scene.getEnemyParty = () => [pokemon(100, true)];
  assert.equal(context.readBattle().enemy[0].icon, undefined);
  scene.getPlayerParty = () => { throw Error("Expected unavailable scene"); };
  const fallback = context.readBattle();
  assert.equal(fallback.player.length, 0);
  assert.equal(fallback.enemy.length, 0);
});
