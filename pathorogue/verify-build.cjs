#!/usr/bin/env node
"use strict";

// Run against the files and executable that will actually be uploaded. This
// deliberately uses Chromium's public debugging protocol, not a quiz bypass.
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const crypto = require("node:crypto");
const { spawn, execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function hashFile(file) {
  const hash = crypto.createHash("sha256");
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

function verifyDist(root) {
  assert(fs.existsSync(path.join(root, "index.html")), "Built index.html missing");
  for (const file of ["fonts/pokemon-emerald-pro.ttf", "locales/en/battle.json"]) {
    assert(fs.statSync(path.join(root, file)).size > 0, `Offline asset missing: ${file}`);
  }
  for (const folder of ["images/pokemon", "images/arenas", "audio/cry", "audio/bgm"]) {
    assert(fs.readdirSync(path.join(root, folder)).length > 0, `Offline asset folder empty: ${folder}`);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "asset-manifest.json"), "utf8"));
  for (const file of [manifest.js, ...(manifest.css || []), ...(manifest.preloads || [])]) {
    assert(fs.existsSync(path.join(root, file)), `Manifest points to missing asset: ${file}`);
  }
  const scripts = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith(".js")) scripts.push(fs.readFileSync(file, "utf8"));
    }
  }
  walk(root);
  const built = scripts.join("\n");
  for (const text of ["ng-hud", "ng-overlay", "ng-battle-hud", "ng-option-rationales", "ng-star-twinkle", "MASTERY TRACKER", "Rationale:", "SCHEDULED MASTERY REVIEW", "pokerogue.pathophysiology-gate.v3"]) {
    assert(built.includes(text), `PathoRogue runtime missing from compiled output: ${text}`);
  }
  for(const text of ["Which healing stage is occurring?", "solid pancreatic-head lesion", "Identify the treatment", "What it is:", "Missing fresh review cases", "EVERY 30 ANSWERS"]) {
    assert(built.includes(text), `Authored clinical question update missing from compiled output: ${text}`);
  }
  return { entry: manifest.js, javascriptChunks: scripts.length, pathophysiologyRuntimePresent: true };
}

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function connectCDP(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0;
  const pending = new Map();
  const events = [];
  socket.onmessage = message => {
    const value = JSON.parse(message.data);
    if (!value.id) { events.push(value); return; }
    const request = pending.get(value.id);
    if (!request) return;
    pending.delete(value.id);
    clearTimeout(request.timer);
    if (value.error) request.reject(Error(JSON.stringify(value.error)));
    else request.resolve(value.result);
  };
  return {
    events,
    close: () => socket.close(),
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++serial;
        const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 15000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function launchExecutable(exe, options = {}) {
  assert(fs.existsSync(exe), `Executable missing: ${exe}`);
  const userData = await fsp.mkdtemp(path.join(os.tmpdir(), "pathorogue-smoke-"));
  const port = await freePort();
  // Local diagnosis only. CI intentionally uses Chromium's normal sandbox.
  const testNoSandbox = process.env.PATHOROGUE_TEST_NO_SANDBOX === "1";
  const launchArgs = [
    ...(options.appPath ? [path.resolve(options.appPath)] : []),
    `--remote-debugging-port=${port}`,
    "--remote-debugging-address=127.0.0.1",
    `--user-data-dir=${userData}`,
    "--host-resolver-rules=MAP * ~NOTFOUND",
    "--no-proxy-server",
    "--disable-gpu-sandbox",
    ...(testNoSandbox ? ["--no-sandbox"] : []),
  ];
  const child = spawn(exe, launchArgs, { windowsHide: true, env: { ...process.env, ELECTRON_RUN_AS_NODE: undefined }, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", data => { output += data; });
  child.stderr.on("data", data => { output += data; });
  let launchError;
  let exitedAt = 0;
  let exitCode = null;
  let exitSignal = null;
  child.on("error", error => { launchError = error; });
  child.on("exit", (code, signal) => { exitedAt = Date.now(); exitCode = code; exitSignal = signal; });
  const cleanup = () => {
    try { execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {}
  };
  try {
    const timeoutMs = options.timeoutMs || 180000;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (launchError) throw launchError;
      try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        const target = targets.find(t => t.type === "page" && t.webSocketDebuggerUrl);
        if (target) {
          const cdp = await connectCDP(target.webSocketDebuggerUrl);
          await cdp.send("Runtime.enable");
          await cdp.send("Network.enable");
          await cdp.send("Network.setBlockedURLs", { urls: ["http://*", "https://*"] });
          return { cdp, child, userData, cleanup, testNoSandbox, appPath: options.appPath || null, output: () => output };
        }
      } catch (error) { if (Date.now() >= deadline) throw error; }
      if (exitedAt && (exitCode !== 0 || Date.now() - exitedAt > 2000)) {
        const windowsCode = exitCode === null ? "" : ` (0x${(exitCode >>> 0).toString(16)})`;
        throw Error(`Executable exited before opening a renderer: code=${exitCode}${windowsCode}, signal=${exitSignal || "none"}.\n${output}`);
      }
      await delay(500);
    }
    throw Error(`Executable did not expose a renderer within ${timeoutMs / 1000} seconds.\n${output}`);
  } catch (error) {
    error.launchDiagnostics = { exitCode, exitSignal, testNoSandbox, appPath: options.appPath || null, output };
    cleanup(); throw error;
  }
}

async function verifyExecutable(exe, reportDir, options = {}) {
  await fsp.mkdir(reportDir, { recursive: true });
  let session;
  try {
    session = await launchExecutable(exe, options);
    const deadline = Date.now() + 120000;
    let hud;
    while (Date.now() < deadline) {
      hud = await evaluate(session.cdp, `document.querySelector('#ng-hud')?.textContent || ''`);
      if (hud.includes("Patho Quiz")) break;
      await delay(500);
    }
    assert(hud?.includes("Patho Quiz"), "Downloaded EXE never initialized Pathophysiology HUD");
    assert.equal(await evaluate(session.cdp, "document.querySelectorAll('.ng-effects').length"), 0, "Quiz graphics appeared outside a quiz overlay");
    assert.equal(await evaluate(session.cdp, "document.querySelectorAll('.ng-battle-hud').length"), 0, "Quiz battle HUD appeared outside a quiz overlay");
    const url = await evaluate(session.cdp, "location.href");
    assert(url.startsWith("file://"), `Game must load packaged files offline: ${url}`);
    await evaluate(session.cdp, "document.querySelector('#ng-toggle').click()");
    const tracker = await evaluate(session.cdp, "document.querySelector('#ng-hud').textContent");
    assert(tracker.includes("MASTERY TRACKER"), "Tracker does not open");
    assert(tracker.includes("687"), "687-subsection tracker is missing");
    assert(tracker.includes("96"), "96-concept tracker is missing");
    assert(tracker.includes("1/10"), "10-tier difficulty tracker is missing");
    assert(tracker.includes("Every 30 answers"), "Mastered-concept review interval is not 30 answers");
    const shot = await session.cdp.send("Page.captureScreenshot", { format: "png" });
    await fsp.writeFile(path.join(reportDir, "packaged-exe-tracker.png"), Buffer.from(shot.data, "base64"));
    const report = {
      verifiedAt: new Date().toISOString(),
      executable: path.basename(exe),
      testNoSandbox: session.testNoSandbox,
      unbundledAppPath: session.appPath,
      sha256: await hashFile(exe),
      offline: { externalDNSBlocked: true, rendererHTTPBlocked: true, loadedURL: url },
      checks: { startupHUD: true, trackerOpen: true, concepts96: true, subsections687: true, difficulty10: true, masteryReviewThirty: true, effectsAbsentOutsideQuiz: true },
      scope: session.appPath
        ? "Unbundled Electron diagnostic launch; this does not verify the downloadable portable EXE."
        : "Packaged portable EXE startup and tracker smoke test; battle enforcement requires separate battle verification.",
      tracker,
      errors: session.cdp.events.filter(event => event.method === "Runtime.exceptionThrown"),
    };
    await fsp.writeFile(path.join(reportDir, "packaged-exe-report.json"), JSON.stringify(report, null, 2));
    await fsp.writeFile(path.join(reportDir, "packaged-exe-console.log"), session.output());
    assert.equal(report.errors.length, 0, "Runtime threw errors; inspect packaged-exe-report.json");
    console.log(JSON.stringify({ ...report, tracker: `${tracker.length} characters saved in report` }, null, 2));
    return report;
  } catch (error) {
    await fsp.writeFile(path.join(reportDir, "packaged-exe-failure.json"), JSON.stringify({
      verifiedAt: new Date().toISOString(), executable: path.basename(exe),
      error: String(error.stack || error),
      launchDiagnostics: error.launchDiagnostics || null,
      exceptions: session?.cdp.events.filter(event => event.method === "Runtime.exceptionThrown") || [],
    }, null, 2));
    await fsp.writeFile(path.join(reportDir, "packaged-exe-console.log"), session?.output() || error.launchDiagnostics?.output || "");
    try {
      const shot = await session.cdp.send("Page.captureScreenshot", { format: "png" });
      await fsp.writeFile(path.join(reportDir, "packaged-exe-failure.png"), Buffer.from(shot.data, "base64"));
    } catch {}
    throw error;
  } finally { session?.cdp.close(); session?.cleanup(); }
}

async function main() {
  const args = process.argv.slice(2);
  const at = name => args.includes(name) ? args[args.indexOf(name) + 1] : null;
  if (at("--dist")) console.log(JSON.stringify(verifyDist(path.resolve(at("--dist"))), null, 2));
  if (at("--exe")) await verifyExecutable(path.resolve(at("--exe")), path.resolve(at("--report-dir") || "verification"), { appPath: at("--app") });
  assert(at("--dist") || at("--exe"), "Usage: node verify-build.cjs --dist DIST | --exe EXE --report-dir DIR");
}

module.exports = { verifyDist, verifyExecutable, launchExecutable, evaluate, connectCDP, hashFile };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
