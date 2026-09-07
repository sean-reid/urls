import { DIGITS } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { CharFeed } from "./feed";
import { parseNumeric } from "./numeric";
import type { Carrier } from "./types";

const ZONES = [
	"UTC",
	"GMT",
	"EDT",
	"EST",
	"PDT",
	"PST",
	"CET",
	"CEST",
	"BST",
	"IST",
	"JST",
	"AEST",
	"HKT",
	"SGT",
	"MSK",
	"EET",
];
export const STRUCTURAL = ["t", ...ZONES];
const FRACTION = /^\d{9,30}$/;
const pad = (n: number) => String(n).padStart(2, "0");

const timestamps: Carrier = {
	id: "timestamps",
	name: "Timestamps",
	group: "Data",
	sample: "/t/2026/09/07/14/32/07/183442019/UTC/2026/09/07/10/32/07/551209377/EDT/",
	radix: 10,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, DIGITS, rng);
		b.push("t");
		const stamp = (frac: string) =>
			[
				rng.range(2019, 2026),
				pad(rng.range(1, 12)),
				pad(rng.range(1, 28)),
				pad(rng.range(0, 23)),
				pad(rng.range(0, 59)),
				pad(rng.range(0, 59)),
				frac,
				rng.pick(ZONES),
			].join("/");
		while (!feed.done) b.push(stamp(feed.take(rng.pick([9, 12, 15]))));
		b.fill((room) => {
			const s = stamp(rng.chars(DIGITS, rng.pick([9, 12, 15])));
			if (s.length <= room) return s;
			if (room >= 9) return rng.chars(DIGITS, Math.min(room, 30));
			return null;
		});
		return b.toString();
	},
	parse(pathname) {
		const segs = segments(pathname);
		if (segs[0] !== "t") return [];
		return parseNumeric(pathname, FRACTION);
	},
};

export default timestamps;
