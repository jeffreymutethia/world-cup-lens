import { connection } from "next/server";

import { AppShell } from "@/components/layout/app-shell";
import { FeaturedMatchCard } from "@/components/match/featured-match-card";
import { MatchCard } from "@/components/match/match-card";
import { StandingsSnapshot } from "@/components/match/standings-snapshot";
import { Badge } from "@/components/ui/badge";
import {
  getProviderMatchesForLocalDate,
} from "@/lib/supabase/repository";
import type { MatchViewModel } from "@/lib/supabase/repository";
import {
  getAllMatchViewModels as getSeededMatchViewModels,
} from "@/lib/lens";
import { teams as seededTeams } from "@/data/seed";

const dateFilters = ["Today", "Tomorrow", "Sat Jun 13", "Sun Jun 14"];
const groupFilters = ["All", "Group A", "Group B", "Group C", "Group D", "Hosts", "High volatility"];

export default async function Home() {
  await connection();

  let providerMatches: MatchViewModel[] = [];

  try {
    providerMatches = await getProviderMatchesForLocalDate();
  } catch (error) {
    console.error("[home] provider matches unavailable:", error);
  }

  const usingProviderMatches = providerMatches.length > 0;
  const matches = usingProviderMatches
    ? providerMatches
    : getSeededMatchViewModels();
  const featuredMatch = matches[0] ?? null;
  const teams = usingProviderMatches
    ? Array.from(
        new Map(
          matches.flatMap(({ homeTeam, awayTeam }) => [
            [homeTeam.id, homeTeam],
            [awayTeam.id, awayTeam],
          ]),
        ).values(),
      )
    : seededTeams;
  const groupATeams = teams.filter((team) => team.group === "A");

  if (!featuredMatch) {
    return (
      <AppShell>
        <p>No featured match available.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <FeaturedMatchCard
            match={featuredMatch.match}
            homeTeam={featuredMatch.homeTeam}
            awayTeam={featuredMatch.awayTeam}
            venue={featuredMatch.venue}
            lens={featuredMatch.lens}
          />

          <StandingsSnapshot teams={groupATeams} group="A" />
        </section>

        <section className="rounded-3xl bg-white/70 p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {usingProviderMatches ? "Today’s matches" : "Upcoming matches"}
              </h2>
              <p className="text-sm text-slate-500">
                {usingProviderMatches
                  ? "Live, upcoming, then completed fixtures in Los Angeles time."
                  : "Browse visually, then open a match to see the full Lens."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {dateFilters.map((filter, index) => (
                <Badge
                  key={filter}
                  variant={index === 0 ? "default" : "outline"}
                  className={index === 0 ? "bg-emerald-700" : ""}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {groupFilters.map((filter, index) => (
              <Badge
                key={filter}
                variant={index === 0 ? "secondary" : "outline"}
                className="rounded-full px-3 py-1"
              >
                {filter}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map(({ match, homeTeam, awayTeam, venue }) => (
              <MatchCard
                key={match.id}
                match={match}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                venue={venue}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
