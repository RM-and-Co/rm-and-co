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
  assert.match(html, /<h1[^>]*>Data\. Intelligence\. <em>Impact\.<\/em><\/h1>/);
  assert.match(html, /Field Force/);
  assert.match(html, /business line of RM &amp; Co\./i);
});

const pages = ["/", "/about", "/businesses", "/rm-digital", "/rm-mobility", "/rm-risk", "/contact"];

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
    for (const src of sources.filter(src => src.startsWith("/brand/"))) assert.match(src, /^\/brand\/web\/[a-z-]+\.png$/, `${path}: ${src}`);
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

test("the businesses page shows every unit logo", async () => {
  const html = await render("/businesses");
  for (const id of ["rm-digital", "rm-mobility", "rm-capital", "rm-industrial", "rm-risk"]) {
    assert.match(html, new RegExp(`/brand/web/${id}\\.png`));
  }
});

test("the RM Digital page lists the owned businesses", async () => {
  const html = await render("/rm-digital");
  for (const name of ["FleetOrbit", "Shopping Lyst", "OpenWheels", "Orbit eDrive"]) assert.match(html, new RegExp(name));
});

test("RM Risk and RM Mobility have their own pages with every service line", async () => {
  const risk = await render("/rm-risk");
  assert.match(risk, /Launching soon/);
  for (const line of ["Enterprise Risk Management", "Operational Risk &amp; Controls", "Governance, Risk &amp; Compliance \\(GRC\\)", "Insurance &amp; Claims Advisory", "Fleet, Asset &amp; Mobility Risk", "Supplier &amp; Contract Risk", "Health, Safety &amp; Environmental Risk", "Business Continuity &amp; Crisis Readiness"]) {
    assert.match(risk, new RegExp(line));
  }
  const mobility = await render("/rm-mobility");
  for (const line of ["Rent-to-Own Vehicles", "Full Maintenance Leasing", "Operating Rentals", "Managed Maintenance", "Fleet Audits", "Fleet Inspections", "Fleet Assessment Reporting"]) {
    assert.match(mobility, new RegExp(line));
  }
});

test("every page has exactly one h1 and is linked from the primary navigation", async () => {
  for (const path of pages) {
    const html = await render(path);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${path} has one h1`);
  }
  const home = await render();
  for (const href of ["/about", "/businesses", "/rm-digital", "/rm-mobility", "/rm-risk", "/contact"]) {
    assert.match(home, new RegExp(`href="${href}/?"`));
  }
});


test("RM Industrial links to a complete Egoli operations demo", async () => {
  const html = await render("/businesses");
  assert.match(html, /href="\/businesses\/rm-industrial\/egoli\/"/);
  const base = new URL("../out/businesses/rm-industrial/egoli/", import.meta.url);
  const demo = await readFile(new URL("index.html", base), "utf8");
  assert.match(demo, /Egoli Operations Studio/);
  assert.doesNotMatch(demo, /Private client demo/);
  for (const file of ["app.mjs", "model.mjs", "visuals.mjs", "style.css", "assets/egoli-logo.jpeg", "assets/egoli-gin-botanicals.jpeg", "assets/egoli-gin-outdoors.jpeg"]) await access(new URL(file, base));
});
