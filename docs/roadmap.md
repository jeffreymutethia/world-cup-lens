# Historical replay and portfolio roadmap

Status after the first replay implementation milestone (2026-11-02): public selection and presentation changes are implemented and locally validated, including independent review fixes; the original audit is committed separately. Delivery does not imply production archive availability. The current public default is the five-record curated historical branch; the fictional lab and private archive remain distinct. Later phases remain proposals. Use one focused PR per slice, each with evidence, tests, documentation, and an explicit completion check. Keep external services mocked by default and leave production mutations/deployment behind explicit user instructions. Findings refer to [audit.md](audit.md).

## 1. Establish an honest replay surface (H1; public surface implemented)

**Implemented and locally verified:** explicit archive/illustrative modes, fixed URL dates, strict validation, Los Angeles calendar boundaries, shared list/detail selection, separate empty/error/loading states, cached-only analysis, retrospective labeling, stale-status suppression, preserved navigation, removed zero standings/inactive controls, removed the checked-in recurring cron schedule, validated legacy cached JSON, retained fixtures on Lens cache outages, and rejected malformed fixture timestamps. Builds now use system fonts without Google fetches. `npm test` covers selection, date/timezone logic, cached answers, navigation, and status/score presentation without external services.

**Still required before closing every original acceptance criterion:** monitor the recovered project, expand beyond the verified July 11 reads, and verify data rights and backend policies, add mutation-route authorization tests, complete browser/keyboard/mobile verification, and verify the deployed scheduler is disabled through separately authorized deployment. Unit tests and the credential-free local HTTP harness do not establish those deployed integration guarantees. The harness does verify rendered archive/illustrative/empty/error/detail/invalid states with a mock Supabase adapter. Live ingestion/admin/database APIs remain unchanged in purpose. July 11 is the fixed requested landing date; empty/error data does not trigger a substitute dataset.

Implement explicit dataset mode and replay date shared by list and detail; distinguish synthetic examples, historical data, empty dates, and service failures. Use a fixed documented demo default and timezone; remove real-clock dependence from replay. Do not recast existing seed content as verified history. Retire the daily cron from the demo configuration in a separate small change.

**Acceptance:** With the system clock set to two different post-tournament dates, the same replay URL returns identical match selection. Every card opens a detail using the same dataset. Empty and failed loads have distinct states. Illustrative content has a visible label on list and detail. Demo requests make zero provider/OpenAI calls and cannot trigger ingestion; demo deployment configuration declares no recurring ingestion.

**Tests (20 deterministic checks and eight local mock HTTP groups pass; mutation-route checks pending):** Add a credential-free runner/script and focused list/detail selection tests for empty/error/seed/historical modes, replay boundaries and daylight-saving transitions; mocked route tests prove missing/wrong mutation credentials deny access without downstream calls. Cron removal/configuration is covered by a deterministic test; protected-route authorization tests remain pending.

**Docs (implemented):** Replay mode/date/timezone contract and synthetic seed limitations are recorded in architecture; remaining work stays explicit. This phase can use clearly labeled fixtures before historical data approval.

## 2. Define provenance and approved historical inputs (H2, M6; inventory/contract implemented)

**Implemented 2026-11-03:** source/field inventory, actual publisher-terms review, UNKNOWN rights/export gates, separate temporal display metadata, and an additive immutable-lineage contract proposal in `docs/data-provenance.md` and `docs/data-rights.md`. No historical export is approved and no migration/backfill was performed.

Remaining: resolve per-source/account/competition permissions and implement the reviewed provenance schema in a disposable backend before committing real datasets. Distinguish publication, capture, event, and forecast-as-of timestamps. Decide which outputs can honestly be called contemporaneous forecasts and which are retrospective reconstructions. Curate a small permitted dataset rather than importing the entire provider archive.

**Acceptance:** Every published record has stable source identity, dataset version/hash, time semantics, and an explicit redistribution decision with attribution. No record with unknown rights is included in the public bundle. Include at least one group fixture and one knockout fixture once permitted; otherwise keep clearly synthetic records and document the limitation. Links/snippets carry traceable IDs and permitted provenance. Replay labels show the selected as-of time and reconstruction status.

**Tests:** Offline dataset validation rejects missing lineage, invalid timestamps, duplicate identities, and unapproved publication status. Tests reject source material published after the forecast cutoff.

**Docs:** Deliver a data dictionary, source/rights manifest, attribution file, and short decision record for temporal semantics. Verify external terms when doing this phase; the audit did not settle rights.

## 3. Repair competition and display semantics (H3, M1, M2, L1; analytical display mitigated)

**Implemented 2026-11-03:** all numerical strength bars withheld; missing/malformed hidden metrics preserve qualitative copy; stored opinions are uncalibrated; null edge means no stated edge; Lens/Q&A context is not presented as claim-level proof; archive and synthetic commentary/time labels remain distinct.

Remaining: separate stable team identity/display code/flag, group membership, stage/round, venue country, match state, and extra-time/penalty results. Remove unsupported strength bars and zero standings before introducing any sourced replacements. Make only the navigation/date/filter controls needed for the chosen demo functional; remove or disable the rest. Keep Q&A labeled as cached when that is what it is.

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

## 7. Prepare the public engineering portfolio (H5, M6, L2; CI/README implemented)

**Implemented 2026-11-03:** Node major 22 pin and 22.13 minimum, `npm ci`-based push/PR CI with bounded credential-free checks, safe mock settings, fresh-clone typechecking, bounded HTTP cleanup, and a portfolio README documenting actual behavior and limitations. Hosted CI results are available in GitHub Actions; do not infer them from local success.

Remaining portfolio work: complete disposable-backend integration tests, visual/accessibility verification and asset polish; choose a code license and complete a no-secret-output repository/history review. Publish only approved data and assets.

**Acceptance:** A reviewer can clone, follow one documented setup path, and run a demo without paid credentials. CI passes lint, production build, unit/component tests, and disposable integration tests. No placeholder control suggests an unsupported feature. All dataset licenses/attributions are present. Deployment instructions separate public configuration from server-only secrets, specify cron-disabled replay defaults, and contain no credentials. No automatic deploy/push is introduced without instruction.

**Tests:** Perform a clean-install/build/demo smoke test in the pinned environment, link/route checks, responsive/keyboard checks, and credential-free CI. Run an approved scanner that reports locations/types without printing secret values; treat discovered credentials through a separate rotation process. Record actual results and remaining limitations.

**Docs:** Rewrite README with purpose, replay scope, screenshots, quick start, architecture link, setup variables, commands, data provenance/rights, AI limitations, tests/evaluation evidence, deployment instructions, and roadmap. Include a concise engineering tradeoff narrative explaining retrieval, temporal correctness, caching, and cost decisions. Refresh architecture and audit status with evidence; do not describe planned work as completed.


## Release gate after delivery review

A clean production build is locally reproducible using system fonts; exact Geist rendering is intentionally traded for no font-network dependency or binary licensing additions. The existing project recovered during the 2026-11-03 investigation: canonical URL was confirmed in the dashboard, followed by successful publishable reads for two July 11 fixtures/joins/lenses and local list/detail rendering. The initial DNS failure progressed through HTTP 521 and dashboard “Coming up…”; no agent configuration/data changes were required. The original outage trigger is unverified. Preserve truthful error states and monitor recurrence; never substitute invented records or illustrative fallback.

No existing Vercel link or deployment credentials were identified locally. Identify the existing project and verify required environment-variable presence without exposing values; verify scheduler removal on deployment. Do not create a new paid project or deploy the default archive until it works. Database schema/RPC/RLS, provenance/rights, placeholder-strength methodology, durable ingestion, broader integration and visual/accessibility verification remain in later phases. CI and README are now implemented, subject to actual hosted-run evidence.


## Next milestone after connectivity/CI documentation

Prioritize reproducible backend contracts and historical source provenance: document the verified schema/RPC/grants from authorized evidence; define and test source/as-of time semantics; inventory rights; remove placeholder strengths from upstream authoring inputs without rewriting history; expand publishable-read checks across stages/dates. July 11 availability alone does not establish those guarantees. Identify the existing Vercel project and verify its required configuration before considering deployment; no verified public URL is currently documented.


## Public demonstration branch — implemented

The public default is now a reviewed, self-contained fictional lab, not an uncleared historical export or database-dependent landing page. New original examples replace the legacy real-team seed; source approval is version/scenario scoped and leaves all old UNKNOWN categories untouched. WCL_DEPLOYMENT_MODE defaults/fails closed to demo-only, explicit archive requests are rejected, archive controls disappear, and all authoring/cron methods are disabled before work. Archive-enabled remains available as a separate local/private server opt-in.

Implemented acceptance: featured/list/detail, two-date exploration, stored sample Lens/Q&A, functional links, architecture walkthrough, original icon, license notices, and version/fiction labels. Tests cover missing/invalid configuration and credentials, disabled routes even with valid dummy secrets, an active zero-service-fetch tripwire, and missing/malformed examples. CI runs archive mocks and public demo checks separately. See the source/provenance/rights documents for boundaries.

Release gate for this original demo: identify/connect an existing authorized Vercel target, verify demo-only configuration without service keys/cron, build/review, and perform public GET smoke tests. Do not create paid resources or infer deployment from local success. Next historical work remains source rights/lineage, reproducible schema/RLS and upstream placeholder removal. Broader visual/accessibility testing and repository-history/license review remain separate work.


## Public deployment — first release verified

On 2026-11-03 the existing `jt254/world-cup-lens` project deployed reviewed commit `8299114` to https://world-cup-lens-one.vercel.app. Dashboard evidence confirmed production `main`, Next.js/root, no service credentials, demo-only production flag and disabled platform cron. Public smoke tests passed; an explicit bounded production HTTP command was added. No empty trigger commit or duplicate project was needed.

Real browser QA found a 320px featured-card clipping defect, now addressed in release follow-up sizing. Maintain genuine screenshots and final revision evidence in [deployment.md](deployment.md). Next: broaden browser/device, screen-reader and accessibility automation; complete historical rights/lineage and reproducible backend contracts before any historical publication. Public availability does not clear those source rights or authenticate old forecasts.


**Release follow-up verified:** `a8150be` passed hosted CI, automatic production deployment and public smoke checks. The 320px clipping defect was fixed and checked on the actual public domain; genuine desktop/mobile/focus captures are tracked with revision metadata. The original-demo deployment gate is complete. Remaining QA is broader cross-browser, screen-reader, contrast/touch-target and physical-device coverage; historical publication remains separately blocked by rights/lineage/backend work.


## Earlier curated historical review — internal HOLD (superseded below)

The 2026-11-03 [candidate review](curated-history-review.md) verified the requested source fields but did not approve the exact public-source/branded portfolio release. FIFA's conditional noncommercial editorial website guidance is acknowledged; GitHub source-distribution compatibility, use context and existing name/domain remain scoped questions. This does not require an unrestricted licence to a provider database, and no such data was exported. The fictional public default and private archive remain intact.

**Unblock:** establish a documented basis for the small source-distributed selection and intended use, plus an assessed branding decision or alternative. Record per-field/category scope, attribution and restrictions.

**Then implement:** a separate versioned curated module, reviewed result/round/venue/AET fields, original retrospective commentary, supporting links and date/detail/back navigation. Make it the public default only after approval.

**Acceptance/tests:** exact approved tuples and provenance; event-day versus publication-day/timezone cases; final/AET presentation; attribution/rights status; fictional/private-archive isolation; no service fetches; unchanged authoring/cron denials; local/hosted CI and production/browser checks. These new historical record/UI tests were not added or reported as passing while the module is withheld. Deliver source inventory, approval decision, updated diagrams and genuine screenshots of any later approved release.


## Owner-directed curated historical centerpiece — implemented 2026-11-03

Supersedes the earlier internal HOLD for exactly five independently selected facts/records and original editorial context, version `wcl-curated-2026-v1`. It does not clear provider data, protected media, trademark use or unrestricted downstream redistribution. [Source/publication review](curated-history-review.md) records the owner decision, primary sources, access limits and remaining uncertainty.

**Implemented acceptance:** public demo defaults to curated July 11; four working event-day links; five exact final results/stages/venues/AET labels; date-only storage with explicit unknowns; featured/list/detail/back navigation; original retrospective editorial context separate from Match Lens; primary attribution/review metadata; unofficial shared footer; separate explicit fictional lab and unchanged private Supabase archive/authoring guards. No external service is required for public browsing. The [worked example](architecture.md#curated-history-contract-and-worked-example) traces Norway–England.

**Tests:** deterministic exact tuple, precision, AET, metadata, malformed-record/enum, empty/error, featured and isolation cases; shared local/remote HTTP expectations for all five details/four dates, attribution and guards; active local fetch-denial instrumentation; private archive mock regressions. Runtime `104f984` passed hosted CI, automatic Vercel deployment and seven production HTTP groups. Current interactive/browser QA remains blocked by automation availability; earlier fictional screenshots are not historical UI evidence. Details are revision-specific in [deployment.md](deployment.md).

**Next independent phases:**

1. Broader accessibility and responsive verification: keyboard-only form/links/Q&A at 320/390/1280px, screen-reader labels and focus/contrast checks. Add focused regression evidence and genuine captures; document browser/assistive-tool limits.
2. Evidence maintenance: recheck source availability and date discrepancies; establish a reviewed source-revision/hash contract without redistributing protected documents. Acceptance: source changes cannot silently revise stored facts; tests and provenance review accompany any version change.
3. Private archive contracts and honesty: track disposable schema/RPC/RLS; remove upstream 50/50 inputs and derived geography/code mistakes; add immutable source/capture/generation/cutoff lineage. Acceptance/tests/docs remain those in earlier phases; no automatic production migration or regeneration.
4. Rights before expansion: independently assess branding, monetisation and broader dataset/source-distribution use. Acceptance: source/category decisions stay explicit; UNKNOWN inputs cannot inherit this five-record release decision. No bulk/provider export without its own approval.


## Editorial redesign — implemented and locally verified

Baseline `8cd2323`; supplied v2 design/copy reference. Implemented: one responsive header, forest scoreboard hero, four curated day links, no featured duplication, centered detail scores, concise original recaps, visible primary source link plus expandable evidence, same-day related match, and a secondary fictional lab. Private archive/security boundaries are unchanged. Original copy revisions are versioned v2; all five historical facts are preserved.

Deterministic tests add secondary-list isolation, source-label accuracy, date-only labels, copy versions and palette contrast. Rendered HTTP checks assert one h1, no curated form, one instance of each fixture, current date, related-match eligibility, attribution and unchanged demo denials. Independent code/accessibility/copy review found no substantive blocker and identified focus-padding polish, now addressed.

Real headless Chromium captures and checks now pass at 320/390/768/1280/1440px: overflow, menu, date/detail/back navigation, source disclosures, skip/focus/keyboard, fictional Q&A, reduced motion and zero console/external-page-request errors. A 320px long-name wrap and capture-layer artifact were found and fixed. Independent visual review compared actual images to the supplied references. [Design evidence](design.md) distinguishes local browser results from physical-device/screen-reader/cross-browser coverage and hosted deployment. Final delivery evidence belongs in [deployment.md](deployment.md). Broader backend lineage/rights/RLS work remains independent and unresolved.


Editorial redesign delivery completed: runtime `1bf320c` passed hosted CI, automatic Vercel deployment, seven production HTTP groups and the complete headless-browser matrix. README now uses genuine production screenshots. Independent code/accessibility/copy/visual review fixes include muted contrast, date-focus padding, long-name fit, skip/capture stability and 44px question controls. [Production evidence](deployment.md#editorial-redesign--production-verified-2026-11-04) and [all captures](design.md#production-recheck--passed-2026-11-04) retain scope/limits. Next accessibility slice: physical devices, Safari/Firefox and assistive-technology/contrast audit beyond the checked palette and controls. Private-backend rights, lineage, placeholder-input and reproducible-schema work remains separate.

## Backend foundation milestone — 2026-11-04

**Implemented for disposable/private operation:** clean schema/RPC/RLS reconstruction; original synthetic seed; PostgreSQL/pgvector integration runner; strict entity/current-version/cutoff retrieval; atomic incremental document versions; final generation validation; exact input attestation; immutable run/source/input lineage; deterministic versioned cache with idempotent persistence; privileged authoring preflight; credential guard and database CI job. Public curated/fictional UI and demo-only guards remain unchanged. No production migration or paid evaluation was performed.

This completes the reproducible SQL/testing slice of phase 4 and the minimal testable lineage/validation slice of phase 5. It does **not** complete production parity, authentic historical forecasts or factual-grounding evaluation. Existing historical acceptance criteria remain future work where they exceed these verified capabilities.

Remaining independent phases, in priority order:

1. **Isolated Supabase adapter contract.** Exercise migrations through actual local Supabase/PostgREST/Auth; assert repository joins and privileged authoring adapters against the gateway. Acceptance: clean bootstrap and HTTP role matrix pass without external credentials; no widening provider publication. Docs: record gateway/version differences and explicit production upgrade proposal; no automatic migration.
2. **Durable authoring operations.** Persist retry checkpoints/job state, bounded document batches and operator recovery tooling; clarify corpus revision semantics. Acceptance: process termination after model success resumes persistence without another model call; duplicate jobs preserve one cache winner and full attempt history. Tests: fault injection, concurrent head changes and queue retry; docs: operations/recovery runbook. No recurring cron before separate authorization.
3. **Grounding and temporal evidence.** Reviewed synthetic claim-support evaluation, authenticated publisher capture/availability evidence and input attestation procedures. Acceptance: unsupported claims rejected or visibly uncertain; future/unknown material excluded; no certification of legacy output. Tests: adversarial source instructions, misleading but schema-valid claims and temporal leakage. Docs: evaluation results and limits. Any real model evaluation needs separate cost authorization.
4. **Provider normalization and rights.** Resolve venue country/code aliases/canonical statuses, review legacy placeholder-contaminated documents and source rights before migration/export. Acceptance: source-specific review, supported normalization tests, no unapproved publication. Docs: rights/lineage decision records; production backfill/migration remains separately authorized.
5. **Final portfolio verification.** Reconcile actual deployed schema with proposed contract using authorized catalog evidence; exercise broader browser/assistive technology QA and review operational/security claims. Acceptance: reproducible local/CI walkthrough and factual limitations; no claim of production readiness solely from passing checks.
