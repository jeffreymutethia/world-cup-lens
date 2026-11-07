import { checkCuratedPages, assertHistoricalRedirect } from "./check-curated-pages.mjs";
import assert from "node:assert/strict";

// Explicit public destination only. No service credentials or auth headers are used.
const base = new URL(process.env.DEMO_URL ?? "https://world-cup-lens-one.vercel.app");
assert.equal(base.protocol, "https:");
assert.ok(!base.username && !base.password && !base.search && !base.hash && base.pathname === "/");
const watchdog = setTimeout(() => { console.error("Public demo checks exceeded 120 seconds"); process.exit(1); }, 120_000);
async function page(path, options = "GET") {
  const settings=typeof options === "string" ? { method: options } : options;
  const response = await fetch(new URL(path, base), { redirect: "manual", ...settings, signal: AbortSignal.timeout(15_000) });
  return { response, status: response.status, html: await response.text() };
}
try {
  await checkCuratedPages(page);
  let result;
  for (const [path, expected] of [["/about", "How it works"],["/?date=2026-02-30", "Invalid replay selection"],["/?date=2026-07-13", "No matches for this selection"]]) {
    result = await page(path); assert.equal(result.status,200); assert.ok(result.html.includes(expected));
  }
  for (const path of ["/?mode=illustrative", "/matches/copper-tidal?mode=illustrative&date=2026-06-11"]) {
    const response = await fetch(new URL(path,base), {redirect:"manual",signal:AbortSignal.timeout(15000)});
    assertHistoricalRedirect({response,status:response.status,html:await response.text()});
  }
  console.log("PASS about, invalid/empty states and retired illustrative redirects");
  // Verify demo policy before any supported authoring-method denial checks.
  for (const path of ["/?mode=archive", "/matches/provider-id?mode=archive&date=2026-07-11"]) {
    result = await page(path);
    assert.equal(result.status, 200);
    assert.ok(result.html.includes("Archive disabled in public demo") && !result.html.includes("A Patient passing against counterplay"));
  }
  console.log("PASS explicit archive access denied without sample substitution");
  for (const path of ["documents/embed", "documents/sync-provider", "fixtures/sync", "lenses/generate-today", "matches/disabled-check/generate-lens", "pipeline/today"]) {
    result = await page(`/api/admin/${path}`, "POST");
    assert.equal(result.status, 404);
    assert.ok(result.html.includes("Authoring is disabled in public demo mode."));
  }
  for (const method of ["GET", "HEAD"]) {
    result = await page("/api/cron/today", method);
    assert.equal(result.status, 404);
    if (method === "GET") assert.ok(result.html.includes("Authoring is disabled in public demo mode."));
  }
  console.log("PASS all six admin POST and cron GET/HEAD denied without authentication or work");
  for (const path of ["/icon.svg", "/third-party-notices.txt"]) assert.equal((await page(path)).status, 200);
  console.log("PASS original icon and software notices");
  console.log("Scope: public HTTP behavior only; server egress and browser interaction require separate evidence.");
} finally {
  clearTimeout(watchdog);
}
