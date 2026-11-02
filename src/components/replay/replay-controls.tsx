import Link from "next/link";
import type { ReplaySelection } from "@/lib/replay";
import { DEFAULT_ARCHIVE_DATE, DEFAULT_ILLUSTRATIVE_DATE, REPLAY_MIN_DATE, REPLAY_MAX_DATE, replayHref } from "@/lib/replay";
import { Button } from "@/components/ui/button";

export function ReplayControls({ selection }: { selection?: ReplaySelection }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm" aria-label="Replay selection">
      <h2 className="text-lg font-semibold">Explore the 2026 archive</h2>
      <p className="mt-1 text-sm text-slate-600">Dates and kickoff times use America/Los_Angeles. Archived records are not a live feed.</p>
      <form key={`${selection?.mode}-${selection?.date}`} action="/" method="get" className="mt-4 flex flex-wrap items-end gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Dataset
          <select name="mode" defaultValue={selection?.mode ?? "archive"} className="rounded-lg border bg-white px-3 py-2">
            <option value="archive">Archive — provider records</option>
            <option value="illustrative">Illustrative — demo examples</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Replay date
          <input type="date" name="date" required min={REPLAY_MIN_DATE} max={REPLAY_MAX_DATE}
            defaultValue={selection?.date ?? DEFAULT_ARCHIVE_DATE} className="rounded-lg border px-3 py-2" />
        </label>
        <Button type="submit" className="bg-emerald-700">Browse matches</Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-emerald-800 underline">
        <Link href={replayHref({ mode: "archive", date: DEFAULT_ARCHIVE_DATE })}>July 11 archive</Link>
        <Link href={replayHref({ mode: "illustrative", date: DEFAULT_ILLUSTRATIVE_DATE })}>Open illustrative examples</Link>
      </div>
    </section>
  );
}

export function ReplayNotice({ selection }: { selection: ReplaySelection }) {
  return (
    <aside className={`rounded-2xl border p-4 text-sm leading-6 ${selection.mode === "illustrative" ? "border-amber-300 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
      <p className="font-semibold">{selection.mode === "illustrative" ? "Illustrative examples — not verified historical fixtures" : "Historical archive — stored API-FOOTBALL fixtures"} · {selection.date}</p>
      <p>{selection.mode === "illustrative"
        ? "Teams, venues, scores, and analysis in this mode are demo content and must not be treated as an authoritative historical record."
        : "Cached AI analysis is presented retrospectively. Its generation time and pre-kickoff information cutoff are unverified; it is not an authenticated historical forecast. Stored results may be incomplete."}</p>
    </aside>
  );
}

export function ReplayState({ title, children }: { title: string; children: React.ReactNode }) {
  return <section role="status" className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-2 text-sm leading-6 text-slate-600">{children}</div></section>;
}
