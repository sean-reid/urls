import { describe, expect, it } from "vitest";
import { CARRIERS, GROUPS } from "../../src/carriers";
import { STRUCTURAL as airline } from "../../src/carriers/airline";
import { STRUCTURAL as chess } from "../../src/carriers/chess";
import { STRUCTURAL as countdown } from "../../src/carriers/countdown";
import { STRUCTURAL as dna } from "../../src/carriers/dna";
import { STRUCTURAL as enterprise } from "../../src/carriers/enterprise";
import { STRUCTURAL as filesystem } from "../../src/carriers/filesystem";
import { STRUCTURAL as gps } from "../../src/carriers/gps";
import { STRUCTURAL as identifiers } from "../../src/carriers/identifiers";
import { STRUCTURAL as java } from "../../src/carriers/java";
import { STRUCTURAL as legalese } from "../../src/carriers/legalese";
import { STRUCTURAL as pi } from "../../src/carriers/pi";
import { STRUCTURAL as postal } from "../../src/carriers/postal";
import { STRUCTURAL as redirects } from "../../src/carriers/redirects";
import { STRUCTURAL as standards } from "../../src/carriers/standards";
import { STRUCTURAL as timestamps } from "../../src/carriers/timestamps";
import { FILLER_KEYS } from "../../src/carriers/tracking";
import { STRUCTURAL as windows } from "../../src/carriers/windows";
import { Rng } from "../../src/codec/rng";
import { extend, isReserved, MAX_LENGTH, MIN_LENGTH, resolve } from "../../src/extend";

const ORIGIN = "https://urls.dwainosaur.com";
const STRUCTURAL: Record<string, string[]> = {
	airline,
	chess,
	countdown,
	dna,
	enterprise,
	filesystem,
	gps,
	identifiers,
	java,
	legalese,
	pi,
	postal,
	redirects,
	standards,
	timestamps,
	windows,
	hex: [],
	tracking: FILLER_KEYS,
};

function randomDestination(rng: Rng): string {
	const hosts = [
		"example.com",
		"en.wikipedia.org",
		"github.com",
		"news.ycombinator.com",
		"www.bbc.co.uk",
		"xn--r8jz45g.jp",
	];
	const words = [
		"wiki",
		"Special",
		"path",
		"very-long-segment",
		"a",
		"index.html",
		"2024",
		"q",
		"User%20Name",
		"caf%C3%A9",
	];
	let url = `${rng.pick(["https", "http"])}://${rng.pick(hosts)}`;
	for (let i = rng.int(6); i > 0; i--) url += `/${rng.pick(words)}`;
	if (rng.next() < 0.5)
		url += `?q=${rng.chars("abcxyz0189", rng.range(1, 30))}&page=${rng.int(99)}`;
	if (rng.next() < 0.3) url += `#section-${rng.int(20)}`;
	return url;
}

// What a browser sends after parsing the string a user pasted.
function browserView(url: string): { pathname: string; search: string; href: string } {
	const u = new URL(url);
	return { pathname: u.pathname, search: u.search, href: u.href };
}

describe("carriers", () => {
	it("registers eighteen carriers with unique ids in known groups", () => {
		expect(CARRIERS.length).toBe(18);
		expect(new Set(CARRIERS.map((c) => c.id)).size).toBe(18);
		for (const c of CARRIERS) {
			expect(GROUPS).toContain(c.group);
			expect(c.sample.startsWith("/")).toBe(true);
			expect(STRUCTURAL).toHaveProperty(c.id);
		}
	});

	for (const c of CARRIERS) {
		describe(c.id, () => {
			it("round-trips random destinations at random lengths", () => {
				const rng = new Rng(c.id.length * 1000 + 1);
				for (let i = 0; i < 300; i++) {
					const dest = randomDestination(rng);
					const target = rng.range(MIN_LENGTH, MAX_LENGTH);
					const out = extend(dest, c, target, ORIGIN, rng);
					const view = browserView(out.url);
					expect(view.href, `normalization changed ${out.url}`).toBe(out.url);
					expect(view.pathname.length + view.search.length, out.url).toBeGreaterThan(0);
					expect(c.parse(view.pathname, view.search).length).toBeGreaterThan(0);
					expect(resolve(view.pathname, view.search), out.url).toBe(dest);
					expect(out.length).toBe(out.url.length);
					if (!out.minimum) {
						expect(out.length).toBeLessThanOrEqual(target);
						expect(out.length, `${out.url} is far short of ${target}`).toBeGreaterThan(target - 48);
					}
				}
			});

			it("hits the maximum length closely and never exceeds it", () => {
				const rng = new Rng(99);
				for (let i = 0; i < 20; i++) {
					const out = extend("https://example.com/", c, MAX_LENGTH, ORIGIN, rng);
					expect(out.length).toBeLessThanOrEqual(MAX_LENGTH);
					expect(out.length).toBeGreaterThan(MAX_LENGTH - 48);
				}
			});

			it("returns the shortest valid link when the target is too small", () => {
				const rng = new Rng(5);
				const dest = `https://example.com/${"x".repeat(400)}`;
				const out = extend(dest, c, MIN_LENGTH, ORIGIN, rng);
				expect(out.minimum).toBe(true);
				const view = browserView(out.url);
				expect(resolve(view.pathname, view.search)).toBe(dest);
			});

			it("never starts with a reserved path", () => {
				const rng = new Rng(11);
				for (let i = 0; i < 100; i++) {
					const out = extend(
						randomDestination(rng),
						c,
						rng.range(MIN_LENGTH, MAX_LENGTH),
						ORIGIN,
						rng,
					);
					expect(isReserved(new URL(out.url).pathname), out.url).toBe(false);
				}
			});

			it("keeps structural vocabulary out of the data alphabet", () => {
				const rng = new Rng(3);
				const out = extend("https://example.com/", c, 600, ORIGIN, rng);
				const view = browserView(out.url);
				const baseline = c.parse(view.pathname, view.search);
				for (const word of STRUCTURAL[c.id] as string[]) {
					const withWord = c.parse(`${view.pathname}/${encodeURIComponent(word)}`, view.search);
					expect(withWord, `${word} parsed as data`).toEqual(baseline);
				}
			});

			it("uses only characters that are safe in a URL", () => {
				const rng = new Rng(8);
				const out = extend(randomDestination(rng), c, 1500, ORIGIN, rng);
				expect(out.url).toMatch(/^[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/);
				expect(out.url).not.toContain("#");
			});
		});
	}
});

describe("resolve", () => {
	it("returns null for unknown paths", () => {
		expect(resolve("/nothing/here", "")).toBeNull();
		expect(resolve("/", "")).toBeNull();
		expect(resolve("/platform/v3/accounts", "")).toBeNull();
		expect(resolve("/c", "?sid=abc")).toBeNull();
		expect(resolve("/redirect", "?to=%")).toBeNull();
	});

	it("survives a trailing slash", () => {
		const out = extend("https://example.com/a", CARRIERS[0] as never, 500, ORIGIN, new Rng(1));
		const u = new URL(`${out.url}/`);
		expect(resolve(u.pathname, u.search)).toBe("https://example.com/a");
	});
});
