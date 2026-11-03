import "server-only";
import { deploymentMode } from "./deployment-mode";
import { loadReplay, loadReplayAnswers, type ReplaySelection } from "./replay";

export function loadSelectedReplay(selection: ReplaySelection) {
  return loadReplay(selection, async (date) => {
    const { getProviderMatchesForDate } = await import("./supabase/repository");
    return getProviderMatchesForDate(date);
  }, deploymentMode());
}

export function loadSelectedAnswers(selection: ReplaySelection, id: string) {
  return loadReplayAnswers(selection, id, async (matchId) => {
    const { getCachedAnswersForMatch } = await import("./supabase/repository");
    return getCachedAnswersForMatch(matchId);
  }, deploymentMode());
}
