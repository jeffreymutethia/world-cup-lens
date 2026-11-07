// Retained only for legacy synthetic display metadata; public routes reject this mode.
const LEGACY_DEMO_DATASET_VERSION = "wcl-synthetic-v2";
import type { DatasetMode } from "./replay";

export function analysisPresentation(mode: DatasetMode) {
  return {
    label: mode === "illustrative" ? "Fictional sample commentary" : "Stored AI commentary — retrospective",
    contextLabel: mode === "illustrative" ? "Scenario notes" : "Stored context snippets",
    // No current dataset has a documented per-metric methodology or source lineage.
    showNumericalTeamEdges: false as const,
    metricsMessage: "Team comparison is unavailable: comparable measurements are not supplied.",
    contextMessage: mode === "illustrative" ? "Original notes describe the assigned fictional styles. They are not external sources." : "These notes provide context, not proof of each claim. Their sources, dates and publication rights may be incomplete.",
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
    datasetVersion: input.mode === "illustrative" ? LEGACY_DEMO_DATASET_VERSION : null,
  };
}
