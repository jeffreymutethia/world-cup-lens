# Roadmap

## Portfolio freeze and remaining work

The November 7, 2026 full-tournament assignment is an explicit owner-authorized expansion of the earlier five-match MVP. It covers the 104-match historical archive, retrospective Match Lenses, public-lab retirement and delivery verification. It does not authorize production backend activation, paid generation, provider exports or database migrations. The expanded MVP is now frozen after successful review, CI and verified deployment of `3198043`; later product features require a new scope.

The [audit](audit.md#current-findings) records implementation findings; [deployment evidence](deployment.md) records revision-specific release results. The [walkthrough](technical-walkthrough.md), [decisions](engineering-decisions.md), [interview guide](interview-guide.md) and [portfolio summary](portfolio-summary.md) explain the system without implying a live public RAG service.

## Historical archive milestone

| Phase | Implemented result | Acceptance and verification boundary |
| --- | --- | --- |
| Complete factual collection | 104 unique match numbers/IDs, 72 group games and all 32 knockout fixtures; date-only results, separate shootouts, sources and explicit unknowns | All official report first pages and hub results checked; `npm run check:data` validates structure/counts, identity, results and fixed knockout feeders. Source review is not a general data licence |
| Unified Match Lens | Concise verified tournament context for every match; ten extended original retrospectives with source-linked developments and evidence limits | Deterministic content contracts; no fabricated tactics, calibrated predictions, generated-at clocks or claim that authored copy is AI output |
| Browsing | Default July 11 featured fixture, all-date archive, calendar, stage/group/team/text filters, pagination, detail/back/previous/next and related team journeys | URL state and empty/invalid cases tested; stable event-day/match-number ordering never claims kickoff precision |
| Fictional lab retirement | Public fiction/navigation/Q&A removed; old illustrative selections redirect to `/?mode=curated`; synthetic data/helpers moved into tests | HTTP redirect checks and runtime-import isolation; preserve original private RAG/SQL corpus and fixtures |
| Security boundaries | Demo-only fail-closed policy, protected private archive/authoring, no service calls or cron schedule | Existing dummy-setting service tripwires and permission tests retained; no public RAG activation or broadened RLS |
| Review and delivery | Data/code/security/editorial review and documentation aligned with the implementation | Completed for `3198043`: 75 unit tests, 78 SQL assertions, all required local checks, hosted CI and production HTTP/five-width browser verification; see [deployment](deployment.md) |

## Corrections made during archive review

- Official sources resolved conflicting secondary scores for Netherlands–Morocco and Brazil–Norway, plus Norway–Senegal's date/venue discrepancy.
- Team-code checks reject filename suffixes such as `-ALT`; canonical code/name identities form a bijection.
- Strict enum/type checks reject coercible malformed metadata rather than silently accepting it.
- Unknown extra-time status remains unknown; shootout and match-goal contracts cannot contradict each other.
- Canonical filter normalization is used for selection, pagination and return navigation; legacy illustrative requests cannot open another dataset.
- Knockout progression checks validate the fixed feeder participants, not merely aggregate winner sets.

These are implementation corrections, not claims of measured model quality, legal clearance or a new deployed revision. Revision-specific test/deployment results are recorded in the delivery evidence.

## True defects — private ingestion

Name-based team and missing-venue identities can collide; flag/code aliases are incomplete; team-level group/stage updates can reflect the last imported round. The provider response mapping omits penalty breakdown. These paths are disabled in public production and do not supply curated facts.

Before operational ingestion:

- Define stable identity/alias and stage policies without fabricating source fields.
- Add synthetic collision, alias, stage and result-breakdown tests; preserve reviewed curated data independently.
- Document compatibility and any required migration/backfill proposal. Do not repair production rows without source evidence and authorization.

Canonical status and absent venue-country mapping were corrected in the earlier backend milestone. They are not open defects. See [normalization evidence](data-provenance.md#final-normalization-corrections).

## Deferred engineering

| Workstream | Acceptance criteria | Tests and documentation |
| --- | --- | --- |
| Supabase gateway/operator reads | Bootstrap an isolated stack and exercise actual PostgREST/Auth, repository joins and authenticated operator access without broadening public provider reads | Gateway role/HTTP matrix; update database/security docs with differences from direct SQL tests |
| Durable authoring recovery | Resume persistence after process loss without another model call; retain one cache winner and complete attempt history | Termination/retry/fault/concurrency tests and a recovery runbook |
| Retrieval/corpus consistency | Define corpus revision semantics; measure relevance and query plans before selecting memoization or ANN | Reviewed query/candidate sets, filtered recall and documented measurements; no invented performance targets |
| Grounding and temporal evidence | Establish claim-support evaluation, source-availability evidence and input-attestation procedures | Unsupported/adversarial/future/unknown cases and explicit evaluation results; real-model runs require separate budget authorization |

The public archive's editorial context does not depend on these deferred private integrations. Detailed play-by-play is not a requirement to fill every Lens; missing evidence remains an explicit limitation.

## Assurance and dependency maintenance

Broader screen-reader, physical-device and Safari/Firefox checks remain open. Chromium evidence is scoped to the emulated widths and interactions actually checked. A screenshot is not accessibility certification.

The November 4 dependency snapshot retained 8 moderate development-only lint/glob entries and deprecated ESLint 9; React/a11y peer constraints excluded ESLint 10. Fresh registry results belong in current verification evidence. Monitor compatible fixes rather than forcing overrides; the high/critical CI gate remains active. Security certification and complete transitive licence clearance are not established.

## External rights and licensing

The current 104-record release is scoped factual/noncommercial editorial use with linkbacks and independent presentation. It is not an unrestricted dataset licence. Full-compilation/database, source/forking, portfolio-use classification and name/domain questions remain documented. Private provider/excerpt/model rights stay UNKNOWN. Choose a repository code licence only through a separate explicit owner decision; software licensing does not clear sports data/media or historical Git content. See [rights](data-rights.md) and [licence options](engineering-decisions.md#code-licence-decision-remains-with-the-owner).

## Optional future features

Live coverage, user accounts, free-form chat, betting/predictive metrics and paid public generation are outside this milestone and are not queued implementation work. Any later scope needs its own source, rights, cost, security and verification criteria. The current product should remain a readable completed-tournament archive.
