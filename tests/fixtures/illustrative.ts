import type { Match, PublicMatchLens, MatchQuestionAnswer, PresetQuestionKey, Team, Venue } from "../../src/lib/types";
import { isCachedLens } from "../../src/lib/cached-analysis";

// Newly authored fictional material, scoped by docs/demo-publication-review.md.
// No provider records, quotations, logos, flags, or real team profiles are inputs.
export const DEMO_DATASET_VERSION = "wcl-synthetic-v2";
export const DEMO_PUBLICATION = {
  datasetVersion: DEMO_DATASET_VERSION,
  decision: "APPROVED_FOR_ORIGINAL_DEMO",
  evidence: "docs/demo-publication-review.md",
  thirdPartyInputs: false,
} as const;
export const teams: Team[] = [
  { id: "copper-vale", name: "Copper Vale", code: "CVL", flag: "CV", group: "Exhibition", summary: "A fictional side built around patient passing in this scenario.", strengths: { attack: null, midfield: null, defense: null, transitions: null } },
  { id: "tidal-workshop", name: "Tidal Workshop", code: "TDW", flag: "TW", group: "Exhibition", summary: "A fictional side designed to counter quickly in this scenario.", strengths: { attack: null, midfield: null, defense: null, transitions: null } },
  { id: "lantern-ridge", name: "Lantern Ridge", code: "LNR", flag: "LR", group: "Exhibition", summary: "A fictional side that uses wide spaces in this scenario.", strengths: { attack: null, midfield: null, defense: null, transitions: null } },
  { id: "mossfield-circuit", name: "Mossfield Circuit", code: "MSC", flag: "MC", group: "Exhibition", summary: "A fictional side designed to defend narrow spaces in this scenario.", strengths: { attack: null, midfield: null, defense: null, transitions: null } },
];
export const venues: Venue[] = [
  { id: "practice-grid", name: "North Practice Grid", city: "Example Quarter", country: "Fictional setting", summary: "An invented training ground used only for this demonstration." },
  { id: "training-loop", name: "West Training Loop", city: "Simulation City", country: "Fictional setting", summary: "An invented exhibition ground, unrelated to an official venue." },
];
export const matches: Match[] = [
  { id: "copper-tidal", homeTeamId: "copper-vale", awayTeamId: "tidal-workshop", venueId: "practice-grid", group: "Passing vs counterplay", kickoffAt: "2026-06-11T18:00:00Z", signalTags: ["Fictional scenario", "Patient build-up"] },
  { id: "lantern-mossfield", homeTeamId: "lantern-ridge", awayTeamId: "mossfield-circuit", venueId: "training-loop", group: "Width vs compactness", kickoffAt: "2026-06-11T23:00:00Z", signalTags: ["Fictional scenario", "Wide spaces"] },
  { id: "copper-lantern", homeTeamId: "copper-vale", awayTeamId: "lantern-ridge", venueId: "practice-grid", group: "Changing the rhythm", kickoffAt: "2026-06-12T19:00:00Z", signalTags: ["Fictional scenario", "Explore another date"] },
];
export const cachedLenses: Record<string, PublicMatchLens> = {
  "copper-tidal": {
    headline: "Patient passing against counterplay", slightEdge: null, confidence: "Low", volatility: "Medium",
    expectedGame: "In this invented matchup, Copper Vale circulates the ball while Tidal Workshop waits for a loose pass.",
    whyItMatters: "Copper Vale is assigned short passing; Tidal Workshop is assigned counterplay. The scenario compares these two fictional styles.",
    likelyGameScript: "Copper Vale starts with short passes. Tidal Workshop stays close together and tries to move forward as soon as possession changes.",
    whatToWatch: ["The space behind Copper Vale's passing line.", "Tidal Workshop's first pass after a recovery.", "Passing options when the forward route is blocked."],
    casualFanGuide: "Copper Vale keeps possession through short passes. Tidal Workshop waits to recover the ball and move forward quickly. These styles are fictional.",
    uncertainty: ["No player, fitness, or event data exists for these fictional teams.", "Changing either invented style would change this story."],
    sources: [{ title: "Original scenario design note", snippet: "Copper Vale is assigned patient passing; Tidal Workshop is assigned quick counterplay. These are authored assumptions, not observations." }],
  },
  "lantern-mossfield": {
    headline: "Wide passing against a compact defence", slightEdge: null, confidence: "Low", volatility: "Medium",
    expectedGame: "Lantern Ridge explores the sides of an imaginary pitch while Mossfield Circuit protects the middle.",
    whyItMatters: "Lantern Ridge is assigned wide passing; Mossfield Circuit is assigned a narrow defensive shape.",
    likelyGameScript: "The opening moves travel across the pitch. Mossfield Circuit shifts together, and Lantern Ridge looks for a pass back into the centre.",
    whatToWatch: ["How quickly the narrow shape shifts.", "The return pass from a wide position.", "Space left on the opposite side."],
    casualFanGuide: "Lantern Ridge moves the ball wide. Mossfield Circuit protects the centre. The scenario asks how these assigned styles might interact.",
    uncertainty: ["The styles are deliberate fiction, not scouting findings.", "There is no measured advantage or verified result."],
    sources: [{ title: "Original width scenario note", snippet: "The demonstration assigns wide passing to Lantern Ridge and a narrow shape to Mossfield Circuit. No third-party report is quoted." }],
  },
  "copper-lantern": {
    headline: "Short passing and wide routes", slightEdge: null, confidence: "Low", volatility: "Medium",
    expectedGame: "The second-day example compares Copper Vale’s short passing with Lantern Ridge’s wider routes.",
    whyItMatters: "The teams use different passing routes in this scenario. Neither style is based on a real match or measured team performance.",
    likelyGameScript: "The fictional sides alternate between central combinations and wide resets. Neither is assigned a numerical superiority.",
    whatToWatch: ["The timing of a wide reset.", "How the central passing route changes.", "The next choice after a blocked route."],
    casualFanGuide: "Copper Vale uses short combinations through the centre; Lantern Ridge uses wider passing routes. Both are assigned styles.",
    uncertainty: ["This is not a replay of an official match.", "No historical outcome or information cutoff is asserted."],
    sources: [],
  },
};

export function buildIllustrativeAnswers(lens: unknown): Partial<Record<PresetQuestionKey, MatchQuestionAnswer>> {
  if (!isCachedLens(lens)) return {};
  return {
    "explain-casually": { key: "explain-casually", question: "What is the idea behind this scenario?", shortLabel: "The simple version", answer: lens.casualFanGuide, sources: lens.sources },
    "tactical-edge": { key: "tactical-edge", question: "Is either side a measured favourite?", shortLabel: "What is measured?", answer: "Neither side has a measured advantage. The story compares authored styles; no probabilities, rankings, or strength scores are supplied.", sources: [] },
    "what-could-go-wrong": { key: "what-could-go-wrong", question: "What would change the scenario?", shortLabel: "Question the assumptions", answer: "Changing either team’s assigned style changes this scenario. The commentary describes those assumptions, not observed performance.", bullets: ["Treat the styles as design inputs.", "Keep missing evidence marked unknown.", "No prediction has been tested."], sources: [] },
  };
}
export const cachedAnswers: Record<string, Partial<Record<PresetQuestionKey, MatchQuestionAnswer>>> = Object.fromEntries(matches.map(({ id }) => [id, buildIllustrativeAnswers(cachedLenses[id])]));
