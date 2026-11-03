import { buildIllustrativeViewModel } from "../src/lib/lens";
import { deploymentMode, type DeploymentMode } from "../src/lib/deployment-mode";
import { buildIllustrativeAnswers, DEMO_PUBLICATION, DEMO_DATASET_VERSION, teams, venues, matches as demoMatches, cachedLenses } from "../src/data/seed";
import { analysisPresentation, analysisProvenance, storedEdgeLabel } from "../src/lib/analysis-presentation";
import { SOURCE_CATEGORIES, sourceRights } from "../src/lib/data-rights";
import test from "node:test";
import { isCachedLens, isCachedAnswer } from "../src/lib/cached-analysis";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { dateBounds, DEFAULT_ARCHIVE_DATE, findReplayMatch, isDateKey, loadReplay as loadReplayCore, loadReplayAnswers as loadReplayAnswersCore, localDateKey, parseReplaySelection as parseReplaySelectionCore, replayHref, replayScore, replayStatus, stageLabel, type ReplaySelection } from "../src/lib/replay";
import type { Match, MatchViewModel } from "../src/lib/types";

// Historical regression fixtures explicitly opt into archive-enabled behavior.
const parseReplaySelection = (params: Parameters<typeof parseReplaySelectionCore>[0], deployment: DeploymentMode = "archive-enabled") => parseReplaySelectionCore(params, deployment);
const loadReplay = (selection: ReplaySelection, reader: Parameters<typeof loadReplayCore>[1], deployment: DeploymentMode = "archive-enabled") => loadReplayCore(selection, reader, deployment);
const loadReplayAnswers = (selection: ReplaySelection, id: string, reader: Parameters<typeof loadReplayAnswersCore>[2], deployment: DeploymentMode = "archive-enabled") => loadReplayAnswersCore(selection, id, reader, deployment);

const archive: ReplaySelection = { mode: "archive", date: DEFAULT_ARCHIVE_DATE };
const illustrative: ReplaySelection = { mode: "illustrative", date: "2026-06-11" };
function fixture(id: string, kickoffAt = "2026-07-11T18:00:00Z", lens = false): MatchViewModel {
  const team = { id: "test-team", name: "Test Team", code: "TST", flag: "", group: "A", summary: "Mock", strengths: { attack: 50, midfield: 50, defense: 50, transitions: 50 } };
  return {
    match: { id, homeTeamId: "home", awayTeamId: "away", venueId: "venue", group: "Quarter-finals", kickoffAt, signalTags: [] },
    homeTeam: team, awayTeam: { ...team, id: "other" },
    venue: { id: "venue", name: "Mock venue", city: "Mock city", country: "Mock country", summary: "Mock" },
    lens: lens ? { headline: "Cached mock analysis", slightEdge: null, confidence: "Low", volatility: "Low", expectedGame: "Mock analysis.", whyItMatters: "Mock.", likelyGameScript: "Mock.", whatToWatch: [], casualFanGuide: "Mock.", uncertainty: [], sources: [] } : null,
  };
}

test("strict calendar validation rejects malformed and nonexistent dates", () => {
  for (const value of ["2026-2-01", "2026-02-30", "2026-13-01", "2026-00-01", "2026-07-11T00:00Z", "", "garbage", "2026-07-11 "]) assert.equal(isDateKey(value), false, value);
  assert.equal(isDateKey("2024-02-29"), true);
  assert.equal(isDateKey("2026-07-11"), true);
  assert.throws(() => dateBounds("2026-02-30"));
});

test("defaults are fixed and mode-specific, never current-day based", () => {
  assert.deepEqual(parseReplaySelection({}), { ok: true, selection: archive });
  assert.deepEqual(parseReplaySelection({ mode: "illustrative" }), { ok: true, selection: illustrative });
});

test("invalid modes, duplicate query parameters and out-of-range dates are rejected", () => {
  for (const params of [{ mode: "live" }, { mode: ["archive", "illustrative"] }, { date: ["2026-07-11"] }, { date: "2026-06-10" }, { date: "2026-07-20" }, { date: "2026-02-30" }, { date: "" }]) assert.equal(parseReplaySelection(params).ok, false);
  for (const date of ["2026-06-11", "2026-07-19"]) assert.equal(parseReplaySelection({ date }).ok, true);
});

test("Los Angeles summer calendar boundaries are half-open UTC intervals", () => {
  assert.deepEqual(dateBounds("2026-07-11"), { start: "2026-07-11T07:00:00.000Z", end: "2026-07-12T07:00:00.000Z" });
  assert.equal(localDateKey(new Date("2026-07-11T06:59:59Z")), "2026-07-10");
  assert.equal(localDateKey(new Date("2026-07-11T07:00:00Z")), "2026-07-11");
});

test("calendar boundaries handle winter and both daylight-saving transitions", () => {
  assert.deepEqual(dateBounds("2026-01-10"), { start: "2026-01-10T08:00:00.000Z", end: "2026-01-11T08:00:00.000Z" });
  assert.deepEqual(dateBounds("2026-03-08"), { start: "2026-03-08T08:00:00.000Z", end: "2026-03-09T07:00:00.000Z" });
  assert.deepEqual(dateBounds("2026-11-01"), { start: "2026-11-01T07:00:00.000Z", end: "2026-11-02T08:00:00.000Z" });
});

test("archive reader receives explicit date; selection preserves cached analysis", async () => {
  const row = fixture("provider-fixture", undefined, true);
  const result = await loadReplay(archive, async (date) => { assert.equal(date, "2026-07-11"); return [row]; });
  assert.equal(result.state, "ready");
  assert.equal(result.matches[0], row);
  assert.equal(result.featured?.lens?.headline, "Cached mock analysis");
});

test("archive selection excludes adjacent local dates including the upper boundary", async () => {
  const rows = [fixture("before", "2026-07-11T06:59:59Z"), fixture("start", "2026-07-11T07:00:00Z"), fixture("last", "2026-07-12T06:59:59Z"), fixture("end", "2026-07-12T07:00:00Z")];
  const result = await loadReplay(archive, async () => rows);
  assert.deepEqual(result.matches.map(({ match }) => match.id), ["start", "last"]);
});

test("featured matchup is earliest kickoff with stable ID tie-breaking, not live status", async () => {
  const later = fixture("later", "2026-07-11T21:00:00Z"); later.match.statusShort = "1H";
  const a = fixture("a"); const b = fixture("b");
  const result = await loadReplay(archive, async () => [later, b, a]);
  assert.equal(result.featured?.match.id, "a");
  assert.deepEqual(result.matches.map(({ match }) => match.id), ["a", "b", "later"]);
});

test("successful empty archive never falls back to existing seeds", async () => {
  const result = await loadReplay({ mode: "archive", date: "2026-06-11" }, async () => []);
  assert.deepEqual(result, { state: "empty", matches: [], featured: null });
});

test("provider failures have a distinct safe error state without seed fallback", async () => {
  const result = await loadReplay({ mode: "archive", date: "2026-06-11" }, async () => { throw new Error("sensitive mock diagnostic"); });
  assert.deepEqual(result, { state: "error", matches: [], featured: null });
  assert.equal(JSON.stringify(result).includes("sensitive"), false);
});

test("illustrative mode selects real seed helpers by date and never queries archive", async () => {
  const result = await loadReplay(illustrative, async () => { assert.fail("Archive called in illustrative mode"); });
  assert.equal(result.state, "ready");
  assert.deepEqual(result.matches.map(({ match }) => match.id), ["copper-tidal", "lantern-mossfield"]);
  assert.equal(result.featured?.match.id, "copper-tidal");
  assert.ok(result.featured?.lens);
  const empty = await loadReplay({ mode: "illustrative", date: "2026-07-11" }, async () => { assert.fail("Archive called"); });
  assert.equal(empty.state, "empty");
});

test("invalid selection cannot query the archive", async () => {
  const result = await loadReplay({ mode: "archive", date: "2026-02-30" }, async () => { assert.fail("Reader called"); });
  assert.equal(result.state, "error");
});

test("match URLs and back navigation preserve mode and selected calendar date", async () => {
  for (const selection of [archive, illustrative]) {
    const href = replayHref(selection, "id with space/?");
    const url = new URL(href, "http://local");
    assert.equal(url.pathname, "/matches/id%20with%20space%2F%3F");
    assert.deepEqual(parseReplaySelection(Object.fromEntries(url.searchParams)), { ok: true, selection });
    assert.equal(replayHref(selection), `/?mode=${selection.mode}&date=${selection.date}`);
  }
  const examples = await loadReplay(illustrative, async () => []);
  const realArchive = await loadReplay({ mode: "archive", date: illustrative.date }, async () => [fixture("provider-only", "2026-06-11T18:00:00Z")]);
  assert.ok(findReplayMatch(examples, "copper-tidal"));
  assert.equal(findReplayMatch(realArchive, "copper-tidal"), null);
  assert.equal(findReplayMatch(examples, "provider-only"), null);
  assert.equal(findReplayMatch(await loadReplay({ mode: "illustrative", date: "2026-06-12" }, async () => []), "copper-tidal"), null);
});

test("cached questions follow dataset mode and query failures do not manufacture answers", async () => {
  const examples = await loadReplayAnswers(illustrative, "copper-tidal", async () => { assert.fail("Archive QA called"); });
  assert.ok(examples.answers.length);
  const empty = await loadReplayAnswers(archive, "copper-tidal", async () => []);
  assert.deepEqual(empty, { answers: [], failed: false });
  const failed = await loadReplayAnswers(archive, "id", async () => { throw new Error("mock"); });
  assert.deepEqual(failed, { answers: [], failed: true });
});

test("stale live statuses and partial scores are never presented as live or final", () => {
  const match = fixture("id").match;
  for (const statusShort of ["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "NS", "TBD", null]) {
    const stale: Match = { ...match, statusShort, statusLong: "In Progress", elapsed: 70, homeScore: 1, awayScore: 0 };
    assert.equal(replayStatus(stale), "Final result unverified — stored status may be incomplete");
    assert.equal(replayScore(stale), "Score unavailable");
  }
  assert.equal(replayScore({ ...match, statusShort: "FT", homeScore: 0, awayScore: 0 }), "0–0");
  assert.equal(replayScore({ ...match, statusShort: "FT", homeScore: 1, awayScore: null }), "Score unavailable");
  assert.equal(replayScore({ ...match, statusShort: "FT", homeScore: -1, awayScore: 0 }), "Score unavailable");
  assert.match(replayStatus({ ...match, statusShort: "PEN" }), /shootout breakdown unavailable/);
});

test("stage labels do not turn knockout rounds into groups", () => {
  assert.equal(stageLabel("A"), "Group A");
  assert.equal(stageLabel("Quarter-finals"), "Quarter-finals");
  assert.equal(stageLabel(""), "Stage unavailable");
});


test("replay deployment configuration schedules no recurring ingestion", () => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  assert.equal((config.crons ?? []).length, 0);
});


test("malformed timestamps produce an error, never a misleading empty archive", async () => {
  const result = await loadReplay(archive, async () => [fixture("broken", "invalid-date")]);
  assert.equal(result.state, "error");
});

test("legacy malformed cached Lens and question payloads are rejected safely", async () => {
  assert.equal(isCachedLens(fixture("valid", undefined, true).lens), true);
  for (const value of [null, {}, { headline: "Old cache" }, { ...fixture("valid", undefined, true).lens, sources: null }]) {
    assert.equal(isCachedLens(value), false);
  }
  assert.equal(isCachedAnswer({ key: "tactical-edge", question: "Why?", shortLabel: "Why", answer: "Mock answer", sources: [] }), true);
  assert.equal(isCachedAnswer({ key: "tactical-edge", sources: null }), false);
  for (const confidence of [["Low"], { toString: "bad" }]) {
    assert.equal(isCachedLens({ ...fixture("valid", undefined, true).lens, confidence }), false);
  }
  for (const key of [["tactical-edge"], { toString: "bad" }]) {
    assert.equal(isCachedAnswer({ key, question: "Mock?", shortLabel: "Mock", answer: "Mock", sources: [] }), false);
  }
  const result = await loadReplayAnswers(archive, "id", async () => [null as never]);
  assert.deepEqual(result, { answers: [], failed: true });
});

test("font styling uses system fonts without a build-time Google fetch or CSS cycle", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.equal(layout.includes("next/font/google"), false);
  assert.ok(css.includes("ui-sans-serif, system-ui"));
  assert.equal(css.includes("--font-sans: var(--font-sans)"), false);
});


test("unsupported metrics are hidden for archive and synthetic examples without inventing parity", () => {
  for (const mode of ["archive", "illustrative"] as const) {
    assert.equal(analysisPresentation(mode).showNumericalTeamEdges, false);
    assert.match(analysisPresentation(mode).metricsMessage, /unavailable/);
  }
  assert.equal(storedEdgeLabel(null), "No edge stated");
  assert.equal(storedEdgeLabel("Mock Home"), "Mock Home");
});

test("missing or malformed hidden metrics do not suppress readable qualitative commentary", () => {
  const original = fixture("id", undefined, true).lens!;
  for (const teamEdges of [undefined, null, [{ homeValue: "fabricated", awayValue: -100 }], { malformed: true }]) {
    const value = { ...original, teamEdges };
    assert.equal(isCachedLens(value), true);
    assert.equal(value.expectedGame, original.expectedGame);
    assert.equal(value.teamEdges, teamEdges); // Reading never rewrites cached content.
  }
  assert.equal(isCachedLens({ ...original, expectedGame: null }), false);
});

test("archive commentary and synthetic examples have distinct provenance and non-citation context labels", () => {
  assert.match(analysisPresentation("archive").label, /Stored AI commentary.*retrospective/);
  assert.match(analysisPresentation("illustrative").label, /Synthetic illustrative/);
  assert.equal(analysisPresentation("archive").contextLabel, "Stored context snippets");
  assert.equal(analysisPresentation("illustrative").contextLabel, "Illustrative context examples");
  assert.match(analysisPresentation("archive").contextMessage, /not claim-level citations or proof/);
});

test("cache dates and replay selection can never create an authenticated pre-kickoff forecast", () => {
  const input = { mode: "archive" as const, matchEventAt: "2026-07-11T18:00:00Z", cacheUpdatedAt: "2026-07-10T12:00:00Z", knowledgeCutoffAt: "2026-07-10T12:00:00Z", datasetVersion: "claimed-version" };
  const value = analysisProvenance(input);
  assert.equal(value.perspective, "retrospective");
  assert.equal(value.cacheUpdatedAt, input.cacheUpdatedAt);
  for (const field of ["analysisGeneratedAt", "sourcePublishedAt", "sourceCapturedAt", "knowledgeCutoffAt", "datasetVersion"] as const) assert.equal(value[field], null);
  assert.equal(analysisProvenance({ ...input, mode: "illustrative" }).origin, "synthetic-editorial-example");
});

test("displayed temporal metadata rejects malformed, ambiguous, and fabricated timestamps", () => {
  for (const value of [undefined, null, 123, "2026-07-11", "2026-02-30T18:00:00Z", "2026-07-11T18:00:00", "garbage"]) {
    const metadata = analysisProvenance({ mode: "archive", matchEventAt: value, cacheUpdatedAt: value });
    assert.equal(metadata.matchEventAt, null);
    assert.equal(metadata.cacheUpdatedAt, null);
  }
});

test("unknown rights never become approval because data is factual, synthetic, or cached", () => {
  for (const category of [...SOURCE_CATEGORIES, "factual", "synthetic", "unlisted", "__proto__", null, { approved: true }]) {
    const rights = sourceRights(category);
    assert.equal(rights.publicationRights, "UNKNOWN");
    assert.equal(rights.publicGitHubDataset, "NOT_APPROVED");
    assert.equal(rights.publicWebDisplay, "REVIEW_REQUIRED");
  }
});


test("deployment defaults fail closed and archive requires an exact server opt-in", () => {
  for (const value of ["", "demo-only", "archive", "ARCHIVE-ENABLED", "typo"]) assert.equal(deploymentMode(value), "demo-only");
  assert.equal(deploymentMode("archive-enabled"), "archive-enabled");
  assert.deepEqual(parseReplaySelection({}, "demo-only"), { ok: true, selection: illustrative });
  const blocked = parseReplaySelection({ mode: "archive" }, "demo-only");
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.reason, "disabled");
  assert.deepEqual(parseReplaySelection({}, "archive-enabled"), { ok: true, selection: archive });
});

test("demo selection and answers cannot reach an archive reader", async () => {
  const forbidden = async () => { assert.fail("Archive must not run"); return []; };
  assert.equal((await loadReplay(archive, forbidden, "demo-only")).state, "error");
  assert.deepEqual(await loadReplayAnswers(archive, "id", forbidden, "demo-only"), { answers: [], failed: true });
  const demo = await loadReplay(illustrative, forbidden, "demo-only");
  assert.equal(demo.state, "ready");
  assert.equal(demo.featured?.match.id, "copper-tidal");
  assert.ok((await loadReplayAnswers(illustrative, "copper-tidal", forbidden, "demo-only")).answers.length);
});

test("new demo review is scoped to original versioned fiction and does not approve old unknown sources", () => {
  assert.equal(DEMO_PUBLICATION.thirdPartyInputs, false);
  assert.equal(DEMO_PUBLICATION.datasetVersion, DEMO_DATASET_VERSION);
  assert.equal(DEMO_PUBLICATION.decision, "APPROVED_FOR_ORIGINAL_DEMO");
  assert.equal(sourceRights("reviewed-synthetic-demo-v1").publicWebDisplay, "APPROVED_ORIGINAL_DEMO_ONLY");
  assert.equal(sourceRights("illustrative-examples").publicationRights, "UNKNOWN");
  assert.equal(sourceRights("api-football-fixtures").publicationRights, "UNKNOWN");
  assert.ok(teams.every(team => Object.values(team.strengths).every(value => value === null)));
  assert.ok(Object.values(cachedLenses).every(isCachedLens));
  assert.equal(analysisProvenance({ mode: "illustrative", matchEventAt: null }).datasetVersion, DEMO_DATASET_VERSION);
});

test("fictional scenarios never acquire real-world result labels", () => {
  const match = { ...fixture("fictional").match, statusShort: "FT", homeScore: 2, awayScore: 1 };
  assert.equal(replayStatus(match, "illustrative"), "Fictional scenario");
  assert.equal(replayScore(match, "illustrative"), "No real result");
});


test("missing sample relations and malformed sample commentary are handled without invented data", () => {
  const match = demoMatches[0];
  assert.equal(buildIllustrativeViewModel(match, [], venues, cachedLenses[match.id]), null);
  assert.equal(buildIllustrativeViewModel(match, teams, [], cachedLenses[match.id]), null);
  for (const cache of [undefined, null, { headline: "incomplete sample" }, { sources: null }]) {
    assert.deepEqual(buildIllustrativeAnswers(cache), {});
    const value = buildIllustrativeViewModel(match, teams, venues, cache);
    assert.ok(value);
    assert.equal(value.lens, null);
    assert.equal(value.homeTeam.name, "Copper Vale");
  }
  assert.equal(Object.values(buildIllustrativeAnswers(cachedLenses[match.id])).length, 3);
});


test("omitted lower-level policy also fails closed", async () => {
  assert.deepEqual(parseReplaySelectionCore({}), { ok: true, selection: illustrative });
  const reader = async () => { assert.fail("Default policy must not access the archive"); return []; };
  assert.equal((await loadReplayCore(archive, reader)).state, "error");
  assert.deepEqual(await loadReplayAnswersCore(archive, "id", reader), { answers: [], failed: true });
});
