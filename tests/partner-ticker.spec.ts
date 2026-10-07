import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { homeContent } from "../src/content/site";

for (const width of [320, 768, 1440]) {
  test(`bandeau ${width}px : noms authentiques, pause et logos conservés`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/fr");
    const ticker = page.locator(".partner-ticker");
    await ticker.scrollIntoViewIfNeeded();
    await expect(ticker).toHaveAttribute("data-enabled", "true");
    await expect(ticker.locator("ul").first().locator("li")).toHaveText(homeContent.partners.items.map(partner => partner.name));
    await expect(ticker.locator("img")).toHaveCount(0);
    await expect(page.locator(".partners .partner-logo")).toHaveCount(12);
    await expect(ticker.locator(".partner-ticker-track")).toHaveCSS("animation-duration", "180s");
    await expect(ticker.getByRole("button")).toHaveCount(0);
    await ticker.focus();
    await page.mouse.move(0, 0);
    await expect(ticker.locator(".partner-ticker-track")).toHaveCSS("animation-play-state", "paused");
    await page.keyboard.press("Tab");
    await expect(ticker.locator(".partner-ticker-track")).toHaveCSS("animation-play-state", "running");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(ticker).toHaveAttribute("data-enabled", "false");
    await expect(ticker.getByRole("button")).toHaveCount(0);
    await page.addStyleTag({ content: ":root {font-size:200%}" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).include(".partner-ticker").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  });
}

test("bandeau sans JavaScript : liste entière et une seule lecture des noms", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: {width:320,height:900} });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/fr");
  const ticker = page.locator(".partner-ticker");
  await expect(ticker).toHaveAttribute("data-enabled", "false");
  await expect(ticker.locator(".partner-ticker-copy")).toBeHidden();
  await expect(ticker.getByRole("listitem")).toHaveText(homeContent.partners.items.map(partner => partner.name));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
