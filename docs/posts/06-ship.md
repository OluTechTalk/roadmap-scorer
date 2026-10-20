---
slug: roadmap-scorer-ep06-ship
project: roadmap-scorer
episode: 06
title: Shipping a one-file roadmap tool
date: 2026-10-19
summary: Finished the roadmap scorer as a single 29 kB HTML file with a README, a case-study write-up and a Pages workflow, all on clearly labelled example data.
pmTakeaway: A case study is only as credible as its labels, so the README says "example data" before it says anything else.
buildTakeaway: Reading the README's numbers from the running app, not from memory, keeps the write-up and the product from drifting apart.
metric: 4 of 11 example requests committed in Now at 12 weeks
commit: fa11539
---

## Log post (400-700 words, for the site)

**The goal this episode.** Make the tool shareable and the story honest: one file anyone can open, and a write-up where every number traces to the app.

**The product call.** The README opens with an EXAMPLE DATA notice and states plainly that the 11 requests and every value are made up. There are no adoption numbers, no users and no measured gains, because none exist. The "Result" is what the app itself shows on the example data. I held publishing until the owner asked for it, then pushed and deployed with GitHub Pages.

**What I built.**

- A README in the case-study format: problem, bet, result, role and tools, data note, and what I would do next.
- A GitHub Pages workflow that lints, type-checks, tests, builds and deploys the single file. It ran on the first push: lint, type-check, tests and build passed on GitHub's runner and the deploy succeeded.
- The final single-file build: 29,264 bytes, about a tenth of the 300 KB limit.
- A scan for secrets and network calls. None found.

**What broke.** Nothing broke this episode. One thing was left open on purpose: the example requests were never reviewed, so the sensitivity check reports no change on the current values.

**The number.** At the default 12 weeks, 4 of the 11 example requests are committed in Now, using 7.5 weeks, with a cut-off score of 1.87. The "Weekly draft-quality dashboard" scores 2.56, above the cut-off, yet is not committed: it is blocked by "Log every draft outcome to a table", which sits in Next. These come from the app's own output on made-up data, not from real work. Final checks: 64 unit tests and 25 browser checks pass.

**Next episode.** Nothing queued. Next would be replacing the examples with real requests and measured impact from the eval work in Build 01.

## LinkedIn post (150-250 words)

I built a roadmap tool that fits in one 29 kB file.

You list your requests, score them by expected gain per engineering week, and drag a capacity slider. The cut line moves, and every request below it gets a reason drafted from its own numbers.

A favourite result, from my made-up example data: a request that outscores the cut-off but still isn't committed, because it depends on something ranked lower. The board says so in plain words: "blocked by Log every draft outcome to a table."

What I'm careful about: the 11 requests are examples, labelled EXAMPLE DATA on screen and in the README. No users, no adoption claims, no model call, no keys. Every number in the write-up was read from the app.

64 tests and 25 browser checks pass. I haven't tested with a screen reader.

Lesson: build the tool so its own output is the evidence.

#ProductManagement #BuildInPublic #Roadmapping

## Short post (280 characters or fewer)

Roadmap scorer is done: one 29 kB HTML file, no backend, no key. On made-up example data, 4 of 11 requests make Now at 12 weeks, and one that outscores the cut-off is held back by a dependency. 64 tests, 25 browser checks.

## Visual

- Screenshot, desktop light: `docs/screens/p5-desktop-light.png`. The full tool: formula, board with the cut line, sensitivity, why-not notes and the editable table.
- Screenshot, 375px dark: `docs/screens/p5-375-dark.png`.
- Click-through: `docs/demos/p3-click-through.webm` (the capacity slider moving the cut line) and `docs/demos/p5-click-through.webm` (keyboard-only use and error states).
- GIFs for LinkedIn (each under 5 MB): `docs/demos/p3-click-through.gif` and `docs/demos/p5-click-through.gif`.
- Live demo link: https://olutechtalk.github.io/roadmap-scorer/
