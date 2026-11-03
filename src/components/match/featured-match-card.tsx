import { storedEdgeLabel } from "@/lib/analysis-presentation";
import { replayHref, replayStatus, replayScore, stageLabel, type ReplaySelection } from "@/lib/replay";
import Link from "next/link";
import type { Match, PublicMatchLens, Team, Venue } from "@/lib/types";
import { formatKickoff } from "@/lib/lens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Flame, MapPin } from "lucide-react";

type FeaturedMatchCardProps = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  lens: PublicMatchLens | null;
  selection: ReplaySelection;
};

export function FeaturedMatchCard({
  match,
  homeTeam,
  awayTeam,
  venue,
  lens,
  selection,
}: FeaturedMatchCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm">
      <div className="bg-emerald-800 px-5 py-3 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <Flame className="size-4" />
          {selection.mode === "illustrative" ? "Featured illustrative matchup" : "Featured archived matchup"}
        </div>
      </div>

      <CardContent className="grid min-w-0 grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{stageLabel(match.group)}</Badge>
            <Badge variant="outline">{replayStatus(match, selection.mode)}</Badge>
            {match.signalTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
            <div className="min-w-0 break-words">
              <div className="text-4xl sm:text-5xl">{homeTeam.flag}</div>
              <h2 className="mt-2 text-base font-bold tracking-tight sm:text-2xl">{homeTeam.name}</h2>
              <p className="text-sm text-slate-500">{homeTeam.code}</p>
            </div>

            <div className="max-w-16 rounded-full bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-600 sm:max-w-none sm:px-4 sm:text-sm">
              {replayScore(match, selection.mode)}
            </div>

            <div className="min-w-0 break-words text-right">
              <div className="text-4xl sm:text-5xl">{awayTeam.flag}</div>
              <h2 className="mt-2 text-base font-bold tracking-tight sm:text-2xl">{awayTeam.name}</h2>
              <p className="text-sm text-slate-500">{awayTeam.code}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>{formatKickoff(match.kickoffAt)}</span>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-4 shrink-0" />
              <span className="min-w-0 break-words">{venue.name}, {venue.city}</span>
            </span>
          </div>
        </div>

        <div className="min-w-0 rounded-3xl bg-emerald-50 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Cached match analysis
          </p>

          <div className="space-y-3">
            <ForecastRow
              label="Stored edge opinion"
              value={lens ? (storedEdgeLabel(lens.slightEdge)) : "Unavailable"}
            />
            <ForecastRow label="Stored confidence label" value={lens?.confidence ?? "Unavailable"} />
            <ForecastRow label="Stored volatility label" value={lens?.volatility ?? "Unavailable"} />
          </div>

          <p className="mt-4 text-xs text-slate-600">Uncalibrated commentary labels, not measured performance or probabilities.</p>
          <p className="mt-5 text-sm leading-6 text-emerald-950">
            {lens?.expectedGame ?? "No cached analysis is available. Open the match to view its stored details."}
          </p>

          <Button asChild className="mt-5 w-full bg-emerald-700 hover:bg-emerald-800">
            <Link href={replayHref(selection, match.id)}>
              View Lens
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 break-words font-semibold text-slate-950">{value}</span>
    </div>
  );
}
