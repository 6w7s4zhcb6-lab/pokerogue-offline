#!/usr/bin/env node
"use strict";
const fs=require("node:fs"), path=require("node:path");
const root=path.resolve(process.argv[2]||"pokerogue-src");
const file=path.join(root,"src/phases/move-effect-phase.ts");
const mainFile=path.join(root,"src/main.ts");
const captureFile=path.join(root,"src/phases/attempt-capture-phase.ts");
const overFile=path.join(root,"src/phases/game-over-phase.ts");
let over=fs.existsSync(overFile)?fs.readFileSync(overFile,"utf8"):null;
if(over!==null){assert(!over.includes("PATHOROGUE_RUN_DEBRIEF"),"Debrief already patched");assert(over.split("  handleGameOver(): void {").length===2,"Missing game over anchor");over='import { finishStudyRun } from "../mods/study-center"; // PATHOROGUE_RUN_DEBRIEF\n'+over;over=over.replace("  handleGameOver(): void {","  handleGameOver(): void {\n    finishStudyRun(this.isVictory);");}
const md=path.join(root,"src/mods");
const marker="PATHOROGUE_SUBSECTION_GATE_V1";
function assert(b,msg){if(!b)throw new Error("PathoRogue install: "+msg)}
assert(fs.existsSync(file),"Original move-effect-phase.ts missing at "+file);
assert(fs.existsSync(mainFile),"Original main.ts missing at "+mainFile);
assert(fs.existsSync(captureFile),"Original attempt-capture-phase.ts missing at "+captureFile);
let s=fs.readFileSync(file,"utf8");
let main=fs.readFileSync(mainFile,"utf8");
let capture=fs.readFileSync(captureFile,"utf8");
assert(!s.includes(marker),"Already patched");
assert(!main.includes("PATHOROGUE_UI_BOOT"),"UI already patched");
assert(!capture.includes("PATHOROGUE_CAPTURE_GATE"),"Capture already patched");
const captureAnchors={
  class:'  public readonly phaseName = "AttemptCapturePhase";',
  start:'  start() {',
  imp:'import { globalScene } from "#app/global-scene";',
};
for(const [k,v] of Object.entries(captureAnchors))assert(capture.split(v).length===2,"Missing or duplicated capture "+k+" source anchor");
assert(main.split("async function startGame(): Promise<void> {").length===2,"Missing or duplicated game startup anchor");
assert(/^import "#app\/polyfills";[^\r\n]*\r?\n/.test(main),"Expected polyfills as the first startup import");
const anchors={
  class:'  public readonly phaseName = "MoveEffectPhase";',
  start:'  public override start(): void {',
  accuracy:'    const moveAccuracy = move.calculateBattleAccuracy(user, target);',
  nextHit:'    globalScene.phaseManager.unshiftNew("MoveEffectPhase", this.battlerIndex, this.targets, this.move, this.useMode);',
  imp:'import type { PostMoveInteractionAbAttrParams, PostMoveUsedAbAttrParams } from "#abilities/ab-attrs";'
};
for(const [k,v] of Object.entries(anchors)) assert(s.split(v).length===2,"Missing or duplicated "+k+" source anchor");
s=s.replace(anchors.class,anchors.class+'\n  // '+marker+'\n  private pathoGateOpened = false;\n  private pathoGatePending = false;\n  private pathoGatePassed = false;\n  private pathoGateMode: "attack" | null = null;');
s=s.replace(anchors.start,[
'  public override start(): void {',
'    // '+marker+': ask once for a whole move, not once per hit or target.',
'    if (this.pathoGatePending) return;',
'    if (!this.pathoGateOpened) {',
'      const pathoUser = this.getUserPokemon();',
'      const pathoTargets = this.getTargets();',
'      const againstOpponent = !!pathoUser && pathoTargets.some(t => t && t.isPlayer() !== pathoUser.isPlayer());',
'      if (pathoUser && pathoUser.isPlayer() && pathoUser.isActive(true) && againstOpponent && this.move.category !== MoveCategory.STATUS',
'          && !isFieldTargeted(this.move) && pathoUser.turnData.hitsLeft === -1) {',
'        this.pathoGateOpened = true;',
'        this.pathoGatePending = true;',
'        this.pathoGateMode = "attack";',
'        void openNursingGate(this.pathoGateMode, readQuizBattleContext()).then(passed => {',
'          this.pathoGatePassed = passed;',
'          this.pathoGatePending = false;',
'          this.start();',
'        }).catch(error => {',
'          console.error("PathoRogue question gate error; counting as incorrect:", error);',
'          this.pathoGatePassed = false;',
'          this.pathoGatePending = false;',
'          this.start();',
'        });',
'        return;',
'      }',
'      this.pathoGateOpened = true;',
'    }'
].join("\n"));
s=s.replace(anchors.nextHit,[
'    // PATHOROGUE_MULTI_HIT_VERDICT: one quiz result applies to every strike.',
'    const next = globalScene.phaseManager.create("MoveEffectPhase", this.battlerIndex, this.targets, this.move, this.useMode);',
'    next.pathoGateOpened = this.pathoGateOpened;',
'    next.pathoGatePassed = this.pathoGatePassed;',
'    next.pathoGateMode = this.pathoGateMode;',
'    globalScene.phaseManager.unshiftPhase(next);'
].join("\n"));
s=s.replace(anchors.accuracy,[
'    // '+marker+': original effectiveness/protection checks above are preserved.',
'    if (user.isPlayer() && !target.isPlayer() && this.pathoGateMode === "attack" && !this.pathoGatePassed) {',
'      return [HitCheckResult.MISS, 0];',
'    }',
'    const moveAccuracy = move.calculateBattleAccuracy(user, target);'
].join("\n"));
s=s.replace(anchors.imp,anchors.imp+'\nimport { openNursingGate } from "../mods/nursing-gate";\nimport { readQuizBattleContext } from "../mods/battle-context";');
capture=capture.replace(captureAnchors.imp,captureAnchors.imp+'\nimport { openNursingGate } from "../mods/nursing-gate";\nimport { readQuizBattleContext } from "../mods/battle-context";');
capture=capture.replace(captureAnchors.class,captureAnchors.class+'\n  // PATHOROGUE_CAPTURE_GATE\n  private pathoCaptureStarted = false;');
capture=capture.replace(captureAnchors.start,[
'  start() {',
'    // Validate before native inventory, animations or catch RNG are touched.',
'    if (this.pathoCaptureStarted) return;',
'    this.pathoCaptureStarted = true;',
'    if (!this.getPokemon()?.hp) { this.pathoContinueCapture(); return; }',
'    void openNursingGate("capture", readQuizBattleContext()).then(passed => {',
'      if (passed) this.pathoContinueCapture();',
'      else this.pathoCancelCapture();',
'    }, error => {',
'      console.error("PathoRogue capture quiz error; cancelling throw:", error);',
'      this.pathoCancelCapture();',
'    });',
'  }',
'',
'  private pathoCancelCapture(): void {',
'    super.start();',
'    globalScene.phaseManager.queueMessage("Capture check failed. No Poké Ball was used.");',
'    this.end();',
'  }',
'',
'  private pathoContinueCapture(): void {'
].join("\n"));
main=main.replace(/^(import "#app\/polyfills";[^\r\n]*\r?\n)/, '$1import { initNursingUI } from "./mods/nursing-gate"; // PATHOROGUE_UI_BOOT\n');
main=main.replace("async function startGame(): Promise<void> {", "async function startGame(): Promise<void> {\n  initNursingUI();");
const modFiles=["nursing-gate.ts","nursing-content.ts","question-rationales.ts","clinical-types.ts","clinical-bank.ts","clinical-gi.ts","clinical-renal.ts","clinical-renal-advanced-a.ts","clinical-renal-advanced-b.ts","clinical-msk.ts","question-builder.ts","disease-guide.ts","study-center.ts","quiz-effects.ts","battle-context.ts","quiz-battle-hud.ts","quiz-ball.png","quiz-stars.png"];
for(const name of modFiles){
  const source=path.join(__dirname,name);
  assert(fs.existsSync(source)&&fs.statSync(source).isFile()&&fs.statSync(source).size>0,"Missing or empty "+name);
  if(name.endsWith(".png"))assert(fs.readFileSync(source).subarray(0,8).toString("hex")==="89504e470d0a1a0a","Invalid PNG asset "+name);
}
fs.mkdirSync(md,{recursive:true});
for(const name of modFiles)fs.copyFileSync(path.join(__dirname,name),path.join(md,name));
fs.writeFileSync(file,s);
fs.writeFileSync(mainFile,main);
fs.writeFileSync(captureFile,capture);
if(over!==null)fs.writeFileSync(overFile,over);
console.log("PathoRogue question gate patched into original PokéRogue.");
