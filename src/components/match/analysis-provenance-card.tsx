import { analysisProvenance } from "@/lib/analysis-presentation";
import type { DatasetMode } from "@/lib/replay";
import type { Match } from "@/lib/types";

export function AnalysisProvenanceCard({ mode, match, cacheUpdatedAt }: {
  mode: DatasetMode;
  match: Match;
  cacheUpdatedAt?: string | null;
}) {
  const metadata = analysisProvenance({ mode, matchEventAt: match.kickoffAt, cacheUpdatedAt });
  return (
    <aside className="rounded-3xl border bg-white p-5 text-sm text-slate-600">
      <h2 className="mb-3 font-semibold text-slate-950">Commentary provenance</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div><dt className="font-medium">Recorded kickoff / event reference</dt><dd>{metadata.matchEventAt ?? "Unknown"}</dd></div>
        <div><dt className="font-medium">Cache last updated (not generation time)</dt><dd>{metadata.cacheUpdatedAt ?? "Unknown"}</dd></div>
        <div><dt className="font-medium">Analysis generation time</dt><dd>Unknown</dd></div>
        <div><dt className="font-medium">Historical knowledge cutoff</dt><dd>Unknown — not an authenticated pre-kickoff forecast</dd></div>
        <div><dt className="font-medium">Source publication / capture times</dt><dd>Unknown</dd></div>
        <div><dt className="font-medium">Dataset version</dt><dd>Unknown</dd></div>
      </dl>
      <p className="mt-3">Stored wording is preserved and may rely on placeholder inputs. Neither this replay date nor a cache timestamp verifies the commentary.</p>
    </aside>
  );
}
