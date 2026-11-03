# Working on World Cup Lens

World Cup Lens is a Next.js 16.2.9 / React 19 / strict TypeScript football intelligence app using Supabase, OpenAI embeddings and Responses structured outputs, API-FOOTBALL, and Tailwind/Radix UI. The product target is a reproducible historical replay demo; public deployment defaults to a credential-free fictional demo; archive requires exact server opt-in; ingestion and generation retain legacy live-operation APIs.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know
Read the relevant guide in `node_modules/next/dist/docs/` before writing code. APIs, conventions, and structure may differ from prior versions. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Navigate first
- `src/app/page.tsx`, `src/app/matches/[id]/page.tsx`: public pages.
- `src/components/`: layout, match presentation, and shared UI.
- `src/lib/deployment-mode.ts`, `replay-access.ts`: fail-closed server policy and lazy archive boundary.
- `src/data/seed.ts`, `docs/demo-publication-review.md`: versioned, reviewed original fiction only; legacy UNKNOWN rights remain unknown.
- `src/lib/analysis-presentation.ts`: retrospective/synthetic labels, withheld metrics policy, and distinct time metadata with explicit unknowns.
- `src/lib/data-rights.ts`, `docs/data-{provenance,rights}.md`: source inventory and publication gates; UNKNOWN never implies permission.
- `src/lib/cached-analysis.ts`: read-time display validation for cached Lens/Q&A JSON.
- `src/lib/replay.ts`: date validation, Los Angeles day boundaries, dataset selection, navigation, and truthful result presentation.
- `src/lib/types.ts`: application types; `src/data/seed.ts` and `src/lib/lens.ts`: illustrative data/helpers.
- `src/lib/supabase/{server,admin,repository}.ts`: publishable reads, privileged client, data mapping.
- `src/lib/fixtures/`, `src/lib/documents/`, `src/lib/ai/`: fixture ingestion, document synthesis/embedding, retrieval/generation.
- `src/lib/pipeline/run-today-pipeline.ts`, `src/app/api/`, `vercel.json`: orchestration, protected mutations, cron.
- `docs/architecture.md`, `docs/audit.md`, `docs/roadmap.md`: verified design, findings, proposed work.

## Work and verify
Inspect git status and relevant files before editing; preserve unrelated changes. Make small changes with one reviewable purpose. Distinguish observed behavior, inference, and planned behavior; cite paths and symbols. Do not claim deployed behavior or database guarantees from TypeScript alone.

Use Node 22.13.0 or newer within major 22 (`.nvmrc` selects major 22); install locked packages with `npm ci`. `.github/workflows/ci.yml` runs push/PR checks with dummy settings and no secrets.

Commands: `npm run dev` (development), `npm run lint`, `npm run typecheck` (generates Next route types before checking), `npm run build`, `npm start` (built server). `npm test` compiles deterministic TypeScript tests into a temporary directory and runs Node’s test runner without external credentials or new dependencies. `npm run test:demo-http` checks unset/invalid server policy, missing service keys, blocked local authoring methods, and no service fetches. `npm run test:replay-http` explicitly opts into archive-enabled mode and starts local Next/mock Supabase servers to check rendered pages with dummy credentials; it requires localhost socket access and no other running Next dev server for this checkout. Requests time out after 15 seconds, the run has a 120-second watchdog, and local process-group cleanup is bounded. `npm run test:production-http` is an explicit remote smoke check of the authorized public demo (optional `DEMO_URL`); it sends no auth/service credentials and checks blocked methods only after confirming demo policy. It is separate from local CI. Add focused tests with behavior changes; do not report missing tests as passing. Typography uses system font stacks; builds do not fetch Google fonts. A sandboxed Turbopack build may need local socket/process permission for CSS compilation. Update architecture and relevant docs when behavior, contracts, operations, or configuration change; record checks and limitations in the handoff.

## Security and side effects
Never output secrets, environment file contents, credentials, authorization headers, or sensitive provider payloads in logs, docs, commands, or responses. Refer to environment variable names only. Keep privileged clients server-only. Do not expose Supabase secret keys to browsers. Use isolated mocks/local fixtures for tests; external API, ingestion, embedding, generation, and cron calls may incur cost or mutate data and require explicit task authorization.

Never present placeholder strengths, uncalibrated labels, or retrieved snippets as verified measurements or claim-level proof. Preserve stored commentary wording; label it retrospective or synthetic. A kickoff, replay date, or cache update is not a historical information cutoff. Never export provider rows or derived snippets without source-specific rights approval; no public historical dataset is currently approved. Only the new wcl-synthetic-v1 original demo has scoped publication approval; do not upgrade old UNKNOWN sources or claim history clearance.

WCL_DEPLOYMENT_MODE must fail closed to demo-only when absent/invalid. Exact archive-enabled is for separately configured local/private use. Keep archive and all authoring/cron guards server-side, before auth/work; never add a URL/client override. Public demos must need no service credentials.

Never auto-commit, push, deploy, or mutate production data without explicit instruction. Do not install dependencies, change environment files, or create migrations unless within the authorized task. Report security uncertainties without inventing deployed protections.
