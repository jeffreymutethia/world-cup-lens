import { BarChart3, CalendarDays, Home, Lightbulb, Settings, Shield, Trophy, Users } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Matches", icon: CalendarDays },
  { label: "Standings", icon: BarChart3 },
  { label: "Teams", icon: Users },
  { label: "Insights", icon: Lightbulb },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white/70 px-4 py-6 backdrop-blur lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <Trophy className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">World Cup Lens</p>
          <p className="text-xs text-slate-500">Match intelligence</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                item.active
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border bg-emerald-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-900">
          <Shield className="size-4" />
          Forecast mode
        </div>
        <p className="text-xs leading-5 text-emerald-800">
          Predictions are framed as explainable match expectations, not fake certainty.
        </p>
      </div>

      <button className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
        <Settings className="size-4" />
        Settings
      </button>
    </aside>
  );
}
