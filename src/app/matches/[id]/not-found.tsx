import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function MatchNotFound() {
  return <AppShell><section className="state-panel"><h1>Match not found</h1><p>This match is not in the historical archive.</p><Link className="text-link" href="/?mode=curated&date=all">Browse all matches</Link></section></AppShell>;
}
