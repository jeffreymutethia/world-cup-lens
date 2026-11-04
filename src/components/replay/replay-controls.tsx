import Link from "next/link";
import type { ReplaySelection } from "@/lib/replay";
import { DEFAULT_ARCHIVE_DATE, DEFAULT_ILLUSTRATIVE_DATE, REPLAY_MIN_DATE, REPLAY_MAX_DATE, replayHref } from "@/lib/replay";
import { Button } from "@/components/ui/button";
import { CURATED_DATES, DEFAULT_CURATED_DATE } from "@/lib/curated-history";
import { formatMatchDay } from "@/lib/calendar-date";

const dateNotes = ["Group A", "Group D", "Quarter-finals", "Final"];
export function MatchdayTabs({ date }: { date?: string }) {
  return <section className="matchday-section" aria-labelledby="matchdays-heading">
    <div className="section-bar"><h2 id="matchdays-heading">Browse by date</h2><span>Four selected dates</span></div>
    <nav className="matchday-tabs" aria-label="Matchdays">
      {CURATED_DATES.map((day, index) => <Link key={day} href={replayHref({ mode: "curated", date: day })} aria-label={`${formatMatchDay(day)}, ${dateNotes[index]}`} aria-current={day === date ? "date" : undefined}><strong>{formatMatchDay(day, true)}</strong><span>{dateNotes[index]}</span></Link>)}
    </nav>
  </section>;
}

// The open date form belongs to the fictional/private datasets, never the curated landing.
export function ReplayControls({ selection, demoOnly = true }: { selection?: ReplaySelection; demoOnly?: boolean }) {
  if (selection?.mode === "curated" || (!selection && demoOnly)) return <MatchdayTabs date={selection?.date} />;
  return <section className="selection-panel" aria-label="Replay selection">
    <form key={`${selection?.mode}-${selection?.date}`} action="/" method="get" className="selection-form">
      <label>Collection<select name="mode" defaultValue={selection?.mode ?? "archive"}>
        <option value="curated">World Cup matches</option><option value="illustrative">Fictional lab</option>{!demoOnly && <option value="archive">Private provider archive</option>}
      </select></label>
      <label>Date<input type="date" name="date" required min={REPLAY_MIN_DATE} max={REPLAY_MAX_DATE} defaultValue={selection?.date ?? (demoOnly ? DEFAULT_CURATED_DATE : DEFAULT_ARCHIVE_DATE)} /></label>
      <Button type="submit" className="bg-emerald-800">Show matches</Button>
    </form>
    <nav aria-label="More dates" className="selection-links">
      {selection?.mode === "illustrative" ? <><Link href={replayHref({ mode: "illustrative", date: DEFAULT_ILLUSTRATIVE_DATE })}>11 June</Link><Link href={replayHref({ mode: "illustrative", date: "2026-06-12" })}>12 June</Link></> : <Link href={replayHref({ mode: "archive", date: DEFAULT_ARCHIVE_DATE })}>11 July archive</Link>}
      <Link href="/">World Cup matches</Link>
    </nav>
  </section>;
}

export function ReplayNotice({ selection }: { selection: ReplaySelection }) {
  if (selection.mode === "curated") return null;
  return <aside className={`collection-notice ${selection.mode === "illustrative" ? "fictional-notice" : ""}`}>
    <p><strong>{selection.mode === "illustrative" ? "Fictional examples" : "Private provider archive"}</strong> · {formatMatchDay(selection.date)}</p>
    <p>{selection.mode === "illustrative" ? "Invented teams, venues and sample commentary. No real match or result is represented." : "Stored API-FOOTBALL records and cached AI commentary. Match fields and source cutoffs are unverified; commentary is retrospective, not an authenticated forecast."} <Link href="/about">Source and methodology notes</Link></p>
  </aside>;
}

export function ReplayState({ title, children, level = 2 }: { title: string; children: React.ReactNode; level?: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2";
  return <section role="status" className="state-panel"><Heading>{title}</Heading><div>{children}</div></section>;
}
