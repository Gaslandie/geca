import { test, expect } from "@playwright/test";

const finalText = ["35 000", "365 000", "150 000", "84"];
const targets = [35000, 365000, 150000, 84];

for (const locale of ["fr", "en"]) {
  for (const width of [375, 1440]) {
    test(`compteurs ${locale} ${width}px : zéro, progression, valeurs exactes et une seule lecture`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      const group = page.locator(".home-impact [data-count-group]");
      const values = group.locator(".stat-count");
      await expect(values).toHaveText(finalText);
      await group.evaluate(element => {
        const samples: number[][] = [];
        Object.assign(window, { countSamples: samples });
        new MutationObserver(() => samples.push([...element.querySelectorAll(".stat-count")].map(node => Number(node.textContent?.replace(/\s/g, "")))))
          .observe(element, { childList: true, subtree: true });
      });
      const before = await group.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }));
      await group.scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => (window as unknown as { countSamples: number[][] }).countSamples.length)).toBeGreaterThan(2);
      await expect(values).toHaveText(finalText);
      const samples = await page.evaluate(() => (window as unknown as { countSamples: number[][] }).countSamples);
      expect(samples).toContainEqual([0, 0, 0, 0]);
      const middle = samples.find(sample => sample[0] > 0 && sample[0] < targets[0]);
      expect(middle).toBeDefined();
      for (let i = 1; i < targets.length; i++) {
        expect(Math.abs(middle![i] / targets[i] - middle![0] / targets[0])).toBeLessThanOrEqual(1 / targets[i] + 1 / targets[0]);
      }
      await expect(group.locator(".sr-only")).toHaveText(finalText);
      expect(await group.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(before);
      const count = samples.length;
      await page.locator(".hero").scrollIntoViewIfNeeded();
      await group.scrollIntoViewIfNeeded();
      await expect(values).toHaveText(finalText);
      expect(await page.evaluate(() => (window as unknown as { countSamples: number[][] }).countSamples.length)).toBe(count);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

for (const fallback of ["reduced-motion", "save-data", "no-observer"] as const) {
  test(`compteurs : valeurs finales avec ${fallback}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: fallback === "reduced-motion" ? "reduce" : "no-preference" });
    if (fallback === "save-data") await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
    if (fallback === "no-observer") await page.addInitScript(() => { Object.defineProperty(window, "IntersectionObserver", { value: undefined, configurable: true }); });
    await page.goto("/fr");
    const group = page.locator(".home-impact [data-count-group]");
    await group.evaluate(element => {
      Object.assign(window, { countChanges: 0 });
      new MutationObserver(() => { (window as unknown as { countChanges: number }).countChanges++; }).observe(element, { childList: true, subtree: true });
    });
    await group.scrollIntoViewIfNeeded();
    await expect(group.locator(".stat-count")).toHaveText(finalText);
    await page.waitForTimeout(1900);
    expect(await page.evaluate(() => (window as unknown as { countChanges: number }).countChanges)).toBe(0);
  });
}

test("compteurs : valeurs exactes sans JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/fr`);
  await expect(page.locator(".home-impact .stat-count")).toHaveText(finalText);
  await expect(page.locator(".home-impact .sr-only")).toHaveText(finalText);
  await context.close();
});

test("compteurs : réduction du mouvement pendant la progression", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/fr");
  await page.locator(".home-impact [data-count-group]").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator(".home-impact .stat-count").first().textContent()).not.toBe(finalText[0]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".home-impact .stat-count")).toHaveText(finalText);
});
