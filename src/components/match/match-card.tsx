import { replayHref, replayStatus, replayScore, stageLabel, type ReplaySelection } from "@/lib/replay";
import Link from "next/link";
import type { Match, MatchLens, Team, Venue } from "@/lib/types";
import { formatKickoff } from "@/lib/lens";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type MatchCardProps = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  lens: MatchLens | null;
  selection: ReplaySelection;
};

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  venue,
  lens,
  selection,
}: MatchCardProps) {
  return (
    <Link href={replayHref(selection, match.id)}>
      <Card className="h-full border-0 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{stageLabel(match.group)}</Badge>
            <Badge variant="outline">{replayStatus(match)}</Badge>
            {match.signalTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamMini team={homeTeam} />
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {replayScore(match)}
            </div>
            <TeamMini team={awayTeam} align="right" />
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-500">
            <p>{formatKickoff(match.kickoffAt)}</p>
            <p className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {venue.name}, {venue.city}
            </p>
          </div>

          {lens ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-950">
              <p className="font-semibold">
                {lens.slightEdge ?? "Even"} · {lens.confidence} confidence ·{" "}
                {lens.volatility} volatility
              </p>
              <p className="mt-1 line-clamp-2 leading-5">
                {lens.expectedGame}
              </p>
            </div>
          ) : <p className="mt-4 text-sm text-slate-500">No cached analysis available.</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function TeamMini({ team, align = "left" }: { team: Team; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-3xl">{team.flag}</div>
      <p className="mt-1 text-sm font-semibold text-slate-950">{team.name}</p>
      <p className="text-xs text-slate-500">{team.code}</p>
    </div>
  );
}
