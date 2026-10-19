# Roadmap Scorer

Portfolio build 03. An interactive tool that ranks feature requests by expected gain per engineering week and draws the capacity line, so a PM can show in public what makes the cut and what doesn't. Runs entirely in the browser: no backend, no API key, no cost.

PM story: every request feels urgent and there is one team's worth of capacity. The bet is to score each request by expected gain per engineering week and draw the capacity line in public. Scope, measures and the write-up template live in @docs/case-studies.md (Build 03 section and Ground rules).

## Current status

<!-- /end-session updates this block. Keep it to 5 lines. -->

- Phase: P3 done (board, capacity slider, cut line, screenshots); P4 why-not and sensitivity next
- Last session: 03 (2026-10-19), board, 56 tests passing, build 23.7 kB
- Next target: P4, drafted editable why-not notes below the cut line, plus/minus 0.2 sensitivity readout
- Blockers: none
- Data: all requests are EXAMPLES, not real work

## Stack

- TypeScript, Vite, vanilla DOM (no framework) so the output stays small and easy to publish
- Vitest for tests, ESLint and Prettier, `tsc --noEmit` for typecheck
- `vite-plugin-singlefile` so `npm run build` produces one self-contained `dist/index.html` (this is what gets shared as a link or published as a Claude Artifact)
- Pre-approved packages: vite, typescript, vitest, eslint, prettier, vite-plugin-singlefile, @playwright/test (screenshots only). Ask before adding anything else.
- No API calls and no secrets anywhere. Never put a key in client code.
- Storage: `localStorage` for the user's edits, always inside try/catch, and the app must work with storage blocked. Also offer Export and Import as JSON.

## Repo layout

- `src/score.ts` — pure functions: score, rank, capacity cut, dependency handling, sensitivity
- `src/data/examples.ts` — the 11 example requests, labelled as examples
- `src/ui/` — table, board, capacity slider, why-not notes
- `src/main.ts`, `index.html`, `style.css`
- `tests/` — unit tests for everything in `score.ts`
- `docs/` — case-studies.md, POST_TEMPLATE.md, DECISIONS.md, sessions/, posts/, screens/

## Commands

- `npm run dev` — local dev server
- `npm test` — Vitest
- `npm run lint && npm run typecheck && npm test` — run before every commit
- `npm run build` — writes the single-file `dist/index.html`

## Product rules

- Each request has: name, requester, expected impact, confidence (0 to 1), effort in engineering weeks, dependencies, and a why-not note.
- Impact is on an unlabelled 1 to 10 scale until real eval gains exist. The example values are made up and labelled as examples. Once Red Pen has results, impact can be replaced with measured eval gains, and only then may a number be described as measured.
- The formula is visible on screen and switchable between presets: impact × confidence ÷ effort (default), impact ÷ effort, and impact × confidence. No free-text formulas and no `eval`.
- Ranking: sort by score, descending. Ties break by lower effort, then by name, so the order is stable.
- Capacity: a slider in engineering weeks (default 12, range 1 to 40). Now = the highest-ranked requests that fit within capacity. Next = the following window of the same size. Later = everything else. Draw the cut line between Now and the rest.
- Dependencies: a request cannot be in Now or Next unless every dependency is ranked into the same or an earlier lane. If it would be, push it down one lane and show the reason ("blocked by X").
- Why-not note: for every request below the cut line, show a short drafted reason built from its own numbers (for example "scores 1.4 against a cut-off of 2.1, and needs 6 weeks"). The text is editable by the user. Notes are generated from the data by code, with no model call, and shown as drafts.
- Sensitivity check: apply plus and minus 0.2 to every confidence (clamped to 0 to 1) and report which requests cross the cut line and how many rank positions change. Show it on screen as a small readout.
- Capacity moves the cut line live, with no page reload.
- Every number on screen comes from the example data or the user's own edits. No invented usage, adoption, or results anywhere, including the README.
- Label "EXAMPLE DATA" visibly on the page until the user replaces the examples.

## Quality bar

- Works at 375px wide and in dark mode, usable by keyboard, with visible focus, and colours not carrying meaning alone (the lanes also have text labels).
- Single file build under 300 KB.
- 20+ unit tests covering ties, zero effort (reject or clamp with a message), dependency cycles (detect and show a message), capacity edges (0 weeks, huge capacity), and sensitivity.

## Visuals (added 2026-10-19)
- Every phase that changes what the user sees captures visuals: screenshots in `docs/screens/` (375px and desktop, light and dark) and a short click-through recording in `docs/demos/` (Playwright, `.webm`).
- Every post under `docs/posts/` embeds or links those visuals in its Visual section so a reviewer sees what the build looks like without running it.
- GIFs need a tool that is not pre-approved (ffmpeg or a GIF encoder). Ask before adding one. Until then use `.webm` plus PNG screenshots.
- The published single-file build is itself the clickable demo.

## Rules

- Work in small slices. Plan briefly in the session log, then build. Commit only when lint, typecheck and tests pass.
- When you make a real tradeoff, add a dated entry to `docs/DECISIONS.md` (decision, options considered, why).
- Case study rules apply: no invented numbers, label examples, no invented users. See @docs/case-studies.md.

## Session workflow

- Start with `/start-session`: read this file, the latest file in `docs/sessions/`, and `docs/DECISIONS.md`, then restate today's target.
- End with `/end-session`: write the session log, update "Current status" above, write `docs/posts/NN-slug.md` using `docs/POST_TEMPLATE.md` (no secrets), and suggest a commit message.
