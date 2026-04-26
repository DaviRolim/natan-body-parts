import { test, expect } from "@playwright/test";

test("face scene renders five tappable body parts", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".part-target");
  await expect(page.locator(".part-target")).toHaveCount(5);
});

test("tapping each part applies a reaction and triggers the voice clip", async ({ page }) => {
  await page.addInitScript(() => {
    window.__playLog = [];
    HTMLMediaElement.prototype.play = function () {
      window.__playLog.push(this.src);
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      this.dispatchEvent(new Event("pause"));
    };
  });

  await page.goto("/");
  await page.waitForSelector(".part-target");

  for (const id of ["eyes", "nose", "mouth", "ears", "hair"]) {
    const before = await page.evaluate(() => window.__playLog.length);
    await page.click(`.part-target[data-id="${id}"]`);
    await expect(page.locator(".part-highlight.is-active")).toHaveCount(1);
    const after = await page.evaluate(() => window.__playLog.length);
    expect(after).toBeGreaterThan(before);
    const log = await page.evaluate(() => window.__playLog);
    expect(log.some((src) => src.includes(`/voice/${id}.mp3`))).toBe(true);
    await page.waitForTimeout(1000);
  }
});
