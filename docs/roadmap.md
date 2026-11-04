# Roadmap

## Portfolio freeze and remaining work

The public replay and tested private backend contracts are the frozen MVP. Maintenance is limited to verified substantive correctness/security defects. Product expansion, paid evaluation, production migrations and backend activation require a separately approved scope.

The [audit](audit.md#current-findings) records current findings; [deployment evidence](deployment.md) records the verified release. The [walkthrough](technical-walkthrough.md), [decisions](engineering-decisions.md), [interview guide](interview-guide.md) and [portfolio summary](portfolio-summary.md) describe the implemented system.

## Completed scope

| Milestone | Result |
| --- | --- |
| Historical replay | Explicit collections/dates, preserved navigation, distinct empty/error/disabled states and no silent fallback |
| Public demonstration | Five source-linked date-only records; separate original fictional lab; credential-free browsing; guarded archive/authoring boundary |
| Analysis presentation | Editorial, synthetic and cached AI content distinguished; unsupported metrics withheld; legacy text retrospective |
| Source review | Field-level provenance and scoped publication decisions; provider/brand/redistribution questions remain explicit |
| Interface | Responsive header, featured scoreboard, matchday links, detail/source notes and stored Q&A; genuine browser evidence |
| Backend foundation | Disposable schema/pgvector RPC/RLS, synthetic corpus, atomic document revisions, final validation, immutable lineage and versioned cache |
| Verification and delivery | Deterministic tests, real SQL integration, HTTP/browser checks, documentation/credential/advisory gates, GitHub CI and Vercel |

## True defects — private ingestion

Name-based team and missing-venue identities can collide; flag/code aliases are incomplete; team-level group/stage updates can reflect the last imported round. The response contract also omits penalty breakdown. These paths are disabled in public production and do not supply curated facts.

Before operational ingestion:

- Define stable identity/alias and stage policies without fabricating source fields.
- Add synthetic collision, alias, stage and result-breakdown tests; preserve curated enrichment deliberately.
- Document compatibility and any required migration/backfill proposal. Do not repair production rows without source evidence and authorization.

Canonical status and absent venue-country mapping were corrected at freeze; they are not open defects. See [normalization evidence](data-provenance.md#final-normalization-corrections).

## Deferred engineering

| Workstream | Acceptance criteria | Tests and documentation |
| --- | --- | --- |
| Supabase gateway/operator reads | Bootstrap the isolated stack and exercise actual PostgREST/Auth, repository joins and authenticated operator access without broadening public provider reads | Gateway role/HTTP matrix and adapter contracts; update database/security docs with differences from direct SQL tests |
| Durable authoring recovery | Resume persistence after process loss without another model call; retain one cache winner and complete attempt history | Termination/retry/fault/concurrency tests; operations and recovery runbook |
| Retrieval/corpus consistency | Define corpus revision semantics; measure relevance and query plans before choosing memoization or ANN | Reviewed query/candidate sets, filtered recall checks and documented measurements; no invented performance target |
| Grounding and temporal evidence | Establish reviewed claim support, source availability evidence and input-attestation procedures | Unsupported/adversarial/future/unknown examples; evaluation methodology and results. Real-model runs need separate budget authorization |

These are proposed improvements, not functionality demonstrated by the current public demo.

## Deferred assurance and dependency maintenance

Broader screen-reader, physical-device and Safari/Firefox checks remain open. Existing Chromium evidence is scoped to emulated viewports and checked interactions.

The November 4 dependency snapshot retains 8 moderate development-only lint/glob entries and deprecated ESLint 9; current React/a11y peer constraints exclude ESLint 10. Monitor compatible fixes rather than forcing incompatible overrides. The high/critical CI gate remains active. Security certification and complete transitive licence clearance are not established.

## External rights and licensing

Resolve the repository code-licence choice separately from curated facts/references, original fiction, screenshots and provider/excerpt/model material. Broader name/domain, commercial use, redistribution and historical Git content require source-specific review. UNKNOWN permissions do not become approval through database access or model transformation. [Rights inventory](data-rights.md) and [licence options](engineering-decisions.md#code-licence-decision-remains-with-the-owner).

## Optional future features

More fixtures, live coverage, accounts, chat and predictive metrics are outside the frozen MVP. They are not queued implementation work. Any future scope needs its own data, rights, cost, security and verification criteria.
