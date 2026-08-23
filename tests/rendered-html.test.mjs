import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const relative = path === "/" ? "../out/index.html" : `../out${path}/index.html`;
  return readFile(new URL(relative, import.meta.url), "utf8");
}

test("renders the RM & Co. holding-company site", async () => {
  const html = await render();
  assert.match(html, /RM &amp; Co\./);
  assert.match(html, /RM Digital/);
  assert.match(html, /RM Capital/);
  assert.match(html, /RM Industrial/);
  assert.match(html, /RM Mobility/);
  assert.match(html, /Field Force/);
  assert.match(html, /social-preview\.png/);
  assert.doesNotMatch(html, /Holding Africa/);
  assert.doesNotMatch(html, /RM Agriculture|RM Energy|RM Property|RM Ventures|RM Foundation/);
  assert.doesNotMatch(html, /Your site is taking shape|SkeletonPreview/);
});

test("renders the RM Digital business page", async () => {
  const html = await render("/rm-digital");
  assert.match(html, /<h1>Data\. Intelligence\. Impact\.<\/h1>/);
  assert.match(html, /Field Force/);
  assert.match(html, /subsidiary of RM &amp; Co\./i);
});
