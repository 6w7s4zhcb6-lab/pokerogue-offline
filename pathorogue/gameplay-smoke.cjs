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
 const {context}=require('./clinical-test-loader.cjs').loadClinicalContext();
 context.validateClinicalBank();
 context.validateReviewBank();
 return context.nursingFacts.map(f=>({...f,answer:context.getClinicalCase(f).answer,why:context.getClinicalCase(f).why,variants:context.caseVariants(f),identification:context.isIdentification(f),sata:undefined,expert:undefined}));
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
      pokeballs:{...this.pokeballCounts},
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
    const d=document.querySelector('#ng-overlay .ng-dialog[data-mode]');if(!d)return null;
    return {mode:d.dataset.mode,caseId:d.dataset.caseId,concept:d.dataset.concept,subsection:d.dataset.subsection,
      level:Number(d.dataset.level),review:d.dataset.review==='true',retention:d.dataset.retention==='true',identification:d.dataset.identification==='true',
      kicker:d.querySelector('.ng-kicker')?.textContent,stem:d.querySelector('h2')?.textContent,header:d.querySelector('.ng-detail')?.textContent,
      selectAll:d.textContent.includes('SELECT ALL THAT APPLY'),
      options:[...d.querySelectorAll('button[data-answer]')].map(b=>({index:Number(b.dataset.answer),text:b.textContent.replace(/^[A-F]\\.\\s*/,''),disabled:b.disabled})),
      rationales:[...d.querySelectorAll('button[data-rationale]')].map(b=>({index:Number(b.dataset.rationale),text:b.textContent.replace(/^\\d+\\.\\s*/,''),disabled:b.disabled})),
      feedback:d.querySelector('.ng-feedback')?.textContent||null};
  })()`);
}

async function clickIndex(cdp, attribute, index) {
  return evaluate(cdp, `(()=>{const b=document.querySelector('button[${attribute}="${index}"]:not([disabled])');if(!b)return false;b.click();return true;})()`);
}

async function installAudioProbe(cdp) {
  // Observe the browser's real audio scheduling; this does not play substitute
  // sounds or change a question's grade.
  await evaluate(cdp, `(()=>{
    if(window.__pathorogueAudioProbe)return;
    const events=[];window.__pathorogueAudioProbe={events};
    for(const name of ['OscillatorNode','AudioBufferSourceNode']){
      const prototype=window[name]?.prototype;if(!prototype)continue;
      const original=prototype.start;
      prototype.start=function(...args){events.push({kind:name,type:this.type||'buffer',frequency:this.frequency?.value||null,at:performance.now()});return original.apply(this,args);};
    }
  })()`);
}

async function readEffects(cdp) {
  return evaluate(cdp, `(()=>{
    const root=document.querySelector('#ng-overlay .ng-effects');if(!root)return null;
    const stars=[...root.querySelectorAll('.ng-star')].map(s=>({color:s.dataset.color||getComputedStyle(s).getPropertyValue('--star-color').trim()||getComputedStyle(s).color,fill:getComputedStyle(s).fill,background:getComputedStyle(s).backgroundColor}));
    const balls=[...root.querySelectorAll('.ng-ball')].map(b=>({side:b.dataset.side,state:b.dataset.state,classes:b.className,animation:getComputedStyle(b).animationName,animations:b.getAnimations({subtree:true}).map(a=>({name:a.animationName,state:a.playState,startTime:a.startTime,currentTime:a.currentTime}))}));
    return {dataset:{...root.dataset},stars,balls,sparkles:[...root.querySelectorAll('.ng-star-sparkle')].map(s=>({animation:getComputedStyle(s).animationName,transform:getComputedStyle(s).transform,opacity:getComputedStyle(s).opacity})),confetti:[...root.querySelectorAll('.ng-confetti')].map(c=>({color:c.dataset.diseaseColor,concept:c.dataset.concept,emitters:JSON.parse(c.dataset.emitters||"[]"),born:Number(c.dataset.born)})),pointerEvents:getComputedStyle(root).pointerEvents};
  })()`);
}

async function checkBattleHUD(cdp, state) {
  const hud = await evaluate(cdp, `(async()=>{
    const root=document.querySelector('#ng-overlay .ng-battle-hud');if(!root)return null;
    await Promise.all([...root.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));
    return {current:[...root.querySelectorAll('.ng-current')].map(e=>({side:e.dataset.side,id:e.dataset.pokemonId,hp:Number(e.dataset.hp),maxHp:Number(e.dataset.maxHp)})),
      parties:[...root.querySelectorAll('.ng-party')].map(e=>({side:e.dataset.side,slots:[...e.querySelectorAll('.ng-party-slot')].map(s=>({id:s.dataset.pokemonId,hp:Number(s.dataset.hp),fainted:s.classList.contains('is-fainted'),empty:s.classList.contains('is-empty')}))})),
      icons:[...root.querySelectorAll('img')].map(i=>({complete:i.complete,width:i.naturalWidth}))};
  })()`);
  assert(hud, 'Quiz is missing battle health and party displays');
  for (const side of ['player', 'enemy']) {
    const party = state[side];
    const active = hud.current.find(p => p.side === side);
    const actual = party.find(p => String(p.id) === active.id);
    assert(actual, `${side} current Pokémon is not in the battle party`);
    assert.equal(active.hp, actual.hp, `${side} displayed HP differs from battle`);
    assert.equal(active.maxHp, actual.maxHp, `${side} displayed maximum HP differs from battle`);
    const slots = hud.parties.find(p => p.side === side).slots;
    assert.equal(slots.length, 6, `${side} must display six party slots`);
    party.slice(0, 6).forEach((p, index) => {
      assert.equal(slots[index].id, String(p.id));
      assert.equal(slots[index].hp, p.hp);
      assert.equal(slots[index].fainted, p.hp === 0);
    });
    assert(slots.slice(party.length).every(s => s.empty), 'Unused party slots must remain empty');
  }
  assert(hud.icons.length >= 4 && hud.icons.every(i => i.complete && i.width > 0), 'Offline Pokémon icons failed to load');
  return hud;
}

async function checkLayout(cdp, reportDir, width, height) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await delay(150);
  const layout = await evaluate(cdp, `(()=>{
    const overlay=document.querySelector('#ng-overlay'),dialog=overlay.querySelector('.ng-dialog');
    const rect=dialog.getBoundingClientRect(),buttons=[...dialog.querySelectorAll('button[data-answer]')];
    const originalScroll=dialog.scrollTop;
    const initialButtons=buttons.map(b=>{const r=b.getBoundingClientRect(),top=Math.max(r.top,rect.top),bottom=Math.min(r.bottom,rect.bottom);return {left:r.left,right:r.right,font:parseFloat(getComputedStyle(b).fontSize),visible:bottom>top,uncovered:bottom>top?document.elementFromPoint(r.left+r.width/2,(top+bottom)/2)?.closest('button')===b:true};});
    const reachable=buttons.map(b=>{b.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});const r=b.getBoundingClientRect();return r.top>=rect.top&&r.bottom<=rect.bottom&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('button')===b;});
    dialog.scrollTop=originalScroll;
    return {width:innerWidth,height:innerHeight,dialog:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width},horizontalOverflow:overlay.scrollWidth-overlay.clientWidth,
      decorations:[...overlay.querySelectorAll('.ng-current,.ng-party,.ng-effects-controls')].map(e=>{const r=e.getBoundingClientRect();return {kind:e.className,left:r.left,right:r.right,top:r.top,bottom:r.bottom};}),
      headingFont:parseFloat(getComputedStyle(dialog.querySelector('h2')).fontSize),
      buttons:initialButtons.map((b,i)=>({...b,reachable:reachable[i]}))};
  })()`);
  assert(layout.dialog.left >= 0 && layout.dialog.right <= width + 1, `Quiz dialog exceeds ${width}px viewport`);
  assert(layout.horizontalOverflow <= 1, `Quiz requires horizontal scrolling at ${width}px`);
  assert(layout.headingFont >= 18, 'Quiz heading became too small to read');
  assert(layout.buttons.every(b => b.left >= 0 && b.right <= width + 1 && b.font >= 12 && b.uncovered && b.reachable), 'Quiz graphics cover answer controls or answer text exceeds viewport');
  assert(layout.buttons.some(b => b.visible), 'No answer control visible on initial prompt');
  for (const box of layout.decorations) {
    const overlapWidth = Math.min(box.right, layout.dialog.right) - Math.max(box.left, layout.dialog.left);
    const overlapHeight = Math.min(box.bottom, layout.dialog.bottom) - Math.max(box.top, layout.dialog.top);
    assert(overlapWidth <= 1 || overlapHeight <= 1, `${box.kind} visually overlaps the quiz at ${width}px`);
    assert(box.left >= 0 && box.right <= width && box.top >= 0 && box.bottom <= height, `${box.kind} exceeds the quiz viewport`);
  }
  await capture(cdp, reportDir, `quiz-effects-${width}-layout.png`);
  return layout;
}

function activeBall(effects, mode) {
  return effects.balls.find(b => b.side === 'player');
}

function assertSynchronized(effects, animationName) {
  const animations = effects.balls.map(ball => ball.animations.find(a => a.name === animationName && a.state === 'running'));
  assert(animations.length === 2 && animations.every(Boolean), `Both balls must run ${animationName}`);
  assert(animations.every(a => typeof a.startTime === 'number' && Number.isFinite(a.startTime) && typeof a.currentTime === 'number' && Number.isFinite(a.currentTime)), `${animationName} has no live animation timeline`);
  assert(Math.abs(animations[0].startTime - animations[1].startTime) < 1, `${animationName} ball start times differ`);
  assert(Math.abs(animations[0].currentTime - animations[1].currentTime) < 1, `${animationName} ball phases differ`);
}

function ballAnimating(ball, name) {
  const stem = name === 'bounce' ? 'bounc' : name;
  return !!ball && (String(ball.state).includes(stem) || String(ball.classes).includes(stem)
    || String(ball.animation).includes(stem) || ball.animations.some(a => String(a.name).includes(stem) && a.state === 'running'));
}

async function armQuestionProbe(cdp) {
  function installInRenderer() {
    window.__pathorogueQuestionProbe?.disconnect();
    const overlay = document.querySelector('#ng-overlay');
    const root = overlay?.querySelector('.ng-effects');
    if (!root) throw Error('Quiz effects absent before grading');
    const subsection = overlay.querySelector('.ng-dialog').dataset.subsection;
    const question = () => {
      const d = overlay.querySelector('.ng-dialog');
      if (!d) return null;
      return { mode: d.dataset.mode, concept: d.dataset.concept, subsection: d.dataset.subsection,
        level: Number(d.dataset.level), review: d.dataset.review === 'true',
        kicker: d.querySelector('.ng-kicker')?.textContent, selectAll: d.textContent.includes('SELECT ALL THAT APPLY'),
        options: [...d.querySelectorAll('button[data-answer]')].map(b => ({ index: Number(b.dataset.answer), text: b.textContent.replace(/^[A-F]\.\s*/, ''), disabled: b.disabled })),
        rationales: [...d.querySelectorAll('button[data-rationale]')].map(b => ({ index: Number(b.dataset.rationale), text: b.textContent.replace(/^\d+\.\s*/, ''), disabled: b.disabled })),
        feedback: d.querySelector('.ng-feedback')?.textContent || null };
    };
    const effects = () => ({ connected: root.isConnected, dataset: { ...root.dataset },
      stars: [...root.querySelectorAll('.ng-star')].map(s => ({ color: s.dataset.color, background: getComputedStyle(s).backgroundColor })),
      balls: [...root.querySelectorAll('.ng-ball')].map(b => ({ side: b.dataset.side, state: b.dataset.state, classes: b.className,
        animation: getComputedStyle(b).animationName, animations: b.getAnimations({ subtree: true }).map(a => ({ name: a.animationName, state: a.playState, startTime: a.startTime, currentTime: a.currentTime })) })),
      confetti: [...root.querySelectorAll('.ng-confetti')].map(c => ({ color: c.dataset.diseaseColor, concept: c.dataset.concept, emitters: JSON.parse(c.dataset.emitters||"[]"),born:Number(c.dataset.born) })),
      pointerEvents: getComputedStyle(root).pointerEvents });
    const probe = { events: [], feedback: null, continuedAt: null, advancedAt: null, question, effects,
      audioStart: window.__pathorogueAudioProbe.events.length };
    const sample = (kind, detail = {}) => {
      const entry = { kind, at: performance.now(), effects: effects(), ...detail };
      probe.events.push(entry);
      return entry;
    };
    const animation = event => {
      if (event.target.closest?.('.ng-effects')) sample(event.type, { animationName: event.animationName, side: event.target.closest('.ng-ball')?.dataset.side });
    };
    const observer = new MutationObserver(() => {
      sample('mutation');
      if (!overlay.isConnected || question()?.subsection !== subsection) {
        probe.advancedAt = performance.now();
        sample(overlay.isConnected ? 'next-question' : 'overlay-removed');
        probe.disconnect();
      }
    });
    probe.disconnect = () => { observer.disconnect(); overlay.removeEventListener('animationstart', animation, true); overlay.removeEventListener('animationend', animation, true); };
    probe.sample = sample;
    probe.captureFeedback = () => {
      const q = question();
      if (q?.feedback && !probe.feedback) probe.feedback = { at: performance.now(), question: q, effects: effects() };
      return q;
    };
    probe.continue = () => {
      const button = overlay.querySelector('#ng-continue:not([disabled])');
      if (!button) throw Error('Continue control not available after grading');
      probe.continuedAt = performance.now(); sample('continue-click');
      button.click(); sample('after-continue');
    };
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true,
      attributeFilter: ['class', 'data-feedback', 'data-audio-state', 'data-sound-correct-count', 'data-sound-wrong-count', 'data-prompt-count'] });
    overlay.addEventListener('animationstart', animation, true);
    overlay.addEventListener('animationend', animation, true);
    sample('armed');
    window.__pathorogueQuestionProbe = probe;
    return { prompt: effects(), audioStart: probe.audioStart };
  }
  return evaluate(cdp, `(${installInRenderer.toString()})()`);
}

async function clickQuizControl(cdp, selector, quickContinue) {
  return evaluate(cdp, `(()=>{
    const button=document.querySelector(${JSON.stringify(selector)});if(!button)throw Error('Quiz control missing');
    button.click();
    const probe=window.__pathorogueQuestionProbe;
    const question=probe.captureFeedback();
    if(${!!quickContinue}&&question?.feedback){probe.quickContinueSameTask=true;probe.continue();}
    return question;
  })()`);
}

async function finishQuestionProbe(cdp) {
  return evaluate(cdp, `new Promise((resolve,reject)=>{
    const probe=window.__pathorogueQuestionProbe,deadline=performance.now()+6000;
    const inspect=()=>{
      if(probe.advancedAt){resolve({feedback:probe.feedback,events:probe.events,continuedAt:probe.continuedAt,advancedAt:probe.advancedAt,quickContinueSameTask:!!probe.quickContinueSameTask,
        audio:window.__pathorogueAudioProbe.events.slice(probe.audioStart)});return;}
      if(performance.now()>deadline){probe.disconnect();reject(Error('Quiz animation did not release the next game step'));return;}
      setTimeout(inspect,20);
    };inspect();
  })`);
}

async function answerQuestion(cdp, bank, question, policy, effectTest = null) {
  const fact = bank.find(f => f.conceptId === question.concept && f.subsectionId === question.subsection);
  assert(fact, `Unknown shipped question: ${question.concept}/${question.subsection}`);
  assert.equal(fact.variants.find(v=>v.id===question.caseId)?.stem,question.stem,'Rendered case does not match its shipped clinical variant');
  const rightAnswers = question.selectAll ? fact.sata?.right : [fact.answer];
  assert(rightAnswers?.length, "Missing correct answer in local clinical bank");
  const finalCorrect = policy === 'correct' && /Question (\d+) of \1$/.test(question.kicker);
  const probe = effectTest ? await armQuestionProbe(cdp) : null;
  const click = async selector => effectTest
    ? clickQuizControl(cdp, selector, finalCorrect)
    : (await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).click()`), readQuestion(cdp));
  let updated;
  if (policy === "wrong-answer") {
    const wrong = question.options.find(o => !rightAnswers.includes(o.text));
    assert(wrong, "No wrong option available for negative test");
    updated = await click(`button[data-answer="${wrong.index}"]:not([disabled])`);
  } else {
    for (const answer of rightAnswers) {
      const option = question.options.find(o => o.text === answer);
      assert(option, `Expected answer not rendered: ${answer}`);
      updated = await click(`button[data-answer="${option.index}"]:not([disabled])`);
    }
  }
  if (question.selectAll) updated = await click('#ng-submit:not([disabled])');
  assert.equal(updated.rationales.length, 0, "Clinical single-best-answer cases must grade the selected answer directly");
  const rationaleRequired = false;
  assert(updated.feedback?.includes("Rationale:"), "Graded question must show clinical rationale");
  const correct = policy === "correct";
  assert.equal(updated.feedback.startsWith("Correct"), correct, `Unexpected grade for ${policy}: ${updated.feedback}`);
  let effects;
  if (effectTest) {
    // The snapshot is captured inside the same renderer turn as grading. CDP
    // latency cannot make us miss the short bounce/confetti interval.
    const captured = await evaluate(cdp, 'window.__pathorogueQuestionProbe.feedback');
    effects = { prompt: probe.prompt, feedback: captured.effects };
    if (correct) {
      assert(effects.feedback.confetti.length > 0, 'Correct answer did not render confetti');
      for(const burst of effects.feedback.confetti){assert.deepEqual(burst.emitters.map(e=>e.side),['player','enemy']);assert(burst.emitters[0].x<burst.emitters[1].x,'Confetti must originate from opposite balls');assert(Number.isFinite(burst.born),'Both streams need a shared launch timestamp');}
      assert(effects.feedback.confetti.every(c => c.color === effects.feedback.dataset.diseaseColor && c.concept === question.concept), 'Confetti does not match the current disease color/concept');
      assert(effects.feedback.balls.every(b => ballAnimating(b, 'bounce')), 'Correct answer did not bounce both balls');
      assertSynchronized(effects.feedback, 'ng-quiz-bounce');
    } else {
      assert.equal(effects.feedback.stars.length, 3, 'Wrong feedback lost the three stars');
      assert(effects.feedback.stars.every(s => s.color.toLowerCase() === '#ff425c'), `Wrong feedback stars are not red: ${JSON.stringify(effects.feedback.stars)}`);
      assert(effects.feedback.stars.every(s => s.background === 'rgb(255, 66, 92)'), `Wrong feedback must render red immediately: ${JSON.stringify(effects.feedback.stars)}`);
    }
    assert.equal(effects.feedback.dataset.feedback, correct ? 'correct' : 'wrong', 'Effects do not match actual question grade');
    const label = correct ? 'correct-feedback' : 'wrong-red';
    const screenshotKey = `${question.mode}-${label}`;
    if (!finalCorrect && !effectTest.report.effectScreenshots.includes(screenshotKey)) {
      await capture(cdp, effectTest.reportDir, `quiz-effects-${screenshotKey}.png`);
      effectTest.report.effectScreenshots.push(screenshotKey);
    }
  }
  if (!finalCorrect) {
    const rationaleView = await evaluate(cdp, `(()=>{
      const container=document.querySelector('#ng-option-rationales'),button=document.querySelector('#ng-reveal-rationales');
      const before=container?getComputedStyle(container).display==='none'||container.hidden:null;
      if(button&&${correct})button.click();
      const guide=container?.querySelector('.ng-disease-guide');
      return {before,hasReveal:!!button,visible:!!container&&!container.hidden&&getComputedStyle(container).display!=='none',options:[...(container?.querySelectorAll('.ng-option-rationale')||[])].map(e=>({index:Number(e.dataset.answer),correct:e.dataset.correct,text:e.textContent})),guide:guide?{concept:guide.dataset.guideConcept,text:guide.textContent,paragraphs:[...guide.querySelectorAll('p')].map(p=>p.textContent)}:null};
    })()`);
    assert.equal(rationaleView.options.length, question.options.length, 'Every rendered answer must have an explanation');
    assert(rationaleView.options.every(e => e.text.length > 30), 'Answer explanation is missing substantive context');
    assert.equal(rationaleView.visible, true, 'Answer explanations cannot be revealed');
    assert(rationaleView.guide, 'Rationale panel is missing About this condition');
    assert.equal(rationaleView.guide.concept, question.concept, 'Disease guide describes a different concept');
    assert(rationaleView.guide.text.includes('What it is:'), 'Disease guide lacks a definition');
    assert(rationaleView.guide.paragraphs.length >= 4 && rationaleView.guide.paragraphs.slice(1,4).every(p=>p.length>35), 'Disease guide lacks substantive definition, causes or manifestations');
    if(effectTest) effectTest.report.diseaseGuideVerified=true;
    if (correct) {
      assert.equal(rationaleView.before, true, 'Correct-answer explanations must be optional and initially collapsed');
      assert.equal(rationaleView.hasReveal, true, 'Correct answer lacks Reveal rationales control');
    } else assert.equal(rationaleView.before, false, 'Wrong-answer explanations should open automatically');
    if (effectTest) effectTest.report.optionRationalesVerified = true;
  }
  if (!effectTest) await evaluate(cdp, "document.querySelector('#ng-continue').click()");
  else if (!finalCorrect) await evaluate(cdp, 'window.__pathorogueQuestionProbe.continue()');
  if (effectTest && finalCorrect) {
    // The observer is authoritative. A screenshot is useful when CI receives
    // the result while the animation is still visible, but is timing dependent.
    const visible = await readEffects(cdp);
    if (visible && ballAnimating(activeBall(visible, question.mode), 'spin')) {
      await capture(cdp, effectTest.reportDir, `quiz-effects-${question.mode}-completion.png`);
      effects.completionScreenshot = 'Captured during visible spin';
    } else effects.completionScreenshot = 'Spin interval recorded in renderer; host arrived after visible interval';
  }
  if (effectTest) {
    const recorded = await finishQuestionProbe(cdp);
    effects.audio = recorded.audio;
    effects.timeline = recorded.events;
    effects.timing = { gradedAt: recorded.feedback.at, continuedAt: recorded.continuedAt, advancedAt: recorded.advancedAt,
      continueAfterGradeMs: recorded.continuedAt - recorded.feedback.at, visibleAfterContinueMs: recorded.advancedAt - recorded.continuedAt };
    assert(recorded.audio.length > 0, `${correct ? 'Correct' : 'Wrong'} answer did not schedule WebAudio output`);
    assert(recorded.events.some(e => Number(e.effects.dataset[correct ? 'soundCorrectCount' : 'soundWrongCount']) > 0), 'Feedback did not confirm audio playback started');
    const cssAnimation = (entry, name) => {
      const ball = activeBall(entry.effects, question.mode);
      return ball?.animation.includes(name) && ball.animations.some(a => a.name === name && a.state === 'running');
    };
    if (correct) {
      const bounce = recorded.events.find(e => cssAnimation(e, 'ng-quiz-bounce'));
      assert(bounce, 'Active ball never ran its actual CSS bounce animation');
      assertSynchronized(bounce.effects, 'ng-quiz-bounce');
      effects.bounce = { observedAt: bounce.at, animation: activeBall(bounce.effects, question.mode).animation,
        animationEvents: recorded.events.filter(e => e.animationName === 'ng-quiz-bounce').map(({kind,at,side}) => ({kind,at,side})) };
    }
    if (finalCorrect) {
      assert.equal(recorded.quickContinueSameTask, true, 'Quick Continue was not dispatched in the grading turn');
      effects.timing.continueDispatchedInGradingTurn = true;
      const spin = recorded.events.find(e => cssAnimation(e, 'ng-quiz-spin'));
      assert(spin, 'No completion spin was observed before overlay removal');
      assertSynchronized(spin.effects, 'ng-quiz-spin');
      const spinEnd = recorded.events.find(e => e.at > spin.at && !ballAnimating(activeBall(e.effects, question.mode), 'spin'));
      assert(spinEnd, 'Completion spin did not finish before the battle resumed');
      assert(spin.at < spinEnd.at && spinEnd.at <= recorded.advancedAt, 'Battle resumed before the completion spin finished');
      assert(spin.effects.balls.every(b => ballAnimating(b, 'spin')), 'Completion must spin both balls');
      effects.completion = { spinStartedAt: spin.at, spinFinishedAt: spinEnd.at, overlayRemovedAt: recorded.advancedAt,
        spinVisibleMs: spinEnd.at - spin.at, snapshot: spin.effects,
        animationEvents: recorded.events.filter(e => e.animationName === 'ng-quiz-spin').map(({kind,at,side}) => ({kind,at,side})) };
    }
    // The observer already witnessed this question advance. A later CDP read
    // may see a new gate with the same generic subsection name, so compare
    // cleanup and the presence of a current question in one renderer snapshot.
    const current = await evaluate(cdp, `({ question: !!document.querySelector('#ng-overlay .ng-dialog'), effects: document.querySelectorAll('.ng-effects').length })`);
    assert(current.question || current.effects === 0, 'Effects survived outside the question overlay');
  }
  await delay(80);
  return { concept: fact.conceptId, subsection: fact.subsectionId, caseId:question.caseId,stem:question.stem,level: question.level, review: question.review,retention:question.retention, rationaleRequired, policy, correct, effects };
}

async function advanceMenus(cdp, scene, state, { captureAttempt = false } = {}) {
  // Read menu labels, then send ordinary keys to the same handlers as a player.
  if(state.phase === "GameOverPhase" && state.mode === 14) { if(!await chooseOption(cdp,scene,/^no$/i)) { await key(cdp,"ArrowDown");await key(cdp,"Space"); } return; }
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
    if (captureAttempt) await key(cdp, "ArrowRight");
    await key(cdp, "Space");
  } else if (state.mode === 4) {
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
  for (const gate of report.gates.filter(g => g.mode === 'attack' && g.passed === false && !g.moveOutcome)) {
    if (!state.turn || state.turn < gate.before.turn) continue;
    const before = gate.before.enemy;
    const after = state.enemy;
    const pairs = before.map(p => ({ before: p, after: after.find(q => q.id === p.id) })).filter(p => p.after);
    if (state.turn === gate.before.turn && state.phase === "MoveEffectPhase" && state.pathoMode === "attack") continue;
    assert(pairs.length, "Failed attack target disappeared before damage verification");
    assert(pairs.every(p => p.after.hp === p.before.hp), "Failed attack changed enemy HP");
    gate.moveOutcome = "Enemy HP unchanged after failed player attack";
    gate.outcomeState = state;
  }
}


async function verifyStudyClinic(cdp, bank, reportDir) {
 const before=await evaluate(cdp, 'localStorage.getItem("pokerogue.pathophysiology-gate.v3")');
 await evaluate(cdp, 'document.querySelector("#ng-study-launcher").click()');
 assert(await evaluate(cdp, '!!document.querySelector("#ng-clinic-start")'), 'Study clinic did not open at command menu');
 await capture(cdp,reportDir,'study-center.png');
 await evaluate(cdp, 'document.querySelector("#ng-clinic-start").click()');
 for(let i=0;i<5;i++) {
  const prompt=await evaluate(cdp, '({fact:document.querySelector("#ng-overlay").dataset.clinicFact,options:[...document.querySelectorAll("[data-clinic-answer]")].map(b=>({i:b.dataset.clinicAnswer,text:b.textContent}))})');
  const f=bank.find(f=>f.id===prompt.fact);assert(f,'Unknown clinic fact');
  if(i===0)await evaluate(cdp, 'document.querySelector("#ng-clinic-hint").click()');
  const option=prompt.options.find(o=>o.text===f.answer);assert(option,'Correct clinic option missing');
  await clickIndex(cdp,"data-clinic-answer",Number(option.i));
  assert(await evaluate(cdp, '!!document.querySelector("#ng-clinic-next")'), 'Clinic feedback missing');
  if(i===0)await capture(cdp,reportDir,'clinic-hint-feedback.png');
  await evaluate(cdp, 'document.querySelector("#ng-clinic-next").click()');
 }
 assert(await evaluate(cdp, 'document.querySelector("#ng-overlay").textContent.includes("Clinic complete")'), 'Clinic did not finish');
 await capture(cdp,reportDir,'clinic-completed.png');
 await evaluate(cdp, 'document.querySelector("#ng-study-close").click()');
 assert.equal(await evaluate(cdp, 'localStorage.getItem("pokerogue.pathophysiology-gate.v3")'),before,'Clinic changed battle mastery');
 const ledger=await evaluate(cdp,'JSON.parse(localStorage.getItem("pokerogue.study-center.v1"))');
 assert.equal(ledger.clinic.length,5);assert.equal(ledger.clinic.filter(a=>a.assisted).length,1);
 return true;
}


async function installEnemyProbe(cdp,scene) {
 await call(cdp,scene,function(){
   if(window.__clinicalEnemyProbe)clearInterval(window.__clinicalEnemyProbe.timer);
   const probe={actions:0,damage:0,last:null};window.__clinicalEnemyProbe=probe;
   probe.timer=setInterval(()=>{const phase=this.phaseManager.getCurrentPhase();let user;try{user=phase?.getUserPokemon?.()||phase?.getPokemon?.();}catch{};
     const paused=!!document.querySelector('#ng-overlay');
     if(!paused&&['MovePhase','MoveEffectPhase'].includes(phase?.phaseName)&&user&&!user.isPlayer())probe.actions++;
     if(!paused&&phase?.phaseName==='DamageAnimPhase'&&phase.amount>0&&phase.getPokemon?.()?.isPlayer())probe.damage++;
     const party=this.getPlayerParty().map(p=>({id:p.id,hp:p.hp}));
     if(!paused&&probe.last&&party.some(p=>{const old=probe.last.find(x=>x.id===p.id);return old&&p.hp<old.hp;}))probe.damage++;
     probe.last=party;
   },16);
 }.toString());
}

async function playUntil(cdp, scene, bank, report, reportDir, predicate, { highTier = false, captureTest = false, timeout = 240000 } = {}) {
  const deadline = Date.now() + timeout;
  let active = null;
  let lastStateKey = "";
  while (Date.now() < deadline) {
    if(await evaluate(cdp, '!!document.querySelector("#ng-overlay[data-study-center] #ng-study-close")')) { await capture(cdp,reportDir,"run-debrief.png"); await evaluate(cdp, 'document.querySelector("#ng-study-close").click()'); report.debriefObserved=true; }
    const question = await readQuestion(cdp);
    const state = await snapshot(cdp, scene);
    // Observe the original enemy MoveEffectPhase progressing without opening
    // any question gate. A later native damage frame supplies the HP outcome.
    if(state.phase === 'MoveEffectPhase' && state.user && state.enemy.some(p=>p.id===state.user.id)) {
      assert.equal(question, null, 'An enemy move opened a quiz');
      report.enemyActionObserved=true;
      const key=`${state.wave}:${state.turn}:${state.user.id}`;
      if(report.enemyActionKey!==key) { report.enemyActionKey=key; report.enemyActionTargets=state.player.map(p=>({id:p.id,hp:p.hp})); }
    }
    if(report.enemyActionTargets && state.phase === 'DamageAnimPhase') {
      const damaged=report.enemyActionTargets.find(before=>state.player.some(after=>after.id===before.id&&after.hp<before.hp));
      if(damaged) report.normalEnemyDamageObserved=true;
    }
    const stateKey = JSON.stringify([state.phase, state.mode, state.options, state.partySelected, state.turn, state.wave]);
    if (stateKey !== lastStateKey) {
      report.navigation.push(state); lastStateKey = stateKey;
      console.log(`Gameplay: ${state.phase} / UI ${state.mode} / turn ${state.turn ?? "-"} / ${state.options.join(", ")}`);
    }
    if (question) {
      if (highTier) assert(question.level >= 6, "Persisted advanced difficulty was not restored");
      const match = question.kicker.match(/Question (\d+) of (\d+)/);
      assert(match, `Quiz counter missing: ${question.kicker}`);
      if(question.retention)report.retentionObserved=true;
      const number = Number(match[1]);
      const required = Number(match[2]);
      assert(['attack','capture'].includes(question.mode), 'Only player attacks and capture attempts may open quizzes');
      assert.equal(required, 3, 'Player attack/capture gate must require three correct answers');
      assert.equal(state.phase, question.mode === 'capture' ? 'AttemptCapturePhase' : 'MoveEffectPhase', "Quiz must originate in actual game's battle phase");
      if(question.mode==='attack') assert(state.user && state.player.some(p=>p.id===state.user.id), 'Attack quiz belongs to an enemy move');
      if(question.identification) {
        const fact=bank.find(f=>f.conceptId===question.concept&&f.subsectionId===question.subsection);
        assert.equal(number,1,'Condition-identification questions must appear first');
        assert(fact && !question.header.includes(fact.concept), 'Identification header reveals the condition name');
        report.identificationObserved=true;
      }
      if (number === 1) {
        const already = report.gates.filter(g => g.mode === question.mode && g.highTier === highTier);
        let policy = already.some(g => g.passed) ? "wrong-answer" : "correct";
        if (captureTest) policy = 'correct';
        if (question.mode === 'capture') policy = already.some(g => !g.passed) ? 'correct' : 'wrong-answer';
        if (highTier) policy = already.some(g => g.passed) ? "wrong-answer" : "correct";
        active = { mode: question.mode, highTier, policy, required, before: state, questions: [] };
        report.gates.push(active);
        await capture(cdp, reportDir, `gameplay-${report.gates.length}-${question.mode}.png`);
      }
      assert(active, "Gate continuation missing initial question");
      assert.equal(question.concept, active.questions[0]?.concept || question.concept);
      assert(!active.questions.some(q => q.subsection === question.subsection), "Gate repeated subsection");
      const promptEffects = await readEffects(cdp);
      assert(promptEffects, 'Battle question does not contain quiz effects');
      assert.equal(promptEffects.balls.length, 2, 'Question must show one player ball and one enemy ball');
      assertSynchronized(promptEffects, 'ng-quiz-wiggle');
      assert.equal(promptEffects.stars.length, 3, 'Question must show three stars');
      const colors = promptEffects.stars.map(s => s.color);
      assert.equal(new Set(colors).size, 3, 'Prompt stars must have three distinct colors');
      assert.equal(promptEffects.pointerEvents, 'none', 'Decorative graphics must not intercept answer input');
      if (!report.battleHUD) report.battleHUD = await checkBattleHUD(cdp, state);
      else await checkBattleHUD(cdp, state);
      if (!report.starMotion) {
        assert(promptEffects.sparkles.length >= 12, 'Animated star field is absent');
        assert(promptEffects.sparkles.every(s => s.animation !== 'none'), 'Star sparkle has no animation');
        await delay(220);
        const moving = await readEffects(cdp);
        assert(moving.sparkles.some((s, i) => s.transform !== promptEffects.sparkles[i].transform || s.opacity !== promptEffects.sparkles[i].opacity), 'Stars remain static');
        report.starMotion = true;
      }
      const previousPrompt = report.lastPromptStarColors;
      if (previousPrompt) assert(colors.some((color, index) => color !== previousPrompt[index]), 'Star colors did not change for the next prompt');
      report.lastPromptStarColors = colors;
      if (!report.layouts) {
        report.layouts = [await checkLayout(cdp, reportDir, 1280, 720)];
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
        await delay(100);
      }
      const policy = active.policy !== "correct" && number === 1 ? active.policy : "correct";
      active.questions.push(await answerQuestion(cdp, bank, question, policy, { report, reportDir }));
      if (policy !== "correct" || number === required) {
        active.passed = policy === "correct";
        assert.equal(active.questions.length, active.passed ? required : 1);
        await delay(250);
        active.after = await snapshot(cdp, scene);
        if (active.mode === 'capture') {
          const beforeBalls = Object.values(active.before.pokeballs).reduce((a, b) => a + b, 0);
          const afterBalls = Object.values(active.after.pokeballs).reduce((a, b) => a + b, 0);
          assert.equal(afterBalls, beforeBalls - (active.passed ? 1 : 0), 'Capture gate used the wrong number of balls');
          active.moveOutcome = active.passed ? 'Three correct answers released the native throw and consumed one ball' : 'Incorrect answer blocked capture and preserved ball inventory';
        }
        active = null;
      }
    } else {
      const visibility = await evaluate(cdp, `({ question: !!document.querySelector('#ng-overlay .ng-dialog'), effects: document.querySelectorAll('.ng-effects').length, hud:document.querySelectorAll('.ng-battle-hud').length })`);
      if (visibility.question) continue; // A new gate can open between CDP reads.
      assert.equal(visibility.effects, 0, 'Quiz effects remain visible during normal gameplay');
      assert.equal(visibility.hud, 0, 'Battle HUD remains outside the quiz');
      settleFailedMoves(report, state);
      if (predicate(report)) return;
      if(!report.clinicVerified && state.phase === "CommandPhase" && state.mode === 2) report.clinicVerified=await verifyStudyClinic(cdp,bank,reportDir);
      await advanceMenus(cdp, scene, state, { captureAttempt: captureTest && state.enemy.filter(p => p.hp > 0).length === 1 && !report.gates.some(g => g.mode === 'capture' && g.passed) });
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
    navigation: [], gates: [], checks: {}, effectScreenshots: [] };
  try {
    await session.cdp.send("Page.bringToFront");
    await session.cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await session.cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    report.animationTestPreference = 'Normal motion explicitly emulated to verify actual CSS bounce and spin animations; reduced-motion behavior has separate module regression tests.';
    await installAudioProbe(session.cdp);
    let scene = await findScene(session.cdp);await installEnemyProbe(session.cdp,scene);
    const basicDone = r => r.gates.some(g => !g.highTier && g.mode === 'attack' && g.passed)
      && r.gates.some(g => !g.highTier && g.mode === 'attack' && !g.passed && g.moveOutcome);
    await playUntil(session.cdp, scene, bank, report, reportDir, basicDone);
    report.checks.realAttackThreeCorrect = true;
    report.checks.sameConceptDistinctSubsections = true;
    report.checks.wrongAnswerFailsGate = true;
    report.checks.failedAttackDealsNoDamage = true;
    await playUntil(session.cdp, scene, bank, report, reportDir,
      r => r.gates.some(g => g.mode === 'capture' && g.passed && g.moveOutcome)
        && r.gates.some(g => g.mode === 'capture' && !g.passed && g.moveOutcome)
        && r.navigation.at(-1)?.phase !== 'AttemptCapturePhase', { captureTest: true });
    report.checks.realCaptureThreeCorrect = true;
    report.checks.failedCapturePreservesBall = true;
    report.checks.successfulCaptureGateRunsNativeThrow = true;
    const stored = await evaluate(session.cdp, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
    assert(stored.totalAnswers > 0 && stored.correctAnswers > 0, "Battle answers were not saved offline");
    // Seed valid imported progress only in the disposable test profile to reach
    // an advanced tier without fifty warm-up questions. Quiz rules are intact.
    await evaluate(session.cdp, `(()=>{const s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}));s.banks.patho.tier=5;localStorage.setItem(${JSON.stringify(STORAGE_KEY)},JSON.stringify(s));location.reload();})()`);
    await delay(1500);
    await installAudioProbe(session.cdp);
    delete report.lastPromptStarColors;
    scene = await findScene(session.cdp);await installEnemyProbe(session.cdp,scene);
    const reloaded = await evaluate(session.cdp, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
    assert.equal(reloaded.totalAnswers, stored.totalAnswers);
    assert.equal(reloaded.correctAnswers, stored.correctAnswers);
    report.checks.answerProgressSurvivesReload = true;
    report.highTierSetup = "Valid persisted quiz progress set to tier 6 in disposable profile, then EXE renderer reloaded; game and quiz functions unchanged.";
    await playUntil(session.cdp, scene, bank, report, reportDir,
      r => r.gates.some(g => g.highTier && g.passed) && r.gates.some(g => g.highTier && g.policy === "wrong-answer" && !g.passed), { highTier: true });
    report.checks.advancedClinicalCaseGrading = true;

    // Import a valid mastered concept into the disposable profile to exercise
    // the actual retention scheduler without hundreds of warm-up answers.
    const retentionFacts=bank.filter(f=>f.conceptId==='GI_pancreatic_cancer');
    assert(retentionFacts.some(f=>f.identification),'Retention fixture needs an authored condition-identification item');
    report.retentionObserved=false;
    const recognitionId=retentionFacts.find(f=>f.identification).id,beforeRetention=report.gates.length;
    await evaluate(session.cdp, '(function(ids,core){const s=JSON.parse(localStorage.getItem('+JSON.stringify(STORAGE_KEY)+'));s.banks.patho.total=Math.max(s.banks.patho.total,30);s.totalAnswers=s.banks.patho.total;for(const id of ids)s.banks.patho.items[id]={attempts:1,correct:1,misses:0,lastSeenAt:id===core?0:1,step:3,dueAt:0,mastered:true,seenCases:["base","advanced"]};s.banks.patho.retentionAt=s.banks.patho.total-29;localStorage.setItem('+JSON.stringify(STORAGE_KEY)+',JSON.stringify(s));location.reload();})('+JSON.stringify(retentionFacts.map(f=>f.id))+','+JSON.stringify(recognitionId)+')');
    await delay(1500);await installAudioProbe(session.cdp);delete report.lastPromptStarColors;scene=await findScene(session.cdp);await installEnemyProbe(session.cdp,scene);
    await playUntil(session.cdp,scene,bank,report,reportDir,r=>r.gates.length>beforeRetention);
    assert(!report.retentionObserved,'Mastered concept review appeared before30 answered questions');
    await playUntil(session.cdp,scene,bank,report,reportDir,r=>r.retentionObserved);
    assert(report.retentionObserved,'Mastered concept was not reviewed after30 answered questions');
    report.checks.masteredConceptRetentionEveryThirty=true;
    const firstReview=report.gates.flatMap(g=>g.questions).find(q=>q.retention);
    assert(firstReview?.caseId.startsWith('review-'),'Mastery review reused an old clinical case');
    // Reopen an actually answered review target using valid imported due progress
    // in this disposable profile. No quiz/game functions are changed.
    const repeatFact=bank.find(f=>f.conceptId===firstReview.concept&&f.subsectionId===firstReview.subsection);
    const reviewStems=new Set([firstReview.stem]);
    for(let round=0;round<2;round++) {
      const start=report.gates.length;
      await evaluate(session.cdp,'(function(id){const s=JSON.parse(localStorage.getItem('+JSON.stringify(STORAGE_KEY)+'));const i=s.banks.patho.items[id];i.mastered=false;i.misses=1;i.step=0;i.dueAt=s.banks.patho.total;s.banks.patho.retentionAt=s.banks.patho.total;for(const [other,item]of Object.entries(s.banks.patho.items))if(other!==id&&item.misses&&!item.mastered)item.dueAt=s.banks.patho.total+100;localStorage.setItem('+JSON.stringify(STORAGE_KEY)+',JSON.stringify(s));location.reload();})('+JSON.stringify(repeatFact.id)+')');
      await delay(1500);await installAudioProbe(session.cdp);delete report.lastPromptStarColors;scene=await findScene(session.cdp);await installEnemyProbe(session.cdp,scene);
      await playUntil(session.cdp,scene,bank,report,reportDir,r=>r.gates.slice(start).some(g=>g.questions.some(q=>q.concept===repeatFact.conceptId&&q.subsection===repeatFact.subsectionId)));
      const review=report.gates.slice(start).flatMap(g=>g.questions).find(q=>q.concept===repeatFact.conceptId&&q.subsection===repeatFact.subsectionId);
      assert(review.review,'Due target was not marked as a scheduled review');assert(!reviewStems.has(review.stem),'Scheduled review repeated the same clinical vignette after reload');reviewStems.add(review.stem);
    }
    report.checks.freshReviewScenariosSurviveReload=true;

    const allQuestions = report.gates.flatMap(g => g.questions);
    const correctSound = allQuestions.find(q => q.correct && q.effects?.audio.length)?.effects.audio;
    const wrongSound = allQuestions.find(q => !q.correct && q.effects?.audio.length)?.effects.audio;
    assert(correctSound && wrongSound, 'Both correct and wrong WebAudio cues must be scheduled');
    const signature = events => events.map(({kind,type,frequency}) => `${kind}/${type}/${frequency}`).join('|');
    assert.notEqual(signature(correctSound), signature(wrongSound), 'Correct and wrong sound cues must differ');
    Object.assign(report.checks, { quizEffectsOnlyDuringOverlay: true, threeDistinctChangingStars: true,
      wrongAnswersTurnStarsRed: true, correctAnswersProduceConfettiAndSynchronizedBounce: true,
      completedGatesSpinBeforeBattleResumes: true, distinctCorrectAndWrongAudio: true,
      practiceClinicHintsAndIsolation: report.clinicVerified === true,
      synchronizedBallAnimations: true, movingTwinklingStars: report.starMotion === true,
      currentHealthAndSixPartySlots: !!report.battleHUD,
      optionalAllAnswerRationales: report.optionRationalesVerified === true,
      aboutConditionDefinitionCausesAndManifestations: report.diseaseGuideVerified === true,
      windowsDesktopQuizLayout: true, quizEffectsCleanedUp: true });
    await playUntil(session.cdp,scene,bank,report,reportDir,r=>r.debriefObserved,{timeout:240000});
    const study=await evaluate(session.cdp,'JSON.parse(localStorage.getItem("pokerogue.study-center.v1"))');
    assert(study.runs.at(-1)?.attempts.length>0,"End-of-run debrief has no actual battle records");
    report.checks.realEndOfRunStudyDebrief=true;
    const enemy=await evaluate(session.cdp,'({actions:window.__clinicalEnemyProbe.actions,damage:window.__clinicalEnemyProbe.damage})');
    assert(enemy.actions>0&&enemy.damage>0,'Native enemy actions/damage were not observed');report.enemyProbe=enemy;
    assert(report.gates.every(g=>g.mode==='attack'||g.mode==='capture'), 'An enemy-defense gate was recorded');
    assert(report.diseaseGuideVerified,'About this condition was not tested after revealing rationales');
    assert(report.identificationObserved,'No first-position condition-identification question was observed');
    report.checks.enemyTurnsProceedWithoutQuestions=true;
    report.checks.identificationFirstWithHiddenConditionHeader=true;
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


