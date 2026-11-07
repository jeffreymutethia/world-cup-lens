import records from "./curated-records.json";
import extendedLenses from "./curated-lenses.json";
import type { CuratedMatch, EditorialSource, MatchStage, RetrospectiveLens } from "../lib/curated-contract";

export const CURATED_DATASET_VERSION = "wcl-curated-2026-v3";
export const CURATED_PUBLICATION = {
  decision: "OWNER_DIRECTED_EDITORIAL_RELEASE", reviewedOn: "2026-11-07",
  datasetVersion: CURATED_DATASET_VERSION, evidence: "docs/curated-history-review.md",
  openDataLicense: false, trademarkClearance: "UNRESOLVED",
} as const;
const unknowns = { kickoffAt: null, lineups: null, goalMinutes: null, formations: null, possession: null, playerStatistics: null, regulationScore: null, sourceCapturedAt: null, analysisGeneratedAt: null, historicalKnowledgeCutoff: null } as const;
type AuthoredLens = Omit<RetrospectiveLens, "depth"> & { sources: EditorialSource[] };
const deeper = extendedLenses as Record<string, AuthoredLens>;

// Independently curated facts and original commentary, not provider payloads or cached AI output.
// Baseline context is computed only from this reviewed result set; it adds no tactical/event claims.
export const curatedMatches: readonly CuratedMatch[] = records.map(record => {
  const winner = record.advancingTeam;
  const group = record.stage.startsWith("Group ");
  const earlier = records.filter(m => m.stage === record.stage && m.matchNumber < record.matchNumber && (m.homeTeam === record.homeTeam || m.awayTeam === record.homeTeam));
  const groupRound = earlier.length + 1;
  const next = winner ? records.find(m => m.matchNumber > record.matchNumber && m.stage !== "Third-place" && (m.homeTeam === winner || m.awayTeam === winner)) : undefined;
  const outcome = record.penaltyShootout ? `a ${record.penaltyShootout.home}–${record.penaltyShootout.away} penalty shootout` : record.afterExtraTime === true ? "extra time" : record.afterExtraTime === false ? "normal time" : "a completed match whose extra-time status is not established";
  const headline = group ? record.finalScore.home === record.finalScore.away ? `A point each in ${record.stage}` : `${record.finalScore.home > record.finalScore.away ? record.homeTeam : record.awayTeam} took three points` : record.stage === "Final" ? `${winner} won the World Cup` : record.stage === "Third-place" ? `${winner} finished third` : `${winner} advanced`;
  const groupContext = [record.homeTeam,record.awayTeam].map(team => {
    const played = records.filter(m => m.stage === record.stage && m.matchNumber <= record.matchNumber && [m.homeTeam,m.awayTeam].includes(team));
    const points = played.reduce((total,m) => { const home=m.homeTeam===team; const own=home?m.finalScore.home:m.finalScore.away; const against=home?m.finalScore.away:m.finalScore.home; return total+(own>against?3:own===against?1:0); },0);
    const following = records.find(m => m.matchNumber > record.matchNumber && [m.homeTeam,m.awayTeam].includes(team));
    return `${team} had ${points} ${points===1?"point":"points"} after ${played.length} group ${played.length===1?"match":"matches"}. ${following ? `Their next fixture was against ${following.homeTeam===team?following.awayTeam:following.homeTeam} in ${following.stage}.` : "This was their final appearance in the tournament."}`;
  }).join(" ");
  const context: RetrospectiveLens = {
    depth: "context", headline,
    overview: group ? `The ${record.homeTeam}–${record.awayTeam} fixture was match ${groupRound} of three in ${record.stage} for ${record.homeTeam}.` : `${record.homeTeam} and ${record.awayTeam} met with ${record.stage === "Final" ? "the title" : record.stage === "Third-place" ? "third place" : "a place in the next round"} at stake. The tie was settled in ${outcome}.`,
    significance: group ? groupContext : next ? `${winner} went on to face ${next.homeTeam === winner ? next.awayTeam : next.homeTeam} in the ${next.stage.toLowerCase()}. Follow the team’s tournament below to place this result in context.` : record.stage === "Final" ? "This was the tournament’s 104th and final match. The result decided the championship." : record.stage === "Third-place" ? "The two losing semi-finalists met to decide third place. This result did not determine a place in the final." : "The winning team progressed; the other team’s tournament ended at this stage.",
    interpretation: [],
    uncertainty: ["The reviewed results establish the outcome and tournament context. No detailed account of the play is supplied for this match."],
  };
  const authored = deeper[record.id];
  const sources = [...record.sources as EditorialSource[]];
  if (authored) for (const source of authored.sources) if (!sources.some(s => s.url === source.url)) sources.push(source);
  const lens: RetrospectiveLens = authored ? { depth: "extended", headline: authored.headline, overview: authored.overview, significance: authored.significance, interpretation: authored.interpretation, developments: authored.developments, uncertainty: authored.uncertainty } : context;
  return { ...record, stage: record.stage as MatchStage,
    datePrecision: "day", dateBasis: "source-local-event-day", datasetVersion: CURATED_DATASET_VERSION,
    publicationDecision: CURATED_PUBLICATION.decision, commentaryOrigin: "authored-retrospective-editorial",
    source: sources[0], sources, editorial: { ...lens, depth: authored ? "extended" : "context" }, unknowns };
});
