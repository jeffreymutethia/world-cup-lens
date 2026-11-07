// Review inventory only; no dataset exporter or permission grant is implemented.
export const SOURCE_CATEGORIES = [
  "api-football-fixtures", "team-identity", "provider-logos", "venue-data",
  "provider-documents", "editorial-snippets", "cached-ai-commentary", "illustrative-examples",
] as const;
export type SourceCategory = typeof SOURCE_CATEGORIES[number];

export function sourceRights(category: unknown) {
  if (category === "curated-history-2026-v3") return {
    category, publicationRights: "OWNER_DIRECTED_EDITORIAL_SCOPE" as const,
    publicGitHubDataset: "104_CURATED_RECORDS_ONLY" as const, publicWebDisplay: "104_CURATED_RECORDS_ONLY" as const,
  };
  if (category === "curated-history-2026-v1" || category === "curated-history-2026-v2") return {
    category,
    publicationRights: "OWNER_DIRECTED_EDITORIAL_SCOPE" as const,
    publicGitHubDataset: "FIVE_CURATED_RECORDS_ONLY" as const,
    publicWebDisplay: "FIVE_CURATED_RECORDS_ONLY" as const,
  };
  // New original demo content is a separate review, never an upgrade of UNKNOWN inputs.
  if (category === "reviewed-synthetic-demo-v1" || category === "reviewed-synthetic-demo-v2") return {
    category,
    publicationRights: "REVIEWED_ORIGINAL_CONTENT" as const,
    publicGitHubDataset: "APPROVED_ORIGINAL_DEMO_ONLY" as const,
    publicWebDisplay: "APPROVED_ORIGINAL_DEMO_ONLY" as const,
  };
  return {
    category: typeof category === "string" && SOURCE_CATEGORIES.some((item) => item === category)
      ? category as SourceCategory : "unidentified" as const,
    publicationRights: "UNKNOWN" as const,
    publicGitHubDataset: "NOT_APPROVED" as const,
    publicWebDisplay: "REVIEW_REQUIRED" as const,
  };
}
