import { analysisPresentation } from "@/lib/analysis-presentation";
import type { DatasetMode } from "@/lib/replay";
import type { PublicMatchLens } from "@/lib/types";
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
  lens: PublicMatchLens;
  mode: DatasetMode;
};

export function MatchLensCards({
  lens,
  mode,
}: MatchLensCardsProps) {
  const policy = analysisPresentation(mode);
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

      <InsightCard icon={Scale} title="Team comparison unavailable" body={policy.metricsMessage} />

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

      <SourcesCard lens={lens} mode={mode} />
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

function SourcesCard({ lens, mode }: { lens: PublicMatchLens; mode: DatasetMode }) {
  const policy = analysisPresentation(mode);
  return (
    <Card className="border-0 bg-white shadow-sm lg:col-span-3">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="size-4 text-emerald-700" />
          {policy.contextLabel}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="mb-4 text-sm text-slate-600">{policy.contextMessage}</p>
        {lens.sources.length === 0 && <p className="text-sm text-slate-500">No stored context snippets are available.</p>}
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
