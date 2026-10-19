# Session 03: Board (P3)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. `src/ui/board.ts`: a capacity slider (1 to 40 weeks, default 12) and three lanes, Now / Next / Later, built from `plan()`. A dashed cut line sits between Now and Next, labelled with the capacity and the lowest score in Now. Each lane header shows weeks used. Requests held back by a dependency, a cycle or size show the reason in words.
2. Wire into `main.ts` so moving the slider re-renders the board with no reload and saves capacity. Board goes right after the formula; the table and ranked list follow.
3. Stack the lanes on narrow screens; put the cut line between lanes in both layouts. Text labels on every lane, not colour alone.
4. Verify in a browser that the cut line and lane contents change when the slider moves; capture screenshots (375px and desktop, light and dark) and a recording; record build size. Commit, then bookkeeping.

## Notes

- Commit `4d09390`. 56 tests still pass (no scoring changes); lint and typecheck clean. Single-file build: 23.66 kB (8.45 kB gzip).
- Checked in a real browser: moving the slider re-renders the board with no reload. At 1, 4, 8, 12, 20 and 40 weeks, Now holds 1, 2, 3, 4, 8 and 10 requests, and the lowest score in Now falls from 4.5 to 0.4. Capacity survives a reload. No console errors.
- At 12 weeks: 4 of 11 requests in Now (7.5 weeks), Next 11 weeks, Later 32 weeks of work. Two requests are marked held back: the dashboard (blocked by the logging item, which is in Next) and auto-resolve (14 weeks, more than one 12-week window).
- The cut line sits between Now and Next. It is a vertical dashed line on desktop and a horizontal one on narrow screens, and carries a text label with the capacity and the lowest score in Now.
- Lanes have text headings and a one-line hint, and held-back cards use a dashed border plus the words "Held back", so meaning does not rely on colour.
- Fixed "1 weeks" wording with a small `weeks()` helper.

## Visuals captured

- `docs/screens/p3-desktop-light.png`, `p3-desktop-dark.png`, `p3-375-light.png`, `p3-375-dark.png`
- `docs/demos/p3-click-through.webm`: drags the capacity slider through 4, 8, 20, 30 and 12 weeks.

## Surprises

- None blocking. The Next lane can exceed capacity when items are pushed into it; the lane header then says "over capacity". No example data triggers this at 12 weeks.

## Next

P4: why-not notes for everything below the cut line (built from each request's numbers, editable) and the plus/minus 0.2 sensitivity readout.
