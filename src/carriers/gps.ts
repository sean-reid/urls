import { DIGITS } from "./alphabet";
import { PathBuilder } from "./builder";
import { CharFeed } from "./feed";
import { parseNumeric, SIGNED_DECIMAL } from "./numeric";
import type { Carrier } from "./types";

export const STRUCTURAL = ["lat", "lng", "alt", "hdg", "spd", "acc"];

const gps: Carrier = {
	id: "gps",
	name: "GPS trail",
	group: "Physical",
	sample: "/lat/51.50741/lng/-0.12780/alt/11.3/hdg/271/lat/51.50739/lng/-0.12791/alt/11.4/",
	radix: 10,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, DIGITS, rng);
		const sign = () => (rng.next() < 0.5 ? "-" : "");
		const lat = () => `lat/${sign()}${feed.take(2)}.${feed.take(5)}`;
		const lng = () => `lng/${sign()}${feed.take(rng.range(1, 3))}.${feed.take(5)}`;
		const extras = [
			() => `alt/${feed.take(rng.range(1, 4))}.${feed.take(1)}`,
			() => `hdg/${feed.take(rng.range(1, 3))}`,
			() => `spd/${feed.take(rng.range(1, 2))}.${feed.take(1)}`,
			() => `acc/${feed.take(rng.range(1, 2))}`,
		];
		while (!feed.done) {
			b.push(lat());
			b.push(lng());
			for (const e of extras) if (rng.next() < 0.5) b.push(e());
		}
		b.fill((room) => {
			const r = rng.next();
			const seg = r < 0.4 ? lat() : r < 0.8 ? lng() : rng.pick(extras)();
			if (seg.length <= room) return seg;
			if (room >= 5) return `acc/${rng.chars(DIGITS, room - 4)}`;
			return null;
		});
		return b.toString();
	},
	parse(pathname) {
		return parseNumeric(pathname, SIGNED_DECIMAL);
	},
};

export default gps;
