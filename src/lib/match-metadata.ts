import type { Metadata } from "next";
import { curatedCanonicalPath, curatedScore, findCuratedMatch, matchLensLabel, parseCuratedReturn } from "./curated-history";
import { formatMatchDay } from "./calendar-date";
import { parseReplaySelection, type ReplaySearchParams } from "./replay";
import type { DeploymentMode } from "./deployment-mode";

export const PUBLIC_SITE_ORIGIN = "https://world-cup-lens-one.vercel.app";
// Never echo requested IDs/queries or read private records while creating share/index metadata.
export function historicalMatchMetadata(id: string, params: ReplaySearchParams, deployment: DeploymentMode = "demo-only"): Metadata {
  const unavailable: Metadata = { title: "Match unavailable | World Cup Lens", description: "Independent, unofficial 2026 World Cup archive.", robots: { index: false, follow: false }, openGraph: null, alternates: { canonical: null } };
  const parsed = parseReplaySelection(params,deployment);
  if (!parsed.ok || parsed.selection.mode !== "curated") return unavailable;
  const match = findCuratedMatch(id);
  if (!match || !parseCuratedReturn(params,parsed.selection).ok) return unavailable;
  const title = `${match.homeTeam} ${curatedScore(match)} ${match.awayTeam} | World Cup Lens`;
  const method = match.penaltyShootout ? `; shootout ${match.penaltyShootout.home}–${match.penaltyShootout.away}` : match.afterExtraTime ? " after extra time" : "";
  const description = `${match.stage}, ${formatMatchDay(match.eventDate)} · ${match.venue}. ${match.homeTeam} ${curatedScore(match)} ${match.awayTeam}${method}. ${matchLensLabel(match)} in an unofficial archive.`;
  const canonical = PUBLIC_SITE_ORIGIN + curatedCanonicalPath(match);
  return { title, description, alternates: { canonical }, openGraph: { type: "website", locale: "en_GB", siteName: "World Cup Lens · Unofficial archive", title, description, url: canonical } };
}
