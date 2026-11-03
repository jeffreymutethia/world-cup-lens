import assert from "node:assert/strict";

// Explicit public destination only. No service credentials or auth headers are used.
const base = new URL(process.env.DEMO_URL ?? "https://world-cup-lens-one.vercel.app");
assert.equal(base.protocol, "https:");
assert.ok(!base.username && !base.password && !base.search && !base.hash && base.pathname === "/");
const watchdog = setTimeout(() => { console.error("Public demo checks exceeded 120 seconds"); process.exit(1); }, 120_000);
async function page(path, method = "GET") {
  const response = await fetch(new URL(path, base), { method, redirect: "error", signal: AbortSignal.timeout(15_000) });
  return { status: response.status, html: await response.text() };
}
try {
  let result = await page("/");
  assert.equal(result.status, 200);
  assert.ok(result.html.includes("Copper Vale") && result.html.includes("Lantern Ridge") && result.html.includes("Featured illustrative matchup"));
  assert.ok(result.html.includes("newly authored fiction") && !result.html.includes('value="archive"'));
  const detailHref = result.html.match(/href="(\/matches\/[^\"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  assert.ok(detailHref?.includes("mode=illustrative&date=2026-06-11"));
  console.log("PASS public homepage, June 11 fiction and featured detail link");

  result = await page(detailHref);
  assert.equal(result.status, 200);
  assert.ok(result.html.includes("patient passing plan") && result.html.includes("Explore cached questions") && result.html.includes("wcl-synthetic-v1") && result.html.includes("No real result"));
  console.log("PASS featured detail, stored sample Lens and Q&A content");

  for (const [path, expected] of [
    ["/?mode=illustrative&date=2026-06-12", "second-day example"],
    ["/about", "Public demo"],
    ["/?date=2026-02-30", "Invalid replay selection"],
    ["/?mode=illustrative&date=2026-06-13", "No illustrative examples for this date"],
  ]) {
    result = await page(path);
    assert.equal(result.status, 200);
    assert.ok(result.html.includes(expected));
  }
  console.log("PASS June 12, about, invalid-date and empty states");

  // Verify demo policy before any supported authoring-method denial checks.
  for (const path of ["/?mode=archive", "/matches/provider-id?mode=archive&date=2026-07-11"]) {
    result = await page(path);
    assert.equal(result.status, 200);
    assert.ok(result.html.includes("Archive disabled in public demo") && !result.html.includes("A patient passing plan"));
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
