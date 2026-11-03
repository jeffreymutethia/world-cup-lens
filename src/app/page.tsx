import { AppShell } from "@/components/layout/app-shell";
import { FeaturedMatchCard } from "@/components/match/featured-match-card";
import { MatchCard } from "@/components/match/match-card";
import { ReplayControls, ReplayNotice, ReplayState } from "@/components/replay/replay-controls";
import { parseReplaySelection, type ReplaySearchParams } from "@/lib/replay";
import { loadSelectedReplay } from "@/lib/replay-access";
import { deploymentMode } from "@/lib/deployment-mode";

export default async function Home({ searchParams }: { searchParams: Promise<ReplaySearchParams> }) {
  const deployment = deploymentMode();
  const demoOnly = deployment === "demo-only";
  const parsed = parseReplaySelection(await searchParams, deployment);
  if (!parsed.ok) {
    return <AppShell><div className="mx-auto max-w-7xl space-y-6"><ReplayControls demoOnly={demoOnly} /><ReplayState title={parsed.reason === "disabled" ? "Archive disabled in public demo" : "Invalid replay selection"}>{parsed.message}</ReplayState></div></AppShell>;
  }
  const { selection } = parsed;
  const result = await loadSelectedReplay(selection);
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <ReplayControls selection={selection} demoOnly={demoOnly} />
        <ReplayNotice selection={selection} />
        {result.state === "error" ? (
          <ReplayState title={selection.mode === "archive" ? "Archive could not be loaded" : "Illustrative examples unavailable"}>{selection.mode === "archive" ? "The stored fixtures or cached analysis could not be read. Retry this selection or explicitly open illustrative examples above. No demo matches have been substituted." : "The local sample dataset could not be validated. No external service was requested. Return to the demo after the sample data has been repaired."}</ReplayState>
        ) : result.state === "empty" ? (
          <ReplayState title={selection.mode === "archive" ? "No archived matches for this date" : "No illustrative examples for this date"}>
            {selection.mode === "archive" ? "The archive query succeeded but returned no fixtures for this Los Angeles calendar day. The stored dataset may be incomplete. Choose another date; no demo matches have been substituted." : "Try June 11 or June 12 to explore the existing demo fixtures."}
          </ReplayState>
        ) : (
          <>
            {result.matches.some(({ lensState }) => lensState === "unavailable" || lensState === "invalid") &&
              <ReplayState title="Some cached analysis is unavailable">Stored fixtures remain available below. Missing or incompatible analysis has not been regenerated.</ReplayState>}
            <FeaturedMatchCard {...result.featured} selection={selection} />
            <section className="rounded-3xl bg-white/70 p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">{selection.mode === "archive" ? "Archived matches" : "Illustrative matches"} · {selection.date}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.matches.map((viewModel) => <MatchCard key={viewModel.match.id} {...viewModel} selection={selection} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
