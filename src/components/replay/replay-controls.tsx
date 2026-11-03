import Link from "next/link";
import type { ReplaySelection } from "@/lib/replay";
import { DEFAULT_ARCHIVE_DATE, DEFAULT_ILLUSTRATIVE_DATE, REPLAY_MIN_DATE, REPLAY_MAX_DATE, replayHref } from "@/lib/replay";
import { Button } from "@/components/ui/button";
import { CURATED_DATES, DEFAULT_CURATED_DATE } from "@/lib/curated-history";
import { formatEventDate } from "@/lib/calendar-date";

export function ReplayControls({ selection, demoOnly = false }: { selection?: ReplaySelection; demoOnly?: boolean }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm" aria-label="Replay selection">
      <h2 className="text-lg font-semibold">Explore history & the fictional lab</h2>
      <p className="mt-1 text-sm text-slate-600">Curated dates preserve the source’s local event day; kickoff times are not supplied. Archive and fictional timestamps use America/Los_Angeles. This is not a live feed.</p>
      <form key={`${selection?.mode}-${selection?.date}`} action="/" method="get" className="mt-4 flex flex-wrap items-end gap-4">
        <label className="grid min-w-0 max-w-full gap-1 text-sm font-medium">
          Dataset
          <select name="mode" defaultValue={selection?.mode ?? (demoOnly ? "curated" : "archive")} className="min-w-0 max-w-full rounded-lg border bg-white px-3 py-2">
            <option value="curated">Curated — five historical matches</option>
            <option value="illustrative">Illustrative — fictional AI lab</option>
            {!demoOnly && <option value="archive">Archive — provider records</option>}
          </select>
        </label>
        <label className="grid min-w-0 max-w-full gap-1 text-sm font-medium">
          Replay date
          <input type="date" name="date" required min={REPLAY_MIN_DATE} max={REPLAY_MAX_DATE}
            defaultValue={selection?.date ?? (demoOnly ? DEFAULT_CURATED_DATE : DEFAULT_ARCHIVE_DATE)} className="rounded-lg border px-3 py-2" />
        </label>
        <Button type="submit" className="bg-emerald-700">Browse matches</Button>
      </form>
      <nav aria-label="Curated historical dates" className="mt-4 flex flex-wrap gap-3 text-sm text-emerald-800 underline">
        {CURATED_DATES.map(date => <Link key={date} href={replayHref({ mode: "curated", date })} aria-current={selection?.mode === "curated" && selection.date === date ? "date" : undefined}>{formatEventDate(date)}</Link>)}
      </nav>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-emerald-800 underline">
        {!demoOnly && <Link href={replayHref({ mode: "archive", date: DEFAULT_ARCHIVE_DATE })}>July 11 archive</Link>}
        <Link href={replayHref({ mode: "illustrative", date: "2026-06-12" })}>Second demo date</Link>
        <Link href="/about">How this works</Link>
        <Link href={replayHref({ mode: "illustrative", date: DEFAULT_ILLUSTRATIVE_DATE })}>Fictional AI lab · first demo date</Link>
      </div>
    </section>
  );
}

export function ReplayNotice({ selection }: { selection: ReplaySelection }) {
  if (selection.mode === "curated") return <aside className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
    <p className="font-semibold">Curated World Cup history · {formatEventDate(selection.date)}</p>
    <p>Five independently selected results, attributed to primary sources. Commentary is original retrospective editorial context, not an output of the Match Lens pipeline or a pre-match forecast. This selection is not a complete tournament archive or an open-data release.</p>
  </aside>;
  return (
    <aside className={`rounded-2xl border p-4 text-sm leading-6 ${selection.mode === "illustrative" ? "border-amber-300 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
      <p className="font-semibold">{selection.mode === "illustrative" ? "Illustrative examples — synthetic, not verified historical fixtures" : "Historical archive — stored API-FOOTBALL fixtures"} · {selection.date}</p>
      <p>{selection.mode === "illustrative"
        ? "All teams, locations, styles, and commentary shown here are newly authored fiction. No official World Cup fixture, result, national flag, or provider record is represented."
        : "Fixture fields are stored provider records, not independently verified facts. Venue, stage, flags/codes, and results may be inconsistent. AI commentary is a separate, unverified retrospective interpretation. Its generation time and pre-kickoff information cutoff are unverified; it is not an authenticated historical forecast. Commentary may rely on placeholder metrics. Snippets are not claim-level proof. The selected date is a fixture day, not a historical knowledge cutoff."}</p>
    </aside>
  );
}

export function ReplayState({ title, children }: { title: string; children: React.ReactNode }) {
  return <section role="status" className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-2 text-sm leading-6 text-slate-600">{children}</div></section>;
}
