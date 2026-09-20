import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

const pages = ["/", "/rm-digital"];

test("every image has alt text and intrinsic dimensions, and its file ships in the export", async () => {
  for (const path of pages) {
    const html = await render(path);
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
    assert.ok(images.length > 0, `${path} renders images`);
    for (const tag of images) {
      assert.match(tag, /\balt="/, `${path}: image without alt: ${tag}`);
      assert.match(tag, /\bwidth="\d+"/, `${path}: image without width: ${tag}`);
      assert.match(tag, /\bheight="\d+"/, `${path}: image without height: ${tag}`);
      const [, src] = tag.match(/\bsrc="([^"]+)"/);
      await access(new URL(`../out${src}`, import.meta.url));
    }
  }
});

test("logos are served from the trimmed web derivatives, not the oversized originals", async () => {
  for (const path of pages) {
    const html = await render(path);
    const sources = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
    for (const src of sources) assert.match(src, /^\/brand\/web\/[a-z-]+\.png$/, `${path}: ${src}`);
  }
});

test("the header has primary navigation and a mobile menu control", async () => {
  const html = await render();
  assert.match(html, /<nav[^>]*aria-label="Primary"/);
  const toggle = html.match(/<button\b[^>]*class="nav-toggle"[^>]*>/)?.[0] ?? "";
  assert.match(toggle, /aria-controls="site-nav"/);
  assert.match(toggle, /aria-expanded="false"/);
  assert.match(html, /<nav id="site-nav"/);
  assert.match(html, /<nav[^>]*aria-label="Footer"/);
});

test("the group business cards show every unit logo once", async () => {
  const html = await render();
  for (const id of ["rm-digital-reversed", "rm-mobility", "rm-capital", "rm-industrial", "rm-risk"]) {
    assert.match(html, new RegExp(`/brand/web/${id}\\.png`));
  }
  for (const name of ["FleetOrbit", "Shopping Lyst", "OpenWheels", "Orbit eDrive"]) assert.match(html, new RegExp(name));
});
