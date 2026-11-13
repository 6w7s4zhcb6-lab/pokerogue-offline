/**
 * Nursing question-gate add-on for the community PokéRogue source tree.
 * Original Pokémon battle mechanics remain in MoveEffectPhase.hitCheck().
 * The educational content is generated exclusively from uploaded pathophysiology
 * lecture slides. No AI API, credentials, or network calls.
 */
import { nursingFacts, type NursingFact } from "./nursing-content";
import { buildChoices, isIdentification } from "./question-builder";
import { renderDiseaseGuide } from "./disease-guide";
import { createQuizEffects } from "./quiz-effects";
import { recordStudyAnswer, repairMarkup, initStudyLauncher } from "./study-center";
import { createQuizBattleHUD } from "./quiz-battle-hud";
import type { QuizBattleContext } from "./battle-context";
import { explainOptions, explainRationaleOptions } from "./question-rationales";

type Bank = "patho";
type Gate = "attack" | "defense" | "capture";
type LearningItem = {
  attempts: number;
  correct: number;
  misses: number;
  lastSeenAt: number;
  step: number;
  dueAt: number;
  mastered: boolean;
};
type LearningBank = {
  total: number;
  correct: number;
  tier: number;
  rightStreak: number;
  wrongStreak: number;
  items: Record<string, LearningItem>;
  retentionAt?: number;
  retentionCursor?: number;
};
type State = {
  version: 3;
  selected: Bank;
  banks: Record<Bank, LearningBank>;
  totalAnswers: number;
  correctAnswers: number;
};
type PreparedQuestion = {
  isRetention?: boolean;
  fact: NursingFact;
  answer: string;
  answers: string[];
  isSelectAll: boolean;
  rationale: string;
  stem: string;
  options: string[];
  rationaleOptions: string[];
  level: number;
  isReview: boolean;
};

const STORAGE_KEY = "pokerogue.pathophysiology-gate.v3";
const PREVIOUS_STORAGE_KEY = "pokerogue.pathophysiology-gate.v2";
const LEGACY_STORAGE_KEY = "pokerogue.nursing-gate.v1";
const LEVELS = ["Easy", "Medium", "Hard", "Very Hard", "Extreme", "Hard Extreme", "Super Extreme", "Ultra Extreme", "Sub Max", "Max"] as const;
// Higher tiers use the existing clinical bank rather than invented scenarios:
// first increase alternatives, then require the matching explanation as well.
const DIFFICULTY = [
  { choices: 3, close: false, rationales: 0 },
  { choices: 4, close: false, rationales: 0 },
  { choices: 5, close: false, rationales: 0 },
  { choices: 6, close: false, rationales: 0 },
  { choices: 6, close: true, rationales: 0 },
  { choices: 4, close: true, rationales: 2 },
  { choices: 5, close: true, rationales: 3 },
  { choices: 6, close: true, rationales: 4 },
  { choices: 6, close: true, rationales: 5 },
  { choices: 6, close: true, rationales: 6 },
] as const;
const REVIEW_DELAYS = [10, 20, 50] as const;
const PREFETCH = 5;
const bankNames: Record<Bank, string> = { patho: "Pathophysiology" };
const rand = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const escapeHtml = (raw: unknown): string => String(raw ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
const emptyBank = (): LearningBank => ({ total: 0, correct: 0, tier: 0, rightStreak: 0, wrongStreak: 0, items: {} });
const emptyState = (): State => ({ version: 3, selected: "patho", banks: { patho: emptyBank() }, totalAnswers: 0, correctAnswers: 0 });

// Compatible with old two-subject exports: only the pathophysiology bank is imported.
// Any legacy Foundations answers and question concepts are deliberately excluded.
function normalizeState(source: unknown): State | null {
  if (!source || typeof source !== "object") return null;
  const saved = source as { version?: number; banks?: { patho?: Partial<LearningBank> } };
  if ((saved.version !== 1 && saved.version !== 2 && saved.version !== 3) || !saved.banks?.patho) return null;
  const state = emptyState();
  const old = saved.banks.patho;
  const bank = state.banks.patho;
  bank.total = Math.max(0, Math.floor(Number(old.total) || 0));
  bank.correct = Math.min(bank.total, Math.max(0, Math.floor(Number(old.correct) || 0)));
  bank.tier = Math.max(0, Math.min(9, Math.floor(Number(old.tier) || 0)));
  bank.rightStreak = Math.max(0, Math.floor(Number(old.rightStreak) || 0));
  bank.wrongStreak = Math.max(0, Math.floor(Number(old.wrongStreak) || 0));
  if (Number.isFinite(old.retentionAt)) bank.retentionAt = Math.min(bank.total, Math.max(0, Math.floor(old.retentionAt!)));
  bank.retentionCursor = Math.max(0, Math.floor(Number(old.retentionCursor) || 0));
  const validIds = new Set(nursingFacts.map(f => f.id));
  for (const [id, item] of Object.entries(old.items || {})) {
    if (!validIds.has(id) || !item || typeof item !== "object") continue;
    bank.items[id] = {
      attempts: Math.max(0, Math.floor(Number(item.attempts) || 0)),
      correct: Math.max(0, Math.floor(Number(item.correct) || 0)),
      misses: Math.max(0, Math.floor(Number(item.misses) || 0)),
      lastSeenAt: Math.max(0, Math.floor(Number(item.lastSeenAt) || 0)),
      step: Math.max(0, Math.min(3, Math.floor(Number(item.step) || 0))),
      dueAt: Math.max(0, Math.floor(Number(item.dueAt) || 0)),
      mastered: !!item.mastered,
    };
  }
  state.totalAnswers = bank.total;
  state.correctAnswers = bank.correct;
  return state;
}
function readState(): State {
  if (typeof window === "undefined") return emptyState();
  try {
    const latest = window.localStorage.getItem(STORAGE_KEY);
    if (latest) {
      const parsed = normalizeState(JSON.parse(latest));
      if (parsed) return parsed;
    }
    // Keep old single-concept progress as the 'core recognition' subsection only.
    // Newly added subsections remain untested; previously completed concepts are
    // NOT automatically granted mastery in the expanded content bank.
    for (const key of [PREVIOUS_STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      const legacy = window.localStorage.getItem(key);
      if (legacy) { const upgraded = normalizeState(JSON.parse(legacy)); if (upgraded) return upgraded; }
    }
  } catch (error) { console.warn("Pathophysiology progress load failed:", error); }
  return emptyState();
}

let state = readState();
let prepared: PreparedQuestion[] = [];
let questionSerial = 0;
let activeGate = false;
let panelOpen = false;
let hud: HTMLElement | null = null;
let shade: HTMLElement | null = null;
let quizEffects: ReturnType<typeof createQuizEffects> | null = null;
let quizBattleHUD: ReturnType<typeof createQuizBattleHUD> | null = null;
const stemHistory = new Map<string, string[]>();

function persist() {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { console.warn("Nursing Gate could not save progress locally:", error); }
  renderHUD();
}

function factsFor(bank: Bank) { return nursingFacts.filter(f => f.bank === bank); }
function learningItem(f: NursingFact) { return state.banks[f.bank].items[f.id]; }
function stateOf(f: NursingFact): "unseen" | "review" | "known" {
  const i = learningItem(f);
  if (!i || i.attempts === 0) return "unseen";
  return i.mastered ? "known" : "review";
}
function conceptFacts(conceptId: string) {
  return factsFor(state.selected).filter(f => f.conceptId === conceptId);
}
function conceptMastered(conceptId: string) {
  const items = conceptFacts(conceptId);
  return items.length > 0 && items.every(f => stateOf(f) === "known");
}
function dueReview(bank: Bank, excluded: Set<string>, conceptId: string | null = null): NursingFact | null {
  const total = state.banks[bank].total;
  return factsFor(bank).filter(f => {
    const i = learningItem(f);
    return i && i.misses > 0 && !i.mastered && i.dueAt > 0 && i.dueAt <= total && !excluded.has(f.id)
      && (!conceptId || f.conceptId === conceptId);
  }).sort((a, b) => {
    const x = learningItem(a)!;
    const y = learningItem(b)!;
    return x.dueAt - y.dueAt || x.lastSeenAt - y.lastSeenAt;
  })[0] || null;
}
function chooseFresh(bank: Bank, excluded: Set<string>, conceptId: string | null = null): NursingFact | null {
  const all = factsFor(bank);
  const choices = all.filter(f => !excluded.has(f.id) && (!conceptId || f.conceptId === conceptId));
  if (!choices.length) return null;
  const unseen = choices.filter(f => stateOf(f) === "unseen");
  if (unseen.length) {
    if (conceptId) return unseen[rand(unseen.length)];
    // Spread initial exposure across not-yet-covered concepts and objectives.
    const seenConcepts = new Set(all.filter(f => stateOf(f) !== "unseen").map(f => f.conceptId));
    const freshConcepts = unseen.filter(f => !seenConcepts.has(f.conceptId));
    const first = freshConcepts.length ? freshConcepts : unseen;
    const seenObjectives = new Set(all.filter(f => stateOf(f) !== "unseen").map(f => f.objective));
    const freshObjective = first.filter(f => !seenObjectives.has(f.objective));
    const candidates = freshObjective.length ? freshObjective : first;
    return candidates[rand(candidates.length)];
  }
  // Unmissed, mastered subsections can supply variety once new material has run out.
  const known = choices.filter(f => stateOf(f) === "known");
  if (known.length) {
    const oldest = Math.min(...known.map(f => learningItem(f)?.lastSeenAt || 0));
    const candidates = known.filter(f => learningItem(f)?.lastSeenAt === oldest);
    return candidates[rand(candidates.length)];
  }
  // Pending reviews are not counted as reviews until actually due. This fallback
  // permits gameplay to continue if no new/mastered material is available.
  return choices[rand(choices.length)];
}

function makeQuestion(f: NursingFact, isReview: boolean): PreparedQuestion {
  const level=state.banks[f.bank].tier, difficulty=DIFFICULTY[level];
  if(f.sata && level>=3 && level<=4 && Math.random()<(level===4?.48:.28))return {fact:f,answer:f.sata.right.join(" / "),answers:[...f.sata.right],isSelectAll:true,rationale:f.sata.why,stem:f.sata.cue+" "+f.sata.task,options:shuffle([...f.sata.right,...f.sata.wrong]),rationaleOptions:[],level,isReview};
  const built=buildChoices(f,level,difficulty.choices);
  const rationale=level>=5 && f.expert?.why ? f.expert.why : f.why;
  const related=factsFor(f.bank).filter(other=>other.id!==f.id && other.why!==rationale);
  const explanations=[...new Set([...shuffle(related.filter(other=>built.distractors.includes(other.answer))).map(other=>other.why),...shuffle(related.filter(other=>other.topic!==f.topic)).map(other=>other.why)])].slice(0,Math.max(0,difficulty.rationales-1));
  return {fact:f,answer:built.answer,answers:[built.answer],isSelectAll:false,rationale,stem:built.stem,options:shuffle([built.answer,...built.distractors]),rationaleOptions:difficulty.rationales?shuffle([rationale,...explanations]):[],level,isReview};
}
function fillQueue() {
  if (activeGate && prepared.length >= PREFETCH) return;
  while (prepared.length < PREFETCH) {
    const reserved = new Set(prepared.map(q => q.fact.id));
    const f = chooseFresh(state.selected, reserved);
    if (!f) break;
    prepared.push(makeQuestion(f, false));
  }
}
function takeQuestion(conceptId: string | null, usedInGate: Set<string>): PreparedQuestion {
  // A due review can anchor the next check. Once anchored, even newly due
  // reviews must stay in that concept, using an unused subsection. Other
  // concepts' reviews wait for the next combat check rather than breaking it.
  const due = dueReview(state.selected, usedInGate, conceptId);
  const fact = due || chooseFresh(state.selected, usedInGate, conceptId);
  if (!fact) throw new Error("PathoRogue needs an unused subsection in the current concept");
  const isReview = !!due;
  const pos = prepared.findIndex(q => q.fact.id === fact.id && q.isReview === isReview && q.level === state.banks[state.selected].tier);
  const q = pos < 0 ? makeQuestion(fact, isReview) : prepared.splice(pos, 1)[0];
  return q;
}


function retentionConcept(): string | null {
  const bank=state.banks[state.selected];
  const mastered=[...new Set(factsFor(state.selected).map(f=>f.conceptId))].filter(conceptMastered).sort();
  if(!mastered.length)return null;
  if(bank.retentionAt===undefined){bank.retentionAt=bank.total;persist();return null;}
  if(bank.total-bank.retentionAt<12)return null;
  const concept=mastered[(bank.retentionCursor||0)%mastered.length];
  bank.retentionCursor=(bank.retentionCursor||0)+1;bank.retentionAt=bank.total;persist();return concept;
}

function recordAnswer(q: PreparedQuestion, correct: boolean) {
  const bank = state.banks[q.fact.bank];
  bank.total++;
  state.totalAnswers++;
  if (correct) { bank.correct++; state.correctAnswers++; }
  let item = bank.items[q.fact.id];
  if (!item) item = bank.items[q.fact.id] = { attempts: 0, correct: 0, misses: 0, lastSeenAt: 0, step: 0, dueAt: 0, mastered: false };
  item.attempts++;
  item.lastSeenAt = bank.total;
  if (correct) {
    item.correct++;
    // A subsection is mastered on its first correct if it has never been missed.
    // Missed subsections must clear three *due* reviews at +10/+20/+50.
    // A full concept is mastered only when ALL its individual subsections are mastered.
    if (item.misses === 0) item.mastered = true;
    else if (q.isReview && !item.mastered && item.dueAt <= bank.total) {
      item.step = Math.min(3, item.step + 1);
      item.mastered = item.step === 3;
      item.dueAt = item.mastered ? 0 : bank.total + REVIEW_DELAYS[item.step];
    }
    bank.rightStreak++;
    bank.wrongStreak = 0;
    if (bank.rightStreak >= 10) { bank.tier = Math.min(9, bank.tier + 1); bank.rightStreak = 0; }
  } else {
    item.misses++;
    item.step = 0;
    item.mastered = false;
    item.dueAt = bank.total + REVIEW_DELAYS[0];
    bank.wrongStreak++;
    bank.rightStreak = 0;
    if (bank.wrongStreak >= 3) { bank.tier = Math.max(0, bank.tier - 1); bank.wrongStreak = 0; }
  }
  if(bank.retentionAt===undefined && conceptMastered(q.fact.conceptId)) bank.retentionAt=bank.total;
  prepared = [];
  fillQueue();
  persist();
}

const style = `
#ng-hud,#ng-overlay {font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;box-sizing:border-box;color:#eff5ff}
#ng-hud * ,#ng-overlay * {box-sizing:border-box}
#ng-hud{position:fixed;z-index:2147483000;right:8px;top:8px;max-width:min(385px,calc(100vw - 16px));font-size:13px;pointer-events:auto}
#ng-hud button,#ng-overlay button,#ng-hud select{font:inherit;cursor:pointer;color:inherit}
#ng-hud .ng-pill{background:#14243d;border:1px solid #67abce;padding:9px 13px;border-radius:13px;box-shadow:0 5px 30px #050f29a9;font-weight:800;display:block;margin-left:auto}
#ng-hud .ng-panel{margin-top:6px;background:#0f1d33f5;border:1px solid #557b94;border-radius:15px;padding:14px;max-height:70vh;overflow:auto;box-shadow:0 15px 50px #000a}
#ng-hud .ng-row{display:flex;align-items:center;justify-content:space-between;gap:9px;margin:8px 0}
#ng-hud .ng-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:12px 0}
#ng-hud .ng-metric{background:#1b324d;border:1px solid #324e68;padding:8px;border-radius:10px;text-align:center}
#ng-hud .ng-metric b{font-size:18px;display:block;color:#99ffe1}
#ng-hud .ng-metric small{font-size:10px;color:#b4c8dd}
#ng-hud .ng-scroll{max-height:35vh;overflow:auto}
#ng-hud .ng-objective{border-top:1px solid #334a60;padding:7px 0}
#ng-hud .ng-objective small{font-size:11px;line-height:1.4;color:#bfcee2;display:block}
#ng-hud .ng-concepts{margin-top:7px;font-size:11px;color:#d1e5f0}
#ng-hud details summary{cursor:pointer;padding:7px 0;color:#9fe9db;line-height:1.4}
#ng-hud .ng-concepts{margin-left:8px;border-top:1px solid #294359;padding-top:4px}
#ng-hud .ng-concepts summary{cursor:pointer;padding:6px 0;color:#d9eaf0;font-weight:500}
#ng-hud .ng-concept{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-top:1px solid #253e54;padding:7px 4px;font-size:11px}
#ng-hud .ng-concept small{white-space:nowrap;font-size:10px;color:#b6c6d5}
#ng-hud .ng-progress{height:6px;background:#26364d;overflow:hidden;border-radius:9px;margin-top:5px}
#ng-hud .ng-progress > i{height:100%;display:block;background:linear-gradient(90deg,#50b8e9,#6ff6d3)}
#ng-hud .ng-action{padding:7px 9px;border-radius:9px;border:1px solid #58738c;background:#20354d}
#ng-hud select{padding:7px;border-radius:9px;border:1px solid #64839b;background:#14263e}
#ng-overlay{position:fixed;inset:0;z-index:2147483600;overflow:auto;display:flex;justify-content:center;align-items:center;background:#030a19da;backdrop-filter:blur(6px);padding:16px}
#ng-overlay #ng-question-host{position:relative;z-index:3;width:min(660px,100%)}
#ng-overlay .ng-dialog{width:100%;max-height:min(96vh,900px);overflow:auto;background:linear-gradient(135deg,#1e3553,#0e1d31);border-radius:20px;border:1px solid #679abd;box-shadow:0 25px 85px #000c;padding:24px}
#ng-overlay .ng-kicker{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#76ebd1;font-weight:800}
#ng-overlay h2{font-size:clamp(19px,3vw,25px);line-height:1.3;margin:12px 0 18px}
#ng-overlay p{line-height:1.5}
#ng-overlay .ng-detail{font-size:12px;color:#afc6dd;margin-top:8px}
#ng-overlay .ng-answers{display:grid;grid-template-columns:1fr 1fr;gap:9px}
#ng-overlay .ng-option{text-align:left;min-height:58px;padding:12px;background:#1a344f;border:1px solid #496e89;border-radius:11px;line-height:1.4;font-size:13px}
#ng-overlay .ng-option:focus-visible{outline:3px solid #ffe09a}
#ng-overlay .ng-option:hover:not(:disabled){border-color:#76e1d6;background:#22435c}
#ng-overlay .ng-option[disabled]{cursor:default}
#ng-overlay .ng-option.ng-right{border-color:#61e5b7;background:#1d5647}
#ng-overlay .ng-option.ng-wrong{border-color:#f4879a;background:#6a2c42}
#ng-overlay .ng-option.ng-selected{border-color:#7fceeb;background:#274e67}
#ng-overlay .ng-submit{margin-top:12px;padding:10px 15px;background:#3fa9c7;border:0;border-radius:10px;font-weight:800}
#ng-overlay .ng-feedback{margin-top:14px;padding:14px;border-radius:11px;background:#182f49;border:1px solid #688ba4}
#ng-overlay .ng-feedback b{color:#9cf6d5}
#ng-overlay .ng-feedback.ng-failed b{color:#ff9baf}
#ng-overlay .ng-rationale-toggle{margin:4px 0 10px;padding:8px 10px;border:1px solid #7198ae;border-radius:8px;background:#1e4058;color:#eaf8ff;font:inherit}
#ng-overlay .ng-option-rationale,#ng-overlay .ng-reason-rationale{margin:10px 0;padding:10px;border-left:3px solid #db91a7;background:#10253bc9;border-radius:5px;font-size:12px;line-height:1.5}
#ng-overlay .ng-option-rationale[data-correct=true],#ng-overlay .ng-reason-rationale[data-correct=true]{border-left-color:#78edc4}
#ng-overlay #ng-option-rationales[hidden]{display:none!important}
#ng-overlay .ng-rationale-source{display:block;font-size:10px;color:#bad2df;margin-top:5px}
#ng-overlay .ng-next{float:right;background:#63e8cf;color:#061c29!important;padding:11px 17px;border-radius:10px;border:0;font-weight:900}
#ng-overlay .ng-disease-guide{margin:14px 0;padding:14px;border:1px solid #56829c;border-radius:10px;background:#10263c}#ng-overlay .ng-disease-guide h3{color:#9cf6d5;margin-top:0}#ng-overlay .ng-note{color:#bacfe4;font-size:12px}
@media(max-width:550px){#ng-overlay .ng-dialog{padding:14px}#ng-overlay .ng-answers{grid-template-columns:1fr}#ng-hud{right:5px;top:4px}}
`;

export function initNursingUI() {
  if (typeof document === "undefined" || !document.body || hud) return;
  const css = document.createElement("style"); css.id = "ng-style"; css.textContent = style; document.head.appendChild(css);
  hud = document.createElement("div"); hud.id = "ng-hud"; document.body.appendChild(hud);
  initStudyLauncher();
  renderHUD();
}
function renderHUD() {
  if (!hud) return;
  const expanded = new Set(Array.from(hud.querySelectorAll<HTMLDetailsElement>("details[open][data-track-key]"))
    .map(el => el.dataset.trackKey || ""));
  const bank = state.banks[state.selected];
  const facts = factsFor(state.selected);
  const byConcept = new Map<string, NursingFact[]>();
  const byObjective = new Map<string, Map<string, NursingFact[]>>();
  for (const f of facts) {
    if (!byConcept.has(f.conceptId)) byConcept.set(f.conceptId, []);
    byConcept.get(f.conceptId)!.push(f);
    if (!byObjective.has(f.objective)) byObjective.set(f.objective, new Map());
    if (!byObjective.get(f.objective)!.has(f.conceptId)) byObjective.get(f.objective)!.set(f.conceptId, []);
    byObjective.get(f.objective)!.get(f.conceptId)!.push(f);
  }
  const seenSubsections = facts.filter(f => stateOf(f) !== "unseen").length;
  const masteredSubsections = facts.filter(f => stateOf(f) === "known").length;
  const masteredConcepts = [...byConcept.values()].filter(fs => fs.every(f => stateOf(f) === "known")).length;
  const seenConcepts = [...byConcept.values()].filter(fs => fs.some(f => stateOf(f) !== "unseen")).length;
  const pending = facts.filter(f => stateOf(f) === "review").length;
  const due = facts.filter(f => stateOf(f) === "review" && (learningItem(f)?.dueAt || Infinity) <= bank.total).length;
  const masteredObjectives = [...byObjective.values()].filter(concepts => [...concepts.values()].every(items => items.every(f => stateOf(f) === "known"))).length;
  const subStatus = (f: NursingFact) => {
    const i = learningItem(f);
    if (!i || i.attempts === 0) return "Not started";
    if (i.mastered) return `Mastered · ${i.correct}/${i.attempts} correct`;
    const remaining = Math.max(0, (i.dueAt || 0) - bank.total);
    return `${remaining ? `Review in ${remaining}` : "REVIEW DUE"} · ${i.step}/3 retests · ${i.correct}/${i.attempts} correct`;
  };
  const groups = [...byObjective.entries()].map(([code, concepts]) => {
    const objectiveFacts = [...concepts.values()].flat();
    const objMastered = objectiveFacts.filter(f => stateOf(f) === "known").length;
    const objConceptsMastered = [...concepts.values()].filter(items => items.every(f => stateOf(f) === "known")).length;
    const objectiveName = objectiveFacts[0].objectiveName;
    const objectiveKey = `obj:${code}`;
    const details = [...concepts.entries()].map(([cid, items]) => {
      const done = items.filter(f => stateOf(f) === "known").length;
      const seen = items.filter(f => stateOf(f) !== "unseen").length;
      const needsReview = items.some(f => stateOf(f) === "review");
      const status = done === items.length ? "MASTERED" : needsReview ? "Reviews pending" : seen ? "In progress" : "Not started";
      const conceptKey = `concept:${cid}`;
      return `<details class="ng-concepts" data-track-key="${escapeHtml(conceptKey)}" ${expanded.has(conceptKey) ? "open" : ""}><summary><strong>${escapeHtml(items[0].concept)}</strong> · ${done}/${items.length} subsections · ${status}</summary><div class="ng-progress"><i style="width:${Math.round(100*done/items.length)}%"></i></div>${items.map(f => `<div class="ng-concept"><span>${escapeHtml(f.subsectionName)}</span><small>${escapeHtml(subStatus(f))}</small></div>`).join("")}</details>`;
    }).join("");
    return `<div class="ng-objective"><details data-track-key="${escapeHtml(objectiveKey)}" ${expanded.has(objectiveKey) ? "open" : ""}><summary><strong>${escapeHtml(code)}</strong> — ${escapeHtml(objectiveName)} · ${objConceptsMastered}/${concepts.size} concepts</summary><div class="ng-progress"><i style="width:${Math.round(100*objMastered/objectiveFacts.length)}%"></i></div>${details}</details></div>`;
  }).join("");
  hud.innerHTML = `<button class="ng-pill" id="ng-toggle">Patho Quiz · ${state.totalAnswers} answered · ${masteredConcepts}/${byConcept.size} concepts</button>${panelOpen ? `<div class="ng-panel"><div class="ng-row"><strong>MASTERY TRACKER</strong><button class="ng-action" id="ng-close">Collapse</button></div><div class="ng-metrics"><div class="ng-metric"><b>${state.totalAnswers}</b><small>Total answers</small></div><div class="ng-metric"><b>${state.totalAnswers ? Math.round(100 * state.correctAnswers / state.totalAnswers) : 0}%</b><small>Accuracy</small></div><div class="ng-metric"><b>${masteredConcepts}/${byConcept.size}</b><small>Concepts mastered</small></div></div><div class="ng-row"><span>Subject</span><strong>Pathophysiology only</strong></div><div class="ng-row"><span>Battle checks</span><strong>Player attack 3 · Capture 3</strong></div><div class="ng-row"><span>Mastered-concept retest</span><strong>Every 12 battle answers</strong></div><div class="ng-row"><span>Difficulty</span><strong>${LEVELS[bank.tier]} (${bank.tier + 1}/10)</strong></div><div class="ng-row"><span>Correct answers</span><strong>${state.correctAnswers}/${state.totalAnswers}</strong></div><div class="ng-row"><span>Concepts covered</span><strong>${seenConcepts}/${byConcept.size}</strong></div><div class="ng-row"><span>Subsections mastered</span><strong>${masteredSubsections}/${facts.length}</strong></div><div class="ng-row"><span>Subsections seen</span><strong>${seenSubsections}/${facts.length}</strong></div><div class="ng-row"><span>Pending subsection reviews</span><strong>${pending} · ${due} due</strong></div><div class="ng-row"><span>Objectives fully mastered</span><strong>${masteredObjectives}/${byObjective.size}</strong></div><div class="ng-row"><span>Difficulty streaks (+ / −)</span><strong>${bank.rightStreak}/10 · ${bank.wrongStreak}/3</strong></div><div class="ng-row"><span>Prefetched prompts</span><strong>${prepared.length}/${PREFETCH}</strong></div><div class="ng-scroll">${groups}</div><div class="ng-row"><button class="ng-action" id="ng-export">Export progress</button><button class="ng-action" id="ng-import">Import progress</button><input style="display:none" type="file" id="ng-file" accept="application/json,.json"/></div><p class="ng-note">A concept becomes mastered only after every subsection is mastered. Missed subsections follow their own 10/20/50 schedule. Progress is local; use export/import to move between devices.</p></div>` : ""}`;
  hud.querySelector("#ng-toggle")?.addEventListener("click", () => { panelOpen = !panelOpen; renderHUD(); });
  hud.querySelector("#ng-close")?.addEventListener("click", () => { panelOpen = false; renderHUD(); });
  hud.querySelector("#ng-export")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); const url = URL.createObjectURL(blob);
    a.href = url; a.download = "pokerogue-pathophysiology-subsection-progress.json"; a.click(); URL.revokeObjectURL(url);
  });
  hud.querySelector("#ng-import")?.addEventListener("click", () => (hud?.querySelector("#ng-file") as HTMLInputElement | null)?.click());
  hud.querySelector("#ng-file")?.addEventListener("change", async event => {
    if (activeGate) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text()) as unknown;
      const replacement = normalizeState(json);
      if (!replacement) throw Error("Incorrect save format: expected Pathophysiology progress data");
      state = replacement; prepared = []; fillQueue(); persist();
    } catch (error) { window.alert(`Unable to import Pathophysiology progress: ${String(error)}`); }
  });
}

function blockGameplayKeys(event: KeyboardEvent) {
  // Capture before PokéRogue's input listeners while providing number-key controls.
  if (!activeGate) return;
  if ((event.target as Element | null)?.closest?.(".ng-effects-controls") && event.key !== "Tab") return;
  if (event.type === "keydown" && !event.repeat) {
    if (event.key === "Tab") {
      const controls = Array.from(shade?.querySelectorAll<HTMLElement>("button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex='-1'])") || [])
        .filter(element => !element.hidden && !element.closest("[hidden]") && element.getClientRects().length > 0);
      const current = controls.indexOf(document.activeElement as HTMLElement);
      if (controls.length) {
        const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0)
          : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next].focus();
      }
    } else if ((event.key === "Enter" || event.key === " ") && (document.activeElement as HTMLElement | null)?.id === "ng-reveal-rationales") {
      (document.activeElement as HTMLButtonElement).click();
    } else if (/^[1-6]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      shade?.querySelector<HTMLButtonElement>(`button[data-rationale="${index}"]:not([disabled])`)?.click();
      shade?.querySelector<HTMLButtonElement>(`button[data-answer="${index}"]:not([disabled])`)?.click();
    } else if (event.key === "Enter") {
      (shade?.querySelector("#ng-continue:not([disabled])") as HTMLButtonElement | null)?.click();
      (shade?.querySelector("#ng-submit:not([disabled])") as HTMLButtonElement | null)?.click();
    }
  }
  event.preventDefault();
  event.stopImmediatePropagation();
}

/** Attack and capture require 3 correct answers, defense 2; one incorrect ends the check.
 * Questions within one check stay in the same concept and use distinct
 * subsections. The game then performs its native
 * accuracy roll exactly as before. */
export async function openNursingGate(mode: Gate, context?: QuizBattleContext): Promise<boolean> {
  // Enemy turns run the original battle logic without an educational gate.
  if (mode === "defense") return true;
  if (typeof document === "undefined") return false;
  initNursingUI();
  if (activeGate || document.getElementById("ng-overlay")) return false;
  activeGate = true;
  const required = 3;
  prepared = prepared.filter(q => q.fact.bank === state.selected && q.level === state.banks[state.selected].tier);
  fillQueue();
  document.addEventListener("keydown", blockGameplayKeys, true);
  document.addEventListener("keyup", blockGameplayKeys, true);
  shade = document.createElement("div"); shade.id = "ng-overlay";
  shade.setAttribute("role", "dialog"); shade.setAttribute("aria-modal", "true");
  document.body.appendChild(shade);
  const questionHost = document.createElement("div");
  questionHost.id = "ng-question-host";
  shade.appendChild(questionHost);
  let passed = true;
  let conceptId: string | null = retentionConcept();
  const retentionGate=conceptId!==null;
  const usedInGate = new Set<string>();
  try {
    quizBattleHUD = createQuizBattleHUD(shade, context);
    quizEffects = createQuizEffects(shade, mode, [...new Set(nursingFacts.map(f => f.conceptId))]);
    for (let n = 1; n <= required; n++) {
      let q = takeQuestion(conceptId, usedInGate);
      if(n===1){const identification=conceptFacts(q.fact.conceptId).find(isIdentification);if(identification){const item=learningItem(identification);q=makeQuestion(identification,!!item && item.misses>0&&!item.mastered&&item.dueAt<=state.banks[state.selected].total);}}
      if(retentionGate){q.isReview=true;q.isRetention=true;}
      // The first concept anchors every question in this check, including reviews.
      if (!conceptId) conceptId = q.fact.conceptId;
      usedInGate.add(q.fact.id);
      const answer = await askQuestion(q, n, required, mode);
      recordAnswer(q, answer);
      if (!answer) { passed = false; break; }
    }
    return passed;
  } finally {
    quizEffects?.dispose(); quizEffects = null;
    quizBattleHUD?.dispose(); quizBattleHUD = null;
    shade?.remove(); shade = null;
    document.removeEventListener("keydown", blockGameplayKeys, true);
    document.removeEventListener("keyup", blockGameplayKeys, true);
    activeGate = false;
    renderHUD();
  }
}

function renderAnswerFeedback(q: PreparedQuestion, correct: boolean, number: number, required: number, mode: Gate): string {
  const explanations = explainOptions(q.fact, q.options, q.answers, q.rationale);
  const rationaleChoices = explainRationaleOptions(q.fact, q.rationaleOptions, q.rationale);
  const result = correct
    ? number === required
      ? mode === "capture" ? "You earned the throw. The game now uses its normal capture odds." : "The game will now perform its original accuracy check."
      : `${required-number} more correct ${required-number === 1 ? "answer is" : "answers are"} required.`
    : mode === "capture" ? "This throw is blocked. Your ball is kept, and the turn is spent."
      : mode === "attack" ? "Your attack misses this turn." : "The enemy's accuracy roll is bypassed, but type immunity and protection still apply.";
  return `<div class="ng-feedback ${correct ? "" : "ng-failed"}"><b>${correct ? "Correct" : "Incorrect"}</b><p><strong>Answer${q.answers.length > 1 ? "s" : ""}:</strong> ${escapeHtml(q.answers.join("; "))}</p><button type="button" class="ng-rationale-toggle" id="ng-reveal-rationales" aria-controls="ng-option-rationales" aria-expanded="${!correct}">${correct ? "Reveal rationales" : "Hide rationales"}</button><div id="ng-option-rationales" ${correct ? "hidden" : ""}><p><strong>Rationale:</strong> ${escapeHtml(q.rationale)}</p>${renderDiseaseGuide(q.fact)}${explanations.map((item, index) => `<div class="ng-option-rationale" data-answer="${index}" data-correct="${item.correct}"><strong>${String.fromCharCode(65 + index)}. ${escapeHtml(item.option)} — ${item.correct ? "Correct" : "Does not fit"}</strong><p>${escapeHtml(item.explanation)}</p><small class="ng-rationale-source">Study source: ${escapeHtml(item.source)}</small></div>`).join("")}${rationaleChoices.length ? `<p><strong>Explanation choices:</strong></p>${rationaleChoices.map((item, index) => `<div class="ng-reason-rationale" data-rationale="${index}" data-correct="${item.correct}"><strong>${index + 1}. ${escapeHtml(item.option)} — ${item.correct ? "Correct" : "Does not fit"}</strong><p>${escapeHtml(item.explanation)}</p></div>`).join("")}` : ""}${!correct && q.fact.miniLesson?.length ? `<p><strong>Mini-lesson:</strong> ${escapeHtml(q.fact.miniLesson.join(" · "))}</p>` : ""}</div><p class="ng-detail">${escapeHtml(result)}</p><button type="button" class="ng-next" id="ng-continue">Continue</button><div style="clear:both"></div></div>`;
}

function askQuestion(q: PreparedQuestion, number: number, required: number, mode: Gate): Promise<boolean> {
  return new Promise(resolve => {
    if (!shade) { resolve(false); return; }
    const questionHost = shade.querySelector<HTMLElement>("#ng-question-host");
    if (!questionHost) { resolve(false); return; }
    const bank = state.banks[q.fact.bank];
    const challenge = mode === "capture" ? "EARN YOUR POKÉ BALL THROW" : mode === "attack" ? "EARN YOUR ATTACK'S ACCURACY ROLL" : "EARN YOUR CHANCE TO DODGE";
    questionHost.innerHTML = `<div class="ng-dialog" data-mode="${mode}" data-concept="${escapeHtml(q.fact.conceptId)}" data-subsection="${escapeHtml(q.fact.subsectionId)}" data-identification="${isIdentification(q.fact)}" data-level="${q.level + 1}" data-review="${q.isReview}" data-retention="${!!q.isRetention}"><div class="ng-kicker">${challenge} · Question ${number} of ${required}</div><div class="ng-detail">${escapeHtml(bankNames[q.fact.bank])} · ${escapeHtml(q.fact.topicLabel)} · ${isIdentification(q.fact) ? "Identify the condition" : escapeHtml(q.fact.concept)} · ${escapeHtml(q.fact.subsectionName)} · ${escapeHtml(LEVELS[q.level])} (level ${q.level + 1}/10)${q.isRetention ? " · MASTERY RETENTION CHECK · EVERY 12 ANSWERS" : q.isReview ? " · SCHEDULED MASTERY REVIEW" : ""}${q.isSelectAll ? " · SELECT ALL THAT APPLY" : ""}${q.rationaleOptions.length ? " · ANSWER AND EXPLANATION REQUIRED" : ""}</div><h2>${escapeHtml(q.stem)}</h2><div class="ng-answers">${q.options.map((option, i) => `<button class="ng-option" type="button" aria-pressed="false" data-answer="${i}"><b>${String.fromCharCode(65 + i)}.</b> ${escapeHtml(option)}</button>`).join("")}</div>${q.isSelectAll ? `<button id="ng-submit" type="button" class="ng-submit">Submit selected answers</button>` : ""}<div id="ng-explanations" aria-live="polite"></div><div id="ng-response" aria-live="polite"></div><p class="ng-note">${mode === "capture" ? "3 correct answers earn the throw. Passing keeps the normal capture odds; a mistake blocks this throw and keeps the ball." : `${required} correct answers required. A mistake causes your attack to miss. Pokémon immunity and Protect effects still work normally.`}</p><p class="ng-note">${escapeHtml(q.fact.source)}</p></div>`;
    quizEffects?.showQuestion(q.fact.conceptId);
    let answered = false;
    const selectedOptions = new Set<string>();
    let selectedRationale: string | null = null;
    const grade = () => {
      if (answered) return;
      answered = true;
      const correct = selectedOptions.size === q.answers.length && q.answers.every(answer => selectedOptions.has(answer))
        && (!q.rationaleOptions.length || selectedRationale === q.rationale);
      recordStudyAnswer(q.fact, [...selectedOptions], correct);
      quizEffects?.answer(correct, correct && number === required);
      shade?.querySelectorAll<HTMLButtonElement>("button[data-rationale]").forEach(button => {
        button.disabled = true;
        const option = q.rationaleOptions[Number(button.dataset.rationale)];
        if (option === q.rationale) button.classList.add("ng-right");
        else if (option === selectedRationale) button.classList.add("ng-wrong");
      });
      shade?.querySelectorAll<HTMLButtonElement>("button[data-answer]").forEach(button => {
        button.disabled = true;
        const option = q.options[Number(button.dataset.answer)];
        if (q.answers.includes(option)) button.classList.add("ng-right");
        else if (selectedOptions.has(option)) button.classList.add("ng-wrong");
        button.classList.remove("ng-selected");
      });
      const submit = shade?.querySelector<HTMLButtonElement>("#ng-submit");
      if (submit) submit.disabled = true;
      const response = shade?.querySelector<HTMLElement>("#ng-response");
      if (response) response.innerHTML = renderAnswerFeedback(q, correct, number, required, mode) + repairMarkup(q.fact);
      shade?.querySelector("#ng-reveal-rationales")?.addEventListener("click", event => {
        const button = event.currentTarget as HTMLButtonElement;
        const details = shade?.querySelector<HTMLElement>("#ng-option-rationales");
        if (!details) return;
        details.hidden = !details.hidden;
        button.setAttribute("aria-expanded", String(!details.hidden));
        button.textContent = details.hidden ? "Reveal rationales" : "Hide rationales";
      });
      shade?.querySelector("#ng-continue")?.addEventListener("click", async event => {
        (event.currentTarget as HTMLButtonElement).disabled = true;
        // Keep each bounce, and the final completion spin, visible even if
        // Continue is pressed immediately. Combat stays paused throughout.
        await quizEffects?.settled();
        resolve(correct);
      }, { once: true });
      (shade?.querySelector("#ng-continue") as HTMLButtonElement | null)?.focus();
    };
    shade.querySelectorAll<HTMLButtonElement>("button[data-answer]").forEach(button => button.addEventListener("click", () => {
      const option = q.options[Number(button.dataset.answer)];
      if (q.isSelectAll) {
        if (selectedOptions.has(option)) selectedOptions.delete(option);
        else selectedOptions.add(option);
        button.classList.toggle("ng-selected", selectedOptions.has(option));
        button.setAttribute("aria-pressed", String(selectedOptions.has(option)));
      } else {
        selectedOptions.add(option);
        if (!q.rationaleOptions.length) { grade(); return; }
        // Lock the interpretation before requesting its explanation. Neither
        // component receives correctness feedback until both are submitted.
        shade?.querySelectorAll<HTMLButtonElement>("button[data-answer]").forEach(answerButton => {
          answerButton.disabled = true;
          if (answerButton === button) answerButton.classList.add("ng-selected");
        });
        const explanations = shade?.querySelector<HTMLElement>("#ng-explanations");
        if (!explanations) { resolve(false); return; }
        explanations.innerHTML = `<p><strong>Choose the explanation that supports your interpretation.</strong> Both selections must be correct.</p><div class="ng-answers">${q.rationaleOptions.map((option, i) => `<button class="ng-option" type="button" data-rationale="${i}"><b>${i + 1}.</b> ${escapeHtml(option)}</button>`).join("")}</div>`;
        explanations.querySelectorAll<HTMLButtonElement>("button[data-rationale]").forEach(rationaleButton => rationaleButton.addEventListener("click", () => {
          selectedRationale = q.rationaleOptions[Number(rationaleButton.dataset.rationale)];
          grade();
        }));
        explanations.querySelector<HTMLButtonElement>("button[data-rationale]")?.focus();
      }
    }));
    shade.querySelector("#ng-submit")?.addEventListener("click", grade);
    (shade.querySelector("button[data-answer]") as HTMLElement | null)?.focus();
  });
}

// Show the tracker when the bundled mod loads, including on the title screen.
if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initNursingUI, { once: true });
  else initNursingUI();
}


