"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

function render(context) {
  const nodes = [], classes = new Set();
  const overlay = { appendChild: node => nodes.push(node), classList: { add: x => classes.add(x), remove: x => classes.delete(x) } };
  const environment = vm.createContext({ document: { createElement: () => ({ remove() { this.removed = true; } }) } });
  const source = stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, "quiz-battle-hud.ts"), "utf8")).replace("export function", "function");
  vm.runInContext(`${source}\nthis.create = createQuizBattleHUD;`, environment);
  return { result: environment.create(overlay, context), nodes, classes };
}

test("quiz HUD reports active health, all six slots, and fainted party members on both sides", () => {
  const pokemon = (id, hp, active = false) => ({ id, name: `Pokemon ${id}`, hp, maxHp: 42, active, icon: "data:image/png;base64,AA==" });
  const { nodes, classes, result } = render({ player: [pokemon(1, 0), pokemon(2, 21, true)], enemy: [pokemon(3, 9, true), pokemon(4, 0)] });
  const html = nodes[0].innerHTML.split("</style>")[1];
  assert.match(html, /class="ng-current" data-side="player" data-pokemon-id="2" data-hp="21" data-max-hp="42"/);
  assert.match(html, /class="ng-current" data-side="enemy" data-pokemon-id="3" data-hp="9" data-max-hp="42"/);
  assert.equal((html.match(/class="ng-party-slot[" ]/g) || []).length, 12);
  assert.equal((html.match(/class="ng-party-slot is-fainted/g) || []).length, 2);
  assert.equal((html.match(/class="ng-party-slot is-empty/g) || []).length, 8);
  assert(classes.has("ng-has-battle-hud"));
  result.dispose();
  assert.equal(nodes[0].removed, true);
  assert.equal(classes.size, 0);
});

test("empty and unavailable party context does not invent Pokémon or insert unsafe names", () => {
  assert.equal(render().nodes.length, 0);
  const { nodes } = render({ player: [{ id: 1, name: '<script>"bad"</script>', hp: -5, maxHp: 10, active: true, icon: "javascript:alert(1)" }], enemy: [] });
  const html = nodes[0].innerHTML.split("</style>")[1];
  assert(!html.includes("<script>"));
  assert(!html.includes("javascript:"));
  assert(html.includes("No active Pokémon"));
  assert(html.includes('data-hp="0"'));
  assert(html.includes("Fainted"));
});
