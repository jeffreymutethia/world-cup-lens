import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  runTodayPipeline,
} from "@/lib/pipeline/run-today-pipeline";

function isAuthorized(request: NextRequest) {
  const expected = process.env.ADMIN_GENERATION_SECRET;
  const provided = request.headers.get("x-admin-secret");

  return Boolean(expected && provided && expected === provided);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const refresh =
    request.nextUrl.searchParams.get("refresh") === "true";
  const result = await runTodayPipeline({ refresh });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}
