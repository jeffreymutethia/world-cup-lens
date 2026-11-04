# Verified current architecture

Inspected 2026-11-03. World Cup Lens now has a self-contained curated historical replay, secondary fictional lab, and separately configured Supabase archive/authoring path. This describes repository code and local/CI checks, not an invented deployment or a reproducible production database. No migrations/RPC SQL/RLS definitions are tracked.

## Deployment and trust boundaries

`src/lib/deployment-mode.ts:deploymentMode` reads the non-public server variable `WCL_DEPLOYMENT_MODE`. Only exact `archive-enabled` opts in to the historical/backend boundary. Missing, invalid, or `demo-only` values select `demo-only`. Lower-level replay helpers also default closed. No URL, client control, credential presence, or fallback can enable archive functionality.

```mermaid
flowchart TD
  Browser[Browser mode date and optional match ID] --> Policy{Server deployment policy}
  Policy --> Public[Public datasets available in either policy]
  Public --> Select{Strict mode and date selection}
  Select -->|curated - public default July 11| Curated[Five local date-only editorial records]
  Curated --> Validate{Version and record validation}
  Validate -->|valid matches| History[Historical list detail sources and original context]
  Validate -->|valid empty date| Empty[Explicit curated empty state]
  Validate -->|invalid records| Error[Explicit curated error - no substitution]
  Select -->|illustrative| Fiction[Local synthetic records and sample Lens and QA]
  Fiction --> Lab[Fictional lab UI - no model call]
  Select -->|archive| ArchiveGuard{Archive-enabled server policy}
  ArchiveGuard -->|no| Disabled[Disabled state - no database call]
  ArchiveGuard -->|yes| Archive[Los Angeles day reader - private default July 11]
  Archive --> Client[Publishable Supabase client]
  Client --> DB[(Provider fixtures relations cached lenses and questions)]
  DB --> ArchiveUI[Unverified provider data and retrospective cached AI commentary]
  Browser --> Author[Admin POST or cron GET and HEAD]
  Author --> Guard{Server authoring guard}
  Guard -->|demo-only| Denied[404 before auth or work]
  Guard -->|archive-enabled| Auth[Existing secret gate]
  Auth --> Pipeline[Lazy imported private authoring pipeline]
```


The public demo is decoupled from the database so service availability, paid credentials, and uncleared historical data are not prerequisites for demonstrating UI/engineering work. Archive mode retains its meaning; it is not an alias for fictional content. The flag must be set consistently at build and runtime/deployment. `/about` uses request-time `connection()` so its explanation follows runtime policy rather than a stale static mode snapshot.

## Replay and public reads

Both public pages await Next.js 16 promise-based `searchParams`. `parseReplaySelection` validates mode plus strict `YYYY-MM-DD` within June 11–July 19, 2026. In demo-only mode missing mode/date selects curated July 11. Curated and illustrative modes are available; Explicit archive requests produce “Archive disabled in public demo”; the page contains no archive selector/link and does not substitute examples for an explicitly requested archive. In archive-enabled mode missing mode/date retains archive July 11. Duplicate/invalid input is a separate validation state.

`src/lib/replay-access.ts` passes actual server policy to shared `loadReplay`/`loadReplayAnswers` and imports the Supabase repository only inside an allowed archive reader. Illustrative reads use the reviewed local `src/data/seed.ts` module, not a database or an AI API. `buildIllustrativeViewModel` handles missing relations and rejects incompatible cached text; missing commentary preserves available fixture details. `loadReplay` validates calendar timestamps, filters a half-open Los Angeles calendar day, sorts by kickoff/ID, and selects the first fixture as featured. It has distinct ready/empty/error results. It never silently falls back between datasets.

`src/app/page.tsx` routes curated mode to `CuratedHome`: an editorial introduction, scoreboard hero, four matchday links and secondary fixtures excluding the featured ID. Single-match dates render the hero without a duplicate list card. Fictional/private modes retain a date form and collection notice. `src/app/matches/[id]/page.tsx` resolves the ID inside the same dataset/day result; missing IDs show a useful selection-specific message (not a dedicated 404). `replayHref` preserves mode/date in card/back links. Empty days, invalid selections, missing matches/cache, and archive query errors have different messages. `src/app/loading.tsx` supplies loading UI. Curated history covers four dates; the separate fictional lab covers two dates. Neither claims complete tournament coverage.

`getProviderMatchesForDate` uses explicit local-midnight UTC boundaries and provider-only matches with joined team/venue rows, followed by a batched Lens lookup. `dateBounds` computes each Los Angeles midnight independently, including DST; a selected date is not a UTC instant or knowledge cutoff. Missing relations fail rather than silently omitting fixtures. Missing/invalid/unreadable lenses preserve fixtures with cache-state notices. Cached questions have a separate unavailable state. `getProviderMatchesForLocalDate` remains for legacy today-based authoring and retains live-first ordering; public replay never uses its real-clock default.

## Reviewed demo and presentation

The newly authored `wcl-synthetic-v2` contains four fictional teams with alphabetic initials, two fictional locations, three scenarios, stored sample commentary and preset questions. No real team profiles, national flags, provider records, external quotations, results, logo assets, or numerical strengths are inputs. Strength fields are null; `TeamStrengths` permits unknown values without assigning arbitrary numbers. All fixtures and copy are explicit fiction; “No real result” replaces result-like display in illustrative mode. The replaced legacy examples remain in Git history, not in current demo selection.

`DEMO_PUBLICATION` records a scoped review/version and evidence file, not a heuristic licensing engine. [Publication review](demo-publication-review.md) approves only this new original material and original icon. Existing UNKNOWN provider/editorial/legacy rights remain unknown. Starter SVGs/favicon were removed; system fonts and existing licensed software/icons are used, with named-package notices at `/third-party-notices.txt`.

`MatchLensCards` preserves qualitative cards but withholds all numerical team comparisons. `PublicMatchLens` excludes unsupported edges; ignored malformed/missing numerical fields cannot erase otherwise compatible text. Confidence/volatility/edge values are labeled uncalibrated stored opinions, and null edge means no edge stated. Lens/Q&A context is not claim-level citation proof. `MatchQa` is a client component switching between cached answers; it does not send a question to a service. `/about` explains the curated, fictional, private archive and authoring branches, evidence limits and publication scope and has functional navigation/license links. All visual layout remains Tailwind/Radix/Lucide-based.

`analysisProvenance` separates recorded event reference from optional cache write time. Source publication/capture, model generation and historical cutoff remain unknown for archive rows, and its dataset version remains null. Synthetic mode identifies version `wcl-synthetic-v2` and labels model-generation/cutoff concepts not applicable to authored fiction. No historical timestamp is fabricated and no cached archive prose is rewritten. See [provenance/time contract](data-provenance.md).

## Protected historical authoring path

All six admin POST routes under `src/app/api/admin/` and `GET /api/cron/today` check the deployment guard first. Demo-only responses are 404 even with matching secrets; implicit cron HEAD also receives the guarded result. Business functions are dynamically imported after the guard and existing auth. Archive-enabled operation still requires `x-admin-secret` / `ADMIN_GENERATION_SECRET`, or cron bearer `CRON_SECRET`. No route test authorizes real work.

```mermaid
flowchart LR
  Source[API-FOOTBALL reported records] --> Ingest[Fixture ingestion and normalization]
  Ingest --> Rows[(Supabase teams venues matches)]
  Rows --> Documents[Templated provider documents]
  Other[Other documents with unknown origin] --> Chunks
  Documents --> Chunks[Chunking and OpenAI embeddings]
  Chunks --> RPC[Vector retrieval RPC call]
  RPC --> Generation[Responses structured generation and proofreading]
  RPC --> Snippets[Title-deduplicated context snippets]
  Snippets --> Cache[(Lens cache)]
  Generation --> Cache
  Cache -->|archive-enabled reads only| UI[Replay UI]
```

`runTodayPipeline` awaits fixtures → provider document synthesis → full-corpus embedding → today's live/upcoming Lens generation. Fixture ingestion uses provider IDs/status/goals but assigns placeholder strengths, derived codes/flags, and league country to venues. Document sync synthesizes profiles with null source URLs. Embedding deletes/replaces chunks per document without atomic versioning. Retrieval calls `match_document_chunks` with entity filters but no historical cutoff; RPC SQL/indexes are not tracked. Generation parses Zod structured output, proofreads, normalizes, and attaches snippets before saving one mutable JSON/model/update row per match. Source IDs/URLs and immutable lineage are lost; snippets are not mapped to claims. Cache presence, not content versions, controls skip behavior. No authoring operation was executed by this milestone.

`server.ts` uses publishable credentials; `admin.ts` and OpenAI factories remain server-only. Actual backend policies/dimensions are unverified. Private/archive configuration and [historical source rights](data-rights.md) are separate gates; neither demo publication nor API subscription grants historical export permission. `vercel.json` schedules no cron.

## Verification and delivery

CI uses pinned actions, read-only token permissions, Node 22, `npm ci`, unit tests, lint, typecheck (`next typegen` first), build, archive-enabled mock HTTP checks, production-server and unset/invalid development-server demo isolation checks, and committed/generated whitespace validation. No real service credentials are supplied. The demo harness starts with empty service settings, asserts the fetch-denial preloader is active, checks browsing plus local guarded methods with matching dummy secrets, and asserts zero service fetches. These checks are not browser interactivity, full egress enforcement, production policy, or historical accuracy verification.

The existing `jt254/world-cup-lens` Vercel project was inspected through its authorized dashboard and first deployed on 2026-11-03. It tracks `main`, uses Next.js at the repository root, and serves [the public demo](https://world-cup-lens-one.vercel.app). Production has only the non-secret demo-only policy configuration; no service keys were supplied. Node 22 matches the repository engine constraint. No cron jobs were listed, and project cron execution was explicitly disabled. No new project, paid plan or data migration was created. See [deployment evidence](deployment.md) for revision-specific status, browser QA and evidence limits. The public HTTP check is explicit and is not part of offline CI.


## Curated history contract and worked example

`src/data/curated-history.ts:curatedMatches` holds five independently selected records, version `wcl-curated-2026-v2`. `CuratedMatch` in `src/lib/curated-history.ts` is separate from legacy timestamp-based `Match`: event day is `YYYY-MM-DD`, precision is `day`, basis is `source-local-event-day`, and unknown clock time/events/statistics/capture/generation/cutoff are explicit nulls. No fake midnight kickoff is stored. `formatMatchDay` formats calendar parts; curated filtering compares exact day keys without timezone conversion. Los Angeles boundaries remain unchanged for timestamp-based archive/fictional data.

`CURATED_PUBLICATION` records the owner's narrow editorial source/web release decision, not an open-data licence or legal clearance. Source identity/URL, access/review days, known publication day, evidence access method, dataset version and original retrospective copy accompany every record. Official article bodies were index-accessible rather than directly readable in three cases; the UI and review document disclose this. Argentina–Switzerland uses FIFA's explicit July 11 local event day, distinct from its July 12 article date and UEFA's July 12 entry. No timezone explanation is invented.

`loadCuratedHistory` validates the whole module, rejects malformed/duplicate records and distinguishes ready/empty/error. First in reviewed array order is featured; this is editorial order, never inferred kickoff order. Legacy `loadReplay` and `loadReplayAnswers` reject curated mode before any reader, so editorial context cannot acquire a cached-AI provenance label. Both public pages branch to curated components before entering legacy services. The shared footer gives an unofficial/non-affiliation notice.

Follow Norway–England through the code:

1. `curatedMatches` declares `norway-england-2026-07-11`, July 11, quarter-final, Miami Stadium, 1–2 and `afterExtraTime: true`, with FIFA source metadata and explicit unknowns.
2. `parseReplaySelection({})` under demo-only selects `{ mode: "curated", date: "2026-07-11" }`.
3. `loadCuratedHistory` returns Norway–England as editorial featured plus Argentina–Switzerland. No service client is created.
4. `CuratedScoreboard` formats the featured result and extra-time label, and `replayHref` builds `/matches/norway-england-2026-07-11?mode=curated&date=2026-07-11`.
5. Detail resolves that ID only within the selected curated day, renders `CuratedMatchDetail` facts/context/source metadata, and preserves the same back URL. No Lens lookup, generation or Q&A is performed for curated matches.

Editorial context was newly written during agent-assisted implementation and reviewed against the selected facts. It is not a stored OpenAI Match Lens response or output of the repository's RAG pipeline; no model/API request was made by the app. Fictional sample copy and private actual cached AI commentary retain their own labels and contracts. See [publication evidence](curated-history-review.md), [rights](data-rights.md) and [deployment](deployment.md).


## Editorial interface — design revision v2

The supplied reference PNGs guide composition; their HTML/CSS and wording were not pasted into the application. `AppShell` now supplies one responsive `TopNav`, a skip link, one main landmark and a concise non-affiliation footer. The removed sidebar has no remaining imports. TopNav is a small client component only for the mobile disclosure: real button, expanded/controls state, Escape-to-close/focus return and route-close behavior. Match selection and reading remain server-side. The existing Q&A component remains client-side and reads stored answers only.

```mermaid
flowchart TD
  URL[Mode date and match ID] --> Parse[Existing selection validation and server policy]
  Parse -->|curated| Local[Validated five-record module v2]
  Local --> Home[CuratedHome]
  Home --> Hero[Featured scoreboard]
  Home --> Tabs[Four real matchday links with current date]
  Home --> Other[Secondary fixtures excluding featured ID]
  Local --> Detail[CuratedMatchDetail scoreboard recap source notes]
  Detail --> Related[Other match on same selected day only]
  Parse -->|illustrative| Fiction[Separate sample Lens and QA v2]
  Parse -->|archive-enabled only| Archive[Existing Supabase read path]
  Policy[Unchanged demo-only guard] --> Deny[Admin and cron denied before work]
```

`CuratedMatchDetail` separates original recap from the source panel. An ordinary external source link is always visible; native `details` exposes review/access days, publication day, version, indexed-access limitation, explicit unknowns, Argentina date discrepancy and scoped publication uncertainty. This disclosure is presentation, not deletion of evidence. Norway is accurately labeled FIFA schedule and results rather than a match report. Related/back links preserve dataset/date.

Presentation tokens in `globals.css` define forest/lime/paper colors, system type, geometric CSS pitch lines and responsive behavior. Muted text was darkened from the mockup for normal-text contrast. Date links scroll within their container, with padded focus rings; reduced motion is respected. Monograms are original typography, hidden from assistive technology with the duplicate visual scoreboard; the semantic match heading announces teams/result. No new dependency, remote font, media asset, API request, schema or service guard is introduced.

Versions `wcl-curated-2026-v2` and `wcl-synthetic-v2` identify the copy revision. The five historical IDs/results/stages/venues/event-day/AET/source facts are unchanged; fictional styles remain authored assumptions. Private cached prose is never rewritten. Browser evidence and any limits are recorded separately in [design implementation](design.md) and [deployment](deployment.md).
