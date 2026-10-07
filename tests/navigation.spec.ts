import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const viewport of [
  { width: 320, height: 900 },
  { width: 375, height: 900 },
  { width: 768, height: 600 },
  { width: 1024, height: 900 },
  { width: 667, height: 375 },
]) {
  test(`menu superposé ${viewport.width}×${viewport.height} : page immobile et liens accessibles`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const path of ["/fr", "/fr/contact"]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const header = page.locator(".site-header");
      const main = page.locator("main");
      const toggle = page.locator(".menu-toggle");
      const nav = page.getByRole("navigation", { name: "Navigation principale" });
      const before = { header: await header.boundingBox(), main: await main.boundingBox() };
      await toggle.click();
      await expect(nav).toBeVisible();
      expect(await header.boundingBox()).toEqual(before.header);
      expect(await main.boundingBox()).toEqual(before.main);
      const panel = (await nav.boundingBox())!;
      expect(Math.abs(panel.y - before.main!.y)).toBeLessThanOrEqual(1);
      expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height + 1);
      const bar = (await page.locator(".header-inner").boundingBox())!;
      const links = (await nav.locator(":scope > ul").boundingBox())!;
      expect(links.x + links.width).toBeCloseTo(bar.x + bar.width, 0);
      const about = nav.getByRole("button", { name: "À propos", exact: true });
      await about.click();
      await expect(about).toHaveAttribute("aria-expanded", "true");
      expect(await header.boundingBox()).toEqual(before.header);
      expect(await main.boundingBox()).toEqual(before.main);
      await header.locator(".language-switch").getByRole("link", { name: "EN", exact: true }).focus();
      const language = (await header.locator(".language-switch").getByRole("link", { name: "EN", exact: true }).boundingBox())!;
      expect(language.y).toBeGreaterThanOrEqual(panel.y);
      await expect(nav.getByRole("link", { name: "EN", exact: true })).toBeVisible();
      await expect(header.locator(".header-actions .language-switch")).toHaveCount(0);
      expect(language.y + language.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await toggle.click();
      await expect(nav).toBeHidden();
      expect(await main.boundingBox()).toEqual(before.main);

      // La hauteur réelle de la barre doit aussi être prise en compte à 200 %.
      await page.addStyleTag({ content: ":root { font-size: 200%; }" });
      const enlarged = await main.boundingBox();
      await toggle.click();
      await expect(nav).toBeVisible();
      expect(await main.boundingBox()).toEqual(enlarged);
      await header.locator(".language-switch").getByRole("link", { name: "EN", exact: true }).focus();
      const enlargedLanguage = (await header.locator(".language-switch").getByRole("link", { name: "EN", exact: true }).boundingBox())!;
      expect(enlargedLanguage.y + enlargedLanguage.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(nav).toBeHidden();
      await expect(toggle).toBeFocused();
      expect(await main.boundingBox()).toEqual(enlarged);
    }
  });
}


test("don : pulsation courte, mouvements réduits et destination sans paiement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/fr");
  const donate = page.locator(".donate-link");
  await expect(donate).toHaveAccessibleName("Faire un don");
  await expect(donate).toHaveAttribute("href", "/fr/nous-soutenir");
  const animations = await donate.evaluate((element) => element.getAnimations().map((animation) => {
    const timing = animation.effect!.getTiming();
    return { duration: timing.duration, iterations: timing.iterations };
  }));
  expect(animations).toEqual([{ duration: 1500, iterations: 3 }]);
  await expect.poll(() => donate.evaluate((element) => element.getAnimations().length), { timeout: 6000 }).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect(await donate.evaluate((element) => element.getAnimations().length)).toBe(0);
  await donate.focus();
  await expect(donate).toBeFocused();
  expect(await donate.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/fr/nous-soutenir");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("form")).toHaveCount(0);
});

for (const width of [375, 1280, 1440, 1920]) {
  test(`barre fixe ${width}px : défilement, ancres, focus et hero sans carte`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    const hero = await page.locator(".hero-content").evaluate(element => {
      const style = getComputedStyle(element); return { background: style.backgroundColor, shadow: style.boxShadow, border: style.borderWidth };
    });
    expect(hero).toEqual({ background: "rgba(0, 0, 0, 0)", shadow: "none", border: "0px" });
    await page.evaluate(() => scrollTo(0, 1600));
    expect((await page.locator(".site-header").boundingBox())!.y).toBe(0);
    const compact = page.locator(".menu-toggle");
    if (width >= 1280) {
      await expect(compact).toBeHidden();
      await expect(page.locator(".main-nav")).toBeVisible();
    } else await compact.click();
    await page.locator(".main-nav").getByRole("button", { name: "À propos", exact: true }).click();
    await page.locator(".main-nav").getByRole("link", { name: "Qui sommes-nous ?", exact: true }).click();
    await page.getByRole("link", { name: /histoire/i }).click();
    const header = (await page.locator(".site-header").boundingBox())!;
    expect((await page.locator("#notre-histoire").boundingBox())!.y).toBeGreaterThanOrEqual(header.height);
    await page.locator("main a").last().focus();
    const focused = await page.locator("main a").last().boundingBox();
    expect(focused!.y).toBeGreaterThanOrEqual(header.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    await expect(compact).toBeVisible();
    await compact.click();
    await expect(page.locator(".main-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(compact).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
