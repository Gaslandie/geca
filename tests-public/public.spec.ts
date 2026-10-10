import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { href, identity, locales, routes, supportActions } from "../src/content/site";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("livraison : chaque fichier public est servi, styles et images compris", async ({ request }) => {
  const selected = JSON.parse(await readFile("release/latest.json", "utf8"));
  const manifest = JSON.parse(await readFile(join(selected.directory, "manifest.json"), "utf8"));
  for (const file of manifest.files as { path: string; bytes: number }[]) {
    if (file.path === ".htaccess") continue;
    const response = await request.get(`/${file.path}`);
    expect(response.status(), file.path).toBe(200);
    expect((await response.body()).length, file.path).toBe(file.bytes);
    if (file.path.endsWith(".webp")) expect(response.headers()["content-type"]).toBe("image/webp");
    if (file.path.endsWith(".css")) expect(response.headers()["content-type"]).toContain("text/css");
  }
});

test("livraison : toutes les routes FR/EN et leur référencement", async ({ request }) => {
  for (const locale of locales) {
    for (const path of ["", ...routes.map(route => route.path)]) {
      const response = await request.get(`${href(locale, path)}/`);
      expect(response.status(), `${locale}/${path}`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain('<meta name="robots" content="index, follow"');
      expect(html).toContain(`https://globalecoaction.org${href(locale, path)}/`);
      expect(html).not.toContain("127.0.0.1:8000");
      expect(html).not.toContain("newsletter-controls");
      expect(html).not.toContain('action="/api/contact"');
    }
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap: https://globalecoaction.org/sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  const xml = await sitemap.text();
  expect(xml).toContain("https://globalecoaction.org/fr/projets/");
  expect(xml).not.toMatch(/localhost|127\.0\.0\.1|\/geca\/|administration|newsletter|<lastmod>/);
});

test("livraison : routes privées, fichiers et méthodes refusés", async ({ request }) => {
  for (const path of ["/.env", "/.htaccess", "/.git/config", "/backoffice/.env", "/storage/logs/laravel.log", "/administration", "/connexion", "/newsletter/fr", "/api/contact", "/fr/inconnue", "/fr/evenements", "/en/ressources"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  expect((await request.post("/fr/", { data: "adresse=exemple@example.com" })).status()).toBe(405);
  const headers = (await request.get("/fr/")).headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toContain("form-action 'none'");
  expect(headers["x-robots-tag"]).toBeUndefined();
});

for (const width of [320, 375, 768, 1440]) {
  test(`livraison ${width}px : contact direct, menu, recherche et textes agrandis`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const locale of locales) {
      await page.goto(`/${locale}/contact/`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".contact-form")).toHaveCount(0);
      await expect(page.locator(".footer-newsletter")).toHaveCount(0);
      await expect(page.locator(".contact-public-actions a")).toHaveCount(3);
      await expect(page.locator(".contact-public-actions a").first()).toHaveAttribute("href", supportActions.whatsappHref);
      await expect(page.locator(".contact-public-actions a").nth(1)).toHaveAttribute("href", identity.phoneHref);
      await expect(page.locator(".contact-public-actions a").last()).toHaveAttribute("href", `mailto:${identity.email}`);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator(".contact-public-actions").screenshot({ path: `/tmp/geca-public-contact-${locale}-${width}.png` });
      await page.goto(`/${locale}/nous-soutenir/`);
      await expect(page.locator(".construction-actions a").first()).toHaveAttribute("href", supportActions.whatsappHref);
      await page.goto(`/${locale}/`);
      if (width < 1280) {
        await page.locator(".menu-toggle").click();
        await expect(page.locator("#main-navigation")).toBeVisible();
        await page.keyboard.press("Escape");
      }
      await page.locator(".search-link").click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("searchbox").fill("PROTEMO");
      await expect(dialog.locator(".search-results a").first()).toHaveAttribute("href", `/${locale}/projets/#projet-protemo`);
      await page.keyboard.press("Escape");
      await page.addStyleTag({ content: ":root { font-size: 200%; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("livraison : crédits, confidentialité et vrai plan du site", async ({ page, request }) => {
  for (const locale of locales) {
    await page.goto(`/${locale}/mentions-legales/`);
    await expect(page.locator("#credits-photo")).toContainText("PIC.docx");
    await expect(page.locator("#credits-photo")).toContainText("Caroletravis");
    await expect(page.locator('a[href="https://creativecommons.org/licenses/by-sa/4.0/"]')).toHaveCount(1);
    await page.goto(`/${locale}/confidentialite/`);
    await expect(page.locator("main")).toContainText("WhatsApp");
    await page.goto(`/${locale}/plan-du-site/`);
    await expect(page.locator(".site-info li a")).toHaveCount(routes.length + 1);
    for (const link of await page.locator(".site-info li a").all()) expect((await request.get((await link.getAttribute("href"))!)).status()).toBe(200);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
});

test("livraison : navigation et contact directs sans JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3110/");
  await expect(page).toHaveURL(/\/fr\/$/);
  await page.goto("http://127.0.0.1:3110/en/contact/");
  await expect(page.locator(".contact-public-actions a")).toHaveCount(3);
  await expect(page.locator(".contact-form, .footer-newsletter")).toHaveCount(0);
  await context.close();
});
