import { isCachedLens } from "../../src/lib/cached-analysis";
import type { Match, Team, Venue, MatchViewModel } from "../../src/lib/types";

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
