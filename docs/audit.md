# Repository audit

Audit date: 2026-11-02. Scope: tracked files, dependency manifests/configuration, routes, types, clients/repository, ingestion, AI pipeline, caching, cron, presentation, tests/CI, and README. Initial `git status --short` was clean. No application code, dependencies, environment files, or migrations were changed. No Supabase queries, provider/paid API calls, admin routes, embedding routes, or cron routes were invoked. Findings describe static code unless explicitly marked as check results; live data and infrastructure were not inspected.

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
