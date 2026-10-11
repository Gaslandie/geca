import { expect, test } from "@playwright/test";
import { serializeJsonLd } from "../src/lib/json-ld";

test("le JSON-LD conserve le texte sans permettre de fermer la balise script", async ({ page }) => {
  const name = '</script><script>window.__jsonLdInjected = true</script><img src=x onerror="window.__jsonLdInjected=true">';
  const data = { "@context": "https://schema.org", "@type": "Organization", name };
  const serialized = serializeJsonLd(data);
  expect(serialized).not.toContain("<");
  expect(JSON.parse(serialized)).toEqual(data);
  await page.setContent(`<script type="application/ld+json">${serialized}</script>`);
  await expect(page.locator("script")).toHaveCount(1);
  await expect(page.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => "__jsonLdInjected" in window)).toBe(false);
  expect(JSON.parse(await page.locator("script").textContent() ?? "")).toEqual(data);
});
