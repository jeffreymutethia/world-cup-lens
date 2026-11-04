# Technical interview guide

Use the [walkthrough](technical-walkthrough.md) for the code-to-SQL trace and [engineering decisions](engineering-decisions.md) for tradeoffs. Answers distinguish four evidence levels:

- **Deployed:** public replay and fictional lab, verified through HTTP/browser checks.
- **Tested:** deterministic TypeScript behavior or real disposable PostgreSQL execution.
- **Integration:** external-service adapters exist, but the reconstructed pipeline has not been exercised end-to-end through Supabase and paid model APIs.
- **Proposed:** improvements not yet implemented.

## 1. Give a two-minute system walkthrough

World Cup Lens provides a small historical archive and a separate fictional analysis lab. The public pages show five source-linked results, date navigation and retrospective editorial context. The fictional lab demonstrates stored commentary and Q&A. Neither public path needs a database connection or model request.

The private backend uses Supabase/PostgreSQL for fixtures, versioned documents, vector chunks and cached output. Retrieval combines pgvector cosine similarity with entity, version and optional temporal eligibility. On a cache miss with context, the generation core requests structured output, proofreads it, attaches excerpts and validates the final result. Atomic SQL preserves input/source lineage and selects a successful cache winner.

Tests exercise the generation core with injected responses and SQL contracts against disposable PostgreSQL. CI also checks public isolation and archive rendering with HTTP mocks. This establishes reproducible behavior at those layers; grounding quality, complete gateway integration and production-load behavior remain unmeasured.

**References:** `src/app/page.tsx`, `src/lib/rag/engine.ts`, `supabase/tests/integration.sql`.
**Follow-up:** Trace the exact point where a public request is prevented from reaching an external-service adapter.

## 2. Why Next.js, and what belongs on the server versus the client?

Server components select URL-driven data and render match pages. The menu and stored-answer selector use client state. Server-only modules contain privileged Supabase and model adapters. This keeps data selection and credentials out of browser code while retaining small interactive components. It is a rationale for the current design, not a claim of a framework benchmark. Local datasets are static inputs; the application is not a static HTML export.

**References:** `src/app/{page.tsx,about/page.tsx,matches/[id]/page.tsx}`, `src/components/layout/top-nav.tsx`, `src/components/match/match-qa.tsx`.
**Follow-up:** Why does About call `connection()`? What would break if a privileged module entered the client import graph?

## 3. Why PostgreSQL and Supabase?

**Tested SQL; integration boundary:** Fixtures, source versions and cached outputs have relational identities and consistency requirements. PostgreSQL supplies FKs, constraints, transactions and permissions; Supabase provides the existing client/gateway integration. The disposable SQL contract is reconstructed from application requirements and limited column/type discovery. Its behavior is tested, but production schema parity and complete Supabase Auth/PostgREST behavior are not established.

**References:** `supabase/migrations/`, `src/lib/supabase/{server,admin,authoring}.ts`, [database contract](database-contract.md).
**Follow-up:** Which behavior was tested directly in PostgreSQL, which through HTTP mocks, and which through a real Supabase gateway?

## 4. Why pgvector rather than a separate vector database?

**Implemented; architectural comparison:** Entity scope and source availability are relational filters. pgvector keeps vectors, metadata, history and permissions in one database. A separate vector service would require synchronization and another authorization boundary. Current retrieval uses an exact scan; no Pinecone comparison, filtered-recall benchmark or ANN performance result is available.

**References:** SQL `match_document_chunks`, [retrieval design](retrieval-design.md).
**Follow-up:** What measured workload would justify HNSW or another service? How would filtered recall be evaluated?

## 5. How does the RAG pipeline work?

**Tested core + external adapters:** Document revisioning stores immutable chunks and embedding metadata. A matchup query retrieves eligible context, then the engine builds a cache identity. A hit returns validated cached text. A miss with evidence runs structured generation, proofreading, excerpt hydration, normalization and final validation before atomic persistence. Public pages do not run this workflow.

**References:** `src/lib/documents/embed-documents.ts`, `src/lib/rag/engine.ts:runVersionedLens`, `src/lib/ai/generate-and-save-match-lens.ts`.
**Follow-up:** Which operation still occurs on a private cache hit? Why are generation and page rendering separate?

## 6. How are documents ranked?

**Tested:** Eligible current-version chunks are scored by cosine similarity. The application requests eight results at an inclusive .15 threshold; SQL orders similarity descending and chunk UUID ascending for deterministic ties. Embedding labels must agree between query, version and chunk. The threshold is a selection parameter, not a calibrated confidence measure.

**References:** `src/lib/ai/retrieve-context.ts:retrieveVersionedContext`, SQL `match_document_chunks`.
**Follow-up:** How would a reviewed query set help choose the threshold? What is lost by excluding versionless legacy chunks?

## 7. How do entity filters constrain semantic retrieval?

Every nonnull scope tag must match. A source tagged to Maple Eleven and a different match is excluded even if its vector ranks highly. Team, venue and match constraints combine with AND. Untagged material requires explicit global status; null requested filters do not open all tagged sources. Similarity ranks candidates only after eligibility is satisfied.

**References:** `match_document_chunks`, the SQL assertion “entity filters exclude another match despite shared team”.
**Follow-up:** How would cross-match evidence be represented deliberately? Why would broad OR filtering admit unrelated context?

## 8. What does the historical cutoff guarantee?

**Tested input boundary:** Source publication and capture must be established at or before cutoff. Content/provenance edits revoke availability review. As-of experiments also require an attestation bound to the exact match/team/venue fingerprint, with asserted availability at/before cutoff and cutoff before kickoff. Recording that attestation can happen later. Prompt input excludes scores, mutable summaries, strengths and current status.

These checks enforce recorded assertions; they do not authenticate publisher clocks, remove later knowledge from model weights or prove compliance. The HTTP adapter remains retrospective, as do legacy cached outputs.

**References:** `src/lib/rag/contract.ts:safeMatchInput`, `fingerprint_document`, `authoring_input_attestations`, `commit_lens_generation`.
**Follow-up:** What if availability evidence is false? Can a previously valid version be selected after its current head changes?

## 9. Why validate after structured generation?

Proofreading, excerpt hydration and normalization can alter otherwise valid output. The engine therefore re-parses after transformations, validates opponent names and rejects unsupported numerical edges. SQL separately checks final shape. A schema-valid sentence can still be factually unsupported; contract validation and grounding evaluation are different concerns.

**References:** `src/lib/ai/schemas.ts:MatchLensSchema`, `src/lib/rag/engine.ts:validateFinalLens`, SQL `valid_lens_json`.
**Follow-up:** Give an example of a postprocessing failure. What semantic changes could pass the schema?

## 10. How is factual grounding evaluated?

**Proposed evaluation:** No real-model grounding score has been measured. Existing tests cover eligible evidence, traceability, output shape and presentation labels. A grounding evaluation would need reviewed claims, supporting spans, unsupported counterexamples and explicit uncertainty criteria. Retrieved excerpts alone do not establish claim support.

**References:** [RAG limits](rag-pipeline.md), [remaining work](roadmap.md#portfolio-freeze-and-remaining-work).
**Follow-up:** How would support be labeled and disagreements resolved? How would a fluent unsupported claim be detected?

## 11. What determines cache identity?

**Tested:** SHA256 of canonical JSON covers input/dataset fingerprints, allowlisted match input, perspective/cutoff/attestation, model/generator kind, prompt/schema/embedding versions, query/vector/parameters and ordered source metadata. Execution clocks and run IDs are excluded. Changed evidence or configuration produces a new key. Logical model labels do not pin vendor weights.

**References:** `src/lib/rag/contract.ts:canonicalJson/cacheKey`, `runVersionedLens`, cache-invalidation tests.
**Follow-up:** Why include the query vector? What would query-embedding memoization need to preserve?

## 12. How are failures handled?

Embedding, retrieval and cache-read failures stop before generation. Empty context records failure without model calls or generation clocks. Model/validation failures persist bounded error codes if the database accepts the record. Atomic revision/cache writes leave previous successful state intact on failure. Error responses withhold upstream payloads; there is no transaction spanning the entire pipeline and external services.

**References:** `tests/rag.test.ts`, injected persistence-fault assertions in `supabase/tests/integration.sql`, `src/app/api/admin/`.
**Follow-up:** Which failures create no generation record? What earlier ingestion work remains committed after a later step fails?

## 13. What if generation succeeds but persistence fails?

**Tested recovery primitive:** `PersistenceFailure` carries the private envelope. Retrying its identical run ID/submission is idempotent, including when the first commit succeeded but its response was lost. The HTTP handler does not durably store or return the checkpoint. Process loss can therefore require repeated work. Durable job/checkpoint storage is proposed.

**References:** `PersistenceFailure`, `commit_lens_generation`, concurrent retry and rollback tests.
**Follow-up:** Where would a durable checkpoint be stored? When must a stale envelope be discarded rather than retried?

## 14. How do RLS and route authorization differ?

The deployment guard disables archive reads and authoring in demo-only mode. In private mode, archive pages use publishable reads subject to database grants/RLS; they have no application-level user login. Authoring additionally requires an operator secret and privileged server client. The reconstructed schema allows anonymous/authenticated SELECT only for explicitly synthetic-public presentation rows; source/vector/history/RPC access stays privileged.

The service role is trusted and can bypass RLS in real Supabase. This is not protection against a compromised service key or deliberate administrator changes.

**References:** `src/lib/deployment-mode.ts`, `src/app/api/admin/`, migration grants/policies and real NOBYPASSRLS role tests.
**Follow-up:** Why are grants and policies both necessary? How should authenticated operator archive reads work without widening public provider access?

## 15. How is the system tested without paid calls?

Injected embeddings and model responses exercise the TypeScript core. Original synthetic vectors exercise actual PostgreSQL/pgvector constraints, ranking and permissions. HTTP suites mock the archive gateway and deny app service fetches on demo paths. Browser checks verify interactions separately. These layers are complementary, not a complete Supabase/OpenAI end-to-end session.

**References:** `scripts/test.mjs`, `scripts/database.mjs`, `scripts/verify-{demo,replay,production,design}.mjs`, `.github/workflows/ci.yml`.
**Follow-up:** What did the Docker startup race expose that native tests missed? Which UI defect would an HTTP assertion fail to catch?

## 16. How would the system scale?

**Proposed:** Measure query plans, filtered recall and authoring workloads first. Add durable bounded jobs, persistence recovery and query-embedding memoization. Benchmark exact retrieval before adding ANN. A stronger corpus snapshot needs a coordinated revision/locking protocol. Another vector service is justified only by measured requirements; no capacity or latency estimate is established here.

**References:** pending-document limit 50, [retrieval consistency](retrieval-design.md#consistency-and-tests), [roadmap](roadmap.md).
**Follow-up:** How would an ANN index interact with selective entity filters? What operational metric should be collected first?

## 17. Which architectural tradeoffs matter most?

Public local content trades tournament coverage and live generation for reliable credential-free browsing. PostgreSQL consolidates consistency and permission boundaries but exact retrieval has scale limits. Immutable versions improve traceability while increasing storage. Default-deny policies protect publication-sensitive data but leave the legacy publishable provider reader incompatible with the new private defaults.

**References:** [engineering decisions](engineering-decisions.md).
**Follow-up:** Which constraint would justify reversing a decision? Which comparison is conceptual rather than benchmarked?

## 18. What is the largest current limitation?

The private backend is contract-tested, not a factually evaluated historical forecasting service. Complete gateway/Auth testing, durable recovery, production schema parity and authenticated source evidence remain open. The public product demonstrates replay and stored-sample behavior independently of those unfinished integrations.

**References:** [current findings](audit.md#current-findings), [data rights](data-rights.md).
**Follow-up:** What can be demonstrated directly today? What evidence would justify a stronger production claim?

## 19. Where are the transaction and concurrency boundaries?

`store_document_revision` locks a document, rejects changed inputs and inserts its version/chunks/head atomically. `commit_lens_generation` locks the match and selected inputs, rechecks retrieval, and writes run references, cache winner and retrospective adapter in one transaction. Concurrent identical envelopes are retryable; distinct successful attempts can remain in history while the first identical-key cache winner is retained.

Fixture/team/venue upserts are separate statements. Selected-row checks do not prevent every new corpus candidate from appearing concurrently, and external generation cannot join a database transaction.

**References:** `supabase/migrations/20261104000200_versioned_retrieval.sql`, concurrency/fault tests.
**Follow-up:** Why use a no-key-update match lock? What stronger guarantee would a corpus revision provide?

## 20. What evidence is required before a release?

A change should have targeted deterministic checks, real SQL tests when database behavior changes, type/lint/build verification and relevant HTTP/browser regression coverage. CI verifies the committed revision; Vercel status and public checks establish deployment separately from a successful push. Each result should state its layer: an HTTP mock does not prove live RLS, a screenshot does not prove accessibility certification, and a schema check does not measure model quality.

**References:** `.github/workflows/ci.yml`, [verification strategy](engineering-decisions.md#adr-8--layered-verification-and-release-gates), [deployment evidence](deployment.md).
**Follow-up:** How would an intermittent or unavailable gate be reported? Which verification is necessary for a documentation-only change?
