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
    await expect(carousel).toHaveAttribute("data-paused", "true");
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

test("logos : avance toutes les trois secondes, arrêt au focus et commandes sans texte supplémentaire", async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto("/fr");
  const carousel=page.locator('.partner-carousel');
  const list=carousel.locator('.partner-list');
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
  await expect.poll(()=>list.evaluate(element=>element.scrollLeft),{timeout:6500}).toBeGreaterThan(1);
  await expect.poll(()=>list.evaluate(element=>element.style.scrollSnapType)).toBe("");
  await list.focus();
  await carousel.hover();
  await page.mouse.move(0,0);
  const focusedPosition=await list.evaluate(element=>element.scrollLeft);
  await page.waitForTimeout(3500);
  expect(await list.evaluate(element=>element.scrollLeft)).toBeCloseTo(focusedPosition,0);
  await expect(carousel.getByRole('button')).toHaveCount(2);
  await expect(carousel.getByText(/Reprendre|Mettre en pause/)).toHaveCount(0);
  await expect(list).toHaveCSS('scrollbar-width','none');

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
