import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function PageNotFound() {
  return <AppShell><section className="state-panel"><h1>Page not found</h1><p>The requested page is not in this archive.</p><Link className="text-link" href="/?mode=curated&date=all">Browse all matches</Link></section></AppShell>;
}
