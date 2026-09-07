import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const BASE = "https://urls.dwainosaur.com";

describe("pages", () => {
	it("serves the home page with a nonce-locked csp and every style", async () => {
		const res = await SELF.fetch(`${BASE}/`);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/html");
		const csp = res.headers.get("content-security-policy") ?? "";
		const nonce = /script-src 'nonce-([^']+)'/.exec(csp)?.[1];
		expect(nonce).toBeTruthy();
		const html = await res.text();
		expect(html).toContain(`<script nonce="${nonce}">`);
		expect(html).toContain(`<style nonce="${nonce}">`);
		expect(html.match(/name="style"/g)?.length).toBe(18);
		expect(html).toContain('value="enterprise" checked');
		expect(html).toContain('value="1000" checked');
		expect(html).not.toContain("cloudflareinsights");
		expect(html.length).toBeLessThan(16000);
	});

	it("serves docs, pricing, and a styled 404", async () => {
		for (const [path, text] of [
			["/docs", "Acceptable use"],
			["/pricing", "Contact sales"],
		]) {
			const res = await SELF.fetch(`${BASE}${path}`);
			expect(res.status).toBe(200);
			expect(await res.text()).toContain(text);
		}
		const missing = await SELF.fetch(`${BASE}/nothing/to/see`);
		expect(missing.status).toBe(404);
		expect(await missing.text()).toContain("could not be resolved");
		const reserved = await SELF.fetch(`${BASE}/api/v2/whatever`);
		expect(reserved.status).toBe(404);
	});

	it("rejects unsupported methods", async () => {
		expect((await SELF.fetch(`${BASE}/docs`, { method: "POST" })).status).toBe(405);
		expect((await SELF.fetch(`${BASE}/`, { method: "DELETE" })).status).toBe(405);
		expect((await SELF.fetch(`${BASE}/api/v1/extend`, { method: "PUT" })).status).toBe(405);
	});
});

describe("form", () => {
	it("renders a result without javascript", async () => {
		const body = new URLSearchParams({ url: "example.com/x", style: "chess", length: "500" });
		const res = await SELF.fetch(`${BASE}/`, { method: "POST", body, headers: { "content-type": "application/x-www-form-urlencoded" } });
		expect(res.status).toBe(200);
		const html = await res.text();
		const m = /<p class="url" id="out">([^<]+)<\/p>/.exec(html);
		expect(m).toBeTruthy();
		const link = (m as RegExpExecArray)[1] as string;
		expect(link.startsWith(`${BASE}/game/1.`)).toBe(true);
		expect(link.length).toBeLessThanOrEqual(500);
		expect(html).toContain('value="chess" checked');
		expect(html).toContain('value="500" checked');
		expect(html).toContain('value="example.com/x"');
	});

	it("keeps the exact length choice and shows errors", async () => {
		const body = new URLSearchParams({ url: "http://localhost/", style: "hex", length: "exact", exact: "333" });
		const res = await SELF.fetch(`${BASE}/`, { method: "POST", body, headers: { "content-type": "application/x-www-form-urlencoded" } });
		expect(res.status).toBe(400);
		const html = await res.text();
		expect(html).toContain('id="exact" checked');
		expect(html).toContain('value="333"');
		expect(html).toContain("not reachable from the public internet");
	});
});

describe("api", () => {
	it("extends via GET with defaults and the link redirects", async () => {
		const res = await SELF.fetch(`${BASE}/api/v1/extend?url=https://example.com/a?b=c`);
		expect(res.status).toBe(200);
		expect(res.headers.get("access-control-allow-origin")).toBe("*");
		const body = (await res.json()) as Record<string, unknown>;
		expect(body.style).toBe("enterprise");
		expect(body.requested_length).toBe(1000);
		expect(body.minimum).toBe(false);
		expect(body.length).toBe((body.url as string).length);
		expect(body.length).toBeLessThanOrEqual(1000);
		expect(body.length).toBeGreaterThan(950);

		const follow = await SELF.fetch(body.url as string, { redirect: "manual" });
		expect(follow.status).toBe(301);
		expect(follow.headers.get("location")).toBe("https://example.com/a?b=c");
		expect(follow.headers.get("cache-control")).toContain("immutable");
		expect(follow.headers.get("x-robots-tag")).toBe("noindex");
	});

	it("extends via POST json for every style", async () => {
		const styles = (await (await SELF.fetch(`${BASE}/api/v1/styles`)).json()) as { id: string }[];
		expect(styles.length).toBe(18);
		for (const { id } of styles) {
			const res = await SELF.fetch(`${BASE}/api/v1/extend`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ url: "https://en.wikipedia.org/wiki/URL", style: id, length: 2000 }),
			});
			expect(res.status, id).toBe(200);
			const body = (await res.json()) as { url: string; length: number };
			expect(body.length, id).toBeLessThanOrEqual(2000);
			expect(body.length, id).toBeGreaterThan(1950);
			const follow = await SELF.fetch(body.url, { redirect: "manual" });
			expect(follow.status, id).toBe(301);
			expect(follow.headers.get("location"), id).toBe("https://en.wikipedia.org/wiki/URL");
		}
	});

	it("reports minimum when the destination needs more room", async () => {
		const long = `https://example.com/${"y".repeat(300)}`;
		const res = await SELF.fetch(`${BASE}/api/v1/extend?url=${encodeURIComponent(long)}&length=100&style=hex`);
		const body = (await res.json()) as { minimum: boolean; length: number };
		expect(body.minimum).toBe(true);
		expect(body.length).toBeGreaterThan(100);
	});

	it.each([
		["?url=", "Enter a URL."],
		["?url=ftp://x.com", "Only http and https"],
		["?url=https://example.com&style=nope", "Unknown style."],
		["?url=https://example.com&length=50", "Length must be"],
		["?url=https://example.com&length=2001", "Length must be"],
		["?url=https://example.com&length=abc", "Length must be"],
		["?url=https://urls.dwainosaur.com/x", "cannot be extended further"],
	])("rejects %s", async (query, message) => {
		const res = await SELF.fetch(`${BASE}/api/v1/extend${query}`);
		expect(res.status).toBe(400);
		expect(((await res.json()) as { error: string }).error).toContain(message);
	});

	it("rejects a post without a usable body and answers preflight", async () => {
		const res = await SELF.fetch(`${BASE}/api/v1/extend`, { method: "POST", body: "x" });
		expect(res.status).toBe(400);
		const pre = await SELF.fetch(`${BASE}/api/v1/extend`, { method: "OPTIONS" });
		expect(pre.status).toBe(204);
		expect(pre.headers.get("access-control-allow-methods")).toContain("POST");
	});
});
