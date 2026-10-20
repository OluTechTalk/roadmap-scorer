// P5 error-state screenshots: zero effort and a dependency cycle, desktop and 375px.
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const url = pathToFileURL(path.resolve('dist/index.html')).href;
const browser = await chromium.launch();
for (const [label, viewport] of [
  ['desktop', { width: 1280, height: 900 }],
  ['375', { width: 375, height: 800 }],
]) {
  const context = await browser.newContext({ viewport, colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(url);
  await page.locator('.req').first().getByLabel('Effort (weeks)').fill('0');
  const a = page.locator('.req').nth(3);
  await a.locator('summary').click();
  await a
    .locator('.dep-list label', { hasText: 'Auto-tag tickets by intent' })
    .locator('input')
    .check();
  const b = page.locator('.req').nth(5);
  await b.locator('summary').click();
  await b
    .locator('.dep-list label', { hasText: 'Decline refund and legal questions' })
    .locator('input')
    .check();
  await page
    .locator('#h-board')
    .locator('xpath=..')
    .screenshot({ path: path.resolve(`docs/screens/p5-errors-${label}-light.png`) });
  await context.close();
}
await browser.close();
