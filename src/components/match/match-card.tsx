import Link from "next/link";
import type { Match, Team, Venue } from "@/lib/types";
import { formatKickoff } from "@/lib/lens";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type MatchCardProps = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
};

export function MatchCard({ match, homeTeam, awayTeam, venue }: MatchCardProps) {
  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="h-full border-0 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Group {match.group}</Badge>
            {match.signalTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamMini team={homeTeam} />
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              VS
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
