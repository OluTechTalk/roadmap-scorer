You're building Roadmap Scorer, Build 03 from docs/case-studies.md, on autopilot. TypeScript, browser only, no backend and no API key. Goal: a shareable tool that ranks feature requests by expected gain per engineering week and moves a capacity cut line live, finished as fast as is safe while I'm mostly away. No recording needed this run.

STEP 0: SETUP

1. Save this whole prompt verbatim to docs/AUTOPILOT.md.
2. Read CLAUDE.md, docs/case-studies.md (Build 03 section and Ground rules), docs/POST_TEMPLATE.md and any other files in docs/.
3. Scaffold Vite + TypeScript with vanilla DOM, Vitest, ESLint, Prettier and vite-plugin-singlefile. Add .gitignore (node_modules, dist, .env), docs/DECISIONS.md, docs/sessions/ and docs/posts/. Add a first DECISIONS entry for "no framework, no model call, presets instead of free-text formulas". Commit.

OVERRIDES TO CLAUDE.md FOR THIS RUN

- Don't wait for plan approval. For each phase, write a short plan into that phase's session log, then build.
- Commit after each slice, only when lint, typecheck and tests pass.

HARD RULES

- No API calls, no keys, no secrets anywhere.
- No invented numbers. The 11 requests are labelled EXAMPLE DATA on screen and in the README. Impact values are on an unlabelled 1 to 10 scale and are made up.
- Everything in CLAUDE.md's "Product rules" and "Quality bar" is required.

PHASES, IN ORDER
P1 Scoring core: src/score.ts as pure functions (score presets, stable ranking, capacity lanes, dependency handling with cycle detection, sensitivity check), with 20+ unit tests. Then src/data/examples.ts with 11 example requests for an AI support product (a mix of cheap wins, expensive bets, dependent items, and low-confidence items; at least two with dependencies). CHECKPOINT: tell me the example requests, one line each, so I can edit the ones that feel off.
P2 Table UI: editable rows (name, requester, impact, confidence, effort, dependencies), formula preset switcher with the formula visible on screen, ranked list. Persist edits to localStorage in try/catch, with Export and Import as JSON.
P3 Board: Now / Next / Later lanes with a visible capacity cut line, a capacity slider that moves it live, dependency-blocked items marked with the reason. Playwright screenshots to docs/screens/ at 375px and desktop, light and dark. CHECKPOINT: tell me screenshots are ready in docs/screens/, and the build size.
P4 Why-not and sensitivity: drafted, editable why-not notes for everything below the cut line (built from the item's own numbers, no model call), and the plus/minus 0.2 confidence sensitivity readout.
P5 Polish: keyboard use, focus states, text labels on lanes, error messages for zero effort and dependency cycles, the "EXAMPLE DATA" label, and the under-300KB single-file build. Verify the cut line moves when capacity changes.
P6 Ship: README using the case-study template in docs/case-studies.md (Data note: examples, not real work; Result: requests in, number committed at default capacity, and one request that dropped and why, all read from the app's actual output), a GitHub Pages workflow file at .github/workflows/pages.yml (do not push), and dist/index.html built. CHECKPOINT: tell me it's done.

CHECKPOINTS (stop and send ONE short message I can answer from my phone, otherwise keep going)

1. Example requests ready for review.
2. Screenshots ready.
3. Stuck on the same error about 30 minutes, or a decision changes scope.
4. All phases done.

BOOKKEEPING
At the end of each phase: write docs/sessions/NN-slug.md, update Current status in CLAUDE.md, and write docs/posts/NN-slug.md using docs/POST_TEMPLATE.md (log post, LinkedIn post, short post; facts only; no secrets). Commit.

Start with STEP 0 now.
