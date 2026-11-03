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
        <div><dt className="font-medium">{mode === "illustrative" ? "Scenario navigation time" : "Recorded kickoff / event reference"}</dt><dd>{metadata.matchEventAt ?? "Unknown"}</dd></div>
        <div><dt className="font-medium">Cache last updated (not generation time)</dt><dd>{metadata.cacheUpdatedAt ?? "Unknown"}</dd></div>
        <div><dt className="font-medium">Analysis generation time</dt><dd>{mode === "illustrative" ? "Not applicable — authored example" : "Unknown"}</dd></div>
        <div><dt className="font-medium">Historical knowledge cutoff</dt><dd>{mode === "illustrative" ? "Not applicable — fictional scenario" : "Unknown — not an authenticated pre-kickoff forecast"}</dd></div>
        <div><dt className="font-medium">Source publication / capture times</dt><dd>Unknown</dd></div>
        <div><dt className="font-medium">Dataset version</dt><dd>{metadata.datasetVersion ?? "Unknown"}</dd></div>
      </dl>
      <p className="mt-3">{mode === "illustrative" ? "Original scenario copy, not a model response or a claim about real football. Dates are navigation examples only." : "Stored wording is preserved and may rely on placeholder inputs. Neither this replay date nor a cache timestamp verifies the commentary."}</p>
    </aside>
  );
}
