import { Alphabet } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { WordFeed } from "./feed";
import type { Carrier } from "./types";
import { ENTERPRISE_WORDS } from "./words/enterprise";

const ALPHABET = new Alphabet(ENTERPRISE_WORDS);
const REGIONS = [
	"us-east-1",
	"us-east-2",
	"us-west-2",
	"eu-west-1",
	"eu-central-1",
	"ap-southeast-2",
];
export const STRUCTURAL = [
	"platform",
	"v1",
	"v2",
	"v3",
	"regions",
	"tenants",
	"api",
	"internal",
	...REGIONS,
];

const enterprise: Carrier = {
	id: "enterprise",
	name: "Enterprise path",
	group: "Infrastructure",
	sample: "/platform/v3/regions/us-east-2/tenants/tnt-4f9a1c/resources/allocations/",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new WordFeed(symbols, ALPHABET, rng);
		b.push("platform");
		b.push(rng.pick(["v3", "v2", "v1"]));
		if (rng.next() < 0.7) {
			b.push("regions");
			b.push(rng.pick(REGIONS));
		}
		const structural = () =>
			rng.pick([
				() => [
					rng.pick(["tenants", "tenants", "internal"]),
					`tnt-${rng.chars("0123456789abcdef", 6)}`,
				],
				() => ["regions", rng.pick(REGIONS)],
				() => [rng.pick(["v2", "v3", "api", "internal"])],
			])();
		let run = rng.range(2, 5);
		while (!feed.done) {
			b.push(feed.take());
			if (--run === 0) {
				for (const s of structural()) b.push(s);
				run = rng.range(2, 5);
			}
		}
		b.fill((room) => {
			if (rng.next() < 0.15) {
				const s = structural().join("/");
				if (s.length <= room) return s;
			}
			return feed.fitting(room);
		});
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

export default enterprise;
