import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  syncProviderDocuments,
} from "@/lib/documents/sync-provider-documents";

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

    const result = await syncProviderDocuments();

    return NextResponse.json({
      ok: true,
      provider: "api-football",
      ...result,
    });
  } catch (error) {
    console.error("[sync-provider-documents] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected provider document sync failure",
      },
      { status: 500 },
    );
  }
}
