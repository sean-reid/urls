import { BASE36_UPPER, charIndexer } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { CharFeed } from "./feed";
import type { Carrier } from "./types";

const index = charIndexer(BASE36_UPPER);
const DATA = /^[A-Z0-9]+$/;
export const STRUCTURAL = [
	"booking",
	"pnr",
	"segment",
	"carrier",
	"flight",
	"dep",
	"arr",
	"seat",
	"class",
	"meal",
	"bag",
	"gate",
	"term",
	"eticket",
	"ffn",
	"fare",
	"status",
];

const airline: Carrier = {
	id: "airline",
	name: "Airline itinerary",
	group: "Physical",
	sample: "/booking/pnr/K7X9QL/segment/2/carrier/BA/flight/117/dep/LHR/arr/JFK/seat/34B/meal/VGML",
	radix: 36,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, BASE36_UPPER, rng);
		b.push("booking");
		b.push(`pnr/${feed.take(6)}`);
		const fields = [
			() => `segment/${feed.take(1)}`,
			() => `carrier/${feed.take(2)}`,
			() => `flight/${feed.take(rng.range(3, 4))}`,
			() => `dep/${feed.take(3)}`,
			() => `arr/${feed.take(3)}`,
			() => `seat/${feed.take(rng.range(2, 3))}`,
			() => `class/${feed.take(1)}`,
			() => `meal/${feed.take(4)}`,
			() => `bag/${feed.take(7)}`,
			() => `gate/${feed.take(rng.range(2, 3))}`,
			() => `term/${feed.take(1)}`,
			() => `eticket/${feed.take(13)}`,
			() => `ffn/${feed.take(9)}`,
			() => `fare/${feed.take(8)}`,
			() => `status/${feed.take(2)}`,
		];
		let i = 0;
		while (!feed.done) {
			b.push((fields[i % fields.length] as () => string)());
			i++;
		}
		b.fill((room) => {
			const seg = rng.pick(fields)();
			if (seg.length <= room) return seg;
			if (room >= 6) return `fare/${rng.chars(BASE36_UPPER, room - 5)}`;
			return null;
		});
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			if (!DATA.test(seg)) continue;
			index(seg, out);
		}
		return out;
	},
};

export default airline;
