# Historical replay and portfolio roadmap

Status after the first replay implementation milestone (2026-11-02): public selection and presentation changes are implemented and locally validated, including independent review fixes; the original audit is committed separately. Delivery does not imply production archive availability. Later phases remain proposals. Use one focused PR per slice, each with evidence, tests, documentation, and an explicit completion check. Keep external services mocked by default and leave production mutations/deployment behind explicit user instructions. Findings refer to [audit.md](audit.md).

## 1. Establish an honest replay surface (H1; public surface implemented)

**Implemented and locally verified:** explicit archive/illustrative modes, fixed URL dates, strict validation, Los Angeles calendar boundaries, shared list/detail selection, separate empty/error/loading states, cached-only analysis, retrospective labeling, stale-status suppression, preserved navigation, removed zero standings/inactive controls, removed the checked-in recurring cron schedule, validated legacy cached JSON, retained fixtures on Lens cache outages, and rejected malformed fixture timestamps. Builds now use system fonts without Google fetches. `npm test` covers selection, date/timezone logic, cached answers, navigation, and status/score presentation without external services.

**Still required before closing every original acceptance criterion:** resolve the configured Supabase project host DNS failure and verify actual historical data availability/rights and backend policies, add mutation-route authorization tests, complete browser/keyboard/mobile verification, and verify the deployed scheduler is disabled through separately authorized deployment. Unit tests and the credential-free local HTTP harness do not establish those deployed integration guarantees. The harness does verify rendered archive/illustrative/empty/error/detail/invalid states with a mock Supabase adapter. Live ingestion/admin/database APIs remain unchanged in purpose. July 11 is the fixed requested landing date; empty/error data does not trigger a substitute dataset.

Implement explicit dataset mode and replay date shared by list and detail; distinguish synthetic examples, historical data, empty dates, and service failures. Use a fixed documented demo default and timezone; remove real-clock dependence from replay. Do not recast existing seed content as verified history. Retire the daily cron from the demo configuration in a separate small change.

**Acceptance:** With the system clock set to two different post-tournament dates, the same replay URL returns identical match selection. Every card opens a detail using the same dataset. Empty and failed loads have distinct states. Illustrative content has a visible label on list and detail. Demo requests make zero provider/OpenAI calls and cannot trigger ingestion; demo deployment configuration declares no recurring ingestion.

**Tests (20 deterministic checks and eight local mock HTTP groups pass; mutation-route checks pending):** Add a credential-free runner/script and focused list/detail selection tests for empty/error/seed/historical modes, replay boundaries and daylight-saving transitions; mocked route tests prove missing/wrong mutation credentials deny access without downstream calls. Cron removal/configuration is covered by a deterministic test; protected-route authorization tests remain pending.

**Docs (implemented):** Replay mode/date/timezone contract and synthetic seed limitations are recorded in architecture; remaining work stays explicit. This phase can use clearly labeled fixtures before historical data approval.

## 2. Define provenance and approved historical inputs (H2, M6)

Create a source inventory and publication policy before committing real datasets. Distinguish publication, capture, event, and forecast-as-of timestamps. Decide which outputs can honestly be called contemporaneous forecasts and which are retrospective reconstructions. Curate a small permitted dataset rather than importing the entire provider archive.

**Acceptance:** Every published record has stable source identity, dataset version/hash, time semantics, and an explicit redistribution decision with attribution. No record with unknown rights is included in the public bundle. Include at least one group fixture and one knockout fixture once permitted; otherwise keep clearly synthetic records and document the limitation. Links/snippets carry traceable IDs and permitted provenance. Replay labels show the selected as-of time and reconstruction status.

**Tests:** Offline dataset validation rejects missing lineage, invalid timestamps, duplicate identities, and unapproved publication status. Tests reject source material published after the forecast cutoff.

**Docs:** Deliver a data dictionary, source/rights manifest, attribution file, and short decision record for temporal semantics. Verify external terms when doing this phase; the audit did not settle rights.

## 3. Repair competition and display semantics (H3, M1, M2, L1)

Separate stable team identity/display code/flag, group membership, stage/round, venue country, match state, and extra-time/penalty results. Remove unsupported strength bars and zero standings before introducing any sourced replacements. Make only the navigation/date/filter controls needed for the chosen demo functional; remove or disable the rest. Keep Q&A labeled as cached when that is what it is.

**Acceptance:** Group and knockout fixtures have accurate distinct labels; a penalty result shows the winner and score breakdown. Unknown metrics render as unavailable, never measured 50/50 strengths. Venue country cannot inherit `World`; unknown locations are labeled. Known aliases resolve to canonical identities/flags. All visible active controls change route/state meaningfully, and no synthetic standings appear as actual results.

**Tests:** Table-driven normalization tests cover aliases, unknown flags, missing venues, knockout rounds, penalties, and provider status variants. Component/browser tests cover list → detail → back, filters, empty results, cached Q&A, keyboard operation, and mobile layout.

**Docs:** Update architecture/data dictionary; document display fallback policy and any strength/standings methodology. Capture a small set of verified screenshots after the flows work.

## 4. Make backend setup reproducible (H5, M5, M7)

Specify the database contract from verified schema evidence; then add reviewed migrations/bootstrap and isolated fixtures in a separately authorized implementation task. Include tables, constraints, indexes/vector dimensions, RPC SQL/filter semantics, grants, and RLS. Establish provider-owned documents and durable identity rules. Keep this independent of public deployment.

**Acceptance:** A clean disposable environment can be initialized from tracked instructions and loads only permitted test data. Publishable credentials cannot mutate privileged tables; unauthorized RPC access follows the documented policy. Retrieval returns only the intended entities/cutoff; repeat fixture/document imports create no duplicates and preserve curated profiles. Missing configuration has a safe diagnostic.

**Tests:** Local integration tests exercise repository mappings, RLS roles, RPC dimensions/filtering/cutoffs, idempotence, pagination/error payloads, and partial write failures. CI uses disposable services and no production secrets; routine runs call no paid APIs.

**Docs:** Deliver backend setup/runbook, safe variable-name example, role/grant matrix, and schema/RPC architecture update. Confirm actual schema before asserting equivalence with a deployed database.

## 5. Make generation traceable and validated (H2, M3, M4)

Version prompts/schema/models/inputs, store immutable generation lineage, validate final postprocessed output, and enforce historical cutoff in retrieval. Distinguish retrieved evidence from claim citations. Add evidence-based assertions or suppress unsupported claims. Define cache keys and invalidation without overwriting historical outputs.

**Acceptance:** Every saved lens identifies dataset/as-of/source versions and prompt/schema/model settings. A future source is excluded. Final validation rejects wrong edge labels/order/values, invalid team names, malformed sources, and ungrounded required claims. Repeated unchanged input selects an existing version; changed inputs create a new traceable version. Public replay reads stored outputs without paid calls.

**Tests:** Mock OpenAI/RPC responses to cover missing context, malformed output, proofreading drift, source counts, retries, and cache/version changes. Add a small reviewed grounding evaluation corpus with an explicit pass threshold (all factual claims supported or marked uncertain); any optional real-model evaluation requires separate cost authorization.

**Docs:** Publish prompt/output contract, generation lineage/cache policy, evaluation method/results, and limitations. Document nondeterminism rather than promising byte-identical model regeneration.

## 6. Bound optional ingestion and operations (H4, M5, M7)

Retain ingestion only if it serves a documented maintenance need. Introduce content/model/chunker hashes, atomic chunk replacement, pagination, bounded/resumable work, overlap prevention, safe errors, and a run ledger. Keep the public replay scheduler disabled. Batch repository reads if expanding archive browsing.

**Acceptance:** An unchanged import/embedding run performs zero embedding requests. Failure during replacement leaves previous chunks usable. Concurrent runs do not duplicate work; interrupted runs resume from a durable checkpoint. Time/token/request budgets are explicit and tested. Logs and responses contain run IDs/safe error codes with no credential or raw sensitive payload output. Actual deployment limits are documented before any operator enables jobs.

**Tests:** Mock counting tests for unchanged/changed/deleted documents, model changes, timeouts, rate limits, concurrency, interrupted writes, and failed steps. Verify all admin/cron authorization paths and secret redaction using dummy values. No test depends on a paid API.

**Docs:** Deliver operator runbook, cost bounds, recovery/rollback steps, job architecture, and scheduling decision. Enabling remote jobs/deployment remains a separate explicit instruction.

## 7. Prepare the public engineering portfolio (H5, M6, L2)

Replace the starter README only after the preceding contracts are truthful. Pin a supported Node/npm setup, make build font dependencies reproducible, add CI for lint/build/tests, update metadata/assets, choose a code license, and complete a no-secret-output repository/history review. Publish only approved data and assets.

**Acceptance:** A reviewer can clone, follow one documented setup path, and run a demo without paid credentials. CI passes lint, production build, unit/component tests, and disposable integration tests. No placeholder control suggests an unsupported feature. All dataset licenses/attributions are present. Deployment instructions separate public configuration from server-only secrets, specify cron-disabled replay defaults, and contain no credentials. No automatic deploy/push is introduced without instruction.

**Tests:** Perform a clean-install/build/demo smoke test in the pinned environment, link/route checks, responsive/keyboard checks, and credential-free CI. Run an approved scanner that reports locations/types without printing secret values; treat discovered credentials through a separate rotation process. Record actual results and remaining limitations.

**Docs:** Rewrite README with purpose, replay scope, screenshots, quick start, architecture link, setup variables, commands, data provenance/rights, AI limitations, tests/evaluation evidence, deployment instructions, and roadmap. Include a concise engineering tradeoff narrative explaining retrieval, temporal correctness, caching, and cost decisions. Refresh architecture and audit status with evidence; do not describe planned work as completed.


## Release gate after delivery review

A clean production build is locally reproducible using system fonts; exact Geist rendering is intentionally traded for no font-network dependency or binary licensing additions. The real archive remains blocked before HTTP by DNS failure at the configured Supabase project host. Do not repair this with invented records or illustrative fallback. Verify/correct the existing project configuration through a separately authorized environment change, then re-run July 11 listing, cached Lens lookup, and list/detail navigation using publishable read access.

No existing Vercel link or deployment credentials were identified locally. Identify the existing project and verify required environment-variable presence without exposing values; verify scheduler removal on deployment. Do not create a new paid project or deploy the default archive until it works. Database schema/RPC/RLS, provenance/rights, placeholder-strength methodology, durable ingestion, CI, README replacement, and visual/accessibility verification remain in later phases.
