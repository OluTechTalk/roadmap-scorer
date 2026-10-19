# Session 01: Setup and scoring core (P1)

Date: 2026-10-19. Run mode: autopilot (see `docs/AUTOPILOT.md`).

## Plan (written before building)

1. Scaffold Vite + TypeScript, Vitest, ESLint, Prettier, single-file plugin. Commit.
2. `src/score.ts` as pure functions: presets, validation, stable rank, capacity lanes, dependency push-down, cycle detection, sensitivity.
3. Unit tests for ties, zero effort, cycles, capacity edges (0 weeks, huge) and sensitivity.
4. 11 example requests in `src/data/examples.ts`, labelled as examples.

## What was built

- Scaffold commit `4c33b64`; scoring core commit `c516d07`.
- `src/score.ts`: 3 presets, `validate`, `findCycles`, `rank`, `plan`, `sensitivity`.
- 45 tests (41 in `tests/score.test.ts`, 4 in `tests/examples.test.ts`). Lint, typecheck and tests pass.
- 11 example requests with 3 dependent items (ex-05, ex-09, ex-10).

## Output at default settings (12 weeks, impact × confidence ÷ effort)

- Now (7.5 weeks): Thumbs up/down, Saved-reply macros, Cite the source article, Decline refund and legal questions.
- Next (11 weeks): Weekly dashboard (blocked by logging), Auto-tag, KB gap report, Log draft outcomes.
- Later: Agent-assist sidebar, Spanish/German drafts, Auto-resolve (14 weeks, more than one window).
- Cut-off score 1.87.

## Surprises

- My first draft of the "clean prefix" test used data where the last item outscored the first. The code was right and the test data was wrong.
- Renamed `docs/post-template.md` to `docs/POST_TEMPLATE.md` to match CLAUDE.md.
- Prettier reformatted the markdown docs on the first run; docs and CLAUDE.md are now in `.prettierignore`.

## Decisions logged

Prefix cut line with no backfill; oversize and cyclic requests go to Later; zero effort is rejected.

## Next

P2: table UI, preset switcher, persistence, export and import.
