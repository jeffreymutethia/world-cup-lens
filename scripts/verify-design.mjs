import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Optional real-browser QA. Uses an existing Chromium binary, no npm/browser download.
// Never attaches to a user's profile. Run only against the authorized demo or localhost.
const base = new URL(process.env.DESIGN_URL ?? "http://127.0.0.1:3107/");
assert.ok(["127.0.0.1", "localhost", "world-cup-lens-one.vercel.app"].includes(base.hostname));
assert.ok(!base.username && !base.password && !base.search && !base.hash && base.pathname === "/");
assert.ok(base.protocol === "https:" || (base.protocol === "http:" && ["127.0.0.1", "localhost"].includes(base.hostname)));
const binary = process.env.CHROMIUM_PATH ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
assert.ok(existsSync(binary), "An existing Chromium binary is required; no automatic download");
const output = resolve(process.env.DESIGN_CAPTURE_DIR ?? "docs/screenshots/redesign-local");
mkdirSync(output, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), "wcl-design-browser-"));
const browserEnvironment = Object.fromEntries(["PATH", "HOME", "TMPDIR", "LANG", "SYSTEMROOT", "LOCALAPPDATA"].filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]));
const browser = spawn(binary, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-component-update", "--disable-sync", "--disable-extensions", "--disable-default-apps", "--disable-features=MediaRouter,OptimizationHints,Translate", "--metrics-recording-only", "--mute-audio", `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE ${base.hostname}, EXCLUDE localhost`, "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", detached: process.platform !== "win32", env: browserEnvironment });
let launchError;
const exited = new Promise(resolve => { browser.once("exit", resolve); browser.once("error", error => { launchError = error; resolve(); }); });
function signalBrowser(signal) {
  if (!browser.pid) return;
  try { if (process.platform === "win32") browser.kill(signal); else process.kill(-browser.pid, signal); }
  catch (error) { if (error.code !== "ESRCH") throw error; }
}
function removeProfile() { rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 }); }

let socket;
let sequence = 0;
let sessionId;
const pending = new Map();
const consoleErrors = [];
const externalRequests = [];
const responseErrors = [];
const report = { base: base.origin, capturedAt: new Date().toISOString(), browser: null, widths: [], checks: [], consoleErrorCount: 0, externalRequestCount: 0 };
const watchdog = setTimeout(() => { signalBrowser("SIGKILL"); try { removeProfile(); } finally { console.error("Browser QA exceeded 180 seconds"); process.exit(1); } }, 180_000);
watchdog.unref();
function command(method, params = {}, inPage = true) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15_000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(inPage && sessionId ? { sessionId } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error("Browser evaluation failed");
  return result.result.value;
}
async function waitFor(expression) {
  for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(100); }
  throw new Error("Browser did not reach the expected page state");
}
async function navigate(path, selector = "h1") {
  await command("Page.navigate", { url: new URL(path, base).href });
  await waitFor(`document.readyState === 'complete' && Boolean(document.querySelector(${JSON.stringify(selector)})) && !document.querySelector('.state-panel h2')?.textContent.includes('Loading')`);
  await evaluate("document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
}
async function key(key, code = key) {
  const keyCode = key === "Tab" ? 9 : key === "Enter" ? 13 : key === "Escape" ? 27 : 0;
  await command("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: keyCode, ...(key === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}) });
  await command("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
}
async function click(selector) {
  const rect = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.scrollIntoView({block:'center'}); const r = element.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await command("Input.dispatchMouseEvent", { type: "mousePressed", ...rect, button: "left", clickCount: 1 });
  await command("Input.dispatchMouseEvent", { type: "mouseReleased", ...rect, button: "left", clickCount: 1 });
}
async function screenshot(name) {
  await evaluate("scrollTo(0,0); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
  const metrics = await command("Page.getLayoutMetrics");
  const { width, height } = metrics.cssContentSize;
  const capture = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
  writeFileSync(join(output, `${name}.png`), Buffer.from(capture.data, "base64"));
}
async function inspect(width) {
  const value = await evaluate(`({width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,h1s:document.querySelectorAll('h1').length,score:getComputedStyle(document.querySelector('.scoreboard-result strong')).fontSize,main:document.querySelectorAll('main').length,dates:document.querySelector('.matchday-tabs') ? {client:document.querySelector('.matchday-tabs').clientWidth,scroll:document.querySelector('.matchday-tabs').scrollWidth}:null})`);
  assert.equal(value.width, width);
  assert.ok(value.scrollWidth <= value.clientWidth + 1, `Document overflow at ${width}: ${JSON.stringify(value)}`);
  assert.equal(value.h1s, 1); assert.equal(value.main, 1);
  assert.equal(await evaluate("[...document.querySelectorAll('.lime-button,.menu-toggle,.matchday-tabs a,.source-button,.source-details summary,.primary-navigation a')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0).every(e => e.getBoundingClientRect().height >= 44)"), true, "Primary controls need 44px target height");
  return value;
}
try {
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portFile) && i < 200; i++) { if (launchError) throw launchError; assert.equal(browser.exitCode, null, "Browser exited before readiness"); await delay(100); }
  assert.ok(existsSync(portFile), "Browser readiness timeout");
  const [port, path] = readFileSync(portFile, "utf8").trim().split("\n");
  socket = new WebSocket(`ws://127.0.0.1:${port}${path}`);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  socket.addEventListener("message", event => {
    const data = JSON.parse(event.data);
    if (data.id) { const item = pending.get(data.id); if (!item) return; clearTimeout(item.timer); pending.delete(data.id); if (data.error) item.reject(new Error(data.error.message)); else item.resolve(data.result); return; }
    if (data.method === "Runtime.exceptionThrown" || (data.method === "Runtime.consoleAPICalled" && data.params.type === "error") || (data.method === "Log.entryAdded" && data.params.entry.level === "error")) consoleErrors.push(data.method);
    if (data.method === "Network.responseReceived" && data.params.response.status >= 400) responseErrors.push(data.params.response.status);
    if (data.method === "Fetch.requestPaused") {
      const url = new URL(data.params.request.url);
      const allowed = url.origin === base.origin;
      if (!allowed) externalRequests.push(url.origin);
      void command(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", allowed ? { requestId: data.params.requestId } : { requestId: data.params.requestId, errorReason: "BlockedByClient" }).catch(() => {});
    }
  });
  report.browser = (await command("Browser.getVersion", {}, false)).product;
  const target = await command("Target.createTarget", { url: "about:blank" }, false);
  sessionId = (await command("Target.attachToTarget", { targetId: target.targetId, flatten: true }, false)).sessionId;
  for (const method of ["Page.enable", "Runtime.enable", "Log.enable", "Network.enable"]) await command(method);
  await command("Fetch.enable", { patterns: [{ urlPattern: "http://*" }, { urlPattern: "https://*" }] });
  for (const width of [320, 390, 768, 1280, 1440]) {
    await command("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 650 });
    await command("Emulation.setTouchEmulationEnabled", { enabled: width < 650, maxTouchPoints: 1 });
    await navigate("/", ".scoreboard-hero");
    const home = await inspect(width);
    assert.equal(await evaluate("document.querySelectorAll('[data-match-id=\"norway-england-2026-07-11\"]').length"), 1);
    await screenshot(`home-${width}`);
    if (width < 650) {
      await click(".menu-toggle"); assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), "true");
      if (width === 390) await screenshot("home-390-menu-open");
      await key("Escape"); assert.equal(await evaluate("document.activeElement === document.querySelector('.menu-toggle')"), true);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.primary-navigation')).display"), "none");
    }
    await click(".lime-button"); await waitFor("Boolean(document.querySelector('.recap-panel'))");
    const detail = await inspect(width);
    assert.equal(await evaluate("new URL(location.href).searchParams.get('mode')"), "curated");
    await screenshot(`detail-${width}`);
    await click(".source-details summary"); assert.equal(await evaluate("document.querySelector('.source-details').open"), true);
    if (width === 390) await screenshot("detail-390-source-open");
    report.widths.push({ width, home, detail });
    console.log(`PASS real browser ${width}px home/detail, overflow, menu, source disclosure`);
  }
  await command("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await navigate("/", ".matchday-tabs");
  await evaluate("document.querySelector('.skip-link').focus()"); await key("Enter");
  assert.equal(await evaluate("document.activeElement.id"), "main-content");
  await evaluate("document.querySelector('.matchday-tabs a').focus()");
  for (let i = 0; i < 3; i++) await key("Tab");
  assert.equal(await evaluate("new URL(document.activeElement.href).searchParams.get('date')"), "2026-07-19");
  assert.equal(await evaluate("getComputedStyle(document.activeElement).outlineStyle"), "solid");
  await screenshot("home-390-keyboard-focus");
  await key("Enter"); await waitFor("document.querySelector('.scoreboard-hero')?.textContent.includes('Spain')");
  assert.equal(await evaluate("document.querySelectorAll('[data-match-id]').length"), 1);
  assert.equal(await evaluate("document.querySelector('.matchday-tabs a[aria-current]').textContent.includes('19 Jul')"), true);
  await click(".lime-button"); await waitFor("Boolean(document.querySelector('.recap-panel'))");
  assert.equal(await evaluate("Boolean(document.querySelector('.related-matches'))"), false);
  await click(".match-breadcrumb a"); await waitFor("Boolean(document.querySelector('.matchday-tabs'))");
  assert.equal(await evaluate("new URL(location.href).searchParams.get('date')"), "2026-07-19");
  report.checks.push("keyboard skip/date/focus/Enter; selected date/back; single-match isolation");
  await navigate("/?mode=illustrative&date=2026-06-11", ".collection-heading");
  await click('a[href="/matches/copper-tidal?mode=illustrative&date=2026-06-11"]');
  await waitFor("Boolean(document.querySelector('button[aria-pressed]'))");
  const before = await evaluate("document.querySelector('[aria-live]').textContent");
  await evaluate("document.querySelectorAll('button[aria-pressed]')[1].focus()"); await key("Enter");
  await waitFor(`document.querySelector('[aria-live]').textContent !== ${JSON.stringify(before)}`);
  assert.equal(await evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), true);
  await screenshot("lab-390-questions");
  report.checks.push("fictional lab stored Q&A keyboard switching");
  await command("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: true });
  for (const [id, date] of [["mexico-south-africa-2026-06-11", "2026-06-11"], ["usa-paraguay-2026-06-12", "2026-06-12"], ["argentina-switzerland-2026-07-11", "2026-07-11"], ["spain-argentina-2026-07-19", "2026-07-19"]]) {
    await navigate(`/matches/${id}?mode=curated&date=${date}`, ".recap-panel");
    await inspect(320);
    if (id.startsWith("argentina")) await screenshot("detail-argentina-320");
    assert.equal(await evaluate("[...document.querySelectorAll('.team-name')].every(element => element.textContent.includes(' ') || element.getBoundingClientRect().height <= parseFloat(getComputedStyle(element).lineHeight) * 1.2)"), true, `Single-word team name wraps at 320: ${id}`);
  }
  report.checks.push("all five match heroes fit at 320px without splitting single-word team names");
  await navigate("/about", ".about-intro"); assert.equal(await evaluate("document.querySelector('h1').textContent"), "How it works");
  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.equal(await evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"), true);
  assert.ok(parseFloat(await evaluate("getComputedStyle(document.querySelector('a')).transitionDuration")) <= .00001);
  report.checks.push("about navigation and reduced-motion styles");
  report.consoleErrorCount = consoleErrors.length; report.externalRequestCount = externalRequests.length;
  assert.equal(consoleErrors.length, 0, "Browser console exceptions/errors found");
  assert.equal(externalRequests.length, 0, "A page attempted an external request; request was blocked");
  assert.equal(responseErrors.length, 0, "Unexpected HTTP errors in normal browser navigation");
  writeFileSync(join(output, "qa-report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("PASS keyboard, date/detail/back, fictional Q&A, reduced motion; zero console errors/external requests");
} finally {
  clearTimeout(watchdog); socket?.close(); signalBrowser("SIGTERM");
  await Promise.race([exited, delay(3_000)]); signalBrowser("SIGKILL");
  await Promise.race([exited, delay(2_000)]); removeProfile();
}
