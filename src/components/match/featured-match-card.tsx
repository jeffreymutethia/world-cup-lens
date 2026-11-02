import { replayHref, replayStatus, replayScore, stageLabel, type ReplaySelection } from "@/lib/replay";
import Link from "next/link";
import type { Match, MatchLens, Team, Venue } from "@/lib/types";
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
  lens: MatchLens | null;
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
          Featured historical matchup
        </div>
      </div>

      <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{stageLabel(match.group)}</Badge>
            <Badge variant="outline">{replayStatus(match)}</Badge>
            {match.signalTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <div className="text-5xl">{homeTeam.flag}</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{homeTeam.name}</h2>
              <p className="text-sm text-slate-500">{homeTeam.code}</p>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              {replayScore(match)}
            </div>

            <div className="text-right">
              <div className="text-5xl">{awayTeam.flag}</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{awayTeam.name}</h2>
              <p className="text-sm text-slate-500">{awayTeam.code}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>{formatKickoff(match.kickoffAt)}</span>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {venue.name}, {venue.city}
            </span>
          </div>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Cached match analysis
          </p>

          <div className="space-y-3">
            <ForecastRow
              label="Slight edge"
              value={lens ? (lens.slightEdge ?? "Even") : "Unavailable"}
            />
            <ForecastRow label="Confidence" value={lens?.confidence ?? "Unavailable"} />
            <ForecastRow label="Volatility" value={lens?.volatility ?? "Unavailable"} />
          </div>

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
    <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
