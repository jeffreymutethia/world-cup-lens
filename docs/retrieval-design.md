# Versioned retrieval design

`supabase/migrations/20261104000200_versioned_retrieval.sql:match_document_chunks` is a chosen reconstruction. Production exposed the RPC name, but its body was not available. The six existing argument names are retained; cutoff/model/version arguments are additive defaults. Production installation is not implied. Public historical Match Lenses use separately authored local content and do not call this RPC; retirement of the fictional public lab does not change private retrieval or synthetic SQL fixtures.

## Metric and dimensions

`src/lib/rag/contract.ts` pins 1,536 finite, nonzero coordinates and the application's existing `text-embedding-3-small` default. Unsupported model overrides fail before API use. Batch response indices must be complete/unique and are sorted before mapping. SQL uses `extensions.vector(1536)` and rejects zero queries, null/out-of-range thresholds and counts outside 1–50. Cosine similarity is `1 - (embedding <=> query_embedding)` with inclusive threshold, descending similarity then ascending chunk UUID. The application requests threshold .15 and eight chunks. This threshold is a selection parameter, not a calibrated confidence measure.

The synthetic corpus uses basis vectors and the explicit model label `synthetic-basis-1536` / `basis-v1`; it is not represented as OpenAI output. No embedding service is needed to exercise SQL.

## Entity scope

Semantic similarity ranks **only eligible** records. Every nonnull scope tag must match:

- team-tagged: team belongs to requested team array;
- venue-tagged: venue equals requested venue;
- match-tagged: match equals requested match.

The tags combine with AND. A source tagged Maple Eleven **and another match** is excluded from Maple's current matchup, regardless of similarity. A source without any scope is excluded unless `is_global=true`; global documents must have all three tags null. Null/empty requested filters do not widen tagged records. Global inclusion is an explicit authoring decision, not a fallback to random context.

Only current version heads with unchanged document input hashes qualify. Versionless legacy chunks remain stored for compatibility but are excluded from this RPC; an operator must create a genuine new version. Model/version must match both chunk and version. If document content or provenance changes before new embeddings exist, old chunks are withheld rather than silently reused.

## Cutoff semantics

Retrospective retrieval permits unknown source availability while preserving its nulls in lineage. A nonnull historical cutoff requires `availability_verified=true`, known publication/capture, and both times at or before cutoff. SQL constraints require publication <= capture and nonempty identity/evidence. Unknown and later sources never qualify. A content/provenance edit clears the old verified flag/evidence; a separate explicit review is required to establish availability for the new material. Result clocks use fixed UTC ISO text with microseconds, avoiding JSON manifest differences between session timezones.

Retrieval returns the existing seven display fields plus document version, content/input hashes, dataset version, source identity, publication/capture, availability and embedding versions. `ContextSchema` checks the full response before model work. Source excerpts are attached deterministically for reading; the separate manifest carries lineage. Neither is claim-level proof.

## Why this storage and query

Postgres keeps fixtures, source metadata, vectors and caches under the same FK/transaction/security model. Supabase supplies the existing client boundary; a second vector database would add reconciliation and authorization infrastructure without a demonstrated need. Embeddings support semantic similarity when wording differs; entity/time filters prevent relevance from overruling eligibility. Exact scanning is deliberate for the MVP's small corpus. An approximate index would require recall/filter benchmarks and cannot be assumed to preserve exact top-K ordering.

The relational indexes in migration 1 support fixture dates, joins, source heads and history. No ANN index or performance claim is made. Large-corpus scalability, retrieval relevance evaluation, calibrated thresholds and chunker tuning remain work.

## Consistency and tests

Commit rechecks the input fingerprint, selected source heads and retrieval under locks, then stores the actual ordered manifest. A selected head changed during generation is rejected. An unselected/new source may appear concurrently: this is **not a serializable corpus-wide snapshot** or globally phantom-free top-K guarantee. Immutable selected chunk/version identities still explain precisely what was used. A corpus revision/advisory locking protocol shared by every writer would be needed for stronger release consistency.

`supabase/tests/integration.sql` exercises cosine/orthogonal/opposite vectors, threshold boundary, count bounds, deterministic ties, all scope rules, model isolation, current-version invalidation, cutoff/unknown handling and empty results against PostgreSQL. [Pinned pgvector source](https://github.com/pgvector/pgvector/blob/v0.8.2/README.md) documents the operator; the SQL tests establish the selected semantics here.
