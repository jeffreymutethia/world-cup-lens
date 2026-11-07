import { Suspense } from "react";
import { ReplayLoading } from "@/components/replay/replay-loading";
import type { Metadata } from "next";
import { historicalMatchMetadata } from "@/lib/match-metadata";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AnalysisProvenanceCard } from "@/components/match/analysis-provenance-card";
import { analysisPresentation } from "@/lib/analysis-presentation";
import { MatchForecastCard } from "@/components/match/match-forecast-card";
import { MatchLensCards } from "@/components/match/match-lens-cards";
import { MatchQa } from "@/components/match/match-qa";
import { ReplayControls, ReplayNotice, ReplayState } from "@/components/replay/replay-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKickoff } from "@/lib/format-kickoff";
import { findReplayMatch, parseReplaySelection, replayHref, replayScore, replayStatus, stageLabel, type ReplaySearchParams, type LegacyReplaySelection } from "@/lib/replay";
import { loadSelectedReplay, loadSelectedAnswers } from "@/lib/replay-access";
import { deploymentMode } from "@/lib/deployment-mode";
import { findCuratedMatch, curatedHref, curatedMatchHref, parseCuratedReturn } from "@/lib/curated-history";
import { CuratedMatchDetail } from "@/components/match/curated-match";

type MatchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<ReplaySearchParams>;
};

export async function generateMetadata({ params, searchParams }: MatchPageProps): Promise<Metadata> {
  const [{ id }, query] = await Promise.all([params,searchParams]);
  return historicalMatchMetadata(id,query,deploymentMode());
}

export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  const { id } = await params;
  const deployment = deploymentMode();
  const query = await searchParams;
  if (query.mode === "illustrative") redirect("/?mode=curated");
  const parsed = parseReplaySelection(query, deployment);
  if (!parsed.ok) {
    return <AppShell><div className="mx-auto max-w-7xl space-y-6"><ReplayControls demoOnly={deployment === "demo-only"} /><ReplayState level={1} title={parsed.reason === "disabled" ? "Archive disabled in public demo" : "Invalid replay selection"}>{parsed.message}</ReplayState></div></AppShell>;
  }
  const { selection } = parsed;
  if (selection.mode === "curated") {
    const match = findCuratedMatch(id);
    if (!match) notFound();
    const hasListState = ["date","stage","team","q","page"].some(key => query[key] !== undefined);
    const returned = parseCuratedReturn(query, hasListState ? selection : { date: match.eventDate });
    if (!returned.ok) return <AppShell><ReplayState level={1} title="Invalid return selection">{returned.message} <Link className="text-link" href={curatedHref({ date: match.eventDate })}>Browse this matchday</Link></ReplayState></AppShell>;
    if (selection.date !== match.eventDate || selection.stage || selection.team || selection.q || selection.page) redirect(curatedMatchHref(match, returned.filters));
    return <AppShell><div className="mx-auto max-w-7xl space-y-6">
      <nav aria-label="Breadcrumb" className="match-breadcrumb"><Link href={curatedHref(returned.filters)}><ArrowLeft size={14} aria-hidden="true" />Matches</Link>{match && <><span aria-hidden="true">/</span><span>{match.homeTeam} vs {match.awayTeam}</span></>}</nav>
      <CuratedMatchDetail match={match} filters={returned.filters} />
    </div></AppShell>;
  }

  return <Suspense fallback={<ReplayLoading />}><PrivateMatch id={id} selection={selection} /></Suspense>;
}

async function PrivateMatch({ id, selection }: { id: string; selection: LegacyReplaySelection }) {
  const result = await loadSelectedReplay(selection);
  const viewModel = findReplayMatch(result, id);
  const back = <Button asChild variant="ghost"><Link href={replayHref(selection)}><ArrowLeft className="mr-2 size-4" />Back to matches</Link></Button>;
  if (!viewModel) {
    return <AppShell section="archive"><div className="mx-auto max-w-7xl space-y-6">{back}<ReplayNotice selection={selection} /><ReplayState level={1} title={result.state === "error" ? "Archive could not be loaded" : "Match not found in this selection"}>
      {result.state === "error" ? "The archive could not be read. Return to the match listing to try again; no other dataset has been substituted." : "This match is not in the selected collection and Los Angeles date. Return to the listing to choose a match."}
    </ReplayState></div></AppShell>;
  }
  const { match, homeTeam, awayTeam, venue, lens } = viewModel;
  const policy = analysisPresentation(selection.mode);
  const cached = await loadSelectedAnswers(selection, match.id);
  return (
    <AppShell section="archive">
      <div className="mx-auto max-w-7xl space-y-6">
        {back}
        <ReplayNotice selection={selection} />
        <h1 className="collection-detail-heading">{homeTeam.name} vs {awayTeam.name}</h1>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{stageLabel(match.group)}</Badge>
            <Badge variant="outline">{replayStatus(match, selection.mode)}</Badge>
          </div>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-8">
            <TeamHero flag={homeTeam.flag} name={homeTeam.name} code={homeTeam.code} />
            <div className="max-w-16 rounded-2xl bg-slate-100 px-3 py-3 text-center text-xs font-bold text-slate-600 sm:max-w-none sm:text-sm">{replayScore(match, selection.mode)}</div>
            <TeamHero flag={awayTeam.flag} name={awayTeam.name} code={awayTeam.code} align="right" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
            <span>{formatKickoff(match.kickoffAt)}</span>
            <span className="flex items-center gap-1"><MapPin className="size-4" />{venue.name}, {venue.city}</span>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">Recorded data only. Unverified intermediate scores are not displayed as final results.</p>
        </section>
        {lens ? <>
          <p className="text-sm font-semibold text-emerald-800">{policy.label}</p>
          <AnalysisProvenanceCard mode={selection.mode} match={match} cacheUpdatedAt={viewModel.lensCacheUpdatedAt} />
          <MatchForecastCard lens={lens} />
          <section><h2 className="mb-4 text-2xl font-semibold tracking-tight">{lens.headline}</h2>
            <MatchLensCards lens={lens} mode={selection.mode} />
          </section>
        </> : <ReplayState title="Cached Match Lens unavailable">The match record is available above. Stored commentary is missing or unavailable; this page does not generate new analysis.</ReplayState>}
        {cached.failed ? <ReplayState title="Cached questions unavailable">Stored questions could not be read. The match record and available commentary remain above.</ReplayState>
          : cached.answers.length ? <MatchQa answers={cached.answers} mode={selection.mode} /> : <p className="text-sm text-slate-500">No cached questions are available for this match.</p>}
      </div>
    </AppShell>
  );
}

function TeamHero({ flag, name, code, align = "left" }: { flag: string; name: string; code: string; align?: "left" | "right" }) {
  return <div className={`min-w-0 break-words ${align === "right" ? "text-right" : ""}`}><div className="text-4xl sm:text-7xl">{flag}</div><h2 className="mt-3 text-base font-bold tracking-tight sm:text-3xl">{name}</h2><p className="mt-1 text-sm font-medium tracking-wide text-slate-500">{code}</p></div>;
}
