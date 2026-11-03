import { Shield, Trophy } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white/70 px-4 py-6 backdrop-blur lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white"><Trophy className="size-5" /></div>
        <div><p className="text-sm font-semibold text-slate-950">World Cup Lens</p><p className="text-xs text-slate-500">History & match lab</p></div>
      </div>
      <div className="mt-10 rounded-2xl border bg-emerald-50 p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-900"><Shield className="size-4" />Replay mode</p>
        <p className="text-xs leading-5 text-emerald-800">Explore five independently curated results with original retrospective context. The fictional lab demonstrates cached analysis; the private archive is a separate integration.</p>
      </div>
    </aside>
  );
}
