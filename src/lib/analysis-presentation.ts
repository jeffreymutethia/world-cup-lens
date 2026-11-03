import { DEMO_DATASET_VERSION } from "../data/seed";
import type { DatasetMode } from "./replay";

export function analysisPresentation(mode: DatasetMode) {
  return {
    label: mode === "illustrative" ? "Synthetic illustrative commentary" : "Stored AI commentary — retrospective",
    contextLabel: mode === "illustrative" ? "Illustrative context examples" : "Stored context snippets",
    // No current dataset has a documented per-metric methodology or source lineage.
    showNumericalTeamEdges: false as const,
    metricsMessage: "Team comparison unavailable: no sourced measurement methodology is recorded.",
    contextMessage: "These snippets are stored context, not claim-level citations or proof. Source identity, dates, and rights may be incomplete.",
  };
}

export function storedEdgeLabel(edge: string | null) {
  return edge ?? "No edge stated";
}

function timestamp(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const calendar = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(Date.parse(value)) && Number.isFinite(calendar.getTime()) &&
    calendar.toISOString().slice(0, 10) === value.slice(0, 10) ? value : null;
}

export type AnalysisProvenance = {
  origin: "stored-ai-commentary" | "synthetic-editorial-example";
  perspective: "retrospective" | "synthetic-example";
  matchEventAt: string | null;
  cacheUpdatedAt: string | null;
  sourcePublishedAt: null;
  sourceCapturedAt: null;
  analysisGeneratedAt: null;
  knowledgeCutoffAt: null;
  datasetVersion: string | null;
};

// Current caches establish none of the null fields. An update timestamp is not
// generation time, and a selected replay date is not a knowledge cutoff.
export function analysisProvenance(input: {
  mode: DatasetMode;
  matchEventAt: unknown;
  cacheUpdatedAt?: unknown;
}): AnalysisProvenance {
  return {
    origin: input.mode === "illustrative" ? "synthetic-editorial-example" : "stored-ai-commentary",
    perspective: input.mode === "illustrative" ? "synthetic-example" : "retrospective",
    matchEventAt: timestamp(input.matchEventAt),
    cacheUpdatedAt: timestamp(input.cacheUpdatedAt),
    sourcePublishedAt: null,
    sourceCapturedAt: null,
    analysisGeneratedAt: null,
    knowledgeCutoffAt: null,
    datasetVersion: input.mode === "illustrative" ? DEMO_DATASET_VERSION : null,
  };
}
