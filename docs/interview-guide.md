# Interview guide

Use these as evidence-based talking points, not a script claiming work or results you cannot explain. The project used significant Codex implementation/documentation assistance and owner direction/review. A separate agent review is another context, not an external human security audit. [Walkthrough](technical-walkthrough.md) traces actual code; [freeze audit](audit.md#portfolio-freeze-audit) bounds readiness.

Labels: **Public** = deployed behavior checked through HTTP/browser evidence. **Tested** = deterministic TypeScript or real disposable PostgreSQL coverage. **Adapter** = implemented external-service integration, not exercised with paid calls in the final milestones. **Proposed** = not implemented. No throughput, accuracy, token-cost, user-count or business-impact benchmark is claimed.

## 1. Give me a two-minute project walkthrough

**Public + Tested; speech draft:** “World Cup Lens is a football archive portfolio with five source-linked 2026 results and a separate fictional lab. I separated the public experience from the paid backend: visitors can browse dates, scores, recaps and stored sample questions without database or model credentials. The recaps are authored editorial text, not live AI output.

“The private foundation uses Supabase/Postgres, pgvector and structured generation adapters. Sources are versioned; entity and time eligibility constrain semantic retrieval. The core validates transformed output and stores immutable input/source lineage with a versioned cache. Tests use synthetic vectors and mocked generation, while actual PostgreSQL tests cover permissions, filtering, rollback and retry behavior.

“The key limitation is evidence: shape validation is not factual grounding, old cache rows are retrospective, and the reconstructed schema is not proven production parity. The project was built with substantial Codex assistance and explicit review/verification gates. I can show the public product, the code-to-SQL trace and reproducible tests without claiming a full deployed AI service.”

**Evidence:** `src/lib/deployment-mode.ts`, `src/lib/rag/engine.ts`, `supabase/tests/integration.sql`.
**Follow-up:** Show the boundary that prevents a public request from reaching a paid adapter. What did you verify yourself?

## 2. Why Next.js?

**Implemented; retrospective rationale:** The existing React/TypeScript app benefits from server components for URL-selected data and server-only adapters, with small client components for the menu and stored Q&A. App Router keeps page rendering and guarded HTTP handlers in one repository. This is a justification for retaining the stack, not evidence that alternatives were benchmarked. Pages are request-aware server renders; static local data does not mean static HTML export.

**Evidence:** `src/app/page.tsx`, `matches/[id]/page.tsx`, `about/page.tsx`, `components/layout/top-nav.tsx`, `components/match/match-qa.tsx`.
**Follow-up:** Why does About call `connection()`? What code ships to the browser?

## 3. Why Supabase/Postgres?

**Implemented + Tested:** Relational fixtures, source lineage and caches need FKs, constraints, transactions and role boundaries. Postgres keeps these in one consistency model; Supabase is the retained client/gateway integration. The disposable reconstruction proves SQL behavior; it does not prove production RLS parity or complete Supabase Auth/gateway behavior.

**Evidence:** `supabase/migrations/`, `src/lib/supabase/{server,admin,authoring}.ts`, [contract](database-contract.md).
**Follow-up:** Which checks ran through PostgREST? Why will the new provider archive be empty with publishable credentials?

## 4. Why pgvector instead of Pinecone or another vector database?

**Implemented; retrospective comparison:** The corpus is small and eligibility depends on relational team/match/time metadata. pgvector lets filtering, vector ranking and history share SQL, transactions and grants. A separate vector service would add synchronization and authorization boundaries without a measured requirement here. There was no Pinecone benchmark or vendor bake-off. Current retrieval is exact cosine scan, with no approximate index.

**Evidence:** `match_document_chunks`, `docs/retrieval-design.md`.
**Follow-up:** What workload would justify HNSW or a standalone service? How would you measure filtered recall?

## 5. How does the RAG pipeline work?

**Tested core + Adapter:** Documents become immutable versions and chunks. The embedding adapter validates vectors; a matchup query retrieves eligible chunks. The engine checks versioned cache identity, then on a miss with context requests structured output, proofreads, hydrates excerpts, normalizes and revalidates. Commit atomically retains the run and source identities. Public pages only read local/cached content. Synthetic core and SQL tests cover complementary layers; no full paid end-to-end generation was executed for this foundation.

**Evidence:** `documents/embed-documents.ts`, `rag/engine.ts:runVersionedLens`, `ai/generate-and-save-match-lens.ts`.
**Follow-up:** Which step can incur cost even on a cache hit? What happens with empty context?

## 6. How do you choose relevant documents?

**Tested:** Eligibility restricts current unchanged versions to compatible embedding labels and requested entities; optional historical availability is another gate. Cosine similarity then ranks qualifying chunks. The app requests eight at threshold .15, with stable UUID tie-breaking. That threshold is a design setting, not a calibrated relevance score. No retrieval-quality dataset or measured recall is available.

**Evidence:** `ai/retrieve-context.ts:retrieveVersionedContext`, SQL `match_document_chunks`.
**Follow-up:** How would you choose a threshold using reviewed queries? Why exclude versionless legacy chunks?

## 7. How do entity filters affect retrieval?

**Tested:** Every scope tag on a source must agree. A Maple source tagged to a different match is excluded even if its vector ranks highly. Team, venue and match conditions combine with AND; untagged material requires explicit global status. Null requested filters do not open all tagged documents. This sacrifices some recall to avoid unrelated evidence.

**Evidence:** `supabase/tests/integration.sql`, including “entity filters exclude another match despite shared team”.
**Follow-up:** How would you model genuinely cross-match evidence? Why is a broad OR unsafe?

## 8. How do you prevent historical leakage?

**Tested boundary, limited claim:** As-of retrieval requires established publication and capture times before cutoff. Source edits revoke availability review. The engine also requires an immutable attestation bound to the exact match/team/venue input fingerprint, with cutoff before kickoff. Prompt input excludes final scores and current summaries/status. This enforces recorded operator assertions; it cannot authenticate external clocks, remove pretrained model knowledge or prove model compliance. The HTTP adapter remains retrospective and legacy outputs are never promoted into forecasts.

**Evidence:** `rag/contract.ts:safeMatchInput`, `fingerprint_document`, `authoring_input_attestations`, `commit_lens_generation`.
**Follow-up:** What if an operator lies about capture time? Can an old version be retrieved after the current head changes?

## 9. How do you validate structured outputs?

**Tested + Adapter:** Responses uses the Zod schema, but that is only the first gate. The engine re-parses after proofreading, source hydration and normalization, validates team names and rejects unsupported edges. SQL independently checks final shape. Malformed cache entries fail closed. These checks enforce a contract, not football truth; a plausible unsupported sentence can still be schema-valid.

**Evidence:** `ai/schemas.ts:MatchLensSchema`, `rag/engine.ts:validateFinalLens`, SQL `valid_lens_json`, `tests/rag.test.ts`.
**Follow-up:** Why validate after normalization? What can proofreading change that schemas cannot detect?

## 10. How do you evaluate factual grounding?

**Not yet measured:** There is no real-model grounding evaluation score. Current tests cover eligibility, traceability, shape and honest labels; retrieved excerpts are context, not claim-level citations. The next credible evaluation would use a reviewed synthetic claim-support corpus, counterexamples and explicit supported/unsupported/uncertain decisions. A separately authorized model run would be needed to measure generation quality. Do not call existing tests “hallucination prevention”.

**Evidence:** `docs/rag-pipeline.md`, `docs/roadmap.md`.
**Follow-up:** What counts as support for a claim? How would you detect unsupported claims that copy fluent source wording?

## 11. What is the cache key based on?

**Tested:** SHA256 of canonical JSON covering dataset and input fingerprint, allowlisted input, perspective/cutoff/attestation, model/generator kind, prompt/schema/embedding versions, query/vector/threshold/count and ordered source metadata. Clocks and run UUID are excluded. Changed source/input/configuration creates a new identity. Logical versions do not pin vendor weights; alias drift remains a limitation.

**Evidence:** `rag/contract.ts:canonicalJson/cacheKey`, `rag/engine.ts`, cache-invalidation tests.
**Follow-up:** Why include the query vector? Why does an unchanged query still need an embedding today?

## 12. How do you handle model and database failures?

**Tested:** Embedding/retrieval/cache-read failures stop before generation; empty evidence produces a failed record with no generation clocks. Model/validation failures append a bounded failure code if the database accepts it. Atomic SQL leaves old chunks/cache intact on partial failure. Routes withhold upstream errors and source bodies. There is no global transaction across ingestion, external calls and persistence.

**Evidence:** engine failure tests, SQL injected-cache-fault rollback test, `src/app/api/admin/`.
**Follow-up:** Which failures produce no generation record? Can a partially completed fixture pipeline be safely rerun?

## 13. What if generation succeeds but saving fails?

**Tested primitive, incomplete operations:** The core throws `PersistenceFailure` with a private envelope. Retrying the identical envelope/run ID is idempotent in SQL and avoids another model call. The current HTTP handler returns a sanitized failure and does not durably retain or expose that checkpoint; a process restart may lose it. A durable job/outbox is proposed, not implemented.

**Evidence:** `PersistenceFailure`, concurrent retry and rollback SQL assertions.
**Follow-up:** How would you recover after process loss? What if saving committed but the response was lost?

## 14. How does RLS protect data?

**Tested SQL:** Anonymous/authenticated users can SELECT only explicitly synthetic-public presentation rows with visible relations. Source documents, vectors, lineage and RPCs are privileged. Table grants and fixed-search-path invoker functions complement RLS. The service role is trusted, and real Supabase may bypass RLS; this is not protection from a compromised service key or a deliberate superuser. Production policy parity is unknown.

**Evidence:** migration grants/policies, real role tests with a NOBYPASSRLS service role.
**Follow-up:** Why do both grants and policies matter? How would you implement authenticated operator reads without broadening public provider access?

## 15. How do you test without paid APIs?

**Tested:** Node runs compiled TypeScript tests with dependency-injected embeddings/models. Original synthetic vectors exercise actual pgvector in an owned disposable database. HTTP suites use a local archive mock and an active service-fetch denial tripwire for public routes. CI supplies no real service credentials. Browser and public HTTP checks are additional evidence, not substitutes for SQL tests. Full Supabase gateway/Auth and paid vendor adapters are not covered end-to-end.

**Evidence:** `scripts/test.mjs`, `scripts/database.mjs`, `scripts/verify-{demo,replay,production,design}.mjs`, `.github/workflows/ci.yml`.
**Follow-up:** Which regression did HTTP miss? How did the Docker temporary-server race differ from native testing?

## 16. How would you scale it?

**Proposed:** Start with measured query plans and a reviewed relevance workload. Add durable bounded jobs and persistence recovery, then query-embedding memoization; benchmark exact retrieval before introducing filtered ANN. Stronger corpus snapshot semantics would need a coordinated revision/locking protocol. Consider a separate vector service only after measured storage/latency/operations constraints justify the extra boundary. No capacity or latency estimate is claimed.

**Evidence:** existing pending-document limit 50; [deferred work](roadmap.md#portfolio-freeze-and-remaining-work).
**Follow-up:** How would you preserve entity/cutoff filtering with ANN? What is the first production metric you would instrument?

## 17. What would you change if starting again?

**Retrospective judgment:** Start with explicit dataset/publication modes, a reproducible SQL contract, null unknown metrics and distinct event/source/generation clocks. Separate public reading from authoring immediately. This repository's history shows why live defaults, placeholder strengths and mutable cache rows made a historical demo misleading. Keep the same small public scope rather than restoring live features. This is reflection, not proof those alternatives were originally tested.

**Evidence:** chronological `docs/audit.md`, current deployment/replay/RAG boundaries.
**Follow-up:** Which simplification would you keep? What did you deliberately choose not to build?

## 18. What is the biggest limitation?

**Current:** The private AI foundation is contract-tested, not an authenticated, factually evaluated historical forecasting service. Complete Supabase gateway integration, durable recovery and production schema parity are missing. Provider and broader source rights remain unresolved. The public demo is useful precisely because it does not depend on those unfinished paths; it demonstrates product behavior and engineering boundaries, not live model quality.

**Evidence:** [audit](audit.md#portfolio-freeze-audit), [rights](data-rights.md).
**Follow-up:** What can you honestly demonstrate now? What evidence would change that limitation?

## 19. What did Codex/AI agents change about development?

**Recorded workflow:** Codex performed substantial implementation, testing, documentation and delivery, guided by owner requirements. The useful discipline was making claims inspectable: repository evidence, deterministic tests, an independent agent pass, real SQL/HTTP/browser checks and verified CI/deployment. Agent output still needed scrutiny; actual examples include permissive defaults, a small-screen clipping defect and Docker readiness failures. Do not imply all code was handwritten or independent agent review was an external audit.

**Evidence:** `AGENTS.md`, commit history and milestone records in `docs/deployment.md`.
**Follow-up:** Explain one generated function without assistance. Show a case where a passing check gave insufficient evidence.

## 20. What did you personally review and approve?

**Owner direction is evidenced; personal review depth must be stated honestly.** Recorded owner decisions include the five-match narrow editorial release, credential-free public/private separation, no paid calls or production migrations during these milestones, transparent AI/source labels and the freeze scope. Implementation/testing was substantially agent-driven. Say “I directed and approved these constraints” where supported; claim personal line-by-line SQL or security review only if you actually performed it. This repository cannot establish a human's unrecorded review activity.

A defensible answer is: “I directed the product scope and publication boundaries, and used Codex to implement and verify them. I can explain the dataset separation, filtering, cache and security decisions using the code and tests. I distinguish those decisions from implementation details that still need specialist or production validation.”

**Evidence:** owner-directed release in `docs/curated-history-review.md`, `AGENTS.md`, documented review limitations.
**Follow-up:** Which tradeoff would you defend without the agent? Who has reviewed publisher rights or production policies?
