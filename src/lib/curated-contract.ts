// Public date-only editorial records. Deliberately separate from private provider Match/Lens JSON.
export const TOURNAMENT_STAGES = ["Group stage", "Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Third-place", "Final"] as const;
export type TournamentStage = typeof TOURNAMENT_STAGES[number];
export type MatchStage = `Group ${"A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"}` | Exclude<TournamentStage, "Group stage">;
export type EditorialSource = {
  identity: string; url: string; accessedOn: string; reviewedOn: string;
  publicationDate: string | null; accessMethod: "direct-page" | "direct-pdf" | "indexed-official-page";
};
export type RetrospectiveLens = {
  depth: "context" | "extended";
  headline: string; overview: string; significance: string;
  interpretation: string[];
  developments?: { text: string; sourceUrl: string }[];
  uncertainty: string[];
};
export type CuratedMatch = {
  id: string; matchNumber: number; homeTeam: string; awayTeam: string; homeCode: string; awayCode: string;
  eventDate: string; datePrecision: "day"; dateBasis: "source-local-event-day";
  stage: MatchStage; venue: string;
  finalScore: { home: number; away: number };
  afterExtraTime: boolean | null;
  penaltyShootout: { home: number; away: number } | null;
  advancingTeam: string | null;
  datasetVersion: string; publicationDecision: "OWNER_DIRECTED_EDITORIAL_RELEASE";
  source: EditorialSource; sources: EditorialSource[];
  commentaryOrigin: "authored-retrospective-editorial";
  editorial: RetrospectiveLens;
  evidenceNote?: string;
  unknowns: {
    kickoffAt: null; lineups: null; goalMinutes: null; formations: null;
    possession: null; playerStatistics: null; regulationScore: null;
    sourceCapturedAt: null; analysisGeneratedAt: null; historicalKnowledgeCutoff: null;
  };
};
export type CuratedFilters = { date: string; stage?: string; team?: string; q?: string; page?: string };
