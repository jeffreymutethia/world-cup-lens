import { NON_AFFILIATION_NOTICE } from "@/lib/curated-history";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f2ea] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <div className="flex-1 px-5 py-6 lg:px-8">{children}</div>
          <footer className="border-t px-5 py-5 text-xs leading-5 text-slate-600 lg:px-8">{NON_AFFILIATION_NOTICE}</footer>
        </main>
      </div>
    </div>
  );
}
