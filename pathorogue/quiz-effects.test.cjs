"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");
const { stripTypeScriptTypes } = require("node:module");
const { test } = require("node:test");

// A small deterministic DOM/clock is sufficient for lifecycle contracts;
// packaged-EXE smoke tests separately inspect pixels, actual input and audio.
function environment({ reduced = false, gameAudio = null } = {}) {
  let now = 0, serial = 0;
  const tasks = new Map(), storage = new Map(), sounds = [];
  if (gameAudio) storage.set("settings", JSON.stringify({ audio: gameAudio }));
  class Element {
    constructor(tag) {
      this.tagName = tag; this.children = []; this.dataset = {}; this.className = ""; this.listeners = new Map();
      this.attributes = {}; this.offsetWidth = 116;
      this.style = { setProperty: (key, value) => { this.style[key] = value; } };
      this.classList = {
        add: (...names) => { this.className = [...new Set([...this.className.split(" ").filter(Boolean), ...names])].join(" "); },
        remove: (...names) => { this.className = this.className.split(" ").filter(name => !names.includes(name)).join(" "); },
        contains: name => this.className.split(" ").includes(name),
      };
    }
    appendChild(child) { child.remove(); this.children.push(child); child.parentElement = this; return child; }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(key, callback) { if (!this.listeners.has(key)) this.listeners.set(key, new Set()); this.listeners.get(key).add(callback); }
    removeEventListener(key, callback) { this.listeners.get(key)?.delete(callback); }
    trigger(type) { for (const callback of this.listeners.get(type) || []) callback({ target: this, stopPropagation() {} }); }
    getBoundingClientRect() { return this.tagName === "overlay" ? { left: 0, top: 0, width: 1100, height: 800 } : { left: 50, top: 330, width: 116, height: 116 }; }
    getContext() { return { scale() {}, clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillRect() {} }; }
  }
  class Audio {
    constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; }
    createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
    createOscillator() {
      const note = { frequency: 0, type: "" };
      return { frequency: { setValueAtTime: value => { note.frequency = value; }, exponentialRampToValueAtTime() {} },
        set type(value) { note.type = value; }, connect() {}, disconnect() {}, start() { sounds.push(note); }, stop() {} };
    }
    resume() { this.state = "running"; return Promise.resolve(); }
    close() { this.state = "closed"; return Promise.resolve(); }
  }
  const setTimer = (callback, ms = 0) => { const id = ++serial; tasks.set(id, { time: now + ms, callback }); return id; };
  const context = vm.createContext({
    console, URL, performance: { now: () => now }, AudioContext: Audio,
    window: { AudioContext: Audio, matchMedia: () => ({ matches: reduced }), devicePixelRatio: 1 },
    document: { createElement: tag => new Element(tag) },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    setTimeout: setTimer, clearTimeout: id => tasks.delete(id),
    requestAnimationFrame: callback => setTimer(() => callback(now), 16), cancelAnimationFrame: id => tasks.delete(id),
  });
  const filename = path.join(__dirname, "quiz-effects.ts");
  const source = stripTypeScriptTypes(fs.readFileSync(filename, "utf8"))
    .replaceAll("import.meta.url", JSON.stringify(pathToFileURL(filename).href))
    .replace("export function createQuizEffects", "function createQuizEffects");
  vm.runInContext(`${source}\nthis.create = createQuizEffects;`, context);
  return {
    overlay: () => new Element("overlay"), create: context.create, storage, sounds, tasks,
    advance(ms) {
      const deadline = now + ms;
      for (;;) {
        const next = [...tasks].filter(([, task]) => task.time <= deadline).sort((a, b) => a[1].time - b[1].time)[0];
        if (!next) break;
        now = Math.max(now, next[1].time); tasks.delete(next[0]); next[1].callback();
      }
      now = deadline;
    },
    delayCallbacks(ms) { now += ms; },
  };
}
function find(parent, className) {
  const result = [];
  const walk = node => { if (node.classList.contains(className)) result.push(node); node.children.forEach(walk); };
  walk(parent); return result;
}

test("three distinct star hues all change per prompt and across overlay instances; wrong stars are all red", () => {
  const env = environment(), overlay = env.overlay(), effects = env.create(overlay, "attack", ["disease-a"]);
  effects.showQuestion("disease-a");
  const first = find(overlay, "ng-star").map(star => star.dataset.color);
  assert.equal(new Set(first).size, 3);
  effects.showQuestion("disease-a");
  const second = find(overlay, "ng-star").map(star => star.dataset.color);
  assert(second.every(color => !first.includes(color)));
  effects.answer(false);
  assert(find(overlay, "ng-star").every(star => star.dataset.color === "#ff425c"));
  effects.dispose();
  const nextOverlay = env.overlay(), next = env.create(nextOverlay, "defense", ["disease-a"]);
  next.showQuestion("disease-a");
  assert(find(nextOverlay, "ng-star").every(star => !second.includes(star.dataset.color)));
  next.dispose();
  assert.equal(env.tasks.size, 0);
});

test("all 96 disease colors are distinct and stable; every correct response emits matching confetti", () => {
  const env = environment(), overlay = env.overlay(), ids = Array.from({ length: 96 }, (_, i) => `disease-${i}`);
  const effects = env.create(overlay, "attack", ids), observed = new Map();
  const root = find(overlay, "ng-effects")[0];
  for (const id of ids) { effects.showQuestion(id); observed.set(id, root.dataset.diseaseColor); }
  assert.equal(new Set(observed.values()).size, 96);
  for (const id of ids) {
    effects.showQuestion(id); effects.answer(true);
    assert.equal(root.dataset.diseaseColor, observed.get(id));
    const confetti = find(overlay, "ng-confetti");
    assert.equal(confetti.length, 1);
    assert.equal(confetti[0].dataset.diseaseColor, observed.get(id));
    assert.equal(confetti[0].dataset.concept, id);
  }
  effects.showQuestion(ids[0]); effects.answer(false);
  assert.equal(find(overlay, "ng-confetti").length, 0);
  effects.dispose();
});

test("only the active side bounces; completed gate spins after its bounce and settles afterwards", async () => {
  for (const mode of ["attack", "defense"]) {
    const env = environment(), overlay = env.overlay(), effects = env.create(overlay, mode, ["a"]);
    effects.showQuestion("a"); effects.answer(true, true);
    const balls = find(overlay, "ng-ball"), active = balls.find(ball => ball.dataset.side === (mode === "attack" ? "player" : "enemy"));
    assert(active.classList.contains("is-bouncing"));
    assert(balls.filter(ball => ball !== active).every(ball => !ball.classList.contains("is-bouncing")));
    let done = false; const settled = effects.settled().then(() => { done = true; });
    env.advance(419); assert(active.classList.contains("is-bouncing")); assert.equal(done, false);
    env.advance(1); assert(!active.classList.contains("is-bouncing")); assert(active.classList.contains("is-spinning"));
    env.advance(849); assert(active.classList.contains("is-spinning")); assert.equal(done, false);
    env.advance(25); await settled; assert.equal(done, true);
    assert(!active.classList.contains("is-spinning"));
    effects.dispose(); assert.equal(env.tasks.size, 0);
  }
});

test("sounds differ for correct/wrong, mute preference persists, and game audio mute is respected", () => {
  const env = environment(), overlay = env.overlay(), effects = env.create(overlay, "attack", ["a"]);
  effects.showQuestion("a"); effects.answer(true);
  const correct = env.sounds.map(note => note.frequency);
  effects.showQuestion("a"); effects.answer(false);
  const wrong = env.sounds.slice(correct.length).map(note => note.frequency);
  assert.equal(correct.length, 3); assert.equal(wrong.length, 2); assert.notDeepEqual(correct, wrong);
  find(overlay, "ng-sound-toggle")[0].trigger("click");
  assert.equal(JSON.parse(env.storage.get("pokerogue.quiz-effects.audio.v1")).muted, true);
  effects.dispose();
  const nextOverlay = env.overlay(), next = env.create(nextOverlay, "attack", ["a"]);
  next.showQuestion("a"); next.answer(true);
  assert.equal(find(nextOverlay, "ng-effects")[0].dataset.soundCorrectCount, "0");
  next.dispose();
  const gameMuted = environment({ gameAudio: { enableAudio: false } }), mutedOverlay = gameMuted.overlay();
  const muted = gameMuted.create(mutedOverlay, "attack", ["a"]); muted.showQuestion("a"); muted.answer(true);
  assert.equal(gameMuted.sounds.length, 0);
  assert.equal(find(mutedOverlay, "ng-effects")[0].dataset.audioState, "game-muted");
  muted.dispose();
});

test("dispose removes effects, cancels RAF/timers and resolves a pending completion wait", async () => {
  const env = environment(), overlay = env.overlay(), effects = env.create(overlay, "attack", ["a"]);
  effects.showQuestion("a"); effects.answer(true, true);
  const pending = effects.settled(); effects.dispose(); await pending;
  assert.equal(env.tasks.size, 0);
  assert.equal(find(overlay, "ng-effects").length, 0);
  assert(!overlay.classList.contains("ng-with-effects"));
  effects.answer(true); effects.showQuestion("a"); env.advance(3000);
  assert.equal(env.tasks.size, 0);
});

test("a delayed bounce callback cannot let the predicted deadline dismiss an ongoing completion spin", async () => {
  const env = environment(), overlay = env.overlay(), effects = env.create(overlay, "attack", ["a"]);
  effects.showQuestion("a"); effects.answer(true, true);
  let done = false;
  const settled = effects.settled().then(() => { done = true; });
  const active = find(overlay, "ng-ball").find(ball => ball.dataset.side === "player");
  // Simulate a renderer busy longer than the originally predicted whole
  // bounce+spin. Overdue callbacks resume at actual time rather than time 420.
  env.delayCallbacks(2000);
  env.advance(0);
  await Promise.resolve();
  assert(active.classList.contains("is-spinning"));
  assert.equal(done, false);
  let lateDone = false;
  const lateWait = effects.settled().then(() => { lateDone = true; });
  await Promise.resolve();
  assert.equal(lateDone, false, "A waiter created after the old deadline must still await the active spin");
  env.advance(849); await Promise.resolve();
  assert(active.classList.contains("is-spinning"));
  assert.equal(done, false);
  env.advance(1); await Promise.all([settled, lateWait]);
  assert(!active.classList.contains("is-spinning"));
  assert.equal(done, true);
  assert.equal(lateDone, true);
  effects.dispose(); assert.equal(env.tasks.size, 0);
});
