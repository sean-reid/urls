import { Alphabet } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { WordFeed } from "./feed";
import type { Carrier } from "./types";
import { COUNTDOWN_WORDS } from "./words/countdown";

const ALPHABET = new Alphabet(COUNTDOWN_WORDS);
export const STRUCTURAL: string[] = [];

const countdown: Carrier = {
	id: "countdown",
	name: "Reassurance",
	group: "Text",
	sample: "/almost/there/almost/there/one/more/segment/nearly/done/just/kidding/almost/there/",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new WordFeed(symbols, ALPHABET, rng);
		while (!feed.done) b.push(feed.take());
		b.fill((room) => feed.fitting(room));
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			const v = ALPHABET.get(seg);
			if (v !== undefined) out.push(v);
		}
		return out;
	},
};

export default countdown;
