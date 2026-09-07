import { charIndexer, HEX } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { CharFeed } from "./feed";
import type { Carrier } from "./types";

const index = charIndexer(HEX);
export const STRUCTURAL = [
	"documents",
	"objects",
	"records",
	"revisions",
	"attachments",
	"blobs",
	"refs",
	"nodes",
	"versions",
	"trees",
	"commits",
	"snapshots",
];
const DATA = /^[0-9a-f-]{8,}$/;

function uuid(feed: CharFeed): string {
	return [feed.take(8), feed.take(4), feed.take(4), feed.take(4), feed.take(12)].join("-");
}

const identifiers: Carrier = {
	id: "identifiers",
	name: "Identifier chains",
	group: "Infrastructure",
	sample:
		"/documents/8f3e2c9d-1b04-4f7a-6e5d-3c2b1a0f9e8d/revisions/0f9e8d7c6b5a4f3e2c9d1b04f7a6e5d3c2b1a0f9",
	radix: 16,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, HEX, rng);
		const shape = (f: CharFeed) => {
			const r = rng.next();
			if (r < 0.5) return uuid(f);
			if (r < 0.75) return f.take(40);
			if (r < 0.9) return f.take(64);
			return f.take(12);
		};
		while (!feed.done) {
			b.push(rng.pick(STRUCTURAL));
			b.push(shape(feed));
		}
		b.fill((room) => {
			const word = rng.pick(STRUCTURAL);
			const id = shape(feed);
			const pair = `${word}/${id}`;
			if (pair.length <= room) return pair;
			if (room >= 8) return rng.chars(HEX, Math.min(room, 40));
			return null;
		});
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			if (!DATA.test(seg)) continue;
			if (!index(seg.replaceAll("-", ""), out)) return [];
		}
		return out;
	},
};

export default identifiers;
