import { CLIENT } from "./client";
import { esc } from "./html";
import { CSS } from "./styles";

export interface Page {
	title: string;
	description: string;
	path: string;
	body: string;
	script?: boolean;
}

export interface Site {
	origin: string;
	nonce: string;
	analyticsToken?: string;
}

const NAV = [
	["/docs", "Documentation"],
	["/pricing", "Pricing"],
];

export function layout(page: Page, site: Site): string {
	const title =
		page.path === "/" ? "URL Extension Service" : `${page.title} · URL Extension Service`;
	const nav = NAV.map(
		([href, label]) =>
			`<a href="${href}"${page.path === href ? ' aria-current="page"' : ""}>${label}</a>`,
	).join("");
	const beacon = site.analyticsToken
		? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${esc(site.analyticsToken)}"}'></script>`
		: "";
	const script = page.script ? `<script nonce="${site.nonce}">${CLIENT}</script>` : "";
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="color-scheme" content="light dark">
<link rel="canonical" href="${site.origin}${page.path}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/source-serif-4-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/source-serif-4-semibold.woff2" as="font" type="font/woff2" crossorigin>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${site.origin}${page.path}">
<meta property="og:image" content="${site.origin}/og.png">
<meta name="twitter:card" content="summary_large_image">
<style nonce="${site.nonce}">${CSS}</style>
</head>
<body>
<header><a class="name" href="/">URL Extension Service</a><nav>${nav}</nav></header>
<main>
${page.body}
</main>
<footer><p>Est. 2026. All links are final. Report misuse to <a href="mailto:abuse@dwainosaur.com">abuse@dwainosaur.com</a>.</p></footer>
${script}${beacon}
</body>
</html>
`;
}
