"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test, after } = require("node:test");
const files = ["nursing-gate.ts", "nursing-content.ts", "question-rationales.ts", "quiz-effects.ts", "battle-context.ts", "quiz-battle-hud.ts", "quiz-ball.png", "quiz-stars.png"];
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "pathorogue-install-assets-"));
assert(path.resolve(workspace).startsWith(path.resolve(os.tmpdir()) + path.sep));
after(() => fs.rmSync(workspace, { recursive: true, force: true }));
const main = 'import "#app/polyfills"; // first\nasync function startGame(): Promise<void> {\n}\n';
const phase = [
  'import type { PostMoveInteractionAbAttrParams, PostMoveUsedAbAttrParams } from "#abilities/ab-attrs";',
  'export class MoveEffectPhase {',
  '  public readonly phaseName = "MoveEffectPhase";',
  '  public override start(): void {',
  '  }',
  '  hitCheck() {',
  '    const moveAccuracy = move.calculateBattleAccuracy(user, target);',
  '  }',
  '  addNextHitPhase() {',
  '    globalScene.phaseManager.unshiftNew("MoveEffectPhase", this.battlerIndex, this.targets, this.move, this.useMode);',
  '  }',
  '}',
].join("\n");
const capture = [
  'import { globalScene } from "#app/global-scene";',
  'export class AttemptCapturePhase {',
  '  public readonly phaseName = "AttemptCapturePhase";',
  '  start() {',
  '    super.start();',
  '  }',
  '}',
].join("\n");

function scenario(name) {
  const bundle = path.join(workspace, name, "bundle");
  const game = path.join(workspace, name, "game");
  fs.mkdirSync(bundle, { recursive: true });
  fs.mkdirSync(path.join(game, "src/phases"), { recursive: true });
  for (const file of ["install.cjs", ...files]) fs.copyFileSync(path.join(__dirname, file), path.join(bundle, file));
  fs.writeFileSync(path.join(game, "src/main.ts"), main);
  fs.writeFileSync(path.join(game, "src/phases/move-effect-phase.ts"), phase);
  fs.writeFileSync(path.join(game, "src/phases/attempt-capture-phase.ts"), capture);
  return { bundle, game, run: () => spawnSync(process.execPath, [path.join(bundle, "install.cjs"), game], { encoding: "utf8" }) };
}

function assertUnchanged(game) {
  assert.equal(fs.readFileSync(path.join(game, "src/main.ts"), "utf8"), main);
  assert.equal(fs.readFileSync(path.join(game, "src/phases/move-effect-phase.ts"), "utf8"), phase);
  assert.equal(fs.readFileSync(path.join(game, "src/phases/attempt-capture-phase.ts"), "utf8"), capture);
  assert.equal(fs.existsSync(path.join(game, "src/mods")), false);
}

test("installer copies effects module and both real PNGs with the quiz bank", () => {
  const s = scenario("all-assets");
  const result = s.run();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  for (const file of files) {
    assert.deepEqual(fs.readFileSync(path.join(s.game, "src/mods", file)), fs.readFileSync(path.join(__dirname, file)), file);
  }
});

test("missing effects source fails before changing battle or startup files", () => {
  const s = scenario("missing-effects");
  fs.unlinkSync(path.join(s.bundle, "quiz-effects.ts"));
  const result = s.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing or empty quiz-effects\.ts/);
  assertUnchanged(s.game);
});

test("invalid image fails before changing battle or startup files", () => {
  const s = scenario("invalid-image");
  fs.writeFileSync(path.join(s.bundle, "quiz-ball.png"), "not a PNG");
  const result = s.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid PNG asset quiz-ball\.png/);
  assertUnchanged(s.game);
});

test("missing capture source anchor fails before writing any mod or game files", () => {
  const s = scenario("invalid-capture-anchor");
  fs.writeFileSync(path.join(s.game, "src/phases/attempt-capture-phase.ts"), capture.replace("  start() {", "  execute() {"));
  const result = s.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing or duplicated capture start source anchor/);
  assert.equal(fs.readFileSync(path.join(s.game, "src/main.ts"), "utf8"), main);
  assert.equal(fs.readFileSync(path.join(s.game, "src/phases/move-effect-phase.ts"), "utf8"), phase);
  assert.equal(fs.existsSync(path.join(s.game, "src/mods")), false);
});
