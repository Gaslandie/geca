import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { aboutContent, contactContent, getHomeContent, homeContent, interventionContent, locales, missionVisionContent, partnershipContent, portfolioContent, newsContent, routes, getNewsEntry } from "../src/content/site";

test("routes connues FR / EN, langues et titres", async ({ request }) => {
  for (const locale of locales) {
    for (const path of ["", ...routes.map((route) => route.path)]) {
      const response = await request.get(`/${locale}${path ? `/${path}` : ""}`);
      expect(response.status(), `${locale}/${path}`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain("<title>");
      if (path === "equipe") {
        expect(html).toContain("Mohamed Makalé KABA");
        expect(html).toContain("Daouda TOURE");
        expect(html).toContain("Salifou CAMARA");
        expect(html).toContain("Mohamed Lamine SACKO");
        expect(html).toContain("Mariame Djélo DIALLO");
        expect(html).toContain("Fodé Baba SYLLA");
        expect(html).toContain("Ibrahima KABA");
        expect(html).toContain("Archille DELAMOU");
        expect(html).toContain(locale === "fr" ? "Responsable logistique" : "Logistics Manager");
        expect(html).toContain(locale === "fr" ? "Responsable des programmes" : "Programme Manager");
        expect(html).toContain(locale === "fr" ? "Assistant administratif" : "Administrative Assistant");
        expect(html).toContain(locale === "fr" ? "Chargée de communication" : "Communications Officer");
        expect(html).toContain(locale === "fr" ? "Comptable" : "Accountant");
        expect(html).toContain(locale === "fr" ? "Assistant programme" : "Programme Assistant");
        expect(html).toContain(locale === "fr" ? "Responsable suivi-évaluation" : "Monitoring and Evaluation Manager");
        expect(html).toContain(locale === "fr" ? "Directeur Exécutif" : "Executive Director");
      } else if (path === "actualites") {
        expect(html).toContain(newsContent[locale].archiveTitle);
        expect(html).not.toContain(locale === "fr" ? "Cette rubrique est en préparation." : "This section is being prepared.");
      } else if (path.startsWith("actualites/")) {
        expect(html).toContain(getNewsEntry(locale, path.slice("actualites/".length))!.period);
        expect(html).toContain("article-title");
      } else if (path === "contact") {
        expect(html).toContain(contactContent[locale].title);
        expect(html).toContain(contactContent[locale].form.demo);
      } else if (path === "a-propos") {
        expect(html).toContain(aboutContent[locale].title);
        expect(html).toContain("RENASCEDD");
      } else if (path === "a-propos/domaines-intervention") {
        expect(html).toContain(interventionContent[locale].title);
      } else if (path === "a-propos/mission-vision-valeurs") {
        expect(html).toContain(missionVisionContent[locale].title);
        expect(html).toContain(missionVisionContent[locale].mission.summary);
      } else if (path === "projets") {
        expect(html).toContain(portfolioContent[locale].catalogTitle);
        expect(html).not.toContain(locale === "fr" ? "Statuts des projets à confirmer" : "Project statuses to be confirmed");
      } else if (path === "devenir-partenaire") {
        expect(html).toContain(partnershipContent[locale].strengthsTitle);
        expect(html).toContain(partnershipContent[locale].positioning);
      } else if (!path) {
        expect(html).toContain(getHomeContent(locale).hero.titleSecondLine);
        expect(html).toContain(getHomeContent(locale).impact.titleSecondLine);
      } else if (path) {
        expect(html).toContain(routes.find(route => route.path === path)![locale]);
        expect(html).not.toContain(locale === "fr" ? "en préparation" : "being prepared");
      }
    }
  }
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(307);
  expect(root.headers().location).toContain("/fr");
});

test("accès refusés et protections de la maquette", async ({ request }) => {
  for (const path of [
    "/fr/inconnue",
    "/fr/evenements",
    "/en/evenements",
    "/fr/evenements/inconnu",
    "/fr/equipe/inconnu",
    "/en/equipe/inconnu",
    "/assets/source-images/images/team/mohamed-makale-kaba.jpg",
    "/assets/source-images/images/team/daouda-toure.jpg",
    "/assets/source-images/images/team/salifou-camara.jpg",
    "/assets/source-images/images/team/mohamed-lamine-sacko.jpg",
    "/assets/source-images/images/team/mariame-djelo-diallo.jpg",
    "/assets/source-images/images/team/fode-baba-sylla.jpg",
    "/assets/source-images/images/team/ibrahima-kaba.jpg",
    "/assets/source-images/images/team/archille-delamou.jpg",
    "/assets/source-images/images/partners/arboria-project.jpg",
    "/fr/ressources",
    "/en/ressources",
    "/fr/reseaux",
    "/en/reseaux",
    "/fr/partenaires",
    "/en/partenaires",
    "/fr/ressources/publications",
    "/en/ressources/documents",
    "/fr/projets/inconnu",
    "/es",
    "/es/contact",
    "/fr/a-propos/inconnue",
    "/api/contact",
    "/api/payments",
    "/.env",
    "/src/content/site.ts",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
  const response = await request.get("/fr");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
  // Les variantes préparées suppriment l’API de traitement à la demande.
  for (const source of ["https://example.com/image.jpg", "http://127.0.0.1/private", "/.env", "/images/temporary/forest.jpg"]) {
    const image = await request.get(`/_next/image?url=${encodeURIComponent(source)}&w=640&q=75`);
    expect(image.status()).toBe(404);
  }
});

for (const width of [320, 375, 480, 670, 767, 768, 970, 1024, 1440]) {
  test(`écran ${width}px : débordement, menus, filtres, accessibilité`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/fr");
    await page.evaluate(() => document.fonts.ready);
    // Mesurer la disposition finale après l'apparition commune, testée séparément.
    await page.locator(".hero-grid").evaluate(async (element) => {
      await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
    });
    const domains = page.locator(".domains .domain");
    await expect(domains).toHaveCount(8);
    for (const [index, domain] of (await domains.all()).entries()) {
      const area = homeContent.domains.items[index];
      await expect(domain.locator(".domain-content > p")).toHaveText(area.description);
      if (area.photo) {
        expect(await domain.locator("img").evaluate((image: HTMLImageElement) => new URL(image.currentSrc || image.src).pathname)).toMatch(new RegExp(`/images/optimized/${area.photo.src.slice(1).replaceAll("/", "-").replace(/\.jpg$/, "")}-\\d+-[a-f0-9]+\\.webp$`));
        await expect(domain.locator(".temporary-image-label")).toHaveCount(0);
        const photo = await domain.locator(".domain-photo").boundingBox();
        const text = await domain.locator(".domain-content").boundingBox();
        expect(photo).not.toBeNull();
        expect(text).not.toBeNull();
        if (photo && text) {
          expect(Math.abs(photo.width - photo.height)).toBeLessThan(1);
          expect(text.y).toBeGreaterThanOrEqual(photo.y + photo.height - 1);
          const circle = domain.locator(".domain-circle");
          await expect(circle).toHaveCSS("border-radius", "50%");
          const title = await domain.locator("h3").boundingBox();
          expect(title).not.toBeNull();
          if (title) {
            expect(title.x).toBeGreaterThanOrEqual(photo.x - 1);
            expect(title.y).toBeGreaterThanOrEqual(photo.y - 1);
            expect(title.x + title.width).toBeLessThanOrEqual(photo.x + photo.width + 1);
            expect(title.y + title.height).toBeLessThanOrEqual(photo.y + photo.height + 1);
          }
        }
      } else {
        await expect(domain.locator("img")).toHaveCount(0);
        const copy = (await domain.locator(".domain-content").boundingBox())!;
        expect(copy.width).toBeCloseTo((await domain.boundingBox())!.width, 0);
      }
      const link = domain.getByRole("link");
      await expect(link).toHaveAttribute("href", `/fr/a-propos/domaines-intervention#${homeContent.domains.items[index].id}`);
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const visual = await page.locator(".hero-backdrop").boundingBox();
    const message = await page.locator(".hero-content").boundingBox();
    const frame = (await page.locator(".header-inner").boundingBox())!;
    const logo = (await page.locator(".site-header .brand").boundingBox())!;
    const menuBox = (await page.locator(width >= 1280 ? ".header-actions" : ".menu-toggle").boundingBox())!;
    expect(frame.x).toBeCloseTo(logo.x, 0);
    expect(frame.x + frame.width).toBeCloseTo(menuBox.x + menuBox.width, 0);
    for (const section of await page.locator("#main-content > section:not(.hero), #main-content .container, .site-footer .container").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBeCloseTo(frame.x, 0);
      expect(box.width).toBeCloseTo(frame.width, 0);
    }
    // Le fond garde le cadre commun ; son contenu reste à distance des bords.
    for (const container of await page.locator("#main-content .container").all()) {
      const box = (await container.boundingBox())!;
      for (const child of await container.locator(":scope > *").all()) {
        const content = (await child.boundingBox())!;
        expect(content.x - box.x).toBeGreaterThanOrEqual(19.5);
        expect(box.x + box.width - content.x - content.width).toBeGreaterThanOrEqual(19.5);
      }
    }
    for (const section of await page.locator(".hero, .site-footer").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBe(0);
      expect(box.width).toBe(width);
    }
    const hero = (await page.locator(".hero").boundingBox())!;
    expect(visual).toEqual(hero);
    expect(message).not.toBeNull();
    // Décalage commun, renforcé sur grand écran à la demande du client.
    if (message) expect(message.x + message.width / 2).toBeCloseTo(width / 2 - (width >= 1280 ? Math.min(64, Math.max(24, width * 0.044)) : Math.min(48, Math.max(12, width * 0.033))), 0);
    await expect(page.locator(".hero-slide img").first()).toHaveAttribute("alt", "");
    expect(await page.locator(".hero-slide img").first().evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname)).toMatch(/images-client-hero-bassia-travail-\d+-[a-f0-9]+\.webp$/);
    await expect(page.locator(".hero-brand")).toHaveText("Global EcoAction");
    await expect(page.locator(".hero-brand-gold")).toHaveText(["Global", "Eco", "Action"]);
    await expect(page.locator("#hero-title")).toHaveText(
      "AGIR POUR UN AVENIR DURABLE",
    );
    const actions = page.locator(".hero-actions a");
    await expect(actions).toHaveCount(2);
    for (const action of await actions.all()) {
      const box = await action.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator(".hero video, .hero-video-toggle, .hero-action-arrow")).toHaveCount(0);
    expect(requests.filter((url) => /geca-forest(\.mp4|-poster)/.test(url))).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    if (width < 1280) await expect(menu).toBeVisible();
    else await expect(page.locator(".menu-toggle")).toBeHidden();
    const search = page.locator(".header-actions .search-link");
    await expect(search).toHaveAccessibleName("Rechercher");
    await expect(search.locator("svg")).toHaveCount(1);
    await expect(page.locator(".menu-toggle svg")).toHaveCount(1);
    await expect(page.locator(".hero-actions .hero-action-arrow")).toHaveCount(0);
    await expect(page.locator(".domain svg, .project-card svg, .stat svg, .news-card svg")).toHaveCount(0);
    await expect(search).toHaveAttribute("aria-haspopup", "dialog");
    await expect(page.locator("#main-navigation a[href='/fr/recherche']")).toHaveCount(0);
    const searchBox = (await search.boundingBox())!;
    const donateBox = (await page.locator(".donate-link").boundingBox())!;
    const language = page.locator("#main-navigation .language-switch");
    await expect(page.locator(".header-actions .language-switch")).toHaveCount(0);
    if (width < 1280) await expect(language).toBeHidden();
    else await expect(language).toBeVisible();
    expect(searchBox.x).toBeGreaterThanOrEqual(donateBox.x + donateBox.width + 5);
    const brandBox = (await page.locator(".site-header .brand").boundingBox())!;
    expect(searchBox.y + searchBox.height / 2).toBeCloseTo(donateBox.y + donateBox.height / 2, 0);
    expect(searchBox.y + searchBox.height / 2).toBeCloseTo(brandBox.y + brandBox.height / 2, 0);
    if (width < 1280) {
      const menuBarBox = (await menu.boundingBox())!;
      expect(menuBarBox.x).toBeGreaterThanOrEqual(searchBox.x + searchBox.width + 7);
      expect(menuBarBox.y + menuBarBox.height / 2).toBeCloseTo(brandBox.y + brandBox.height / 2, 0);
    }
    await expect(page.locator(".donate-link")).toHaveText("Faire un don");
    await expect(page.locator(".hero-introduction")).toContainText("En Guinée, nous agissons avec les communautés");
    if (width < 1280) {
      await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeHidden();
      await menu.click();
    }
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav).toBeVisible();
    await expect(language.getByRole("link", { name: "FR", exact: true })).toBeVisible();
    await expect(language.getByRole("link", { name: "EN", exact: true })).toBeVisible();
    // Une même hiérarchie typographique doit rester commune à toutes les sections.
    const typography = await page.evaluate(() => {
      const headings = [...document.querySelectorAll("main h2")].map((element) => {
        const style = getComputedStyle(element);
        return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight].join("|");
      });
      const menuLink = document.querySelector(".nav-item > a")!;
      return {
        headings: [...new Set(headings)],
        navigationSize: parseFloat(getComputedStyle(menuLink).fontSize),
        fontsLoaded: [...document.fonts].some((font) => font.status === "loaded"),
      };
    });
    expect(typography.headings).toHaveLength(1);
    expect(typography.navigationSize).toBeGreaterThanOrEqual(18);
    expect(typography.fontsLoaded).toBe(true);
    const sectionHeaders = await page.locator(".section-heading").evaluateAll((headers) =>
      headers.map((header) => {
        const section = (header.closest(".impact-copy") ?? header.closest("section"))!.getBoundingClientRect();
        return [...header.querySelectorAll("h2, .eyebrow, .section-description")].every((element) => {
          const box = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          // Gassama demande une description justifiée dans « Notre organisation ».
          const justified = element.matches(".about-content .section-description");
          return style.textAlign === (justified ? "justify" : "center") &&
            (!justified || style.textAlignLast === "start") &&
            Math.abs(box.x + box.width / 2 - (section.x + section.width / 2)) < 1;
        });
      }),
    );
    // Impact est centré dans sa colonne de récit ; les autres en-têtes sur la section.
    // Les sept rubriques et le bandeau newsletter déjà présent partagent l’en-tête.
    expect(sectionHeaders).toHaveLength(8);
    await expect(page.locator(".team-member")).toHaveCount(8);
    await expect(page.locator("#mohamed-makale-kaba")).toContainText("Mohamed Makalé KABA");
    await expect(page.locator("#daouda-toure")).toContainText("Daouda TOURE");
    await expect(page.locator("#salifou-camara")).toContainText("Salifou CAMARA");
    await expect(page.locator("#mohamed-lamine-sacko")).toContainText("Mohamed Lamine SACKO");
    await expect(page.locator("#mariame-djelo-diallo")).toContainText("Mariame Djélo DIALLO");
    await expect(page.locator("#fode-baba-sylla")).toContainText("Fodé Baba SYLLA");
    await expect(page.locator("#ibrahima-kaba")).toContainText("Ibrahima KABA");
    await expect(page.locator("#archille-delamou")).toContainText("Archille DELAMOU");
    expect(sectionHeaders.every(Boolean)).toBe(true);
    const partnerCards = await page.locator(".partner-list li").evaluateAll((cards) =>
      cards.map((card) => {
        const box = card.getBoundingClientRect();
        return { width: box.width, height: box.height, x: box.x, y: box.y, right: box.right, bottom: box.bottom };
      }),
    );
    // Tous les partenaires fournis figurent dans la grille.
    expect(partnerCards).toHaveLength(homeContent.partners.items.length);
    for (const card of partnerCards) {
      expect(Math.abs(card.width - partnerCards[0].width)).toBeLessThan(1);
      expect(Math.abs(card.height - partnerCards[0].height)).toBeLessThan(1);
    }
    // La rangée peut dépasser dans son viewport, mais jamais déborder la page.
    const partnerGrid = (await page.locator(".partner-list").boundingBox())!;
    const partnerGap = await page.locator(".partner-list").evaluate((grid) => parseFloat(getComputedStyle(grid).gap));
    expect(partnerGap).toBeGreaterThanOrEqual(20);
    for (const [index, card] of partnerCards.entries()) {
      expect(card.x).toBeGreaterThanOrEqual(partnerGrid.x - 1);
      expect(card.right).toBeLessThanOrEqual(partnerGrid.x + await page.locator(".partner-list").evaluate((list) => list.scrollWidth) + 1);
      if (index === 0) continue;
      const previous = partnerCards[index - 1];
      const sameRow = Math.abs(card.y - previous.y) < 1;
      expect(sameRow ? card.x - previous.right : card.y - previous.bottom).toBeCloseTo(partnerGap, 0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const group of ["À propos"]) {
      const trigger = nav.getByRole("button", { name: group, exact: true });
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await trigger.focus();
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toBeFocused();
    }
    if (width < 1200) {
      const about = nav.getByRole("button", { name: "À propos", exact: true });
      await about.click();
      await nav.getByRole("link", { name: "Mission, vision et valeurs", exact: true }).click();
      await expect(page).toHaveURL("/fr/a-propos/mission-vision-valeurs");
      await expect(nav).toBeHidden();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        missionVisionContent.fr.title,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator(".contact-breadcrumb").getByRole("link", { name: "Accueil", exact: true }).click();
    } else {
      await nav.getByRole("link", { name: "Actualités", exact: true }).click();
      await expect(page).toHaveURL("/fr/actualites");
      await page.locator(".contact-breadcrumb").getByRole("link", { name: "Accueil", exact: true }).click();
    }
    const filter = page.getByRole("group", { name: "Filtrer les projets" });
    await expect(page.locator(".project-card")).toHaveCount(2);
    await filter.getByRole("button", { name: "Réalisés" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Projet de Territoire de Moussayah - PROTEMO",
      }),
    ).toBeVisible();
    await expect(page.locator(".project-card")).toHaveCount(2);
    await filter.getByRole("button", { name: "En cours", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    const illustrations = page.locator(".photo-placeholder.has-photo");
    // L’ancienne photo du hero est désormais un fond décoratif distinct.
    await expect(illustrations).toHaveCount(12);
    for (const illustration of await illustrations.all()) {
      await illustration.scrollIntoViewIfNeeded();
      await expect(illustration.locator(".temporary-image-label")).toHaveCount(0);
      await expect
        .poll(() =>
          illustration
            .locator("img")
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth > 0,
            ),
        )
        .toBe(true);
    }
    if ([375, 768, 1440].includes(width)) {
      await page.locator(".news").screenshot({
        path: `test-results/news-${width}.png`,
      });
      await page.locator(".impact").screenshot({
        path: `test-results/impact-${width}.png`,
      });
      await page.locator(".domains").screenshot({
        path: `test-results/domains-${width}.png`,
      });
    }
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/hero-${width}.png` });
    await page.goto("/en/projets");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(errors).toEqual([]);
    expect(
      requests.filter((url) => !url.startsWith("http://127.0.0.1:3000")),
    ).toEqual([]);
  });
}

test("tous les liens internes de l’accueil répondent", async ({
  page,
  request,
}) => {
  await page.goto("/fr");
  const links = await page
    .locator("a[href^='/']")
    .evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute("href")!)),
    ]);
  for (const link of links)
    expect((await request.get(link)).status(), link).toBe(200);
});

test("texte agrandi à 200 % : contenus et navigation restent dans le cadre", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/fr");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    for (const circle of await page.locator(".domain-circle").all()) {
      const frame = (await circle.boundingBox())!;
      const title = (await circle.locator("h3").boundingBox())!;
      expect(title.x).toBeGreaterThanOrEqual(frame.x - 1);
      expect(title.y).toBeGreaterThanOrEqual(frame.y - 1);
      expect(title.x + title.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
      expect(title.y + title.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
    }
    if (await page.locator(".menu-toggle").isVisible()) await page.locator(".menu-toggle").click();
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await nav.getByRole("button", { name: "À propos", exact: true }).click();
    await expect(nav.getByRole("link", { name: "Domaines d’expertise", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".hero-actions .button-primary")).toBeVisible();
    await expect(page.locator(".hero-actions .button-secondary")).toBeVisible();
  }
});

test("clavier, langue anglaise et mouvements réduits", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.locator(".hero-backdrop")).toHaveAttribute("data-slide", "0");
  await expect(page.locator(".hero-slide")).toHaveCount(1);
  expect(
    await page
      .locator(".hero-actions .button-primary")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe(
    "main-content",
  );
  await page.goto("/fr/projets");
  if (await page.locator(".menu-toggle").isVisible()) await page.locator(".menu-toggle").click();
  await page
    .locator("#main-navigation .language-switch")
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await expect(page).toHaveURL("/en/projets");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.locator(".site-header .brand").click();
  await expect(page).toHaveURL("/en");
  await expect(page.locator("#hero-title")).toHaveText("ACTING FOR A SUSTAINABLE FUTURE");
  if (await page.locator(".menu-toggle").isVisible()) await page.locator(".menu-toggle").click();
  await page.locator("#main-navigation .language-switch").getByRole("link", { name: "FR", exact: true }).click();
  await expect(page).toHaveURL("/fr");
});

for (const width of [375, 1440]) {
  test(`carrousel ${width}px : cinq secondes, boucle et mouvement réduit`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
    await page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
    await page.goto("/fr");
    const backdrop = page.locator(".hero-backdrop");
    await expect(page.locator(".hero-slide")).toHaveCount(5);
    expect(await page.locator(".hero-slide img").evaluateAll(images => new Set(images.map(image => image.getAttribute("src"))).size)).toBe(5);
    await expect.poll(() => page.locator(".hero-slide img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await expect(backdrop).toHaveAttribute("data-slide", "0");
    await page.clock.runFor(4999);
    await expect(backdrop).toHaveAttribute("data-slide", "0");
    await page.clock.runFor(1);
    await expect(backdrop).toHaveAttribute("data-slide", "1");
    for (const next of [2, 3, 4, 0]) {
      await page.clock.runFor(5000);
      await expect(backdrop).toHaveAttribute("data-slide", String(next));
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".hero-slide")).toHaveCount(1);
    await page.clock.runFor(15000);
    await expect(backdrop).toHaveAttribute("data-slide", "0");
    await expect(page.locator(".hero video, .hero button")).toHaveCount(0);
  });
}

test("photo indisponible : saut du fond cassé et liens utilisables", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
    await page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
  await page.route("**/*hero-gbara-arrosage*", (route) => route.abort());
  await page.goto("/fr");
  await expect.poll(() => page.locator(".hero-slide img").evaluateAll(images => images.filter(image => !image.getAttribute("src")?.includes("hero-gbara-arrosage")).every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.clock.runFor(5000);
  await expect(page.locator(".hero-backdrop")).toHaveAttribute("data-slide", "2");
  for (const [label, path] of [["Découvrir nos projets", "/fr/projets"], ["Devenir partenaire", "/fr/devenir-partenaire"]]) {
    await page.locator(".hero-actions").getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(path);
    await page.locator(".site-header .brand").click();
  }
});

test("économie de données : un seul fond fixe", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }); });
  await page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
    await page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
  const extra: string[] = [];
  page.on("request", (request) => { if (/hero-(gbara-arrosage|bassia-groupe|gbara-champ|gbara-entretien)/.test(request.url())) extra.push(request.url()); });
  await page.goto("/fr");
  await expect(page.locator(".hero-slide")).toHaveCount(1);
  await page.clock.runFor(15000);
  await expect(page.locator(".hero-backdrop")).toHaveAttribute("data-slide", "0");
  expect(extra).toEqual([]);
});

test("sans JavaScript : un fond chargé, message et liens présents", async ({ browser }) => {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    const imageLoaded = page.waitForResponse((response) => /images-client-hero-bassia-travail-\d+-[a-f0-9]+\.webp$/.test(response.url()) && response.status() === 200);
    await page.goto("http://127.0.0.1:3000/fr");
    await imageLoaded;
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.locator(".hero-actions a")).toHaveCount(2);
    await expect(page.locator(".hero-slide")).toHaveCount(1);
    await expect(page.locator(".hero video, .hero button")).toHaveCount(0);
    await context.close();
  }
});

test("navigation directe ordinateur : clavier, sous-menu et passage au mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  const menu = page.locator(".menu-toggle");
  await expect(nav).toBeVisible();
  await expect(menu).toBeHidden();
  const about = nav.getByRole("button", { name: "À propos", exact: true });
  await about.focus();
  await page.keyboard.press("Enter");
  await expect(about).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "Qui sommes-nous ?", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(about).toBeFocused();
  await expect(about).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(nav).toBeHidden();
  await menu.click();
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL("/en");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
