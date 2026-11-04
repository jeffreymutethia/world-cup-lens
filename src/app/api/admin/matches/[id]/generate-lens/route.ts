import { authoringDisabled } from "@/lib/deployment-mode";
import { AuthoringMatchNotFoundError } from "@/lib/rag/errors";
import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

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
  if (authoringDisabled()) return NextResponse.json({ error: "Authoring is disabled in public demo mode." }, { status: 404 });
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

    const { generateAndSaveMatchLens } = await import("@/lib/ai/generate-and-save-match-lens");

    const { id } = await context.params;

    const {
      lens: generatedLens,
      model,
      retrievedSources,
    } = await generateAndSaveMatchLens({ match: { id } });

    return NextResponse.json({
      matchId: id,
      model,
      retrievedSources,
      lens: generatedLens,
    });
  } catch (error) {
    if (error instanceof AuthoringMatchNotFoundError) return NextResponse.json({ error: "Match not found" }, { status: 404 });

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
        error: "Authoring operation failed",
      },
      {
        status: 500,
      },
    );
  }
}
