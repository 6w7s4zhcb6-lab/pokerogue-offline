#!/usr/bin/env node
"use strict";
// Applied only by the PathoRogue workflow to its temporary game checkout.
// Vanilla releases do not contain the quiz and must never replace this build.
const fs = require("node:fs");
const path = require("node:path");

function once(source, anchor, replacement, label) {
  if (source.split(anchor).length !== 2) throw Error(`PathoRogue protection: expected one ${label} anchor`);
  return source.replace(anchor, replacement);
}

function protectRenderer(root) {
  const api = path.join(root, "src/system/offline/update-check-api.ts");
  let source = fs.readFileSync(api, "utf8");
  if (!source.includes("PATHOROGUE_NO_VANILLA_RENDERER_UPDATES")) {
    source = once(source, "): Promise<ReleaseInfo[]> {", "): Promise<ReleaseInfo[]> {\n  // PATHOROGUE_NO_VANILLA_RENDERER_UPDATES: upstream EXEs omit this mod.\n  return [];", "renderer update check");
    fs.writeFileSync(api, source);
  }
  const inputs = path.join(root, "src/ui-inputs.ts");
  source = fs.readFileSync(inputs, "utf8");
  if (!source.includes("PATHOROGUE_BLOCK_GAME_INPUT")) {
    const anchor = '      event => {';
    if (source.split(anchor).length !== 3) throw Error("PathoRogue protection: expected both UI input listeners");
    source = source.replaceAll(anchor, anchor + '\n        // PATHOROGUE_BLOCK_GAME_INPUT: keyboard, touch and gamepad share this path.\n        if (document.getElementById("ng-overlay")) return;');
    fs.writeFileSync(inputs, source);
  }
}

function protectDesktop(root) {
  const updater = path.join(root, "updater.cjs");
  let source = fs.readFileSync(updater, "utf8");
  if (source.includes("PATHOROGUE_NO_VANILLA_DESKTOP_UPDATES")) return;
  // Retain version placeholders so normal build-number/app-version injections
  // can still run before or after this patch. Export only safe IPC handlers;
  // the upstream registration function and download/swap functions never run.
  source = once(source, "module.exports = { registerUpdater };", `
// PATHOROGUE_NO_VANILLA_DESKTOP_UPDATES
let pathoUpdaterRegistered = false;
function registerPathoRogueUpdater() {
  if (pathoUpdaterRegistered) return;
  pathoUpdaterRegistered = true;
  ipcMain.handle('updater-check', async () => null);
  const blocked = async () => {
    throw new Error('PathoRogue preserves your quiz mod. Download a PathoRogue build from your fork to update.');
  };
  ipcMain.handle('updater-download', blocked);
  ipcMain.handle('updater-apply-and-relaunch', blocked);
  ipcMain.on('updater-cancel-download', () => {});
}
module.exports = { registerUpdater: registerPathoRogueUpdater };
`, "desktop updater export");
  fs.writeFileSync(updater, source);
}

function protect(root, stage = "all") {
  if (!["all", "renderer", "desktop"].includes(stage)) throw Error("Expected protection stage: all, renderer, or desktop");
  if (stage !== "desktop") protectRenderer(root);
  if (stage !== "renderer") protectDesktop(root);
}

if (require.main === module) {
  protect(path.resolve(process.argv[2] || "pokerogue-src"), process.argv[3] || "all");
  console.log("PathoRogue updater and gameplay-input protections installed.");
}
module.exports = { protect };
