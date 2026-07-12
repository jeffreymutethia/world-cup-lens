import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  generateTodayMatchLenses,
} from "@/lib/ai/generate-today-match-lenses";

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
    const result = await generateTodayMatchLenses({ refresh });

    return NextResponse.json({ ok: true, ...result });
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
