# Deployment and release verification

Public demo: **https://world-cup-lens-one.vercel.app**. Git-connected Vercel project: `jt254/world-cup-lens`. The public site uses all 104 reviewed local records and retrospective editorial Match Lenses. Private database and authoring services remain disabled. The latest verified production revision is recorded below; implementation alone is not deployment evidence.

## Final maintenance — release verification

Baseline `803c5745391e33e33d9313cca84bec5bc1999241`. This maintenance separates canonical match dates from validated return filters, labels concise context versus extended analysis, adds private-safe public match metadata and uses native `notFound()` for missing curated IDs. All factual/editorial records and private service boundaries remain unchanged.

The installed Next version may return a minimal initial error shell for a pre-stream `notFound()`. Local built-server checks observed **HTTP 404 with noindex**; an isolated Chromium check confirmed the custom Match not found page, one heading/main and usable archive link after JavaScript hydration. This is separate from normal-navigation zero-console-error checks because a deliberate 404 is an expected network response. Non-JavaScript rendering of that custom message is not established. Loading is explicitly scoped to home/private reads rather than a global boundary that would prematurely commit HTTP 200.

`npm run check:sources -- --limit 3` was manually sampled: three healthy responses (two bounded Range GET fallbacks and one HEAD). This is not a claim that every publisher link was checked. The command is report-only by default, uses no credentials, does not consume or store response bodies and never mutates records. Normal CI uses mocked source-health tests only.

Local checks passed: **88 unit tests**, **78 real disposable PostgreSQL/pgvector assertions**, data validation, archive-mock/public/built-server HTTP suites, lint, clean-output typecheck/build, documentation links, credential patterns and whitespace. The registry high/critical gate passed with **8 moderate development-only entries** remaining. Duplicate generated build artifacts were cleared before the final clean checks; no source or dependency change was needed.

[Local browser evidence](screenshots/maintenance/qa-local.json) covers 320/390/768/1280/1440px, all 104 details at 320px, canonical cross-date journeys and returning to the original paged list, keyboard/focus/menu behavior, sources and reduced motion. No document overflow, console errors or external browser requests were observed in normal navigation. The deliberate [missing-match check](screenshots/maintenance/missing-match-390.png) verified the hydrated 404 page separately.

Verified runtime: **`9315f1e392d7e2785e674c6ea4476cf53c43c309`**, November 7, 2026. The existing Git connection completed [Vercel deployment](https://vercel.com/jt254/world-cup-lens/Axp5T5dzvY6xQheHr7R42hr6UQ91). Hosted [CI passed](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/42402843369), including both the complete verification job and disposable PostgreSQL 17/pgvector job.

Production HTTP checks passed all 104 match details and 34 event dates, metadata/canonical links, cross-date navigation and original filter/page return, legacy redirects, missing-ID 404/noindex, empty/invalid selections, retired fiction, About and private archive/admin/cron denials. No authoring credentials or operations were used.

[Production Chromium evidence](screenshots/maintenance/qa-production.json) repeats the five-width suite and all 104 details at 320px. Normal browsing recorded zero console errors, external browser requests and document overflow. All 16 settled production PNGs were byte-identical to the local captures; the retained [desktop homepage](screenshots/maintenance/home-1440.png), [mobile homepage](screenshots/maintenance/home-390.png) and [detail](screenshots/maintenance/detail-1280.png) are copied from production. The separate production missing-match probe confirmed usable hydrated feedback, with the same initial-shell limitation above.

The maintenance changes no factual/editorial records, database contract, credentials, publication permissions or deployment policy. These results support continuing the MVP freeze; they do not establish full accessibility certification, all-publisher availability, real-model quality or production database parity.

## Full-tournament archive — release verification

Released runtime: **`31980439e06dd6d65789eaef6513126f0796b074`**, November 7, 2026. [Hosted CI passed](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/42393535016), including the PostgreSQL 17/pgvector job. [Vercel completed deployment](https://vercel.com/jt254/world-cup-lens/FsUzE8bSC3dfwWX4ycgG9kM1NWHU) through the existing Git connection. This scope expands the public archive to 104 verified records, ten extended editorial Lenses, URL-driven date/stage/team/search browsing and paged results. It retires fictional public routes while preserving private RAG and isolated synthetic tests. Publication evidence and limits are in [the source review](curated-history-review.md).

Local candidate checks passed: **75 unit tests**, **78 real PostgreSQL/pgvector assertions**, `check:data`, archive-mock HTTP, public development/built-server/invalid-policy HTTP, lint, typecheck, production build, documentation links, credential patterns and whitespace. Registry checking passed the high/critical gate with **8 moderate development-only entries** remaining; no dependency was changed to silence them.

The isolated Chromium run covered 320/390/768/1280/1440px home/detail layouts; native date/stage/team/search controls; pagination; selected detail/back links; keyboard skip/menu/Escape/focus; source disclosure; penalty presentation; retired redirects; empty dates and reduced motion. All **104 canonical detail pages** were additionally checked at 320px. Zero console errors, external browser requests or document overflows were observed. [Local machine report](screenshots/archive/qa-local.json), [desktop](screenshots/archive/home-1440.png), [mobile](screenshots/archive/home-390.png) and [Lens detail](screenshots/archive/detail-1280.png) are actual captures.

Production HTTP checks passed on the public domain: all 104 match details, all 34 event dates, five result pages, score/shootout/source metadata, filters, empty/invalid states, canonical detail navigation, retired redirects, About, explicit private-archive denial, six admin POST denials, cron GET/HEAD denials and original icon/notices. No real credentials were sent or protected pipeline work executed.

Production Chromium repeated the full five-width/interactions suite and all 104 details at 320px. [Production report](screenshots/archive/qa-production.json) records zero console errors, external browser requests or document overflow. All 16 settled production PNGs matched local captures byte-for-byte. Three production captures are retained above; the others were inspected in temporary output rather than duplicated into Git. This is not full accessibility/cross-browser certification or production server-egress instrumentation.

The release preserves demo-only policy and schedule-free configuration. No paid application requests, production database changes, migrations or authoring activation occurred. The earlier configuration inventory below remains dated; public behavior and commit deployment status do not constitute a fresh dashboard environment inventory.


## Existing project configuration

The following configuration was inspected in the authorized Vercel dashboard on **2026-11-03**. Later deployment statuses and HTTP checks verify delivery and public behavior, not a fresh environment or production database inventory.

| Setting | Observed configuration |
| --- | --- |
| Repository / production branch | `jeffreymutethia/world-cup-lens` / `main` |
| Framework / root | Next.js / repository root; default build, output and install commands |
| Node | Major 22, matching repository engines and `.nvmrc` |
| Production variables | `WCL_DEPLOYMENT_MODE=demo-only`; no Supabase, OpenAI, provider or admin credentials; no linked shared variables |
| Cron | No jobs; project execution disabled; `vercel.json` has no schedule |
| Resources | Existing Hobby project; no additional paid resources or database changes |

Pushes to `main` use the existing Git connection. A successful push alone does not establish deployment: inspect the commit's Vercel status, production-domain assignment and public response. Do not create a duplicate project or enable private services to release documentation changes.

## Portfolio freeze — verified release

The freeze runtime is **`14724168431a18412957adc6a70f1372323e7e9e`**. [Hosted CI passed](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41868791141), and [Vercel completed deployment](https://vercel.com/jt254/world-cup-lens/3DTKrQiV9xhTy1JDLhUnsiWC8gNA). The subsequent evidence-only baseline **`4c88da8399c8cdc3de8d96a2ee380f635f11fa98`** also has [successful CI](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41869982910) and a [successful deployment](https://vercel.com/jt254/world-cup-lens/DwkcnDHU6ZhpcmkUu7SaA8EuyKxh).

The freeze release passed **70 unit tests**, **78 real PostgreSQL/pgvector assertions**, archive mock HTTP, development and built-server demo HTTP, lint, typecheck, build, documentation links, credential patterns, advisory and whitespace checks. Native SQL testing used PostgreSQL 14.17 / pgvector 0.8.2; hosted CI used PostgreSQL 17 / pgvector 0.8.2.

Seven production HTTP groups passed after deployment: all five results on four dates; detail/back navigation and source metadata; fictional isolation and stored Q&A; About and invalid/empty states; archive rejection; six admin POST denials and cron GET/HEAD denials; icon/notices. Denial checks sent no real secrets and returned before protected work. No cron or authoring pipeline was executed.

Production Chromium checks covered 320/390/768/1280/1440px, keyboard navigation, menu/Escape/focus, date/detail/back links, source disclosure, fictional Q&A, reduced motion and all five match heroes at 320px. Zero console errors and external browser requests were observed. All 15 settled production captures matched the updated local captures. The [machine report](screenshots/freeze-production/qa-report.json), [desktop homepage](screenshots/freeze-production/home-1440.png), [mobile homepage](screenshots/freeze-production/home-390.png) and [desktop detail](screenshots/freeze-production/detail-1280.png) document that runtime. See [design evidence](design.md#portfolio-freeze-browser-recheck--2026-11-04).

These checks support a portfolio freeze of the public product and tested backend contracts. They do not establish real-model quality, production schema parity, complete Supabase gateway/Auth coverage, durable recovery, full accessibility, infrastructure-wide egress monitoring or broader publication rights. Current findings are tracked in the [audit](audit.md#current-findings).

## Verification commands

Use Node 22 and locked dependencies. Routine checks need no service credentials:

```sh
npm ci
npm run check:data
npm test
npm run db:test
npm run test:replay-http
npm run test:demo-http
npm run lint
npm run typecheck
npm run build
DEMO_TEST_PRODUCTION=1 npm run test:demo-http
npm run check:docs
npm run check:credentials
npm run check:security
git diff --check
```

Run HTTP suites sequentially; each owns its local server processes. `db:test` owns a disposable native or Docker database and accepts no remote database URL. The registry advisory check uses network access; model/provider calls are not part of these tests. [CI](../.github/workflows/ci.yml) runs credential-free verification and a separate disposable PostgreSQL job with bounded timeouts.

Optional checks are distinct from routine CI:

- `npm run test:production-http`: read-only/denial smoke checks of the authorized public demo, with optional `DEMO_URL`. The script confirms demo policy before checking disabled methods; never supply real authoring credentials or run it against an active private backend.
- `npm run test:design`: isolated installed Chromium against an already running demo on localhost:3107; no browser download or personal profile. See [browser setup and scope](design.md#local-browser-evidence--passed-2026-11-04). `DESIGN_URL` selects the authorized localhost or production origin; `CHROMIUM_PATH` selects an installed browser. Set `DESIGN_CAPTURE_DIR` to a fresh output directory (for example `/tmp/wcl-browser-qa`) to preserve revision-labeled captures. These optional checks are not CI jobs.

A release that changes runtime dependencies requires the full affected regression suite. Documentation-only releases verify links, technical claims, existing checks and committed-revision delivery; they do not create new behavioral evidence or replace revision-labeled screenshots.

## Release history

| Runtime / correction | Evidence and scope |
| --- | --- |
| `8299114` → `a8150be` | First fictional demo, then narrow-screen clipping correction; [CI](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41696782078). Original [desktop](screenshots/production-desktop.png), [mobile](screenshots/production-mobile.png), [320px](screenshots/production-mobile-320.png) and [keyboard](screenshots/production-keyboard-focus.jpg) captures depict those earlier releases. |
| `104f984` | Five-match curated release; [CI](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41724947057) and [Vercel](https://vercel.com/jt254/world-cup-lens/6XXzQLATmE3rtgz5KbfwKCviHt6S). The scoped publication decision superseded the earlier internal HOLD; [review](curated-history-review.md). |
| `1bf320c` | Editorial redesign and question-target correction; [CI](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41829456592), [Vercel](https://vercel.com/jt254/world-cup-lens/SMhGhPWJpSh47oDXJ3x19vzHqfSv), [browser evidence](design.md#production-recheck--passed-2026-11-04). |
| `472d72c` → `3733d68` | Backend foundation, then Docker startup-readiness correction; [CI](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41860038371) and [Vercel](https://vercel.com/jt254/world-cup-lens/Go1e79YgQs3LuMRYLQ6CndKo1zkw). Hosted SQL testing exposed the temporary initialization server's restart; the runner now waits for the final PostgreSQL process before readiness. No production migration. |
| `1472416` → `4c88da8` | Dependency/status/country maintenance and freeze evidence, verified above. Historical result tuples and public design unchanged. |

The November 4 dependency snapshot has zero production advisory entries and zero high/critical entries overall, with 8 moderate development-only lint/glob entries and deprecated ESLint peer constraints remaining. It is a dated registry result, not a security certification. [Maintenance rationale](engineering-decisions.md#final-security-maintenance--bounded-dependency-changes).
