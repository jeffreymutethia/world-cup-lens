import { authoringDisabled } from "@/lib/deployment-mode";
import {
  NextRequest,
  NextResponse,
} from "next/server";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(secret && authorization === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  if (authoringDisabled()) return NextResponse.json({ error: "Authoring is disabled in public demo mode." }, { status: 404 });
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { runTodayPipeline } = await import("@/lib/pipeline/run-today-pipeline");

  const result = await runTodayPipeline({ refresh: false });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}
