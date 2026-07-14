import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  runTodayPipeline,
} from "@/lib/pipeline/run-today-pipeline";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(secret && authorization === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const result = await runTodayPipeline({ refresh: false });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}
