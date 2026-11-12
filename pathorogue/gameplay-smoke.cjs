#!/usr/bin/env node
"use strict";

// Exercise the shipped game's menus and battles. CDP only observes the live
// Phaser scene and sends ordinary key/click input; it never calls the quiz,
// skips a phase, replaces combat logic, or exports answers from the renderer.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { stripTypeScriptTypes } = require("node:module");
const { launchExecutable, evaluate, hashFile } = require("./verify-build.cjs");

const STORAGE_KEY = "pokerogue.pathophysiology-gate.v3";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const KEY = {
  Space: [" ", "Space", 32], Enter: ["Enter", "Enter", 13],
  ArrowUp: ["ArrowUp", "ArrowUp", 38], ArrowDown: ["ArrowDown", "ArrowDown", 40],
  ArrowLeft: ["ArrowLeft", "ArrowLeft", 37], ArrowRight: ["ArrowRight", "ArrowRight", 39],
};

function loadBank() {
  const context = vm.createContext({});
  const source = stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, "nursing-content.ts"), "utf8"))
    .replace("export const nursingFacts", "const nursingFacts");
  vm.runInContext(`${source}\nthis.facts = nursingFacts;`, context);
  return context.facts;
}

async function key(cdp, name) {
  const [keyValue, code, virtual] = KEY[name];
  const params = { key: keyValue, code, windowsVirtualKeyCode: virtual, nativeVirtualKeyCode: virtual };
  await cdp.send("Input.dispatchKeyEvent", { ...params, type: "keyDown" });
  await delay(90);
  await cdp.send("Input.dispatchKeyEvent", { ...params, type: "keyUp" });
  await delay(170);
}

async function call(cdp, objectId, functionDeclaration, args = []) {
  const result = await cdp.send("Runtime.callFunctionOn", {
    objectId, functionDeclaration, arguments: args.map(value => ({ value })), returnByValue: true,
  });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function findScene(cdp, timeout = 120000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    // The production bundler may keep Phaser in module scope. Object.prototype
    // queryObjects also sees class instances, so locate the scene by its own
    // runtime fields without adding a game global or changing application code.
    const prototype = await cdp.send("Runtime.evaluate", { expression: "Object.prototype" });
    if (prototype.result?.objectId) {
      const instances = await cdp.send("Runtime.queryObjects", { prototypeObjectId: prototype.result.objectId });
      const result = await cdp.send("Runtime.callFunctionOn", {
        objectId: instances.objects.objectId,
        functionDeclaration: "function(){ return this.find(value=>Object.getOwnPropertyDescriptor(value,'phaseManager')?.value && Object.getOwnPropertyDescriptor(value,'ui')?.value && Object.getOwnPropertyDescriptor(value,'sys')?.value?.game) || null; }",
      });
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
      if (result.result?.objectId) return result.result.objectId;
    }
    await delay(500);
  }
  throw Error("No live Phaser BattleScene found in packaged EXE");
}

async function snapshot(cdp, scene) {
  return call(cdp, scene, `function(){
    const ui=this.ui, h=ui?.getHandler?.(), p=this.phaseManager?.getCurrentPhase?.();
    const pokemon=x=>({id:x.id,name:x.name||x.species?.name,hp:x.hp,maxHp:x.stats?.[0],species:x.species?.speciesId});
    let user=null,targets=[];
    try{user=p?.getUserPokemon?.();targets=p?.getTargets?.()||[];}catch{}
    const texts=[]; const seen=new Set();
    function walk(x,depth){if(!x||depth>5||seen.has(x)||x.visible===false)return;seen.add(x);if(typeof x.text==='string'&&x.text)texts.push(x.text);for(const child of x.list||[])walk(child,depth+1);}
    walk(ui,0);
    return {
      phase:p?.phaseName,mode:ui?.mode,cursor:h?.getCursor?.(),scroll:h?.scrollCursor||0,
      options:(h?.options||h?.config?.options||[]).map(o=>o.label),
      blockInput:h?.blockInput,filterMode:h?.filterMode,starter:h?.lastStarterId,
      starterCursor:h?.cursor,partySelected:h?.partyStarterIds?.length,
      gridCursorVisible:h?.cursorObj?.visible,filterVisible:h?.filterMode,
      player:(this.getPlayerParty?.()||[]).map(pokemon),enemy:(this.getEnemyParty?.()||[]).map(pokemon),
      turn:this.currentBattle?.turn,wave:this.currentBattle?.waveIndex,
      pathoMode:p?.pathoGateMode,pathoPassed:p?.pathoGatePassed,
      user:user?pokemon(user):null,targets:targets.map(pokemon),texts:texts.slice(-30),
    };
  }`);
}

async function chooseOption(cdp, scene, pattern) {
  let state = await snapshot(cdp, scene);
  const index = state.options.findIndex(label => pattern.test(label));
  if (index < 0) return false;
  for (let count = 0; count < state.options.length + 2; count++) {
    state = await snapshot(cdp, scene);
    if (state.cursor + state.scroll === index) break;
    await key(cdp, "ArrowDown");
  }
  await key(cdp, "Space");
  return true;
}

async function readQuestion(cdp) {
  return evaluate(cdp, `(()=>{
    const d=document.querySelector('#ng-overlay .ng-dialog');if(!d)return null;
    return {mode:d.dataset.mode,concept:d.dataset.concept,subsection:d.dataset.subsection,
      level:Number(d.dataset.level),review:d.dataset.review==='true',
      kicker:d.querySelector('.ng-kicker')?.textContent,stem:d.querySelector('h2')?.textContent,
      selectAll:d.textContent.includes('SELECT ALL THAT APPLY'),
      options:[...d.querySelectorAll('button[data-answer]')].map(b=>({index:Number(b.dataset.answer),text:b.textContent.replace(/^[A-F]\\.\\s*/,''),disabled:b.disabled})),
      rationales:[...d.querySelectorAll('button[data-rationale]')].map(b=>({index:Number(b.dataset.rationale),text:b.textContent.replace(/^\\d+\\.\\s*/,''),disabled:b.disabled})),
      feedback:d.querySelector('.ng-feedback')?.textContent||null};
  })()`);
}

async function clickIndex(cdp, attribute, index) {
  return evaluate(cdp, `(()=>{const b=document.querySelector('button[${attribute}="${index}"]:not([disabled])');if(!b)return false;b.click();return true;})()`);
}

async function answerQuestion(cdp, bank, question, policy) {
  const fact = bank.find(f => f.conceptId === question.concept && f.subsectionId === question.subsection);
  assert(fact, `Unknown shipped question: ${question.concept}/${question.subsection}`);
  const rightAnswers = question.selectAll ? fact.sata?.right : [fact.answer];
  assert(rightAnswers?.length, "Missing correct answer in local clinical bank");
  if (policy === "wrong-answer") {
    const wrong = question.options.find(o => !rightAnswers.includes(o.text));
    assert(wrong, "No wrong option available for negative test");
    await clickIndex(cdp, "data-answer", wrong.index);
  } else {
    for (const answer of rightAnswers) {
      const option = question.options.find(o => o.text === answer);
      assert(option, `Expected answer not rendered: ${answer}`);
      await clickIndex(cdp, "data-answer", option.index);
    }
  }
  if (question.selectAll) await evaluate(cdp, "document.querySelector('#ng-submit').click()");
  let updated = await readQuestion(cdp);
  if (policy === "wrong-rationale" || question.level >= 6) {
    assert(updated.rationales.length >= 2, "Advanced-tier question did not require a rationale choice");
  }
  const rationaleRequired = updated.rationales.length > 0;
  if (updated.rationales.length) {
    const rationale = updated.rationales.find(o => policy === "wrong-rationale" ? o.text !== fact.why : o.text === fact.why);
    assert(rationale, "Expected rationale choice not rendered");
    assert.equal(updated.feedback, null, "Rationale must be required before correctness feedback");
    await clickIndex(cdp, "data-rationale", rationale.index);
    updated = await readQuestion(cdp);
  }
  assert(updated.feedback?.includes("Rationale:"), "Graded question must show clinical rationale");
  const correct = policy === "correct";
  assert.equal(updated.feedback.startsWith("Correct"), correct, `Unexpected grade for ${policy}: ${updated.feedback}`);
  await evaluate(cdp, "document.querySelector('#ng-continue').click()");
  await delay(80);
  return { concept: fact.conceptId, subsection: fact.subsectionId, level: question.level, review: question.review, rationaleRequired, policy, correct };
}

async function advanceMenus(cdp, scene, state) {
  // Read menu labels, then send ordinary keys to the same handlers as a player.
  if (state.mode === 1) {
    if (!await chooseOption(cdp, scene, /^continue$/i)) await chooseOption(cdp, scene, /^new game$/i);
  } else if (state.mode === 15 || state.mode === 17) {
    if (!await chooseOption(cdp, scene, /^classic$/i)
      && !await chooseOption(cdp, scene, /add to party/i)
      && !await chooseOption(cdp, scene, /^(yes|male|boy)$/i)) await key(cdp, "Space");
  } else if (state.mode === 10 && !state.blockInput) {
    if (state.partySelected > 0) await key(cdp, "Enter");
    else if (state.filterMode) await key(cdp, "ArrowDown");
    else await key(cdp, "Space");
  } else if (state.mode === 2) {
    // Fight is the first cell in the standard 2x2 battle command menu.
    if (state.cursor === 1 || state.cursor === 3) await key(cdp, "ArrowLeft");
    if (state.cursor === 2 || state.cursor === 3) await key(cdp, "ArrowUp");
    await key(cdp, "Space");
  } else if (state.mode === 3) {
    // The default starter's first move is a damaging basic attack.
    await key(cdp, "Space");
  } else {
    await key(cdp, "Space");
  }
}

async function capture(cdp, folder, name) {
  const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(folder, name), Buffer.from(shot.data, "base64"));
}

function settleFailedMoves(report, state) {
  for (const gate of report.gates.filter(g => g.passed === false && !g.moveOutcome)) {
    if (!state.turn || state.turn < gate.before.turn) continue;
    const before = gate.mode === "attack" ? gate.before.enemy : gate.before.player;
    const after = gate.mode === "attack" ? state.enemy : state.player;
    const pairs = before.map(p => ({ before: p, after: after.find(q => q.id === p.id) })).filter(p => p.after);
    if (gate.mode === "attack") {
      if (state.turn === gate.before.turn && state.phase === "MoveEffectPhase" && state.pathoMode === "attack") continue;
      assert(pairs.length, "Failed attack target disappeared before damage verification");
      assert(pairs.every(p => p.after.hp === p.before.hp), "Failed attack changed enemy HP");
      gate.moveOutcome = "Enemy HP unchanged after failed player attack";
    } else {
      // The failed defense can faint the only party member; observe the HP
      // change during native damage/faint animation instead of awaiting a
      // command menu that will never appear after a loss.
      if (!pairs.some(p => p.after.hp < p.before.hp)) {
        if (state.turn > gate.before.turn && (state.mode === 2 || state.mode === 3)) {
          assert.fail("Failed defense did not allow the enemy to damage the player");
        }
        continue;
      }
      gate.moveOutcome = "Player HP fell after failed defense";
    }
    gate.outcomeState = state;
  }
}

async function playUntil(cdp, scene, bank, report, reportDir, predicate, { highTier = false, timeout = 240000 } = {}) {
  const deadline = Date.now() + timeout;
  let active = null;
  let lastStateKey = "";
  while (Date.now() < deadline) {
    const question = await readQuestion(cdp);
    const state = await snapshot(cdp, scene);
    const stateKey = JSON.stringify([state.phase, state.mode, state.options, state.partySelected, state.turn, state.wave]);
    if (stateKey !== lastStateKey) {
      report.navigation.push(state); lastStateKey = stateKey;
      console.log(`Gameplay: ${state.phase} / UI ${state.mode} / turn ${state.turn ?? "-"} / ${state.options.join(", ")}`);
    }
    if (question) {
      if (highTier) assert(question.level >= 6, "Persisted advanced difficulty was not restored");
      const match = question.kicker.match(/Question (\d+) of (\d+)/);
      assert(match, `Quiz counter missing: ${question.kicker}`);
      const number = Number(match[1]);
      const required = Number(match[2]);
      assert.equal(required, question.mode === "attack" ? 3 : 2);
      assert.equal(state.phase, "MoveEffectPhase", "Quiz must originate in actual game's battle phase");
      if (number === 1) {
        const already = report.gates.filter(g => g.mode === question.mode && g.highTier === highTier);
        let policy = already.some(g => g.passed) ? "wrong-answer" : "correct";
        if (highTier) policy = already.some(g => g.passed) ? "wrong-rationale" : "correct";
        active = { mode: question.mode, highTier, policy, required, before: state, questions: [] };
        report.gates.push(active);
        await capture(cdp, reportDir, `gameplay-${report.gates.length}-${question.mode}.png`);
      }
      assert(active, "Gate continuation missing initial question");
      assert.equal(question.concept, active.questions[0]?.concept || question.concept);
      assert(!active.questions.some(q => q.subsection === question.subsection), "Gate repeated subsection");
      const policy = active.policy !== "correct" && number === 1 ? active.policy : "correct";
      active.questions.push(await answerQuestion(cdp, bank, question, policy));
      if (policy !== "correct" || number === required) {
        active.passed = policy === "correct";
        assert.equal(active.questions.length, active.passed ? required : 1);
        await delay(250);
        active.after = await snapshot(cdp, scene);
        active = null;
      }
    } else {
      settleFailedMoves(report, state);
      if (predicate(report)) return;
      await advanceMenus(cdp, scene, state);
      await delay(300);
    }
  }
  throw Error(`Gameplay smoke timed out. Last state: ${JSON.stringify(await snapshot(cdp, scene))}`);
}

async function verifyGameplay(exe, reportDir, existingSession = null) {
  fs.mkdirSync(reportDir, { recursive: true });
  const bank = loadBank();
  const session = existingSession || await launchExecutable(exe);
  const report = { verifiedAt: new Date().toISOString(), executable: path.basename(exe), sha256: await hashFile(exe),
    offline: true, unbundledAppPath: session.appPath || null, testOnlyNoSandboxFlag: !!session.testNoSandbox,
    navigation: [], gates: [], checks: {} };
  try {
    await session.cdp.send("Page.bringToFront");
    await session.cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    let scene = await findScene(session.cdp);
    const basicDone = r => ["attack", "defense"].every(mode => r.gates.some(g => !g.highTier && g.mode === mode && g.passed)
      && r.gates.some(g => !g.highTier && g.mode === mode && !g.passed && g.moveOutcome));
    await playUntil(session.cdp, scene, bank, report, reportDir, basicDone);
    report.checks.realAttackThreeCorrect = true;
    report.checks.realDefenseTwoCorrect = true;
    report.checks.sameConceptDistinctSubsections = true;
    report.checks.wrongAnswerFailsGate = true;
    report.checks.failedAttackDealsNoDamage = true;
    report.checks.failedDefenseAllowsEnemyDamage = true;
    const stored = await evaluate(session.cdp, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
    assert(stored.totalAnswers > 0 && stored.correctAnswers > 0, "Battle answers were not saved offline");
    // Seed valid imported progress only in the disposable test profile to reach
    // an advanced tier without fifty warm-up questions. Quiz rules are intact.
    await evaluate(session.cdp, `(()=>{const s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}));s.banks.patho.tier=5;localStorage.setItem(${JSON.stringify(STORAGE_KEY)},JSON.stringify(s));location.reload();})()`);
    await delay(1500);
    scene = await findScene(session.cdp);
    const reloaded = await evaluate(session.cdp, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
    assert.equal(reloaded.totalAnswers, stored.totalAnswers);
    assert.equal(reloaded.correctAnswers, stored.correctAnswers);
    report.checks.answerProgressSurvivesReload = true;
    report.highTierSetup = "Valid persisted quiz progress set to tier 6 in disposable profile, then EXE renderer reloaded; game and quiz functions unchanged.";
    await playUntil(session.cdp, scene, bank, report, reportDir,
      r => r.gates.some(g => g.highTier && g.passed) && r.gates.some(g => g.highTier && g.policy === "wrong-rationale" && !g.passed), { highTier: true });
    report.checks.highTierRequiresCorrectRationale = true;
    await capture(session.cdp, reportDir, "gameplay-completed.png");
    report.finalProgress = await evaluate(session.cdp, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
    report.exceptions = session.cdp.events.filter(e => e.method === "Runtime.exceptionThrown");
    assert.equal(report.exceptions.length, 0, "Packaged gameplay threw an exception");
    console.log(JSON.stringify({ checks: report.checks, gates: report.gates.length }, null, 2));
    return report;
  } catch (error) {
    report.error = String(error.stack || error);
    try { await capture(session.cdp, reportDir, "gameplay-failure.png"); } catch {}
    throw error;
  } finally {
    fs.writeFileSync(path.join(reportDir, "gameplay-report.json"), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(reportDir, "gameplay-console.log"), session.output());
    session.cdp.close(); session.cleanup();
  }
}

module.exports = { verifyGameplay, findScene, snapshot, readQuestion, advanceMenus, answerQuestion };
if (require.main === module) {
  const args = process.argv.slice(2), at = key => args[args.indexOf(key) + 1];
  assert(args.includes("--exe"), "Usage: node gameplay-smoke.cjs --exe FILE [--app UNBUNDLED_FOLDER] --report-dir FOLDER");
  const exe = path.resolve(at("--exe"));
  (args.includes("--app") ? launchExecutable(exe, { appPath: at("--app") }) : Promise.resolve(null))
    .then(session => verifyGameplay(exe, path.resolve(args.includes("--report-dir") ? at("--report-dir") : "verification"), session))
    .catch(error => { console.error(error); process.exitCode = 1; });
}
