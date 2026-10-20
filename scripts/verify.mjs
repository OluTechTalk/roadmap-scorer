// End-to-end checks against the built dist/index.html. Run: npm run build && npm run verify
import { chromium } from '@playwright/test';
import { statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const file = path.resolve('dist/index.html');
const url = pathToFileURL(file).href;
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const bytes = statSync(file).size;
check('single-file build is under 300 KB', bytes < 300 * 1024, `${(bytes / 1024).toFixed(1)} kB`);

const browser = await chromium.launch();
const newPage = async (viewport, colorScheme = 'light') => {
  const context = await browser.newContext({ viewport, colorScheme });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url);
  return { page, errors, context };
};

// Labels and content
{
  const { page, errors } = await newPage({ width: 1280, height: 900 });
  // Skip link is the first tab stop on a fresh page
  await page.keyboard.press('Tab');
  check(
    'first Tab stop is the skip link',
    (await page.evaluate(() => document.activeElement?.className)) === 'skip',
  );
  check('EXAMPLE DATA banner is visible', await page.locator('.example-banner').isVisible());
  check(
    'EXAMPLE DATA badge is on the board heading',
    await page.locator('#h-board .badge').isVisible(),
  );
  check('11 example requests', (await page.locator('.req').count()) === 11);
  const lanes = await page.locator('.lane h3').allTextContents();
  check('lanes have text labels', lanes.join(',') === 'Now,Next,Later', lanes.join(','));
  check(
    'formula is visible',
    (await page.locator('#formula').textContent()).includes('impact × confidence ÷ effort'),
  );

  // Cut line moves with capacity
  const seen = [];
  for (const w of [4, 12, 30]) {
    await page.locator('#capacity').fill(String(w));
    seen.push({
      w,
      now: await page.locator('.lane-now .card').count(),
      cut: await page.locator('.cutline').textContent(),
    });
  }
  check(
    'cut line label and Now lane change when capacity changes',
    seen[0].now < seen[1].now &&
      seen[1].now < seen[2].now &&
      new Set(seen.map((s) => s.cut)).size === 3,
    seen.map((s) => `${s.w}wk→${s.now} in Now`).join(', '),
  );
  // Keyboard: reach the slider by Tab and change it with arrow keys
  await page.locator('#capacity').fill('12');
  await page.locator('#capacity').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  check(
    'slider works from the keyboard',
    (await page.locator('.cap-readout').textContent()) === '14 weeks',
  );
  const outline = await page.locator('#capacity').evaluate((el) => {
    const s = getComputedStyle(el);
    return `${s.outlineStyle} ${s.outlineWidth}`;
  });
  check(
    'focus outline is visible',
    outline.startsWith('solid') && !outline.endsWith(' 0px'),
    outline,
  );

  // Radios by keyboard
  await page.getByLabel('Impact ÷ effort').focus();
  await page.keyboard.press('ArrowRight');
  check(
    'formula presets change from the keyboard',
    (await page.locator('#formula').textContent()) === 'score = impact × confidence',
  );
  await page.getByLabel('Impact × confidence ÷ effort').check();

  // Errors: zero effort
  const effort = page.locator('.req').first().getByLabel('Effort (weeks)');
  await effort.fill('0');
  check(
    'zero effort shows an error message',
    (await page.locator('.req').first().locator('.row-error').textContent()).includes(
      'needs effort above 0',
    ),
  );
  check(
    'zero effort is reported on the board',
    (await page.locator('p.summary[role="status"]').textContent()).includes('not ranked'),
  );
  await effort.fill('1.5');

  // Errors: dependency cycle (ex-06 depends on ex-04, ex-04 depends on ex-06)
  const row = (i) => page.locator('.req').nth(i);
  await row(3).locator('summary').click();
  await row(3)
    .locator('.dep-list label', { hasText: 'Auto-tag tickets by intent' })
    .locator('input')
    .check();
  await row(5).locator('summary').click();
  await row(5)
    .locator('.dep-list label', { hasText: 'Decline refund and legal questions' })
    .locator('input')
    .check();
  const issue = await page.locator('.issues').textContent();
  check(
    'dependency cycle shows a message',
    issue.includes('Dependency cycle') && issue.includes('→'),
    issue.slice(0, 80),
  );
  const later = await page.locator('.lane-later').textContent();
  check('cycle members sit in Later with a reason', later.includes('dependency cycle'));
  await row(5)
    .locator('.dep-list label', { hasText: 'Decline refund and legal questions' })
    .locator('input')
    .uncheck();
  check('cycle message clears when the cycle is broken', await page.locator('.issues').isHidden());

  // Remove keeps focus in the page
  await row(10)
    .getByRole('button', { name: /^Remove/ })
    .click();
  check(
    'after Remove, focus stays on a field',
    await page.evaluate(() => document.activeElement?.tagName === 'INPUT'),
  );

  // Reset and persistence
  await page.getByRole('button', { name: 'Reset to examples' }).click();
  check('Reset to examples restores 11 requests', (await page.locator('.req').count()) === 11);
  check('no console errors', errors.length === 0, errors.join(' | '));
}

// Blocked storage: app still works
{
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url);
  await page.locator('.req').first().getByLabel('Impact (1–10)').fill('9');
  check(
    'works with storage blocked',
    (await page.locator('.req').count()) === 11 && errors.length === 0,
    errors.join(' | '),
  );
  check('storage-blocked notice is shown', await page.locator('.status.error').first().isVisible());
  await context.close();
}

// 375px: no sideways scrolling, light and dark
for (const scheme of ['light', 'dark']) {
  const { page, context } = await newPage({ width: 375, height: 800 }, scheme);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(`375px ${scheme}: no horizontal scroll`, overflow <= 0, `overflow ${overflow}px`);
  const small = await page.evaluate(
    () =>
      [...document.querySelectorAll('button, input, summary')]
        .filter(
          (el) =>
            el.offsetParent !== null &&
            el.type !== 'checkbox' &&
            el.type !== 'radio' &&
            el.type !== 'range',
        )
        .filter((el) => el.getBoundingClientRect().height < 24).length,
  );
  check(`375px ${scheme}: no tiny tap targets (under 24px)`, small === 0, `${small} found`);
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
