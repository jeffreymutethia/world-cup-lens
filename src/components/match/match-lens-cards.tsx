import type { MatchLens, Team } from "@/lib/types";
import {
  BookOpen,
  Eye,
  HelpCircle,
  Lightbulb,
  Route,
  Scale,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MatchLensCardsProps = {
  lens: MatchLens;
  homeTeam: Team;
  awayTeam: Team;
};

export function MatchLensCards({
  lens,
  homeTeam,
  awayTeam,
}: MatchLensCardsProps) {
  return (
    <div className="grid auto-rows-fr gap-4 lg:grid-cols-3">
      <InsightCard
        icon={Lightbulb}
        title="Why it matters"
        body={lens.whyItMatters}
      />

      <InsightCard
        icon={Route}
        title="Likely game script"
        body={lens.likelyGameScript}
      />

      <TeamEdgesCard
        lens={lens}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />

      <ListCard
        icon={Eye}
        title="What to watch"
        items={lens.whatToWatch}
      />

      <InsightCard
        icon={Users}
        title="Casual fan guide"
        body={lens.casualFanGuide}
      />

      <ListCard
        icon={HelpCircle}
        title="Uncertainty"
        items={lens.uncertainty}
      />

      <SourcesCard lens={lens} />
    </div>
  );
}

type InsightCardProps = {
  icon: typeof Lightbulb;
  title: string;
  body: string;
};

function InsightCard({
  icon: Icon,
  title,
  body,
}: InsightCardProps) {
  return (
    <Card className="h-full border-0 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-emerald-700" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-[15px] leading-7 text-slate-600">
          {body}
        </p>
      </CardContent>
    </Card>
  );
}

type ListCardProps = {
  icon: typeof Eye;
  title: string;
  items: string[];
};

function ListCard({
  icon: Icon,
  title,
  items,
}: ListCardProps) {
  return (
    <Card className="h-full border-0 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-emerald-700" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2.5 text-[15px] leading-6 text-slate-600">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

type TeamEdgesCardProps = {
  lens: MatchLens;
  homeTeam: Team;
  awayTeam: Team;
};

function TeamEdgesCard({
  lens,
  homeTeam,
  awayTeam,
}: TeamEdgesCardProps) {
  return (
    <Card className="h-full border-0 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="size-4 text-emerald-700" />
          Team edges
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-5 flex justify-between text-xs font-semibold text-slate-500">
          <span>{homeTeam.name}</span>
          <span>{awayTeam.name}</span>
        </div>

        <div className="space-y-5">
          {lens.teamEdges.map((edge) => (
            <div key={edge.label}>
              <p className="mb-2 text-center text-xs font-medium text-slate-500">
                {edge.label}
              </p>

              <div className="grid grid-cols-[32px_1fr_32px_1fr_32px] items-center gap-2">
                <span className="text-right text-xs font-bold text-emerald-700">
                  {edge.homeValue}
                </span>

                <div className="flex h-2 justify-end overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-700"
                    style={{ width: `${edge.homeValue}%` }}
                  />
                </div>

                <span className="text-center text-[10px] font-semibold text-slate-300">
                  VS
                </span>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${edge.awayValue}%` }}
                  />
                </div>

                <span className="text-xs font-bold text-amber-700">
                  {edge.awayValue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SourcesCard({ lens }: { lens: MatchLens }) {
  return (
    <Card className="border-0 bg-white shadow-sm lg:col-span-3">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="size-4 text-emerald-700" />
          Sources
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {lens.sources.map((source) => (
            <div
              key={source.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-950">
                {source.title}
              </p>

              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {source.snippet}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
