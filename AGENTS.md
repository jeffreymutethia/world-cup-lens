# Working on World Cup Lens

World Cup Lens is a Next.js 16.2.9 / React 19 / strict TypeScript football intelligence app using Supabase, OpenAI embeddings and Responses structured outputs, API-FOOTBALL, and Tailwind/Radix UI. The product target is a reproducible historical replay demo; current code still assumes live tournament operation.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know
Read the relevant guide in `node_modules/next/dist/docs/` before writing code. APIs, conventions, and structure may differ from prior versions. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Navigate first
- `src/app/page.tsx`, `src/app/matches/[id]/page.tsx`: public pages.
- `src/components/`: layout, match presentation, and shared UI.
- `src/lib/types.ts`: application types; `src/data/seed.ts` and `src/lib/lens.ts`: illustrative data/helpers.
- `src/lib/supabase/{server,admin,repository}.ts`: publishable reads, privileged client, data mapping.
- `src/lib/fixtures/`, `src/lib/documents/`, `src/lib/ai/`: fixture ingestion, document synthesis/embedding, retrieval/generation.
- `src/lib/pipeline/run-today-pipeline.ts`, `src/app/api/`, `vercel.json`: orchestration, protected mutations, cron.
- `docs/architecture.md`, `docs/audit.md`, `docs/roadmap.md`: verified design, findings, proposed work.

## Work and verify
Inspect git status and relevant files before editing; preserve unrelated changes. Make small changes with one reviewable purpose. Distinguish observed behavior, inference, and planned behavior; cite paths and symbols. Do not claim deployed behavior or database guarantees from TypeScript alone.

Commands: `npm run dev` (development), `npm run lint`, `npm run build`, `npm start` (built server). No test script or test suite currently exists. Add focused tests with behavior changes; do not report missing tests as passing. Builds use Google fonts and may need network access. Update architecture and relevant docs when behavior, contracts, operations, or configuration change; record checks and limitations in the handoff.

## Security and side effects
Never output secrets, environment file contents, credentials, authorization headers, or sensitive provider payloads in logs, docs, commands, or responses. Refer to environment variable names only. Keep privileged clients server-only. Do not expose Supabase secret keys to browsers. Use isolated mocks/local fixtures for tests; external API, ingestion, embedding, generation, and cron calls may incur cost or mutate data and require explicit task authorization.

Never auto-commit, push, deploy, or mutate production data without explicit instruction. Do not install dependencies, change environment files, or create migrations unless within the authorized task. Report security uncertainties without inventing deployed protections.
