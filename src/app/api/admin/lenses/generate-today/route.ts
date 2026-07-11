import {
  NextRequest,
  NextResponse,
} from "next/server";

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

type MatchResult = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  statusShort: string | null;
  action: "generated" | "skipped" | "failed";
  error: string | null;
};

function isAuthorized(request: NextRequest) {
  const expected = process.env.ADMIN_GENERATION_SECRET;
  const provided = request.headers.get("x-admin-secret");

  return Boolean(expected && provided && expected === provided);
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const refresh =
      request.nextUrl.searchParams.get("refresh") === "true";
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

    const results: MatchResult[] = [];

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

    return NextResponse.json({
      ok: true,
      selected: results.length,
      generated: results.filter(({ action }) => action === "generated").length,
      skipped: results.filter(({ action }) => action === "skipped").length,
      failed: results.filter(({ action }) => action === "failed").length,
      results,
    });
  } catch (error) {
    console.error("[generate-today-lenses] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected today's Match Lens generation failure",
      },
      { status: 500 },
    );
  }
}
