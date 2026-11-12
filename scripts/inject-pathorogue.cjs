#!/usr/bin/env node
"use strict";
/* Build-time integration with unmodified official PokéRogue source.
 * Called after scripts/apply-patches.sh exe and before pnpm build:app.
 * Fails closed on source drift; leaves original battle checks intact.
 */
const fs=require("node:fs"),path=require("node:path");
const host=path.resolve(__dirname,"..");
const root=path.join(host,"pokerogue-src");
const catalog=fs.readFileSync(path.join(host,"pathorogue","PATHOPHYSIOLOGY_CONCEPTS.md"),"utf8");
const sourcePath=path.join(root,"src","phases","move-effect-phase.ts");
const mods=path.join(root,"src","mods");
if(!fs.existsSync(sourcePath))throw Error("Official PokéRogue move-effect-phase.ts not found.");
const facts=[];let objective="",group="",concept="",source="",conceptId="",number=0;
function slug(s){return s.normalize("NFKD").replace(/[^\w]+/g,"_").replace(/^_|_$/g,"").toLowerCase();}
for(const raw of catalog.split(/\r?\n/)){
 const line=raw.trim();
 let m=line.match(/^### (GI|REN|MSK)-(\d+):\s*(.*)$/);
 if(m){group=m[1];objective=m[1]+"-"+m[2];continue;}
 m=line.match(/^\*\*(.+?)\*\*\s+[—–-]\s+(.+)$/);
 if(m&&group){concept=m[1];source=m[2];conceptId=objective+"_"+slug(concept);number=0;continue;}
 m=line.match(/^-\s+\*\*(.+?):\*\*\s+(.+)$/);
 if(m&&concept&&group){
  const subsection=m[1],lesson=m[2];number++;
  facts.push({id:conceptId+"_"+number,conceptId,concept,objective,group,subsection,lesson,source});
 }
}
const conceptCount=new Set(facts.map(f=>f.conceptId)).size;
if(facts.length!==687||conceptCount!==96){
 throw Error("Question bank count changed unexpectedly: "+facts.length+" subsections; "+conceptCount+" concepts (need 687 / 96).");
}
fs.mkdirSync(mods,{recursive:true});
fs.writeFileSync(path.join(mods,"patho-facts.ts"),
  "/* Generated from PATHOPHYSIOLOGY_CONCEPTS.md. Do not edit directly. */\n"+
  "export type PathoFact = {id:string;conceptId:string;concept:string;objective:string;group:string;subsection:string;lesson:string;source:string};\n"+
  "export const pathoFacts: PathoFact[] = "+JSON.stringify(facts,null,2)+";\n");
fs.copyFileSync(path.join(host,"pathorogue","patho-gate.ts"),path.join(mods,"patho-gate.ts"));
let src=fs.readFileSync(sourcePath,"utf8");
const marker="// PATHOROGUE_OFFLINE_QUESTION_CHECK_V4";
const importAnchor='import type { PostMoveInteractionAbAttrParams, PostMoveUsedAbAttrParams } from "#abilities/ab-attrs";\n';
const classAnchor='  public readonly phaseName = "MoveEffectPhase";';
const startAnchor="  public override start(): void {\n    super.start();";
const accuracyAnchor="    const moveAccuracy = move.calculateBattleAccuracy(user, target);";
function exactlyOnce(needle,label){const count=src.split(needle).length-1;if(count!==1)throw Error("Source drift at "+label+"; matches="+count);}
if(src.includes(marker)){console.log("PathoRogue patch already applied.");process.exit(0);}
for(const [needle,label] of [[importAnchor,"imports"],[classAnchor,"phase class"],[startAnchor,"phase start"],[accuracyAnchor,"native accuracy"]])exactlyOnce(needle,label);
src=src.replace(importAnchor,importAnchor+'import { openNursingGate } from "../mods/patho-gate";\n');
src=src.replace(classAnchor,classAnchor+"\n  "+marker+
 '\n  private pathoGateOpened = false;'+
 '\n  private pathoGatePassed = false;'+
 '\n  private pathoGateMode: "attack" | "defense" | null = null;');
const startReplacement=[
"  public override start(): void {",
"    "+marker,
"    if (!this.pathoGateOpened) {",
"      const pathoUser = this.getUserPokemon();",
"      const pathoTargets = this.getTargets();",
"      const opponent = pathoUser && pathoTargets.some(t => t && t.isPlayer() !== pathoUser.isPlayer());",
"      if (pathoUser && pathoUser.isActive(true) && opponent",
"        && this.move.category !== MoveCategory.STATUS",
"        && !isFieldTargeted(this.move)",
"        && pathoUser.turnData.hitsLeft === -1) {",
"        this.pathoGateOpened = true;",
'        const mode = pathoUser.isPlayer() ? "attack" : "defense";',
"        this.pathoGateMode = mode;",
"        void openNursingGate(mode).then(passed => {",
"          this.pathoGatePassed = passed;",
"          this.start();",
"        }).catch(error => {",
'          console.error("PathoRogue question error; treating as wrong:", error);',
"          this.pathoGatePassed = false;",
"          this.start();",
"        });",
"        return;",
"      }",
"      this.pathoGateOpened = true;",
"    }",
"    super.start();"
].join("\n");
src=src.replace(startAnchor,startReplacement);
const accuracyReplacement=[
"    // "+marker+"; prior immunity/Protect/etc checks remain intact.",
'    if (this.pathoGateMode === "attack" && !this.pathoGatePassed) {',
"      return [HitCheckResult.MISS, 0];",
"    }",
'    if (this.pathoGateMode === "defense" && !this.pathoGatePassed) {',
"      return [HitCheckResult.HIT, effectiveness];",
"    }",
"    const moveAccuracy = move.calculateBattleAccuracy(user, target);"
].join("\n");
src=src.replace(accuracyAnchor,accuracyReplacement);
fs.writeFileSync(sourcePath,src);
console.log("PathoRogue: patched real PokéRogue move phase; "+conceptCount+" concepts, "+facts.length+" subsections.");
