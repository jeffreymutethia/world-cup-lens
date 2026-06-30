import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  generateMatchLens,
} from "@/lib/ai/generate-match-lens";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getMatchViewModel,
} from "@/lib/supabase/repository";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isAuthorized(
  request: NextRequest,
) {
  const expected =
    process.env.ADMIN_GENERATION_SECRET;

  const provided =
    request.headers.get(
      "x-admin-secret",
    );

  return Boolean(
    expected &&
      provided &&
      expected === provided,
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;

    const viewModel =
      await getMatchViewModel(id);

    if (!viewModel) {
      return NextResponse.json(
        {
          error: "Match not found",
        },
        {
          status: 404,
        },
      );
    }

    const {
      lens: generatedLens,
      model,
    } = await generateMatchLens({
      homeTeam: viewModel.homeTeam,
      awayTeam: viewModel.awayTeam,
      venue: viewModel.venue,
      group: viewModel.match.group,
      kickoffAt:
        viewModel.match.kickoffAt,
    });

    const supabase =
      createAdminSupabaseClient();

    const { error } = await supabase
      .from("match_lenses")
      .upsert(
        {
          match_id: id,
          lens_json: generatedLens,
          model,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "match_id",
        },
      );

    if (error) {
      throw new Error(
        `Failed to save generated Match Lens: ${error.message}`,
      );
    }

    return NextResponse.json({
      matchId: id,
      model,
      lens: generatedLens,
    });
  } catch (error) {
    console.error(
      "[generate-lens] failed:",
      error,
    );

    if (
      error instanceof OpenAI.APIError &&
      error.status === 429 &&
      error.code ===
        "insufficient_quota"
    ) {
      return NextResponse.json(
        {
          error:
            "OpenAI API quota is unavailable. Check billing, available credits, and project spending limits.",
          code:
            "OPENAI_INSUFFICIENT_QUOTA",
        },
        {
          status: 503,
        },
      );
    }

    if (
      error instanceof OpenAI.APIError &&
      error.status === 429
    ) {
      return NextResponse.json(
        {
          error:
            "OpenAI rate limit reached. Retry after a short delay.",
          code:
            "OPENAI_RATE_LIMITED",
        },
        {
          status: 429,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected generation failure",
      },
      {
        status: 500,
      },
    );
  }
}
