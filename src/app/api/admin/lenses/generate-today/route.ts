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

    const { generateTodayMatchLenses } = await import("@/lib/ai/generate-today-match-lenses");

    const refresh =
      request.nextUrl.searchParams.get("refresh") === "true";
    const result = await generateTodayMatchLenses({ refresh });

    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Authoring operation failed",
      },
      { status: 500 },
    );
  }
}
