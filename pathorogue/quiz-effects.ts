/** Visual feedback belongs to the active quiz overlay only. No battle hooks. */
const BALL_URL = new URL("./quiz-ball.png", import.meta.url).href;
const STARS_URL = new URL("./quiz-stars.png", import.meta.url).href;
const AUDIO_KEY = "pokerogue.quiz-effects.audio.v1";
const WRONG_COLOR = "#ff425c";
const BOUNCE_MS = 420;
const SPIN_MS = 850;
// Shared between attack/defense overlays so all three colors change even when
// the next prompt opens in a newly created gate.
let previousStarHues: number[] = [];

type QuizMode = "attack" | "defense" | "capture";
type AudioPreferences = { muted: boolean; volume: number };
type Particle = { x: number; y: number; vx: number; vy: number; angle: number; spin: number; born: number; life: number; size: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function audioPreferences(): AudioPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(AUDIO_KEY) || "null");
    if (stored && typeof stored === "object") return {
      muted: stored.muted === true,
      volume: Number.isFinite(stored.volume) ? clamp(stored.volume) : 0.65,
    };
  } catch { /* Unavailable storage does not prevent the quiz from opening. */ }
  return { muted: false, volume: 0.65 };
}

function gameVolume(): number {
  try {
    const audio = JSON.parse(localStorage.getItem("settings") || "null")?.audio;
    if (audio?.enableAudio === false) return 0;
    const master = Number.isFinite(audio?.masterVolume) ? clamp(audio.masterVolume) : 0.3;
    const effects = Number.isFinite(audio?.soundEffectsVolume) ? clamp(audio.soundEffectsVolume) : 0.5;
    return master * effects;
  } catch { return 0.15; }
}

const CSS = `
.ng-effects{display:contents;pointer-events:none}
.ng-with-effects #ng-question-host{position:relative;z-index:4;max-width:100%}
.ng-with-effects .ng-dialog{position:relative;z-index:4;max-height:calc(100dvh - 92px)!important}
.ng-with-effects{padding-top:58px!important;padding-bottom:24px!important}
.ng-effects .ng-stars{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;opacity:.72}
.ng-effects .ng-star{position:absolute;inset:-14px;mask-repeat:no-repeat;mask-position:center;mask-size:cover;mask-mode:luminance;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:cover;transition:background-color .18s ease;animation:ng-star-drift 9s ease-in-out infinite alternate,ng-star-twinkle 3.4s ease-in-out infinite;will-change:transform,opacity;transform-origin:50% 50%;filter:drop-shadow(0 0 9px currentColor)}
.ng-effects .ng-star:nth-child(2){animation-duration:11s,4.1s;animation-delay:-3s,-1.4s;transform-origin:65% 32%}
.ng-effects .ng-star:nth-child(3){animation-duration:13s,2.9s;animation-delay:-6s,-.7s;transform-origin:30% 75%}
.ng-effects .ng-star-sparkle{position:absolute;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 94%,50% 72%,21% 94%,32% 57%,2% 35%,39% 35%);pointer-events:none;animation:ng-sparkle-drift var(--drift-duration,8s) ease-in-out infinite alternate,ng-star-twinkle var(--twinkle-duration,3s) ease-in-out infinite;animation-delay:var(--star-delay,0s);transition:background-color .18s ease;filter:drop-shadow(0 0 6px currentColor);will-change:transform,opacity}
.ng-effects[data-feedback=wrong] .ng-star,.ng-effects[data-feedback=wrong] .ng-star-sparkle{transition:none}
.ng-effects .ng-ball{position:fixed;top:calc(50% - 58px);width:116px;height:116px;z-index:5;pointer-events:none;transform-origin:50% 50%;filter:drop-shadow(0 10px 16px #000a);opacity:.85}
.ng-effects .ng-ball[data-side=player]{left:max(12px,calc((100vw - 660px)/4 - 58px))}
.ng-effects .ng-ball[data-side=enemy]{right:max(12px,calc((100vw - 660px)/4 - 58px))}
.ng-effects .ng-ball.is-active{opacity:1;filter:drop-shadow(0 0 12px #b2f7ff66) drop-shadow(0 10px 16px #000a)}
.ng-effects .ng-ball-crop{position:absolute;inset:0;overflow:hidden;border-radius:50%;animation:ng-quiz-wiggle 3.6s ease-in-out infinite;transform-origin:50% 70%}
.ng-effects .ng-ball img{position:absolute;width:211%;height:auto;max-width:none;left:-55%;top:-29%;user-select:none;-webkit-user-drag:none}
.ng-effects .ng-ball.is-bouncing{animation:ng-quiz-bounce .42s ease-out both}
.ng-effects .ng-ball.is-spinning{animation:ng-quiz-spin .85s cubic-bezier(.2,.7,.25,1) both}
.ng-effects .ng-ball.is-bouncing .ng-ball-crop,.ng-effects .ng-ball.is-spinning .ng-ball-crop{animation:none}
.ng-effects .ng-confetti{position:fixed;inset:0;z-index:6;pointer-events:none;overflow:hidden}
.ng-effects .ng-confetti canvas{width:100%;height:100%;display:block}
.ng-effects .ng-effects-controls{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:9px;padding:5px 9px;border-radius:999px;background:#102039ed;border:1px solid #5d879e;color:#eaf6ff;font:12px system-ui,sans-serif;pointer-events:auto;box-shadow:0 3px 16px #0007}
.ng-effects .ng-sound-toggle{padding:3px 5px!important;min-height:26px;white-space:nowrap;border:0;border-radius:5px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.ng-effects .ng-sound-toggle:focus-visible,.ng-effects .ng-sound-volume:focus-visible{outline:2px solid #9df8de;outline-offset:3px}
.ng-effects .ng-sound-volume{width:78px;height:18px;accent-color:#8beed6;cursor:pointer}
.ng-effects .ng-effects-controls label{display:flex;align-items:center;gap:6px}
@keyframes ng-quiz-wiggle{0%,100%{transform:rotate(-2.5deg) translateY(0)}50%{transform:rotate(2.5deg) translateY(-2px)}}
@keyframes ng-quiz-bounce{0%,100%{transform:translateY(0) scale(1)}38%{transform:translateY(-34px) scale(1.04)}66%{transform:translateY(0) scale(1.07,.92)}84%{transform:translateY(-10px) scale(.98,1.02)}}
@keyframes ng-quiz-spin{0%{transform:rotate(0deg) scale(1)}45%{transform:rotate(370deg) scale(1.13)}100%{transform:rotate(720deg) scale(1)}}
@keyframes ng-star-drift{0%{transform:translate3d(-8px,10px,0) scale(.985) rotate(-1deg)}50%{transform:translate3d(5px,-7px,0) scale(1.025) rotate(.7deg)}100%{transform:translate3d(11px,-15px,0) scale(1.045) rotate(1.5deg)}}
@keyframes ng-sparkle-drift{0%{transform:translate3d(-5px,8px,0) scale(.65) rotate(-12deg)}50%{transform:translate3d(5px,-3px,0) scale(1.05) rotate(5deg)}100%{transform:translate3d(-2px,-20px,0) scale(.82) rotate(18deg)}}
@keyframes ng-star-twinkle{0%,100%{opacity:.3;filter:brightness(.85) drop-shadow(0 0 3px currentColor)}35%{opacity:1;filter:brightness(1.45) drop-shadow(0 0 12px currentColor)}65%{opacity:.55;filter:brightness(1.05) drop-shadow(0 0 6px currentColor)}}
@media(max-width:940px){
 .ng-effects .ng-ball{width:46px;height:46px;top:12px}
 .ng-effects .ng-ball[data-side=player]{left:10px}
 .ng-effects .ng-ball[data-side=enemy]{right:10px}
 .ng-effects .ng-effects-controls{top:16px;font-size:11px;gap:5px;padding:3px 6px}
 .ng-effects .ng-sound-volume{width:60px}
 .ng-effects .ng-effects-controls .ng-volume-word{display:none}
 .ng-with-effects{padding-top:72px!important}
 .ng-with-effects .ng-dialog{max-height:calc(100dvh - 98px)!important}
}
@media(prefers-reduced-motion:reduce){
 .ng-effects .ng-ball-crop,.ng-effects .ng-ball.is-bouncing,.ng-effects .ng-ball.is-spinning,.ng-effects .ng-star,.ng-effects .ng-star-sparkle{animation:none!important}
 .ng-effects .ng-star,.ng-effects .ng-star-sparkle{transition:none;opacity:.65;will-change:auto}
 .ng-effects .ng-ball.is-bouncing,.ng-effects .ng-ball.is-spinning{filter:drop-shadow(0 0 12px #a6ffe0)}
}
`;

export function createQuizEffects(overlay: HTMLElement, mode: QuizMode, conceptIds: readonly string[] = []) {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  const activeSide = mode === "defense" ? "enemy" : "player";
  const preferences = audioPreferences();
  const colors = new Map<string, string>();
  const sortedIds = [...new Set(conceptIds)].sort();
  // Golden-angle hues are stable for the sorted disease bank and distinct for
  // all 96 concepts; a new question about the same disease retains its color.
  sortedIds.forEach((id, index) => colors.set(id, `hsl(${((index * 137.507764) % 360).toFixed(4)} 88% 65%)`));

  const root = document.createElement("div");
  root.className = "ng-effects";
  root.dataset.activeSide = activeSide;
  root.dataset.mode = mode;
  root.dataset.synchronizedBalls = "true";
  root.dataset.starMotion = reducedMotion ? "reduced" : "drift-twinkle";
  root.dataset.feedback = "question";
  root.dataset.promptCount = "0";
  root.dataset.correctCount = "0";
  root.dataset.wrongCount = "0";
  root.dataset.soundCorrectCount = "0";
  root.dataset.soundWrongCount = "0";
  root.dataset.reducedMotion = String(reducedMotion);
  const style = document.createElement("style");
  style.textContent = CSS;
  root.appendChild(style);

  const stars = document.createElement("div");
  stars.className = "ng-stars";
  stars.setAttribute("aria-hidden", "true");
  const clips = ["polygon(0 0,50% 50%,0 100%)", "polygon(0 0,100% 0,100% 50%,50% 50%)", "polygon(50% 50%,100% 50%,100% 100%,0 100%)"];
  const starLayers = clips.map(clip => {
    const layer = document.createElement("div");
    layer.className = "ng-star";
    layer.style.maskImage = `url("${STARS_URL}")`;
    layer.style.setProperty("-webkit-mask-image", `url("${STARS_URL}")`);
    layer.style.clipPath = clip;
    stars.appendChild(layer);
    return layer;
  });
  // Small stars add depth to the original three-star image without requiring
  // an animated source asset. All are part of the same three question colors.
  const sparkles = Array.from({ length: 18 }, (_, index) => {
    const sparkle = document.createElement("span");
    const size = [6, 10, 16, 8, 20, 12][index % 6];
    sparkle.className = "ng-star-sparkle";
    sparkle.dataset.starGroup = String(index % 3);
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${4 + (index * 37) % 92}%`;
    sparkle.style.top = `${5 + (index * 23) % 90}%`;
    sparkle.style.setProperty("--drift-duration", `${7 + index % 7}s`);
    sparkle.style.setProperty("--twinkle-duration", `${2.2 + (index % 5) * 0.45}s`);
    sparkle.style.setProperty("--star-delay", `${-index * 0.37}s`);
    stars.appendChild(sparkle);
    return sparkle;
  });
  root.dataset.starSparkleCount = String(sparkles.length);
  root.appendChild(stars);

  const balls = (["player", "enemy"] as const).map(side => {
    const ball = document.createElement("div");
    ball.className = `ng-ball${side === activeSide ? " is-active" : ""}`;
    ball.dataset.side = side;
    ball.setAttribute("aria-hidden", "true");
    const crop = document.createElement("div");
    crop.className = "ng-ball-crop";
    const image = document.createElement("img");
    image.src = BALL_URL;
    image.alt = "";
    image.draggable = false;
    crop.appendChild(image);
    ball.appendChild(crop);
    root.appendChild(ball);
    return ball;
  });
  const ballCrops = balls.map(ball => ball.firstElementChild as HTMLElement);

  const controls = document.createElement("div");
  controls.className = "ng-effects-controls";
  const mute = document.createElement("button");
  mute.type = "button";
  mute.className = "ng-sound-toggle";
  mute.setAttribute("aria-label", "Quiz sound");
  const volumeLabel = document.createElement("label");
  const volumeWord = document.createElement("span");
  volumeWord.className = "ng-volume-word";
  volumeWord.textContent = "Volume";
  const volume = document.createElement("input");
  volume.type = "range";
  volume.className = "ng-sound-volume";
  volume.min = "0";
  volume.max = "100";
  volume.step = "5";
  volume.value = String(Math.round(preferences.volume * 100));
  volume.setAttribute("aria-label", "Quiz sound volume");
  volumeLabel.append(volumeWord, volume);
  controls.append(mute, volumeLabel);
  root.appendChild(controls);
  overlay.classList.add("ng-with-effects");
  overlay.appendChild(root);

  let disposed = false;
  let concept = "";
  let currentColor = "hsl(0 88% 65%)";
  let lastFinish = 0;
  let animationSerial = 0;
  let animationDone: Promise<void> = Promise.resolve();
  let resolveAnimation: (() => void) | null = null;
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  const oscillators = new Set<OscillatorNode>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const pendingSettles = new Set<() => void>();
  const bursts = new Set<{ wrapper: HTMLElement; raf: number }>();

  const schedule = (fn: () => void, ms: number) => {
    const timer = setTimeout(() => { timers.delete(timer); if (!disposed) fn(); }, ms);
    timers.add(timer);
    return timer;
  };
  let motionSequence = 0;
  let idleEpoch = 0;
  const setMotionPhase = (phase: "idle" | "bounce" | "spin") => {
    const sequence = String(++motionSequence);
    const at = String(performance.now());
    for (const ball of balls) {
      ball.classList.remove("is-idle", "is-bouncing", "is-spinning");
      ball.dataset.motionPhase = phase;
      ball.dataset.motionSequence = sequence;
      ball.dataset.motionStartedAt = at;
    }
    // Flush the removal once for both balls, so repeated correct answers also
    // restart one shared CSS timeline rather than retaining an old animation.
    void root.offsetWidth;
    for (const ball of balls) ball.classList.add(phase === "idle" ? "is-idle" : phase === "bounce" ? "is-bouncing" : "is-spinning");
    void root.offsetWidth;
    const sharedStart = document.timeline?.currentTime;
    const name = phase === "idle" ? "ng-quiz-wiggle" : phase === "bounce" ? "ng-quiz-bounce" : "ng-quiz-spin";
    for (const node of phase === "idle" ? ballCrops : balls) {
      for (const animation of node.getAnimations?.() || []) {
        if ((animation as CSSAnimation).animationName !== name) continue;
        animation.currentTime = 0;
        if (typeof sharedStart === "number") animation.startTime = sharedStart;
      }
    }
    root.dataset.motionPhase = phase;
    root.dataset.motionSequence = sequence;
    root.dataset.motionStartedAt = at;
    root.dataset.motionTimelineStart = String(sharedStart ?? "unavailable");
    if (phase === "idle") {
      const epoch = String(++idleEpoch);
      root.dataset.idleEpoch = epoch;
      for (const ball of balls) ball.dataset.idleEpoch = epoch;
    }
  };
  const savePreferences = () => {
    try { localStorage.setItem(AUDIO_KEY, JSON.stringify(preferences)); } catch { /* Best effort offline preference. */ }
  };
  const updateAudioControls = () => {
    const gameMuted = gameVolume() === 0;
    mute.textContent = gameMuted ? "Sound off (game)" : preferences.muted || preferences.volume === 0 ? "Sound off" : "Sound on";
    mute.setAttribute("aria-pressed", String(!preferences.muted && preferences.volume > 0 && !gameMuted));
    mute.title = gameMuted ? "Quiz sound follows the game's audio settings" : "Toggle quiz sound";
    root.dataset.audioState = gameMuted ? "game-muted" : preferences.muted || preferences.volume === 0 ? "muted" : "ready";
    root.dataset.volume = String(preferences.volume);
  };
  const ensureAudio = () => {
    if (disposed || context || !window.AudioContext) return;
    try {
      context = new AudioContext();
      masterGain = context.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(context.destination);
    } catch { root.dataset.audioState = "unavailable"; }
  };
  const playSound = (correct: boolean) => {
    updateAudioControls();
    const loudness = preferences.muted ? 0 : preferences.volume * gameVolume();
    if (loudness <= 0 || disposed) return;
    ensureAudio();
    const audio = context;
    const destination = masterGain;
    if (!audio || !destination) return;
    const play = () => {
      if (disposed || audio.state === "closed") return;
      const now = audio.currentTime;
      const notes = correct ? [523.25, 659.25, 783.99] : [233.08, 174.61];
      notes.forEach((frequency, index) => {
        const osc = audio.createOscillator();
        const envelope = audio.createGain();
        const start = now + index * (correct ? 0.065 : 0.08);
        const duration = correct ? 0.16 : 0.23;
        osc.type = correct ? "sine" : "triangle";
        osc.frequency.setValueAtTime(frequency, start);
        if (!correct) osc.frequency.exponentialRampToValueAtTime(frequency * 0.78, start + duration);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(loudness * 0.35, start + 0.012);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.015);
        envelope.gain.linearRampToValueAtTime(0, start + duration);
        osc.connect(envelope);
        envelope.connect(destination);
        oscillators.add(osc);
        osc.onended = () => { oscillators.delete(osc); osc.disconnect(); envelope.disconnect(); };
        osc.start(start);
        osc.stop(start + duration + 0.01);
      });
      const key = correct ? "soundCorrectCount" : "soundWrongCount";
      root.dataset[key] = String(Number(root.dataset[key] || 0) + 1);
      root.dataset.audioState = "playing";
      schedule(updateAudioControls, correct ? 310 : 340);
    };
    if (audio.state === "suspended") void audio.resume().then(play).catch(() => { root.dataset.audioState = "unavailable"; });
    else play();
  };
  const onMute = () => { preferences.muted = !preferences.muted; savePreferences(); updateAudioControls(); ensureAudio(); if (context?.state === "suspended") void context.resume().catch(() => {}); };
  const onVolume = () => { preferences.volume = clamp(Number(volume.value) / 100); savePreferences(); updateAudioControls(); };
  const blockControls = (event: Event) => event.stopPropagation();
  mute.addEventListener("click", onMute);
  volume.addEventListener("input", onVolume);
  controls.addEventListener("keydown", blockControls);
  controls.addEventListener("keyup", blockControls);
  updateAudioControls();

  const tintStars = (palette: string[]) => {
    const tint = (layer: HTMLElement, color: string) => { layer.style.backgroundColor = color; layer.style.color = color; layer.dataset.color = color; };
    starLayers.forEach((layer, index) => tint(layer, palette[index]));
    sparkles.forEach(sparkle => tint(sparkle, palette[Number(sparkle.dataset.starGroup)]));
    root.dataset.starPalette = palette.join("|");
  };
  const colorFor = (id: string) => {
    if (!colors.has(id)) {
      let hash = 2166136261;
      for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
      let hue = ((hash >>> 0) % 360000) / 1000;
      let color = `hsl(${hue.toFixed(4)} 88% 65%)`;
      while ([...colors.values()].includes(color)) { hue = (hue + 0.01) % 360; color = `hsl(${hue.toFixed(4)} 88% 65%)`; }
      colors.set(id, color);
    }
    return colors.get(id)!;
  };
  const confetti = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "ng-confetti";
    wrapper.dataset.diseaseColor = currentColor;
    wrapper.dataset.concept = concept;
    wrapper.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    wrapper.appendChild(canvas);
    root.appendChild(wrapper);
    const rect = overlay.getBoundingClientRect();
    const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    const draw = canvas.getContext("2d");
    if (!draw) { wrapper.remove(); return; }
    draw.scale(dpr, dpr);
    const compact = width <= 940;
    const born = performance.now();
    const life = reducedMotion ? 170 : 1000;
    const count = reducedMotion ? 8 : 48;
    const burstColor = currentColor;
    const origins = balls.map(ball => { const r = ball.getBoundingClientRect();return {side:ball.dataset.side,x:r.left+r.width/2-rect.left,y:r.top+r.height/2-rect.top}; });
    wrapper.dataset.emitters = JSON.stringify(origins);
    wrapper.dataset.born = String(born);
    const particles: Particle[] = origins.flatMap(origin => Array.from({ length: count }, () => ({
      x: origin.x,
      y: origin.y,
      vx: (Math.random() - 0.5) * (reducedMotion ? 25 : 430),
      vy: reducedMotion ? -10 : compact ? -20 - Math.random() * 50 : -170 - Math.random() * 230,
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 10,
      born, life: life * (0.75 + Math.random() * 0.25), size: reducedMotion ? 4 : 4 + Math.random() * 5,
    })));
    const burst = { wrapper, raf: 0 };
    bursts.add(burst);
    const frame = (now: number) => {
      if (disposed) return;
      draw.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of particles) {
        const elapsed = now - p.born;
        if (elapsed >= p.life) continue;
        alive = true;
        const seconds = elapsed / 1000;
        draw.save();
        draw.globalAlpha = Math.max(0, 1 - elapsed / p.life);
        draw.fillStyle = burstColor;
        draw.translate(p.x + p.vx * seconds, p.y + p.vy * seconds + (reducedMotion ? 0 : 260 * seconds * seconds));
        draw.rotate(p.angle + p.spin * seconds);
        draw.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        draw.restore();
      }
      if (alive) burst.raf = requestAnimationFrame(frame);
      else { bursts.delete(burst); wrapper.remove(); }
    };
    burst.raf = requestAnimationFrame(frame);
    lastFinish = Math.max(lastFinish, born + life);
  };

  setMotionPhase("idle");
  return {
    showQuestion(conceptId: string) {
      if (disposed) return;
      // A defensive reattach also supports older dialog renderers replacing
      // overlay.innerHTML. Current integration preserves #ng-question-host.
      if (root.parentElement !== overlay) overlay.appendChild(root);
      concept = conceptId;
      currentColor = colorFor(conceptId);
      root.dataset.concept = conceptId;
      root.dataset.diseaseColor = currentColor;
      root.dataset.feedback = "question";
      root.dataset.promptCount = String(Number(root.dataset.promptCount || 0) + 1);
      // Retire the previous response's confetti before the new prompt; a later
      // incorrect answer must never inherit an earlier correct celebration.
      bursts.forEach(burst => { cancelAnimationFrame(burst.raf); burst.wrapper.remove(); });
      bursts.clear();
      const hues = [0, 1, 2].map(index => {
        const choices = Array.from({ length: 90 }, (_, offset) => index * 120 + offset)
          .filter(hue => !previousStarHues.includes(hue));
        return choices[Math.floor(Math.random() * choices.length)];
      });
      previousStarHues = [...hues];
      const palette = hues.map(hue => `hsl(${hue} 88% 65%)`);
      tintStars(palette);
      updateAudioControls();
    },
    answer(correct: boolean, complete = false) {
      if (disposed) return;
      root.dataset.feedback = correct ? "correct" : "wrong";
      root.dataset.complete = String(correct && complete);
      const countKey = correct ? "correctCount" : "wrongCount";
      root.dataset[countKey] = String(Number(root.dataset[countKey] || 0) + 1);
      playSound(correct);
      if (!correct) {
        ++animationSerial;
        setMotionPhase("idle");
        resolveAnimation?.(); resolveAnimation = null;
        bursts.forEach(burst => { cancelAnimationFrame(burst.raf); burst.wrapper.remove(); });
        bursts.clear();
        tintStars([WRONG_COLOR, WRONG_COLOR, WRONG_COLOR]);
        lastFinish = Math.max(lastFinish, performance.now() + 340);
        return;
      }
      confetti();
      const token = ++animationSerial;
      resolveAnimation?.();
      animationDone = new Promise<void>(resolve => { resolveAnimation = resolve; });
      const finishAnimation = () => {
        if (animationSerial !== token) return;
        setMotionPhase("idle");
        resolveAnimation?.(); resolveAnimation = null;
      };
      const bounce = reducedMotion ? 60 : BOUNCE_MS;
      const spin = reducedMotion ? 60 : SPIN_MS;
      setMotionPhase("bounce");
      schedule(() => {
        if (animationSerial !== token) return;
        if (complete) {
          setMotionPhase("spin");
          schedule(() => {
            if (animationSerial !== token) return;
            finishAnimation();
          }, spin);
        } else finishAnimation();
      }, bounce);
      lastFinish = Math.max(lastFinish, performance.now() + bounce + (complete ? spin : 0), performance.now() + 340);
    },
    settled(): Promise<void> {
      if (disposed || (!resolveAnimation && lastFinish <= performance.now())) return Promise.resolve();
      return new Promise(resolve => {
        const finish = () => { pendingSettles.delete(finish); resolve(); };
        pendingSettles.add(finish);
        let deadlineReady = lastFinish <= performance.now();
        let animationReady = !resolveAnimation;
        const maybeFinish = () => { if (deadlineReady && animationReady) finish(); };
        if (!deadlineReady) schedule(() => { deadlineReady = true; maybeFinish(); }, Math.max(0, lastFinish - performance.now()) + 24);
        // A busy renderer can run the bounce callback late. Wait for the real
        // scheduled spin-end callback, rather than predicting its end from the
        // answer timestamp and dismissing an animation that only just started.
        if (!animationReady) void animationDone.then(() => { animationReady = true; maybeFinish(); });
        maybeFinish();
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      resolveAnimation?.(); resolveAnimation = null;
      timers.forEach(timer => clearTimeout(timer)); timers.clear();
      bursts.forEach(burst => { cancelAnimationFrame(burst.raf); burst.wrapper.remove(); }); bursts.clear();
      oscillators.forEach(oscillator => { try { oscillator.stop(); oscillator.disconnect(); } catch { /* Already ended. */ } });
      oscillators.clear();
      if (context && context.state !== "closed") void context.close().catch(() => {});
      context = null; masterGain = null;
      pendingSettles.forEach(resolve => resolve()); pendingSettles.clear();
      mute.removeEventListener("click", onMute); volume.removeEventListener("input", onVolume);
      controls.removeEventListener("keydown", blockControls); controls.removeEventListener("keyup", blockControls);
      root.remove(); overlay.classList.remove("ng-with-effects");
    },
  };
}
