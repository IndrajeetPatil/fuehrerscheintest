#!/usr/bin/env node
/**
 * Renders the social sharing card (Open Graph and Twitter image) and the app
 * icons (Apple touch icon and web app manifest icons) into public/ with
 * Playwright's Chromium.
 *
 * The card follows DESIGN.md: warm paper, a Fraunces title, Hanken Grotesk
 * text, the teal accent and no shadows, with the hex sticker on the right.
 * Run `make social-card` after changing the copy, the sticker or the design
 * tokens, and commit the images.
 */

import { readFile } from "node:fs/promises";

import { chromium } from "@playwright/test";

// Open Graph's recommended 1.91:1 size.
const CARD = { width: 1200, height: 630 };

// Maskable icons keep the mark inside the central 80% safe zone, since
// launchers crop them to circles or rounded squares.
const MASKABLE_SCALE = "80%";
const ICONS = [
  { path: "public/apple-touch-icon.png", size: 180, scale: "100%" },
  { path: "public/icon-192.png", size: 192, scale: "100%" },
  { path: "public/icon-512.png", size: 512, scale: "100%" },
  { path: "public/icon-maskable-512.png", size: 512, scale: MASKABLE_SCALE },
];

const FONTS = "node_modules/@fontsource-variable";

/**
 * Inlines a font file as a data URL, so the page needs no file access.
 * @param {string} path - Font file under node_modules.
 * @returns {Promise<string>} A `data:` URL for an `@font-face` rule.
 */
async function fontUrl(path) {
  const font = await readFile(`${FONTS}/${path}`);
  return `data:font/woff2;base64,${font.toString("base64")}`;
}

const fraunces = await fontUrl(
  "fraunces/files/fraunces-latin-opsz-normal.woff2",
);
const hanken = await fontUrl(
  "hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2",
);
const favicon = await readFile("public/favicon.svg", "utf8");

// The hex sticker, inlined so the page needs no file access.
const sticker = await readFile("docs/images/logo.png", "base64");

const STYLE = `
  @font-face { font-family: Fraunces; src: url(${fraunces}) format("woff2"); font-weight: 100 900; }
  @font-face { font-family: Hanken; src: url(${hanken}) format("woff2"); font-weight: 100 900; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 100%; height: 100%; }
  body {
    background: #faf8f4; color: #201d18;
    font-family: Hanken, sans-serif;
    padding: 0 72px 0 88px;
    display: flex; align-items: center; justify-content: space-between; gap: 48px;
  }
  h1 {
    font-family: Fraunces, serif; font-weight: 700;
    font-size: 80px; line-height: 1.05; letter-spacing: -0.01em;
  }
  .rule { width: 72px; height: 4px; background: #14584d; margin: 24px 0 28px; }
  .lede { color: #5d574c; font-size: 30px; line-height: 1.45; }
  .url { color: #14584d; font-size: 24px; margin-top: 64px; }
  img { height: 470px; flex: none; }
`;

const CARD_HTML = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><style>${STYLE}</style></head>
<body>
  <div>
    <h1>Führerscheintest</h1>
    <div class="rule"></div>
    <p class="lede">Theorieprüfung · Driving theory test<br>Deutsch und Englisch · German and English</p>
    <p class="url">www.indrapatil.com/fuehrerscheintest</p>
  </div>
  <img alt="" src="data:image/png;base64,${sticker}">
</body></html>`;

/**
 * A page that draws the favicon on a full-bleed paper background.
 * @param {string} scale - Size of the mark relative to the icon.
 * @returns {string} The icon page.
 */
function iconHtml(scale) {
  return `<!doctype html>
<html><head><style>
  * { margin: 0; }
  body {
    background: #faf8f4; width: 100vw; height: 100vh;
    display: grid; place-items: center;
  }
  svg { display: block; width: ${scale}; height: ${scale}; }
</style></head><body>${favicon}</body></html>`;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: CARD });
  await page.setContent(CARD_HTML);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({ path: "public/social-card.png" });

  for (const { path, size, scale } of ICONS) {
    // Each icon reuses the page, so they render one after another.
    // oxlint-disable-next-line no-await-in-loop
    await page.setViewportSize({ width: size, height: size });
    // oxlint-disable-next-line no-await-in-loop
    await page.setContent(iconHtml(scale));
    // oxlint-disable-next-line no-await-in-loop
    await page.screenshot({ path });
  }
} finally {
  await browser.close();
}
console.log("Wrote the social card and app icons to public/");
