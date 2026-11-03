import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { curatedResultLabel, curatedScore, type CuratedMatch } from "@/lib/curated-history";
import { formatEventDate } from "@/lib/calendar-date";
import { replayHref } from "@/lib/replay";

function Facts({ match }: { match: CuratedMatch }) {
  return <>
    <div className="flex flex-wrap gap-2"><Badge variant="secondary">{match.stage}</Badge><Badge variant="outline">{curatedResultLabel(match)}</Badge></div>
    <h2 className="mt-5 break-words text-2xl font-bold tracking-tight sm:text-4xl">{match.homeTeam} <span className="whitespace-nowrap text-emerald-800">{curatedScore(match)}</span> {match.awayTeam}</h2>
    <p className="mt-3 text-sm text-slate-600"><time dateTime={match.eventDate}>{formatEventDate(match.eventDate)}</time> · {match.venue}</p>
  </>;
}

export function CuratedMatchCard({ match, featured = false }: { match: CuratedMatch; featured?: boolean }) {
  return <article className={`min-w-0 rounded-3xl bg-white p-5 shadow-sm ${featured ? "border border-emerald-200 sm:p-8" : ""}`}>
    {featured && <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-800">Featured historical match</p>}
    <Facts match={match} />
    <p className="mt-5 font-semibold">{match.editorial.headline}</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">{match.editorial.paragraphs[0]}</p>
    <p className="mt-4 text-xs text-slate-500">Verified result · original editorial commentary · source: {match.source.identity}</p>
    <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-emerald-800 underline">
      <Link href={replayHref({ mode: "curated", date: match.eventDate }, match.id)}>Read {match.homeTeam}–{match.awayTeam} retrospective</Link>
      <a href={match.source.url}>Primary source</a>
    </div>
  </article>;
}

export function CuratedMatchDetail({ match }: { match: CuratedMatch }) {
  return <>
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-8"><p className="mb-4 text-sm font-semibold text-emerald-800">Verified match facts</p><Facts match={match} /><p className="mt-4 text-xs leading-5 text-slate-500">Date only, using the source’s local event day. Kickoff clock time, lineups, match events, regulation-time score and player statistics are not curated here. The final score includes extra time where marked AET.</p></section>
    <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-emerald-800">Authored retrospective context · separate from Match Lens</p>
      <h2 className="mt-3 text-2xl font-semibold">{match.editorial.headline}</h2>
      {match.editorial.paragraphs.map(paragraph => <p key={paragraph} className="mt-4 leading-7 text-slate-700">{paragraph}</p>)}
      <p className="mt-4 text-sm text-slate-500">Interpretation follows the verified result. No predictive ratings, tactical measurements or pre-kickoff knowledge claim is made.</p>
    </article>
    <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold">Sources & provenance</h2>
      <a href={match.source.url} className="mt-3 inline-block break-words text-emerald-800 underline">{match.source.identity} · primary source</a>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold">Dataset version</dt><dd>{match.datasetVersion}</dd></div>
        <div><dt className="font-semibold">Evidence reviewed / accessed</dt><dd>{match.source.reviewedOn} / {match.source.accessedOn}</dd></div>
        <div><dt className="font-semibold">Source publication date</dt><dd>{match.source.publicationDate ?? "Unknown"}</dd></div>
        <div><dt className="font-semibold">Evidence access</dt><dd>{match.source.accessMethod === "direct-pdf" ? "Official PDF read directly; not republished" : "Official page evidence rechecked through indexed results; direct article body unavailable"}</dd></div>
        <div><dt className="font-semibold">Historical knowledge cutoff</dt><dd>Unknown; not a historical forecast</dd></div>
        <div><dt className="font-semibold">Source capture / AI generation times</dt><dd>Unknown / not applicable to authored commentary</dd></div>
      </dl>
      {match.evidenceNote && <p className="mt-4 text-sm leading-6 text-slate-600">{match.evidenceNote}</p>}
      <p className="mt-4 text-sm leading-6 text-slate-600">Owner-directed, narrowly scoped editorial publication with source linkbacks. No blanket FIFA permission, open-data licence or definitive trademark clearance is claimed. No source article text, official logos or media are reproduced.</p>
    </section>
  </>;
}
