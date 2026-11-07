# Portfolio summary

## 30-second introduction

World Cup Lens is a Next.js and TypeScript archive of all 104 matches at the 2026 World Cup. Visitors can browse dates, stages, groups and teams, follow tournament journeys and read source-linked retrospective Match Lenses. The public archive is self-contained. A separate private backend combines PostgreSQL, pgvector retrieval, structured model outputs and immutable generation history, exercised through deterministic and disposable-database tests.

## Two-minute technical explanation

The public product makes a completed tournament readable. Each match has date-only facts, a final result with extra-time/shootout distinctions, source links and retrospective context. Ten selected games have deeper editorial Lenses based on match-specific reporting. URL-driven filters, related matches and team journeys connect the results without turning the homepage into a table of 104 cards. The public copy is original editorial work, not presented as model output.

The private system retains the original analysis infrastructure. Supabase/PostgreSQL stores fixtures, document revisions, vector chunks and cached outputs. Retrieval uses pgvector cosine similarity after entity, version and optional publication/capture eligibility checks. On a cache miss with useful evidence, structured generation is followed by proofreading, source hydration, normalization and final validation.

Atomic SQL writes preserve exact inputs and retrieved chunk identities, append immutable output history and select a successful cache winner. Grants/RLS keep source material and authoring privileged. Public rendering never triggers these services and requires no database or paid API credentials.

Verification combines deterministic TypeScript tests, actual disposable PostgreSQL/pgvector assertions, archive-gateway mocks and public service-isolation checks. Browser and production HTTP checks establish separate UI/deployment observations. These layers test reproducible contracts; they do not establish real-model grounding quality, production database parity, full Supabase gateway integration or forecast accuracy.

## GitHub repository description

Complete 2026 World Cup archive with source-linked Match Lenses, Next.js/TypeScript browsing and a tested PostgreSQL/pgvector RAG backend with immutable lineage and versioned caching.

## SWE resume bullets

- Built a 104-match Next.js/TypeScript historical archive with validated date-only results, URL-driven filters, retrospective Match Lenses and connected tournament navigation.
- Implemented PostgreSQL/pgvector retrieval with entity and temporal eligibility, default-deny RLS/grants, atomic source revisions and immutable generation history.
- Established deterministic generation/cache checks, disposable PostgreSQL integration and GitHub CI gates, with HTTP isolation and responsive-browser regression coverage.

## AI/backend engineering pitch

The backend centers on evidence selection and traceability. Entity scope constrains semantic ranking; source availability and exact-input attestations gate as-of experiments. Immutable records retain the inputs and versions behind a generated Lens. Final transformed output is revalidated, and cache identity changes with inputs, sources and model/prompt/schema versions. Synthetic vectors and injected responses make failure, permission and cache tests reproducible. Real-model grounding quality and complete vendor/gateway execution remain unevaluated; the public Match Lenses are separately authored retrospectives.

## Technologies

Next.js 16.4.5, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide, Supabase clients, PostgreSQL, pgvector, OpenAI SDK/Responses adapters, Zod, Node's test runner, Docker, GitHub Actions, Vercel and Chromium/CDP. API-FOOTBALL is a retained private ingestion integration, not an acquisition source for the public curated collection.

## Significant decisions

1. Keep public facts and commentary local so archive browsing needs no paid service or unresolved provider export.
2. Use date-only public records instead of fabricating kickoff instants.
3. Store vectors, relational scope and immutable lineage in PostgreSQL rather than adding a second database without a measured requirement.
4. Apply entity/temporal eligibility before semantic ranking, and cache generation outside page requests.
5. Validate after every output transformation and test SQL permission/transaction behavior against a real disposable database.

[Engineering decisions](engineering-decisions.md) records alternatives, costs and reversal conditions.

## Verification evidence

| Layer | Evidence | Limit |
| --- | --- | --- |
| Factual compilation | Official match-specific reports, results hubs and recorded discrepancy decisions | Evidence review is not a general data licence or authenticated publisher-clock archive |
| TypeScript | Deterministic curated, replay, normalization and injected generation/cache tests | Mocks do not evaluate model quality |
| PostgreSQL | Disposable migrations, constraints, grants/RLS, vector filters, immutable writes and rollback/retry assertions | Direct SQL does not cover the full Supabase gateway/Auth stack |
| HTTP/browser | Local service tripwires, archive mocks, navigation/layout/focus checks and explicit public smoke checks | No accessibility certification or production-load benchmark |
| Delivery | Revision-specific GitHub CI and Vercel checks in [deployment evidence](deployment.md) | A successful push alone is not a verified release |

## Outstanding limitations

Detailed retrospectives cover ten games; remaining Lenses provide verified results and computed tournament context rather than invented play-by-play. Source/distribution/branding questions remain scoped in [data rights](data-rights.md). Backend work still includes isolated Supabase gateway/Auth coverage, authenticated operator archive reads, durable recovery and measured grounding evaluation. Current-head retrieval is not a complete historical corpus snapshot; legacy commentary stays retrospective. See the [audit](audit.md#current-findings) and [roadmap](roadmap.md#portfolio-freeze-and-remaining-work) for prioritized work and release limits.
