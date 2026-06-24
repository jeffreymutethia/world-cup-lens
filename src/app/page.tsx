import { AppShell } from "@/components/layout/app-shell";
import { FeaturedMatchCard } from "@/components/match/featured-match-card";
import { MatchCard } from "@/components/match/match-card";
import { StandingsSnapshot } from "@/components/match/standings-snapshot";
import { Badge } from "@/components/ui/badge";
import { getAllMatchViewModels, getFeaturedMatchViewModel } from "@/lib/lens";
import { teams } from "@/data/seed";

const dateFilters = ["Today", "Tomorrow", "Sat Jun 13", "Sun Jun 14"];
const groupFilters = ["All", "Group A", "Group B", "Group C", "Group D", "Hosts", "High volatility"];

export default function Home() {
  const featuredMatch = getFeaturedMatchViewModel();
  const matches = getAllMatchViewModels();
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
              <h2 className="text-lg font-semibold tracking-tight">Upcoming matches</h2>
              <p className="text-sm text-slate-500">
                Browse visually, then open a match to see the full Lens.
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
