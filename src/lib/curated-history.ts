import { curatedMatches, CURATED_DATASET_VERSION, CURATED_PUBLICATION } from "../data/curated-history";
import { isDateKey } from "./calendar-date";
import { TOURNAMENT_STAGES, type CuratedFilters, type CuratedMatch, type EditorialSource } from "./curated-contract";
export { CURATED_DATASET_VERSION, CURATED_PUBLICATION, TOURNAMENT_STAGES };
export type { CuratedFilters, CuratedMatch };
export const DEFAULT_CURATED_DATE = "2026-07-11";
export const NON_AFFILIATION_NOTICE = "Independent archive. Not affiliated with FIFA or any national association.";
export const EXPECTED_STAGE_COUNTS = { "Group stage": 72, "Round of 32": 16, "Round of 16": 8, "Quarter-final": 4, "Semi-final": 2, "Third-place": 1, Final: 1 } as const;
const groups = Array.from("ABCDEFGHIJKL", letter => `Group ${letter}`);
const stages: readonly string[] = [...TOURNAMENT_STAGES, ...groups];
const unknownFields = ["kickoffAt", "lineups", "goalMinutes", "formations", "possession", "playerStatistics", "regulationScore", "sourceCapturedAt", "analysisGeneratedAt", "historicalKnowledgeCutoff"];
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function score(value: unknown): value is { home: number; away: number } { return object(value) && [value.home, value.away].every(n => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 30); }
export function validSource(value: unknown): value is EditorialSource {
  if (!object(value) || !text(value.identity) || !text(value.url)) return false;
  if (![value.accessedOn, value.reviewedOn].every(day => typeof day === "string" && isDateKey(day))) return false;
  if (value.publicationDate !== null && !(typeof value.publicationDate === "string" && isDateKey(value.publicationDate))) return false;
  if (typeof value.accessMethod !== "string" || !["direct-page", "direct-pdf", "indexed-official-page"].includes(value.accessMethod)) return false;
  try {
    const url = new URL(value.url);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}
export function tournamentStage(match: Pick<CuratedMatch, "stage">) { return match.stage.startsWith("Group ") ? "Group stage" : match.stage; }
export function matchWinner(match: Pick<CuratedMatch, "homeTeam" | "awayTeam" | "finalScore" | "penaltyShootout">) {
  const result = match.penaltyShootout ?? match.finalScore;
  return result.home === result.away ? null : result.home > result.away ? match.homeTeam : match.awayTeam;
}
export function isCuratedMatch(value: unknown): value is CuratedMatch {
  if (!object(value)) return false;
  const validIdentity = text(value.id) && /^[a-z0-9-]+$/.test(value.id) &&
    Number.isInteger(value.matchNumber) && Number(value.matchNumber) >= 1 && Number(value.matchNumber) <= 104 &&
    [value.homeTeam, value.awayTeam, value.venue].every(text) && value.homeTeam !== value.awayTeam &&
    [value.homeCode, value.awayCode].every(code => typeof code === "string" && /^[A-Z]{3}$/.test(code));
  const validEvent = text(value.eventDate) && isDateKey(value.eventDate) &&
    value.eventDate >= "2026-06-11" && value.eventDate <= "2026-07-19" &&
    value.datePrecision === "day" && value.dateBasis === "source-local-event-day" &&
    typeof value.stage === "string" && stages.includes(value.stage) && value.stage !== "Group stage";
  const validResult = [true, false, null].includes(value.afterExtraTime as boolean | null) && score(value.finalScore) &&
    (value.penaltyShootout === null || score(value.penaltyShootout)) &&
    (value.advancingTeam === null || value.advancingTeam === value.homeTeam || value.advancingTeam === value.awayTeam);
  const validPublication = value.datasetVersion === CURATED_DATASET_VERSION &&
    value.publicationDecision === CURATED_PUBLICATION.decision && value.commentaryOrigin === "authored-retrospective-editorial";
  if (!validIdentity || !validEvent || !validResult || !validPublication) return false;
  if (!validSource(value.source) || !Array.isArray(value.sources) || !value.sources.length ||
    !value.sources.every(validSource) || !value.sources.some(source => source.url === (value.source as EditorialSource).url)) return false;
  const editorial = value.editorial;
  if (!object(editorial) || typeof editorial.depth !== "string" || !["context", "extended"].includes(editorial.depth) ||
    ![editorial.headline, editorial.overview, editorial.significance].every(text) ||
    !Array.isArray(editorial.interpretation) || !editorial.interpretation.every(text) ||
    !Array.isArray(editorial.uncertainty) || !editorial.uncertainty.length || !editorial.uncertainty.every(text)) return false;
  if (!object(value.unknowns) || !unknownFields.every(key => (value.unknowns as Record<string, unknown>)[key] === null) ||
    (value.evidenceNote !== undefined && !text(value.evidenceNote))) return false;
  // The primary factual record must identify an official FIFA source, not a look-alike host.
  if (!["www.fifa.com", "inside.fifa.com", "fdp.fifa.org", "www.fifatrainingcentre.com"].includes(new URL(value.source.url).hostname)) return false;
  const match = value as unknown as CuratedMatch;
  if (match.stage.startsWith("Group ") && (match.afterExtraTime !== false || match.penaltyShootout !== null || match.advancingTeam !== null)) return false;
  if (match.penaltyShootout && (match.afterExtraTime !== true || match.finalScore.home !== match.finalScore.away || match.penaltyShootout.home === match.penaltyShootout.away)) return false;
  if (!match.stage.startsWith("Group ") && (matchWinner(match) === null || match.advancingTeam !== matchWinner(match))) return false;
  if (match.editorial.developments !== undefined && (!Array.isArray(match.editorial.developments) || !match.editorial.developments.every(item => object(item) && text(item.text) && match.sources.some(s => s.url === item.sourceUrl)))) return false;
  return true;
}
export function validateCuratedDataset(records: unknown): string[] {
  if (!Array.isArray(records) || !records.every(isCuratedMatch)) return ["Malformed match, result, source or editorial metadata."];
  const issues: string[] = [];
  if (records.length !== 104) issues.push("Expected 104 matches.");
  if (new Set(records.map(m => m.id)).size !== records.length) issues.push("Duplicate match ID.");
  if (new Set(records.map(m => m.matchNumber)).size !== 104) issues.push("Missing or duplicate tournament match number.");
  for (const [stage, expected] of Object.entries(EXPECTED_STAGE_COUNTS)) if (records.filter(m => tournamentStage(m) === stage).length !== expected) issues.push(`Incorrect ${stage} count.`);
  const teamCodes = new Map<string,string>();
  const codeTeams = new Map<string,string>();
  for (const m of records) for (const [team,code] of [[m.homeTeam,m.homeCode],[m.awayTeam,m.awayCode]]) {
    if ((teamCodes.has(team) && teamCodes.get(team) !== code) || (codeTeams.has(code) && codeTeams.get(code) !== team)) issues.push("Inconsistent team code identity.");
    teamCodes.set(team,code); codeTeams.set(code,team);
  }
  for (const stage of TOURNAMENT_STAGES.filter(stage => stage !== "Group stage")) {
    const participants = records.filter(m => m.stage === stage).flatMap(m => [m.homeTeam,m.awayTeam]);
    if (new Set(participants).size !== participants.length) issues.push(`Repeated participant in ${stage}.`);
  }
  const identity = new Map<string, string>();
  for (const group of groups) {
    const fixtures = records.filter(m => m.stage === group);
    const teams = new Set(fixtures.flatMap(m => [m.homeTeam, m.awayTeam]));
    if (fixtures.length !== 6 || teams.size !== 4 || [...teams].some(team => fixtures.filter(m => m.homeTeam === team || m.awayTeam === team).length !== 3)) issues.push(`Incomplete ${group}.`);
    for (const team of teams) { if (identity.has(team) && identity.get(team) !== group) issues.push("Team appears in two groups."); identity.set(team, group); }
    if (new Set(fixtures.map(m => [m.homeTeam, m.awayTeam].sort().join("|"))).size !== fixtures.length) issues.push(`Repeated pairing in ${group}.`);
  }
  if (identity.size !== 48 || records.some(m => !identity.has(m.homeTeam) || !identity.has(m.awayTeam))) issues.push("Inconsistent tournament team identity.");
  const boundaries = [[1,72,"Group stage"],[73,88,"Round of 32"],[89,96,"Round of 16"],[97,100,"Quarter-final"],[101,102,"Semi-final"],[103,103,"Third-place"],[104,104,"Final"]] as const;
  if (records.some(m => !boundaries.some(([min,max,stage]) => m.matchNumber >= min && m.matchNumber <= max && tournamentStage(m) === stage))) issues.push("Match number/stage mismatch.");
  // Winner progression is checked independently of score arithmetic; no group tiebreaker is invented.
  for (const [from,to] of [["Round of 32","Round of 16"],["Round of 16","Quarter-final"],["Quarter-final","Semi-final"],["Semi-final","Final"]]) {
    const winners = records.filter(m => m.stage === from).map(matchWinner).sort();
    const participants = records.filter(m => m.stage === to).flatMap(m => [m.homeTeam,m.awayTeam]).sort();
    if (JSON.stringify(winners) !== JSON.stringify(participants)) issues.push(`Conflicting ${from} progression.`);
  }
  const feeders: Record<number,readonly [number,number]> = {89:[74,77],90:[73,75],91:[76,78],92:[79,80],93:[83,84],94:[81,82],95:[86,88],96:[85,87],97:[89,90],98:[93,94],99:[91,92],100:[95,96],101:[97,98],102:[99,100],104:[101,102]};
  for (const [number,inputs] of Object.entries(feeders)) {
    const destination = records.find(m => m.matchNumber === Number(number));
    const expected = inputs.map(number => records.find(m => m.matchNumber === number)).map(m => m ? matchWinner(m) : null).sort();
    if (destination && JSON.stringify(expected) !== JSON.stringify([destination.homeTeam,destination.awayTeam].sort())) issues.push(`Conflicting bracket for match ${number}.`);
  }
  const semiLosers = records.filter(m => m.stage === "Semi-final").map(m => matchWinner(m) === m.homeTeam ? m.awayTeam : m.homeTeam).sort();
  if (JSON.stringify(semiLosers) !== JSON.stringify(records.filter(m => m.stage === "Third-place").flatMap(m => [m.homeTeam,m.awayTeam]).sort())) issues.push("Conflicting third-place participants.");
  return issues;
}
export const CURATED_DATES = [...new Set(curatedMatches.map(m => m.eventDate))].sort();
export const CURATED_TEAMS = [...new Set(curatedMatches.flatMap(m => [m.homeTeam,m.awayTeam]))].sort((a,b) => a.localeCompare(b));
export function teamKey(name: string) { return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function parseCuratedFilters(params: Record<string, string | string[] | undefined>): { ok: true; filters: CuratedFilters } | { ok: false; message: string } {
  if (["date","stage","team","q","page"].some(key => params[key] !== undefined && typeof params[key] !== "string")) return { ok: false, message: "Use one value for each filter." };
  const filtered = params.stage || params.team || params.q;
  const date = params.date === "" ? "all" : params.date ?? (filtered ? "all" : DEFAULT_CURATED_DATE);
  if (typeof date !== "string" || date !== "all" && (!isDateKey(date) || date < "2026-06-11" || date > "2026-07-19")) return { ok: false, message: "Choose a date from 2026-06-11 to 2026-07-19, or all dates." };
  if (params.stage && !stages.includes(params.stage as string)) return { ok: false, message: "Choose a tournament stage or group." };
  if (params.team && !CURATED_TEAMS.some(team => teamKey(team) === params.team)) return { ok: false, message: "Choose a team from this tournament." };
  if (params.q && (params.q as string).trim().length > 80) return { ok: false, message: "Keep searches to 80 characters." };
  if (params.page !== undefined && !/^[1-5]$/.test(params.page as string)) return { ok: false, message: "Choose a results page from 1 to 5." };
  return { ok: true, filters: { date, ...(params.stage ? { stage: params.stage as string } : {}), ...(params.team ? { team: params.team as string } : {}), ...((params.q as string | undefined)?.trim() ? { q: (params.q as string).trim() } : {}), ...(params.page ? {page: params.page as string} : {}) } };
}
const searchKey = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en");
export function selectCuratedMatches(records: readonly CuratedMatch[], filters: CuratedFilters) {
  return records.filter(m => (filters.date === "all" || m.eventDate === filters.date) && (!filters.stage || m.stage === filters.stage || tournamentStage(m) === filters.stage) && (!filters.team || [m.homeTeam,m.awayTeam].some(team => teamKey(team) === filters.team)) && (!filters.q || searchKey(`${m.homeTeam} ${m.awayTeam} ${m.venue} ${m.stage}`).includes(searchKey(filters.q)))).sort((a,b) => a.eventDate.localeCompare(b.eventDate) || a.matchNumber - b.matchNumber);
}
export type CuratedResult = { state: "ready"; matches: CuratedMatch[]; featured: CuratedMatch } | { state: "empty" | "error"; matches: []; featured: null };
export function loadCuratedHistory(dateOrFilters: string | CuratedFilters, records: unknown = curatedMatches): CuratedResult {
  const filters = typeof dateOrFilters === "string" ? { date: dateOrFilters } : dateOrFilters;
  const parsed = parseCuratedFilters(filters);
  if (!parsed.ok || CURATED_PUBLICATION.datasetVersion !== CURATED_DATASET_VERSION || validateCuratedDataset(records).length) return { state: "error", matches: [], featured: null };
  const matches = selectCuratedMatches(records as CuratedMatch[], parsed.filters);
  const featured = matches.find(m => m.id === "norway-england-2026-07-11") ?? matches.find(m => m.editorial.depth === "extended") ?? matches[0];
  return featured ? { state: "ready", matches, featured } : { state: "empty", matches: [], featured: null };
}
export function findCuratedMatch(id: string) { return validateCuratedDataset(curatedMatches).length ? null : curatedMatches.find(m => m.id === id) ?? null; }
export function curatedHref(filters: CuratedFilters, id?: string) {
  if (id !== undefined) {
    const match = curatedMatches.find(match => match.id === id);
    if (!match) throw new Error("Cannot link an unknown historical match.");
    return curatedMatchHref(match,filters);
  }
  const query = new URLSearchParams({ mode: "curated", date: filters.date });
  for (const key of ["stage","team","q","page"] as const) if (filters[key]) query.set(key, filters[key]);
  return `/?${query}`;
}
export function curatedNavigation(match: CuratedMatch, filters: CuratedFilters) {
  const all = selectCuratedMatches(curatedMatches, { date: "all" });
  const filtered = selectCuratedMatches(curatedMatches, filters);
  const scope = filtered.length > 1 && filtered.some(m => m.id === match.id) ? filtered : all;
  const index = scope.findIndex(m => m.id === match.id);
  const related = all.filter(m => m.id !== match.id && [match.homeTeam,match.awayTeam].some(team => m.homeTeam === team || m.awayTeam === team));
  return { previous: scope[index - 1] ?? null, next: scope[index + 1] ?? null, related };
}
export function curatedScore(match: Pick<CuratedMatch, "finalScore">) { return `${match.finalScore.home}–${match.finalScore.away}`; }
export function curatedResultLabel(match: CuratedMatch) { return match.penaltyShootout ? `After penalties · shootout ${match.penaltyShootout.home}–${match.penaltyShootout.away}` : match.afterExtraTime === true ? "After extra time" : match.afterExtraTime === false ? "Full time" : "Final result · extra-time status unknown"; }
export function secondaryCuratedMatches(matches: readonly CuratedMatch[], featuredId: string) { return matches.filter(m => m.id !== featuredId); }
export function sourceLabel(match: CuratedMatch) { return match.source.url.includes("match-schedule-fixtures") ? "FIFA schedule and results" : match.source.identity === "FIFA Training Centre" ? "FIFA Training Centre match report" : "FIFA match report"; }
export function teamMonogram(name: string) { const match = curatedMatches.find(m => m.homeTeam === name || m.awayTeam === name); return match ? match.homeTeam === name ? match.homeCode : match.awayCode : "—"; }
export function paginateCuratedMatches(matches: readonly CuratedMatch[], page = "1") {
  const pages = Math.max(1, Math.ceil(matches.length / 24));
  const current = Number(page);
  return { pages, current, invalid: !Number.isInteger(current) || current < 1 || current > pages, matches: matches.slice((current-1)*24,current*24) };
}
export function groupRecord(match: CuratedMatch, team: string) {
  if (!match.stage.startsWith("Group ")) return null;
  const played = curatedMatches.filter(m => m.stage === match.stage && m.matchNumber <= match.matchNumber && (m.homeTeam === team || m.awayTeam === team));
  let won=0, drawn=0, lost=0, goalsFor=0, goalsAgainst=0;
  for (const m of played) { const home=m.homeTeam === team; const gf=home?m.finalScore.home:m.finalScore.away; const ga=home?m.finalScore.away:m.finalScore.home; goalsFor+=gf; goalsAgainst+=ga; if(gf>ga)won++;else if(gf===ga)drawn++;else lost++; }
  return { played: played.length, won, drawn, lost, points: won*3+drawn, goalsFor, goalsAgainst };
}

// Match identity/date and originating list state are separate navigation contracts.
const returnKeys = { date: "returnDate", stage: "returnStage", team: "returnTeam", q: "returnQ", page: "returnPage" } as const;
export function curatedCanonicalPath(match: CuratedMatch) {
  return `/matches/${encodeURIComponent(match.id)}?${new URLSearchParams({ mode: "curated", date: match.eventDate })}`;
}
export function curatedMatchHref(match: CuratedMatch, returnFilters: CuratedFilters = { date: match.eventDate }) {
  const parsed = parseCuratedFilters(returnFilters);
  if (!parsed.ok) throw new Error("Invalid historical return filters.");
  const filters = parsed.filters;
  const query = new URLSearchParams({ mode: "curated", date: match.eventDate });
  if (filters.date !== match.eventDate || filters.stage || filters.team || filters.q || filters.page) {
    for (const key of Object.keys(returnKeys) as (keyof typeof returnKeys)[]) if (filters[key]) query.set(returnKeys[key], filters[key]);
  }
  return `/matches/${encodeURIComponent(match.id)}?${query}`;
}
export function parseCuratedReturn(params: Record<string, string | string[] | undefined>, fallback: CuratedFilters) {
  if (!Object.values(returnKeys).some(key => params[key] !== undefined)) return parseCuratedFilters(fallback);
  if (typeof params.returnDate !== "string" || !params.returnDate) return { ok: false as const, message: "Choose a valid return date or all dates." };
  const filters: Record<string,string|string[]|undefined> = {};
  for (const key of Object.keys(returnKeys) as (keyof typeof returnKeys)[]) filters[key] = params[returnKeys[key]];
  return parseCuratedFilters(filters);
}
export function matchLensLabel(match: CuratedMatch) { return match.editorial.depth === "extended" ? "Match analysis" : "Match context"; }
