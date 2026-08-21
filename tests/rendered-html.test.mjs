import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the RM & Co. holding-company site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /RM &amp; Co\./);
  assert.match(html, /Building enduring enterprises/);
  assert.match(html, /RM Digital/);
  assert.match(html, /Field Force/);
  assert.match(html, /social-preview\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|SkeletonPreview/);
});

test("renders the RM Digital business page", async () => {
  const response = await render("/rm-digital");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1>RM Digital<\/h1>/);
  assert.match(html, /Field Force/);
  assert.match(html, /subsidiary of RM &amp; Co\./i);
});
