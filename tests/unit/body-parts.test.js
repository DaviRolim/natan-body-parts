import { test } from "node:test";
import assert from "node:assert/strict";
import { BODY_PARTS } from "../../src/body-parts.js";

test("BODY_PARTS exports five body parts", () => {
  assert.ok(Array.isArray(BODY_PARTS));
  assert.equal(BODY_PARTS.length, 5);
});

test("expected body part ids are present", () => {
  const ids = BODY_PARTS.map((part) => part.id).sort();
  assert.deepEqual(ids, ["ears", "eyes", "hair", "mouth", "nose"]);
});

test("each body part has valid geometry and voice data", () => {
  for (const part of BODY_PARTS) {
    assert.equal(typeof part.id, "string");
    assert.equal(typeof part.englishWord, "string");
    assert.equal(typeof part.voicePath, "string");
    assert.ok(part.voicePath.endsWith(`${part.id}.mp3`));
    for (const key of ["left", "top", "width", "height"]) {
      assert.equal(typeof part.zone[key], "number", `${part.id}.zone.${key}`);
      assert.ok(part.zone[key] >= 0 && part.zone[key] <= 100);
    }
    for (const key of ["left", "top", "width", "height"]) {
      assert.equal(typeof part.highlight[key], "number", `${part.id}.highlight.${key}`);
      assert.ok(part.highlight[key] >= 0 && part.highlight[key] <= 100);
    }
  }
});

test("body part ids are unique", () => {
  const ids = BODY_PARTS.map((part) => part.id);
  assert.equal(new Set(ids).size, ids.length);
});
