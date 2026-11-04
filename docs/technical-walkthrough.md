# Technical walkthrough

Scope: the frozen portfolio MVP at baseline `4c88da8`, verified on 2026-11-04. Read this alongside the [current audit](audit.md#portfolio-freeze-audit), [database contract](database-contract.md), and [interview guide](interview-guide.md). “Implemented” describes code; “tested” identifies the layer actually exercised. Neither means that the full AI backend is deployed or factually evaluated.

## A. Product architecture

There are four deliberately separate paths:

| Path | Actual source | What a visitor/operator receives |
| --- | --- | --- |
| Curated public history | `src/data/curated-history.ts:curatedMatches` | Five reviewed date-only results, original retrospective recaps and primary-source links |
| Public fictional lab | `src/data/seed.ts`, `src/lib/lens.ts:buildIllustrativeViewModel` | Original invented scenarios and stored sample commentary/preset answers; no real outcome or model execution claimed |
| Private provider archive | `src/lib/supabase/repository.ts` | Provider fixtures and compatible cached commentary, subject to deployment policy, credentials and database grants |
| Private authoring | `src/lib/fixtures/`, `documents/`, `ai/`, `rag/` | Protected ingestion and versioned generation adapters; deterministic core and disposable SQL tested separately |

`src/lib/deployment-mode.ts:deploymentMode` defaults to demo-only, including invalid configuration. Only exact server-side `archive-enabled` opens the private boundary. URL parameters and credential presence cannot enable it. Production browsing uses no database/provider/model request. The local datasets are static inputs; the Next pages are server-rendered, not a static HTML export.

## B. Next.js responsibilities

`src/app/page.tsx:Home` and `src/app/matches/[id]/page.tsx:MatchPage` await Next 16 promise-based route/search parameters. They validate selection before reading a collection. `src/app/about/page.tsx:AboutPage` uses `connection()` to make its policy explanation request-time rather than a stale prerendered snapshot.

Server components choose data and render the scoreboards/cards. `src/components/layout/top-nav.tsx` is client-side for the responsive disclosure and keyboard focus behavior; `src/components/match/match-qa.tsx:MatchQa` changes the selected **stored** answer. No free-form question or browser model client exists. `server-only` marks Supabase/operator/model adapters. The pure RAG core contains no credentials and accepts dependencies for tests.

## C. Historical versus fictional browsing

`src/lib/replay.ts:parseReplaySelection` validates modes, duplicate parameters, calendar format and tournament range. Demo-only defaults to curated July 11. `src/lib/curated-history.ts:loadCuratedHistory` validates the five-record module; featured order is editorial, not a guessed kickoff time. `secondaryCuratedMatches` removes the featured ID. `replayHref` carries mode/date into detail and back links.

Curated dates retain the source's local event day; no midnight timestamp is invented. Timestamp-based fictional/provider fixtures use `dateBounds` for independent Los Angeles midnights, including DST. Empty, invalid, disabled and query-error states stay distinct. No branch silently substitutes fiction for failed history. `analysis-presentation.ts` keeps legacy cache text retrospective; source snippets and subjective labels never become verified measurements.

## D. Private Supabase integration

`supabase/server.ts:createServerSupabaseClient` uses the publishable reader. `getProviderMatchesForDate` queries provider-only fixtures with named team/venue FK joins, then batches Lens lookup. Cache validation in `cached-analysis.ts` checks renderable JSON, not truth. Questions are a separate cached read.

`supabase/admin.ts:createAdminSupabaseClient` is privileged and server-only. `supabase/authoring.ts:requireAuthoringContract` requires contract v1 and `WCL_AUTHORING_DATASET_VERSION`; authoring uses privileged reads instead of depending on public RLS. `generateAndSaveMatchLens` obtains a single-query snapshot/fingerprint through `get_authoring_input`.

The new SQL is a **clean-database reconstruction**. Production column/type discovery did not reveal its constraints, RLS or function bodies. No production migration was applied. New local provider rows default private, so the old publishable provider archive reader sees none on this contract. This intentional mismatch needs an authorized operator-read/publication design before private operational use; it is not fixed by granting anonymous access.

## E. Ingestion and normalization

`fixtures/api-football.ts:fetchWorldCupFixtures` is a retained, potentially paid API adapter; it is never called by public pages or these tests. `sync-fixtures.ts:syncWorldCupFixtures` preflights, normalizes the complete response, then upserts teams, venues and matches in separate statements. There is no whole-pipeline transaction.

`normalize.ts:normalizeApiFootballFixture` preserves provider identities, raw statuses and reported scores. Using the [published provider status categories](https://www.api-football.com/documentation_v3) (reviewed 2026-11-04 without an API request), the final audit corrects canonical status mapping through `canonicalFixtureStatus`; unsupported/ambiguous statuses fail before the write batch. Venue country is Unknown because this response has no venue-country field; competition country is not a location. Strengths remain null. Derived aliases/codes, team-level group overwrite, missing-venue identity collisions and penalty breakdown remain private ingestion limitations. No existing database rows are repaired automatically.

## F. Document revisions and chunking

`documents/sync-provider-documents.ts:syncProviderDocuments` creates application-written provider profiles, not copied articles. `rag/document-identity.ts` supplies stable UUID identities, unchanged capture-clock reuse and canonical-scope checks that prevent overwriting match-specific documents. Publication time remains unknown; templates omit fake strengths.

`documents/embed-documents.ts:embedDocuments` selects up to 50 stale heads through `pending_embedding_documents`. `ai/chunk-text.ts:chunkText` normalizes whitespace, targets 1,200 characters with 180-character overlap, preferring sentence/paragraph boundaries. It is character-based, not token-based or a tuned retrieval benchmark.

`store_document_revision` in migration 2 locks the head, checks the pre-embedding input hash and atomically inserts version/chunks before advancing the pointer. Old versions remain. Migration 1's `fingerprint_document` hashes material/provenance fields and clears prior availability review when those fields change. Pointer-only updates do not revoke an unchanged review. Failure rolls back the entire revision.

## G–H. Embeddings and constrained retrieval

`ai/embeddings.ts` adapts the existing OpenAI model setting. `rag/contract.ts` fixes `text-embedding-3-small`, logical version and 1,536 dimensions; unsupported overrides, incomplete/duplicate batch indices, nonfinite or zero vectors are rejected. Tests use locally constructed basis vectors instead of an embedding request.

`ai/retrieve-context.ts:retrieveVersionedContext` calls `match_document_chunks`. SQL computes cosine similarity as `1 - (chunk <=> query)`, applies an inclusive threshold, orders similarity descending/UUID ascending and bounds result count. The app uses threshold .15 and eight chunks. There is no ANN index or measured relevance/latency claim.

Eligibility precedes ranking: every nonnull team, venue and match tag must fit the requested scope. A same-team source tagged to another match is excluded. Untagged sources require explicit global status. Only unchanged current document versions with compatible embedding labels qualify. A cutoff additionally requires verified publication/capture at or before cutoff. Unknown availability is excluded. Historical retrieval is conservative current-head retrieval, not a complete time-travel corpus.

As-of engine experiments also require an attestation of the **exact** input fingerprint whose asserted available-at time is at/before cutoff, with cutoff before kickoff. Attestation recording time can be later; it is not proof the assertion was recorded contemporaneously. `safeMatchInput` excludes results, statuses, strengths and mutable summaries from prompts. These are operator evidence checks, not independent authentication of publisher clocks or model training knowledge. The actual HTTP adapter is retrospective; legacy outputs never acquire a forecast label.

## I–J. Structured generation and final checks

`rag/engine.ts:runVersionedLens` builds a query, validates retrieval through `ContextSchema`, hashes cache identity and checks for an existing output before generation. A real private cache lookup still needs a query embedding/retrieval; public rendering never does.

On a miss with evidence, `ai/generate-match-lens.ts:generateStructuredLens` uses Responses structured outputs via `zodTextFormat(MatchLensSchema)`. `proofread-match-lens.ts:proofreadMatchLens` allows prose corrections while preserving structured fields/list counts. The engine re-parses, attaches document-deduplicated excerpts through `hydrateLensSources`, normalizes text and calls `validateFinalLens` **after** transformations. Unknown fields/enums, invalid lengths, wrong opponent identity and numerical edges are rejected; new `teamEdges` must be empty. `valid_lens_json` also checks final SQL shape before commit.

These checks do not detect every unsupported football claim. Retrieved text is treated as untrusted input in the prompt, but adversarial robustness and factual grounding have not been measured. No real-model quality score or complete vendor integration result exists for this reconstructed path.

## K. Immutable lineage and cache

`canonicalJson` and `cacheKey` produce SHA256 identity from input/dataset versions, perspective/cutoff/attestation, prompt/schema/model/embedding labels, query/vector/parameters and ordered source metadata. Run UUIDs and execution clocks are excluded. Source/input/version changes cause a new key; logical versions do not pin vendor weights.

`commit_lens_generation` checks current inputs and selected source heads, recomputes retrieval and atomically writes `generation_runs`, `generation_run_chunks`, the first successful cache winner and the private retrospective legacy adapter. Failed runs cannot advance cache. The server returns the stored winner rather than a losing concurrent attempt. Source/run history rejects ordinary updates/deletes; a superuser can deliberately override database protections.

Empty context records failure without model clocks/calls. Model/validation errors record safe failure codes if persistence works. Embedding/retrieval/cache-read errors abort before a generation record. Persistence failure exposes a **private in-memory** `PersistenceFailure.checkpoint`, retryable with the same run ID/envelope. Process loss can lose it; no durable job recovery or exactly-once external-call guarantee is implemented. Selected-row locks do not make the entire corpus serializable.

## L–M. Access, CI and deployment

Every admin/cron handler checks demo-only before auth/work, then existing operator secrets in private mode. No cron is scheduled. The reconstructed tables use RLS and explicit grants: anonymous/authenticated SELECT is limited to explicitly synthetic-public presentation rows with visible relations; documents/chunks/history/RPCs remain privileged. Functions use SECURITY INVOKER and fixed empty search paths. Privileged keys are trusted operator authority, not per-user Auth.

`.github/workflows/ci.yml` runs Node 22/locked install, deterministic tests, credential patterns, lint/typecheck/build, demo/archive-mock HTTP and whitespace checks. A separate owned Docker PostgreSQL 17/pgvector job exercises actual SQL with no network/ports. `scripts/database.mjs` also supports installed native PostgreSQL; both paths destroy their own database and accept no remote URL. Complete Supabase Auth/PostgREST execution is still untested.

Git-connected Vercel deploys main to the existing project. Public smoke tests verify actual deployed pages and denials; Chromium checks separately test layout/navigation/focus. Neither is evidence of deployed AI generation, production database parity, legal clearance or full accessibility certification.

## Worked synthetic trace: Maple Eleven–Harbor Eleven

Run `npm test` and `npm run db:test`. They are complementary tests of one contract, **not** one end-to-end Supabase/OpenAI session.

```mermaid
sequenceDiagram
  participant Runner as Local test commands
  participant Core as TypeScript engine tests
  participant Mock as Injected adapters
  participant SQL as Disposable Postgres tests
  Runner->>Core: npm test with fictional input and versioned context
  Core->>Mock: Embedding and retrieval dependencies
  Mock-->>Core: Basis vector and source metadata
  Core->>Mock: Structured response then proofreading
  Mock-->>Core: Qualitative fictional Lens
  Core->>Core: Hydrate normalize and final validation
  Core->>Mock: Versioned persistence envelope
  Runner->>SQL: db:test bootstrap migrations and original seed
  SQL->>SQL: store_document_revision and filtered retrieval
  Runner->>SQL: integration.sql test_payload and test_lens
  SQL->>SQL: Immutable run chunk references and cache winner
  SQL-->>Runner: Role cache cutoff rollback and retry assertions
  Note over Core,SQL: Complementary layers; no gateway or paid vendor session
```

1. `supabase/seed.sql`: `synthetic-match`, Maple/Harbor/Test Ground and document `00000000-0000-4000-8000-000000000001`, “Maple synthetic profile”. The original body states there is no measured performance data. Test availability dates are fictional assertions.
2. `store_document_revision`: persists original body/scope/provenance, `synthetic-basis-1536` / `basis-v1`, vector `[1,0,…,0]`, version UUID and content hash. It is not an OpenAI embedding.
3. SQL retrieval: Maple/global material qualifies; the other-match source does not. A July 10 cutoff removes unknown and later-captured sources. Actual IDs/hashes come from PostgreSQL in SQL tests; unit fixtures use deterministic stand-ins.
4. `tests/rag.test.ts:harness`: injects “A fictional matchup for the integration corpus.” with Low confidence, empty edges and explicit uncertainty. Proofreading is mocked; hydration, normalization, schema and identity checks are actual code. The fixed injected unit clock is deterministic—not proof of real historical timing. SQL fixture generation clocks use execution time.
5. `supabase/tests/integration.sql:test_payload/test_lens`: exercises real commit, cutoff/attestation, changed-source invalidation, rollback and concurrent retry contracts. Source snapshots, input snapshot and outputs survive new versions.
6. SQL anonymous cache reads work only after explicit synthetic-public marking. `repository.ts` can map compatible legacy Lens JSON, but its provider-filtered page query intentionally cannot expose this synthetic test match. Production's fictional Q&A comes from a different reviewed local module. There is no hidden bridge or provider-label substitution.

For a technical demonstration, follow the public replay with the [SQL ER diagram](database-contract.md), engine tests and a disposable database run. The SQL corpus and public fictional module are separate datasets.


Code navigation for the worked trace: [original SQL corpus](../supabase/seed.sql), [revision/retrieval/commit functions](../supabase/migrations/20261104000200_versioned_retrieval.sql), [generation core](../src/lib/rag/engine.ts), [mocked core tests](../tests/rag.test.ts), [real SQL assertions](../supabase/tests/integration.sql), and [legacy replay mapping](../src/lib/supabase/repository.ts).
