# Portfolio summary

## 30-second introduction

World Cup Lens is a Next.js and TypeScript football archive with five source-linked 2026 matches, date-based browsing and a separate fictional analysis lab. Its private backend combines PostgreSQL, pgvector retrieval, structured model outputs and immutable generation history. The public demo is credential-free; deterministic tests and disposable database integration exercise the backend contracts without paid API calls.

## Two-minute technical explanation

World Cup Lens separates a public historical replay from a private analysis pipeline. Visitors can select one of four matchdays, inspect final scores and extra-time results, read retrospective recaps and open the supporting sources. A fictional lab demonstrates stored commentary and preset Q&A without mixing synthetic scenarios into the historical records.

The backend uses Supabase/PostgreSQL for fixtures, document versions, vector chunks and cached outputs. Semantic retrieval runs in pgvector, but similarity is only one selection criterion: team, venue, match scope, source version and optional publication/capture cutoffs determine which chunks qualify. The generation core then checks a versioned cache, requests structured output on a miss with evidence, and validates the result again after proofreading, source hydration and normalization.

Atomic SQL writes preserve the input snapshot, retrieved chunk identities and output history while selecting one successful cache winner. Grants and RLS keep source material and authoring operations privileged. Public pages use local records or cached reads rather than triggering model calls.

Verification combines TypeScript tests, real disposable PostgreSQL tests, HTTP isolation checks and browser regression checks. GitHub Actions runs unit, SQL, HTTP, type/lint/build and repository checks without production credentials. Browser and remote production checks run separately; Vercel serves the public demo. The main remaining work is complete Supabase gateway testing, durable job recovery and measured grounding evaluation. The public demonstration proves the replay experience; the synthetic tests prove specific backend contracts, not live model quality.

## GitHub repository description

Next.js football archive with source-linked historical replay, a fictional analysis lab, and a tested PostgreSQL/pgvector RAG backend with versioned caching and immutable lineage.

## SWE resume bullets

- Built a Next.js/TypeScript historical replay application with source-linked match records, date-preserving navigation and isolated curated, fictional and provider datasets.
- Implemented PostgreSQL/pgvector retrieval with entity and temporal filters, default-deny RLS/grants, and atomic source revisions and generation history.
- Established deterministic generation/cache tests, disposable PostgreSQL integration and GitHub CI release gates, with production HTTP and responsive-browser regression checks.

## AI/backend engineering pitch

The backend centers on evidence selection and output traceability. Entity filters constrain semantic ranking, source availability gates as-of retrieval, and immutable records retain the inputs behind a generated Lens. Structured outputs are revalidated after transformations, while cache identity changes with source, input and model/prompt/schema versions. Synthetic vectors and mocked model responses make failure and security tests reproducible. Real-model grounding quality and full vendor/gateway integration have not yet been evaluated.

## Technologies

Next.js 16.4.5, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide, Supabase clients, PostgreSQL, pgvector, OpenAI SDK/Responses adapters, Zod, Node's test runner, Docker, GitHub Actions, Vercel and Chromium/CDP. API-FOOTBALL supplies the retained private ingestion integration, not the five public curated records.

## Significant decisions

1. Separate public local content from private paid-service integrations so the demo does not depend on backend availability or unresolved provider publication rights.
2. Keep relational scope, vectors and lineage in PostgreSQL rather than introducing another data service without a measured requirement.
3. Filter by entity and temporal eligibility before semantic ranking.
4. Cache generation outside page requests and preserve immutable attempts rather than overwriting the evidence behind a result.
5. Validate final transformed output and test permission/failure contracts at their actual execution layers.

[Engineering decisions](engineering-decisions.md) records alternatives, costs and conditions for revisiting each choice.

## Verification evidence

| Layer | Evidence | Scope |
| --- | --- | --- |
| TypeScript | 70 tests at portfolio freeze | Replay validation, synthetic generation, postprocessing, cache/version/failure behavior and normalization |
| PostgreSQL | 78 assertions; native PostgreSQL 14 and CI PostgreSQL 17 with pgvector | Constraints, grants/RLS, vector/entity/cutoff selection, immutable writes, rollback and retries |
| HTTP and browser | Local archive mocks, public service-isolation checks, production smoke tests and five-width Chromium checks | Rendered pages, navigation, stored Q&A, source labels, responsive behavior and route denials |
| Delivery | GitHub CI and Vercel commit status | Checked revisions and successful public-demo deployment |

See [deployment evidence](deployment.md). These layers do not constitute a complete Supabase/OpenAI end-to-end test or production-load evaluation.

## Outstanding limitations

Complete Supabase gateway/Auth testing, authenticated operator archive reads, durable recovery and a reviewed grounding evaluation remain open. Current-head retrieval is not a complete historical source snapshot, model aliases may change, and private cache lookup still requires a query embedding. Legacy commentary remains retrospective. Provider normalization defects, development-tool advisories and source/branding/licence questions are tracked in the [audit](audit.md#current-findings) and [roadmap](roadmap.md#portfolio-freeze-and-remaining-work).
