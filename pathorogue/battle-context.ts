import { globalScene } from "#app/global-scene";

export type QuizPokemon = {
  id: string | number;
  name: string;
  hp: number;
  maxHp: number;
  icon?: string;
  active: boolean;
};

export type QuizBattleContext = { player: QuizPokemon[]; enemy: QuizPokemon[] };

// Reuse the exact frames already loaded by the offline game. Data URLs remain
// usable in the DOM overlay without guessing asset paths, forms or variants.
const iconCache = new Map<string, string>();
function readPokemon(pokemon: any): QuizPokemon {
  let icon: string | undefined;
  try {
    const key = pokemon.getIconAtlasKey(false, true);
    const frame = pokemon.getIconId(false, true);
    const cacheKey = `${key}:${frame}`;
    icon = iconCache.get(cacheKey);
    if (!icon && globalScene.textures.exists(key) && globalScene.textures.get(key).has(frame)) {
      const encoded = globalScene.textures.getBase64(key, frame);
      if (encoded.startsWith("data:image/")) {
        icon = encoded;
        iconCache.set(cacheKey, encoded);
      }
    }
  } catch (error) {
    console.debug("Quiz icon is not available yet:", error);
  }
  const maxHp = Math.max(1, Number(pokemon.getMaxHp?.() ?? pokemon.stats?.[0]) || 1);
  return {
    id: pokemon.id,
    name: String(pokemon.getNameToRender?.() || pokemon.name || pokemon.species?.name || "Pokémon"),
    hp: Math.max(0, Math.min(maxHp, Number(pokemon.hp) || 0)),
    maxHp,
    icon,
    active: !!pokemon.isActive?.(true),
  };
}

export function readQuizBattleContext(): QuizBattleContext {
  try {
    if (!globalScene) return { player: [], enemy: [] };
    return {
      player: globalScene.getPlayerParty().filter(Boolean).slice(0, 6).map(readPokemon),
      enemy: globalScene.getEnemyParty().filter(Boolean).slice(0, 6).map(readPokemon),
    };
  } catch (error) {
    // A display snapshot must never strand a paused battle or capture phase.
    console.warn("Quiz battle display snapshot unavailable:", error);
    return { player: [], enemy: [] };
  }
}
