// Captures screenshots (docs/screens) and a click-through recording (docs/demos) from the built dist/index.html.
// Usage: npm run build && node scripts/capture.mjs <phase-tag> [shots|demo|all]
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const phase = process.argv[2] ?? 'p2';
const mode = process.argv[3] ?? 'all';
const url = pathToFileURL(path.resolve('dist/index.html')).href;
const screens = path.resolve('docs/screens');
const demos = path.resolve('docs/demos');
mkdirSync(screens, { recursive: true });
mkdirSync(demos, { recursive: true });

const browser = await chromium.launch();

if (mode === 'shots' || mode === 'all') {
  const sizes = [
    ['desktop', { width: 1280, height: 900 }],
    ['375', { width: 375, height: 800 }],
  ];
  for (const [label, viewport] of sizes) {
    for (const scheme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport, colorScheme: scheme });
      const page = await context.newPage();
      await page.goto(url);
      await page.screenshot({
        path: path.join(screens, `${phase}-${label}-${scheme}.png`),
        fullPage: true,
      });
      await context.close();
    }
  }
}

if (mode === 'demo' || mode === 'all') {
  const tmp = path.join(demos, `.tmp-${phase}`);
  const context = await browser.newContext({
    viewport: { width: 1100, height: 760 },
    colorScheme: 'light',
    recordVideo: { dir: tmp, size: { width: 1100, height: 760 } },
  });
  const page = await context.newPage();
  await page.goto(url);
  const pause = (ms = 900) => page.waitForTimeout(ms);
  await pause(1200);
  const { demoSteps } = await import(`./demo-${phase}.mjs`);
  await demoSteps(page, pause);
  await context.close(); // flushes the video
  const file = readdirSync(tmp).find((f) => f.endsWith('.webm'));
  if (file) renameSync(path.join(tmp, file), path.join(demos, `${phase}-click-through.webm`));
  const { rmSync } = await import('node:fs');
  rmSync(tmp, { recursive: true, force: true });
}

await browser.close();
