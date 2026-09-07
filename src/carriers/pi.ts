import { DIGITS } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { CharFeed } from "./feed";
import { PLAIN, parseNumeric } from "./numeric";
import type { Carrier } from "./types";
import { PI_DIGITS } from "./words/pi";

const LEAD = 11;
const HEAD = `3.${PI_DIGITS.slice(1, LEAD)}`;
export const STRUCTURAL = ["pi", HEAD];

const pi: Carrier = {
	id: "pi",
	name: "Digits of pi",
	group: "Data",
	sample: "/pi/3.1415926535/8979323846/2643383279/5028841971/6939937510/5820974944/",
	radix: 10,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, DIGITS, rng);
		b.push("pi");
		b.push(HEAD);
		while (!feed.done) b.push(feed.take(Math.min(feed.left, rng.range(5, 12))));
		let pos = LEAD;
		b.fill((room) => {
			const n = Math.min(room, rng.range(5, 12));
			const s = PI_DIGITS.slice(pos, pos + n);
			pos += n;
			return s.length ? s : null;
		});
		return b.toString();
	},
	parse(pathname) {
		const segs = segments(pathname);
		if (segs[0] !== "pi" || segs[1] !== HEAD) return [];
		return parseNumeric(`/${segs.slice(2).join("/")}`, PLAIN);
	},
};

export default pi;
