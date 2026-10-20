---
slug: roadmap-scorer-ep03-board
project: roadmap-scorer
episode: 03
title: Drawing the capacity line where everyone can see it
date: 2026-10-19
summary: Added a Now / Next / Later board with a capacity slider that moves the cut line live, and marks requests held back by dependencies.
pmTakeaway: A slider turns "we can't do everything" from an argument into something you can drag and watch.
buildTakeaway: Because the lanes come straight from the tested scoring module, the UI is a thin layer and the slider needed no new logic.
metric: 4 of 11 example requests committed in Now at the default 12 weeks
commit: 4d09390
---

## Log post (400-700 words, for the site)

**The goal this episode.** Show what makes the cut. One team has a fixed amount of capacity, and the board should make the trade-off visible: drag capacity up or down and watch requests cross the line.

**The product call.** The board has three lanes (Now, Next, Later) and a labelled cut line between Now and Next. Requests that cannot go ahead of what they depend on are not hidden or silently moved: they are marked "Held back" with the reason in words, such as "blocked by Log every draft outcome to a table (Next)". I also kept lane names as text, with a one-line hint under each, so the board does not depend on colour. What I gave up: some capacity goes unused when an item is pushed down, because I chose a clean cut line over a tighter fill.

**What I built.**

- A capacity slider from 1 to 40 weeks, default 12, saved with the rest of your edits.
- Three lanes with weeks used against capacity, and a dashed cut line labelled with the capacity and the lowest score in Now.
- A one-line summary that is read from the app's own output.
- Held-back reasons for dependency blocks, dependency cycles, and requests bigger than one window.
- Light and dark themes, and a stacked layout that works at 375px.

**What broke.** Nothing blocking. A small wording bug ("1 weeks") was caught while checking the slider at its minimum and fixed.

**The number.** At the default 12 weeks, the example data puts 4 of 11 requests in Now, using 7.5 weeks. A browser check across the slider's range shows Now growing from 1 request at 1 week to 10 at 40 weeks, with the lowest score above the line falling from 4.5 to 0.4. These come from the app's output on example data, not from real work.

**Next episode.** Why-not notes for everything below the line, and a sensitivity check on confidence.

## LinkedIn post (150-250 words)

Every request is urgent. Capacity isn't.

My roadmap scorer now has a board: Now, Next, Later, with a capacity slider that moves the cut line as you drag.

The part I care about as a PM: a request that can't go ahead of its dependency isn't quietly shuffled. It stays visible, marked "Held back", with the reason spelled out.

At the default 12 weeks, 4 of the 11 example requests make Now. Drag to 4 weeks and only 2 do. Drag to 40 and 10 do. These are made-up example requests, labelled as such on screen.

Build note: because the lanes come from a tested scoring module, the slider needed no new logic.

Lesson: a visible line turns a roadmap argument into a trade-off people can see.

Next: the "why not" notes.

#ProductManagement #BuildInPublic #Roadmapping

## Short post (280 characters or fewer)

Roadmap scorer now has a Now/Next/Later board and a capacity slider that moves the cut line live. At 12 weeks, 4 of 11 example requests make Now; at 4 weeks, 2 do. Held-back items say why. Example data only.

## Visual

- Screenshot, desktop light: `docs/screens/p3-desktop-light.png`. Look at the dashed cut line between Now and Next, and the "Held back" notes.
- Screenshot, 375px dark: `docs/screens/p3-375-dark.png`. The lanes stack and the cut line runs across the screen.
- Also captured: `p3-desktop-dark.png`, `p3-375-light.png`.
- Click-through: `docs/demos/p3-click-through.webm`. Drags the capacity slider through 4, 8, 20, 30 and 12 weeks.
- GIF for LinkedIn (under 5 MB): `docs/demos/p3-click-through.gif`.
- Live demo link: https://olutechtalk.github.io/roadmap-scorer/
