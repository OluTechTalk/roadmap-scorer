// P2 click-through: change a value and watch the ranking move, switch formula, add and remove a request.
export async function demoSteps(page, pause) {
  const firstRow = page.locator('.req').first();
  await firstRow.scrollIntoViewIfNeeded();
  await pause();

  // Raise impact of the first row's neighbour and watch the ranked list.
  const impact = page.locator('.req').nth(8).getByLabel('Impact (1–10)');
  await impact.scrollIntoViewIfNeeded();
  await impact.fill('10');
  await pause(1200);
  await page.locator('#h-ranked').scrollIntoViewIfNeeded();
  await pause(1500);

  // Switch formula.
  await page.locator('#h-formula').scrollIntoViewIfNeeded();
  await page.getByLabel('Impact ÷ effort').check();
  await pause(1200);
  await page.locator('#h-ranked').scrollIntoViewIfNeeded();
  await pause(1500);
  await page.locator('#h-formula').scrollIntoViewIfNeeded();
  await page.getByLabel('Impact × confidence ÷ effort').check();
  await pause(1000);

  // Zero effort shows an error and drops the row from the ranking.
  const effort = page.locator('.req').first().getByLabel('Effort (weeks)');
  await effort.scrollIntoViewIfNeeded();
  await effort.fill('0');
  await pause(1800);
  await effort.fill('1');
  await pause(1000);
}
