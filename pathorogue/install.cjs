#!/usr/bin/env node
"use strict";
const fs=require("node:fs"), path=require("node:path");
const root=path.resolve(process.argv[2]||"pokerogue-src");
const file=path.join(root,"src/phases/move-effect-phase.ts");
const md=path.join(root,"src/mods");
const marker="PATHOROGUE_SUBSECTION_GATE_V1";
function assert(b,msg){if(!b)throw new Error("PathoRogue install: "+msg)}
assert(fs.existsSync(file),"Original move-effect-phase.ts missing at "+file);
let s=fs.readFileSync(file,"utf8");
assert(!s.includes(marker),"Already patched");
const anchors={
  class:'  public readonly phaseName = "MoveEffectPhase";',
  start:'  public override start(): void {\n    super.start();',
  accuracy:'    const moveAccuracy = move.calculateBattleAccuracy(user, target);',
  imp:'import type { PostMoveInteractionAbAttrParams, PostMoveUsedAbAttrParams } from "#abilities/ab-attrs";'
};
for(const [k,v] of Object.entries(anchors)) assert(s.split(v).length===2,"Missing or duplicated "+k+" source anchor");
s=s.replace(anchors.class,anchors.class+'\n  // '+marker+'\n  private pathoGateOpened = false;\n  private pathoGatePassed = false;\n  private pathoGateMode: "attack" | "defense" | null = null;');
s=s.replace(anchors.start,[
'  public override start(): void {',
'    // '+marker+': ask once for a whole move, not once per hit or target.',
'    if (!this.pathoGateOpened) {',
'      const pathoUser = this.getUserPokemon();',
'      const pathoTargets = this.getTargets();',
'      const againstOpponent = !!pathoUser && pathoTargets.some(t => t && t.isPlayer() !== pathoUser.isPlayer());',
'      if (pathoUser && pathoUser.isActive(true) && againstOpponent && this.move.category !== MoveCategory.STATUS',
'          && !isFieldTargeted(this.move) && pathoUser.turnData.hitsLeft === -1) {',
'        this.pathoGateOpened = true;',
'        this.pathoGateMode = pathoUser.isPlayer() ? "attack" : "defense";',
'        void openNursingGate(this.pathoGateMode).then(passed => {',
'          this.pathoGatePassed = passed;',
'          this.start();',
'        }).catch(error => {',
'          console.error("PathoRogue question gate error; counting as incorrect:", error);',
'          this.pathoGatePassed = false;',
'          this.start();',
'        });',
'        return;',
'      }',
'      this.pathoGateOpened = true;',
'    }',
'    super.start();'
].join("\n"));
s=s.replace(anchors.accuracy,[
'    // '+marker+': original effectiveness/protection checks above are preserved.',
'    if (this.pathoGateMode === "attack" && !this.pathoGatePassed) {',
'      return [HitCheckResult.MISS, 0];',
'    }',
'    if (this.pathoGateMode === "defense" && !this.pathoGatePassed) {',
'      return [HitCheckResult.HIT, effectiveness];',
'    }',
'    const moveAccuracy = move.calculateBattleAccuracy(user, target);'
].join("\n"));
s=s.replace(anchors.imp,anchors.imp+'\nimport { openNursingGate } from "../mods/nursing-gate";');
for(const name of ["nursing-gate.ts","nursing-content.ts"])assert(fs.existsSync(path.join(__dirname,name)),"Missing "+name);
fs.mkdirSync(md,{recursive:true});
for(const name of ["nursing-gate.ts","nursing-content.ts"])fs.copyFileSync(path.join(__dirname,name),path.join(md,name));
fs.writeFileSync(file,s);
console.log("PathoRogue question gate patched into original PokéRogue.");
