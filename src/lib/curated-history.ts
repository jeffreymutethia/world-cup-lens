import { curatedMatches, CURATED_DATASET_VERSION, CURATED_PUBLICATION } from "../data/curated-history";
import { isDateKey } from "./calendar-date";

export { CURATED_DATASET_VERSION, CURATED_PUBLICATION };
export const DEFAULT_CURATED_DATE = "2026-07-11";
export const CURATED_DATES = ["2026-06-11", "2026-06-12", "2026-07-11", "2026-07-19"] as const;
export const NON_AFFILIATION_NOTICE = "Independent portfolio project. Not affiliated with FIFA or any national association.";

export type CuratedMatch = {
  id: string; homeTeam: string; awayTeam: string; eventDate: string;
  datePrecision: "day"; dateBasis: "source-local-event-day";
  stage: "Group A" | "Group D" | "Quarter-final" | "Final";
  venue: string; finalScore: { home: number; away: number }; afterExtraTime: boolean;
  datasetVersion: string; publicationDecision: "OWNER_DIRECTED_EDITORIAL_RELEASE";
  source: { identity: string; url: string; accessedOn: string; reviewedOn: string; publicationDate: string | null; accessMethod: "direct-pdf" | "indexed-official-page" };
  commentaryOrigin: "authored-retrospective-editorial";
  editorial: { headline: string; paragraphs: string[] };
  evidenceNote?: string;
  unknowns: { kickoffAt: null; lineups: null; goalMinutes: null; formations: null; possession: null; playerStatistics: null; regulationScore: null; sourceCapturedAt: null; analysisGeneratedAt: null; historicalKnowledgeCutoff: null };
};
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
export function isCuratedMatch(value: unknown): value is CuratedMatch {
  if (!object(value) || !text(value.id) || !/^[a-z0-9-]+$/.test(value.id) ||
    ![value.homeTeam, value.awayTeam, value.venue].every(text) || value.homeTeam === value.awayTeam ||
    !text(value.eventDate) || !isDateKey(value.eventDate) || value.eventDate < "2026-06-11" || value.eventDate > "2026-07-19" ||
    value.datePrecision !== "day" || value.dateBasis !== "source-local-event-day" ||
    typeof value.stage !== "string" || !["Group A", "Group D", "Quarter-final", "Final"].includes(value.stage) || typeof value.afterExtraTime !== "boolean" ||
    (value.stage.startsWith("Group ") && value.afterExtraTime) ||
    value.datasetVersion !== CURATED_DATASET_VERSION || value.publicationDecision !== CURATED_PUBLICATION.decision ||
    value.commentaryOrigin !== "authored-retrospective-editorial" ||
    !object(value.finalScore) || ![value.finalScore.home, value.finalScore.away].every(score => Number.isInteger(score) && Number(score) >= 0) ||
    !object(value.source) || !text(value.source.identity) || !text(value.source.url) ||
    typeof value.source.accessMethod !== "string" || !["direct-pdf", "indexed-official-page"].includes(value.source.accessMethod) ||
    ![value.source.accessedOn, value.source.reviewedOn].every(day => typeof day === "string" && isDateKey(day)) ||
    !(value.source.publicationDate === null || (typeof value.source.publicationDate === "string" && isDateKey(value.source.publicationDate))) ||
    !object(value.editorial) || !text(value.editorial.headline) || !Array.isArray(value.editorial.paragraphs) ||
    value.editorial.paragraphs.length === 0 || !value.editorial.paragraphs.every(text) ||
    (value.evidenceNote !== undefined && !text(value.evidenceNote)) || !object(value.unknowns)) return false;
  const unknownFields = ["kickoffAt", "lineups", "goalMinutes", "formations", "possession", "playerStatistics", "regulationScore", "sourceCapturedAt", "analysisGeneratedAt", "historicalKnowledgeCutoff"];
  if (!unknownFields.every(key => (value.unknowns as Record<string, unknown>)[key] === null)) return false;
  try {
    const url = new URL(value.source.url);
    if (url.protocol !== "https:" || url.username || url.password ||
      !["www.fifa.com", "fdp.fifa.org", "www.fifatrainingcentre.com"].includes(url.hostname)) return false;
  } catch { return false; }
  return true;
}

export type CuratedResult =
  | { state: "ready"; matches: CuratedMatch[]; featured: CuratedMatch }
  | { state: "empty" | "error"; matches: []; featured: null };

// Local, synchronous and deterministic: this path never constructs a service client.
export function loadCuratedHistory(date: string, records: unknown = curatedMatches): CuratedResult {
  if (!isDateKey(date) || date < "2026-06-11" || date > "2026-07-19" ||
    CURATED_PUBLICATION.decision !== "OWNER_DIRECTED_EDITORIAL_RELEASE" ||
    CURATED_PUBLICATION.datasetVersion !== CURATED_DATASET_VERSION ||
    !Array.isArray(records) || !records.every(isCuratedMatch) ||
    new Set(records.map(record => record.id)).size !== records.length) return { state: "error", matches: [], featured: null };
  const matches = records.filter(record => record.eventDate === date);
  return matches[0] ? { state: "ready", matches, featured: matches[0] } : { state: "empty", matches: [], featured: null };
}

export function curatedResultLabel(match: CuratedMatch) {
  return match.afterExtraTime ? "Final result · AET (after extra time)" : "Final result · normal time";
}
export function curatedScore(match: CuratedMatch) { return `${match.finalScore.home}–${match.finalScore.away}`; }


export function secondaryCuratedMatches(matches: readonly CuratedMatch[], featuredId: string) {
  return matches.filter(match => match.id !== featuredId);
}

export function sourceLabel(match: CuratedMatch) {
  return match.source.url.includes("match-schedule-fixtures") ? "FIFA schedule and results" :
    match.source.identity === "FIFA Training Centre" ? "FIFA Training Centre match report" : "FIFA match report";
}

// Original typographic abbreviations, not association logos or provider identifiers.
export function teamMonogram(name: string) {
  const labels: Record<string, string> = { Mexico: "MEX", "South Africa": "RSA", USA: "USA", Paraguay: "PAR", Norway: "NOR", England: "ENG", Argentina: "ARG", Switzerland: "SUI", Spain: "ESP" };
  return labels[name] ?? name.slice(0, 3).toUpperCase();
}
