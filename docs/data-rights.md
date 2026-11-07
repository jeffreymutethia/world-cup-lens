# Source rights and redistribution review

Provider inventory reviewed 2026-11-03; public editorial scope reassessed 2026-11-07. This is an evidence inventory and conservative repository publication policy, not a finding that every use is lawful or unlawful. **No provider export is approved. The independently curated 104-match editorial collection has a separate scoped release decision below.** Database access, factual subject matter, an API subscription, embedding, or model generation does not establish publication permission. No raw provider export, official logo/media asset or source article copy is included.

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
| Provider documents — `provider-documents` | Application-synthesized prose about provider rows; legacy versions included placeholder strengths, current templates omit them | Original upstream terms remain relevant; publication/embedding entitlement and author/source chain UNKNOWN; no new license inferred by reformatting | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Editorial/context snippets — `editorial-snippets` | Seed editorial examples and excerpts of stored documents; external publisher identity may be missing | No article crawler is tracked; unknown documents cannot be assigned a publisher/license by title. Link, author, publication date, excerpt allowance, and attribution UNKNOWN | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Lens and cached Q&A — `cached-ai-commentary` | OpenAI-generated Lens plus deterministic context snippets; Q&A writer is untracked and origin UNKNOWN | Customer/account agreement, input rights, source excerpts and ownership chain UNKNOWN; P3 is not downstream clearance | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Legacy illustrative examples — `illustrative-examples` | Replaced `5dff6a3:tests/fixtures/illustrative.ts`: synthetic fixtures/venues, authored strengths/copy, real-world team labels | Legacy examples remain in Git history; authorship/licensing record and third-party mark rights UNKNOWN. No repository LICENSE or new approval is supplied | NOT_APPROVED as a new dataset; rights UNKNOWN | REVIEW_REQUIRED for public release |

See [data provenance](data-provenance.md) for exact fields, transformations, and missing lineage. All eight legacy/provider categories deliberately retain UNKNOWN publication rights. The separate new original-demo review below does not upgrade any of them. Do not relabel unknown records as “open”, “public domain”, “licensed”, or approved because a field describes a fact.

## Publication gate

Before exporting any historical subset or deploying a public data display:

1. Identify each source/rights holder and the actual account agreement/terms version applicable to acquisition, embedding and intended use. Record evidence privately when commercially sensitive; commit only safe evidence references.
2. Resolve dataset redistribution separately from website display, source excerpts, logo use, embedding retention, and model-derived commentary. Obtain required permissions or an explicitly licensed alternative; do not assume a free API tier supplies them.
3. Record exact approved scope, attribution text/links, audience, duration, permitted transformations, retention, and reviewer/date. UNKNOWN remains blocked; no rights are backfilled from confidence scores or source titles.
4. Review the actual proposed export, including snippets and derived documents, before committing it. Schema/code/tests can be published without copying provider rows; synthetic test records are not evidence clearing the historical corpus.

Publication decisions do not establish historical accuracy, branding clearance or wider redistribution rights. The deployed public collections and their boundaries are documented in [deployment evidence](deployment.md).


## Retained original synthetic material

The `reviewed-synthetic-demo-v1` category covers the original replacement module, `wcl-synthetic-v1`, and original icon; `reviewed-synthetic-demo-v2` covers the retained `wcl-synthetic-v2` revision documented in [demo-publication-review.md](demo-publication-review.md). Its publication status is REVIEWED_ORIGINAL_CONTENT, with APPROVED_ORIGINAL_DEMO_ONLY for source inclusion and web demonstration. This is a scoped repository decision supported by newly authored fictional material with no third-party inputs; it is not a general content license, a sports-data approval, or a rights guarantee about accidental name collisions. Legacy examples, provider rows, excerpts, logos, and cached AI corpus remain UNKNOWN/NOT_APPROVED/REVIEW_REQUIRED as above.

No raw provider export is approved. The public deployment uses the separately scoped historical collection and licensed code/icon dependencies; reviewed fiction is retained for tests/compatibility, not public browsing. Demo-only cannot access the private archive or invoke authoring. Existing software/icon notices are kept separately at `public/third-party-notices.txt`. Historical sources must still pass the original publication gate before public historical use; approval of new fiction is not permission for another category.


## Full historical archive — scoped editorial release

The [historical source/publication review](curated-history-review.md) records `wcl-curated-2026-v3`: 104 independently verified factual records, original retrospective context, ten deeper editorial Lenses and source metadata. The owner explicitly expands the earlier five-match internal scope. No API-FOOTBALL payload, production database export, article text, PDF, logo, crest, official font, photograph or video is included. Dataset versioning does not appear as a public product label.

FIFA's [terms](https://legal.fifa.com/terms-of-service), including the [Training Centre version](https://www.fifatrainingcentre.com/en/terms-of-service.php) checked for the actual PDF/hub acquisition source, §6.4, [legal FAQ](https://inside.fifa.com/organisation/contact-fifa/legal-branding-and-rights), D–E, and [IP guidelines](https://digitalhub.fifa.com/m/3567360896991b48/original/FIFA-World-Cup-26-IP-Guidelines.pdf), printed pp18,21–22, support conditional attributed noncommercial editorial website/schedule use. No five-record cap was found. This is a defensible project-level reporting basis, not blanket FIFA permission, an open-data licence, unrestricted commercial reuse or definitive trademark clearance. Source linkbacks, independent presentation and non-affiliation remain conditions.

Public GitHub inclusion is a distinct scope decision: [GitHub terms](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service), D.3–D.5, require compatible hosting/fork rights, while FIFA's non-transferable website permission does not expressly settle those downstream uses. The independently written factual module is released on its narrow editorial basis, not by claiming that the website licence automatically authorizes every fork. Database/contract/territorial questions remain unresolved. The absence of an open-data licence alone is not a prohibition; factual subject matter alone is not a complete answer to database rights either. [UK guidance](https://www.gov.uk/guidance/sui-generis-database-rights) distinguishes those rights from copyright in original arrangement.

| Field/category | Current project publication decision | Limits |
| --- | --- | --- |
| 104 factual tuples: match number, teams, day, stage/group, venue, final score, AET, separately evidenced shootout/advancement | OWNER_DIRECTED_EDITORIAL_SCOPE for this version/source/web use | Independently checked facts with linkbacks; not a provider database or general dataset licence |
| Source URLs/identity and access/review metadata | Same scoped release | References acknowledge evidence; linked content is not relicensed |
| Original retrospective Match Lens context | Same scoped release | Authored editorial interpretation; no claim of model generation or historical forecast |
| Protected official media, article expression and creative presentation | NOT_APPROVED; excluded | No-logo presentation is not definitive name/domain clearance |
| Eight unrelated legacy/provider categories | UNKNOWN / NOT_APPROVED / REVIEW_REQUIRED | No rights upgrade from this decision or prior original-fiction approval |

`sourceRights` and `CURATED_PUBLICATION` record project decisions, not legal validation. Open-data licensing stays false and trademark clearance stays UNRESOLVED. The portfolio's noncommercial classification, full-compilation/database scope, name/domain and unrestricted downstream reuse are not case-specifically cleared. Reassess before monetisation, sponsorship, general licensing or another reuse context; seek qualified review or rights-holder clarification where needed. No new code/data licence is selected and no enquiry was sent on the owner's behalf.

The retired fictional public module retains only its earlier original-content scope; keeping synthetic test fixtures does not permit fictional records to appear as tournament history. The public archive uses no private stored AI prose or external excerpts whose rights remain UNKNOWN.

## Disposable backend corpus — 2026-11-04

`supabase/seed.sql`, `supabase/tests/integration.sql` and `tests/rag.test.ts` and `tests/fixtures.test.ts` contain newly authored fictional Maple/Harbor/Other Eleven names, Test Ground, short original document/commentary/Q&A text and locally constructed basis vectors. They contain no provider payload, production row, external article excerpt, badge or media. Publication decision: **APPROVED only for these original synthetic test inputs and deterministic mock outputs in this repository**. Their synthetic availability metadata is not real historical evidence; `generator_kind=mock` and synthetic embedding labels preserve that distinction. This decision does not approve any legacy/provider/model-generated production corpus or broaden the historical editorial release beyond its stated scope.

New database provider/source/history rows default private; only explicit synthetic-public presentation records are readable anonymously. Database membership, embeddings, source links or model transformation do not establish downstream rights. Retention/embedding rights for real sources and any future corpus export still need source-specific review; UNKNOWN stays UNKNOWN.


## Final portfolio licence boundary

The final audit does not select a repository code licence or clear historical Git content. [Code licence options](engineering-decisions.md#code-licence-decision-remains-with-the-owner) separate software licensing from original synthetic material, historical facts/references, screenshots/media and UNKNOWN provider/excerpt/model material. New fixture-normalization tests use independently written fictional inputs matching the provider type, not copied provider payloads. The absence of official media and use of attribution do not establish definitive branding/redistribution clearance.


The final security maintenance vendors only shadcn 4.11.0's existing CSS body with its verified MIT copyright/permission notice, removing the unused CLI dependency. Source/version/hash are in [engineering decisions](engineering-decisions.md#final-security-maintenance--bounded-dependency-changes) and the shipped software notices. This software-code decision grants no sports-data/media or general repository licence.
