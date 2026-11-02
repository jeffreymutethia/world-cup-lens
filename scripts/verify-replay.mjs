import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Optional HTTP integration check. All database reads go to this local mock,
// with dummy credentials; it never queries a remote Supabase project.
const team = { id: "mock-home", name: "Mock Home", code: "MHM", flag: "", group_name: "Quarter-finals", summary: "Test fixture", strength_attack: 50, strength_midfield: 50, strength_defense: 50, strength_transitions: 50 };
const match = {
  id: "mock-archive-match", home_team_id: "mock-home", away_team_id: "mock-away", venue_id: "mock-venue",
  group_name: "Quarter-finals", kickoff_at: "2026-07-11T18:00:00Z", signal_tags: [],
  home_score: 1, away_score: 0, status_short: "1H", status_long: "First Half", elapsed: 30,
  home_team: team, away_team: { ...team, id: "mock-away", name: "Mock Away" },
  venue: { id: "mock-venue", name: "Mock Stadium", city: "Mock City", country: "Mock", summary: "Test venue" },
};
const lens = { headline: "Mock cached retrospective analysis", slightEdge: null, confidence: "Low", volatility: "Medium", expectedGame: "Mock cached expectation, not a verified forecast.", whyItMatters: "Mock significance.", likelyGameScript: "Mock script.", teamEdges: [], whatToWatch: [], casualFanGuide: "Mock guide.", uncertainty: [], sources: [] };
let databaseReads = 0;
let lensResponse = "valid";
let qaResponse = "valid";
const mock = createServer((request, response) => {
  databaseReads++;
  const url = new URL(request.url, "http://local");
  response.setHeader("Content-Type", "application/json");
  const send = (body, status = 200) => { response.statusCode = status; response.end(JSON.stringify(body)); };
  if (request.method !== "GET") return send({ message: "Writes forbidden in replay verification" }, 405);
  if (url.pathname === "/rest/v1/matches") {
    if (url.searchParams.get("external_provider") !== "eq.api-football") return send({ message: "Provider filter missing" }, 400);
    const bounds = url.searchParams.getAll("kickoff_at");
    if (bounds.includes("gte.2026-07-11T07:00:00.000Z") && bounds.includes("lt.2026-07-12T07:00:00.000Z")) return send([match]);
    if (bounds.includes("gte.2026-07-12T07:00:00.000Z")) return send([]);
    if (bounds.includes("gte.2026-07-14T07:00:00.000Z")) return send([{ ...match, id: "mock-without-lens", kickoff_at: "2026-07-14T18:00:00Z" }]);
    if (bounds.includes("gte.2026-07-13T07:00:00.000Z")) return send({ message: "mock-private-diagnostic" }, 500);
    return send({ message: "Unexpected date boundary" }, 400);
  }
  if (url.pathname === "/rest/v1/match_lenses") {
    if (lensResponse === "error") return send({ message: "private-cache-diagnostic" }, 500);
    return send([{ match_id: match.id, lens_json: lensResponse === "invalid" ? { headline: "Legacy malformed cache" } : lens }]);
  }
  if (url.pathname === "/rest/v1/qa_answers") return send(qaResponse === "invalid" ? [{ answer_json: { sources: null } }] : []);
  return send({ message: "Unexpected table" }, 400);
});
await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
const probe = createServer();
await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${mock.address().port}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-test-publishable", SUPABASE_SECRET_KEY: "local-test-secret", OPENAI_API_KEY: "local-test-unused", API_FOOTBALL_KEY: "local-test-unused", NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let ready = false;
app.stdout.on("data", (data) => { if (data.toString().includes("Ready")) ready = true; });
app.stderr.on("data", () => {}); // Do not dump environment/provider diagnostics.
const base = `http://127.0.0.1:${port}`;
async function page(path) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  return response.text();
}
try {
  for (let attempt = 0; !ready && attempt < 100; attempt++) {
    if (app.exitCode !== null) throw new Error("Local Next server exited before becoming ready");
    await delay(200);
  }
  assert.ok(ready, "Local Next server readiness timed out");
  let html = await page("/");
  assert.ok(html.includes("Archived matches") && html.includes("Mock Home"));
  assert.ok(html.includes("mode=archive&amp;date=2026-07-11"));
  assert.ok(html.includes("mock-archive-match?mode=archive&amp;date=2026-07-11"));
  assert.ok(!html.includes("Mexico"));
  console.log("PASS archive landing / July 11 listing / cached summary / preserved navigation");
  html = await page("/matches/mock-archive-match?mode=archive&date=2026-07-11");
  assert.ok(html.includes("Mock cached retrospective analysis") && html.includes("cutoff unverified"));
  assert.ok(html.includes("Score unavailable") && html.includes("Final result unverified"));
  assert.ok(!html.includes("First Half"));
  console.log("PASS archive detail / stale status suppressed / no invented final score");
  html = await page("/?mode=archive&date=2026-07-12");
  assert.ok(html.includes("No archived matches for this date") && !html.includes("Mexico"));
  console.log("PASS successful empty archive date without seed fallback");
  html = await page("/?mode=archive&date=2026-07-13");
  assert.ok(html.includes("Archive could not be loaded") && !html.includes("mock-private-diagnostic") && !html.includes("Mexico"));
  console.log("PASS query error state / redacted diagnostics / no seed fallback");
  html = await page("/matches/mock-without-lens?mode=archive&date=2026-07-14");
  assert.ok(html.includes("Cached Match Lens unavailable") && html.includes("Mock Home"));
  assert.ok(!html.includes("Mock cached retrospective analysis"));
  console.log("PASS missing Lens cache retains stored fixture details");
  for (const state of ["invalid", "error"]) {
    lensResponse = state;
    html = await page("/?mode=archive&date=2026-07-11");
    assert.ok(html.includes("Some cached analysis is unavailable") && html.includes("Mock Home"));
    assert.ok(!html.includes("Archive could not be loaded") && !html.includes("private-cache-diagnostic"));
    html = await page("/matches/mock-archive-match?mode=archive&date=2026-07-11");
    assert.ok(html.includes("Cached Match Lens unavailable") && html.includes("Mock Home"));
  }
  lensResponse = "valid";
  qaResponse = "invalid";
  html = await page("/matches/mock-archive-match?mode=archive&date=2026-07-11");
  assert.ok(html.includes("Cached questions unavailable") && html.includes("Mock cached retrospective analysis"));
  qaResponse = "valid";
  console.log("PASS malformed Lens/QA and cache query failures preserve fixture rendering");
  const reads = databaseReads;
  html = await page("/?mode=illustrative&date=2026-06-11");
  assert.ok(html.includes("Illustrative examples") && html.includes("Mexico"));
  assert.ok(html.includes("mexico-south-africa?mode=illustrative&amp;date=2026-06-11"));
  html = await page("/matches/mexico-south-africa?mode=illustrative&date=2026-06-11");
  assert.ok(html.includes("Illustrative cached analysis") && html.includes("Mexico"));
  assert.ok(html.includes('/?mode=illustrative&amp;date=2026-06-11'));
  console.log("PASS explicit illustrative list/detail and back navigation");
  html = await page("/matches/mexico-south-africa?mode=illustrative&date=2026-06-12");
  assert.ok(html.includes("Match not found in this selection"));
  for (const date of ["2026-02-30", "2026-07-20"]) {
    html = await page(`/?mode=archive&date=${date}`);
    assert.ok(html.includes("Invalid replay selection"));
  }
  assert.equal(databaseReads, reads, "Illustrative and invalid selections must not query Supabase");
  console.log("PASS wrong-date detail / invalid and out-of-range inputs / zero archive reads in illustrative mode");
} finally {
  app.kill("SIGTERM");
  await new Promise((resolve) => { if (app.exitCode !== null) resolve(); else app.once("exit", resolve); });
  await new Promise((resolve) => mock.close(resolve));
}
