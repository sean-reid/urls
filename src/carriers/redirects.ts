import { BASE64URL, charIndexer } from "./alphabet";
import { CharFeed } from "./feed";
import type { Carrier } from "./types";

const index = charIndexer(BASE64URL);
const MAX_DEPTH = 8;
export const STRUCTURAL: string[] = [];

function wrap(inner: string, depth: number): string {
	let s = inner;
	for (let i = 0; i < depth; i++) s = `/redirect?to=${encodeURIComponent(s)}`;
	return s;
}

const redirects: Carrier = {
	id: "redirects",
	name: "Nested redirects",
	group: "Text",
	sample:
		"/redirect?to=%2Fredirect%3Fto%3D%252Fredirect%253Fto%253D%25252Fredirect%25253Fto%25253D",
	radix: 64,
	render(symbols, target, rng) {
		const feed = new CharFeed(symbols, BASE64URL, rng);
		const data = feed.take(feed.left);
		let depth = 1;
		while (depth < MAX_DEPTH && wrap(`/r?u=${data}`, depth + 1).length <= target) depth++;
		const room = target - wrap(`/r?u=${data}`, depth).length;
		const filler = room > 0 ? rng.chars(BASE64URL, room) : "";
		return wrap(`/r?u=${data}${filler}`, depth);
	},
	parse(pathname, search) {
		let path = pathname;
		let query = search;
		for (let i = 0; i <= MAX_DEPTH; i++) {
			if (path === "/r" && query.startsWith("?u=")) {
				const out: number[] = [];
				return index(query.slice(3), out) ? out : [];
			}
			if (path !== "/redirect" || !query.startsWith("?to=")) return [];
			let inner: string;
			try {
				inner = decodeURIComponent(query.slice(4));
			} catch {
				return [];
			}
			const q = inner.indexOf("?");
			path = q < 0 ? inner : inner.slice(0, q);
			query = q < 0 ? "" : inner.slice(q);
		}
		return [];
	},
};

export default redirects;
