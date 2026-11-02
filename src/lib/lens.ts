import {
  cachedAnswers,
  cachedLenses,
  matches,
  teams,
  venues,
} from "../data/seed";
import type { PresetQuestionKey } from "./types";

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

export function getMatchViewModel(matchId: string) {
  const match = getMatchById(matchId);

  if (!match) {
    return null;
  }

  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);
  const venue = getVenueById(match.venueId);
  const lens = getMatchLensByMatchId(match.id);

  if (!homeTeam || !awayTeam || !venue) {
    return null;
  }

  return {
    match,
    homeTeam,
    awayTeam,
    venue,
    lens,
  };
}

export function getFeaturedMatchViewModel() {
  return getMatchViewModel(matches[0].id);
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
