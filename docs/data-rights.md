# Source rights and redistribution review

Reviewed 2026-11-03. This is an evidence inventory and conservative repository publication policy, not a finding that every use is lawful or unlawful. **No public historical dataset export is approved.** Database access, factual subject matter, an API subscription, embedding, or model generation does not establish publication permission. No raw provider export, logo asset, or new historical dataset was added by this milestone.

## Provider identity and primary evidence

The code calls `v3.football.api-sports.io` with `x-apisports-key` in `src/lib/fixtures/api-football.ts:fetchWorldCupFixtures`. This is **API-FOOTBALL, the API-SPORTS product**, not football-data.org, footballapi.org, football-api.com, or footballapi.com. Those providers' licenses do not apply here.

- **P1:** [API-FOOTBALL Terms of service](https://www.api-football.com/terms), sections “Terms of use”, “Service & data”, and “Data/Logos/images”; page displays last updated May 21, 2025, accessed November 3, 2026. The terms prohibit direct resale without permission, disclaim a publication license, and place third-party permission checks on the user. Their app/website examples do not establish an open-data grant for a downloadable GitHub archive. Attribution alone is not a substitute for permission. Media may need authorization from its rights holder. **The account's accepted terms/version, competition-specific permissions, and any separate agreements are UNKNOWN.**
- **P2:** [API-FOOTBALL documentation](https://www.api-football.com/documentation-v3) and its [official beginner guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide). These identify fields/endpoints and explain image delivery/caching; zero-quota image access is not an intellectual-property license. No API endpoint was invoked for this research.
- **P3:** [OpenAI Services Agreement](https://openai.com/policies/services-agreement/), effective January 1, 2026, §§4.1, 4.3–4.4. It allocates output ownership between customer and OpenAI subject to law, makes the customer responsible for input permissions and output use, and notes non-uniqueness. It does not clear underlying provider/publisher rights. Applicability of the account's actual agreement at each generation is UNKNOWN.
- **P4:** [Unicode emoji charts](https://unicode.org/emoji/charts/full-emoji-list.html) identify emoji characters; [Unicode licensing information](https://www.unicode.org/license.txt) concerns Unicode materials. Current UI renders character strings with platform glyphs, not downloaded chart/vendor images. No grant for third-party logos or a dataset is inferred from Unicode documentation.

No messages were sent to providers or rights holders. A public webpage's current terms are evidence to review, not proof of this application's contractual entitlement.

## Category decisions

`UNKNOWN` means sufficient rights evidence has not been established. `NOT_APPROVED` is the repository's export decision, not a claim that permission can never be obtained. `REVIEW_REQUIRED` is the public-web release gate. The same conservative statuses are encoded by `src/lib/data-rights.ts:sourceRights`; that registry is not an export tool or legal enforcement boundary.

| Category / registry ID | Source and content classification | Attribution evidence / unresolved rights | Public GitHub dataset | Public web display |
| --- | --- | --- | --- | --- |
| Fixtures/results — `api-football-fixtures` | API-FOOTBALL via API-SPORTS; reported factual records; P1/P2 | Specific applicable attribution and competition permissions UNKNOWN; refer to P1 | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Team identity — `team-identity` | Provider IDs/names mixed with app-derived code suffixes and flag lookup; factual labels plus application transformations | Provider/competition/name/mark requirements UNKNOWN; emoji characters are not proof of logo rights; P1/P4 | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Logos — `provider-logos` | Provider team `logo` URLs saved as `logo_url`; external branded imagery; not rendered by current replay | Rights-holder identity/permission and required attribution UNKNOWN; P1. No logo binary is bundled | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED before adding logos |
| Venues — `venue-data` | Provider name/city/ID; app currently copies league country into venue country | Provenance and country accuracy incomplete; applicable attribution/permissions UNKNOWN; P1/P2 | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Provider documents — `provider-documents` | Application-synthesized prose about provider rows, including placeholder strengths | Original upstream terms remain relevant; publication/embedding entitlement and author/source chain UNKNOWN; no new license inferred by reformatting | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Editorial/context snippets — `editorial-snippets` | Seed editorial examples and excerpts of stored documents; external publisher identity may be missing | No article crawler is tracked; unknown documents cannot be assigned a publisher/license by title. Link, author, publication date, excerpt allowance, and attribution UNKNOWN | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Lens and cached Q&A — `cached-ai-commentary` | OpenAI-generated Lens plus deterministic context snippets; Q&A writer is untracked and origin UNKNOWN | Customer/account agreement, input rights, source excerpts and ownership chain UNKNOWN; P3 is not downstream clearance | NOT_APPROVED; rights UNKNOWN | REVIEW_REQUIRED |
| Illustrative examples — `illustrative-examples` | Existing `src/data/seed.ts`: synthetic fixtures/venues, authored strengths/copy, real-world team labels | Existing tracked examples remain explicitly synthetic; authorship/licensing record and third-party mark rights UNKNOWN. No repository LICENSE or new approval is supplied | NOT_APPROVED as a new dataset; rights UNKNOWN | REVIEW_REQUIRED for public release |

See [data provenance](data-provenance.md) for exact fields, transformations, and missing lineage. All eight categories deliberately retain UNKNOWN publication rights. Do not relabel unknown records as “open”, “public domain”, “licensed”, or approved because a field describes a fact.

## Publication gate

Before exporting any historical subset or deploying a public data display:

1. Identify each source/rights holder and the actual account agreement/terms version applicable to acquisition, embedding and intended use. Record evidence privately when commercially sensitive; commit only safe evidence references.
2. Resolve dataset redistribution separately from website display, source excerpts, logo use, embedding retention, and model-derived commentary. Obtain required permissions or an explicitly licensed alternative; do not assume a free API tier supplies them.
3. Record exact approved scope, attribution text/links, audience, duration, permitted transformations, retention, and reviewer/date. UNKNOWN remains blocked; no rights are backfilled from confidence scores or source titles.
4. Review the actual proposed export, including snippets and derived documents, before committing it. Schema/code/tests can be published without copying provider rows; synthetic test records are not evidence clearing the historical corpus.

This milestone preserves the existing local replay for review, with stronger truthfulness labels. It grants no new dataset rights and performs no deployment. Historical accuracy, branding/endorsement, and licensing are distinct reviews.
