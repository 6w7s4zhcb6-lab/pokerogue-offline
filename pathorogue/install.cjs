#!/usr/bin/env node
"use strict";
const fs=require("node:fs"), path=require("node:path");
const root=path.resolve(process.argv[2]||"pokerogue-src");
const file=path.join(root,"src/phases/move-effect-phase.ts");
const mainFile=path.join(root,"src/main.ts");
const md=path.join(root,"src/mods");
const marker="PATHOROGUE_SUBSECTION_GATE_V1";
function assert(b,msg){if(!b)throw new Error("PathoRogue install: "+msg)}
assert(fs.existsSync(file),"Original move-effect-phase.ts missing at "+file);
assert(fs.existsSync(mainFile),"Original main.ts missing at "+mainFile);
let s=fs.readFileSync(file,"utf8");
let main=fs.readFileSync(mainFile,"utf8");
assert(!s.includes(marker),"Already patched");
assert(!main.includes("PATHOROGUE_UI_BOOT"),"UI already patched");
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
s=s.replace(anchors.class,anchors.class+'\n  // '+marker+'\n  private pathoGateOpened = false;\n  private pathoGatePending = false;\n  private pathoGatePassed = false;\n  private pathoGateMode: "attack" | "defense" | null = null;');
s=s.replace(anchors.start,[
'  public override start(): void {',
'    // '+marker+': ask once for a whole move, not once per hit or target.',
'    if (this.pathoGatePending) return;',
'    if (!this.pathoGateOpened) {',
'      const pathoUser = this.getUserPokemon();',
'      const pathoTargets = this.getTargets();',
'      const againstOpponent = !!pathoUser && pathoTargets.some(t => t && t.isPlayer() !== pathoUser.isPlayer());',
'      if (pathoUser && pathoUser.isActive(true) && againstOpponent && this.move.category !== MoveCategory.STATUS',
'          && !isFieldTargeted(this.move) && pathoUser.turnData.hitsLeft === -1) {',
'        this.pathoGateOpened = true;',
'        this.pathoGatePending = true;',
'        this.pathoGateMode = pathoUser.isPlayer() ? "attack" : "defense";',
'        void openNursingGate(this.pathoGateMode).then(passed => {',
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
'    if (user.isPlayer() !== target.isPlayer() && this.pathoGateMode === "attack" && !this.pathoGatePassed) {',
'      return [HitCheckResult.MISS, 0];',
'    }',
'    if (user.isPlayer() !== target.isPlayer() && this.pathoGateMode === "defense" && !this.pathoGatePassed) {',
'      return [HitCheckResult.HIT, effectiveness];',
'    }',
'    const moveAccuracy = move.calculateBattleAccuracy(user, target);'
].join("\n"));
s=s.replace(anchors.imp,anchors.imp+'\nimport { openNursingGate } from "../mods/nursing-gate";');
main=main.replace(/^(import "#app\/polyfills";[^\r\n]*\r?\n)/, '$1import { initNursingUI } from "./mods/nursing-gate"; // PATHOROGUE_UI_BOOT\n');
main=main.replace("async function startGame(): Promise<void> {", "async function startGame(): Promise<void> {\n  initNursingUI();");
const modFiles=["nursing-gate.ts","nursing-content.ts","quiz-effects.ts","quiz-ball.png","quiz-stars.png"];
for(const name of modFiles){
  const source=path.join(__dirname,name);
  assert(fs.existsSync(source)&&fs.statSync(source).isFile()&&fs.statSync(source).size>0,"Missing or empty "+name);
  if(name.endsWith(".png"))assert(fs.readFileSync(source).subarray(0,8).toString("hex")==="89504e470d0a1a0a","Invalid PNG asset "+name);
}
fs.mkdirSync(md,{recursive:true});
for(const name of modFiles)fs.copyFileSync(path.join(__dirname,name),path.join(md,name));
fs.writeFileSync(file,s);
fs.writeFileSync(mainFile,main);
console.log("PathoRogue question gate patched into original PokéRogue.");
