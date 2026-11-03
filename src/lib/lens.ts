import {
  cachedAnswers,
  cachedLenses,
  matches,
  teams,
  venues,
} from "../data/seed";
import { isCachedLens } from "./cached-analysis";
import type { Match, Team, Venue, MatchViewModel, PresetQuestionKey } from "./types";

export function getTeamById(id: string) {
  return teams.find((team) => team.id === id);
}

export function getVenueById(id: string) {
  return venues.find((venue) => venue.id === id);
}

export function getMatchById(id: string) {
  return matches.find((match) => match.id === id);
}

export function getMatchLensByMatchId(matchId: string) {
  return cachedLenses[matchId] ?? null;
}

export function buildIllustrativeViewModel(
  match: Match,
  teamRows: Team[],
  venueRows: Venue[],
  cachedLens: unknown,
): MatchViewModel | null {
  const homeTeam = teamRows.find((team) => team.id === match.homeTeamId);
  const awayTeam = teamRows.find((team) => team.id === match.awayTeamId);
  const venue = venueRows.find((row) => row.id === match.venueId);
  if (!homeTeam || !awayTeam || !venue) return null;
  return { match, homeTeam, awayTeam, venue, lens: isCachedLens(cachedLens) ? cachedLens : null };
}

export function getMatchViewModel(matchId: string) {
  const match = getMatchById(matchId);
  return match ? buildIllustrativeViewModel(match, teams, venues, getMatchLensByMatchId(match.id)) : null;
}

export function getFeaturedMatchViewModel() {
  return matches[0] ? getMatchViewModel(matches[0].id) : null;
}

export function getAllMatchViewModels() {
  return matches
    .map((match) => getMatchViewModel(match.id))
    .filter((match): match is NonNullable<typeof match> => Boolean(match));
}

export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/Los_Angeles",
  }).format(new Date(iso));
}

export function getCachedAnswer(
  matchId: string,
  questionKey: PresetQuestionKey,
) {
  return cachedAnswers[matchId]?.[questionKey] ?? null;
}

export function getCachedAnswersForMatch(matchId: string) {
  const answers = cachedAnswers[matchId];

  if (!answers) {
    return [];
  }

  return Object.values(answers).filter(
    (answer): answer is NonNullable<typeof answer> => Boolean(answer),
  );
}
