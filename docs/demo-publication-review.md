# Original public demo publication review

Review date: 2026-11-03. Baseline: `5dff6a3`. This is a scoped repository decision for newly authored demonstration material, not a grant of rights over historical provider data or a comprehensive trademark/legal opinion.

## Rejected legacy material

The old `src/data/seed.ts` used real national-team names, codes, country flags, plausible June 2026 pairings, invented North American venues, tactical claims, numerical strengths, and source-like labels without a source/author/license record. It could not be established as independently authored factual analysis or licensed publisher excerpts. Its previous UNKNOWN rights are **not approved** by this review. The runtime examples were replaced together rather than selectively relabeled. Old copies remain in Git history; this milestone does not clear that history for reuse or redistribution.

Unused starter SVGs (including Next/Vercel marks) and the inherited automatically served favicon were removed. No provider logos, photographs, fonts, chart images, or raw fixture exports were added.

## Newly reviewed material

| Material | Evidence / provenance | Scope of decision |
| --- | --- | --- |
| `src/data/seed.ts`, version `wcl-synthetic-v1` | Newly composed in this implementation task: four fictional teams, two fictional venues, three scenarios over two navigation dates, original commentary and preset Q&A. No provider records, external excerpts, national flags, real team profiles, match events, or external images were inputs. | APPROVED_FOR_ORIGINAL_DEMO: include these original files in the repository and display this version in the public demo. No third-party dataset approval is implied. |
| Context examples | Original design notes explaining the invented styles; no external publisher identity or research authority is claimed. | Same narrow approval; explicitly illustrative, not citations. |
| `src/app/icon.svg` | Newly drawn geometric magnifier/plus mark in code; not a sports logo or copied starter image. | Same narrow demo/source approval. |
| Existing UI icons and code | Installed `lucide-react` LICENSE supplies ISC notice and MIT notice for Feather-derived icons; Next/React/Radix/Tailwind package licenses are MIT. | Software/icon license evidence exists, separately from sports data. Named-package notices are retained in `public/third-party-notices.txt`, linked from `/about`. This is not a full transitive dependency audit. |
| Typography | System-font stacks; no font binaries distributed. | No new font asset publication. |

Authorship here means repository content created for the user-authorized implementation, including assistant-authored copy; it is **not** a claim that a human analyst researched it or that a paid model produced a cached Lens. No generation endpoint/API was used. Hypothetical tactical choices are invented teaching assumptions. Numerical strengths are null, no final results are supplied, and the UI says “No real result”. Dates are navigational examples, not claims about official World Cup events.

The source registry adds a separate `reviewed-synthetic-demo-v1` decision. The original eight source categories, including legacy illustrative material, retain UNKNOWN publication rights. `DEMO_PUBLICATION` records this version and evidence file; it is not an automatic license detector. Future edits introducing outside text/assets or real entities require a new review/version. There is no new general-purpose content license or third-party indemnity.

No exhaustive search for incidental fictional-name collisions was conducted. Names are plain scenario labels, with no claim of affiliation. World Cup Lens remains the user's portfolio project name; no FIFA/tournament endorsement, official result, team branding, or logo permission is claimed.

## Publication and security gate

Only the reviewed module is reachable as public illustrative content. `WCL_DEPLOYMENT_MODE` defaults/fails closed to `demo-only`; the original release defaulted to illustrative June 11; current public defaults select the separately reviewed curated history and hide private archive controls, rejects explicit archive requests, and denies every supported admin/cron method before auth/work. Archive readers and authoring work are imported lazily after the relevant checks. Missing production credentials are supported, not silently repaired with provider data.

The demo HTTP harness runs with empty service credentials and an active fetch-denial tripwire, exercises browsing plus blocked local routes using matching dummy secrets, and asserts zero service fetches. These are local mock/security checks, not permission to run production authoring. No scheduled cron is declared. Runtime policy does not retroactively change dataset rights.

Publication approval for these new examples is distinct from actual deployment. A deployment requires an identified existing authorized Vercel target and must use demo-only configuration without service keys. No new paid account/project, billing, cron, historical export, or production data write is authorized by this document. See the audit/final handoff for actual connection and deployment results.


## v2 editorial cleanup and interface review

`wcl-synthetic-v2` preserves the four fictional teams, two settings and three scenarios, with rewritten original sample copy/Q&A. Puzzle, blanket and garden metaphors were removed in favor of direct descriptions of assigned styles. No real-world evidence, outside excerpts, statistics, logo or photo was introduced. The same scoped original-demo/source/web decision applies to this independently authored revision through the explicit `reviewed-synthetic-demo-v2` registry entry; unrelated UNKNOWN categories do not inherit approval.

The redesigned header uses an original generic circular pitch/crosshair drawing and plain typographic abbreviations. Decorative shapes are not official badges or logos and are hidden from assistive technology. Existing Lucide icons remain covered by their software notices; system fonts require no binary redistribution. The source reference package remains reference material, not an app asset or a production screenshot. Actual release/visual evidence belongs in [deployment.md](deployment.md) and [design.md](design.md).
