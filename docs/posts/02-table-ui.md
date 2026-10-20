---
slug: roadmap-scorer-ep02-table-ui
project: roadmap-scorer
episode: 02
title: Making the scores editable, and visible
date: 2026-10-19
summary: Added an editable request table, a visible formula switcher and a ranked list to the roadmap scorer, with edits saved in the browser.
pmTakeaway: Showing the formula next to the numbers lets a reviewer argue with the inputs instead of the answer.
buildTakeaway: Updating rows in place, not re-rendering them, is what keeps typing and keyboard focus intact.
metric: 56 unit tests passing; single-file build 17.8 kB
commit: 0e5ed7c
---

## Log post (400-700 words, for the site)

**The goal this episode.** Make the scoring engine usable: a PM should be able to change a number and watch the ranking move, with the formula in plain view.

**The product call.** Formulas are three fixed presets (impact × confidence ÷ effort, impact ÷ effort, impact × confidence), not free text. A free-text formula is more flexible, but it needs a parser or `eval` and invites errors. The presets keep the formula on screen and the tool safe to share. I also made zero or out-of-range inputs show a message and drop the request from the ranking instead of quietly fixing them, so a typo cannot rise to the top.

**What I built.**

- An editable list of requests: name, requester, impact, confidence, effort, and a dependency picker.
- A formula switcher with the current formula printed under it.
- A ranked list that updates as you type.
- Edits saved to the browser's local storage, with Export and Import as JSON. If storage is blocked the app still works and says so.
- An "EXAMPLE DATA" banner that stays until the example requests are gone.

**What broke.** Nothing broke in the end, but one design trap was avoided: re-rendering the table on every keystroke would drop keyboard focus. Rows now update in place, and the dependency checkboxes are rebuilt only when the list of names changes. A browser check confirmed that focus stays on a ticked checkbox.

**The number.** 56 unit tests pass and the single-file build is 17.8 kB, against a 300 KB limit. Both come from the test and build output.

**Next episode.** The Now / Next / Later board and the capacity slider that moves the cut line.

## LinkedIn post (150-250 words)

If a score can't be argued with, nobody trusts it.

This week I made my roadmap scorer editable. Change an impact or an effort and the ranking moves. The formula sits right under the switcher, so a reviewer can see exactly how each number is produced.

The call: three fixed formulas instead of a free-text box. Less flexible, but nothing to break and nothing hidden.

Bad inputs, like zero weeks of effort, show a message and leave the request out of the ranking. A silent fix would put a typo at the top of the list.

One build lesson: update rows in place. Re-rendering on every keystroke steals focus, which is a quiet accessibility bug.

The numbers: 56 tests pass; the whole app is 17.8 kB. The 11 requests are made-up examples, labelled on screen.

Next: the Now / Next / Later board.

#ProductManagement #BuildInPublic #Accessibility

## Short post (280 characters or fewer)

Roadmap scorer is now editable: change an impact or effort and the ranking moves, with the formula shown beside it. Three fixed formulas, no free text. 56 tests pass, 17.8 kB. Example data only.

## Visual

- Screenshot, desktop light: `docs/screens/p2-desktop-light.png`. Look at the EXAMPLE DATA banner, the formula under the switcher, and the ranked list at the bottom.
- Screenshot, 375px dark: `docs/screens/p2-375-dark.png`. Each request becomes a card that fits a phone.
- Also captured: `p2-desktop-dark.png`, `p2-375-light.png`.
- Click-through: `docs/demos/p2-click-through.webm`. Edits an impact, switches the formula, then enters zero effort to show the error.
- GIF for LinkedIn (under 5 MB): `docs/demos/p2-click-through.gif`.
- Live demo link: https://olutechtalk.github.io/roadmap-scorer/
