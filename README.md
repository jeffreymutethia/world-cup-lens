# World Cup Lens

World Cup Lens is a football intelligence application built during the 2026 World Cup and now being adapted into a historical replay and engineering portfolio project. It pairs stored fixture records with cached AI match analysis, while keeping illustrative examples separate from the real archive.

**Status (2026-11-03):** local replay browsing and credential-free tests work. Read-only checks against the existing Supabase project verified two July 11 fixtures with joined teams/venues and cached lenses; the real archive homepage and one detail rendered locally. The project recovered during investigation after DNS failures and HTTP 521 while its dashboard reported “Coming up…”. No configuration or data changes were made. This verifies current read availability, not historical accuracy or ongoing uptime. No public deployment has been verified. See the [connectivity investigation](docs/audit.md#connectivity-and-ci-follow-up--2026-11-03).

## What is implemented

- Explicit `archive` and `illustrative` dataset modes; archive is the default and never silently falls back to demo fixtures.
- Bookmarkable date selection, initially **July 11, 2026**, within June 11–July 19. Date boundaries and kickoff display use **America/Los_Angeles**, independently of the current date.
- Featured matchup, fixture listing, and match-detail links that preserve dataset and selected date.
- Clearly labeled stored AI commentary, qualitative Lens sections, non-citation context snippets, and selectable cached questions when present. Ordinary page rendering does not call OpenAI or API-FOOTBALL.
- Separate loading, empty, query-error, missing-cache, and incompatible-cache states. Cache failures retain available fixture details.
- Retrospective analysis labels and conservative score/status display: stored intermediate statuses are not described as currently live, and missing scores are not invented.

There is no free-form live chat, verified historical forecast mode, functional standings calculation, or published offline historical dataset.

## Try the illustrative demo

Use Node.js **22.13.0 or newer within major 22** and npm. The major is pinned in [.nvmrc](.nvmrc); use a current security patch within that major. Node 22 remains on the [official LTS release schedule](https://nodejs.org/en/about/previous-releases).

```bash
npm ci
npm run dev
```

Open [the illustrative examples](http://localhost:3000/?mode=illustrative&date=2026-06-11). June 11 and June 12 contain local examples; the Mexico–South Africa example includes a cached Lens and questions. **No API credentials are required for illustrative mode.** These teams, venues, metrics, and editorial claims are demo content, not an authoritative historical record.

Opening `/` selects the real archive instead. Without working Supabase access, it intentionally shows an error. Use the explicit illustrative URL to explore the interface without a database.

## Stack and architecture

Next.js 16.2.9 App Router, React 19, strict TypeScript, Tailwind CSS, Radix UI, and Lucide provide the interface. Supabase Postgres stores fixtures and cached content. The retained authoring pipeline uses OpenAI embeddings, a vector-retrieval RPC intended for pgvector, and Responses structured outputs with Zod. API-FOOTBALL is the fixture ingestion provider. Database extension/index/RPC definitions and policies are not yet reproducible from tracked migrations.

Public reads flow from URL mode/date → replay selection → provider-linked Supabase fixtures or local illustrative data → cached Lens lookup → listing/detail. No generation occurs along that path. The [verified architecture](docs/architecture.md) includes Mermaid component and replay-flow diagrams, repository entry points, trust boundaries, and unresolved backend details.

Typography uses system font stacks; production builds do not download Google fonts.

## Configuration and the real archive

Illustrative development and CI need no environment file. To read an existing archive, configure only these names in an ignored `.env.local` or the deployment's secret configuration:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Canonical project API URL, verified against the existing Supabase dashboard. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key for that same project; permissions are governed by database grants/RLS. |

The archive reader expects provider-linked `matches`, related `teams` and `venues`, cached `match_lenses`, and optional `qa_answers`. Missing related entities are a data error. A missing or unreadable Lens/question cache has a useful fallback. July 11 is a fixed starting selection, not a guarantee that the database contains fixtures for that date.

Schema bootstrap, the `match_document_chunks` SQL function, RLS policies, and data-loading instructions remain incomplete. A publishable key is not proof that rows are publicly readable or that RLS is correct. Do not substitute a privileged key to bypass a failed public-read check.

The following server-only settings belong to the retained operator pipeline, **not the visitor demo or CI**:

| Variable names | Purpose |
| --- | --- |
| `SUPABASE_SECRET_KEY` | Privileged Supabase access; never expose to browsers. |
| `OPENAI_API_KEY` | Embedding and generation API access. |
| `OPENAI_EMBEDDING_MODEL`, `OPENAI_MATCH_LENS_MODEL` | Optional model overrides. |
| `API_FOOTBALL_KEY` | Fixture provider credential. |
| `API_FOOTBALL_BASE_URL`, `API_FOOTBALL_WORLD_CUP_LEAGUE_ID`, `API_FOOTBALL_WORLD_CUP_SEASON` | Optional provider configuration. |
| `ADMIN_GENERATION_SECRET`, `CRON_SECRET` | Existing protected operator-route gates. |

Never commit environment files or print keys/authorization headers. Do not invoke ingestion, embedding, generation, or cron routes as a setup or smoke-test step: they can spend money and mutate data. The checked-in Vercel configuration schedules no cron; existing remote scheduler configuration has not been verified.

## Commands and verification

```bash
npm test                   # deterministic TypeScript/Node tests
npm run lint               # ESLint
npm run typecheck          # Next route types, then TypeScript without emitting
npm run build              # production compilation; system fonts, no paid credentials
npm run test:replay-http    # local Next + mock Supabase HTTP checks
npm start                  # serve the completed production build
```

The HTTP checks require free localhost sockets and no other Next dev server for this checkout. They use synthetic records and dummy credentials, exercise archive/illustrative listing and detail, date/query boundaries, empty/error states, stale statuses, and malformed/missing caches. They impose request and overall deadlines and stop their local servers afterward. They do not validate a real database, browser interactivity, historical accuracy, or deployed RLS.

[GitHub Actions](.github/workflows/ci.yml) runs on push and pull requests using Node 22, `npm ci`, tests, lint, typechecking, a production build, mock HTTP checks, and whitespace validation. Actions are pinned to commit SHAs, permissions are read-only, and no repository secrets or real database credentials are supplied. Each job/step has an explicit timeout. See [workflow runs](https://github.com/jeffreymutethia/world-cup-lens/actions) for the actual hosted result; local success alone does not establish a hosted CI pass.

## How the retained RAG pipeline works

This is implemented operator code, separate from ordinary replay rendering:

1. Fixture ingestion fetches API-FOOTBALL records and upserts normalized teams, venues, and matches.
2. Document synchronization synthesizes team/venue profiles from stored rows. This is not an article crawler.
3. Document bodies are chunked and embedded; chunks and metadata are written to Supabase.
4. Retrieval embeds a matchup query and calls `match_document_chunks` with entity filters.
5. Generation uses retrieved context and Responses structured outputs, followed by proofreading, normalization, source-snippet attachment, and validation.
6. Results are saved by match ID and later read by the public replay pages.

The pipeline currently re-embeds the corpus, lacks durable job/checkpoint controls, and does not preserve immutable generation lineage. Its legacy today-based operator functions are retained; public replay uses an explicit calendar date. No paid provider, embedding, or generation requests are needed to build or test the repository.

## Limitations and deployment

Cached analysis is presented **retrospectively**. Source publication/capture times and pre-kickoff knowledge cutoffs are not established, so a cached Lens is not an authenticated pre-match forecast. Attached snippets are retrieved context, not proof that every generated claim is supported.

Numerical Team Edges bars are withheld in both modes because no sourced measurement methodology is recorded. Missing/malformed legacy edge fields do not suppress otherwise readable qualitative copy. Stored confidence/volatility/edge labels remain explicitly uncalibrated opinions; null edge means “No edge stated”. Cached wording is unchanged and can still rely on placeholder inputs. Team aliases/flags, venues, group/stage modeling, and penalty-score breakdowns need further work. Data completeness, historical accuracy, and third-party storage/embedding/redistribution rights remain unverified. No raw provider export is bundled by this milestone, and no third-party licensing rights are granted by this README.

**No verified public deployment URL is available.** No existing Vercel project is linked in the checkout, and deployment remains gated on sufficient publication-rights evidence, verified configuration/permissions, and an identified existing project. Mock test success is not a deployment-readiness claim.

- [Source inventory and historical time contract](docs/data-provenance.md)
- [Rights inventory and publication gates](docs/data-rights.md)
- [Architecture and Mermaid diagrams](docs/architecture.md)
- [Evidence-based audit and connectivity findings](docs/audit.md)
- [Roadmap and acceptance criteria](docs/roadmap.md)
- [Agent development and security workflow](AGENTS.md)

A separate commentary-provenance card distinguishes recorded event time from cache last-write time. Source publication/capture, actual generation, historical knowledge cutoff, and dataset version remain Unknown; no selected date or cache timestamp authenticates a forecast.

All inventoried publication rights remain UNKNOWN. No public historical dataset export is approved, and website-display rights need review. The source/rights documents link the actual API-FOOTBALL/API-SPORTS terms and publisher documentation; similarly named providers and model-output ownership do not establish clearance. No raw export was added.

The next milestone is to make backend setup and historical source provenance reproducible, verify grants/RLS beyond observed reads, and identify/configure the existing deployment before publishing. Treat any return of DNS/HTTP 521 failures as an availability incident, never as an empty archive.
