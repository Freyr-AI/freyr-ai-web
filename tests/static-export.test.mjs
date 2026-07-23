import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

test("exports a deployable static homepage", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");

  assert.match(html, /<title>Freyr AI — Accelerated AI Infrastructure<\/title>/i);
  assert.match(html, /TRANSFORM/);
  assert.match(html, /POWER INTO INTELLIGENCE/);
  assert.match(html, /BUILD, FINANCE AND OPERATE/);
  assert.match(html, /FreyrAI Locations/);
  assert.match(html, /1536/);
  assert.match(html, /NVIDIA REFERENCE ARCHITECTURE/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("exports the homepage assets", async () => {
  await Promise.all([
    access(new URL("_next/", outputRoot)),
    access(new URL("favicon.svg", outputRoot)),
  ]);
});
