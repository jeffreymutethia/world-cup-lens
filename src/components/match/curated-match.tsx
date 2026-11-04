import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { curatedScore, sourceLabel, teamMonogram, type CuratedMatch } from "@/lib/curated-history";
import { formatMatchDay } from "@/lib/calendar-date";
import { replayHref } from "@/lib/replay";

export function CuratedScoreboard({ match, detail = false }: { match: CuratedMatch; detail?: boolean }) {
  const Heading = detail ? "h1" : "h2";
  return <section className="scoreboard-hero" aria-labelledby="match-score-heading" data-match-id={match.id}>
    <div className="pitch-lines" aria-hidden="true" />
    <div className="hero-topline">
      <p className="hero-kicker"><time dateTime={match.eventDate}>{formatMatchDay(match.eventDate)}</time><span aria-hidden="true"> · </span>{match.stage}</p>
      <span className="hero-tag">{detail ? "Final result" : "Featured match"}</span>
    </div>
    <Heading id="match-score-heading" className="sr-only">{match.homeTeam} {curatedScore(match)} {match.awayTeam}</Heading>
    <div className="scoreboard" aria-hidden="true">
      <div className="scoreboard-team"><span className="team-monogram">{teamMonogram(match.homeTeam)}</span><span className="team-name">{match.homeTeam}</span></div>
      <div className="scoreboard-result"><strong>{curatedScore(match)}</strong><span>{match.afterExtraTime ? "After extra time" : "Full time"}</span></div>
      <div className="scoreboard-team"><span className="team-monogram">{teamMonogram(match.awayTeam)}</span><span className="team-name">{match.awayTeam}</span></div>
    </div>
    <p className="sr-only">{match.afterExtraTime ? "After extra time" : "Full time"}</p>
    <div className="hero-bottomline">
      <div>{!detail && <p className="hero-summary">{match.editorial.headline}.</p>}<p className="hero-location">{match.venue} <span aria-hidden="true">·</span> <a href={match.source.url}>{sourceLabel(match)}</a></p></div>
      {!detail && <Link className="lime-button" href={replayHref({ mode: "curated", date: match.eventDate }, match.id)} aria-label={`View match: ${match.homeTeam} vs ${match.awayTeam}`}>View match <ArrowUpRight aria-hidden="true" size={18} /></Link>}
    </div>
  </section>;
}

export function CuratedMatchCard({ match }: { match: CuratedMatch }) {
  return <article className="fixture-card" data-match-id={match.id}>
    <div className="fixture-topline"><p className="eyebrow">{match.stage} · {match.venue}</p>{match.afterExtraTime && <span className="result-chip" title="After extra time">AET</span>}</div>
    <h3 className="sr-only">{match.homeTeam} {curatedScore(match)} {match.awayTeam}</h3>
    <div className="fixture-scoreboard" aria-hidden="true">
      <span className="fixture-team"><span className="small-monogram">{teamMonogram(match.homeTeam)}</span><strong>{match.homeTeam}</strong></span>
      <strong className="fixture-score">{curatedScore(match)}</strong>
      <span className="fixture-team away"><strong>{match.awayTeam}</strong><span className="small-monogram">{teamMonogram(match.awayTeam)}</span></span>
    </div>
    <div className="fixture-bottomline"><span>{match.afterExtraTime ? "After extra time" : "Full time"}</span><Link href={replayHref({ mode: "curated", date: match.eventDate }, match.id)} aria-label={`Match details: ${match.homeTeam} vs ${match.awayTeam}`}>Match details <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
  </article>;
}

export function ProjectNote() {
  return <aside className="project-note"><BookOpen aria-hidden="true" className="note-icon" size={24} />
    <h2>About this project</h2><p>A small World Cup archive with linked match sources. The separate fictional lab demonstrates cached analysis and Q&amp;A.</p>
    <Link href="/about" className="text-link">How it works <ArrowUpRight size={15} aria-hidden="true" /></Link>
  </aside>;
}

export function CuratedMatchDetail({ match, related }: { match: CuratedMatch; related: CuratedMatch[] }) {
  return <>
    <CuratedScoreboard match={match} detail />
    <div className="match-detail-grid">
      <article className="recap-panel"><p className="eyebrow">Match recap</p><h2>{match.editorial.headline}</h2>
        {match.editorial.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p className="editorial-note">Original retrospective commentary.</p>
        <dl className="result-facts"><div><dt>Final score</dt><dd>{curatedScore(match)}</dd></div><div><dt>Result</dt><dd>{match.afterExtraTime ? "After extra time" : "Full time"}</dd></div><div><dt>Stage</dt><dd>{match.stage}</dd></div></dl>
      </article>
      <div className="source-column">
        <section className="source-panel"><h2>Source and notes</h2><p>The result, date, stage and venue are independently selected from the linked source. The recap is editorial commentary, not a Match Lens response or a pre-match forecast.</p>
          <a href={match.source.url} className="source-button">View match source <ArrowUpRight size={17} aria-hidden="true" /></a><p className="source-caption">{sourceLabel(match)}</p>
          <details className="source-details"><summary>Evidence and limitations</summary><div>
            <dl><div><dt>Dataset version</dt><dd>{match.datasetVersion}</dd></div><div><dt>Evidence reviewed / accessed</dt><dd>{match.source.reviewedOn} / {match.source.accessedOn}</dd></div><div><dt>Source publication date</dt><dd>{match.source.publicationDate ?? "Unknown"}</dd></div></dl>
            <p>{match.source.accessMethod === "direct-pdf" ? "Official PDF read directly; linked here, not reproduced." : "Official page evidence rechecked through indexed results; the direct article body was unavailable."}</p>
            <p>The event date is the source’s local match day. Kickoff time, lineups, match events, regulation-time score and player statistics are not included. Source capture time and historical knowledge cutoff are unknown.</p>
            {match.evidenceNote && <p>{match.evidenceNote}</p>}
            <p>Publication is limited to this owner-directed editorial selection. No blanket FIFA permission, open-data licence or definitive trademark clearance is claimed.</p>
          </div></details>
        </section>
        <aside className="project-note"><h2>How the demo works</h2><p>The fictional lab illustrates cached analysis and preset questions. It is separate from these historical records.</p><Link href="/?mode=illustrative&date=2026-06-11" className="text-link">Fictional lab <ArrowUpRight size={15} aria-hidden="true" /></Link></aside>
      </div>
    </div>
    {related.length ? <section className="related-matches" aria-labelledby="related-heading"><h2 id="related-heading">Also on {formatMatchDay(match.eventDate, true)}</h2>{related.map(other => <Link key={other.id} href={replayHref({ mode: "curated", date: other.eventDate }, other.id)}><span><strong>{other.homeTeam} {curatedScore(other)} {other.awayTeam}</strong><small>{other.stage} · {other.afterExtraTime ? "After extra time · " : ""}{other.venue}</small></span><ArrowRight aria-hidden="true" size={20} /></Link>)}</section> : <Link href={replayHref({ mode: "curated", date: match.eventDate })} className="text-link">Back to matches <ArrowRight aria-hidden="true" size={17} /></Link>}
  </>;
}
