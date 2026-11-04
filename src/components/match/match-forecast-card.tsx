import { storedEdgeLabel } from "@/lib/analysis-presentation";
import type { PublicMatchLens } from "@/lib/types";
import { Activity, MessageSquare, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MatchForecastCardProps = {
  lens: PublicMatchLens;
};

export function MatchForecastCard({
  lens,
}: MatchForecastCardProps) {
  return (
    <Card className="border border-emerald-200 bg-emerald-50 shadow-sm">
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ForecastMetric
            icon={TrendingUp}
            label="Edge opinion"
            value={storedEdgeLabel(lens.slightEdge)}
            iconTone="text-emerald-700"
            valueTone="text-emerald-800"
            iconBackground="bg-emerald-100"
          />

          <ForecastMetric
            icon={MessageSquare}
            label="Confidence label"
            value={lens.confidence}
            iconTone="text-amber-700"
            valueTone="text-amber-800"
            iconBackground="bg-amber-100"
          />

          <ForecastMetric
            icon={Activity}
            label="Volatility label"
            value={lens.volatility}
            iconTone="text-rose-700"
            valueTone="text-rose-800"
            iconBackground="bg-rose-100"
          />
        </div>

          <p className="mt-4 text-xs text-slate-600">Opinion labels, not measurements or probabilities.</p>
        <div className="mt-6 border-t border-emerald-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Expected pattern
          </p>

          <p className="mt-2 text-[15px] leading-7 text-emerald-950">
            {lens.expectedGame}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type ForecastMetricProps = {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  iconTone: string;
  valueTone: string;
  iconBackground: string;
};

function ForecastMetric({
  icon: Icon,
  label,
  value,
  iconTone,
  valueTone,
  iconBackground,
}: ForecastMetricProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div
        className={[
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          iconBackground,
        ].join(" ")}
      >
        <Icon className={`size-5 ${iconTone}`} />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>
        <p className={`mt-0.5 text-base font-bold ${valueTone}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
