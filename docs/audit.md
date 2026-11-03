# Repository audit

Audit date: 2026-11-02. Scope: tracked files, dependency manifests/configuration, routes, types, clients/repository, ingestion, AI pipeline, caching, cron, presentation, tests/CI, and README. Initial `git status --short` was clean. No application code, dependencies, environment files, or migrations were changed. No Supabase queries, provider/paid API calls, admin routes, embedding routes, or cron routes were invoked. Findings describe static code unless explicitly marked as check results; live data and infrastructure were not inspected.

## Replay milestone follow-up — 2026-11-02

The findings below preserve the initial audit evidence. Current resolution status is scoped to demonstrated local implementation:

- **H1 resolved in public selection code:** `src/lib/replay.ts:parseReplaySelection/loadReplay/findReplayMatch` and both public pages now use explicit modes and fixed dates, with no seed fallback. Tests cover empty/error states and cross-mode/date mismatches. Actual database availability is still unverified.
- **H2 partially mitigated in presentation only:** `ReplayNotice` labels cached archive analysis retrospective and explicitly disclaims an authenticated pre-kickoff cutoff. Historical source filtering and immutable lineage are still missing.
- **H4 scheduled trigger removed from checked-in configuration:** `vercel.json` no longer schedules the route. Full-corpus embedding and long request risks remain in the retained pipeline; no deployed scheduler was changed.
- **H5 test foundation partially addressed:** `npm test`, `scripts/test.mjs`, `tsconfig.test.json`, and deterministic replay tests now exist. Database schema/RPC/RLS, CI, and real integration coverage remain absent.
- **M1 presentation partially addressed:** public pages no longer show zero standings or prepend “Group” to knockout names. They use the date reader's stored score/status fields; intermediate statuses are never called live and partial scores are not turned into zero. Canonical ingestion status, group/stage schema, and shootout breakdown limitations remain.
- **L1 public control/metadata issues addressed in code:** date/mode selection is a GET form; misleading inactive controls are removed and metadata identifies replay. Comprehensive visual/accessibility checks remain pending.

H3, M2, M3, M4, M5, M6, M7, and the README/backend reproducibility parts of L2 remain open. The original local verification table below is the audit baseline, not a claim about the implementation checks; see the replay verification record appended below.

Severity: High blocks a trustworthy public historical demo or reliable operation; Medium materially harms correctness, security posture, or maintainability; Low concerns presentation/documentation. No verified critical exploit is established by this review. File paths below are relative to repository root.

## High

### H1 — Real-clock selection silently becomes illustrative data

**Evidence:** `src/app/page.tsx:Home` catches repository errors and chooses seeded view models whenever provider results are empty. `src/lib/supabase/repository.ts:getProviderMatchesForLocalDate` defaults to `new Date()` and Los Angeles time. `src/data/seed.ts:matches/venues/cachedLenses` contains June fixtures, Riverside Arena/Harbor Stadium and editorial source snippets; `src/components/layout/top-nav.tsx:TopNav` says “Today’s Match Lens.” Fallback is not labeled as illustrative. `src/app/matches/[id]/page.tsx:MatchPage` only reads Supabase.

**Impact:** After the tournament, a normal empty day and a database failure both look like upcoming football. Seed cards can lead to a 404 if their IDs are absent in the database, or a server error if configuration/database access fails. This is a code-derived consequence, not an observed deployed failure. Seed venues and claims have no repository evidence establishing historical accuracy.

**Remediation:** First implement an explicit replay date and dataset mode shared by listing and detail. Distinguish valid empty dates, provider failures, and illustrative content. Label provenance on every displayed mode. Do not promote the existing seed into a historical archive without verification.

### H2 — No historical information boundary or reproducible generation record

**Evidence:** `src/lib/ai/retrieve-context.ts:retrieveMatchContext` sends no as-of cutoff to the RPC. `src/lib/documents/sync-provider-documents.ts:syncProviderDocuments` writes null `source_url`; ingestion uses wall-clock `updated_at`. `src/lib/ai/source-snippets.ts:hydrateLensSources` drops URLs/document/chunk IDs and attaches every unique retrieved title. `src/lib/types.ts:MatchLens` retains only source title/snippet. `src/lib/ai/generate-and-save-match-lens.ts:generateAndSaveMatchLens` overwrites by `match_id` with JSON/model/update time.

**Impact:** A retrospective forecast could use knowledge acquired after kickoff. Displayed sources do not prove individual claims or provide traceable source versions. An update timestamp is neither a source publication timestamp nor a historical knowledge cutoff. Prior outputs cannot be reconstructed from stored writer fields alone. Actual database extras are unknown.

**Remediation:** Define event, publication, capture, and forecast-as-of times; enforce cutoff during retrieval. Persist immutable source IDs/versions, permitted links, content hashes, prompt/schema/model/embedding versions, and generation lineage. Label retrospective reconstruction when contemporaneous provenance is unavailable.

### H3 — Placeholder strengths become analytical evidence

**Evidence:** `src/lib/fixtures/normalize.ts:normalizeApiFootballFixture` and `sync-fixtures.ts:syncWorldCupFixtures` assign all strength fields 50. `sync-provider-documents.ts:teamDocumentBody` repeats these in “Provider-derived” profiles (with a placeholder caveat). `src/lib/ai/prompts.ts:buildMatchLensPrompt` requires supplied values in `teamEdges`. `src/components/match/match-lens-cards.tsx:TeamEdgesCard` presents values and bars without a placeholder label.

**Impact:** Neutral defaults look like measured comparisons and enter retrieval context. Schema-compliant prose is not evidence-based football analysis. Re-sync overwrites any enriched strength fields through the same writer.

**Remediation:** Represent unknown metrics explicitly and hide unsupported comparisons. Add a documented, sourced methodology only if supported by validated inputs; prevent ingestion from overwriting curated enrichment.

### H4 — Scheduled work repeatedly embeds the entire corpus inside one request

**Evidence:** `vercel.json` declares a daily cron. `src/app/api/cron/today/route.ts:GET` awaits `runTodayPipeline`; `src/lib/pipeline/run-today-pipeline.ts:runTodayPipeline` always runs fixture sync, document sync, full embedding, then lens selection. `src/lib/documents/embed-documents.ts:embedDocuments` reads all documents and embeds each before deleting/inserting its chunks. `generate-today-match-lenses.ts:generateTodayMatchLenses` skips cached lenses only after that work. `generate-match-lens.ts` permits two application attempts, each with generation plus proofreading calls.

**Impact:** Repeated API cost continues even on dates with no matches. Request duration scales with corpus and model latency. Timeout/overlap is a risk, not a verified platform failure; no deployment limits are tracked. Delete-then-insert can leave a document without chunks if insertion fails; earlier pipeline writes persist on failure. Concurrent runs can race.

**Remediation:** Disable scheduled ingestion for a static replay deployment through an explicit implementation change. If ingestion is retained, use content/model/chunker hashes, bounded resumable jobs, locking, atomic replacement, budgets, and per-run observability. Verify runtime limits against the actual deployment before enabling jobs.

### H5 — Database and test foundations are absent from the repository

**Evidence:** `git ls-files` contains no SQL, migrations, RPC definition, tests, or CI workflow. `package.json:scripts` defines no test command. `src/lib/supabase/repository.ts` assumes named foreign keys and tables; `src/lib/ai/retrieve-context.ts` assumes `match_document_chunks` and manually casts results. `README.md` is starter documentation.

**Impact:** A reviewer cannot reproduce the backend or verify vector filtering, dimensions, RLS, constraints, or grants. No existing integration checks establish route authorization, ingestion idempotence, historical leakage prevention, or fallback behavior. There are no existing tests to classify as broken; coverage is missing.

**Remediation:** Add an isolated reproducible data contract/bootstrap in a later authorized milestone and credential-free fixtures/mocks. Establish tests and CI before behavior refactors. Verify database policies and RPC semantics in a disposable environment, never by assuming TypeScript types establish them.

## Medium

### M1 — Stage, standings, and result models are incomplete

**Evidence:** `normalize.ts:groupFromRound` falls back to raw round text in `group`; `syncWorldCupFixtures` deduplicates teams with last-row-wins `group_name`, and always writes canonical `status: "scheduled"`. `prompts.ts:buildMatchLensPrompt`, `retrieve-context.ts:retrieveMatchContext`, match cards, and detail page prefix that field with “Group”. `standings-snapshot.tsx:StandingsSnapshot` prints zero MP/GD/points and generic qualification copy. `repository.ts:getMatchViewModel/getMatches` omit score/status columns; the provider payload includes penalty/extra-time scores that the writer discards.

**Impact:** Knockout rounds appear as groups, a team's group can become its latest stage, standings are fabricated placeholders, and result/status detail is lost across screens. A replay cannot reliably explain advancement or shootouts.

**Remediation:** Separate competition stage, group membership, round, match state, and result breakdown. Compute only evidenced standings as of the replay cutoff or omit them. Test group, knockout, extra time, penalties, postponed, and unknown statuses.

### M2 — Identity and venue normalization can mislead

**Evidence:** `sync-fixtures.ts:deriveTeamCode` appends provider IDs to codes; fallback takes the first three name letters. `deriveFlag` uses a finite name lookup and white-flag fallback; England uses a plain black flag. `normalize.ts:safeTeamSlug` uses names, while `safeVenueSlug` uses provider IDs or name/city. Venue `country` is assigned `fixture.league.country`, not the venue country. Seed venues in `src/data/seed.ts` use a separate naming/location set.

**Impact:** Codes are not consistently display codes; aliases can change application identity or miss flags (for example South Korea lacks an override). A provider league country of `World` would be written as venue country; actual persisted values were not queried. Geographic claims and home-country reasoning can therefore be wrong. Specific deployed mismatches remain unverified.

**Remediation:** Separate stable provider identity from canonical display code, maintain tested aliases and country/flag mappings, and use a verified venue registry. Reject or label unknown location data. Audit actual historical records separately with authorized read access.

### M3 — Generation validation is weaker than its prompt contract

**Evidence:** `src/lib/ai/schemas.ts:MatchLensSchema` accepts any short string for `slightEdge` and any four enum-labeled edges, including duplicates or changed values. `proofread-match-lens.ts:proofreadMatchLens` enforces list lengths but not semantic equivalence. `generate-match-lens.ts:generateValidatedLens` parses before proofreading/source hydration and does not re-parse the final result. `source-snippets.ts:hydrateLensSources` can produce source counts outside schema bounds (2–5). `validate-generated-copy.ts:validateGeneratedCopy` checks a short word-pattern list.

**Impact:** Structured output ensures shape at one step, not factual grounding, numerical fidelity, complete sentences, or final-schema validity. A nonempty hydrated source list does not establish that generation referenced those sources.

**Remediation:** Validate final output, exact edge labels/order/values and allowed team names, with explicit fallback/error behavior. Add mocked malformed-output and source-count tests plus a small evidence-grounding evaluation set.

### M4 — Persistent output cache has no invalidation contract

**Evidence:** `generate-today-match-lenses.ts:generateTodayMatchLenses` skips based solely on existing `match_id`; `generateAndSaveMatchLens` overwrites that key. `repository.ts:getAllMatchViewModels` makes one lens request per match after loading all teams/venues/matches. No explicit Next cache/revalidation configuration is present in `next.config.ts` or these readers.

**Impact:** Changed facts, prompts, or model configuration may leave stale outputs; refresh destroys the previous writer version. Bulk archive browsing through the all-match helper would produce N+1 lens reads. It is not the active home-page path.

**Remediation:** Key immutable outputs by dataset/as-of/input versions; define invalidation and batch lens reads before using the helper for an archive.

### M5 — Secrets are gated, but operational security is unverified

**Evidence:** Admin routes under `src/app/api/admin/` deny missing/incorrect `x-admin-secret`; cron denies missing/incorrect bearer secret. `src/lib/supabase/admin.ts` and `server.ts` are server-only. `.gitignore` excludes `.env*` and `.vercel`; no environment files are tracked. Several route catches return `error.message`, log raw error objects, and `api-football.ts:fetchWorldCupFixtures` incorporates response bodies into thrown errors. No app-level rate limits, run locks, or operator identity auditing are tracked.

**Impact:** A shared secret is the visible mutation boundary; deployment protections, rotation, database policies, and log scrubbing are unknown. Provider/database details could reach responses or logs. No secret leak was established; environment contents and git history were not scanned.

**Remediation:** Add safe error codes and redacted structured logs, mocked auth tests for every mutation route, operator/run auditing and bounded execution. Document variable names and deployment setup without values; verify RLS/grants and scan history before publication with a no-secret-output process.

### M6 — Public redistribution rights are unresolved

**Evidence:** API-FOOTBALL supplies fixtures and logo URLs (`api-football.ts`, `sync-fixtures.ts`); embeddings store document content (`embed-documents.ts`), and sources expose snippets (`source-snippets.ts`). No tracked data/source licensing inventory, attribution policy, redistribution approval, or project license exists.

**Impact:** Repository/deployment publication could expose data or derived assets without established permission. This is a missing evidence finding, not a legal conclusion about provider terms; no external terms review was performed.

**Remediation:** Before publishing data, record source, owner, applicable terms/version, allowed storage/embedding/redistribution, attribution, and retention for each dataset/asset. Publish only an approved subset or clearly synthetic examples. Choose a code license separately; do not assume it licenses third-party data.

### M7 — Ingestion is not bounded or fully validated

**Evidence:** `fetchWorldCupFixtures` types the JSON by assertion, ignores pagination metadata, and its error test skips array-shaped `errors`. `syncWorldCupFixtures` upserts entity groups in separate operations without a transaction or stale-row reconciliation. `syncProviderDocuments` finds documents by type/entity without provider ownership and can reuse an existing profile ID; concurrent missing-profile runs can create multiple UUIDs.

**Impact:** Malformed or paginated responses, partial writes, removed fixtures, and concurrent syncs have no established handling. Array error payloads may be missed. Provider sync could overwrite a manually curated profile with the same entity/type. The real provider payload shapes and constraints are unverified.

**Remediation:** Runtime-validate provider responses, handle declared pagination/errors, define reconciliation and profile ownership, add uniqueness/idempotency constraints through a later reviewed migration, and test partial failures using mocks.

## Low

### L1 — Interface promises exceed implemented controls

**Evidence:** `src/app/page.tsx` renders date/group filters as badges; `sidebar.tsx:Sidebar` renders buttons without navigation; `top-nav.tsx:TopNav` search/notification controls have no handlers. `match-qa.tsx:MatchQa` does support selecting cached answers and explicitly labels demo content. `src/app/layout.tsx:metadata` remains “Create Next App”.

**Impact:** A public demo feels unfinished; static labels suggest browsing capabilities that do not exist. Q&A should not be described as live generation.

**Remediation:** Implement a small truthful navigation surface, remove or visibly disable unsupported actions, and test supported flows and keyboard interaction. Update metadata and product copy with replay scope.

### L2 — README and build setup do not explain this project

**Evidence:** `README.md` is the create-next-app template and points to `app/page.tsx` instead of `src/app/page.tsx`. `src/app/layout.tsx` imports `next/font/google`. No tracked runtime-version declaration, safe environment example, backend setup, or operational runbook exists.

**Impact:** Reviewers cannot reliably recreate the app; font network availability affects builds. This audit's build failure is not proof of a TypeScript or application defect.

**Remediation:** Follow the roadmap for README replacement, runtime pinning, reproducible fonts, setup contracts, and CI. Keep secrets out of examples.

## Local verification

| Check | Result | Meaning / limit |
| --- | --- | --- |
| `npm run lint` | Passed, exit 0 | Existing ESLint rules only; no correctness or integration guarantee. |
| `npm run build` | Failed, exit 1 | Next.js 16.2.9 Turbopack could not fetch Geist and Geist Mono from Google Fonts. Full production build/type validation was not established. No workaround or runtime change applied. |
| Existing tests | Unavailable | No test script, tracked tests, or test runner configuration found; no suite was run. |
| `git diff --check` | Passed | Documentation whitespace check; rerun before handoff. |

Build output reported `.env.local` was loaded by Next; contents were not read or printed. The build attempted Google font retrieval as part of the requested check; no application external/paid APIs were invoked. Installed Next documentation for `connection`, route handlers, and fonts was consulted. No dependency vulnerability audit, browser smoke test, deployed cron execution, database policy verification, or license-terms validation was performed. Lint success does not establish production readiness.


## Replay implementation verification

- `npm test`: deterministic TypeScript/Node tests cover strict dates, configured bounds, Los Angeles midnight/DST boundaries, fixed defaults, archive/illustrative selection, empty/error separation, no silent fallback, featured ordering, navigation and detail consistency, cached answers, stale statuses/partial scores, stage labels, and cron configuration.
- `npm run test:replay-http`: local mocked HTTP rendering verifies July 11 landing/listing, cached archive detail, stale-status suppression, missing Lens fallback, distinct empty/query-error states, explicit illustrative list/detail/back links, wrong-date detail, and invalid/out-of-range input. Mock Supabase enforces provider/date filters; illustrative/invalid routes cause zero mock database reads. Dummy child-process credentials isolate the harness from remote data.
- `npm run lint` and standalone `tsc --noEmit --incremental false` passed during implementation. Production `npm run build` failed specifically fetching Geist and Geist Mono from Google Fonts; it did not complete production build validation.
- Local HTTP checks against the configured archive showed the safe error state for landing/July 11 and another date. The underlying cause and actual fixture availability were not established; no data was substituted. Illustrative detail and invalid-date rendering worked. In-app browser was unavailable and native Chrome control timed out, so no screenshots or visual/keyboard/mobile verification are claimed.
- No paid API calls, environment-file changes, production mutations, push, or deployment occurred. Documentation and implementation checks do not establish historical accuracy, redistribution rights, backend policies, or production readiness.


## Delivery review and verification follow-up

Independent review examined the actual diff and identified three resilience defects, now fixed and regression-tested:

1. Unchecked cached Lens/Q&A JSON could crash React rendering. `src/lib/cached-analysis.ts` now validates display compatibility and rejects malformed arrays, sources, enums, and edges. Invalid entries produce unavailable states. Enum membership requires actual strings, preventing array coercion and throwing `toString` objects.
2. A Lens cache query failure hid valid fixtures. `getProviderMatchesForDate` now retains fixtures, marks `lensState`, and the home/detail UI shows unavailable analysis without seed substitution.
3. Invalid kickoff timestamps could masquerade as a successful empty date. `loadReplay` now rejects them as a data error.

The Google-font build blocker is resolved: `src/app/layout.tsx` no longer imports `next/font/google`; CSS uses system font stacks and removes the self-referential sans variable. A clean production build passes with local process/socket permission required by Turbopack. No font binaries were downloaded. Deterministic coverage is now 20 tests plus eight local mock HTTP check groups; lint, TypeScript, and whitespace checks pass. README/CI/backend-bootstrap portions of L2/H5 remain open; build reproducibility has improved without establishing production readiness.

Archive diagnosis: URL/publishable-key configuration is present; a read-only July 11 query failed with `ENOTFOUND` at the configured Supabase project hostname outside the sandbox. The hostname has the expected Supabase form, while known Supabase/GitHub domains resolve. Therefore fixture availability, schema/RLS correctness, and real cached Lens retrieval cannot be verified; this is a DNS/connection blocker rather than evidence of an empty archive. The project might be unavailable or the configured hostname obsolete; neither root cause is asserted. No environment values were printed or changed.

Deployment diagnosis: no local Vercel project link/CLI, project/org environment identifiers, or deployment token were available. No deployment URL appeared in the remote baseline commit statuses. This does not establish that no remote project exists. Production deployment and public production smoke tests were not performed because the existing deployment and real archive prerequisites could not be verified. No generation, embedding, provider sync, cron execution, paid API call, or database write was performed.


Final local production-build smoke check (`next start`, public GET pages only): landing and explicit July 11 render the truthful archive-error state; illustrative list/detail render labeled seed content and cached analysis; an invalid calendar date renders validation feedback. All returned HTTP 200 with their explicit page state. This verifies built application rendering and graceful failure, not a successful real archive or a deployed production experience. The owned local server was stopped after verification.


## Connectivity and CI follow-up — 2026-11-03

**Availability diagnosis and recovery:** the configured URL has valid canonical Supabase project-host syntax, HTTPS/root path, and no userinfo, query, or fragment. Independent OS, A, and AAAA lookups initially returned `ENOTFOUND` while known Supabase/GitHub domains resolved. Existing local project-link/management-token configuration was absent. An authorized browser dashboard confirmed the configured project URL exactly, showed the existing project as “Coming up…”, and exposed recent failed readiness/health requests. DNS then resolved, a publishable read returned HTTP 521, and later reads succeeded. The agent did not resume/restart/create projects, alter environment files/billing, or write data. A service availability/startup transition was observed; the trigger of the original outage, including whether the project had been paused, remains unverified. It was not an empty query result or evidence that the project was deleted.

**Read-only evidence:** publishable-key SELECTs returned HTTP 200, two API-FOOTBALL-linked July 11 fixtures in `[2026-07-11T07:00:00Z, 2026-07-12T07:00:00Z)`, complete joined teams/venues, and two cached Lens rows. The selected match returned zero cached Q&A rows. The real archive homepage, explicit July 11 listing, and one detail rendered locally with cached retrospective analysis. No raw record export or credentials were printed/committed. This verifies access to the tested rows and cache shape in the real rendering path; complete RLS/grants, write restrictions, full tournament coverage, historical accuracy, and licensing are not established.

**CI/portfolio work:** `.github/workflows/ci.yml` now runs push/PR checks on Ubuntu 24.04/Node 22 with `npm ci`, deterministic tests, lint, typecheck, production build, mock HTTP checks, and committed/generated whitespace checks. Official action SHAs are pinned, token permission is read-only, checkout credentials are not persisted, and all steps/job have explicit timeouts. No secret contexts or real API credentials are supplied; dummy loopback settings isolate CI from production. `npm run typecheck` generates Next route types first so a fresh clone does not depend on ignored generated files. Node's declared engine minimum is 22.13, matching a transitive lint dependency; major 22 remains pinned in `.nvmrc`.

**Review fixes:** the HTTP harness now uses a 15-second request deadline, 120-second hard watchdog, and bounded process-group cleanup so Next's dev child cannot retain sockets on macOS/Linux. README states the engine minimum and accurately distinguishes a local real-data smoke test from production deployment. The whitespace step compares the relevant PR/push commit range, not only a clean working tree. README replacement resolves the starter-documentation part of L2; CI addresses the missing workflow part of H5. Backend bootstrap/RPC/RLS, provenance, rights, and broader integration/browser coverage remain open.

**Recurrence action:** if DNS/HTTP 521 returns, inspect the same existing project's dashboard status. Wait for it to become healthy; if startup remains stuck, use the existing project's support/diagnostic path. Do not infer empty data, create a replacement project, change plans, or bypass public reads with a privileged key. If the dashboard URL differs in future, reconcile the URL and matching publishable key through an authorized configuration change without posting values. A Supabase integration was discoverable but unconnected; the browser session sufficed for this read-only diagnosis.


Local follow-up verification used an official checksum-verified Node 22.23.4 runtime: locked `npm ci`, all 20 deterministic tests, lint, fresh `next typegen`/TypeScript checking, clean production build, and eight mock HTTP check groups passed. Build/typecheck and the HTTP harness were exercised with explicit dummy CI settings and no real service credentials. Workflow YAML was parsed locally; event triggers, full-SHA action pins, read-only permissions, required commands, credential isolation, and per-step/job deadlines were inspected. Relative documentation links and `git diff --check` passed. A hosted Actions result must be verified after the workflow is pushed; local macOS checks do not by themselves establish the Ubuntu runner result.

Deployment remains unverified: local Vercel linkage/token configuration is absent, and read-only GitHub deployment metadata returned zero deployments. This does not prove that no Vercel project exists elsewhere; no project was created and no deployment or scheduled job was initiated.


## Analytics honesty and source-rights milestone — 2026-11-03

Baseline `25d414e`; full evidence/inventory in [data-provenance.md](data-provenance.md) and [data-rights.md](data-rights.md). A publishable-key read-only sample of two July 11 Lens rows confirmed all cached edge values 50, placeholder/neutrality language, four title/snippet contexts per Lens without URLs, and no generation/cutoff fields. Both sample venue countries were `World`. Model and cache-update metadata existed. No raw exports or cached prose were committed.

- **H3 public presentation mitigated:** numerical Team Edges are withheld for archive and illustrative modes, with an unavailable message. Other numbers are not heuristically declared trustworthy. `PublicMatchLens` excludes metrics; missing/malformed hidden metrics do not remove readable qualitative sections. The ingestion/documents/prompts still contain placeholder strengths: that upstream debt remains open and no stored Lens was rewritten/regenerated.
- **M3 interpretation clarified, not fact-validated:** stored edge/confidence/volatility labels are uncalibrated opinions. A null edge now says “No edge stated” rather than inventing parity. Validation checks display safety, not analytical correctness. Stored prose may still rely on unverified inputs and is labeled accordingly.
- **H2 attribution/time semantics partially addressed:** Lens and Q&A sources are labeled stored context snippets or illustrative context examples, explicitly not claim-level citations. The detail view separates event reference and cache-write time from unknown source publication/capture, generation, cutoff, and dataset version. Source identities and immutable lineage remain missing; the additive schema/backfill contract is designed in the provenance document but not migrated.
- **M1/M2 data correctness remains open:** fixture fields now have explicit provider-record/unverified labeling. No country, flag, stage, penalty breakdown or result was fabricated as a repair.
- **M6 inventory established; permissions remain unresolved:** actual API-FOOTBALL/API-SPORTS terms, provider documentation, Unicode references and OpenAI publisher terms were consulted through public browsing. No actual API-FOOTBALL endpoint was called. Every category retains UNKNOWN publication rights, public GitHub dataset NOT_APPROVED, and public web display REVIEW_REQUIRED. A subscription or generated output is not treated as source clearance. No dataset export, deployment, permission grant, or legal certainty was invented.

The regression suite covers withheld/missing/malformed metrics, preserved qualitative text, null-edge semantics, archive/synthetic labels, non-citation context, unknown rights, and validated/unknown temporal metadata. Existing protected ingestion/embedding/generation/cron routes were not invoked; no production writes or migrations occurred.


Milestone validation: 26 deterministic tests, nine credential-free HTTP check groups, lint, typecheck, production build, documentation-link checks, and `git diff --check` passed locally. Independent review found no blocking issue; its diagram-routing and cache-timestamp propagation suggestions were addressed and the HTTP checks rerun. The synthetic mock includes missing/malformed hidden metrics and a pre-match cache update; qualitative commentary remains available and generation/cutoff remain Unknown. Official API/publisher terms were read through public pages; no provider API requests, new embeddings/generation, migrations, production writes, admin/cron execution, raw historical export, or deployment occurred. Hosted CI must be verified for the committed revision after push.


## Self-contained public demo follow-up — 2026-11-03

Baseline `5dff6a3`. The legacy seed used real national teams/flags, plausible pairings, invented venues and unsourced tactical/source-like prose. No author/source/license record could clear it for a wholly fictional public demo. Current runtime examples were replaced together with newly authored fiction: four teams, two locations, three scenarios over two dates, original commentary/context/Q&A, null metrics and no real results. The inherited favicon and five unused starter SVGs were removed; an original geometric icon and existing software/icon license notices were added. Git history is not retroactively cleared.

[Demo publication review](demo-publication-review.md) approves only the new wcl-synthetic-v1 original files for this task's source/web demonstration. The eight legacy/provider source categories stay UNKNOWN and historical export remains NOT_APPROVED. This is not a general license or historical rights approval.

`deployment-mode.ts` now defaults/fails closed to demo-only. Both public pages pass server policy through selection/services; lower-level helper defaults also deny archive. Explicit archive requests show disabled state rather than a seed fallback. The public date form offers only fictional exploration; `/about` explains the architecture. `replay-access.ts` lazy-loads database readers only when explicitly enabled. Six admin POST handlers and cron GET/HEAD return 404 before auth/work in demo-only mode, including matching-secret requests. Their business modules are loaded only after guard/auth in archive-enabled mode. No request test executed real authoring.

Regression coverage includes unset/invalid flags, omitted helper policies, absent production credentials, zero app service fetches with active instrumentation, all guarded handlers, dataset/date navigation, version/review scope, null strengths, fictional result labels, missing relations/matches and malformed commentary. Existing archive regression checks opt in explicitly and use local mock Supabase. A local install initially contained duplicate generated/type directories; a clean locked npm install and generated-output cleanup resolved those artifact errors without excluding types or changing dependencies.

Deployment inspection found no local Vercel link/token/project IDs or CLI. The Vercel integration is available but unconnected; identifying/connecting the existing account/project is required. No paid plan/resource, cron, production migration/write, raw provider export, or actual deployment was performed. Browser and final test/CI evidence is recorded in the delivery handoff; no screenshot or public URL is asserted here without evidence.

Local validation: 32 deterministic tests, nine archive/mock HTTP groups, six demo HTTP groups with unset configuration, the same six with invalid configuration, and six production-server demo groups passed. Lint, typecheck, and production build passed with empty service credentials; system fonts required no network fetch. Independent review identified permissive lower-level defaults, which were changed to demo-only and regression-tested; final review found no blocker. Missing/malformed sample commentary also yields no derived sample answers rather than a module-initialization crash. Hosted CI is verified separately after push. Browser control exposed no browser tabs and Chrome returned `noWindowsAvailable`; no desktop/mobile screenshot or interactive Q&A click is claimed. The HTTP checks verify rendered Q&A content, not browser interaction.


## First public demo release — 2026-11-03

The existing authorized Vercel dashboard confirmed `jt254/world-cup-lens`, the matching GitHub repository, production branch `main`, Next.js framework and repository root. No project/service environment variables existed before adding the sole non-secret production flag `WCL_DEPLOYMENT_MODE=demo-only`. The first deployment of `8299114` became Ready and serves https://world-cup-lens-one.vercel.app. Its build selected Node 22 from `package.json` despite the initial dashboard default of 26; the project setting was subsequently saved as 22. No cron schedules were listed; project cron execution was explicitly disabled. No project, paid resource, service key, billing change or production database write was introduced.

Public smoke checks passed for both dates, feature/detail/Lens/Q&A content, about, invalid/empty states, archive rejection, all six admin POST denials and cron GET/HEAD denials. These requests used no authentication or real secrets and did not execute protected work. A bounded, explicit `test:production-http` command makes them repeatable. Code review, absent service credentials, local active fetch-denial tests and observed same-origin browser traffic support demo isolation; they do not constitute complete production server egress observability.

Real Chrome QA confirmed featured navigation, cached answer changes and visible keyboard focus. A 320px viewport exposed clipping in the featured card, missed by HTTP checks. The release follow-up replaces implicit grid minimums with shrinkable tracks, wraps team/location text and stacks narrow commentary rows; equivalent list/detail sizing is hardened. Commit-specific final responsive evidence and screenshots are recorded in [deployment.md](deployment.md). Historical rights/lineage and upstream authoring debt remain unchanged.
