---
slug: roadmap-scorer-ep01-scoring-core
project: roadmap-scorer
episode: 01
title: The ranking rules come before the screen
date: 2026-10-19
summary: Built the pure scoring module for a roadmap scorer, with 45 passing tests, before any UI.
pmTakeaway: A public cut line only works if the rule for drawing it is simple enough to defend in one sentence.
buildTakeaway: Keeping scoring as pure functions made edge cases (zero effort, cycles, 0 weeks) cheap to test.
metric: 45 unit tests passing
commit: c516d07
---

## Log post (400-700 words, for the site)

**The goal this episode.** Roadmap Scorer ranks feature requests by expected gain per engineering week and draws a capacity line, so a PM can show what makes the cut and what does not. This episode was the engine only: no screen yet.

**The product call.** The cut line is a strict prefix of the ranking. Now takes the highest-ranked requests until the next one would not fit, and stops. A smarter fill would use more of the capacity, but it could put a small low-ranked item above a bigger high-ranked one, and then the line stops meaning anything. I gave up some capacity use for a rule I can state in one sentence. A second call: zero or invalid effort is rejected with a message instead of clamped, because a clamp would put a typo at the top of the board.

**What I built.**

- Three fixed formula presets (impact × confidence ÷ effort is the default). No free-text formulas.
- A stable ranking: ties break by lower effort, then name.
- Now / Next / Later lanes from a capacity in weeks.
- Dependency handling: a request moves down a lane until its dependencies are no later than it is. Cycles are detected and reported.
- A plus/minus 0.2 confidence sensitivity check.
- 11 example requests for an imaginary AI support product. They are examples, not real work, and the impact values are made up.

**What broke.** One test failed, and the test was wrong, not the code: I had given the "last" request a higher score than the first. Fixing the test data made the rule clearer.

**The number.** 45 unit tests pass. At 12 weeks the example data puts 4 requests in Now (7.5 weeks), because the dashboard is pushed to Next by a dependency. That figure comes from the module's own output on example data.

**Next episode.** The editable table and formula switcher.

## LinkedIn post (150-250 words)

Where do you draw the line when every request is urgent?

I'm building a small tool that ranks feature requests by expected gain per engineering week and draws the capacity line in public.

Before any screen, I wrote the rules as pure functions with tests.

The call that mattered: the cut line is a strict prefix of the ranking. Everything above it outranks everything below. A cleverer fill would use more of the capacity, but it would let a small low-ranked item jump a big high-ranked one. I chose the rule I can defend in one sentence and accepted some unused weeks.

What broke: one test failed, and the test was wrong, not the code.

The number: 45 unit tests pass. The 11 requests in it are made-up examples, labelled as such.

Lesson: decide how the line is drawn before you design how it looks.

Next: the editable table.

#ProductManagement #BuildInPublic #Roadmapping

## Short post (280 characters or fewer)

Built the ranking engine for a roadmap scorer first: the cut line is a strict prefix of the ranking, so everything above it outranks everything below. 45 tests pass, on made-up example data. UI next.

## Visual

No visual: engine only. Visuals start in episode 02.
