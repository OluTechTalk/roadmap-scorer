// P4 click-through: read a drafted why-not note, edit it, then make two requests close and watch the sensitivity readout.
export async function demoSteps(page, pause) {
  await page.locator('#h-whynot').scrollIntoViewIfNeeded();
  await pause(1800);
  const first = page.locator('.whynot textarea').nth(1);
  await first.scrollIntoViewIfNeeded();
  await first.fill('Waiting for the Q3 research on how often agents actually retag tickets.');
  await pause(2000);
  await page.locator('.whynot li').nth(1).getByRole('button', { name: 'Reset to draft' }).click();
  await pause(1500);

  // Make "Decline refund and legal questions" and "Auto-tag" a close call.
  const row = page.locator('.req').nth(3);
  await row.scrollIntoViewIfNeeded();
  await row.getByLabel('Confidence (0–1)').fill('0.6');
  await pause(1200);
  await page.locator('#h-sens').scrollIntoViewIfNeeded();
  await pause(2800);
  await page.locator('#capacity').scrollIntoViewIfNeeded();
  await pause(800);

  // A formula that ignores confidence says so.
  await page.locator('#h-formula').scrollIntoViewIfNeeded();
  await page.getByLabel('Impact ÷ effort').check();
  await pause(800);
  await page.locator('#h-sens').scrollIntoViewIfNeeded();
  await pause(2000);
}
