import { connection } from "next/server";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { deploymentMode } from "@/lib/deployment-mode";

export default async function AboutPage() {
  await connection();
  const demo = deploymentMode() === "demo-only";
  return <AppShell><article className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-white p-6 shadow-sm">
    <p className="font-semibold text-emerald-800">{demo ? "Public demo · fictional content only" : "Archive-enabled deployment · separate datasets"}</p>
    <h2 className="text-3xl font-semibold">A story you can inspect, without a live AI request</h2>
    <p>This demonstration uses original fictional teams and authored scenario copy. Open a date, compare the story, then explore the cached questions. No numerical team-strength measurements or real match outcomes are claimed.</p>
    <ol className="list-decimal space-y-3 pl-5">
      <li>The URL selects a Los Angeles calendar date and the illustrative dataset.</li>
      <li>Local TypeScript records supply the teams, venue and sample commentary.</li>
      <li>List and detail pages share selection logic; preset questions only switch between stored answers.</li>
    </ol>
    <p>{demo ? "This deployment disables archive reads and every authoring endpoint before work begins. Browsing needs no database connection, API key, model call or provider request." : "Archive mode is separately enabled here and requires a configured Supabase project. It reads stored provider fixtures and cached commentary; it never generates analysis during browsing."}</p>
    <h3 className="text-xl font-semibold">The separate historical authoring pipeline</h3>
    <p>The repository retains fixture ingestion, document chunking, embedding, vector retrieval, structured generation and output caching for separately authorized operation. Historical source cutoffs and redistribution rights remain unresolved; this public demonstration does not publish that corpus.</p>
    <p>World Cup Lens is a portfolio application, not an official tournament service. Fictional names are scenario labels, not references to national sides or club logos.</p>
    <p><a href="/third-party-notices.txt" className="text-emerald-800 underline">Code and icon license notices</a></p>
    <Link href="/" className="inline-block rounded-xl bg-emerald-700 px-4 py-2 text-white">Back to the match lab</Link>
  </article></AppShell>;
}
