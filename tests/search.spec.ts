import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getSearchDocuments } from "../src/content/search";
import { normalizeSearch, prepareSearch, searchDocuments } from "../src/lib/search";

test("recherche : accents, préfixes, fautes, mots multiples, chiffres et corpus public", () => {
  const docs = getSearchDocuments("fr");
  const index = prepareSearch(docs);
  expect(normalizeSearch("ÉCOLOGIE 550 000")).toBe("ecologie 550000");
  for (const query of ["agroeco", "AGROÉCOLOGIE", "reboisemnt", "550000", "alcoa", "femmes agricultrices", "renascedd", "moteur"]) {
    expect(searchDocuments(index, query).length, query).toBeGreaterThan(0);
  }
  expect(searchDocuments(index, "daouda toure")[0].document.href).toBe("/fr/equipe#daouda-toure");
  expect(searchDocuments(index, "makale kaba")[0].document.href).toBe("/fr/equipe#mohamed-makale-kaba");
  expect(searchDocuments(prepareSearch(getSearchDocuments("en")), "executive director")[0].document.href).toBe("/en/equipe#mohamed-makale-kaba");
  expect(searchDocuments(index, "agroeco")[0].document.href).toContain("#agroecologie");
  expect(searchDocuments(index, "agroecologie zzzzzzzzz")).toEqual([]);
  expect(searchDocuments(index, "<script>alert(1)</script>")).toEqual([]);
  for (const doc of docs) {
    expect(doc.href).toMatch(/^\/fr(?:\/|#|$)/);
    expect(doc.href).not.toMatch(/\/(?:ressources|reseaux|partenaires|evenements)(?:\/|#|$)/);
    expect(doc.text).not.toMatch(/\/home\/|TEXTES-AUTHENTIQUES|SKILL\.md/);
  }
});

for (const width of [320, 768, 1440]) {
  test(`recherche ${width}px : panneau, fond flouté, suggestions et clavier`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    const trigger = page.getByRole("button", { name: "Rechercher", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("searchbox");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL("/fr");
    await expect(input).toBeFocused();
    expect(await dialog.evaluate((el) => el.matches(":modal"))).toBe(true);
    expect(await dialog.evaluate((el) => getComputedStyle(el, "::backdrop").backdropFilter)).toBe("blur(6px)");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await expect(dialog.locator(".search-results a")).toHaveCount(4);
    await input.fill("agroeco");
    await expect(dialog.getByRole("status")).toContainText("résultat");
    await expect(dialog.locator(".search-results a").first()).toHaveAttribute("href", /#agroecologie$/);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `/tmp/geca-search-${width}.png` });
    await input.press("ArrowDown");
    await expect(dialog.locator(".search-results a").first()).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(input).toBeFocused();
    for (let count = 0; count < 14; count++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await dialog.getByRole("button", { name: "Fermer la recherche" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.locator(".search-results a").last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    // L’événement natif close puis le nettoyage de l’effet React sont asynchrones.
    await expect.poll(() => page.evaluate(() => document.body.style.overflow), { timeout: 1000 }).not.toBe("hidden");
    await trigger.click();
    await input.fill("PROTEMO");
    await expect(dialog.getByRole("status")).toContainText("résultat");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/fr\/projets#projet-protemo$/);
    await expect(page.locator("#projet-protemo")).toBeInViewport();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
}

test("recherche : aucune transmission, saisie hostile, limite, fermeture et texte agrandi", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/fr/a-propos");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const dialog = page.getByRole("dialog"), input = dialog.getByRole("searchbox");
  await input.fill('<img src=x onerror="alert(1)">');
  await expect(dialog.getByRole("status")).toContainText("Aucun résultat");
  await expect(dialog.locator("img")).toHaveCount(0);
  await input.fill("q".repeat(1000));
  await expect(input).toHaveValue("q".repeat(120));
  await expect(dialog.getByRole("status")).toContainText("Aucun résultat");
  expect(requests.some((url) => /[?&](q|query|search)=|onerror|qqqq/.test(url))).toBe(false);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await dialog.getByRole("button", { name: "Effacer la recherche" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await dialog.getByRole("button", { name: "Fermer la recherche" }).click();
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("recherche EN, fond cliquable, composition et absence de JavaScript", async ({ page, browser }) => {
  await page.goto("/en/contact");
  const trigger = page.getByRole("button", { name: "Search", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog"), input = dialog.getByRole("searchbox");
  await input.dispatchEvent("compositionstart");
  await input.fill("agroecology");
  await expect(dialog.getByRole("status")).toHaveText("Searching…");
  await input.dispatchEvent("compositionend");
  await expect(dialog.locator(".search-results a").first()).toHaveAttribute("href", /^\/en\/a-propos\/domaines-intervention#agroecologie$/);
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await context.newPage();
  await noJs.goto("http://127.0.0.1:3000/fr");
  await expect(noJs.locator(".search-link")).not.toBeVisible();
  await expect(noJs.locator(".hero-actions a")).toHaveCount(2);
  await context.close();
});
