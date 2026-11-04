import { AppShell } from "@/components/layout/app-shell";
import { FeaturedMatchCard } from "@/components/match/featured-match-card";
import { MatchCard } from "@/components/match/match-card";
import { ReplayControls, ReplayNotice, ReplayState } from "@/components/replay/replay-controls";
import { parseReplaySelection, type ReplaySearchParams } from "@/lib/replay";
import { loadSelectedReplay } from "@/lib/replay-access";
import { deploymentMode } from "@/lib/deployment-mode";
import { CuratedHome } from "@/components/replay/curated-home";

export default async function Home({ searchParams }: { searchParams: Promise<ReplaySearchParams> }) {
  const deployment = deploymentMode();
  const demoOnly = deployment === "demo-only";
  const parsed = parseReplaySelection(await searchParams, deployment);
  if (!parsed.ok) {
    return <AppShell><div className="mx-auto max-w-7xl space-y-6"><ReplayControls demoOnly={demoOnly} /><ReplayState level={1} title={parsed.reason === "disabled" ? "Archive disabled in public demo" : "Invalid replay selection"}>{parsed.message}</ReplayState></div></AppShell>;
  }
  const { selection } = parsed;
  if (selection.mode === "curated") return <AppShell><CuratedHome date={selection.date} /></AppShell>;
  const result = await loadSelectedReplay(selection);
  return (
    <AppShell section={selection.mode === "illustrative" ? "lab" : "archive"}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="collection-heading"><p className="eyebrow">{selection.mode === "illustrative" ? "Fictional demonstration" : "Private archive"}</p><h1>{selection.mode === "illustrative" ? "Fictional lab" : "Provider archive"}</h1><p>{selection.mode === "illustrative" ? "Three invented scenarios, with stored sample commentary and questions." : "Stored fixtures and cached analysis, kept separate from the selected public matches."}</p></div>
        <ReplayControls selection={selection} demoOnly={demoOnly} />
        <ReplayNotice selection={selection} />
        {result.state === "error" ? (
          <ReplayState title={selection.mode === "archive" ? "Archive could not be loaded" : "Illustrative examples unavailable"}>{selection.mode === "archive" ? "The archive could not be read. Try again or choose another collection; no fictional matches have been substituted." : "The sample records could not be loaded. No external service was requested."}</ReplayState>
        ) : result.state === "empty" ? (
          <ReplayState title={selection.mode === "archive" ? "No archived matches for this date" : "No illustrative examples for this date"}>
            {selection.mode === "archive" ? "No stored fixtures were found for this Los Angeles calendar day. The archive may be incomplete." : "Choose June 11 or June 12 for the fictional scenarios."}
          </ReplayState>
        ) : (
          <>
            {result.matches.some(({ lensState }) => lensState === "unavailable" || lensState === "invalid") &&
              <ReplayState title="Some cached analysis is unavailable">Match records are available below. Missing analysis has not been regenerated.</ReplayState>}
            <FeaturedMatchCard {...result.featured} selection={selection} />
            {result.matches.length > 1 && <section className="rounded-3xl bg-white/70 p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">{selection.mode === "archive" ? "Archived matches" : "More fictional scenarios"} · {selection.date}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.matches.filter(item => item.match.id !== result.featured.match.id).map((viewModel) => <MatchCard key={viewModel.match.id} {...viewModel} selection={selection} />)}
              </div>
            </section>}
          </>
        )}
      </div>
    </AppShell>
  );
}
