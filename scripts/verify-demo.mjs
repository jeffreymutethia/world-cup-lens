import assert from "node:assert/strict";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const probe = createServer();
await new Promise(resolve => probe.listen(0, "127.0.0.1", resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const production = process.env.DEMO_TEST_PRODUCTION === "1";
const environment = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", SUPABASE_SECRET_KEY: "", OPENAI_API_KEY: "", API_FOOTBALL_KEY: "", ADMIN_GENERATION_SECRET: "local-dummy-admin", CRON_SECRET: "local-dummy-cron" };
if (process.env.DEMO_TEST_DEPLOYMENT_VALUE) environment.WCL_DEPLOYMENT_MODE = process.env.DEMO_TEST_DEPLOYMENT_VALUE;
else delete environment.WCL_DEPLOYMENT_MODE; // Exercise the actual unset configuration.
const app = spawn(process.execPath, ["--require", resolve("scripts/forbid-service-fetch.cjs"), "node_modules/next/dist/bin/next", production ? "start" : "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: environment,
  detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"],
});
function signal(signal) {
  try { if (process.platform === "win32") app.kill(signal); else process.kill(-app.pid, signal); }
  catch (error) { if (error.code !== "ESRCH") throw error; }
}
let ready = false;
let serviceFetches = 0;
let preloadInstances = 0;
app.stdout.on("data", data => { if (data.toString().includes("Ready")) ready = true; });
app.stderr.on("data", data => { const text = data.toString(); if (text.includes("WCL_UNEXPECTED_SERVICE_FETCH")) serviceFetches++; preloadInstances += text.split("WCL_SERVICE_FETCH_TRIPWIRE_ACTIVE").length - 1; });
const exited = new Promise(resolve => app.once("exit", resolve));
const watchdog = setTimeout(() => { signal("SIGKILL"); console.error("Demo checks exceeded 120 seconds"); process.exit(1); }, 120_000);
watchdog.unref();
const base = `http://127.0.0.1:${port}`;
async function page(path, options) {
  const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(15_000) });
  return { response, html: await response.text() };
}
try {
  for (let i = 0; !ready && i < 100; i++) { assert.equal(app.exitCode, null); await delay(200); }
  assert.ok(ready);
  let { html, response } = await page("/");
  assert.equal(response.status, 200);
  assert.ok(html.includes("Copper Vale") && html.includes("Featured illustrative matchup"));
  assert.ok(!html.includes('<select name="mode"') && !html.includes('value="archive"'));
  assert.ok(!html.includes("July 11 archive"));
  assert.ok(html.includes("newly authored fiction") && html.includes("mode=illustrative&amp;date=2026-06-11"));
  console.log("PASS credential-free demo landing and publication labels; no archive selector");
  ({ html } = await page("/matches/copper-tidal?mode=illustrative&date=2026-06-11"));
  assert.ok(html.includes("patient passing plan") && html.includes("Explore cached questions"));
  assert.ok(html.includes("wcl-synthetic-v1") && html.includes("No real result"));
  assert.ok(html.includes("Question the assumptions") && html.includes("Back to selected matches"));
  console.log("PASS sample Lens, Q&A, version and mode/date navigation");
  ({ html } = await page("/?mode=illustrative&date=2026-06-12"));
  assert.ok(html.includes("second-day example") && !html.includes("A patient passing plan"));
  ({ html } = await page("/?mode=illustrative&date=2026-06-13"));
  assert.ok(html.includes("No illustrative examples for this date"));
  ({ html } = await page("/?date=2026-02-30"));
  assert.ok(html.includes("Invalid replay selection"));
  ({ html } = await page("/matches/missing?mode=illustrative&date=2026-06-11"));
  assert.ok(html.includes("Match not found in this selection"));
  console.log("PASS date exploration, invalid/empty selection and missing sample handling");
  for (const path of ["/?mode=archive", "/matches/provider-id?mode=archive&date=2026-07-11"]) {
    ({ html } = await page(path));
    assert.ok(html.includes("Archive disabled in public demo") && !html.includes("A patient passing plan"));
  }
  console.log("PASS explicit archive access rejected without silent substitution");
  const admin = ["documents/embed", "documents/sync-provider", "fixtures/sync", "lenses/generate-today", "matches/mock/generate-lens", "pipeline/today"];
  for (const path of admin) {
    const result = await page(`/api/admin/${path}`, { method: "POST", headers: { "x-admin-secret": "local-dummy-admin" } });
    assert.equal(result.response.status, 404);
    assert.ok(result.html.includes("Authoring is disabled"));
  }
  for (const method of ["GET", "HEAD"]) {
    const result = await page("/api/cron/today", { method, headers: { authorization: "Bearer local-dummy-cron" } });
    assert.equal(result.response.status, 404);
  }
  console.log("PASS all authoring/admin/cron handlers disabled even with matching dummy secrets");
  ({ html } = await page("/about"));
  assert.ok(html.includes("Public demo") && html.includes("Local TypeScript records"));
  assert.ok(preloadInstances >= (production ? 1 : 2), "Tripwire must be active in the app process");
  assert.equal(serviceFetches, 0, "Demo must make no service fetches");
  console.log("PASS architecture walkthrough and zero service fetches during browsing/blocked requests");
} finally {
  clearTimeout(watchdog); signal("SIGTERM");
  const force = setTimeout(() => signal("SIGKILL"), 5_000);
  await Promise.race([exited, delay(6_000)]);
  signal("SIGKILL"); clearTimeout(force);
}
