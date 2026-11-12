"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");
const { test, after } = require("node:test");
const { protect } = require("./protect-mod.cjs");
const repo = path.resolve(__dirname, "..");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "pathorogue-protection-"));
const targets = [
  ["new-files/src/system/offline/update-check-api.ts", "src/system/offline/update-check-api.ts"],
  ["pokerogue-src/src/ui-inputs.ts", "src/ui-inputs.ts"],
  ["configs/desktop/electron/updater.cjs", "updater.cjs"],
];
for (const [original, target] of targets) {
  fs.mkdirSync(path.dirname(path.join(fixture, target)), { recursive: true });
  fs.copyFileSync(path.join(repo, original), path.join(fixture, target));
}
protect(fixture);
after(() => fs.rmSync(fixture, { recursive: true, force: true }));

test("renderer update checks never fetch a vanilla release", async () => {
  const source = fs.readFileSync(path.join(fixture, targets[0][1]), "utf8");
  const script = stripTypeScriptTypes(source.replace(/^import[^\n]+\r?\n/gm, ""), { mode: "strip" })
    .replace("export async function checkForUpdates", "async function checkForUpdates") + "\nglobalThis.check = checkForUpdates;";
  let fetches = 0;
  const context = { isScoomDev: false, fetch() { fetches++; throw Error("No upstream network access expected"); } };
  vm.createContext(context);
  vm.runInContext(script, context);
  assert.equal((await context.check("1.0.0.0", 0)).length, 0);
  assert.equal(fetches, 0);
});

test("desktop IPC cannot download or apply a vanilla executable", async () => {
  const handles = new Map();
  const listeners = new Map();
  const dangerousAccess = new Proxy({}, { get() { throw Error("No filesystem, process, or network access expected"); } });
  const context = {
    module: { exports: {} },
    require(name) {
      if (name === "electron") return {
        app: dangerousAccess,
        ipcMain: {
          handle: (channel, fn) => { assert.equal(handles.has(channel), false); handles.set(channel, fn); },
          on: (channel, fn) => { assert.equal(listeners.has(channel), false); listeners.set(channel, fn); },
        },
      };
      return dangerousAccess;
    },
    fetch: () => { throw Error("No network access expected"); },
  };
  // Avoid destructive imports being silently used even if updater internals
  // change. Destructuring execFile only reads this property during module load.
  const originalRequire = context.require;
  context.require = name => name === "child_process" ? { execFile() { throw Error("No process launch expected"); } } : originalRequire(name);
  vm.runInNewContext(fs.readFileSync(path.join(fixture, "updater.cjs"), "utf8"), context);
  context.module.exports.registerUpdater();
  context.module.exports.registerUpdater();
  assert.equal(handles.size, 3);
  assert.equal(listeners.size, 1);
  assert.equal(await handles.get("updater-check")(), null);
  await assert.rejects(handles.get("updater-download")(), /Download a PathoRogue build/);
  await assert.rejects(handles.get("updater-apply-and-relaunch")(), /Download a PathoRogue build/);
  listeners.get("updater-cancel-download")();
});

test("keyboard, touch, and gamepad UI events remain blocked until quiz closes", () => {
  const source = fs.readFileSync(path.join(fixture, "src/ui-inputs.ts"), "utf8");
  const script = stripTypeScriptTypes(source.replace(/^import[^\n]+\r?\n/gm, ""), { mode: "strip" })
    .replace("export class UiInputs", "class UiInputs") + "\nglobalThis.UiInputs = UiInputs;";
  let overlayOpen = true;
  let handled = 0;
  const context = { document: { getElementById: id => id === "ng-overlay" && overlayOpen ? {} : null } };
  vm.createContext(context);
  vm.runInContext(script, context);
  const handlers = {};
  const inputs = Object.create(context.UiInputs.prototype);
  inputs.events = { on: (event, fn) => { handlers[event] = fn; } };
  inputs.detectInputMethod = () => {};
  inputs.getActionsKeyDown = inputs.getActionsKeyUp = () => ({ action: () => { handled++; } });
  inputs.listenInputs();
  for (const controller_type of ["keyboard", "touch", "gamepad"]) {
    handlers.input_down({ button: "action", controller_type });
    handlers.input_up({ button: "action", controller_type });
  }
  assert.equal(handled, 0);
  overlayOpen = false;
  handlers.input_down({ button: "action", controller_type: "gamepad" });
  handlers.input_up({ button: "action", controller_type: "gamepad" });
  assert.equal(handled, 2);
});

test("protection is idempotent and preserves version-injection placeholders", () => {
  const before = targets.map(([, target]) => fs.readFileSync(path.join(fixture, target), "utf8"));
  protect(fixture);
  assert.deepEqual(targets.map(([, target]) => fs.readFileSync(path.join(fixture, target), "utf8")), before);
  assert.match(before[2], /BUILD_NUMBER_PLACEHOLDER/);
  assert.match(before[2], /APP_VERSION_PLACEHOLDER/);
  // Shared desktop template remains vanilla; this patch only affects the
  // temporary PathoRogue checkout selected by its dedicated build workflow.
  assert.doesNotMatch(fs.readFileSync(path.join(repo, targets[2][0]), "utf8"), /PATHOROGUE_NO_VANILLA_DESKTOP_UPDATES/);
});
