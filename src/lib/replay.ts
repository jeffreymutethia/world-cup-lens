import { isCachedAnswer } from "./cached-analysis";
import type { Match, MatchQuestionAnswer, MatchViewModel } from "./types";
import { getAllMatchViewModels, getCachedAnswersForMatch } from "./lens";

export const REPLAY_TIME_ZONE = "America/Los_Angeles";
export const DEFAULT_ARCHIVE_DATE = "2026-07-11";
export const DEFAULT_ILLUSTRATIVE_DATE = "2026-06-11";
export const REPLAY_MIN_DATE = "2026-06-11";
export const REPLAY_MAX_DATE = "2026-07-19";
export type DatasetMode = "archive" | "illustrative";
export type ReplaySelection = { mode: DatasetMode; date: string };
export type ReplaySearchParams = Record<string, string | string[] | undefined>;
export type SelectionResult =
  | { ok: true; selection: ReplaySelection }
  | { ok: false; message: string };

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseReplaySelection(params: ReplaySearchParams): SelectionResult {
  const mode = params.mode ?? "archive";
  if (mode !== "archive" && mode !== "illustrative") {
    return { ok: false, message: "Choose archive or illustrative as the dataset mode." };
  }
  const date = params.date ?? (mode === "archive" ? DEFAULT_ARCHIVE_DATE : DEFAULT_ILLUSTRATIVE_DATE);
  if (typeof date !== "string" || !isDateKey(date)) {
    return { ok: false, message: "Enter a valid date in YYYY-MM-DD format." };
  }
  if (date < REPLAY_MIN_DATE || date > REPLAY_MAX_DATE) {
    return { ok: false, message: `Choose a date from ${REPLAY_MIN_DATE} to ${REPLAY_MAX_DATE}.` };
  }
  return { ok: true, selection: { mode, date } };
}

export function localDateKey(date: Date, timeZone = REPLAY_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function localMidnightUtc(dateKey: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const desired = Date.UTC(year, month - 1, day);
  let candidate = desired;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(candidate));
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
    candidate += desired - Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  }
  return new Date(candidate).toISOString();
}

// Half-open local calendar day, never UTC-date parsing followed by local conversion.
export function dateBounds(date: string, timeZone = REPLAY_TIME_ZONE) {
  if (!isDateKey(date)) throw new Error("Invalid calendar date.");
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return {
    start: localMidnightUtc(date, timeZone),
    end: localMidnightUtc(next.toISOString().slice(0, 10), timeZone),
  };
}

export function replayHref(selection: ReplaySelection, matchId?: string) {
  const path = matchId === undefined ? "/" : `/matches/${encodeURIComponent(matchId)}`;
  return `${path}?${new URLSearchParams({ mode: selection.mode, date: selection.date })}`;
}

export type ReplayResult =
  | { state: "ready"; matches: MatchViewModel[]; featured: MatchViewModel }
  | { state: "empty"; matches: []; featured: null }
  | { state: "error"; matches: []; featured: null };

export type ArchiveReader = (date: string) => Promise<MatchViewModel[]>;

export async function loadReplay(selection: ReplaySelection, readArchive: ArchiveReader): Promise<ReplayResult> {
  // Validate at the service boundary too, so callers cannot accidentally query a real-clock day.
  if (!parseReplaySelection(selection).ok) return { state: "error", matches: [], featured: null };
  try {
    const candidates = selection.mode === "archive"
      ? await readArchive(selection.date)
      : getAllMatchViewModels();
    if (candidates.some(({ match }) => !Number.isFinite(Date.parse(match.kickoffAt)))) {
      throw new Error("Stored fixture timestamp is invalid.");
    }
    const { start, end } = dateBounds(selection.date);
    const matches = candidates.filter(({ match }) => new Date(match.kickoffAt).getTime() >= Date.parse(start) &&
      new Date(match.kickoffAt).getTime() < Date.parse(end))
      .sort((a, b) => Date.parse(a.match.kickoffAt) - Date.parse(b.match.kickoffAt) || a.match.id.localeCompare(b.match.id));
    return matches[0]
      ? { state: "ready", matches, featured: matches[0] }
      : { state: "empty", matches: [], featured: null };
  } catch {
    // Provider/database errors can contain sensitive details. Do not serialize or log them here.
    return { state: "error", matches: [], featured: null };
  }
}

export function findReplayMatch(result: ReplayResult, id: string) {
  return result.matches.find(({ match }) => match.id === id) ?? null;
}

export async function loadReplayAnswers(
  selection: ReplaySelection,
  matchId: string,
  readArchive: (id: string) => Promise<MatchQuestionAnswer[]>,
) {
  try {
    const answers = selection.mode === "illustrative"
      ? getCachedAnswersForMatch(matchId)
      : await readArchive(matchId);
    if (!answers.every(isCachedAnswer)) return { answers: [], failed: true };
    return { answers, failed: false };
  } catch {
    return { answers: [], failed: true };
  }
}

export function stageLabel(group: string) {
  return /^[A-L]$/.test(group) ? `Group ${group}` : group || "Stage unavailable";
}

export function replayStatus(match: Match) {
  switch (match.statusShort) {
    case "FT": return "Recorded full time";
    case "AET": return "Recorded after extra time";
    case "PEN": return "Recorded after penalties; shootout breakdown unavailable";
    case "PST": return "Recorded as postponed; final result unavailable";
    case "CANC": return "Recorded as cancelled";
    default: return "Final result unverified — stored status may be incomplete";
  }
}

export function replayScore(match: Match) {
  const final = ["FT", "AET", "PEN"].includes(match.statusShort ?? "");
  return final && Number.isInteger(match.homeScore) && Number.isInteger(match.awayScore) && (match.homeScore ?? -1) >= 0 && (match.awayScore ?? -1) >= 0
    ? `${match.homeScore}–${match.awayScore}`
    : "Score unavailable";
}
