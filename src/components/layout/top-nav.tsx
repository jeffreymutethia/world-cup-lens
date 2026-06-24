import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex items-center justify-between border-b bg-white/80 px-5 py-4 backdrop-blur lg:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
          World Cup 2026
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950">
          Today’s Match Lens
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Search">
          <Search className="size-4" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <div className="hidden size-9 rounded-full bg-gradient-to-br from-emerald-700 to-amber-500 sm:block" />
      </div>
    </header>
  );
}
