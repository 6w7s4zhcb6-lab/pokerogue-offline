import type { QuizBattleContext, QuizPokemon } from "./battle-context";

const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
const health = (pokemon: QuizPokemon) => {
  const max = Math.max(1, Math.floor(Number(pokemon.maxHp) || 1));
  const hp = Math.min(max, Math.max(0, Math.floor(Number(pokemon.hp) || 0)));
  return { hp, max, percent: 100 * hp / max };
};
const CSS = `
.ng-battle-hud{display:contents;pointer-events:none}
.ng-battle-hud .ng-current,.ng-battle-hud .ng-party{position:fixed;z-index:7;width:min(270px,calc((100vw - 700px)/2));background:#102039ed;border:1px solid #5d879e;border-radius:13px;padding:10px;color:#eaf6ff;box-shadow:0 5px 20px #0006;font:12px system-ui,sans-serif;pointer-events:none}
.ng-battle-hud [data-side=player]{left:12px}.ng-battle-hud [data-side=enemy]{right:12px}
.ng-battle-hud .ng-current{top:12px;display:grid;grid-template-columns:48px minmax(0,1fr);gap:8px;align-items:center;min-height:82px}
.ng-battle-hud .ng-current-label{font-size:10px;color:#9fe9db;text-transform:uppercase;letter-spacing:.06em}
.ng-battle-hud .ng-pokemon-name{font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:3px 0}
.ng-battle-hud .ng-pokemon-icon{width:48px;height:40px;object-fit:contain;image-rendering:pixelated}
.ng-battle-hud .ng-icon-fallback{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#28405a;font-weight:900;font-size:17px}
.ng-battle-hud .ng-hp{height:6px;background:#081321;border-radius:6px;overflow:hidden;margin:5px 0 3px}
.ng-battle-hud .ng-hp i{display:block;height:100%;background:#6ce4ae}
.ng-battle-hud .ng-hp[data-health=low] i{background:#ffcf67}.ng-battle-hud .ng-hp[data-health=critical] i{background:#ff6b85}
.ng-battle-hud .ng-health-text{color:#d3e5f2;font-size:11px;font-variant-numeric:tabular-nums}
.ng-battle-hud .ng-party{bottom:12px}
.ng-battle-hud .ng-party-title{font-weight:800;font-size:10px;color:#a7c9de;text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px}
.ng-battle-hud .ng-party-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.ng-battle-hud .ng-party-slot{min-width:0;border:1px solid #3e596c;border-radius:7px;padding:3px;text-align:center;background:#1b3048}
.ng-battle-hud .ng-party-slot.is-current{border-color:#7cf2d6;box-shadow:inset 0 0 0 1px #7cf2d633}
.ng-battle-hud .ng-party-slot .ng-pokemon-icon{width:36px;height:27px;display:block;margin:auto}
.ng-battle-hud .ng-party-slot .ng-icon-fallback{width:27px;height:27px;font-size:12px;margin:auto}
.ng-battle-hud .ng-party-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;line-height:1.4}
.ng-battle-hud .ng-party-hp{display:block;color:#bcd5e5;font-size:9px;line-height:1.4;font-variant-numeric:tabular-nums}
.ng-battle-hud .is-fainted{filter:grayscale(1);opacity:.45}
.ng-battle-hud .is-empty{opacity:.32;display:grid;place-items:center;min-height:57px;font-size:22px;color:#91a8bf}
@media(max-width:1100px){
 #ng-overlay.ng-has-battle-hud{padding-top:151px!important;padding-bottom:164px!important}
 #ng-overlay.ng-has-battle-hud .ng-dialog{max-height:calc(100dvh - 335px)!important}
 .ng-battle-hud .ng-current,.ng-battle-hud .ng-party{width:calc(50vw - 18px);padding:7px;border-radius:10px}
 .ng-battle-hud .ng-current{top:72px;grid-template-columns:36px minmax(0,1fr);gap:5px;min-height:65px}
 .ng-battle-hud .ng-current .ng-pokemon-icon{width:36px;height:34px}
 .ng-battle-hud .ng-current-label{font-size:9px}.ng-battle-hud .ng-pokemon-name{font-size:11px;margin:2px 0}
 .ng-battle-hud .ng-current .ng-health-text{font-size:10px}
 .ng-battle-hud .ng-party{bottom:9px}.ng-battle-hud .ng-party-title{font-size:9px;margin-bottom:4px}
 .ng-battle-hud .ng-party-slots{gap:3px}.ng-battle-hud .ng-party-slot{padding:2px}
 .ng-battle-hud .ng-party-slot .ng-pokemon-icon{height:24px;width:32px}.ng-battle-hud .is-empty{min-height:53px}
}
`;

function icon(pokemon: QuizPokemon): string {
  // The adapter extracts these frames from the game's already loaded atlas.
  if (pokemon.icon?.startsWith("data:image/")) return `<img class="ng-pokemon-icon" src="${escape(pokemon.icon)}" alt=""/>`;
  return `<span class="ng-icon-fallback" aria-hidden="true">${escape(pokemon.name.slice(0, 1))}</span>`;
}

function current(party: QuizPokemon[], side: string): string {
  const pokemon = party.find(p => p.active) || party.find(p => p.hp > 0) || party[0];
  if (!pokemon) return `<section class="ng-current" data-side="${side}"><div></div><div><div class="ng-current-label">${side === "player" ? "Your Pokémon" : "Enemy Pokémon"}</div><div class="ng-pokemon-name">No active Pokémon</div></div></section>`;
  const h = health(pokemon);
  return `<section class="ng-current${h.hp === 0 ? " is-fainted" : ""}" data-side="${side}" data-pokemon-id="${escape(pokemon.id)}" data-hp="${h.hp}" data-max-hp="${h.max}" aria-label="${escape(pokemon.name)}, ${h.hp} of ${h.max} HP">${icon(pokemon)}<div><div class="ng-current-label">${side === "player" ? "Your Pokémon" : "Enemy Pokémon"}</div><div class="ng-pokemon-name">${escape(pokemon.name)}</div><div class="ng-hp" data-health="${h.percent <= 20 ? "critical" : h.percent <= 50 ? "low" : "healthy"}"><i style="width:${h.percent}%"></i></div><div class="ng-health-text">HP ${h.hp} / ${h.max}</div></div></section>`;
}

function roster(party: QuizPokemon[], side: string): string {
  const slots = Array.from({ length: 6 }, (_, i) => {
    const pokemon = party[i];
    if (!pokemon) return `<div class="ng-party-slot is-empty" data-slot="${i}" aria-label="Empty party slot">·</div>`;
    const h = health(pokemon);
    return `<div class="ng-party-slot${h.hp === 0 ? " is-fainted" : ""}${pokemon.active ? " is-current" : ""}" data-slot="${i}" data-pokemon-id="${escape(pokemon.id)}" data-hp="${h.hp}" aria-label="${escape(pokemon.name)}, ${h.hp === 0 ? "fainted" : `${h.hp} of ${h.max} HP`}">${icon(pokemon)}<span class="ng-party-name">${escape(pokemon.name)}</span><span class="ng-party-hp">${h.hp === 0 ? "Fainted" : `${h.hp}/${h.max}`}</span></div>`;
  }).join("");
  return `<section class="ng-party" data-side="${side}"><div class="ng-party-title">${side === "player" ? "Your party" : "Enemy party"} · ${Math.min(party.length, 6)}/6</div><div class="ng-party-slots">${slots}</div></section>`;
}

/** Snapshot while the battle is paused. The whole HUD lives inside the quiz. */
export function createQuizBattleHUD(overlay: HTMLElement, context?: QuizBattleContext): { dispose(): void } {
  if (!context) return { dispose() {} };
  const root = document.createElement("div");
  root.className = "ng-battle-hud";
  root.innerHTML = `<style>${CSS}</style>${current(context.player, "player")}${current(context.enemy, "enemy")}${roster(context.player, "player")}${roster(context.enemy, "enemy")}`;
  overlay.classList.add("ng-has-battle-hud");
  overlay.appendChild(root);
  return { dispose() { root.remove(); overlay.classList.remove("ng-has-battle-hud"); } };
}
