import type { CuratedMatch } from "../lib/curated-history";

export const CURATED_DATASET_VERSION = "wcl-curated-2026-v1";
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
      headline: "A group-stage win to begin the selection",
      paragraphs: [
        "Mexico finished this Group A match with a 2–0 win over South Africa. The two-goal margin and South Africa's zero are facts of the final result, rather than a rating of either team's overall quality.",
        "Group-stage results belong to a different context from knockout eliminations. This record captures one completed fixture; it does not reconstruct the group table or claim qualification from this result alone.",
        "Read this as a retrospective starting point for the tournament. The reviewed facts establish the date, stage, venue and outcome, while the source report is available for further reading.",
      ],
    },
  },
  {
    ...common, id: "usa-paraguay-2026-06-12", homeTeam: "USA", awayTeam: "Paraguay",
    eventDate: "2026-06-12", stage: "Group D", venue: "Los Angeles Stadium",
    finalScore: { home: 4, away: 1 }, afterExtraTime: false,
    source: { ...evidence, identity: "FIFA Training Centre", url: "https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M04-USA-V-PAR.pdf", accessMethod: "direct-pdf", publicationDate: null },
    editorial: {
      headline: "A high-scoring result in Group D",
      paragraphs: [
        "The USA's 4–1 win over Paraguay is the highest-scoring fixture in this five-match selection. Both sides scored, with a three-goal gap at the finish.",
        "The score makes this a useful contrast with the narrower knockout results elsewhere in the selection. It does not, by itself, explain chance quality, possession or the tactics behind the goals.",
        "The event date is June 12 as recorded in the official post-match report. This dataset preserves that day without inventing a kickoff clock time or converting it to another calendar day.",
      ],
    },
  },
  {
    ...common, id: "norway-england-2026-07-11", homeTeam: "Norway", awayTeam: "England",
    eventDate: "2026-07-11", stage: "Quarter-final", venue: "Miami Stadium",
    finalScore: { home: 1, away: 2 }, afterExtraTime: true,
    source: { ...evidence, identity: "FIFA", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums", accessMethod: "indexed-official-page", publicationDate: null },
    editorial: {
      headline: "An extra-time quarter-final with a one-goal margin",
      paragraphs: [
        "England's 2–1 quarter-final victory over Norway secured progression to the semi-final. Unlike a group fixture, this result decided which side continued in the knockout competition.",
        "The AET label matters: the displayed final score includes extra time. The regulation-time score is not part of this curated record, and no penalty-shootout breakdown is inferred.",
        "A one-goal margin describes the outcome, not a measured prediction or proof of tactical superiority. This commentary was authored retrospectively from the reviewed facts; it was not produced by the application's Match Lens pipeline.",
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
      headline: "A second extra-time quarter-final on the selected day",
      paragraphs: [
        "Argentina beat Switzerland 3–1 after extra time in the quarter-final at Kansas City Stadium. That result moved Argentina into the semi-final and ended Switzerland's run at this stage.",
        "The two-goal final margin includes extra time. Comparing it with Norway–England's one-goal finish is a comparison of final outcomes, not evidence that either match was easier or more one-sided.",
        "Event day and publication day are kept separate. July 11 follows FIFA's explicit local match-day description; the later article date is source metadata rather than a replacement event date.",
      ],
    },
  },
  {
    ...common, id: "spain-argentina-2026-07-19", homeTeam: "Spain", awayTeam: "Argentina",
    eventDate: "2026-07-19", stage: "Final", venue: "New York New Jersey Stadium",
    finalScore: { home: 1, away: 0 }, afterExtraTime: true,
    source: { ...evidence, identity: "FIFA", url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights", accessMethod: "indexed-official-page", publicationDate: "2026-07-19" },
    editorial: {
      headline: "The final, settled after extra time",
      paragraphs: [
        "Spain's 1–0 victory over Argentina in the final settled the title. The final provides the endpoint of this deliberately small historical selection, rather than a complete account of the tournament.",
        "AET records that extra time was played and is included in the final result. The score is preserved without adding an uncurated goal minute, player attribution or regulation-time breakdown.",
        "The outcome is verified against the credited source. This original retrospective context explains how to read that outcome; it supplies no predictive probabilities, player ratings or tactical measurements.",
      ],
    },
  },
];
