import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missionVisionContent } from "../src/content/site";

for (const width of [320, 768, 1440]) {
  test(`mission ${width}px : photos locales créditées, lecture et liens`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3000")) external.push(request.url());
    });
    await page.goto("/fr/a-propos/mission-vision-valeurs");
    await page.evaluate(() => document.fonts.ready);
    for (const figure of await page.locator(".mission-figure").all()) {
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => figure.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(figure.locator("img")).toHaveAttribute("src", /\/images\/optimized\/images-mission-/);
      await expect(figure.getByText("Image temporaire", { exact: true })).toBeVisible();
      await expect(figure.locator("figcaption")).toHaveCount(0);
    }
    expect(external).toEqual([]);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const projects = page.locator(".mission-actions").getByRole("link", { name: missionVisionContent.fr.projects });
    await projects.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/fr/projets");
  });
}

for (const locale of ["fr", "en"] as const) {
  test(`mission ${locale} sans JavaScript : texte complet et ordre des valeurs`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:3000/${locale}/a-propos/mission-vision-valeurs`);
    const text = missionVisionContent[locale];
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(text.title);
    for (const key of ["mission", "vision"] as const) {
      const section = page.locator(`#notre-${key}`);
      await expect(section.locator(".section-description")).toHaveText(text[key].summary);
      await expect(section.locator(".mission-prose p")).toHaveText([...text[key].paragraphs]);
    }
    await expect(page.locator(".mission-value-card h3")).toHaveText(text.values.map((value) => value.title));
    await expect(page.locator(".mission-value-card .card-subtitle")).toHaveText(text.values.map((value) => value.summary));
    await expect(page.locator(".mission-value-card p:last-child")).toHaveText(text.values.map((value) => value.detail));
    await page.getByRole("link", { name: locale === "fr" ? "Crédits photo" : "Photo credits", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/mentions-legales#credits-photo$`));
    for (const key of ["mission", "vision"] as const) {
      await expect(page.locator("#credits-photo").getByText(text[key].photo.author, { exact: false })).toBeVisible();
      await expect(page.locator(`#credits-photo a[href="${text[key].photo.licenseUrl}"]`)).toBeVisible();
    }
    await context.close();
  });
}
