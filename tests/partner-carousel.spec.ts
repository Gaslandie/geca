import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { homeContent } from "../src/content/site";

for (const width of [320, 768, 1440]) {
  test(`logos ${width}px : flèches, clavier, douze partenaires et texte agrandi`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    const carousel = page.getByRole("region", {name:"Logos des partenaires"});
    const list = carousel.locator(".partner-list");
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute("data-ready", "true");
    await expect(list.locator("img")).toHaveCount(12);
    for (const image of await list.locator("img").all()) await expect(image).toHaveAttribute("alt", /Logo/);
    await carousel.getByRole("button", {name:"Partenaires suivants"}).click();
    expect(await list.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
    await list.focus();
    await page.keyboard.press("ArrowLeft");
    expect(await list.evaluate(element=>element.scrollLeft)).toBeLessThan(2);
    await carousel.getByRole("button", {name:"Partenaires précédents"}).focus();
    await page.keyboard.press("Enter");
    expect(await list.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
    await expect(carousel.locator('[aria-live="polite"]')).toContainText("sur 12");
    expect((await new AxeBuilder({ page }).include(".partner-carousel").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.addStyleTag({content:":root {font-size:200%}"});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}

for (const locale of ["fr", "en"]) {
  test(`logos ${locale} : défilement, arrêt au survol et au clavier, sans bouton de pause`, async ({page}) => {
    await page.clock.install();
    await page.setViewportSize({width:1440,height:900});
    await page.emulateMedia({reducedMotion:"no-preference"});
    await page.goto(`/${locale}`);
    const carousel=page.locator('.partner-carousel');
    const list=carousel.locator('.partner-list');
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute('data-ready','true');
    await page.mouse.move(0,0);
    const initial=await list.evaluate(element=>element.scrollLeft);
    await page.clock.runFor(5200);
    expect(await list.evaluate(element=>element.scrollLeft)).toBeGreaterThan(initial+10);
    await carousel.hover();
    const stopped=await list.evaluate(element=>element.scrollLeft);
    await page.clock.runFor(7000);
    expect(await list.evaluate(element=>element.scrollLeft)).toBeCloseTo(stopped,0);
    await page.mouse.move(0,0);
    await page.clock.runFor(5200);
    expect(await list.evaluate(element=>element.scrollLeft)).toBeGreaterThan(stopped+10);
    await list.focus();
    await expect(carousel).toHaveAttribute('data-autoplay','false');
    const focusedPosition=await list.evaluate(element=>element.scrollLeft);
    await page.clock.runFor(7000);
    expect(await list.evaluate(element=>element.scrollLeft)).toBeCloseTo(focusedPosition,0);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(carousel).toHaveAttribute('data-autoplay','true');
    await carousel.scrollIntoViewIfNeeded();
    await page.mouse.move(0,0);
    await page.clock.runFor(5200);
    expect(await list.evaluate(element=>element.scrollLeft)).toBeGreaterThan(focusedPosition+10);
    await expect(carousel.getByRole('button')).toHaveCount(2);
    await expect(list).toHaveCSS('scrollbar-width','none');
  });
}

test("logos : survol, boucle et changement de préférence", async ({page}) => {
  await page.clock.install();
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto('/fr');
  const carousel=page.locator('.partner-carousel');
  const list=carousel.locator('.partner-list');
  await carousel.scrollIntoViewIfNeeded();
  await carousel.hover();
  const initial=await list.evaluate(element=>element.scrollLeft);
  await page.clock.runFor(7000);
  expect(await list.evaluate(element=>element.scrollLeft)).toBeCloseTo(initial,0);
  await page.mouse.move(0,0);
  await list.evaluate(element=>{ element.scrollLeft=element.scrollWidth-element.clientWidth; });
  await page.clock.runFor(5200);
  expect(await list.evaluate(element=>element.scrollLeft)).toBeLessThan(2);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(carousel).toHaveAttribute('data-autoplay','false');
  await expect(carousel.locator('.partner-carousel-toggle')).toHaveCount(0);
  const stopped=await list.evaluate(element=>element.scrollLeft);
  await page.clock.runFor(10000);
  expect(await list.evaluate(element=>element.scrollLeft)).toBeCloseTo(stopped,0);
  await carousel.getByRole('button',{name:'Partenaires suivants'}).click();
  expect(await list.evaluate(element=>element.scrollLeft)).toBeGreaterThan(stopped);
});

test("logos : économie de données sans défilement automatique", async ({page}) => {
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
  await page.goto('/fr');
  const carousel=page.locator('.partner-carousel');
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel).toHaveAttribute('data-autoplay','false');
  await expect(carousel.locator('.partner-carousel-toggle')).toHaveCount(0);
  await carousel.getByRole('button',{name:'Partenaires suivants'}).click();
  expect(await carousel.locator('.partner-list').evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
});

test("logos sans JavaScript : les douze images restent disponibles",async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:3000/fr');
  const carousel=page.locator('.partner-carousel');
  await expect(carousel).toHaveAttribute('data-ready','false');
  await expect(carousel.getByRole('button')).toHaveCount(0);
  await expect(carousel.locator('img')).toHaveCount(homeContent.partners.items.length);
  await expect(carousel.locator('.partner-list')).toHaveCSS('display','grid');
  await context.close();
});
