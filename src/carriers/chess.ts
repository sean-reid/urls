import { Alphabet } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { WordFeed } from "./feed";
import type { Carrier } from "./types";
import { CHESS_MOVES } from "./words/chess";

const ALPHABET = new Alphabet(CHESS_MOVES);
export const STRUCTURAL = ["game", "1-0", "0-1"];

const chess: Carrier = {
	id: "chess",
	name: "Chess game",
	group: "Text",
	sample: "/game/1.e4/e5/2.Nf3/Nc6/3.Bb5/a6/4.Ba4/Nf6/5.O-O/Be7/6.Re1/b5/7.Bb3/d6/8.c3/O-O",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new WordFeed(symbols, ALPHABET, rng);
		b.push("game");
		let ply = 0;
		const prefix = () => (ply % 2 === 0 ? `${ply / 2 + 1}.` : "");
		while (!feed.done) {
			b.push(prefix() + feed.take());
			ply++;
		}
		b.fill((room) => {
			const p = prefix();
			const m = feed.fitting(room - p.length);
			if (m === null) return null;
			ply++;
			return p + m;
		});
		b.tryPush(rng.pick(["1-0", "0-1"]));
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			const v = ALPHABET.get(seg.replace(/^\d+\./, ""));
			if (v !== undefined) out.push(v);
		}
		return out;
	},
};

export default chess;
