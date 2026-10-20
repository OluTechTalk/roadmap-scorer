# Session 04: Why-not notes and sensitivity (P4)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. `whyNotDraft()` in `src/score.ts`: a pure function that writes a short draft for any request outside Now, using only that request's own numbers (score vs cut-off, effort, held-back reason, and what confidence or effort it would need to match the cut-off). Unit tests for each case.
2. Store user-edited notes in app state (`notes` by request id), included in localStorage, Export and Import. A note the user has not edited keeps following the numbers; an edited note is kept and marked "edited", with a reset-to-draft button.
3. `src/ui/whynot.ts`: a "Why not now" section listing every request in Next and Later with an editable text area marked as a draft. Typing in a note must not re-render the list.
4. `src/ui/sensitivity.ts`: a small readout that applies minus and plus 0.2 to every confidence and says which requests cross the Now line and how many change rank. When the formula ignores confidence it says so.
5. Browser check, lint, typecheck, tests, screenshots and recording, commit, then bookkeeping.

## Notes

(filled in at the end of the phase)
