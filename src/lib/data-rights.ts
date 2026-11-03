// Review inventory only; no dataset exporter or permission grant is implemented.
export const SOURCE_CATEGORIES = [
  "api-football-fixtures", "team-identity", "provider-logos", "venue-data",
  "provider-documents", "editorial-snippets", "cached-ai-commentary", "illustrative-examples",
] as const;
export type SourceCategory = typeof SOURCE_CATEGORIES[number];

export function sourceRights(category: unknown) {
  return {
    category: typeof category === "string" && SOURCE_CATEGORIES.some((item) => item === category)
      ? category as SourceCategory : "unidentified" as const,
    publicationRights: "UNKNOWN" as const,
    publicGitHubDataset: "NOT_APPROVED" as const,
    publicWebDisplay: "REVIEW_REQUIRED" as const,
  };
}
