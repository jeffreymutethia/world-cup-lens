import "server-only";

import {
  generateAndSaveMatchLens,
} from "@/lib/ai/generate-and-save-match-lens";
import { requireAuthoringContract, getAuthoringMatchesForLocalDate } from "@/lib/supabase/authoring";

const LIVE_STATUSES = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
]);

const UPCOMING_STATUSES = new Set(["NS", "TBD"]);

export type TodayMatchLensResult = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  statusShort: string | null;
  action: "generated" | "skipped" | "failed";
  error: string | null;
};

export type GenerateTodayMatchLensesResult = {
  selected: number;
  generated: number;
  skipped: number;
  failed: number;
  results: TodayMatchLensResult[];
};

export async function generateTodayMatchLenses({
  refresh: _refresh = false,
}: {
  refresh?: boolean;
} = {}): Promise<GenerateTodayMatchLensesResult> {
  await requireAuthoringContract();
  // Legacy refresh argument never bypasses a versioned cache or destroys history.
  void _refresh;
  const todayMatches = await getAuthoringMatchesForLocalDate();
  const selectedMatches = todayMatches.filter(row => Boolean(row.status_short && (LIVE_STATUSES.has(row.status_short) || UPCOMING_STATUSES.has(row.status_short))));
  const results: TodayMatchLensResult[] = [];

  for (const viewModel of selectedMatches) {
    const baseResult = {
      matchId: viewModel.id,
      homeTeam: viewModel.home_team.name,
      awayTeam: viewModel.away_team.name,
      statusShort: viewModel.status_short ?? null,
    };

    try {
      const result = await generateAndSaveMatchLens({match:{id:viewModel.id}});
      results.push({
        ...baseResult,
        action: result.cached ? "skipped" : "generated",
        error: null,
      });
    } catch {
      results.push({
        ...baseResult,
        action: "failed",
        error: "Match Lens authoring failed",
      });
    }
  }

  return {
    selected: results.length,
    generated: results.filter(({ action }) => action === "generated").length,
    skipped: results.filter(({ action }) => action === "skipped").length,
    failed: results.filter(({ action }) => action === "failed").length,
    results,
  };
}
