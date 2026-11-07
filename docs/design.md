# Editorial archive design

Reference: supplied `world-cup-lens-design-reference-v2.zip`, SHA-256 `1307d2134d6d927f6af9e7cc632341ad40f14d65385a021a3f1f1a23a47c3ab6`. Baseline `8cd2323`. The package's PNGs establish visual direction; its copy guide establishes tone. HTML/CSS prototypes are reference material, not application code or production evidence. No reference images, fonts or official sports assets are bundled in the app.

## Full-tournament archive — November 7, 2026

The current implementation extends the existing forest-green editorial design; it does not introduce a second visual system. The public product is the historical archive. Fictional lab navigation, samples and Q&A are removed from public pages; old illustrative links redirect to the historical homepage. Synthetic examples remain test fixtures.

- The default July 11 page retains the Norway–England scoreboard hero and excludes it from the secondary list.
- Native date, stage/group, team and search controls submit URL-driven GET filters. A blank date means all dates. Four editorial shortcuts supplement the full calendar; previous/next matchday links use the 34 verified event dates.
- Full-tournament results are paged at 24 secondary cards plus the featured match. All 104 are accessible without crowding the initial page. Selected filters survive detail/back and related-match navigation.
- Match Lens adapts the original July cards into retrospective overview, significance, optional reported developments/interpretation, group-record context, source notes and uncertainty. There are no fabricated confidence ratings, strengths or predictions. All public commentary is editorial; private cached AI remains separate.
- Team journeys expose related fixtures across the tournament. Previous/next links use the selected result set when it contains multiple matches, otherwise tournament order. Match number supplies deterministic ordering when clock times are unknown.
- Scores exclude penalty shootout kicks; PEN and separate shootout scores distinguish those outcomes from AET. Unknown extra-time status cannot be labeled normal time. Typography remains system-based; no official assets or remote fonts are introduced.

The isolated Chromium script now checks the five required widths, real date/filter/pagination/detail/back interactions, retired redirects, penalty presentation, source disclosure, keyboard focus/menu behavior and reduced motion. The final local and production runs passed, including all 104 detail pages at 320px. [Local metrics](screenshots/archive/qa-local.json) and [production metrics](screenshots/archive/qa-production.json) retain separate origins. The [desktop](screenshots/archive/home-1440.png), [mobile](screenshots/archive/home-390.png) and [Lens detail](screenshots/archive/detail-1280.png) are genuine production captures of `3198043`. All 16 production PNGs matched local output byte-for-byte; only three are retained to avoid duplicate assets. [Deployment evidence](deployment.md) records CI and release status. A checked viewport is not physical-device or complete screen-reader/cross-browser certification.

## Earlier five-match redesign — historical evidence

The following design and capture records describe the November 4 five-match interface, not the current full-tournament release. Their original revision labels and source images are retained.

## Implemented decisions

- One responsive header replaces sidebar plus duplicate navigation/title. Matches, How it works, Fictional lab and GitHub are real links. A small client disclosure handles the narrow-screen menu; Escape closes it and returns focus.
- Warm paper, forest-green scoreboard and lime action follow the composition. System fonts and original CSS pitch geometry avoid media/font dependencies. Typographic team abbreviations are decorative, not association logos.
- Curated mode uses four date links with `aria-current="date"`, preserving mode/date in URLs. This is navigation, not an incomplete ARIA tab widget. Only the date strip scrolls horizontally; focus padding accommodates the outline.
- The first reviewed match remains featured, in editorial order. `secondaryCuratedMatches` removes its ID from lower cards. Single-match days have no duplicate fixture. Related detail links include only another match on the selected date.
- The score/teams lead detail pages. Match recap is original retrospective copy; Source and notes links to the actual source and expands to evidence dates, version, access limitations, explicit unknowns and publication scope. Norway's source is accurately labeled schedule/results.
- Recaps and fictional samples use direct football language. Repetitive caveats move to source disclosures/About; the shared footer retains a short non-affiliation statement. Existing private cached wording is preserved. Copy versions advance to `wcl-curated-2026-v2` and `wcl-synthetic-v2`; the five historical fact tuples do not change.

## Accessibility

Each public page has one meaningful h1, one main landmark and a skip link. Decorative pitch/monogram/duplicate score visuals are hidden from assistive technology; semantic headings announce the match result. Controls have visible focus, date/source/navigation targets are sized for touch, and reduced-motion styles suppress animation/transitions. Q&A buttons expose pressed state and answer changes use a polite live region.

The proposed muted `#6d7b73` was darkened to `#596b61` for normal-text contrast on white/paper. Deterministic tests check the stated main color pairs against WCAG AA's 4.5:1 threshold. This is a palette calculation, not rendered accessibility certification. Date-scroller focus padding is 8px to accommodate the visible outline.

## Local browser evidence — passed 2026-11-04

`scripts/verify-design.mjs` uses the installed browser, a new temporary profile, loopback ephemeral CDP, sanitized browser environment, same-origin page interception and restrictive DNS resolution. It never attaches to the user's profile, downloads a browser or requests paid services. Owned process-group/profile cleanup is bounded. `npm run test:design` is optional and separate from CI's credential-free HTTP tests.

A completed production build with empty service credentials was served locally with the active server fetch-denial preloader. [Machine-readable evidence](screenshots/redesign-local/qa-report.json) records Chrome/156.0.8078.80, actual viewport/client/document widths, heading/landmark counts, score sizes and request/error counts. Mobile emulation was enabled below 650px; desktop captures exclude the normal vertical scrollbar from their content width. These are real browser renders, not reference images or mockups.

| CSS viewport | Homepage | Detail | Result |
| --- | --- | --- | --- |
| 320 | [Capture](screenshots/redesign-local/home-320.png) | [Capture](screenshots/redesign-local/detail-320.png) | No document overflow; score/names fit |
| 390 | [Capture](screenshots/redesign-local/home-390.png) | [Capture](screenshots/redesign-local/detail-390.png) | No document overflow; mobile menu/source disclosure work |
| 768 | [Capture](screenshots/redesign-local/home-768.png) | [Capture](screenshots/redesign-local/detail-768.png) | Tablet layout and readable score |
| 1280 | [Capture](screenshots/redesign-local/home-1280.png) | [Capture](screenshots/redesign-local/detail-1280.png) | Desktop hierarchy matches reference direction |
| 1440 | [Capture](screenshots/redesign-local/home-1440.png) | [Capture](screenshots/redesign-local/detail-1440.png) | Wide composition and restrained spacing |

Additional captures: [menu open](screenshots/redesign-local/home-390-menu-open.png), [keyboard focus and date scrolling](screenshots/redesign-local/home-390-keyboard-focus.png), [expanded source notes](screenshots/redesign-local/detail-390-source-open.png), [Switzerland at 320px](screenshots/redesign-local/detail-argentina-320.png), [fictional Q&A](screenshots/redesign-local/lab-390-questions.png).

The run exercised click-through detail/source disclosures, mobile menu/Escape/focus return, skip-link activation, Tab/Enter date navigation with current-date/back preservation, single-match isolation, fictional stored-answer switching and About. Primary navigation/date/source/action controls and fictional Q&A buttons meet the checked 44px target-height threshold. All five match heroes fit at 320px without splitting a single-word team name. Reduced-motion emulation matched and transition suppression was checked. No console exceptions/errors, failed normal-page responses or external page requests occurred; external attempts would have been blocked before network access. This is scoped browser-request evidence plus a local server tripwire, not complete infrastructure egress monitoring.

## Responsive corrections

Browser testing additionally found a long-name wrap for Switzerland at 320px; narrower center tracks and a modest name-size adjustment fixed it and all five heroes passed. The detail badge now says Final result, avoiding ambiguity alongside extra time. A fixed/offscreen skip-link layer appeared in earlier scrolled full-page captures; standard clipped hiding and scroll-reset/two-frame repaint before capture removed it. The final captures show no stray overlay. Production follow-up inspection also increased fictional question buttons to 44px, allowed label wrapping and removed their color transition. Capture waits now let finite transitions settle, preventing intermediate colors from appearing as a final state.

Limits: this is headless Chromium and emulated viewports, not physical devices, Safari/Firefox coverage, a screen-reader audit or full WCAG certification. Inline prose/source links are not part of the primary-control target-height assertion. No screenshot is evidence of historical accuracy or legal clearance. Production verification is recorded separately in [deployment.md](deployment.md).


## Production recheck — passed 2026-11-04

Runtime **`1bf320c26720479fd84f8152a5ebc1cb54489a25`** was observed deployed at https://world-cup-lens-one.vercel.app with [hosted CI passing](https://github.com/jeffreymutethia/world-cup-lens/actions/runs/41829456592). The same isolated browser suite passed the full matrix, interaction/focus/reduced-motion and 44px question-target checks on the public domain. [Production report](screenshots/redesign-production/qa-report.json) records zero console errors/external page requests. All 15 settled production PNGs matched the reviewed local PNGs byte-for-byte; no reference/mockup image is presented as production output.

| CSS viewport | Production homepage | Production detail |
| --- | --- | --- |
| 320 | [Capture](screenshots/redesign-production/home-320.png) | [Capture](screenshots/redesign-production/detail-320.png) |
| 390 | [Capture](screenshots/redesign-production/home-390.png) | [Capture](screenshots/redesign-production/detail-390.png) |
| 768 | [Capture](screenshots/redesign-production/home-768.png) | [Capture](screenshots/redesign-production/detail-768.png) |
| 1280 | [Capture](screenshots/redesign-production/home-1280.png) | [Capture](screenshots/redesign-production/detail-1280.png) |
| 1440 | [Capture](screenshots/redesign-production/home-1440.png) | [Capture](screenshots/redesign-production/detail-1440.png) |

Production details: [keyboard focus](screenshots/redesign-production/home-390-keyboard-focus.png), [menu](screenshots/redesign-production/home-390-menu-open.png), [source notes](screenshots/redesign-production/detail-390-source-open.png), [long team name](screenshots/redesign-production/detail-argentina-320.png), [44px fictional Q&A](screenshots/redesign-production/lab-390-questions.png). The headless/emulation, inline-link target and broader accessibility limits above still apply.


## Portfolio freeze browser recheck — 2026-11-04

Deployed revision `14724168431a18412957adc6a70f1372323e7e9e` includes Next 16.4.5 security maintenance and the same licensed CSS body after removal of the unused CLI tree. The production isolated Chromium suite again passed all five widths (320/390/768/1280/1440), overflow, one h1/main, 44px primary controls, menu/Escape/focus, keyboard date/detail/back, source disclosure, stored fictional Q&A, all five heroes at 320px and reduced motion. Zero browser console errors or external page requests were observed. This does not instrument production server egress or certify full WCAG/physical-device/screen-reader/cross-browser coverage.

[Fresh production machine report](screenshots/freeze-production/qa-report.json) and [local candidate report](screenshots/freeze-local/qa-report.json) retain actual metrics. All 15 settled new production PNGs matched the updated local captures byte-for-byte. Nine also matched the earlier production images; six desktop images have a 15px wider canvas/client width, with no document overflow or visual regression found in direct inspection. No redesign or historical fact change was introduced.

Three current genuine examples are retained: [desktop homepage](screenshots/freeze-production/home-1440.png), [mobile homepage](screenshots/freeze-production/home-390.png) and [desktop detail](screenshots/freeze-production/detail-1280.png). README uses these captures. Older images/reports above keep their original revision labels; they are not overwritten or described as the new deployment. The remaining new captures were inspected/tested in temporary output rather than duplicated into the repository.
