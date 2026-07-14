import "server-only";

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

export type PipelineStep =
  | "fixtures"
  | "providerDocuments"
  | "embeddings"
  | "lenses";

type FixtureResult = Awaited<ReturnType<typeof syncWorldCupFixtures>>;

export type TodayPipelineSteps = {
  fixtures?: FixtureResult;
  providerDocuments?: SyncProviderDocumentsResult;
  embeddings?: EmbedDocumentsResult;
  lenses?: GenerateTodayMatchLensesResult;
};

export type TodayPipelineResult =
  | {
      ok: true;
      refresh: boolean;
      steps: TodayPipelineSteps;
    }
  | {
      ok: false;
      refresh: boolean;
      failedStep: PipelineStep;
      completedSteps: PipelineStep[];
      steps: TodayPipelineSteps;
      error: string;
    };

export async function runTodayPipeline({
  refresh = false,
}: {
  refresh?: boolean;
} = {}): Promise<TodayPipelineResult> {
  const completedSteps: PipelineStep[] = [];
  const steps: TodayPipelineSteps = {};
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

    return {
      ok: true,
      refresh,
      steps,
    };
  } catch (error) {
    console.error(`[today-pipeline] ${failedStep} failed:`, error);

    return {
      ok: false,
      refresh,
      failedStep,
      completedSteps,
      steps,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected today pipeline failure",
    };
  }
}
