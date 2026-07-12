import "server-only";

import {
  generateAndSaveMatchLens,
} from "@/lib/ai/generate-and-save-match-lens";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getProviderMatchesForLocalDate,
} from "@/lib/supabase/repository";

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
  refresh = false,
}: {
  refresh?: boolean;
} = {}): Promise<GenerateTodayMatchLensesResult> {
  const todayMatches = await getProviderMatchesForLocalDate();
  const selectedMatches = todayMatches.filter(({ match }) => {
    const status = match.statusShort;
    return Boolean(
      status &&
        (LIVE_STATUSES.has(status) || UPCOMING_STATUSES.has(status)),
    );
  });
  const existingLensIds = new Set<string>();

  if (!refresh && selectedMatches.length > 0) {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("match_lenses")
      .select("match_id")
      .in(
        "match_id",
        selectedMatches.map(({ match }) => match.id),
      );

    if (error) {
      throw new Error(
        `Failed to load existing Match Lenses: ${error.message}`,
      );
    }

    for (const row of data ?? []) {
      existingLensIds.add(row.match_id as string);
    }
  }

  const results: TodayMatchLensResult[] = [];

  for (const viewModel of selectedMatches) {
    const baseResult = {
      matchId: viewModel.match.id,
      homeTeam: viewModel.homeTeam.name,
      awayTeam: viewModel.awayTeam.name,
      statusShort: viewModel.match.statusShort ?? null,
    };

    if (!refresh && existingLensIds.has(viewModel.match.id)) {
      results.push({
        ...baseResult,
        action: "skipped",
        error: null,
      });
      continue;
    }

    try {
      await generateAndSaveMatchLens(viewModel);
      results.push({
        ...baseResult,
        action: "generated",
        error: null,
      });
    } catch (error) {
      console.error(
        `[generate-today-lenses] ${viewModel.match.id} failed:`,
        error,
      );
      results.push({
        ...baseResult,
        action: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Match Lens generation failure",
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
