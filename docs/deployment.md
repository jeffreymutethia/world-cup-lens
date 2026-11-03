# Public demo release evidence

Verified 2026-11-03. Public URL: **https://world-cup-lens-one.vercel.app**. This is the reviewed fictional match lab, not a public historical dataset.

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
