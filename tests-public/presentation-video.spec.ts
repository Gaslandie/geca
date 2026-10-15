// Même parcours sur les fichiers réellement exportés pour le site public.
import "../tests/presentation-video.spec";
import { expect, test } from "@playwright/test";

test("vidéo exportée : lecture par morceaux et plages invalides refusées", async ({ request }) => {
  const path = "/videos/geca-presentation-20261015.mp4";
  const head = await request.head(path);
  expect(head.status()).toBe(200);
  const size = Number(head.headers()["content-length"]);
  expect(size).toBeGreaterThan(0);
  const first = await request.get(path, { headers: { Range: "bytes=0-31" } });
  expect(first.status()).toBe(206);
  expect(first.headers()["content-range"]).toBe(`bytes 0-31/${size}`);
  expect((await first.body()).length).toBe(32);
  const suffix = await request.get(path, { headers: { Range: "bytes=-32" } });
  expect(suffix.status()).toBe(206);
  expect(suffix.headers()["content-range"]).toBe(`bytes ${size - 32}-${size - 1}/${size}`);
  expect((await suffix.body()).length).toBe(32);
  for (const range of ["bytes=10-2", `bytes=${size}-`, "bytes=-0", "bytes=0-1,3-4", "bytes=", "bytes=999999999999999999999-"]) {
    const response = await request.get(path, { headers: { Range: range } });
    expect(response.status(), range).toBe(416);
    expect(response.headers()["content-range"]).toBe(`bytes */${size}`);
  }
});
