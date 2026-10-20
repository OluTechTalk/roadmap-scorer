# Session 06: Ship (P6)

Date: 2026-10-19. Run mode: autopilot.

## Plan (written before building)

1. Read the Result figures from the running app (summary line, lanes, held-back reasons, why-not notes, sensitivity readout) so the README cannot drift from the app.
2. README using the case-study template in `docs/case-studies.md`: Title, Build number and dates, Role and tools, Problem, Bet, Result, Chart, What I'd do next, Data note. EXAMPLE DATA label at the top.
3. `.github/workflows/pages.yml`: lint, typecheck, test and build, then deploy `dist/` to GitHub Pages. Do not push.
4. Final pass: lint, typecheck, tests, build, `npm run verify`, and a scan for secrets and network calls. Confirm `dist/index.html` is built.

## Notes

- Result figures, read from the app on the example data at 12 weeks: "At 12 weeks: 4 of 11 requests committed in Now (7.5 weeks used). Lowest score in Now: 1.87." Next holds 11 weeks of work and Later 32 weeks.
- The dropped request used in the README is "Weekly draft-quality dashboard": score 2.56, above the cut-off of 1.87, held back because it is "blocked by Log every draft outcome to a table (Next)". Auto-resolve (14 weeks, more than one 12-week window) is the other held-back request.
- Sensitivity on the default example data: nothing enters or leaves Now at plus or minus 0.2, and no rank changes.
- The case-study "Chart" field is a screenshot path, because this build has no eval runs or results file. Time spent is left as "not tracked" instead of a guess.
- Final state: 64 unit tests and 25 browser checks pass; lint and typecheck clean; `dist/index.html` is 29,264 bytes (29.26 kB, 10.17 kB gzip) against the 300 KB limit.
- Workflow checks: `npm ci --dry-run` succeeds with the committed lockfile, and every tool's Node engine range includes Node 22, which the workflow uses. The workflow itself has not been run, since nothing was pushed.
- Scan: no `fetch`, `XMLHttpRequest`, `eval` or external URLs in the source or the built file; no `.env` or keys tracked.

## Visuals captured

No new capture this phase. The README links the final screenshots (`docs/screens/p5-*.png`) and recordings in `docs/demos/`.

## Open items for the owner

- Review the example requests (checkpoint 1 was never answered with edits). The sensitivity readout reports no change on the current values; a close pair of requests would show the check doing something.
- Decide whether to publish: push to GitHub and enable Pages, or upload `dist/index.html` as a Claude Artifact. Neither has been done.
- Decide whether to approve ffmpeg or a GIF encoder if GIFs are wanted for LinkedIn.
- Not tested: a screen reader.

## Next

Nothing queued. Real requests and measured impact once Build 01 has eval results.
