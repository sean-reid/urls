// Renders public/og.png from an inline template. Run with `pnpm og`.
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const regular = readFileSync("public/fonts/source-serif-4-regular.woff2").toString("base64");
const semibold = readFileSync("public/fonts/source-serif-4-semibold.woff2").toString("base64");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:S;src:url(data:font/woff2;base64,${regular});font-weight:400}
@font-face{font-family:S;src:url(data:font/woff2;base64,${semibold});font-weight:600}
html,body{margin:0;width:1200px;height:630px;background:#f4f1ea;color:#171512;font-family:S,Georgia,serif}
.page{position:absolute;inset:0;padding:72px 84px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #171512;padding-bottom:22px;font-size:28px}
.top b{font-weight:600}
h1{font-size:88px;font-weight:600;letter-spacing:-.015em;line-height:1.05;margin:0}
p{font-size:34px;color:#6b665d;margin:26px 0 0;line-height:1.3}
.rule{font-family:ui-monospace,Menlo,monospace;font-size:20px;color:#6b665d;white-space:nowrap;overflow:hidden;border-top:1px solid #cfc9bd;padding-top:20px}
</style></head><body><div class="page">
<div class="top"><b>URL Extension Service</b><span>urls.dwainosaur.com</span></div>
<div><h1>Longer URLs,<br>on request.</h1><p>Extends a URL to a specified length. Extended URLs resolve to their destination indefinitely.</p></div>
<div class="rule">/platform/v3/regions/us-east-2/tenants/tnt-4f9a1c/resources/allocations/entitlements/lifecycles/provisions/federations/observations/</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 1,
});
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og.png", type: "png" });
await browser.close();
console.log("wrote public/og.png");
