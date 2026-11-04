# Source rights and redistribution review

Reviewed 2026-11-03. This is an evidence inventory and conservative repository publication policy, not a finding that every use is lawful or unlawful. **No provider/bulk historical export is approved. Exactly five independently selected factual records have a separate owner-directed editorial release decision below.** Database access, factual subject matter, an API subscription, embedding, or model generation does not establish publication permission. No raw provider export, official logo/media asset or source article copy is included.

## Provider identity and primary evidence

The code calls `v3.football.api-sports.io` with `x-apisports-key` in `src/lib/fixtures/api-football.ts:fetchWorldCupFixtures`. This is **API-FOOTBALL, the API-SPORTS product**, not football-data.org, footballapi.org, football-api.com, or footballapi.com. Those providers' licenses do not apply here.

- **P1:** [API-FOOTBALL Terms of service](https://www.api-football.com/terms), sections “Terms of use”, “Service & data”, and “Data/Logos/images”; page displays last updated May 21, 2025, accessed November 3, 2026. The terms prohibit direct resale without permission, disclaim a publication license, and place third-party permission checks on the user. Their app/website examples do not establish an open-data grant for a downloadable GitHub archive. Attribution alone is not a substitute for permission. Media may need authorization from its rights holder. **The account's accepted terms/version, competition-specific permissions, and any separate agreements are UNKNOWN.**
- **P2:** [API-FOOTBALL documentation](https://www.api-football.com/documentation-v3) and its [official beginner guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide). These identify fields/endpoints and explain image delivery/caching; zero-quota image access is not an intellectual-property license. No API endpoint was invoked for this research.
- **P3:** [OpenAI Services Agreement](https://openai.com/policies/services-agreement/), effective January 1, 2026, §§4.1, 4.3–4.4. It allocates output ownership between customer and OpenAI subject to law, makes the customer responsible for input permissions and output use, and notes non-uniqueness. It does not clear underlying provider/publisher rights. Applicability of the account's actual agreement at each generation is UNKNOWN.
- **P4:** [Unicode emoji charts](https://unicode.org/emoji/charts/full-emoji-list.html) identify emoji characters; [Unicode licensing information](https://www.unicode.org/license.txt) concerns Unicode materials. The archive UI can render character strings with platform glyphs; the reviewed new demo uses alphabetic initials, not downloaded chart/vendor images. No grant for third-party logos or a dataset is inferred from Unicode documentation.

No messages were sent to providers or rights holders. A public webpage's current terms are evidence to review, not proof of this application's contractual entitlement.

## Category decisions

`UNKNOWN` means sufficient rights evidence has not been established. `NOT_APPROVED` is the repository's export decision, not a claim that permission can never be obtained. `REVIEW_REQUIRED` is the public-web release gate. The same conservative statuses are encoded by `src/lib/data-rights.ts:sourceRights`; that registry is not an export tool or legal enforcement boundary.

| Category / registry ID | Source and content classification | Attribution evidence / unresolved rights | Public GitHub dataset | Public web display |
| --- | --- | --- | --- | --- |
| Fixtures/results — `api-football-fixtures` | API-FOOTBALL via API-SPORTS; reported factual records; P1/P2 | Specific applicable attribution and competition permissions UNKNOWN; refer to P1 | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Team identity — `team-identity` | Provider IDs/names mixed with app-derived code suffixes and flag lookup; factual labels plus application transformations | Provider/competition/name/mark requirements UNKNOWN; emoji characters are not proof of logo rights; P1/P4 | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Logos — `provider-logos` | Provider team `logo` URLs saved as `logo_url`; external branded imagery; not rendered by current replay | Rights-holder identity/permission and required attribution UNKNOWN; P1. No logo binary is bundled | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED before adding logos |
| Venues — `venue-data` | Provider name/city/ID; legacy writer copied league country into venue country; new normalization uses Unknown when venue country is absent | Provenance and country accuracy incomplete; applicable attribution/permissions UNKNOWN; P1/P2 | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Provider documents — `provider-documents` | Application-synthesized prose about provider rows, including placeholder strengths | Original upstream terms remain relevant; publication/embedding entitlement and author/source chain UNKNOWN; no new license inferred by reformatting | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Editorial/context snippets — `editorial-snippets` | Seed editorial examples and excerpts of stored documents; external publisher identity may be missing | No article crawler is tracked; unknown documents cannot be assigned a publisher/license by title. Link, author, publication date, excerpt allowance, and attribution UNKNOWN | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Lens and cached Q&A — `cached-ai-commentary` | OpenAI-generated Lens plus deterministic context snippets; Q&A writer is untracked and origin UNKNOWN | Customer/account agreement, input rights, source excerpts and ownership chain UNKNOWN; P3 is not downstream clearance | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Legacy illustrative examples — `illustrative-examples` | Replaced `5dff6a3:src/data/seed.ts`: synthetic fixtures/venues, authored strengths/copy, real-world team labels | Legacy examples remain in Git history; authorship/licensing record and third-party mark rights UNKNOWN. No repository LICENSE or new approval is supplied | NOT_APPROVED as a new dataset; rights UNKNOWN | REVIEW_REQUIRED for public release |

See [data provenance](data-provenance.md) for exact fields, transformations, and missing lineage. All eight legacy/provider categories deliberately retain UNKNOWN publication rights. The separate new original-demo review below does not upgrade any of them. Do not relabel unknown records as “open”, “public domain”, “licensed”, or approved because a field describes a fact.

## Publication gate

Before exporting any historical subset or deploying a public data display:

1. Identify each source/rights holder and the actual account agreement/terms version applicable to acquisition, embedding and intended use. Record evidence privately when commercially sensitive; commit only safe evidence references.
2. Resolve dataset redistribution separately from website display, source excerpts, logo use, embedding retention, and model-derived commentary. Obtain required permissions or an explicitly licensed alternative; do not assume a free API tier supplies them.
3. Record exact approved scope, attribution text/links, audience, duration, permitted transformations, retention, and reviewer/date. UNKNOWN remains blocked; no rights are backfilled from confidence scores or source titles.
4. Review the actual proposed export, including snippets and derived documents, before committing it. Schema/code/tests can be published without copying provider rows; synthetic test records are not evidence clearing the historical corpus.

This milestone preserves the existing local replay for review, with stronger truthfulness labels. It grants no new dataset rights and performs no deployment. Historical accuracy, branding/endorsement, and licensing are distinct reviews.


## Separate original-demo review

The new `reviewed-synthetic-demo-v1` category refers only to the replacement `wcl-synthetic-v2` module and new original icon documented in [demo-publication-review.md](demo-publication-review.md). Its publication status is REVIEWED_ORIGINAL_CONTENT, with APPROVED_ORIGINAL_DEMO_ONLY for source inclusion and web demonstration. This is a scoped repository decision supported by newly authored fictional material with no third-party inputs; it is not a general content license, a sports-data approval, or a rights guarantee about accidental name collisions. Legacy examples, provider rows, excerpts, logos, and cached AI corpus remain UNKNOWN/NOT_APPROVED/REVIEW_REQUIRED as above.

No raw historical export is part of this milestone. The public deployment branch can use the separately scoped curated selection, reviewed original examples and licensed code/icon dependencies; it cannot access the archive or invoke authoring. Existing software/icon notices are kept separately at `public/third-party-notices.txt`. Historical sources must still pass the original publication gate before public historical use; approval of new fiction is not permission for another category.


## Five curated records — owner-directed narrow editorial release

The [updated source/publication review](curated-history-review.md) supersedes the earlier conservative internal HOLD. The owner explicitly directs publication of five independently verified results, descriptive team/stage/venue labels, date-only facts, AET markers, source metadata and newly authored retrospective context in this public repository and noncommercial portfolio demo. No API-FOOTBALL payload, production database export, article prose, PDF, logo, crest, official font, photograph or video is included.

FIFA's published terms/branding guidance provide conditional support for attributed noncommercial editorial website use, with source linkbacks and no implied endorsement. They do not establish blanket permission, an open-data licence, definitive trademark clearance, unrestricted downstream GitHub/commercial reuse or contractual rights to any provider corpus. The existing name/domain, portfolio-use classification and source/forking scope retain uncertainty. The owner accepts the narrow editorial release decision; no legal guarantee is claimed. Reassess before monetisation, sponsorship, branding changes, bulk expansion or reuse beyond this scope.

| Field/category | Current project publication decision | Limits |
| --- | --- | --- |
| Five selected factual tuples: team names, day, stage, venue, final score, AET | OWNER_DIRECTED_EDITORIAL_SCOPE; FIVE_CURATED_RECORDS_ONLY for source/web | Descriptive facts with linkbacks; not provider data or an unrestricted dataset licence |
| Source URLs/identity and evidence access/review metadata | Same scoped release | References acknowledge evidence; linked content is not relicensed |
| Original retrospective editorial context | Same scoped release | Newly written during agent-assisted implementation; separate from actual cached AI pipeline; no publisher text copied |
| Protected official imagery/marks/media | NOT_APPROVED; excluded | No no-logo argument is treated as definitive name/domain clearance |
| Eight unrelated legacy/provider categories | UNKNOWN / NOT_APPROVED / REVIEW_REQUIRED | No rights upgrade from this decision or the original-fiction decision |

`sourceRights("curated-history-2026-v1")` exposes this scoped decision, while `CURATED_PUBLICATION.openDataLicense` stays false and trademark clearance stays UNRESOLVED. These are evidence registries, not legal validators or exporters. Attribution and non-affiliation notices are present in the UI; remaining uncertainty stays documented. No enquiry was sent to any rights holder.


## v2 wording and design scope

The v2 curated module retains exactly the same five independently selected factual records; only original retrospective copy is edited. `curated-history-2026-v2` is an explicit continuation of the owner's narrow editorial source/web decision, not approval of new records or blanket reuse. The v2 fictional module's new original copy has its own explicit registry entry and [publication review](demo-publication-review.md). Official source content/media and the private provider/cached corpus remain outside both decisions. No official assets, downloaded fonts or provider payloads are added by the redesign.

## Disposable backend corpus — 2026-11-04

`supabase/seed.sql`, `supabase/tests/integration.sql` and `tests/rag.test.ts` and `tests/fixtures.test.ts` contain newly authored fictional Maple/Harbor/Other Eleven names, Test Ground, short original document/commentary/Q&A text and locally constructed basis vectors. They contain no provider payload, production row, external article excerpt, badge or media. Publication decision: **APPROVED only for these original synthetic test inputs and deterministic mock outputs in this repository**. Their synthetic availability metadata is not real historical evidence; `generator_kind=mock` and synthetic embedding labels preserve that distinction. This decision does not approve any legacy/provider/model-generated production corpus or broaden the curated five-match release.

New database provider/source/history rows default private; only explicit synthetic-public presentation records are readable anonymously. Database membership, embeddings, source links or model transformation do not establish downstream rights. Retention/embedding rights for real sources and any future corpus export still need source-specific review; UNKNOWN stays UNKNOWN.


## Final portfolio licence boundary

The final audit does not select a repository code licence or clear historical Git content. [Owner options](engineering-decisions.md#code-licence-decision-remains-with-the-owner) separate software licensing from original fiction, selected historical facts/references, screenshots/media and UNKNOWN provider/excerpt/model material. New fixture-normalization tests use independently written fictional inputs matching the provider type, not copied provider payloads. The absence of official media and use of attribution do not establish definitive branding/redistribution clearance.


The final security maintenance vendors only shadcn 4.11.0's existing CSS body with its verified MIT copyright/permission notice, removing the unused CLI dependency. Source/version/hash are in [engineering decisions](engineering-decisions.md#final-security-maintenance--bounded-dependency-changes) and the shipped software notices. This software-code decision grants no sports-data/media or general repository licence.
