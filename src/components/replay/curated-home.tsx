import { CuratedMatchCard, CuratedScoreboard, ProjectNote } from "@/components/match/curated-match";
import { MatchdayTabs, ReplayState } from "@/components/replay/replay-controls";
import { loadCuratedHistory, secondaryCuratedMatches } from "@/lib/curated-history";
import { formatMatchDay } from "@/lib/calendar-date";

export function CuratedHome({ date }: { date: string }) {
  const result = loadCuratedHistory(date);
  const others = result.featured ? secondaryCuratedMatches(result.matches, result.featured.id) : [];
  return <div className="curated-home">
    <section className="archive-intro"><div><p className="eyebrow">2026 · Unofficial match archive</p><h1>World Cup 2026,<br />revisited.</h1><p className="intro-deck">Five selected matches, with results and source-linked context.</p></div>
      <dl className="archive-counts"><div><dt>Matches</dt><dd>05</dd></div><div><dt>Dates</dt><dd>04</dd></div><div><dt>Tournament</dt><dd>2026</dd></div></dl>
    </section>
    {result.state === "ready" && <CuratedScoreboard match={result.featured} />}
    <MatchdayTabs date={date} />
    {result.state !== "ready" ? <ReplayState title={result.state === "error" ? "Matches unavailable" : "No selected matches on this date"}>{result.state === "error" ? "The local match records could not be loaded. No other dataset has been substituted." : "This archive contains five selected matches. Choose one of the four dates above."}</ReplayState> : <div className={`archive-lower ${others.length ? "" : "single-match-day"}`}>
      {others.length > 0 && <section aria-labelledby="other-matches-heading"><h2 id="other-matches-heading" className="section-heading">Also on {formatMatchDay(date, true)}</h2><div className="fixture-list">{others.map(match => <CuratedMatchCard key={match.id} match={match} />)}</div></section>}
      <ProjectNote />
    </div>}
  </div>;
}
