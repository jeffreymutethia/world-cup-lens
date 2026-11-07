import Link from "next/link";
import type { ReplaySelection } from "@/lib/replay";
import { DEFAULT_ARCHIVE_DATE, REPLAY_MIN_DATE, REPLAY_MAX_DATE, replayHref } from "@/lib/replay";
import { Button } from "@/components/ui/button";
import { formatMatchDay } from "@/lib/calendar-date";

// Public filters live with CuratedHome. This form belongs only to the private archive.
export function ReplayControls({ selection, demoOnly = true }: { selection?: ReplaySelection; demoOnly?: boolean }) {
  if (selection?.mode === "curated" || (!selection && demoOnly)) return <nav aria-label="Historical collection"><Link href="/" className="text-link">Browse all World Cup matches</Link></nav>;
  return <section className="selection-panel" aria-label="Replay selection">
    <form key={selection?.date} action="/" method="get" className="selection-form">
      <input type="hidden" name="mode" value="archive" />
      <label>Date<input type="date" name="date" required min={REPLAY_MIN_DATE} max={REPLAY_MAX_DATE} defaultValue={selection?.date ?? DEFAULT_ARCHIVE_DATE} /></label>
      <Button type="submit" className="bg-emerald-800">Show private archive</Button>
    </form>
    <nav aria-label="More dates" className="selection-links">
      <Link href={replayHref({ mode: "archive", date: DEFAULT_ARCHIVE_DATE })}>11 July archive</Link>
      <Link href="/">World Cup matches</Link>
    </nav>
  </section>;
}

export function ReplayNotice({ selection }: { selection: ReplaySelection }) {
  if (selection.mode === "curated") return null;
  return <aside className="collection-notice">
    <p><strong>Private provider archive</strong> · {formatMatchDay(selection.date)}</p>
    <p>Stored API-FOOTBALL records and cached AI commentary. Match fields and source cutoffs are unverified; commentary is retrospective, not an authenticated forecast. <Link href="/about">Source and methodology notes</Link></p>
  </aside>;
}

export function ReplayState({ title, children, level = 2 }: { title: string; children: React.ReactNode; level?: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2";
  return <section role="status" className="state-panel"><Heading>{title}</Heading><div>{children}</div></section>;
}
