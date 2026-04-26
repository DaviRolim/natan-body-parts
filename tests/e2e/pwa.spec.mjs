import { test, expect } from "@playwright/test";

test("manifest is reachable and configured for landscape standalone use", async ({ page }) => {
  const res = await page.request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.orientation).toBe("landscape");
  expect(manifest.icons).toHaveLength(2);
});

test("service worker script contains core cached assets", async ({ page }) => {
  const res = await page.request.get("/service-worker.js");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("CACHE_VERSION = \"v3\"");
  expect(body).toContain("natan-body-parts-");
  expect(body).toContain("./assets/images/natan-face.png");
  expect(body).toContain("./assets/voice/nose.mp3");
});
