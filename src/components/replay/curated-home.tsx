import Link from "next/link";
import { CuratedMatchCard, CuratedScoreboard, ProjectNote } from "@/components/match/curated-match";
import { ReplayState } from "@/components/replay/replay-controls";
import { ArchiveFilters } from "./archive-filters";
import { CURATED_DATES, loadCuratedHistory, secondaryCuratedMatches, paginateCuratedMatches, curatedHref, type CuratedFilters } from "@/lib/curated-history";
import { formatMatchDay } from "@/lib/calendar-date";

export function CuratedHome({ filters }: { filters: CuratedFilters }) {
  const result = loadCuratedHistory(filters);
  const others = result.featured ? secondaryCuratedMatches(result.matches, result.featured.id) : [];
  const page = paginateCuratedMatches(others, filters.page);
  return <div className="curated-home">
    <section className="archive-intro"><div><p className="eyebrow">2026 · Unofficial match archive</p><h1>World Cup 2026,<br />revisited.</h1><p className="intro-deck">Every result. The stories behind selected matches.</p></div><dl className="archive-counts"><div><dt>Matches</dt><dd>104</dd></div><div><dt>Teams</dt><dd>48</dd></div><div><dt>Matchdays</dt><dd>{CURATED_DATES.length}</dd></div></dl></section>
    {result.state === "ready" && !page.invalid && <CuratedScoreboard match={result.featured} filters={filters} />}
    <ArchiveFilters filters={filters} />
    {result.state !== "ready" || page.invalid ? <ReplayState title={page.invalid ? "Results page not found" : result.state === "error" ? "Matches unavailable" : "No matches for this selection"}>{page.invalid ? <Link className="text-link" href={curatedHref({ ...filters,page: undefined })}>Return to the first results page</Link> : result.state === "error" ? "The reviewed match records could not be loaded. No other dataset has been substituted." : "Try another date, stage or team, or browse all 104 matches."}</ReplayState> : <>
      <div className={`archive-lower ${others.length ? "" : "single-match-day"}`}>
        {others.length > 0 && <section aria-labelledby="other-matches-heading"><div className="section-bar"><h2 id="other-matches-heading" className="section-heading">{filters.date === "all" ? "More results" : `Also on ${formatMatchDay(filters.date,true)}`}</h2><span>{result.matches.length} {result.matches.length === 1 ? "match" : "matches"} found</span></div><div className="fixture-list">{page.matches.map(match => <CuratedMatchCard key={match.id} match={match} filters={filters} />)}</div>
          {page.pages > 1 && <nav className="results-pagination" aria-label="Results pages">{Array.from({length:page.pages},(_,i) => <Link key={i} aria-current={page.current === i+1 ? "page" : undefined} href={curatedHref({...filters,page:String(i+1)})}>Page {i+1}</Link>)}</nav>}
        </section>}
        <ProjectNote />
      </div>
    </>}
  </div>;
}
