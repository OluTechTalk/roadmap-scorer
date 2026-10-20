# Decisions

## 2026-10-19: No framework, no model call, presets instead of free-text formulas

**Decision:** Vanilla TypeScript and DOM; the app makes no network or model calls; the scoring formula is chosen from three fixed presets.

**Options considered:**

- A UI framework (React etc.): faster to write, but pushes the single-file build toward the 300 KB limit and adds a dependency the brief does not need.
- A Claude call to draft why-not notes: nicer prose, but needs an API key and a backend, which breaks the "shareable link, no cost" goal.
- Free-text formulas: more flexible, but needs `eval` or a parser, a security and error-handling surface for little gain.

**Why:** The product is a shareable single HTML file that anyone can open with no setup. Presets keep the formula visible and safe; why-not notes are built from each request's own numbers, so they are checkable. The cost is less flexible scoring and plainer note wording.

## 2026-10-19: The cut line is a strict prefix of the ranking, with no backfill

**Decision:** Now takes the highest-ranked requests until the next one would not fit, then stops. Next does the same for the following window. A request pushed down by a dependency does not let a lower-ranked request move up to use the freed weeks.

**Options considered:**
- Greedy fill (skip what does not fit, keep going): uses more of the capacity, but a lower-ranked small item can land above a higher-ranked big one, so "the cut line" stops meaning "everything above outranks everything below".
- Re-run the fill after dependency pushes: tighter plans, but items would move up and down as one edit ripples through, which is hard to explain on a board.

**Why:** The product is the public cut line. A clean prefix is the easiest rule to defend. The cost is unused weeks: with the example data at 12 weeks, Now holds 7.5 weeks because the dashboard is pushed to Next. The board shows weeks used against capacity so the gap is visible.

## 2026-10-19: Oversize and cyclic requests go to Later and do not use up a window

**Decision:** A request needing more weeks than one capacity window, or sitting in a dependency cycle, goes straight to Later with a stated reason. It does not stop the requests behind it from being placed.

**Options considered:** Letting an oversize item block its lane (nothing behind it could ever be placed), or rejecting it as an error.

**Why:** An oversize item is a legitimate request, so it should stay visible with the reason, not vanish or freeze the board. Cycles are warnings, not errors, so the user sees the loop and can break it.

## 2026-10-19: Zero or invalid effort is rejected, not clamped

**Decision:** A request with effort of 0 or less, impact outside 1 to 10, or confidence outside 0 to 1 is left out of the ranking and listed with a message.

**Options considered:** Clamping effort to a small minimum (would give a near-infinite score and put a typo at the top of the board).

**Why:** A silent clamp would produce a confident-looking wrong answer. A visible message is safer.

## 2026-10-19: Visuals are part of every phase and every post

**Decision:** Each phase that changes the UI captures screenshots (`docs/screens/`) and a short click-through recording (`docs/demos/`), and each post embeds them. The post template's Visual section is now required for visible phases.

**Options considered:**
- GIFs: easiest to drop into a post, but need ffmpeg or a new package, neither pre-approved.
- Playwright `.webm` recordings plus PNG screenshots: no new dependency, so used now.
- Live link only: works once published, but nothing to show before then.

**Why:** Reviewers should see the product without running it. If GIFs are wanted for LinkedIn, one extra tool needs approval; the recordings can be converted then.

## 2026-10-19: ffmpeg for GIFs, installed on the machine, not in the project

**Decision:** Use ffmpeg (installed with winget) to convert the Playwright recordings to GIFs. `scripts/make-gifs.mjs` steps down frame rate and width until each GIF is under 5 MB.

**Options considered:**
- A JavaScript GIF encoder as an npm package: no system install, but lower colour quality and it would add a project dependency.
- ffmpeg with a two-pass palette (`palettegen` then `paletteuse`): best colour and text clarity for UI recordings, reads the WebM files directly, and adds nothing to the project.

**Why:** Quality was the stated priority and the project stays free of new dependencies. The cost is that GIF creation needs ffmpeg on the machine; the app and its tests do not.
