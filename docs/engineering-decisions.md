# Engineering decisions

Status: current architecture decisions, with costs and reversal conditions. The full-tournament scope supersedes the earlier five-match portfolio boundary. These records describe the current implementation and its supporting tests. Alternatives below are **retrospective comparisons** unless a documented experiment is cited; no database/vendor/performance bake-off occurred. See [audit](audit.md#portfolio-freeze-audit) for unresolved work.

## ADR 1 — Postgres and pgvector

- **Context:** Fixtures, entity scope, source history, vectors and caches share relational identities and permission requirements.
- **Alternatives:** A separate vector database such as Pinecone; lexical-only retrieval. These were compared conceptually, not benchmarked.
- **Decision:** Retain Supabase/Postgres and exact pgvector cosine retrieval with relational eligibility.
- **Reason:** One FK, transaction and grant model avoids a second index's synchronization/security boundary. Embeddings can match related wording; entity filters prevent semantic similarity alone from selecting unrelated documents.
- **Cost/limit:** Exact scans are not a large-corpus scale claim. Embeddings require separately authorized paid work outside tests; relevance has not been evaluated. No ANN index is installed.
- **Evidence:** `match_document_chunks`, `documents_current_version_fkey`, `supabase/tests/integration.sql` ranking/filter checks.
- **Revisit:** A measured workload demonstrates unacceptable latency/storage/recall or a justified operational need for a separate service. Benchmark filtered recall before changing query semantics.

## ADR 2 — Cached generation, never per-page model calls

- **Context:** Visitors need reliable pages after a tournament; ordinary browsing should not trigger cost or authoring.
- **Alternatives:** Request-time generation; just mutable per-match cache rows; no AI authoring path.
- **Decision:** Public pages read reviewed local material; private pages read cached Lens data. Authoring checks a versioned cache before model generation.
- **Reason:** Reading remains usable without paid services and outputs can be inspected separately from a page request.
- **Cost/limit:** Private cache lookup still embeds the query and retrieves sources. Old legacy outputs are unverified retrospective text. Cache hits do not establish factual accuracy.
- **Evidence:** Public pages/replay guards, `runVersionedLens`, demo HTTP service-fetch tripwire.
- **Revisit:** Memoize query embeddings when measured cost/repeated authoring justifies it; any interactive generation would need a separate product, budget, abuse and rights decision.

## ADR 3 — Structured output plus deterministic final validation

- **Context:** Model responses must fit an existing qualitative UI without pretending numerical strengths are measured.
- **Alternatives:** Unrestricted prose or trusting only the provider's initial structured response.
- **Decision:** Zod structured output, prose-only proofreading, deterministic excerpt hydration/normalization, then strict final schema and team-identity checks. New numerical edge arrays are empty. SQL checks final shape again.
- **Reason:** Transformations can break lengths/shape after initial parsing; validation belongs after them too.
- **Cost/limit:** Shape and identity are not grounding. Proofreading can change meaning without breaking schema. No measured factuality/adversarial evaluation exists.
- **Evidence:** `MatchLensSchema`, `validateFinalLens`, `hydrateLensSources`, `valid_lens_json`, malformed/post-transform tests.
- **Revisit:** Add reviewed claim-support evaluation and span-level evidence only when actually testable; do not relabel retrieval excerpts as citations to avoid that work.

## ADR 4 — Immutable revisions and versioned cache

- **Context:** Delete/replace chunks and match-ID-only overwrites lose the evidence behind prior outputs.
- **Alternatives:** Mutable tables alone; a full event-sourcing/job platform.
- **Decision:** Mutable heads plus immutable document/chunk versions and generation runs; first successful cache winner, with a private legacy retrospective adapter.
- **Reason:** A proportionate append-only history explains source/input/prompt/model versions without a distributed platform.
- **Cost/limit:** More storage and explicit versioning; not tamper-proof against administrators. Selected-row rechecks do not supply corpus-wide serializability. Same-key concurrent model attempts can still incur duplicate external cost.
- **Evidence:** `store_document_revision`, `commit_lens_generation`, immutable triggers, retry/rollback/first-winner tests.
- **Revisit:** Durable jobs/checkpoint storage when process-loss recovery becomes an operational requirement. Current checkpoints are in-memory primitives, not a complete operator recovery tool.

## ADR 5 — Default-deny data permissions

- **Context:** Database contents include provider/source rights that remain UNKNOWN; a publishable key is not publication permission.
- **Alternatives:** Broad anonymous provider reads, or privileged clients in browser code.
- **Decision:** Explicit synthetic-public presentation reads only; sources/vectors/history/RPCs privileged; invoker functions with fixed search paths, RLS and grants. Keep service keys server-only.
- **Reason:** Public demonstration must not force an access-policy expansion to make backend tests pass.
- **Cost/limit:** The old publishable provider archive cannot read new provider rows under this reconstruction. A trusted service role can author data and may bypass RLS in real Supabase; it is not per-user authorization.
- **Evidence:** migrations, real NOBYPASSRLS/anon/authenticated tests, `supabase/authoring.ts`.
- **Revisit:** A separately reviewed authenticated operator-read/publication design with explicit rights and isolated gateway tests. Never widen anonymous access as a shortcut.

## ADR 6 — Retrospective public analysis; gated as-of experiments

- **Context:** A replay date or cache-update timestamp cannot prove what information was known before kickoff.
- **Alternatives:** Label all old outputs pre-match forecasts; reject every historical authoring experiment; infer missing clocks.
- **Decision:** Legacy commentary stays retrospective. New core experiments require publication/capture evidence and an exact input-fingerprint attestation; source edits revoke old availability review. The HTTP adapter stays retrospective.
- **Reason:** Separate event, source, retrieval, generation, cutoff and cache clocks rather than inventing historical precision.
- **Cost/limit:** Operator attestations are assertions, not independent publisher authentication. Current-head-only retrieval can withhold valid older material. A model may possess later knowledge regardless of context filtering.
- **Evidence:** `safeMatchInput`, `fingerprint_document`, cutoff and edited-source integration tests.
- **Revisit:** Authenticated publisher/version evidence and reviewed generation evaluations. Never “upgrade” legacy outputs from timestamps alone.

## ADR 7 — Self-contained public content; separate paid backend

- **Context:** The original live application depended on service availability and publication-sensitive data after the event ended.
- **Alternatives:** Keep live/today defaults, silently fall back to seed fixtures, or expose the private corpus publicly.
- **Decision:** A complete 104-match date-only local archive is primary, with original retrospective Match Lenses and ten extended accounts. The public fictional lab is retired while synthetic tests remain. Private archive reads require exact server opt-in and database grants/RLS; authoring additionally requires a shared secret. Publication is a scoped factual/editorial decision, with no media/provider export.
- **Reason:** Demonstrate the product with honest data boundaries and no service credentials. Local inputs are static; Next renders request-aware pages.
- **Cost/limit:** Detailed editorial accounts cover ten matches; the remaining context is limited to verified facts and tournament relationships. There are no live features or deployed end-to-end AI demonstration. Rights/branding and downstream reuse remain uncertain; no blanket FIFA permission is claimed.
- **Evidence:** `deploymentMode`, `curated-history.ts`, publication reviews, public HTTP/browser tests and schedule-free `vercel.json`.
- **Revisit:** Source rights, security, operational and cost evidence justify a different public capability; a working API key alone does not. The full-tournament expansion was explicitly authorized, but does not activate private generation or broaden UNKNOWN corpus rights.

## ADR 8 — Layered verification and release gates

- **Context:** The system spans rendering, model adapters, database permissions and deployment. A single test layer cannot establish all of those contracts.
- **Alternatives:** Mock-only tests; a production-connected integration suite; manual smoke checks alone.
- **Decision:** Combine deterministic TypeScript tests, disposable PostgreSQL/pgvector assertions, archive HTTP mocks, public service-isolation checks, browser regressions and committed-revision CI/deployment checks.
- **Rationale:** Unit tests isolate validation and failure behavior; real SQL tests exercise constraints, grants, RLS and vector semantics; HTTP/browser checks verify rendering and interaction. Synthetic fixtures keep routine tests reproducible and free of production credentials or paid API calls.
- **Tradeoffs and limits:** More setup and multiple test commands; native PostgreSQL and Docker can expose different startup failures. Mocked generation does not measure model quality, and direct SQL does not cover the full Supabase gateway/Auth stack. Browser emulation is not full accessibility or physical-device coverage.
- **Evidence:** `scripts/test.mjs`, `scripts/database.mjs`, `scripts/verify-{demo,replay,production,design}.mjs`, `.github/workflows/ci.yml`, and [release evidence](deployment.md). The Docker readiness and narrow-screen defects demonstrate why the layers are complementary.
- **Revisit:** Extend coverage when a new integration or verified defect requires it. Add grounding/load evaluation only with a defined workload and explicit execution budget; do not substitute passing contract tests for those measurements.

## Code licence decision remains with the owner

No root repository code licence has been selected. Public visibility is not a general open-source licence; GitHub separately describes on-platform view/fork rights in its [licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) (reviewed 2026-11-04).

Options for a later explicit owner decision include:

| Option | Reason to consider | Question to resolve |
| --- | --- | --- |
| Keep no general code licence | Retain the present review-only posture, without announcing broad reuse permission | Is external reuse/contribution an actual goal? |
| [MIT](https://opensource.org/license/mit) | Concise permissive software grant with notice conditions | Does the owner intend that broad code reuse? |
| [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) | Permissive software terms with explicit patent provisions and redistribution requirements | Are those additional terms appropriate for the contribution/ownership situation? |
| Another owner-selected licence | Different reciprocity or distribution goals | Review actual terms and compatibility before choosing |

This is an options inventory, not legal advice or an applied licence. Third-party package notices remain applicable. Any future code licence must explicitly separate curated facts/source references, original synthetic tests, screenshots/media and UNKNOWN provider/excerpt/model corpora. A software licence cannot grant rights the owner does not hold; neither this document nor a future licence automatically clears FIFA branding, bulk data or historical Git content.


## Final security maintenance — bounded dependency changes

The freeze dependency scan identified upstream advisories affecting the old Next/Zod lockfile and tooling tree. This is a verified dependency finding, not evidence that the deployed app was exploited. The response is a same-major security update, not a product redesign. See the [Next maintainer advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) and [16.4.5 release](https://github.com/vercel/next.js/releases/tag/v16.4.5); feature-specific preconditions differ across advisories.

The app used `shadcn` only through its CSS import, not CLI JavaScript. Rather than ship an unused generator/MCP server/tooling tree, `src/app/shadcn-base.css` retains the exact installed 4.11.0 `dist/tailwind.css` body with its full MIT notice. Original body SHA256: `146941ac3ff65496fdf1cb306e697255328e4dadc7c105d66e36bb031b00f6d6`. `public/third-party-notices.txt` also retains the notice. The runtime components and styles are unchanged; future CSS updates need explicit source/version/licence review. This is licensed dependency code, not a new repository-wide licence or official media asset.

Registry audit counts are a time-specific known-advisory snapshot. A clean result would not prove absence of vulnerabilities or applicability of every reported issue; no production exploit testing is performed. The full local/hosted build, SQL, HTTP and browser gates must be repeated after dependency changes.


Refreshed registry snapshot on 2026-11-04: zero production audit entries and zero high/critical entries overall; 8 moderate development-only entries remain in the minimatch/lint dependency chain. ESLint 9.39.5 is deprecated, but the current React/accessibility plugins declare peers through major 9, excluding ESLint 10. No incompatible major override, forced downgrade or suppression was applied. Coordinated lint-toolchain maintenance remains explicit debt; the CI high/critical gate includes dev dependencies.


The upgraded Next dev server attempted a registry advisory reminder fetch, detected and blocked by the unchanged strict demo tripwire. After reading the installed `agentUpgrade` guide, `next.config.ts` explicitly disables only these experimental reminders (`agentUpgrade: false`). Security monitoring remains an explicit CI `check:security` step. No URL allowlist or framework fetch exception was added to the tripwire; production/application service fetches remain denied. This does not disable framework security fixes or represent an automatic-upgrade system.
