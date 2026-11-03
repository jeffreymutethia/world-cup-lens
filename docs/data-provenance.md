# Data provenance and historical time semantics

Inspected 2026-11-03 against baseline `25d414e`. This documents implemented transformations and explicit unknowns; it is not a verified historical source archive. Read [data rights](data-rights.md) before publication. The inventory includes existing illustrative examples but does not export provider records.

## Evidence from the application and cache

| Finding | Repository evidence | Consequence / presentation policy |
| --- | --- | --- |
| Fabricated strength defaults | `src/lib/fixtures/normalize.ts:normalizeApiFootballFixture`, `sync-fixtures.ts:syncWorldCupFixtures`: every strength is 50; `src/data/seed.ts:teams/cachedLenses` has authored values such as 56/44 | No measured methodology or per-field source exists. All numerical Team Edges bars are removed from public presentation in both modes; unavailable is not zero/equality. Legacy stored fields remain unchanged. |
| Defaults become apparent evidence | `sync-provider-documents.ts:teamDocumentBody` embeds scores in a “Provider-derived” tactical profile with a caveat; `ai/prompts.ts:buildMatchLensPrompt` instructs exact edge values | Existing commentary may reason from placeholders. Keep prose unchanged, label it unverified stored commentary, and do not claim hiding bars repairs its factual grounding. |
| Non-calibrated opinions | `MatchLens.confidence/volatility/slightEdge` and `MatchForecastCard`, featured/list cards | Labels are now explicitly stored, uncalibrated opinions. Null edge means “No edge stated”, not “Even”. No probability or measured edge is inferred. |
| Context is not citations | `ai/source-snippets.ts:hydrateLensSources` attaches every distinct retrieved title, truncates content, drops IDs/URLs, and does not map claims to excerpts | UI says stored context snippets (illustrative context examples in synthetic mode), with a non-citation caveat and empty-context state. |
| Event time is not knowledge time | `Match.kickoffAt`, date selection, `generate-and-save-match-lens.ts:generateAndSaveMatchLens` writes wall-clock `updated_at` | The selected date filters fixtures; neither it nor kickoff nor last cache write authenticates a pre-kickoff forecast. |
| Unverified identity/geography/stage/results | `deriveTeamCode` appends external ID, `deriveFlag` uses finite aliases; venue country uses `league.country`; group/stage share `group_name`; writer discards penalty breakdown | Fixture fields are labeled stored provider records, not independent verification. No flags, venue country, result events, or stage correctness is repaired by AI prose. Existing score/status safeguards remain. |

Read-only sample: two provider-linked July 11 fixtures and two cached Lens rows were inspected with publishable access. All cached edge values in both samples were 50; prose contained placeholder/neutrality wording; each had four title/snippet sources without URLs. Both venue countries were `World`. Model and cache-update fields existed, but neither Lens supplied a knowledge cutoff or generation timestamp. These observations are limited to two samples and do not establish complete corpus origin, correctness, or rights. No raw cached prose, source export, or identifying record dump was added to the repository.

## Source inventory

| Category | Actual source / identity | Fields and classification | Verified implementation / unresolved boundary |
| --- | --- | --- | --- |
| Fixtures and results | [API-FOOTBALL / API-SPORTS](https://www.api-football.com/documentation-v3); configured `/fixtures` feed | IDs, kickoff, round, provider state/elapsed, goal totals; provider-reported factual records | `fixtures/api-football.ts`, normalization and upsert. Original payload/source capture is not retained by this writer; real-world accuracy unverified. |
| Team identity and logos | Same provider for numeric ID/name/logo URL; app's `sync-fixtures.ts` for codes/emoji | Mixed factual labels and derived identifiers; logo is branded media | Provider code is not used directly; codes are app-generated. Logos are stored externally as URL references, not part of `Team` display mapping. Flag overrides/fallbacks are application choices, not verified provider flags. |
| Venues | Provider `fixture.venue` plus app fallback strings and league country | Name/city/ID, synthetic fallback labels, possibly inappropriate country | `normalizeApiFootballFixture` maps null IDs to fallback slugs; country is competition geography, not independently sourced venue geography. |
| Provider-derived documents | `documents/sync-provider-documents.ts:teamDocumentBody/venueDocumentBody` | App-authored templates about provider rows; placeholder metrics, not independent tactical research | Upserted `documents` with null `source_url`; not an external publisher endorsement. Existing entity/type document IDs can be reused. |
| Editorial or curated snippets | `src/data/seed.ts`; otherwise bodies already in Supabase `documents` | Synthetic editorial examples, templated profile excerpts, or UNKNOWN origin | No tracked article importer or Q&A writer. A title such as “Tournament format” is not proof a publisher document exists. No external source identity can be invented from it. |
| Cached AI Lens | OpenAI Responses + supplied team/venue/context in `ai/generate-match-lens.ts` | Model-generated interpretation with deterministic snippets; confidence/volatility are editorial labels | `generateAndSaveMatchLens` persists JSON/model/update per match; no immutable input/source/prompt lineage is saved. Proofreading is another model call. None were executed for this milestone. |
| Cached Q&A | Seed examples, or Supabase `qa_answers` | Editorial/cached text; model-generated origin for arbitrary DB answers UNKNOWN | Public code only reads/validates answers. It does not generate them. |
| Illustrative fixtures and examples | `src/data/seed.ts` | Synthetic fixture/venue/tactical examples; real team names and emoji characters | Existing tracked demo content, not an authoritative historical dataset or source license. |

Rights/attribution and separate GitHub-versus-web decisions for these categories are in [data-rights.md](data-rights.md). The runtime review registry `src/lib/data-rights.ts` keeps every category's publication rights UNKNOWN, dataset export NOT_APPROVED, and public display REVIEW_REQUIRED. It is not an exporter or a rights-enforcement service.

## Implemented temporal representation

`src/lib/analysis-presentation.ts:analysisProvenance` creates a read-only display representation; it does not write or backfill any database fields. `PublicMatchLens` excludes unsupported `teamEdges` from the UI type; the legacy generation/storage `MatchLens` contract remains. Public cache validation checks the displayed text, enums, arrays and snippets, while ignored missing/malformed legacy metrics cannot hide otherwise readable qualitative copy. This does not validate truth or citations.

| Concept | Current representation | What it establishes / does not establish |
| --- | --- | --- |
| Match event time | `matchEventAt` from recorded `kickoffAt`, offset-bearing ISO timestamp or null | Scheduled/event reference from a stored fixture; not proof of actual whistle time or when a source was known. |
| Source publication time | `sourcePublishedAt: null` | UNKNOWN. No value inferred from document insertion, title, or kickoff. |
| Source capture time | `sourceCapturedAt: null` | UNKNOWN. A document/cache update is not evidence of acquisition time. |
| Analysis generation time | `analysisGeneratedAt: null` | UNKNOWN. Model name and cache `updated_at` do not prove request completion time. |
| Historical knowledge cutoff | `knowledgeCutoffAt: null` | UNKNOWN; existing archive commentary is always retrospective, never promoted into an authenticated pre-kickoff forecast. |
| Dataset version | `datasetVersion: null` | UNKNOWN. A Git commit or selected date does not identify the database snapshot. |
| Cache last-write time | `cacheUpdatedAt` from `match_lenses.updated_at`, if valid | Separate, labeled cache modification time only. It may be missing/invalid; that does not fabricate a timestamp. |

The UI shows these distinct fields on Lens detail. Timestamp parsing requires a full ISO timestamp with offset and a valid calendar date. Illustrative metadata is labeled synthetic; its fixture time does not become real event provenance. Inputs that claim a cutoff/version are not promoted by this legacy display adapter. Source URLs/IDs/timestamps are absent from cached title/snippet references and remain unresolved.

## Actual pipeline and missing lineage

```mermaid
flowchart TD
  Source[API-FOOTBALL source - reported records] --> Ingest[Fixture ingestion and normalization]
  Ingest --> Rows[(Stored teams venues and matches)]
  Rows --> Document[Templated provider document]
  Other[Other stored documents - original source UNKNOWN] --> Chunk
  Document --> Chunk[Chunking and embeddings]
  Chunk --> Store[(document_chunks with document ID and metadata)]
  Store --> Retrieval[match_document_chunks RPC call]
  Query[Matchup query embedding] --> Retrieval
  Retrieval -->|RPC SQL and temporal filtering unverified| Generation[Responses structured generation and proofreading]
  Generation --> Cache[(Cached Lens JSON model updated_at)]
  Retrieval --> Snippet[Title-deduplicated context snippets]
  Snippet -->|IDs URLs and source dates lost| Cache
  Cache -->|No immutable source or generation lineage| UI[Replay UI - stored retrospective commentary]
  Rows --> UI
  Seed[Synthetic local examples] --> UI
```

The RPC implementation is not tracked. There is no source-publication cutoff argument in `retrieveMatchContext`; entity IDs and similarity are not historical eligibility. Snippets are attached deterministically after generation rather than per claim. The cache upsert overwrites per match and loses prior versions. The diagram describes code calls, not verified infrastructure or a guarantee that all stored documents followed this pipeline.

## Proposed provenance contract — not migrated or backfilled

Design a reviewed, immutable contract before making authenticated historical forecasts or exporting data:

- **Source revision:** stable source ID, publisher/rights-holder ID, canonical URL where known, content hash, publication and capture times with timezone and evidence, source kind, explicit unknown values, and a rights-review ID. Revisions do not overwrite original evidence.
- **Rights decision:** distinct permissions for web display, dataset redistribution, snippet use, embeddings, and retention; status UNKNOWN/PENDING/APPROVED/REJECTED; evidence reference, approved scope/attribution/expiry, reviewer and review time. An unknown upstream decision propagates to derived content; it is never converted by inference.
- **Document/chunk revision:** source revision and transformation/version, document hash, chunk ID/hash/index/span, embedding model/dimensions/chunker version. Preserve identity through retrieval; do not use a title as an ID.
- **Retrieval/generation record:** source/chunk revision IDs, retrieved query and entity scope, requested/effective cutoff and eligibility evidence, prompt/schema/model versions, actual generation start/completion times, output hash and immutable run ID. A cache write timestamp remains separate.
- **Dataset manifest:** immutable dataset ID/version/hash, included entity/source/output revisions, event-date range, selection timezone, rights decisions and permitted audience. Avoid copying restricted content into a public manifest.
- **Claim support:** optional explicit claim IDs tied to excerpt/span evidence and review status. Being retrieved does not count as support; absence stays unverified.

Migration proposal: inspect/export schema definitions through authorized evidence first; review additive version/source/run/rights tables, constraints, foreign keys, RLS and query/index design in a disposable database. Backfill only facts established by existing evidence. Legacy rows retain null publication/capture/generation/cutoff/version fields; `updated_at` may populate only cache-write metadata. Do not regenerate Lenses to manufacture history. Add eligibility tests excluding material not demonstrably available by an authenticated cutoff before enabling any forecast label. Production migration/backfill and any dataset export require separate explicit authorization and rights review.
