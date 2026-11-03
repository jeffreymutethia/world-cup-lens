import { connection } from "next/server";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { deploymentMode } from "@/lib/deployment-mode";

export default async function AboutPage() {
  await connection();
  const demo = deploymentMode() === "demo-only";
  return <AppShell><article className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-white p-6 shadow-sm">
    <p className="font-semibold text-emerald-800">{demo ? "Public demo · curated history and fictional lab" : "Archive-enabled deployment · separate datasets"}</p>
    <h2 className="text-3xl font-semibold">History you can inspect, without a live AI request</h2>
    <p>The public demo’s default experience is a small, independently curated selection of five 2026 World Cup results. Plain team names, final scores, stages and venues are linked to primary evidence. Original retrospective context is authored editorial commentary, separate from the Match Lens generation pipeline.</p>
    <ol className="list-decimal space-y-3 pl-5">
      <li>The URL selects a dataset and date. Curated records preserve the source’s local event day without inventing kickoff timestamps.</li>
      <li>Local TypeScript records supply the five historical matches. Source access/review dates, explicit unknowns and a versioned editorial publication decision travel with each record.</li>
      <li>The separate fictional AI lab uses Local TypeScript records for synthetic teams and stored sample Lens/Q&amp;A. It demonstrates the interface and cache contract, not an actual model run.</li>
      <li>The separately enabled Supabase archive reads stored provider fixtures and cached AI commentary using Los Angeles day boundaries. Its unverified provenance is distinct from curated facts.</li>
    </ol>
    <Link href="/?mode=illustrative&date=2026-06-11" className="text-emerald-800 underline">Explore the fictional AI lab</Link>
    <p>{demo ? "This deployment disables archive reads and every authoring endpoint before work begins. Browsing needs no database connection, API key, model call or provider request." : "Archive mode is separately enabled here and requires a configured Supabase project. It reads stored provider fixtures and cached commentary; it never generates analysis during browsing."}</p>
    <h3 className="text-xl font-semibold">The separate historical authoring pipeline</h3>
    <p>The repository retains fixture ingestion, document chunking, embedding, vector retrieval, structured generation and output caching for separately authorized operation. Historical source cutoffs and redistribution rights remain unresolved; the public selection does not publish that corpus. The protected authoring pipeline is not used to produce the curated editorial text.</p>
    <p>World Cup Lens is a portfolio application, not an official tournament service. Fictional names are scenario labels, not references to national sides or club logos.</p>
    <p><a href="/third-party-notices.txt" className="text-emerald-800 underline">Code and icon license notices</a></p>
    <Link href="/" className="inline-block rounded-xl bg-emerald-700 px-4 py-2 text-white">Back to curated history</Link>
  </article></AppShell>;
}
