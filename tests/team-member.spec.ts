import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const member of [
  { id: "daouda-camara", name: "Daouda CAMARA", fr: "Responsable Administratif et Financier", en: "Administrative and Finance Manager" },
  { id: "abou-camara", name: "Abou CAMARA", fr: "Responsable des formations et du suivi environnemental", en: "Training and Environmental Monitoring Manager" },
  { id: "mamadou-lamarana-diallo", name: "Mamadou Lamarana DIALLO", fr: "Assistant suivi environnemental", en: "Environmental Monitoring Assistant" },
  { id: "seydouba-sylla", name: "Seydouba SYLLA", fr: "Responsable des relations communautaires", en: "Community Relations Manager" },
]) {
for (const locale of ["fr", "en"] as const) {
  for (const width of [375, 1440]) {
    test(`${member.name} ${locale} à ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}/equipe`);

      await expect(page.locator(".team-member")).toHaveCount(12);
      const card = page.locator(`#${member.id}`);
      await expect(card).toContainText(member.name);
      await expect(card).toContainText(member[locale]);

      const portrait = card.getByRole("img", { name: member.name });
      await card.scrollIntoViewIfNeeded();
      await expect(portrait).toBeVisible();
      await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

      const accessibility = await new AxeBuilder({ page }).include(`#${member.id}`).analyze();
      expect(accessibility.violations).toEqual([]);

      await card.screenshot({ path: `test-results/${member.id}-${locale}-${width}.png` });
    });
  }
}
}
