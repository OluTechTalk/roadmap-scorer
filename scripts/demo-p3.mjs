// P3 click-through: drag the capacity slider and watch the cut line and lanes change.
export async function demoSteps(page, pause) {
  const slider = page.locator('#capacity');
  await page.locator('#h-board').scrollIntoViewIfNeeded();
  await pause(1500);
  for (const weeks of [4, 8, 20, 30, 12]) {
    await slider.fill(String(weeks));
    await pause(1600);
  }
}
