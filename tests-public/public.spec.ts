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
      const robots = path === "recherche" ? "noindex, follow" : "index, follow";
      expect(html.match(/<meta name="robots" content="([^"]+)"/)?.[1], `${locale}/${path}`).toBe(robots);
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
  expect(xml).not.toContain("/recherche/");
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
      await expect(page.locator(".contact-form")).toHaveCount(1);
      await expect(page.locator(".footer-newsletter")).toHaveCount(0);
      await expect(page.locator(".contact-mail-details a").last()).toHaveAttribute("href", supportActions.whatsappHref);
      await expect(page.locator(".contact-email-fallback")).toHaveAttribute("href", `mailto:${identity.email}`);
      await expect(page.locator(".contact-form input[name=name]")).toHaveValue("");
      await expect(page.locator(".contact-form select")).toHaveValue("");
      await expect(page.locator(".whatsapp-floating")).toHaveAttribute("href", supportActions.whatsappHref);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator(".contact-mail-section").screenshot({ path: `/tmp/geca-public-contact-${locale}-${width}.png` });
      await page.goto(`/${locale}/nous-soutenir/`);
      await expect(page.locator(".support-donation-actions a").first()).toHaveAttribute("href", supportActions.whatsappHref);
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
  await expect(page.locator(".contact-form")).toHaveCount(1);
  await expect(page.locator(".contact-form fieldset")).toHaveAttribute("disabled", "");
  for (const field of await page.locator(".contact-form input, .contact-form select, .contact-form textarea, .contact-form button").all()) await expect(field).toBeDisabled();
  await expect(page.locator(".footer-newsletter")).toHaveCount(0);
  await context.close();
});

test("livraison : formulaire vide, succès et échec sans fausse confirmation", async ({ page }) => {
  let fail = false;
  let sent = 0;
  await page.route("https://admin.globalecoaction.org/contact-public**", async route => {
    const headers = { "Access-Control-Allow-Origin": "http://127.0.0.1:3110", "Access-Control-Allow-Headers": "Content-Type, Accept", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (route.request().method() === "GET") return route.fulfill({ headers, json: { token: "a".repeat(64) } });
    sent++;
    return route.fulfill({ status: fail ? 503 : 200, headers, json: fail ? { error: "delivery" } : { sent: true } });
  });
  await page.goto("/fr/contact/");
  await expect(page.locator("#contact-name")).toHaveValue("");
  await expect(page.locator("#contact-reason")).toHaveValue("");
  const fill = async () => {
    await page.locator("#contact-name").fill("Test isolé");
    await page.locator("#contact-email").fill("sender@example.com");
    await page.locator("#contact-reason").selectOption("other");
    await page.locator("#contact-message").fill("Message simulé sans envoi réel.");
  };
  await fill();
  await page.locator(".contact-submit").click();
  await expect(page.locator(".contact-send-status")).toHaveText("Votre message a été envoyé à GECA.");
  expect(sent).toBe(1);
  fail = true;
  await fill();
  await page.locator(".contact-submit").click();
  await expect(page.locator(".contact-send-status")).toContainText("Le message n’a pas été envoyé");
  await expect(page.locator("#contact-name")).toHaveValue("Test isolé");
});
