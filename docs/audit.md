# Repository audit

## Portfolio freeze audit

The earlier portfolio assessment covered baseline `4c88da8399c8cdc3de8d96a2ee380f635f11fa98`, a five-match public replay and tested private backend contracts. The November 7, 2026 owner-authorized assignment expands that public collection from candidate baseline `7d06bc4089881601f0f4502d17215a5cc27f75f4`; it does not turn on paid services or change production databases.

The current implementation covers all 104 matches with retrospective editorial Match Lenses. The expanded MVP is frozen after the verified `3198043` release. The [walkthrough](technical-walkthrough.md) describes actual boundaries; [deployment](deployment.md) records executed release checks. No portfolio assessment establishes production AI readiness, authentic historical forecasts, measured grounding quality or legal clearance.

## Current findings

| Priority | Evidence and impact | Status / next action |
| --- | --- | --- |
| Medium — private identity/stage normalization | `safeTeamSlug/safeVenueSlug`, `deriveTeamCode/deriveFlag` and fixture sync's team `group_name` permit collisions, incomplete aliases and last-round profiles; penalty breakdown is absent | Open before operational private ingestion. These paths do not supply the public curated records |
| Medium — integration and access compatibility | New SQL defaults provider rows private while `repository.ts` uses publishable provider reads | Intentional default-deny boundary. Add separately authorized operator reads and isolated gateway/Auth coverage; do not broaden anonymous access. Production policy/schema parity is unknown |
| Medium — recovery and consistency | `PersistenceFailure` holds an in-memory envelope; source rechecks lock selected heads | SQL retry/rollback tested; durable process-loss recovery and corpus-wide serializable snapshots deferred |
| Moderate — development dependencies | November 4 snapshot retained 8 development-only lint/glob entries and deprecated ESLint 9.39.5 with React/a11y peers excluding major 10 | Monitor compatible fixes. CI rejects high/critical advisories; the historical snapshot is not a zero-vulnerability claim |
| Publication/licence boundary | 104-record source/web release is scoped independent editorial reporting; full-compilation/source-forking, branding and portfolio-use questions remain unresolved | Preserve attribution/non-affiliation and no general data licence. Provider/excerpt/model material remains UNKNOWN; no root code licence is selected |
| Coverage limitation — detailed commentary | All matches have tournament context; ten have deeper source-linked accounts | Deliberate evidence limit. Do not fill the remaining records with invented tactical/event prose or present editorial text as generated AI output |

The earlier high/critical dependency findings were corrected with Next/eslint-config-next 16.4.5, Zod 4.6.6 and compatible updates. The unused shadcn CLI was removed while retaining its exact licensed CSS body. No exploit or compromise was established. Fresh security results must accompany the final revision.

## Full-archive review findings and corrections

| Finding | Evidence / correction |
| --- | --- |
| Conflicting secondary results | Official report/hub evidence resolved Netherlands–Morocco to match goals 1–1 with penalties 2–3, and Brazil–Norway to 1–2. Norway–Senegal's official June 22/New York New Jersey entry superseded a conflicting aggregate |
| Noncanonical code suffix | A PDF filename token containing `-ALT` could contaminate match 98 identity. Canonical three-letter code/name bijection validation rejects suffixes and inconsistent identities |
| Permissive metadata coercion | Enum checks could accept values through coercion. Explicit type/enum validation now rejects malformed source/editorial metadata |
| Unsupported status certainty | Null extra-time status must not render as known normal/full time. Public score/commentary handling preserves unknown status; shootout goals remain separate from match goals |
| Filter-state mismatch | Raw versus normalized filter values could diverge across data selection and navigation. Canonical date/all/stage/team/search/page selection is shared by rendering and links |
| Weak progression check | Aggregate next-round participant sets do not prove the correct bracket pairing. Fixed knockout feeder validation checks actual participant relationships |
| Retired fiction in runtime | Original synthetic data/helpers are moved to `tests/fixtures/illustrative.ts` and `tests/helpers/illustrative.ts`; old public illustrative selections redirect to `/?mode=curated` |
| Ambiguous result timing | Public records store source-local date-only facts, with no fabricated kickoff, regulation-score breakdown, model-generation clock or historical cutoff. Sourced prose developments remain distinct from unstructured fields left unknown |

These checks use deterministic contracts and the inspected primary evidence. They do not demonstrate model accuracy or authorize another corpus. [Source review](curated-history-review.md) records all 104 official report first-page checks, the results hubs, ten deeper editorial sources and publication limits.

## Final maintenance corrections

| Finding | Evidence / correction |
| --- | --- |
| Cross-date detail URLs retained the originating date | `curatedMatchHref` uses the destination’s event date; `parseCuratedReturn` validates a separate filter/page whitelist. Legacy detail URLs redirect; breadcrumbs restore the original list rather than changing its selection |
| Basic context looked equivalent to extended reporting | `matchLensLabel` selects Match context for 94 basic records and Match analysis for ten extended records. Facts and commentary are unchanged |
| Missing match-specific discovery metadata | `historicalMatchMetadata` uses local facts for title/description/Open Graph and fixed-origin canonical URLs. Return filters are excluded; private/invalid/missing selections receive generic noindex metadata |
| Unknown curated IDs rendered a successful page | The detail now calls `notFound()` before any loading response is streamed. Explicit loading boundaries remain on the homepage/private path; empty searches and malformed selections retain distinct feedback |
| No bounded source availability check | Manual `check:sources` separates missing links from blocked/network/timeouts, bounds HTTPS publisher requests and cancels bodies. Mocked tests run offline; publisher downtime is not an ordinary CI failure or grounds to rewrite facts |

Runtime `9315f1e` passed 88 unit tests, 78 disposable PostgreSQL assertions and the required local checks, including cross-date return-state, metadata, source-checker and pre-aborted-request regressions. Production HTTP and five-width Chromium checks passed, including all 104 details, actual destination dates and preserved return state. A bounded three-source live sample was healthy (two Range GET fallbacks and one HEAD); this does not establish all-source availability or reverify historical facts. Release-wide HTTP, CI and production outcomes are recorded separately in [deployment](deployment.md).

## Verification evidence

The earlier full-archive candidate passed **75 unit tests** and **78 real PostgreSQL assertions**, data integrity, archive/public HTTP suites, lint/typecheck/build, repository checks and five-width Chromium QA. The browser also checked all 104 details at 320px. Hosted CI, Vercel deployment and the full production HTTP/browser suites passed for `3198043`; see [deployment evidence](deployment.md) for links and scope.

| Layer | What it establishes | Boundary |
| --- | --- | --- |
| Source review | 104 unique published results, stage coverage, separate shootouts and recorded discrepancy decisions | Not publisher infallibility, legal clearance or authenticated capture clocks |
| TypeScript/data | Date/filter normalization, completeness/identity/progression, navigation, malformed metadata and injected generation/cache behavior | Mock responses do not establish real-model quality |
| PostgreSQL | Clean migrations, constraints, grants/RLS, vector/entity/cutoff filters, immutable writes and rollback/retry | Disposable execution, not production parity or complete Supabase gateway/Auth |
| Local HTTP | Archive mocks; credential-free public pages under active service tripwires; authoring/cron denials and retired-route handling | Controlled application behavior, not all infrastructure egress |
| Browser/production | Specific observed layout/navigation/focus and revision-specific responses | No physical-device, full cross-browser or accessibility certification |
| Repository checks | Local Markdown/image/heading/command links, common credential patterns and whitespace | Secret patterns are not exhaustive; `check:docs` does not fetch publisher URLs |

The earlier freeze passed 70 unit tests and 78 SQL assertions, with hosted PostgreSQL 17 and native PostgreSQL 14.17/pgvector 0.8.2. Those are historical results, not substitutes for rechecking this change.

## Resolved audit themes

| Earlier issue | Current implementation |
| --- | --- |
| Today/live defaults and silent seed fallback | Fixed replay date and explicit public/private boundaries; distinct empty/error states; no fictional substitution |
| Five-match-only public coverage | Independently curated 104-match module, all stage totals, source metadata and complete fixture navigation |
| Fragmented public products | Unified retrospective Match Lens archive; fiction retained in tests rather than a public lab |
| Misleading metrics and source-like labels | Unknown strengths null; numerical comparisons withheld; editorial public text distinct from private snippets/uncalibrated opinions |
| Missing time/lineage semantics | Legacy text retrospective; new source/run contracts retain distinct clocks, cutoff evidence and exact-input attestations |
| Full-corpus re-embedding and mutable overwrites | Up to 50 stale heads; atomic immutable revisions/runs and input/source/config-aware cache identities |
| Unreproducible database assumptions | Tracked clean-database reconstruction, original synthetic corpus, real SQL tests and explicit grants |
| External font build dependency | System fonts and no Google-font build fetch |

Canonical provider statuses are explicitly mapped and unsupported values fail before writes. Missing venue country is Unknown rather than competition country. `tests/fixtures.test.ts` covers those policies using synthetic inputs; existing production records were not changed. Legacy prose/geography may still be unsupported, and current controls do not authenticate or clear its publication rights.

## Historical evidence

- **Connectivity:** a configured Supabase hostname initially failed DNS, later resolved, and a subsequent 521 preceded successful read-only access. The original outage/paused-state trigger was not established. These were not empty database results; no replacement project or production write was needed.
- **Legacy sample:** two July 11 provider fixtures had relations and cached Lenses; strengths were all 50 and venue country World, with no generation/cutoff provenance. [Sample limits](data-provenance.md#legacy-evidence-and-presentation).
- **Publication scope:** an early internal HOLD was superseded first by a five-record editorial release, then by the explicit full-tournament assignment and updated source review. These are scoped project decisions, not blanket rights clearance.
- **Earlier regressions:** browser checks caught narrow-screen clipping and hosted SQL caught a temporary-server readiness race; both were corrected. [Release history](deployment.md#release-history).

Remaining work is categorized in the [roadmap](roadmap.md#portfolio-freeze-and-remaining-work). The expanded MVP is frozen after its verified delivery; substantive defects can reopen maintenance.
