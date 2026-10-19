# Session 02: Table UI (P2)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. `src/storage.ts`: pure `serializeState` and `parseState` (sanitises imported JSON), plus `loadState` and `saveState` that wrap `localStorage` in try/catch. Unit-tested.
2. `src/ui/dom.ts` small element helper; `src/ui/table.ts` editable rows (name, requester, impact, confidence, effort, dependencies) that update in place so typing never loses focus; `src/ui/ranked.ts` ranked list; `src/ui/controls.ts` formula switcher with the formula on screen, Export, Import, Reset.
3. `src/main.ts` wires state, persistence and the "EXAMPLE DATA" label (shown while any `ex-` row remains). `style.css` with light and dark themes and a card layout that works at 375px.
4. Tests for storage; lint, typecheck, test, commit. Capture first screenshots and a short recording for the post.

## Notes

(filled in at the end of the phase)
