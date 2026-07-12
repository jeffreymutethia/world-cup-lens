import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  embedDocuments,
} from "@/lib/documents/embed-documents";

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

    return NextResponse.json(await embedDocuments());
  } catch (error) {
    console.error("[embed-documents] failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected embedding failure",
      },
      { status: 500 },
    );
  }
}
