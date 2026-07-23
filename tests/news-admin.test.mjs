import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeHtml } from "../cloudflare/news-admin/src/index.js";

test("sanitizes editor HTML before publication", () => {
  const result = sanitizeHtml(`
    <script>alert("x")</script>
    <p onclick="steal()">Hello <strong>Freyr</strong></p>
    <a href="javascript:alert(1)">unsafe</a>
    <a href="https://freyr-ai.com/news">safe</a>
    <img src="javascript:alert(1)" onerror="steal()">
  `);

  assert.doesNotMatch(result, /<script|onclick|javascript:|onerror/i);
  assert.match(result, /<p>Hello <strong>Freyr<\/strong><\/p>/);
  assert.match(result, /href="https:\/\/freyr-ai\.com\/news"/);
});
