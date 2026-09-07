import { charIndexer, HEX } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { CharFeed } from "./feed";
import type { Carrier } from "./types";

const index = charIndexer(HEX);
const CHUNKS = [8, 12, 16, 16, 24, 32, 32, 40, 64];

const hex: Carrier = {
	id: "hex",
	name: "Raw encoding",
	group: "Infrastructure",
	sample: "/a8f3e2c9/d1b04f7a6e5d3c2b1a0f9e8d7c6b5a4f/3e2c9d1b04f7a6e5d3c2b1a0f9e8d7c6b5a4f3e2c9",
	radix: 16,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, HEX, rng);
		while (!feed.done) b.push(feed.take(Math.min(feed.left, rng.pick(CHUNKS))));
		b.fill((room) => {
			const n = rng.pick(CHUNKS);
			return rng.chars(HEX, Math.min(n, room));
		});
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) if (!index(seg, out)) return [];
		return out;
	},
};

export default hex;
