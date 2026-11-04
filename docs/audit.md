# Repository audit

## Portfolio freeze audit

Baseline: `4c88da8399c8cdc3de8d96a2ee380f635f11fa98`. The portfolio-freeze assessment covers the public historical replay and tested private backend contracts. The detailed system trace is in the [walkthrough](technical-walkthrough.md); release-specific checks are in [deployment evidence](deployment.md).

The public demo is suitable for portfolio review. This assessment does not establish production AI readiness, historical forecast authenticity, factual grounding or legal clearance. The editorial maintenance following freeze changes documentation only.

## Current findings

| Priority | Evidence and impact | Status / next action |
| --- | --- | --- |
| High/critical dependency findings at pre-freeze baseline | The old Next/Zod lockfile and tooling tree had reported upstream advisories | Fixed at freeze with Next/eslint-config-next 16.4.5, Zod 4.6.6 and compatible transitive updates. The unused shadcn CLI was removed; its exact licensed CSS was retained. No exploit or compromise was established. |
| Medium — private identity/stage normalization | `safeTeamSlug/safeVenueSlug`, `deriveTeamCode/deriveFlag` and fixture sync's team `group_name` update permit collisions, incomplete aliases and last-round profiles | Open private-ingestion defects. Require reviewed identity/stage contracts before operational use. They do not supply the curated public records. Penalty breakdown remains unsupported. |
| Medium — integration and access compatibility | New SQL defaults provider rows private, while `repository.ts` uses publishable provider reads | Intentional default-deny boundary. Implement separately authorized operator reads and isolated gateway/Auth tests; do not widen anonymous access to populate pages. Production schema/policy parity is unknown. |
| Medium — recovery and consistency | `PersistenceFailure` holds an in-memory envelope; source rechecks lock selected heads | SQL retry/rollback contracts are tested, but process-loss recovery and a corpus-wide serializable snapshot are not implemented. Durable jobs and stronger revision semantics are deferred. |
| Moderate — development dependencies | November 4 snapshot: 8 development-only lint/glob audit entries; deprecated ESLint 9.39.5 with React/a11y peers excluding major 10 | Monitor compatible upstream fixes. No forced downgrade/major override was applied. CI rejects high/critical advisories; the snapshot is not a zero-vulnerability claim. |
| Publication/licence boundary | Narrow five-record and original-fiction decisions; broader provider/excerpt/model rights and branding remain unresolved; no root code licence selected | Preserve scoped attribution and UNKNOWN states. Review software licensing separately from data/media and historical Git contents. |

The pre-freeze canonical-status defect was fixed by `canonicalFixtureStatus`: supported provider states map explicitly, while ambiguous/unknown states fail before writes. Venue country now uses Unknown when absent from the fixture response rather than copying competition country. `tests/fixtures.test.ts` covers these policies with original synthetic inputs. Existing database rows were not changed.

## Verification evidence

At the freeze release, **70 unit tests** and **78 real PostgreSQL assertions** passed, alongside lint, typecheck, build, local HTTP, documentation, credential and whitespace checks. Hosted CI exercised PostgreSQL 17; the local native run used PostgreSQL 14.17 with pgvector 0.8.2. See [verified release](deployment.md#portfolio-freeze--verified-release) for commit/CI/deployment references.

| Layer | What was exercised | Boundary |
| --- | --- | --- |
| TypeScript | Date/mode validation, dataset isolation, malformed values, generation/postprocessing, cache identity and failure behavior | Models/embeddings are injected mocks; no real-model quality score |
| PostgreSQL | Clean migrations, constraints, grants/RLS, vector ranking, entity/cutoff filters, immutable writes, retry and partial-failure rollback | Disposable SQL execution, not production policy parity or complete Supabase gateway/Auth |
| Local HTTP | Archive mocks; public pages with empty service settings and an active fetch-denial tripwire; authoring/cron denials | Application behavior under controlled settings, not all infrastructure egress |
| Production HTTP/browser | Five results/four dates, detail/source navigation, fictional Q&A, invalid/empty states, disabled routes and five Chromium widths | No full accessibility, physical-device or cross-browser certification; publisher availability is not guaranteed |
| Repository checks | Local links/images/headings/commands, common secret patterns and full change-range whitespace | Pattern checks are not exhaustive secret detection; external links are not fetched by `check:docs` |

The November 4 dependency snapshot reported no production audit entries and no high/critical entries overall. Security checks run on push/PR and explicit command. Fresh registry results can differ from that snapshot.

## Resolved audit themes

| Earlier issue | Current implementation |
| --- | --- |
| Today/live defaults and silent seed fallback | Explicit fixed-date collection selection; distinct empty/error states; no cross-dataset substitution |
| Misleading strength bars and source-like sample labels | Unknown strengths are null; numerical comparisons withheld; fictional Scenario notes and archive snippets have distinct labels |
| Missing temporal semantics | Legacy commentary remains retrospective; new source/run contracts retain distinct clocks, cutoff evidence and input attestations |
| Full-corpus re-embedding and delete/replace writes | Up to 50 stale heads selected; unchanged metadata avoids re-embedding; atomic immutable revisions retain old chunks |
| Match-ID-only overwrites and unchecked transformations | Input/source/config-aware cache identities, immutable runs and final post-transform validation |
| Unreproducible database assumptions | Tracked clean-database reconstruction, synthetic corpus, real SQL tests and explicit privileges |
| External font build dependency and inactive controls | System fonts, functional date/detail navigation and responsive browser checks |

Legacy records may still contain unsupported prose or bad geography. Current safeguards do not rewrite, authenticate or clear publication rights for those records.

## Historical evidence

The initial November 2 audit described the former live application. Later source and release records supersede those implementation states; Git history retains the original detailed findings.

- **Connectivity:** a previously configured Supabase hostname initially failed DNS, then resolved; a subsequent HTTP 521 preceded successful read-only access. The original outage/paused-state trigger was not established. The failures were not empty database results. No replacement project or production write was required.
- **Legacy sample:** two July 11 provider fixtures had joined teams/venues and cached Lens rows; strengths were all 50 and venue countries World. No generation/cutoff provenance was established. [Sample limits](data-provenance.md#legacy-evidence-and-presentation).
- **Publication:** the earlier internal HOLD on curated source/branding scope was superseded by the recorded five-match editorial release. This is a project publication decision, not blanket permission. [Decision and evidence](curated-history-review.md).
- **Release regressions:** real browser checks caught narrow-screen clipping; hosted PostgreSQL tests caught Docker's temporary-server readiness race. Both were corrected and retested. [Release history](deployment.md#release-history).

Remaining work is categorized in the [roadmap](roadmap.md#portfolio-freeze-and-remaining-work). The MVP remains frozen to product expansion; verified substantive defects can reopen maintenance.
