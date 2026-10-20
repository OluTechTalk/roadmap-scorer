# Session 04: Why-not notes and sensitivity (P4)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. `whyNotDraft()` in `src/score.ts`: a pure function that writes a short draft for any request outside Now, using only that request's own numbers (score vs cut-off, effort, held-back reason, and what confidence or effort it would need to match the cut-off). Unit tests for each case.
2. Store user-edited notes in app state (`notes` by request id), included in localStorage, Export and Import. A note the user has not edited keeps following the numbers; an edited note is kept and marked "edited", with a reset-to-draft button.
3. `src/ui/whynot.ts`: a "Why not now" section listing every request in Next and Later with an editable text area marked as a draft. Typing in a note must not re-render the list.
4. `src/ui/sensitivity.ts`: a small readout that applies minus and plus 0.2 to every confidence and says which requests cross the Now line and how many change rank. When the formula ignores confidence it says so.
5. Browser check, lint, typecheck, tests, screenshots and recording, commit, then bookkeeping.

## Notes

- Commit `08dc409`. 64 tests pass (7 new why-not tests, 1 new storage test); lint and typecheck clean. Single-file build: 28.75 kB (10.0 kB gzip).
- `whyNotDraft()` is a pure function in `src/score.ts`. It uses only the request's own numbers and covers: nothing fits, held back (dependency, cycle or size), level with the cut-off but did not fit, and below the cut-off (with the confidence, or the effort ceiling, that would match the cut-off, or a note that even full confidence would not).
- Edited notes are stored by request id and travel with localStorage and Export/Import. Untouched drafts are not stored, so they keep following the numbers. Browser check: an edited note survives a capacity change and a reload, and Reset to draft restores the generated text.
- Sensitivity readout: applies minus and plus 0.2 to every confidence (clamped to 0 to 1) and reports requests that leave or enter Now and how many change rank position. With a formula that ignores confidence it says so.
- Finding on the example data: at the default values, the Now list and the ranking do not change at plus or minus 0.2, at 3, 4, 8, 12, 20 or 30 weeks (read from the app's readout). To show a crossing in the recording I set one request's confidence to 0.6; the readout then reports one request leaving and one entering Now at plus 0.2.

## Visuals captured

- `docs/screens/p4-desktop-light.png`, `p4-desktop-dark.png`, `p4-375-light.png`, `p4-375-dark.png` (default example data)
- `docs/demos/p4-click-through.webm`: reads a drafted note, edits it, resets it, makes two requests a close call and shows the sensitivity readout change, then switches to a formula that ignores confidence.

## Surprises

- A Playwright locator matched the wrong table row because each row's dependency list contains every request's name. Rows are now selected by position in the demo script.
- A float rounding trap in the "confidence needed" maths (0.4 could become 0.41) was caught while writing the test; fixed with a small tolerance.

## Next

P5: keyboard use, focus states, error messages, EXAMPLE DATA label check, size check, verify the cut line moves with capacity.
