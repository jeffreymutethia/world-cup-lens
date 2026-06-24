import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { MatchForecastCard } from "@/components/match/match-forecast-card";
import { MatchLensCards } from "@/components/match/match-lens-cards";
import { MatchQa } from "@/components/match/match-qa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatKickoff,
  getCachedAnswersForMatch,
  getMatchViewModel,
} from "@/lib/lens";

type MatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const viewModel = getMatchViewModel(id);

  if (!viewModel) {
    notFound();
  }

  const { match, homeTeam, awayTeam, venue, lens } = viewModel;
  const cachedAnswers = getCachedAnswersForMatch(match.id);

  if (!lens) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Back to matches
            </Link>
          </Button>

          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Match Lens unavailable</h2>
            <p className="mt-2 text-sm text-slate-500">
              A forecast has not been generated for this match yet.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to matches
          </Link>
        </Button>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex justify-center">
            <Badge variant="secondary">Group {match.group}</Badge>
          </div>

          <div className="mx-auto grid w-full max-w-4xl grid-cols-[1fr_auto_1fr] items-center gap-8">
            <TeamHero
              flag={homeTeam.flag}
              name={homeTeam.name}
              code={homeTeam.code}
            />

            <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-500">
              VS
            </div>

            <TeamHero
              flag={awayTeam.flag}
              name={awayTeam.name}
              code={awayTeam.code}
              align="right"
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
            <span>{formatKickoff(match.kickoffAt)}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {venue.name}, {venue.city}
            </span>
          </div>
        </section>

        <MatchForecastCard lens={lens} />

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Match intelligence
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {lens.headline}
            </h2>
          </div>

          <MatchLensCards
            lens={lens}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        </section>

        <MatchQa answers={cachedAnswers} />
      </div>
    </AppShell>
  );
}

type TeamHeroProps = {
  flag: string;
  name: string;
  code: string;
  align?: "left" | "right";
};

function TeamHero({
  flag,
  name,
  code,
  align = "left",
}: TeamHeroProps) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-7xl">{flag}</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{name}</h1>
      <p className="mt-1 text-sm font-medium tracking-wide text-slate-500">{code}</p>
    </div>
  );
}
