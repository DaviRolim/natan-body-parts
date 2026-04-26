import { test, expect } from "@playwright/test";

test("manifest is reachable and configured for standalone use in any orientation", async ({ page }) => {
  const res = await page.request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.orientation).toBe("any");
  expect(manifest.icons).toHaveLength(2);
});

test("service worker script contains core cached assets", async ({ page }) => {
  const res = await page.request.get("/service-worker.js");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("CACHE_VERSION = \"v4\"");
  expect(body).toContain("natan-body-parts-");
  expect(body).toContain("./assets/images/natan-face.png");
  expect(body).toContain("./assets/voice/nose.mp3");
});
