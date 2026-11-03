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
import { formatKickoff } from "@/lib/lens";
import { findReplayMatch, parseReplaySelection, replayHref, replayScore, replayStatus, stageLabel, type ReplaySearchParams } from "@/lib/replay";
import { loadSelectedReplay, loadSelectedAnswers } from "@/lib/replay-access";
import { deploymentMode } from "@/lib/deployment-mode";

type MatchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<ReplaySearchParams>;
};

export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  const { id } = await params;
  const deployment = deploymentMode();
  const parsed = parseReplaySelection(await searchParams, deployment);
  if (!parsed.ok) {
    return <AppShell><div className="mx-auto max-w-7xl space-y-6"><ReplayControls demoOnly={deployment === "demo-only"} /><ReplayState title={parsed.reason === "disabled" ? "Archive disabled in public demo" : "Invalid replay selection"}>{parsed.message}</ReplayState></div></AppShell>;
  }
  const { selection } = parsed;
  const result = await loadSelectedReplay(selection);
  const viewModel = findReplayMatch(result, id);
  const back = <Button asChild variant="ghost"><Link href={replayHref(selection)}><ArrowLeft className="mr-2 size-4" />Back to selected matches</Link></Button>;
  if (!viewModel) {
    return <AppShell><div className="mx-auto max-w-7xl space-y-6">{back}<ReplayNotice selection={selection} /><ReplayState title={result.state === "error" ? (selection.mode === "archive" ? "Archive could not be loaded" : "Illustrative examples unavailable") : "Match not found in this selection"}>
      {result.state === "error" ? (selection.mode === "archive" ? "The archive query failed. Retry from the selected match listing. No illustrative data has been substituted." : "The local sample dataset could not be validated. No external service was requested.") : "This match is not present in the selected dataset and Los Angeles calendar date. Return to the listing to choose a match."}
    </ReplayState></div></AppShell>;
  }
  const { match, homeTeam, awayTeam, venue, lens } = viewModel;
  const policy = analysisPresentation(selection.mode);
  const cached = await loadSelectedAnswers(selection, match.id);
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        {back}
        <ReplayNotice selection={selection} />
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{stageLabel(match.group)}</Badge>
            <Badge variant="outline">{replayStatus(match, selection.mode)}</Badge>
          </div>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <TeamHero flag={homeTeam.flag} name={homeTeam.name} code={homeTeam.code} />
            <div className="rounded-2xl bg-slate-100 px-3 py-3 text-center text-xs font-bold text-slate-600 sm:text-sm">{replayScore(match, selection.mode)}</div>
            <TeamHero flag={awayTeam.flag} name={awayTeam.name} code={awayTeam.code} align="right" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
            <span>{formatKickoff(match.kickoffAt)}</span>
            <span className="flex items-center gap-1"><MapPin className="size-4" />{venue.name}, {venue.city}</span>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">{selection.mode === "illustrative" ? "Authored fictional scenario. No real event or outcome is represented." : "Recorded data only. Unverified intermediate scores are not displayed as final results."}</p>
        </section>
        {lens ? <>
          <p className="text-sm font-semibold text-emerald-800">{policy.label}</p>
          <AnalysisProvenanceCard mode={selection.mode} match={match} cacheUpdatedAt={viewModel.lensCacheUpdatedAt} />
          <MatchForecastCard lens={lens} />
          <section><h2 className="mb-4 text-2xl font-semibold tracking-tight">{lens.headline}</h2>
            <MatchLensCards lens={lens} mode={selection.mode} />
          </section>
        </> : <ReplayState title="Cached Match Lens unavailable">Stored fixture details are shown above. Cached analysis is missing, incompatible, or temporarily unavailable for this match; opening this page does not generate new content.</ReplayState>}
        {cached.failed ? <ReplayState title="Cached questions unavailable">The question cache could not be read. Fixture details and available analysis remain above.</ReplayState>
          : cached.answers.length ? <MatchQa answers={cached.answers} mode={selection.mode} /> : <p className="text-sm text-slate-500">No cached questions are available for this match.</p>}
      </div>
    </AppShell>
  );
}

function TeamHero({ flag, name, code, align = "left" }: { flag: string; name: string; code: string; align?: "left" | "right" }) {
  return <div className={align === "right" ? "text-right" : ""}><div className="text-5xl sm:text-7xl">{flag}</div><h1 className="mt-3 text-lg font-bold tracking-tight sm:text-3xl">{name}</h1><p className="mt-1 text-sm font-medium tracking-wide text-slate-500">{code}</p></div>;
}
