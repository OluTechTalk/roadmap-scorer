# Session 05: Polish (P5)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. Audit against the Quality bar: keyboard use, focus states, text labels on lanes, error messages (zero effort, dependency cycles), the EXAMPLE DATA label, size under 300 KB, 375px, dark mode, contrast.
2. Fix the gaps found: skip link, keep focus in the list after Remove, show dependency and cycle messages above the board (not only under the table), EXAMPLE DATA badge on the Board heading, a pointer from the board summary to the row with the error.
3. Write `scripts/verify.mjs` (`npm run verify`) so the checks are repeatable against the built file, including that the cut line moves when capacity changes.
4. Capture a keyboard walkthrough recording and error-state screenshots. Commit, then bookkeeping.

## Notes

- Commit `2fe1b4c`. 64 unit tests pass; lint and typecheck clean. Build: 29.26 kB (10.17 kB gzip), about 10% of the 300 KB limit.
- `npm run verify` runs 25 checks against `dist/index.html` in a real browser, all passing: size; skip link is the first Tab stop; EXAMPLE DATA banner and badge; 11 requests; Now / Next / Later text labels; formula visible; the cut-line label and Now lane change with capacity (4 weeks: 2 requests in Now, 12 weeks: 4, 30 weeks: 9); slider and formula radios work from the keyboard; focus outline is a solid 3px; zero-effort error on the row and on the board; dependency-cycle message, cycle members in Later with a reason, message clears when the cycle is broken; focus stays on a field after Remove; Reset to examples; no console errors; works with storage blocked, with a visible notice; at 375px in light and dark there is no horizontal scroll and no tap target under 24px.
- Contrast computed from the theme colours: every text pair is at least 6.1:1, and the lowest non-text pair (focus ring on the page background, light theme) is 4.44:1, against the 4.5:1 and 3:1 targets.
- Not tested: a screen reader. The page uses native controls, labelled regions, `role="status"` and `role="alert"`, but nothing here proves how they read aloud.

## Visuals captured

- `docs/screens/p5-desktop-light.png`, `p5-desktop-dark.png`, `p5-375-light.png`, `p5-375-dark.png`
- `docs/screens/p5-errors-desktop-light.png`, `p5-errors-375-light.png`: zero-effort row plus a dependency cycle shown above the board.
- `docs/demos/p5-click-through.webm`: keyboard only. Skip link, slider with arrow keys, zero effort, and a dependency cycle.

## Surprises

- My first verify run caught two script bugs (a selector matching two elements, and the skip-link check running after focus had moved). Both were in the script, not the app.
- The cycle message was originally under the table, away from where the effect shows. Moving it above the board made cause and effect visible together.

## Next

P6: README from the case-study template, GitHub Pages workflow (not pushed), final build.
