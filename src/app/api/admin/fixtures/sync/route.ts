import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  syncWorldCupFixtures,
} from "@/lib/fixtures/sync-fixtures";

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
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const result =
      await syncWorldCupFixtures();

    return NextResponse.json({
      ok: true,
      provider: "api-football",
      ...result,
    });
  } catch (error) {
    console.error(
      "[fixtures-sync] failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected fixture sync failure",
      },
      { status: 500 },
    );
  }
}
