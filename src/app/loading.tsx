import { AppShell } from "@/components/layout/app-shell";
import { ReplayState } from "@/components/replay/replay-controls";

export default function Loading() {
  return <AppShell><ReplayState title="Loading replay selection">Reading selected fixtures and cached analysis…</ReplayState></AppShell>;
}
