# Public demo release evidence

Verified 2026-11-03. Public URL: **https://world-cup-lens-one.vercel.app**. The earlier releases below were the fictional match lab. The current curated release section distinguishes the new five-match editorial selection.

## Existing project configuration

Inspected through the authorized Vercel dashboard, without printing credentials:

| Setting | Observed / applied |
| --- | --- |
| Account/project | Existing `jt254/world-cup-lens`; no duplicate project created |
| Connected repository | `jeffreymutethia/world-cup-lens` |
| Production branch | `main`, automatic production domain assignment |
| Framework/root | Next.js; blank root field means repository root; default build/output/install commands |
| Node | First build used 22 via repository engines; project default corrected from 26 to 22 for subsequent builds |
| Production variables | Only non-secret `WCL_DEPLOYMENT_MODE=demo-only` added; no Supabase/OpenAI/provider/admin keys supplied; Shared tab confirms no linked variables |
| Cron | No jobs listed; project execution switch explicitly disabled; `vercel.json` declares no schedule |
| Resources | Existing Hobby project; no paid plan, billing, additional resources or database changes |

The Vercel connector/CLI was unavailable, but the existing signed-in dashboard provided inspection and **Create Deployment → main → Deploy to Production**. No empty trigger commit was needed. Future `main` pushes use the existing Git connection; verify the resulting deployment rather than assuming delivery from a successful push.

## Revision evidence

First release: `8299114f73daeb3808ad3fdf80cb4f676acaca79`, deployment `TZppCqdvwVJGhdk68SzPEDzbv8KP`, Ready/Production after a 35-second build. The production domain was explicitly shown in deployment details. Initial build warnings included the Node project-setting override and a transitive `node-domexception` deprecation; compilation succeeded.

The first release passed six groups in `npm run test:production-http`: homepage/June 11/featured link; detail/sample Lens/Q&A; June 12/about/invalid/empty states; explicit archive rejection; all six admin POST and cron GET/HEAD denials; icon/notices. No auth headers or real secrets were sent. Authoring requests returned the demo guard's 404 and did not execute the pipeline.

## Browser QA and limits

Real Chrome on macOS confirmed featured detail navigation with preserved mode/date, cached answer switching, Tab movement and Enter activation with a visible focus ring. Console inspection after the homepage reload showed zero messages. The observed browser network list contained same-origin page/assets/prefetch requests plus an inline SVG; this is browser evidence, not inspection of server egress.

Responsive toolbar checks at 390 × 844 and 320 × 844 exposed a 320px featured-card clipping defect. The follow-up uses shrinkable grid tracks, bounded result labels, smaller narrow-screen headings, wrapped team/location text and stacked commentary labels. The fix was then deployed and independently rechecked in Chrome on the public domain: featured/list content and the match hero fit at 320px, and the June 12/about links worked with preserved selection. Wrapping was visually inspected; no numeric DOM scroll-width measurement or automated accessibility certification is claimed.

The local suite's active fetch tripwire, reviewed demo-only branches, deployed revision and absence of service credentials support the integration isolation claim. Neither HTTP responses nor browser traffic prove zero outbound requests across all Vercel infrastructure. No paid/provider/generation/embedding request, protected pipeline run, production database write or migration was performed.

This is limited Chrome/viewport/keyboard QA, not certification of WCAG conformance, physical mobile devices, all browsers, screen readers, contrast ratios or long-term uptime. Historical source rights, lineage and forecasting limitations remain in the audit/provenance/rights documents.

## Responsive release and captured evidence

Release follow-up: `a8150be2593c88814b7ad7a637902cec5ecd335e`, deployment `3gdFFDtSpsANfDt2h9n9G8K58yVq`, Ready/Production after a 35-second build. The Git-connected `main` push deployed automatically and the dashboard assigned the same public domain. All six public HTTP groups passed again. [Hosted GitHub CI passed](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41696782078), including production demo isolation, archive mocks and invalid-flag checks. Local 32-test suite, demo HTTP checks, lint, typecheck, build and whitespace checks passed; affected compilation checks were repeated after the final narrow-screen sizing adjustment. Independent code/config/script review found no blocker and recommended keeping production egress claims appropriately limited.

| Capture | Revision and method | Evidence |
| --- | --- | --- |
| [Desktop](screenshots/production-desktop.png) | `a8150be`; Chrome responsive 1280 × 800; native DevTools full-page capture, 2560 × 3066 image | Original demo, complete featured card and both June 11 match cards; readable wrapping |
| [Mobile landing](screenshots/production-mobile.png) | `a8150be`; 390 × 844; DevTools viewport capture, 780 × 1687 image (browser rounding) | Responsive navigation, date controls and explicit fictional-content notice |
| [Narrow featured card](screenshots/production-mobile-320.png) | `a8150be`; 320 × 844, scrolled; DevTools viewport capture, 640 × 1688 image | Both team names, location and analysis rows fit after the clipping fix |
| [Keyboard focus](screenshots/production-keyboard-focus.jpg) | Initial `8299114`; native browser screenshot, 3024 × 1646 image | Visible focus ring after Tab from one question button to the next; Enter changed the displayed answer |

Captures are genuine browser output, without personal browser chrome or credentials. They are not AI mockups. Screenshot publication is limited to the reviewed original demo/UI assets. Subsequent documentation-only revisions retain this runtime implementation; the delivery handoff records the final pushed/deployed SHA and latest checks rather than claiming that these earlier screenshots depict a later revision.


## Earlier curation review (superseded by owner decision)

The [candidate historical review](curated-history-review.md) was on internal HOLD for the proposed public-source/branding scope. This follow-up adds documentation only; it does not replace the deployed original-fiction default or claim a real-match release. Existing demo-only environment and disabled cron policy continue to apply. The delivery handoff records the documentation revision's CI/deployment and smoke-test evidence separately from the historical feature's blocked status.


## Curated editorial release — production verified 2026-11-03

Baseline `5fc076d`; owner-directed narrow publication of `wcl-curated-2026-v1` supersedes the earlier internal HOLD. Public demo-only now defaults to July 11 curated history, with five results on four source-local event days, original editorial context, source linkbacks and a shared unofficial/non-affiliation notice. Fictional Lens/Q&A remain secondary and private Supabase/authoring behavior remains guarded. Existing server policy, credentials, cron setting, billing and databases are unchanged.

Local deterministic and shared HTTP expectations cover all five result/stage/venue/AET tuples, date-only precision, attribution, detail/back navigation, empty/invalid selections, fictional isolation and all disabled methods. The app service-fetch tripwire is active; no provider/model/embedding request is permitted. Remote HTTP behavior cannot prove infrastructure-wide egress.

Pre-push local validation passed: 42 deterministic tests, nine private archive mock HTTP groups, eight demo HTTP groups in unset and production-server configurations, lint, typecheck, production build with empty service credentials, documentation relative links, whitespace and changed-file credential pattern checks. Independent review found and resolved strict-enum validation and provenance/default-wording issues; final code/security/diagram review found no blocker. Invalid-flag checks also passed all eight groups. The existing screenshots above depict earlier fictional releases and do not establish the curated UI's appearance.


Runtime commit **`104f984aa9eade8cf63545fddd5226bd7b764a2c`** was pushed to `origin/main` and the remote SHA independently matched. [Hosted CI passed](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41724947057). The Vercel commit check reported “Deployment has completed” for [deployment 6XXzQLATmE3rtgz5KbfwKCviHt6S](https://vercel.com/jt254/world-cup-lens/6XXzQLATmE3rtgz5KbfwKCviHt6S). The existing automatic main connection delivered the new historical experience to **https://world-cup-lens-one.vercel.app**; no configuration, credential, billing, cron or database change was made.

Seven production HTTP groups passed on that public domain: all five exact result/stage/venue/AET records and four date/detail/back paths; curated empty/invalid states and fictional isolation; preserved fictional sample Lens/Q&A; about and second fictional day; archive rejection; all six unauthenticated admin POST and cron GET/HEAD 404 denials; icon/notices. No real secrets were sent or protected pipeline work executed. The production response is evidence of public behavior, not source accuracy certification or complete Vercel egress monitoring.

**Current browser limitation:** the browser inventory returned no browsers and “browser access host is unavailable.” Native Chrome attempts encountered stale/invalid accessibility IDs, concurrent active-tab changes and a timeout/kernel reset while selecting the portfolio tab. A new historical tab title was observable, but stable desktop/mobile interaction, viewport inspection, overflow measurement and screenshots could not be completed reliably. No current visual QA or new screenshot is claimed; previous fictional captures remain explicitly revision-labeled. Follow up with an isolated connected browser session for responsive, keyboard/focus and screenshot evidence.

This evidence describes the runtime release above; the following documentation-only delivery revision retains that runtime. The final handoff separately records its pushed SHA and observed CI/deployment status.


## Editorial redesign — local verification 2026-11-04

Baseline `8cd2323`. Public UI now uses the supplied editorial direction: one responsive header, forest scoreboard, four curated date links, no featured duplication, concise recaps and source disclosures. Copy is versioned `wcl-curated-2026-v2` / `wcl-synthetic-v2`; historical fact tuples and private archive/authoring boundaries are unchanged. No new dependency, font/media download, service credential, cron, billing change or production database action is involved.

Local real-browser QA used explicitly authorized isolated headless Chromium after native controls failed. All five viewport widths, homepage/detail captures, 320px long-name checks, keyboard/menu/date/back/source/Q&A behavior, primary target heights, reduced motion, zero console errors and zero external page requests passed. [Design evidence and screenshots](design.md) include exact metrics and independent visual review findings/fixes. The server used empty service credentials with an active fetch-denial preloader. These are local browser results; production delivery is not inferred from them.

Local builds initially encountered recurring ignored numbered type directories (`estree 2`/`estree 3` and peers), also observed in earlier milestones. Locked dependency restoration and deletion of only invalid numbered duplicate type artifacts restored passing compilation without changing versions, excluding types or altering application contracts. The artifact's external cause is not established; it is not reported as an application compilation defect or a reason to weaken type checking.

Final local validation passed: 47 deterministic tests; eight demo HTTP groups for unset, invalid and production-server configurations; nine private archive mock HTTP groups; lint; generated Next/TypeScript checking; production build; documentation links; whitespace and changed-file credential-pattern checks. Independent code, accessibility, copy and visual reviews found no remaining blocker after the documented fixes. API handlers, deployment policy, `vercel.json`, environment files, dependency versions and database contracts were unchanged. Commit, hosted CI, Vercel and public smoke/browser evidence are recorded after the reviewed revision is pushed and observed.
