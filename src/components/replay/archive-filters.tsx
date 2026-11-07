import Link from "next/link";
import { CURATED_DATES, CURATED_TEAMS, TOURNAMENT_STAGES, curatedHref, teamKey, type CuratedFilters } from "@/lib/curated-history";
import { formatMatchDay } from "@/lib/calendar-date";

export function ArchiveFilters({ filters }: { filters: CuratedFilters }) {
  const highlights = ["2026-06-11", "2026-06-15", "2026-07-11", "2026-07-19"];
  const current = CURATED_DATES.indexOf(filters.date);
  return <section className="archive-browser" aria-labelledby="browse-heading">
    <div className="section-bar"><h2 id="browse-heading">Browse the tournament</h2><Link className="text-link" href={curatedHref({ date: "all" })}>All 104 matches</Link></div>
    <form action="/" method="get" className="archive-filters" key={JSON.stringify(filters)}>
      <input type="hidden" name="mode" value="curated" />
      <label>Date<input type="date" name="date" min="2026-06-11" max="2026-07-19" defaultValue={filters.date === "all" ? "" : filters.date} aria-describedby="date-help" /><small id="date-help">Leave blank for all dates</small></label>
      <label>Stage<select name="stage" defaultValue={filters.stage ?? ""}><option value="">All stages</option>{TOURNAMENT_STAGES.map(stage => <option key={stage}>{stage}</option>)}<optgroup label="Groups">{Array.from("ABCDEFGHIJKL", group => <option key={group}>Group {group}</option>)}</optgroup></select></label>
      <label>Team<select name="team" defaultValue={filters.team ?? ""}><option value="">All teams</option>{CURATED_TEAMS.map(team => <option key={team} value={teamKey(team)}>{team}</option>)}</select></label>
      <label>Search<input type="search" name="q" placeholder="Team or venue" maxLength={80} defaultValue={filters.q ?? ""} /></label>
      <button className="filter-button" type="submit">Find matches</button>
    </form>
    <nav className="matchday-tabs" aria-label="Matchdays">{highlights.map((day,index) => <Link key={day} href={curatedHref({ date:day })} aria-current={day === filters.date ? "date" : undefined}><strong>{formatMatchDay(day,true)}</strong><span>{["Opening day","Spain’s opener","Quarter-finals","The final"][index]}</span></Link>)}</nav>
    {current >= 0 && <nav className="day-navigation" aria-label="Adjacent matchdays">{current > 0 && <Link href={curatedHref({ ...filters, date: CURATED_DATES[current-1], page: undefined })}>← {formatMatchDay(CURATED_DATES[current-1],true)}</Link>}<span>{formatMatchDay(filters.date)}</span>{current < CURATED_DATES.length-1 && <Link href={curatedHref({ ...filters, date: CURATED_DATES[current+1], page: undefined })}>{formatMatchDay(CURATED_DATES[current+1],true)} →</Link>}</nav>}
  </section>;
}
