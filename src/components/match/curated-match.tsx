import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { curatedScore, curatedResultLabel, sourceLabel, teamMonogram, curatedHref, curatedNavigation, curatedMatchHref, matchLensLabel, groupRecord, teamKey, type CuratedMatch, type CuratedFilters } from "@/lib/curated-history";
import { formatMatchDay } from "@/lib/calendar-date";

export function CuratedScoreboard({ match, detail = false, filters = { date: match.eventDate } }: { match: CuratedMatch; detail?: boolean; filters?: CuratedFilters }) {
  const Heading = detail ? "h1" : "h2";
  return <section className="scoreboard-hero" aria-labelledby="match-score-heading" data-match-id={match.id}>
    <div className="pitch-lines" aria-hidden="true" />
    <div className="hero-topline"><p className="hero-kicker"><time dateTime={match.eventDate}>{formatMatchDay(match.eventDate)}</time><span aria-hidden="true"> · </span>{match.stage}</p><span className="hero-tag">{detail ? `Match ${match.matchNumber}` : "Featured match"}</span></div>
    <Heading id="match-score-heading" className="sr-only">{match.homeTeam} {curatedScore(match)} {match.awayTeam}</Heading>
    <div className="scoreboard" aria-hidden="true"><div className="scoreboard-team"><span className="team-monogram">{teamMonogram(match.homeTeam)}</span><span className="team-name">{match.homeTeam}</span></div><div className="scoreboard-result"><strong>{curatedScore(match)}</strong><span>{match.penaltyShootout ? "After penalties" : match.afterExtraTime === true ? "After extra time" : match.afterExtraTime === false ? "Full time" : "Final result · extra time unknown"}</span>{match.penaltyShootout && <small>{match.penaltyShootout.home}–{match.penaltyShootout.away} on penalties</small>}</div><div className="scoreboard-team"><span className="team-monogram">{teamMonogram(match.awayTeam)}</span><span className="team-name">{match.awayTeam}</span></div></div>
    <p className="sr-only">{curatedResultLabel(match)}</p>
    <div className="hero-bottomline"><div>{!detail && <p className="hero-summary">{match.editorial.headline}</p>}<p className="hero-location">{match.venue} <span aria-hidden="true">·</span> <a href={match.source.url}>{sourceLabel(match)}</a></p></div>{!detail && <Link className="lime-button" href={curatedMatchHref(match,filters)} aria-label={`View match: ${match.homeTeam} vs ${match.awayTeam}`}>View match <ArrowUpRight aria-hidden="true" size={18} /></Link>}</div>
  </section>;
}
export function CuratedMatchCard({ match, filters = { date: match.eventDate } }: { match: CuratedMatch; filters?: CuratedFilters }) {
  return <article className="fixture-card" data-match-id={match.id}>
    <div className="fixture-topline"><p className="eyebrow"><time dateTime={match.eventDate}>{formatMatchDay(match.eventDate,true)}</time> · {match.stage}</p>{(match.afterExtraTime || match.penaltyShootout) && <span className="result-chip">{match.penaltyShootout ? "PEN" : "AET"}</span>}</div>
    <h3 className="sr-only">{match.homeTeam} {curatedScore(match)} {match.awayTeam}</h3>
    <div className="fixture-scoreboard" aria-hidden="true"><span className="fixture-team"><span className="small-monogram">{teamMonogram(match.homeTeam)}</span><strong>{match.homeTeam}</strong></span><strong className="fixture-score">{curatedScore(match)}</strong><span className="fixture-team away"><strong>{match.awayTeam}</strong><span className="small-monogram">{teamMonogram(match.awayTeam)}</span></span></div>
    <p className="fixture-venue">{match.venue}</p><div className="fixture-bottomline"><span>{curatedResultLabel(match)}</span><Link href={curatedMatchHref(match,filters)} aria-label={`Match details: ${match.homeTeam} vs ${match.awayTeam}`}>{matchLensLabel(match)} <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
  </article>;
}
export function ProjectNote() {
  return <aside className="project-note"><BookOpen aria-hidden="true" className="note-icon" size={24} /><h2>A tournament in context</h2><p>104 matches, from the opening game to the final. Match context follows each team’s group or knockout story. Ten selected matches include extended match analysis.</p><Link href="/about" className="text-link">How it works <ArrowUpRight size={15} aria-hidden="true" /></Link></aside>;
}
function GroupContext({ match }: { match: CuratedMatch }) {
  if (!match.stage.startsWith("Group ")) return null;
  return <section className="lens-panel"><h2>Group record after this match</h2><p className="source-caption">Calculated from the reviewed results. No qualification tiebreakers or table rankings are inferred.</p><div className="group-records">{[match.homeTeam,match.awayTeam].map(team => {
    const record = groupRecord(match,team)!;
    return <div key={team}><Link className="text-link" href={curatedHref({ date:"all",team:teamKey(team),stage:match.stage })}>{team}</Link><dl><div><dt>Played</dt><dd>{record.played}</dd></div><div><dt>W–D–L</dt><dd>{record.won}–{record.drawn}–{record.lost}</dd></div><div><dt>Points</dt><dd>{record.points}</dd></div><div><dt>Goals</dt><dd>{record.goalsFor}–{record.goalsAgainst}</dd></div></dl></div>;
  })}</div></section>;
}
export function CuratedMatchDetail({ match, filters }: { match: CuratedMatch; filters: CuratedFilters }) {
  const navigation = curatedNavigation(match,filters);
  return <>
    <CuratedScoreboard match={match} detail filters={filters} />
    <nav className="match-explore" aria-label="Explore this match"><Link href={curatedHref({date:"all",team:teamKey(match.homeTeam)})}>{match.homeTeam}’s tournament</Link><Link href={curatedHref({date:"all",team:teamKey(match.awayTeam)})}>{match.awayTeam}’s tournament</Link><Link href={curatedHref({date:"all",stage:match.stage})}>{match.stage} results</Link></nav>
    <div className="match-detail-grid">
      <div className="lens-main">
        <article className="recap-panel"><p className="eyebrow">{matchLensLabel(match)} · Retrospective</p><h2>{match.editorial.headline}</h2><p>{match.editorial.overview}</p><p className="editorial-note">Original editorial commentary</p></article>
        <section className="lens-panel significance-panel"><h2>Why it mattered</h2><p>{match.editorial.significance}</p></section>
        {match.editorial.developments?.length ? <section className="lens-panel"><h2>Reported developments</h2><ul className="development-list">{match.editorial.developments.map(item => <li key={item.text}><p>{item.text}</p><a href={item.sourceUrl}>Supporting report <ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul></section> : null}
        {match.editorial.interpretation.length > 0 && <section className="lens-panel"><h2>Reading the result</h2>{match.editorial.interpretation.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>}
        <GroupContext match={match} />
      </div>
      <div className="source-column">
        <section className="source-panel"><h2>Source and notes</h2><p>Result, date, stage and venue are checked against official match reports. Match Lens commentary is retrospective editorial context, not a generated forecast.</p><a href={match.source.url} className="source-button">View match source <ArrowUpRight size={17} aria-hidden="true" /></a><p className="source-caption">{sourceLabel(match)}</p>
          <details className="source-details"><summary>Evidence and limitations</summary><div><dl><div><dt>Dataset version</dt><dd>{match.datasetVersion}</dd></div><div><dt>Evidence reviewed / accessed</dt><dd>{match.source.reviewedOn} / {match.source.accessedOn}</dd></div><div><dt>Source publication date</dt><dd>{match.source.publicationDate ?? "Unknown"}</dd></div></dl><p>{match.source.accessMethod === "direct-pdf" ? "Official PDF read directly; linked here, not reproduced." : match.source.accessMethod === "direct-page" ? "Official source page read directly." : "Official evidence read through indexed results; direct article body unavailable."}</p><p>Dates follow the source’s local event day. Kickoff time, source capture time and historical knowledge cutoff are unknown. Regulation-time scores are not stored as structured fields; a linked report or extended recap may establish more detail. Unreviewed lineups and player statistics are omitted.</p>{match.evidenceNote && <p>{match.evidenceNote}</p>}<p>Scores exclude shootout kicks. A separate penalty score is shown when applicable.</p><p>The editorial publication scope does not grant an open-data licence or definitive branding clearance.</p><ul>{match.sources.map(source => <li key={source.url}><a href={source.url}>{source.identity}</a> · {source.accessMethod === "indexed-official-page" ? "indexed evidence" : source.accessMethod === "direct-pdf" ? "official PDF" : "source report"}</li>)}</ul></div></details>
        </section>
        <section className="source-panel uncertainty-panel"><h2>What remains unknown</h2>{match.editorial.uncertainty.map(item => <p key={item}>{item}</p>)}</section>
      </div>
    </div>
    <section className="team-journeys" aria-labelledby="journeys-heading"><div className="section-bar"><h2 id="journeys-heading">Their tournament</h2></div><div className="journey-grid">{[match.homeTeam,match.awayTeam].map(team => <section className="related-matches" key={team}><h3>{team}</h3>{navigation.related.filter(m => m.homeTeam === team || m.awayTeam === team).map(other => <Link key={other.id} href={curatedMatchHref(other,filters)}><span><strong>{other.homeTeam} {curatedScore(other)} {other.awayTeam}</strong><small>{formatMatchDay(other.eventDate,true)} · {other.stage}{other.penaltyShootout ? ` · Penalties ${other.penaltyShootout.home}–${other.penaltyShootout.away}` : other.afterExtraTime ? " · AET" : ""}</small></span><ArrowRight aria-hidden="true" size={18} /></Link>)}</section>)}</div></section>
    <nav className="match-sequence" aria-label="Match sequence">{navigation.previous && <Link href={curatedMatchHref(navigation.previous,filters)}><ArrowLeft size={17} aria-hidden="true" /><span><small>Previous match · {formatMatchDay(navigation.previous.eventDate,true)}</small>{navigation.previous.homeTeam} vs {navigation.previous.awayTeam}</span></Link>}<Link href={curatedHref(filters)}>Back to results</Link>{navigation.next && <Link href={curatedMatchHref(navigation.next,filters)}><span><small>Next match · {formatMatchDay(navigation.next.eventDate,true)}</small>{navigation.next.homeTeam} vs {navigation.next.awayTeam}</span><ArrowRight size={17} aria-hidden="true" /></Link>}</nav>
  </>;
}
