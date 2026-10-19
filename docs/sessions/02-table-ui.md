# Session 02: Table UI (P2)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. `src/storage.ts`: pure `serializeState` and `parseState` (sanitises imported JSON), plus `loadState` and `saveState` that wrap `localStorage` in try/catch. Unit-tested.
2. `src/ui/dom.ts` small element helper; `src/ui/table.ts` editable rows (name, requester, impact, confidence, effort, dependencies) that update in place so typing never loses focus; `src/ui/ranked.ts` ranked list; `src/ui/controls.ts` formula switcher with the formula on screen, Export, Import, Reset.
3. `src/main.ts` wires state, persistence and the "EXAMPLE DATA" label (shown while any `ex-` row remains). `style.css` with light and dark themes and a card layout that works at 375px.
4. Tests for storage; lint, typecheck, test, commit. Capture first screenshots and a short recording for the post.

## Notes

- Commit `0e5ed7c`. 56 tests pass (11 new in `tests/storage.test.ts`); lint and typecheck clean. Build is 17.8 kB (6.7 kB gzip).
- Checked in a real browser (Playwright, throwaway script): an edit survives a reload; zero effort shows an error and drops the row from the ranking (10 of 11 ranked); Export, Clear all and Import round-trip 11 requests; importing a bad file says why and leaves the table unchanged; no console errors.
- Rows update in place while typing so focus is never lost. Dependency checkboxes are rebuilt only when the list of request names changes, so keyboard focus stays on a checkbox after ticking it.
- The EXAMPLE DATA banner shows while any `ex-` row remains and disappears after Clear all.
- Capacity is stored and exported but has no slider yet (P3).

## Visuals captured

- `docs/screens/p2-desktop-light.png`, `p2-desktop-dark.png`, `p2-375-light.png`, `p2-375-dark.png`
- `docs/demos/p2-click-through.webm`: edit an impact, switch formula, enter zero effort and see the error. Re-create with `npm run build && node scripts/capture.mjs p2`.

## Surprises

- Playwright needed a one-off `npx playwright install chromium` download; no new packages.
- At 375px the table is a stack of cards, so the page is long (about 6,100 px tall). P3's board will be the better mobile view.

## Next

P3: Now / Next / Later board, cut line, capacity slider, blocked-by reasons, screenshots, then checkpoint.
