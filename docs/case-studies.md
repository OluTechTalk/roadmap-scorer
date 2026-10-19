# Portfolio case studies: four AI PM builds with Claude

Context file for side-project work. Drop it into a Claude project or a repo (`docs/case-studies.md`) so every session knows what is being built, why, and what counts as done.

Each build is a real, small product that an AI product manager can make with Claude Code and the Claude API, then present as a portfolio case study. Together they show the full PM loop: frame, prototype, evaluate, ship, learn.

---

## Ground rules

1. **Every number on the portfolio comes from a run you did.** The figures in the website prototype (54% to 88%, -74%, 11 to 5, 22% to 31%) are placeholders. Replace each with your measured result, or remove it.
2. **Label the data.** If tickets, users or requests are synthetic (generated with Claude), say "synthetic" on the case study. If they come from a real job, get permission and anonymise them.
3. **No invented users.** If no real users touched it, report eval and simulation results, not adoption or retention.
4. **Keep the receipts.** Save every eval run as a CSV or JSON file with date, model, prompt version and score. The portfolio charts are drawn from these files.
5. **One case-study format.** Problem, Bet, Result, plus role, tools and time spent. That is what the website's case-file plates show.

## Shared stack

| Piece                       | Use                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code                 | Builds the apps, eval harness, scripts and charts                                                                                                                                                             |
| Claude API                  | Powers the product features. Current model strings: `claude-haiku-5-5` (small, fast), `claude-sonnet-5-5` (mid), `claude-opus-5-5` (large). Check docs.claude.com for current pricing before calculating cost |
| Claude (chat) and Artifacts | Research synthesis, writing the case study, publishing interactive readouts                                                                                                                                   |
| Python or TypeScript        | Harness and analysis. Pick one and use it everywhere                                                                                                                                                          |
| Git repo per build          | `README.md` with the case-study text, `/data`, `/evals`, `/results`, `/app`                                                                                                                                   |

**Build order:** 01 then 02 (reuses the 01 eval set), then 03, then 04. Build 01 is the foundation, so start there.

---

## Build 01: Support copilot with an eval harness

**One line:** An AI tool that drafts customer-support replies, plus the eval set that proves how good the drafts are.

**PM story**

- **Problem:** AI-drafted support replies read well and still get facts wrong, and nobody can say how often.
- **Bet:** Build the eval set first, then change one prompt at a time and keep only what moves the score.
- **Result:** _Fill in from your runs:_ pass rate on V1, pass rate on the final version, number of versions, top failure category fixed.

**What you build**

1. A small help-centre knowledge base (15 to 30 articles) for a made-up product. Generate it with Claude and edit it by hand.
2. 200 test tickets with the expected facts for each answer. Mix easy, tricky, out-of-scope and adversarial tickets.
3. A drafting function: ticket in, cited draft reply out (Claude API with retrieval over the articles).
4. A scoring rubric with 4 or 5 pass/fail checks, such as correct facts, cites the right article, declines out-of-scope questions, and tone.
5. An eval runner that scores every ticket with a model grader plus a 10% hand-checked sample, and writes `results/v{n}.csv`.
6. A readout chart of pass rate by version against a ship gate. This is the website plate.

**Measure**

- Pass rate per version (headline metric)
- Pass rate per rubric check
- Agreement between the grader and your hand check (report it, because it shows the eval is trustworthy)
- Failure categories, counted by hand on the worst 20

**Definition of done:** At least four prompt versions logged, a chart of the trend, a list of failures you fixed and one you decided not to fix (with the reason).

**Starter prompt for Claude Code**

> Set up a Python repo for a support-reply copilot with an eval harness. Create `/data/kb` (markdown articles), `/data/tickets.jsonl` (ticket, expected_facts, category), a `draft.py` that calls the Claude API with retrieval over the articles, a `grade.py` that scores each draft against a rubric in `rubric.yaml`, and `run_eval.py` that writes `results/v{n}.csv` and prints the pass rate per check. Start by generating 20 sample articles and 50 tickets so I can review them before we scale to 200.

---

## Build 02: Model router (cost vs quality)

**One line:** Route easy requests to a small model and hard ones to a large model, then prove the savings did not cost quality.

**PM story**

- **Problem:** Sending every request to the largest model makes each task too expensive to price.
- **Bet:** Send easy requests to a small model, escalate hard ones, and score both with the Build 01 eval set.
- **Result:** _Fill in:_ cost per task before and after, quality difference in points, and the share of traffic routed small.

**What you build**

1. Baselines: run the Build 01 eval with each model on its own and record the pass rate and token usage.
2. A router that decides small or large. Try in order: a rules-based check, a small-model classifier, then "try small and escalate if the self-check fails".
3. A cost calculator using token counts from the API response multiplied by the published prices (note the date you checked them).
4. A cost-quality chart with each strategy as one point. The website plate shows before and after.

**Measure**

- Cost per resolved task
- Pass rate against the large-model-only baseline
- Routing mix (% small, % escalated)
- Latency (p50 and p95)

**Definition of done:** Three routing strategies compared on the same 200 tickets, one recommended with its trade-off written in one paragraph.

**Starter prompt for Claude Code**

> In the Build 01 repo, add `/router`. Run the eval once with `claude-haiku-5-5` and once with `claude-sonnet-5-5` alone, logging tokens per ticket. Then build three routers (rules, classifier, try-small-then-escalate), run each through the same eval, and write `results/routing.csv` with strategy, pass_rate, cost_per_task, pct_small and p95_latency. Plot cost against pass rate.

---

## Build 03: Roadmap scorer

**One line:** An interactive tool that ranks feature requests by expected gain per engineering week and draws the capacity line.

**PM story**

- **Problem:** Every request feels urgent and there is one team's worth of capacity.
- **Bet:** Score each request by expected gain per engineering week and draw the capacity line in public.
- **Result:** _Fill in:_ number of requests in, number committed, and one request that dropped and why. If you use example requests, say so.

**What you build**

1. An input table of requests with: name, requester, expected impact (for AI work, the expected eval gain from Build 01), confidence (0 to 1), effort in engineering weeks, and dependencies.
2. Scoring: `impact x confidence / effort`, with a visible formula you can change.
3. A Now / Next / Later board with a capacity cut line based on team weeks available.
4. A "why not" note generated for each request below the line (Claude writes a draft, you edit it).
5. Publish it as a Claude Artifact so it can be shared as a link. This is the website plate.

**Measure**

- Requests in vs commitments out
- How much the ranking changes when confidence changes (a quick sensitivity check)
- If anyone used it: did the committed items ship on the date given

**Definition of done:** A shareable tool with at least 10 requests, the scoring formula visible, and the cut line moving when capacity changes.

**Starter prompt for Claude**

> Build me an interactive roadmap scorer as an artifact. Each row is a request with impact, confidence, effort in weeks and dependencies. Score = impact x confidence / effort. Show a ranked list, a Now/Next/Later board, and a capacity slider that moves the cut line. Seed it with 11 example requests for an AI support product and label them as examples.

---

## Build 04: Activation flow

**One line:** An onboarding flow with full event tracking and an A/B test of where verification happens.

**PM story**

- **Problem:** New users leave before they see anything useful.
- **Bet:** Show a first result before asking for verification, and log every step of the flow.
- **Result:** _Fill in:_ the step-by-step funnel for each variant, the sample size, and whether the difference is meaningful. With under a few hundred users, call it directional.

**What you build**

1. A small web app (a simple version of the Build 01 copilot works well) with two onboarding variants: A, verify first; B, first result first.
2. An event schema such as `signed_up`, `connected_data`, `saw_first_result`, `verified`, `returned_week_2`, logged to a SQLite table or a free analytics tool.
3. A funnel analysis script, plus a significance check if the sample is large enough.
4. If there are no real users yet, a simulation with synthetic users and stated assumptions, clearly labelled as a simulation.

**Measure**

- Conversion at each funnel step, per variant
- Week-2 return
- Sample size and confidence interval

**Definition of done:** Both variants live, events verified end to end, a funnel chart per variant and a decision written up (ship, iterate or stop).

**Starter prompt for Claude Code**

> Build a small Next.js (or plain HTML + Python) onboarding flow with two variants assigned at random. Log events `signed_up`, `connected_data`, `saw_first_result`, `verified` and `returned_week_2` to SQLite with user_id, variant and timestamp. Add `analysis/funnel.py` that prints the funnel per variant with counts, rates and a two-proportion test for the final step.

---

## Planned next (listed as "Next" in the website index)

- **Interview synthesiser:** Turn raw interview notes into tagged themes ranked by frequency and impact.
- **Weekly metrics reviewer:** An agent that reads a metrics table weekly and writes the "what changed and why" note.

## Case-study write-up template (one per build)

```
Title:
Build number and dates:
Role and tools: (e.g. solo, Claude Code + Claude API, 3 weekends)
Problem: one sentence
Bet: one sentence
Result: one sentence with the measured number and how it was measured
Chart: path to the results file that draws the plate
What I'd do next:
Data note: real / synthetic / anonymised
```
