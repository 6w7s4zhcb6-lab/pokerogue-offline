"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
function loadClinicalContext(globals={}) {
 const context=vm.createContext({console,...globals});
 const load=(name,exports)=>{
  const code=stripTypeScriptTypes(fs.readFileSync(path.join(__dirname,name),"utf8")).replace(/^import[^\n]*\r?\n/gm,"").replace(/export /g,"");
  const result=vm.runInContext(`(()=>{${code}\nreturn {${exports.join(",")}};})()`,context,{filename:name});Object.assign(context,result);return result;
 };
 load("nursing-content.ts",["nursingFacts"]);
 load("clinical-gi.ts",["giCases"]);load("clinical-renal.ts",["renalCases"]);load("clinical-msk.ts",["mskCases"]);
 load("clinical-renal-advanced-a.ts",["renalAdvancedA"]);load("clinical-renal-advanced-b.ts",["renalAdvancedB"]);
 load("clinical-bank.ts",["clinicalCases","getClinicalCase","validateClinicalBank"]);
 load("clinical-review-gi.ts",["giReviewVariants"]);load("clinical-review-renal.ts",["renalReviewVariants"]);load("clinical-review-msk.ts",["mskReviewVariants"]);
 load("clinical-review-bank.ts",["reviewVariants","caseVariants","validateReviewBank"]);
 load("question-builder.ts",["CLINICAL_DIFFICULTY","isIdentification","identificationLabel","buildChoices","clinicalExplanation"]);
 return {context,load};
}
module.exports={loadClinicalContext};
