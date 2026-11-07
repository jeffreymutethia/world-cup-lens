import { AppShell } from "@/components/layout/app-shell";
import { ReplayState } from "@/components/replay/replay-controls";

export function ReplayLoading() {
  return <AppShell><ReplayState title="Loading matches">Loading the selected matches…</ReplayState></AppShell>;
}
