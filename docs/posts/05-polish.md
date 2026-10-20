---
slug: roadmap-scorer-ep05-polish
project: roadmap-scorer
episode: 05
title: Making it usable without a mouse
date: 2026-10-19
summary: Polished the roadmap scorer for keyboard use, clear errors and small screens, and added a 25-check script to prove it.
pmTakeaway: '"Works" needs a definition you can re-run, so the quality bar became a script.'
buildTakeaway: Running the check against the built file caught two bugs in the script itself and keeps the claims honest.
metric: 25 of 25 browser checks passing; build 29.26 kB
commit: 2fe1b4c
---

## Log post (400-700 words, for the site)

**The goal this episode.** A shareable tool has to work for the person who opens the link: on a phone, in dark mode, with a keyboard, and when they type something wrong.

**The product call.** I turned the quality bar into a repeatable check instead of a manual pass. A one-off look would tell me it worked today; a script tells me it still works after the next change. I gave up some time now for confidence later. I also moved the dependency-cycle message above the board, because that is where the effect shows, instead of leaving it under the table where the cause is.

**What I built.**

- A skip link, visible focus rings, and focus that stays in the list after you remove a request.
- Plain error messages for zero effort and for dependency cycles, shown on the row and on the board.
- An "EXAMPLE DATA" badge on the board as well as the banner at the top.
- `npm run verify`: 25 checks in a real browser against the single-file build, including that the cut line and the Now lane change when capacity changes.
- A contrast calculation from the theme colours.

**What broke.** The first run of the check script failed twice, and both were script bugs: a selector that matched two elements, and a skip-link test that ran after focus had moved. The app was fine, but the script is now trusted for the right reason.

**The number.** 25 of 25 checks pass. At 375px, in light and dark, there is no sideways scrolling and no tap target under 24px. The build is 29.26 kB against a 300 KB limit. In the cut-line check, 4 weeks put 2 example requests in Now, 12 weeks put 4, and 30 weeks put 9. Every figure comes from the script's output on made-up example data. What I did not test: a real screen reader.

**Next episode.** README, the Pages workflow, and the final build.

## LinkedIn post (150-250 words)

"It works" isn't a claim. It's a check you can re-run.

For my roadmap scorer I turned the quality bar into a script that opens the real built file in a browser and tries to break it:

- Tab to the slider and move it with arrow keys
- Enter zero effort and create a dependency cycle
- Block browser storage
- Open it at 375px in light and dark

25 of 25 checks pass. The first run failed twice, and both failures were bugs in my script, not the app.

PM call: I moved the cycle warning above the board, where you see its effect, instead of under the table where it starts.

The build is 29 kB. Everything runs on made-up example data, labelled as such. I haven't tested with a screen reader, and I'd say so rather than imply it.

Lesson: define "done" as something you can run.

#ProductManagement #BuildInPublic #Accessibility

## Short post (280 characters or fewer)

Turned my roadmap scorer's quality bar into a 25-check browser script: keyboard-only use, error states, blocked storage, 375px light and dark. All pass; the first run failed twice, both script bugs. Not tested: screen readers. Example data only.

## Visual

- Screenshot, errors on desktop: `docs/screens/p5-errors-desktop-light.png`. Look at the dependency-cycle message above the board and the cycle members held back in Later.
- Screenshot, errors at 375px: `docs/screens/p5-errors-375-light.png`.
- Also captured: `p5-desktop-light.png`, `p5-desktop-dark.png`, `p5-375-light.png`, `p5-375-dark.png`.
- Click-through: `docs/demos/p5-click-through.webm`. Keyboard only: skip link, slider with arrow keys, zero effort, a dependency cycle.
- GIF for LinkedIn (under 5 MB): `docs/demos/p5-click-through.gif`.
- Live demo link: https://olutechtalk.github.io/roadmap-scorer/
