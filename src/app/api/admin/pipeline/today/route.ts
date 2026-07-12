import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  generateTodayMatchLenses,
  type GenerateTodayMatchLensesResult,
} from "@/lib/ai/generate-today-match-lenses";
import {
  embedDocuments,
  type EmbedDocumentsResult,
} from "@/lib/documents/embed-documents";
import {
  syncProviderDocuments,
  type SyncProviderDocumentsResult,
} from "@/lib/documents/sync-provider-documents";
import {
  syncWorldCupFixtures,
} from "@/lib/fixtures/sync-fixtures";

type PipelineStep =
  | "fixtures"
  | "providerDocuments"
  | "embeddings"
  | "lenses";

type FixtureResult = Awaited<ReturnType<typeof syncWorldCupFixtures>>;

type PipelineSteps = {
  fixtures?: FixtureResult;
  providerDocuments?: SyncProviderDocumentsResult;
  embeddings?: EmbedDocumentsResult;
  lenses?: GenerateTodayMatchLensesResult;
};

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
  const completedSteps: PipelineStep[] = [];
  const steps: PipelineSteps = {};
  let failedStep: PipelineStep = "fixtures";

  try {
    steps.fixtures = await syncWorldCupFixtures();
    completedSteps.push("fixtures");

    failedStep = "providerDocuments";
    steps.providerDocuments = await syncProviderDocuments();
    completedSteps.push("providerDocuments");

    failedStep = "embeddings";
    steps.embeddings = await embedDocuments();
    completedSteps.push("embeddings");

    failedStep = "lenses";
    steps.lenses = await generateTodayMatchLenses({ refresh });

    if (steps.lenses.failed > 0) {
      throw new Error(
        `${steps.lenses.failed} selected Match Lens generation${steps.lenses.failed === 1 ? "" : "s"} failed.`,
      );
    }

    completedSteps.push("lenses");

    return NextResponse.json({
      ok: true,
      refresh,
      steps,
    });
  } catch (error) {
    console.error(`[today-pipeline] ${failedStep} failed:`, error);

    return NextResponse.json(
      {
        ok: false,
        refresh,
        failedStep,
        completedSteps,
        steps,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected today pipeline failure",
      },
      { status: 500 },
    );
  }
}
