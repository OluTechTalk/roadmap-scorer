# Decisions

## 2026-10-19: No framework, no model call, presets instead of free-text formulas

**Decision:** Vanilla TypeScript and DOM; the app makes no network or model calls; the scoring formula is chosen from three fixed presets.

**Options considered:**

- A UI framework (React etc.): faster to write, but pushes the single-file build toward the 300 KB limit and adds a dependency the brief does not need.
- A Claude call to draft why-not notes: nicer prose, but needs an API key and a backend, which breaks the "shareable link, no cost" goal.
- Free-text formulas: more flexible, but needs `eval` or a parser, a security and error-handling surface for little gain.

**Why:** The product is a shareable single HTML file that anyone can open with no setup. Presets keep the formula visible and safe; why-not notes are built from each request's own numbers, so they are checkable. The cost is less flexible scoring and plainer note wording.
