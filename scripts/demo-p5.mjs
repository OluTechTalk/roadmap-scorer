// P5 click-through: keyboard only. Skip link, slider with arrow keys, then errors for zero effort and a dependency cycle.
export async function demoSteps(page, pause) {
  const key = async (k, ms = 600) => {
    await page.keyboard.press(k);
    await pause(ms);
  };
  await key('Tab', 1200); // skip link appears
  await key('Enter', 1200); // jumps to the board
  await page.locator('#capacity').focus();
  await pause(800);
  for (let i = 0; i < 6; i++) await key('ArrowLeft', 450);
  for (let i = 0; i < 10; i++) await key('ArrowRight', 350);
  await pause(800);

  // Zero effort
  const effort = page.locator('.req').first().getByLabel('Effort (weeks)');
  await effort.scrollIntoViewIfNeeded();
  await effort.focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('0', { delay: 200 });
  await pause(2200);
  await page.keyboard.press('Control+A');
  await page.keyboard.type('1.5', { delay: 200 });
  await pause(800);

  // Cycle: Decline refund <-> Auto-tag
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
  await pause(800);
  await page.locator('#h-board').scrollIntoViewIfNeeded();
  await pause(3000);
}
