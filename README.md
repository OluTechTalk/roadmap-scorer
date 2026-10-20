# Roadmap Scorer

An interactive tool that ranks feature requests by expected gain per engineering week and draws the capacity cut line, so a PM can show in public what makes the cut and what does not.

> **EXAMPLE DATA.** The 11 requests that ship with the tool are made-up examples for an imaginary AI support product. Impact is on an unlabelled 1 to 10 scale and every value is invented for illustration. None of this is real work, and nothing here is a measured result.

Runs entirely in the browser as one self-contained HTML file. No backend, no API key, no model call, no cost.

## Case study

**Title:** Roadmap Scorer

**Build number and dates:** Build 03, built on 2026-10-19.

**Role and tools:** Solo product build with Claude Code. TypeScript, Vite, vanilla DOM, Vitest, Playwright (screenshots, recordings and browser checks only). Built in one autopilot session; time spent is not tracked.

**Problem:** Every request feels urgent and there is one team's worth of capacity.

**Bet:** Score each request by expected gain per engineering week and draw the capacity line in public.

**Result:** 11 example requests in; at the default 12 weeks of capacity, 4 are committed in Now (7.5 weeks of work). One request that did not make Now: "Weekly draft-quality dashboard" scores 2.56, above the cut-off of 1.87, but is held back because it is "blocked by Log every draft outcome to a table (Next)". All figures are read from the app's own output on the example data. Not a measured result and not from real work.

**Chart:** No results file; this build has no eval runs. The plate is the board screenshot, `docs/screens/p3-desktop-light.png` (the later `p5-desktop-light.png` shows the final layout).

**What I'd do next:** Replace the example requests with real ones. When Build 01 has eval results, use measured eval gains as impact and only then describe numbers as measured. Publish the single file as a Claude Artifact or on GitHub Pages and record whether committed items ship on the dates given.

**Data note:** Examples, not real work. All requests, requesters and values are invented.

## What it does

- **Editable requests:** name, requester, impact (1 to 10), confidence (0 to 1), effort in engineering weeks, and dependencies.
- **Visible formula, three presets:** impact × confidence ÷ effort (default), impact ÷ effort, and impact × confidence. No free-text formulas.
- **Ranking:** highest score first. Ties break by lower effort, then by name, so the order is stable.
- **Board:** Now / Next / Later lanes. A capacity slider (1 to 40 weeks, default 12) moves the cut line live. Now is the highest-ranked requests that fit, stopping at the first one that does not. Next is the following window of the same size.
- **Dependencies:** a request cannot sit ahead of what it depends on. It is pushed down a lane and the board says "blocked by X". Dependency cycles are detected and shown.
- **Why-not notes:** every request below the cut line gets a drafted reason built from its own numbers (no model call). Notes are editable and your wording is kept.
- **Sensitivity:** shifts every confidence by plus and minus 0.2 and reports which requests cross the Now line and how many change rank.
- **Your data:** edits are saved in the browser's local storage (the tool still works if storage is blocked). Export and Import as JSON. "EXAMPLE DATA" stays on screen until the examples are gone.

## Visuals

| | Desktop | 375px |
|---|---|---|
| Light | `docs/screens/p5-desktop-light.png` | `docs/screens/p5-375-light.png` |
| Dark | `docs/screens/p5-desktop-dark.png` | `docs/screens/p5-375-dark.png` |

Click-through recordings (WebM) per phase are in `docs/demos/`, for example `p3-click-through.webm` (capacity slider moving the cut line) and `p5-click-through.webm` (keyboard-only use and error states). Earlier phases' screenshots are in `docs/screens/`.

## Run it

```
npm install
npm run dev          # local dev server
npm run lint && npm run typecheck && npm test
npm run build        # writes the single-file dist/index.html
npm run verify       # 25 browser checks against dist/index.html
```

`npm run verify`, `npm run capture` and the demo scripts need a one-off `npx playwright install chromium`.

The built `dist/index.html` is about 29 kB and can be opened directly, shared as a file, or published. A GitHub Pages workflow is in `.github/workflows/pages.yml`; it runs on pushes to `main`, and nothing has been pushed from this repository by the build.

## Tests and checks

- 64 unit tests cover scoring, ties, zero effort, dependency cycles, capacity edges (0 weeks and a huge capacity), sensitivity, why-not drafts, and storage (including blocked storage).
- `npm run verify` runs 25 checks in a real browser: single-file size under 300 KB, keyboard use, visible focus, error messages, blocked storage, no horizontal scroll at 375px in light and dark, and that the cut line moves when capacity changes. Not tested: a screen reader.

## Project notes

- `docs/DECISIONS.md`: the trade-offs, with the options considered.
- `docs/sessions/`: one log per phase.
- `docs/posts/`: one post per phase (log post, LinkedIn post, short post, visuals).
- `docs/AUTOPILOT.md`: the brief this build ran from.

## Limits

- The cut line is a strict prefix of the ranking, so a request pushed down by a dependency can leave weeks unused in Now. The board shows weeks used against capacity.
- Impact is a made-up 1 to 10 number until real eval gains exist.
- Sensitivity moves every confidence by the same amount. It does not model one estimate being wrong on its own.
