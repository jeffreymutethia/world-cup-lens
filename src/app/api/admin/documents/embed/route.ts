import { authoringDisabled } from "@/lib/deployment-mode";
import {
  NextRequest,
  NextResponse,
} from "next/server";

function isAuthorized(request: NextRequest) {
  const expected = process.env.ADMIN_GENERATION_SECRET;
  const provided = request.headers.get("x-admin-secret");

  return Boolean(expected && provided && expected === provided);
}

export async function POST(request: NextRequest) {
  if (authoringDisabled()) return NextResponse.json({ error: "Authoring is disabled in public demo mode." }, { status: 404 });
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { embedDocuments } = await import("@/lib/documents/embed-documents");

    return NextResponse.json(await embedDocuments());
  } catch {
    return NextResponse.json(
      {
        error: "Authoring operation failed",
      },
      { status: 500 },
    );
  }
}
