---
slug: roadmap-scorer-ep04-why-not-sensitivity
project: roadmap-scorer
episode: 04
title: Saying why not, and how sure we are
date: 2026-10-19
summary: Added drafted, editable "why not now" notes and a plus/minus 0.2 confidence check to the roadmap scorer.
pmTakeaway: A no that cites its own numbers is easier to accept and easier to challenge.
buildTakeaway: Generating the notes from the data, not a model, makes every sentence checkable and keeps the tool free to run.
metric: 64 unit tests passing; single-file build 28.75 kB
commit: 08dc409
---

## Log post (400-700 words, for the site)

**The goal this episode.** Below the capacity line, every request deserves a reason. And a ranking built on guessed confidence should say how fragile it is.

**The product call.** The why-not notes are drafted by code from each request's own numbers, not by a model. That means no key, no cost, and every sentence can be checked against the table, for example "Scores 1.6 against a cut-off of 1.87, and needs 2.5 weeks. It would need confidence of 0.94 to match the cut-off." The cost is plainer wording than a model would write, so every note is editable and marked Draft or Edited. The sensitivity check shifts every confidence by 0.2 up and down and reports who crosses the line.

**What I built.**

- A "Why not now" list with one editable note for every request in Next or Later.
- Notes cover dependency blocks, cycles, requests too big for one window, near misses, and what confidence or effort would match the cut-off.
- Edited notes are saved and exported with the rest of your data; untouched drafts keep following the numbers.
- A sensitivity readout: who leaves or enters Now, and how many requests change rank, at minus and plus 0.2.
- A clear message when the chosen formula ignores confidence.

**What broke.** A rounding trap: the "confidence needed" figure could display 0.41 when the true answer was 0.4. A unit test caught it and a small tolerance fixed it. In the demo script a selector also hit the wrong row, which is why rows are now picked by position.

**The number.** 64 unit tests pass and the build is 28.75 kB. On the example data, the Now list did not change at plus or minus 0.2 at any of the capacities I tried (3, 4, 8, 12, 20 and 30 weeks), as read from the app's own readout. That is a finding about these made-up examples, not about any real roadmap. To show a crossing in the recording I deliberately set one example request's confidence to 0.6.

**Next episode.** Keyboard use, focus, error messages and the size check.

## LinkedIn post (150-250 words)

"Why isn't my request in?" deserves a better answer than "capacity."

My roadmap scorer now drafts a reason for every request below the line, straight from its own numbers: "Scores 1.6 against a cut-off of 1.87, and needs 2.5 weeks. It would need confidence of 0.94 to match the cut-off."

No model involved. That's the call: plainer wording, but every sentence is checkable, and the tool stays free to run. Each note is editable, and your wording is kept.

I also added a sensitivity check. It shifts every confidence by 0.2 and shows who crosses the line. On my made-up example data, nobody does. When I set two requests close together on purpose, one leaves and one enters.

What broke: a rounding bug showed 0.41 where the answer was 0.4. A unit test caught it.

64 tests pass. Example data only.

Lesson: a "no" is easier to accept when it shows its arithmetic.

#ProductManagement #BuildInPublic #Prioritization

## Short post (280 characters or fewer)

Roadmap scorer now drafts a "why not" for every request below the line, from its own numbers, with no model call. Editable. Plus a +/-0.2 confidence check showing who crosses the cut line. 64 tests, example data only.

## Visual

- Screenshot, desktop light: `docs/screens/p4-desktop-light.png`. Look at the "Why not now" notes and the Sensitivity readout.
- Screenshot, 375px dark: `docs/screens/p4-375-dark.png`. Notes and readout on a phone.
- Also captured: `p4-desktop-dark.png`, `p4-375-light.png`.
- Click-through: `docs/demos/p4-click-through.webm`. Edit and reset a note, make two requests a close call, watch the readout report who crosses.
- GIF for LinkedIn (under 5 MB): `docs/demos/p4-click-through.gif`.
- Live demo link: https://olutechtalk.github.io/roadmap-scorer/
