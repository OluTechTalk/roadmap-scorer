# Session 03: Board (P3)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. `src/ui/board.ts`: a capacity slider (1 to 40 weeks, default 12) and three lanes, Now / Next / Later, built from `plan()`. A dashed cut line sits between Now and Next, labelled with the capacity and the lowest score in Now. Each lane header shows weeks used. Requests held back by a dependency, a cycle or size show the reason in words.
2. Wire into `main.ts` so moving the slider re-renders the board with no reload and saves capacity. Board goes right after the formula; the table and ranked list follow.
3. Stack the lanes on narrow screens; put the cut line between lanes in both layouts. Text labels on every lane, not colour alone.
4. Verify in a browser that the cut line and lane contents change when the slider moves; capture screenshots (375px and desktop, light and dark) and a recording; record build size. Commit, then bookkeeping.

## Notes

(filled in at the end of the phase)
