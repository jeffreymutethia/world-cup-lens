# Portfolio summary

Use only claims you can explain from the [technical walkthrough](technical-walkthrough.md), [audit](audit.md#portfolio-freeze-audit) and actual test results. The project was developed with **significant Codex assistance and owner direction/review**; it is not presented as entirely handwritten or externally audited. No external user base, commercial deployment impact or model-quality benchmark is claimed.

## 30-second explanation

World Cup Lens is a Next.js football archive portfolio with five source-linked 2026 matches and a separate fictional lab. The public demo works without paid APIs or database credentials. Behind it is a private Postgres/pgvector foundation with entity/time-filtered retrieval, strict structured-output validation, immutable source/output history and deterministic tests. The public recaps are authored editorial copy; the private AI pipeline is contract-tested with synthetic data, not claimed as a fully deployed AI service.

## Two-minute technical pitch

I developed World Cup Lens with substantial Codex assistance, using the transition from live coverage to historical replay to examine data trust and reproducibility. The public experience is a small, curated archive: fixed event dates, results, extra-time labels, source links and original recaps. A fictional lab demonstrates stored commentary and Q&A. These paths do not need Supabase, OpenAI or API-FOOTBALL.

The private engineering foundation uses Supabase/Postgres and pgvector. Documents become immutable versions and chunks. Semantic retrieval is constrained by match/team/venue scope, current source versions and optional historical availability; a high similarity score cannot override eligibility. Structured generation is followed by proofreading, excerpt hydration, normalization and final schema/identity validation. Inputs, source versions and model/prompt/schema labels contribute to the cache identity; SQL retains immutable attempts and one successful cache winner.

I can demonstrate credential-free unit/HTTP tests and real disposable PostgreSQL tests covering grants, RLS, vector filters, cutoff invalidation, rollback and retries. CI uses no production credentials. Independent agent review and real browser/production checks complement those tests.

The limits are explicit: schema validation is not factual grounding; operator timestamps do not authenticate a historical forecast; complete Supabase gateway/Auth and paid vendor integration are unverified; the clean database contract is not production parity. Provider/branding rights are separate from code and require review before broader reuse. The result is a demonstrable product and an explainable tested backend foundation, with bounded claims.

## GitHub/project description

Next.js football replay portfolio: five source-linked matches, a credential-free fictional lab, and a tested Postgres/pgvector RAG foundation with default-deny access and immutable lineage.

## Resume bullets

These describe project work, not business impact; retain the AI-assistance disclosure when presenting the project:

- Developed a Next.js/TypeScript football replay portfolio with isolated curated, fictional and private-provider datasets, URL-preserved date navigation and a credential-free public demo.
- Implemented and tested a disposable Postgres/pgvector contract with default-deny RLS/grants, entity/cutoff-filtered cosine retrieval and atomic immutable source/output history, using synthetic data and vectors.
- Established mocked generation validation, versioned cache/retry tests, real PostgreSQL integration and GitHub CI, with production HTTP and responsive-browser regression evidence and documented limits.

Do not add invented latency/cost savings, accuracy percentages, adoption figures or claims that the public demo runs real-time RAG.

## Architecture in brief

Public Next server components select local curated history or original fiction; small client components handle the menu and stored Q&A. A separate publishable Supabase reader supports private archive integration. Guarded privileged authoring performs ingestion, versioned chunk/embedding writes, constrained retrieval and structured generation; the injected engine and SQL are tested separately. GitHub Actions verifies the repository, and the existing Git-connected Vercel project serves demo-only pages.

## Technologies actually used

Next.js 16.4.5 App Router, React 19, strict TypeScript, Tailwind CSS, Radix UI, Lucide, Supabase JavaScript clients, PostgreSQL, pgvector, OpenAI SDK/Responses structured-output adapters, Zod, Node's test runner, Docker/native PostgreSQL integration scripts, GitHub Actions, Vercel and isolated Chromium/CDP QA. API-FOOTBALL is the retained ingestion adapter, not the source of the public curated module. No Pinecone, queue service, user-account system or live model evaluation was implemented.

## What the demonstrations prove

| Evidence | Supports | Does not establish |
| --- | --- | --- |
| Public demo and HTTP/browser checks | Selected-date browsing, exact repository fact tuples, detail/source navigation, fictional stored Q&A, responsive behavior and guarded route denials | Complete tournament accuracy, permanent publisher availability, legal clearance, infrastructure egress certification or live AI generation |
| Deterministic TypeScript tests | Replay/data validation, mocked generation/failure/cache behavior and strict post-transform checks | Real-model quality, factual grounding or publisher authenticity |
| Real disposable PostgreSQL tests | Schema bootstrap, role/grant/RLS behavior, vector/entity/time selection, immutable writes, cache/retry/rollback contracts | Production schema parity, deployed production RLS or complete Supabase gateway/Auth execution |
| Hosted CI and Vercel status | Tested committed revision and successful demo deployment | Full AI/backend production readiness or external usage |

## Outstanding limitations

Priorities are isolated Supabase gateway/Auth contract testing, durable persistence recovery/jobs, reviewed grounding/temporal evidence, remaining provider identity/stage/score normalization and source/branding/licence questions. Vendor model aliases can drift; private cache lookup still needs a query embedding; current-head retrieval is not a complete historical source snapshot. Legacy outputs remain retrospective and can contain unsupported prose. None of these is concealed by the independent public dataset.

MVP freeze means preserving this reviewed portfolio scope, not announcing a production forecasting service. See [remaining work by category](roadmap.md#portfolio-freeze-and-remaining-work).
