import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { locales, routes } from "../src/content/site";
import { readdir } from "node:fs/promises";

test("export : toutes les pages FR/EN, ressources et entrée du site", async ({ request }) => {
  const assets = new Set<string>();
  for (const locale of locales) {
    for (const path of ["", ...routes.map((route) => route.path)]) {
      const url = `/geca/${locale}/${path ? `${path}/` : ""}`;
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      const html = await response.text();
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain('name="robots" content="noindex, nofollow"');
      expect(html).toContain("form-action &#x27;none&#x27;");
      for (const match of html.matchAll(/(?:src|href|poster)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
        expect(match[1], url).toMatch(/^\/geca\//);
        if (/\.(css|js|woff2|svg|jpg|png|webp|mp4)$/.test(match[1])) assets.add(match[1]);
      }
    }
  }
  expect(assets.size).toBeGreaterThan(20);
  for (const asset of assets) expect((await request.get(asset)).status(), asset).toBe(200);
  const root = await request.get("/geca/");
  expect(root.status()).toBe(200);
  expect(await root.text()).toContain('content="0;url=/geca/fr/"');
});

test("export : adresses inconnues, fichiers privés et envoi refusés", async ({ request }) => {
  for (const path of ["fr/inconnue/", "fr/projets/inconnu/", "es/", "es/contact/", ".env", ".git/config", "src/content/site.ts", "api/contact", "api/payments", "_next/image?url=https://example.com/image.jpg&w=640&q=75"]) {
    expect((await request.get(`/geca/${path}`)).status(), path).toBe(404);
  }
  expect((await request.post("/geca/fr/contact/", { data: { email: "demo@example.com" } })).status()).toBe(405);
  const files = await readdir("out", { recursive: true });
  expect(files.some((path) => /(^|\/)(\.env[^/]*|\.git|node_modules|src)(\/|$)|\.map$/.test(path))).toBe(false);
});

for (const width of [375, 1440]) {
  test(`export : images, vidéo, navigation et langues à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/geca/fr/");
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await image.getAttribute("src")).toMatch(/^\/geca\/images\//);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/pages-home-${width}.png`, animations: "disabled" });
    await expect(page.locator(".hero-visual video")).toHaveAttribute("poster", /\/geca\/images\/optimized\/videos-geca-forest-poster-960-[a-f0-9]+\.webp$/);
    await expect(page.locator(".hero-visual video")).toHaveAttribute("src", "/geca/videos/geca-forest.mp4");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator(".hero-actions a").first().click();
    await expect(page).toHaveURL(/\/geca\/fr\/projets\/$/);
    await expect(page.locator('#main-navigation .nav-item > a[href="/geca/fr/projets/"]')).toHaveAttribute("aria-current", "page");
    await page.locator(".menu-toggle").click();
    await page.locator(".language-switch").getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/geca\/en\/projets\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.locator(".menu-toggle").click();
    await page.locator(".language-switch").getByRole("link", { name: "FR", exact: true }).click();
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page).toHaveURL(/\/geca\/fr\/contact\/$/);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/pages-contact-${width}.png`, fullPage: true });
  });
}

test("export : entrée et contact utilisables sans JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/geca/");
  await expect(page).toHaveURL(/\/geca\/fr\/$/);
  await page.goto("http://127.0.0.1:3100/geca/fr/contact/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const fields = page.locator("form input, form textarea, form button, form select");
  expect(await fields.count()).toBeGreaterThan(3);
  for (const field of await fields.all()) await expect(field).toBeDisabled();
  const emails = page.locator('a[href^="mailto:"]');
  await expect(emails).toHaveCount(3);
  for (const email of await emails.all()) await expect(email).toBeVisible();
  await context.close();
});
