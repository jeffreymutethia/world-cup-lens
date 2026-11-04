import type { CuratedMatch } from "../lib/curated-history";

export const CURATED_DATASET_VERSION = "wcl-curated-2026-v2";
export const CURATED_PUBLICATION = {
  decision: "OWNER_DIRECTED_EDITORIAL_RELEASE",
  reviewedOn: "2026-11-03",
  datasetVersion: CURATED_DATASET_VERSION,
  evidence: "docs/curated-history-review.md",
  openDataLicense: false,
  trademarkClearance: "UNRESOLVED",
} as const;

const unknowns = {
  kickoffAt: null, lineups: null, goalMinutes: null, formations: null,
  possession: null, playerStatistics: null, regulationScore: null,
  sourceCapturedAt: null, analysisGeneratedAt: null, historicalKnowledgeCutoff: null,
} as const;
const evidence = { accessedOn: "2026-11-03", reviewedOn: "2026-11-03" };
const common = {
  datePrecision: "day", dateBasis: "source-local-event-day",
  datasetVersion: CURATED_DATASET_VERSION,
  publicationDecision: CURATED_PUBLICATION.decision,
  commentaryOrigin: "authored-retrospective-editorial",
  unknowns,
} as const;

// Five independently selected factual records, not a provider export or article copy.
// Array order is editorial display order, never a claim about kickoff sequence.
export const curatedMatches: readonly CuratedMatch[] = [
  {
    ...common, id: "mexico-south-africa-2026-06-11", homeTeam: "Mexico", awayTeam: "South Africa",
    eventDate: "2026-06-11", stage: "Group A", venue: "Mexico City Stadium",
    finalScore: { home: 2, away: 0 }, afterExtraTime: false,
    source: { ...evidence, identity: "FIFA", url: "https://fdp.fifa.org/assetspublic/ce281/r12452/pdf/FullTimeMatchReport-English.pdf", accessMethod: "direct-pdf", publicationDate: null },
    editorial: {
      headline: "Mexico won in Group A",
      paragraphs: [
        "Mexico beat South Africa 2–0 in Group A at Mexico City Stadium.",
        "The match opens this selection of five results, which spans the group stage, two quarter-finals and the final.",
      ],
    },
  },
  {
    ...common, id: "usa-paraguay-2026-06-12", homeTeam: "USA", awayTeam: "Paraguay",
    eventDate: "2026-06-12", stage: "Group D", venue: "Los Angeles Stadium",
    finalScore: { home: 4, away: 1 }, afterExtraTime: false,
    source: { ...evidence, identity: "FIFA Training Centre", url: "https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M04-USA-V-PAR.pdf", accessMethod: "direct-pdf", publicationDate: null },
    editorial: {
      headline: "USA won in Group D",
      paragraphs: [
        "USA beat Paraguay 4–1 in Group D at Los Angeles Stadium.",
        "The five-goal match is the highest-scoring game in this selection. The result is recorded on June 12, the event day given in the official report.",
      ],
    },
  },
  {
    ...common, id: "norway-england-2026-07-11", homeTeam: "Norway", awayTeam: "England",
    eventDate: "2026-07-11", stage: "Quarter-final", venue: "Miami Stadium",
    finalScore: { home: 1, away: 2 }, afterExtraTime: true,
    source: { ...evidence, identity: "FIFA", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums", accessMethod: "indexed-official-page", publicationDate: null },
    editorial: {
      headline: "England advanced after extra time",
      paragraphs: [
        "England beat Norway 2–1 after extra time in the quarter-final, reaching the semi-finals. Norway’s tournament ended at this stage.",
        "Both quarter-finals in this selection went to extra time. Argentina also advanced on July 11, beating Switzerland 3–1.",
      ],
    },
  },
  {
    ...common, id: "argentina-switzerland-2026-07-11", homeTeam: "Argentina", awayTeam: "Switzerland",
    eventDate: "2026-07-11", stage: "Quarter-final", venue: "Kansas City Stadium",
    finalScore: { home: 3, away: 1 }, afterExtraTime: true,
    source: { ...evidence, identity: "FIFA", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/argentina-switzerland-match-report-highlights", accessMethod: "indexed-official-page", publicationDate: "2026-07-12" },
    evidenceNote: "FIFA identifies July 11 as the local match day; its report is published July 12. UEFA lists July 12. The source date convention differs; no kickoff or timezone explanation is inferred here.",
    editorial: {
      headline: "Argentina advanced after extra time",
      paragraphs: [
        "Argentina beat Switzerland 3–1 after extra time in the quarter-final at Kansas City Stadium, reaching the semi-finals.",
        "England also advanced on the selected day. The two quarter-final results are shown together; they are not a complete record of the knockout round.",
      ],
    },
  },
  {
    ...common, id: "spain-argentina-2026-07-19", homeTeam: "Spain", awayTeam: "Argentina",
    eventDate: "2026-07-19", stage: "Final", venue: "New York New Jersey Stadium",
    finalScore: { home: 1, away: 0 }, afterExtraTime: true,
    source: { ...evidence, identity: "FIFA", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights", accessMethod: "indexed-official-page", publicationDate: "2026-07-19" },
    editorial: {
      headline: "Spain won the final after extra time",
      paragraphs: [
        "Spain beat Argentina 1–0 after extra time in the final at New York New Jersey Stadium.",
        "The final closes this five-match selection. The score includes extra time; a regulation-time breakdown is not recorded here.",
      ],
    },
  },
];
