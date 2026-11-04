# World Cup Lens

A football archive portfolio: **five source-linked 2026 matches**, original retrospective recaps and a separate fictional lab. The public demo needs no database connection or paid API credentials. A private, tested Postgres/pgvector RAG foundation demonstrates the backend contracts separately.

**[Public demo](https://world-cup-lens-one.vercel.app)** · [Fictional lab](https://world-cup-lens-one.vercel.app/?mode=illustrative&date=2026-06-11) · [Technical walkthrough](docs/technical-walkthrough.md) · [Architecture](docs/architecture.md) · [CI](https://github.com/jeffreymutethia/world-cup-lens/actions)

- **Product:** date-only historical facts, source notes, four matchdays and working detail/back navigation.
- **Backend:** entity/time-filtered retrieval, immutable source/run history, versioned cache, strict final validation and default-deny permissions.
- **Evidence:** deterministic tests, real disposable PostgreSQL tests, credential-free HTTP checks and genuine browser captures. Significant Codex assistance, owner direction/review and independent agent review are disclosed; no external audit or model-quality score is claimed.

```sh
# Node 22.13+ within major 22 (.nvmrc)
npm ci
npm run dev
# In another terminal:
npm test
```

Open [localhost:3000](http://localhost:3000). No environment file is required for the public demo.

<img src="docs/screenshots/redesign-production/home-1440.png" alt="World Cup Lens desktop archive: Norway–England scoreboard, four matchdays and the other July 11 fixture" width="720">

[Mobile screenshot](docs/screenshots/redesign-production/home-390.png) · [Match detail](docs/screenshots/redesign-production/detail-1280.png) · [Keyboard focus](docs/screenshots/redesign-production/home-390-keyboard-focus.png) · [Full visual evidence and limits](docs/design.md)

These genuine production screenshots were captured on 2026-11-04 at visual revision `1bf320c`. The final audit rechecked the unchanged interface with real Chromium at five viewport widths; revision-specific evidence is in [deployment](docs/deployment.md). They are not supplied design mockups.

## What runs where

| Part | Source and behavior | Verification boundary |
| --- | --- | --- |
| Public curated history | Five local records, date-only facts, authored recaps and primary-source links; default July 11 | Public HTTP/browser checks and deterministic record validation |
| Public fictional lab | Three invented scenarios over two dates, original stored sample Lens/Q&A | Local sample reads; no actual model generation claimed |
| Private provider archive | Supabase fixtures and compatible cached AI commentary; exact `WCL_DEPLOYMENT_MODE=archive-enabled` required | Archive HTTP mocks; earlier limited read-only live samples are not complete production guarantees |
| Private RAG authoring | Supabase/OpenAI/API-FOOTBALL adapters and dependency-injected generation core | Mocked model/embedding tests plus real PostgreSQL SQL tests; **not** a verified end-to-end deployed AI service |

Missing or invalid server configuration defaults to `demo-only`. Public pages never substitute among datasets, generate a Lens, embed documents or call the provider. Explicit archive requests and all six admin POST/cron GET/HEAD handlers are denied before work. `vercel.json` has no schedule. Local datasets are static inputs; Next.js renders request-aware pages, rather than exporting a static HTML site.

The public recaps are original editorial interpretation, not output of the application's OpenAI/RAG pipeline. Fiction is labeled synthetic. Legacy cached AI text stays retrospective: a replay date, cache write or kickoff cannot establish a pre-match information cutoff. Unsupported numerical Team Edges are withheld; retrieved excerpts are context, not claim-level proof.

## Engineering map

Next.js 16.4.5 App Router, React 19, strict TypeScript, Tailwind/Radix/Lucide; Supabase clients, Postgres/pgvector, OpenAI SDK/Responses structured-output adapters and Zod; Node tests, GitHub Actions and Vercel. System fonts require no Google build-time fetch. No additional vector service, accounts, free-form chat or background queue is implemented. The unused shadcn CLI was removed; its exact existing CSS body is vendored with the MIT notice, without redesigning the interface.

Start with the [complete walkthrough and synthetic trace](docs/technical-walkthrough.md), then [database contract/ER diagram](docs/database-contract.md), [security boundaries](docs/backend-security.md), [retrieval](docs/retrieval-design.md), [RAG/cache/failure diagrams](docs/rag-pipeline.md) and [engineering decisions](docs/engineering-decisions.md). For presentations use the [interview guide](docs/interview-guide.md) and [portfolio summary](docs/portfolio-summary.md).

The SQL is a clean-database **reconstruction**, informed by application dependencies and limited read-only column/type discovery. It is not proven production parity and has not been applied to production. New provider rows remain private, so the existing publishable provider reader sees none under this contract; privileged authoring has a separate reader. No grant is widened merely to populate archive pages.

New private runs retain source/chunk versions, exact input snapshots, distinct clocks, prompt/schema/model labels and immutable cache history. As-of core experiments require established source publication/capture and an exact input attestation. These checks do not authenticate publisher clocks, model training cutoffs or factual claims. The HTTP adapter remains retrospective. Complete Supabase gateway/Auth integration, grounding evaluation and durable recovery remain deferred.

## Run the checks

```sh
npm test
npm run db:test
npm run test:replay-http
npm run test:demo-http
npm run lint
npm run typecheck
npm run build
npm run check:credentials
npm run check:docs
npm run check:security
git diff --check
```

`db:test` creates, migrates, seeds, checks and destroys an owned PostgreSQL/pgvector database. It accepts no remote database URL and loads only original synthetic records/vectors/mock outputs. Use a Docker daemon (isolated PostgreSQL 17/pgvector 0.8.2) or installed PostgreSQL with pgvector; `WCL_PG_BIN` selects native binaries. `db:bootstrap` is the same **disposable** smoke bootstrap, not a persistent database. [Setup and role details](docs/database-contract.md). Do not link or push these migrations to production.

HTTP suites run sequentially, start local servers and have bounded deadlines/cleanup. Archive tests use a local Supabase mock; demo tests clear service credentials and actively deny service fetches. `DEMO_TEST_PRODUCTION=1 npm run test:demo-http` tests the built server; `DEMO_TEST_DEPLOYMENT_VALUE=invalid-value npm run test:demo-http` checks invalid policy. CI retains these, pinned official actions/Node major, locked installation, SQL integration and whitespace/credential/documentation and known high/critical advisory checks without real API keys. Counts and actual hosted results are in the [final audit](docs/audit.md#portfolio-freeze-audit).

Optional `npm run test:design` uses an existing Chromium installation against localhost:3107 and a temporary profile; it downloads no browser and is not part of hosted CI. `npm run test:production-http` explicitly checks the authorized public demo, including unauthenticated denial responses; never target a private/authoring-enabled deployment. HTTP, browser, SQL and mocked generation evidence are distinct.

## Historical scope, attribution and rights

| Event day, 2026 | Match | Stage | Final score |
| --- | --- | --- | --- |
| June 11 | Mexico–South Africa | Group A | 2–0 |
| June 12 | USA–Paraguay | Group D | 4–1 |
| July 11 | Norway–England | Quarter-final | 1–2 AET |
| July 11 | Argentina–Switzerland | Quarter-final | 3–1 AET |
| July 19 | Spain–Argentina | Final | 1–0 AET |

This is a selection, not the complete tournament. Curated days preserve the reviewed source's local event day; fictional/provider timestamp selection uses America/Los_Angeles. No kickoff clock, goal minute, lineup, regulation-score breakdown, player statistic or prediction is invented. Argentina–Switzerland keeps FIFA's July 11 event day separate from its July 12 article date and UEFA's differing July 12 entry.

[Source review](docs/curated-history-review.md) records two directly readable official PDFs and three indexed official article/results entries with federation cross-checks; complete direct article bodies were unavailable in those three cases. Tests compare implementation against reviewed tuples, not independently authenticated publisher snapshots.

Publication is an owner-directed narrow editorial release of exactly five selected records and original commentary. It is **not** blanket FIFA permission, an open-data licence, definitive trademark clearance or permission to redistribute a provider database. Unrelated provider rows, excerpts and cached AI corpus retain UNKNOWN rights. No official logo, photo, crest, article/PDF copy, video or provider export is bundled. [Rights](docs/data-rights.md) and [provenance](docs/data-provenance.md) remain separate from software licensing.

**No repository code licence has been selected.** Do not describe public GitHub visibility as an unrestricted software/data grant. [Owner options](docs/engineering-decisions.md#code-licence-decision-remains-with-the-owner) are documented without selecting one. Existing package/icon notices remain at [third-party-notices.txt](public/third-party-notices.txt); they are not a full transitive licence clearance.

Unofficial portfolio project. Not affiliated with, sponsored by or endorsed by FIFA or any national association.

## Private configuration and deployment

The existing Vercel project `jt254/world-cup-lens` tracks main at repository root. The public URL above is verified; [deployment evidence](docs/deployment.md) distinguishes current HTTP/commit status from earlier dashboard/environment inspection. Public operation requires no service credentials and must remain demo-only.

Private integration variable **names only**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, server-only `SUPABASE_SECRET_KEY`, `OPENAI_API_KEY`, `OPENAI_MATCH_LENS_MODEL`, `OPENAI_EMBEDDING_MODEL` (contract v1 accepts only text-embedding-3-small), `API_FOOTBALL_KEY`, optional provider base/league/season variables documented in `fixtures/api-football.ts`, `ADMIN_GENERATION_SECRET`, `CRON_SECRET`, and `WCL_AUTHORING_DATASET_VERSION`. Exact private server opt-in is not permission to execute paid work. Authoring also requires backend contract v1; the existing production database was not upgraded.

Never print/commit values or run ingestion, embedding, generation or cron as setup/smoke testing. A future production upgrade, broader source publication or paid evaluation requires separate approval.

The final dependency snapshot reports zero production advisories and no high/critical entries overall. Sixteen moderate development-only lint/glob audit entries remain; see the [audit](docs/audit.md#portfolio-freeze-audit). `check:security` fails on high/critical findings, including development dependencies. These advisory checks run on push/PR and explicit command, not a security certification or an assertion of zero vulnerabilities.

## MVP freeze

The freeze covers the public demonstration and tested backend contracts, with the limits above. It is not a production forecasting-service certification. Only verified substantive defects justify maintenance changes; optional product expansion needs a new owner-approved scope. [Current findings and checks](docs/audit.md#portfolio-freeze-audit) and [remaining work by category](docs/roadmap.md#portfolio-freeze-and-remaining-work) distinguish true defects, deferred engineering, external rights/licence questions and optional features.
