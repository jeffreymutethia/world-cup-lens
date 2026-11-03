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
| Production variables | Only non-secret `WCL_DEPLOYMENT_MODE=demo-only` added; no Supabase/OpenAI/provider/admin keys supplied |
| Cron | No jobs listed; project execution switch explicitly disabled; `vercel.json` declares no schedule |
| Resources | Existing Hobby project; no paid plan, billing, additional resources or database changes |

The Vercel connector/CLI was unavailable, but the existing signed-in dashboard provided inspection and **Create Deployment → main → Deploy to Production**. No empty trigger commit was needed. Future `main` pushes use the existing Git connection; verify the resulting deployment rather than assuming delivery from a successful push.

## Revision evidence

First release: `8299114f73daeb3808ad3fdf80cb4f676acaca79`, deployment `TZppCqdvwVJGhdk68SzPEDzbv8KP`, Ready/Production after a 35-second build. The production domain was explicitly shown in deployment details. Initial build warnings included the Node project-setting override and a transitive `node-domexception` deprecation; compilation succeeded.

The first release passed six groups in `npm run test:production-http`: homepage/June 11/featured link; detail/sample Lens/Q&A; June 12/about/invalid/empty states; explicit archive rejection; all six admin POST and cron GET/HEAD denials; icon/notices. No auth headers or real secrets were sent. Authoring requests returned the demo guard's 404 and did not execute the pipeline.

## Browser QA and limits

Real Chrome on macOS confirmed featured detail navigation with preserved mode/date, cached answer switching, Tab movement and Enter activation with a visible focus ring. Console inspection after the homepage reload showed zero messages. The observed browser network list contained same-origin page/assets/prefetch requests plus an inline SVG; this is browser evidence, not inspection of server egress.

Responsive toolbar checks at 390 × 844 and 320 × 844 exposed a 320px featured-card clipping defect. The follow-up uses shrinkable grid tracks, bounded result labels, smaller narrow-screen headings, wrapped team/location text and stacked commentary labels. Final post-deployment verification and screenshots follow in the release handoff; do not infer that a CSS edit itself establishes a browser pass.

The local suite's active fetch tripwire, reviewed demo-only branches, deployed revision and absence of service credentials support the integration isolation claim. Neither HTTP responses nor browser traffic prove zero outbound requests across all Vercel infrastructure. No paid/provider/generation/embedding request, protected pipeline run, production database write or migration was performed.

This is limited Chrome/viewport/keyboard QA, not certification of WCAG conformance, physical mobile devices, all browsers, screen readers, contrast ratios or long-term uptime. Historical source rights, lineage and forecasting limitations remain in the audit/provenance/rights documents.
