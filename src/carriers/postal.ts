import { DIGITS } from "./alphabet";
import { PathBuilder } from "./builder";
import { CharFeed } from "./feed";
import { PLAIN, parseNumeric } from "./numeric";
import type { Carrier } from "./types";

const COUNTRIES = ["GB", "US", "DE", "FR", "NL", "SE", "JP", "AU", "CA", "IE"];
const REGIONS = [
	"greater-london",
	"bavaria",
	"new-south-wales",
	"ile-de-france",
	"north-holland",
	"ontario",
	"kanto",
	"scania",
	"leinster",
	"california",
];
const DISTRICTS = [
	"westminster",
	"camden",
	"mitte",
	"le-marais",
	"jordaan",
	"downtown",
	"shibuya",
	"vastra-hamnen",
	"dublin-2",
	"soma",
];
const STREETS = [
	"high-street",
	"station-road",
	"main-street",
	"church-lane",
	"market-square",
	"king-street",
	"queen-street",
	"park-avenue",
	"mill-lane",
	"bridge-road",
];
const POSTCODES = [
	"SW1A-1AA",
	"EC2A-4NE",
	"W1D-3QU",
	"N1-9GU",
	"1016-GD",
	"M5V-3L9",
	"D02-X285",
	"2000-NSW",
	"150-0002-JP",
	"94103-CA",
];
const WINGS = ["east", "west", "north", "south", "annex", "tower-a", "tower-b"];
const NUMERIC = [
	"building",
	"floor",
	"room",
	"desk",
	"locker",
	"bay",
	"suite",
	"unit",
	"level",
	"box",
	"shelf",
	"bin",
	"lot",
	"gate",
	"pier",
	"berth",
	"cabinet",
	"drawer",
];
export const STRUCTURAL = [
	"country",
	"region",
	"district",
	"postcode",
	"street",
	"wing",
	"zone",
	...NUMERIC,
	...COUNTRIES,
	...REGIONS,
	...DISTRICTS,
	...STREETS,
	...POSTCODES,
	...WINGS,
];

const postal: Carrier = {
	id: "postal",
	name: "Postal address",
	group: "Physical",
	sample:
		"/country/GB/region/greater-london/postcode/SW1A-1AA/building/1/floor/3/wing/east/desk/47",
	radix: 10,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, DIGITS, rng);
		b.push(`country/${rng.pick(COUNTRIES)}`);
		b.push(`region/${rng.pick(REGIONS)}`);
		if (rng.next() < 0.6) b.push(`district/${rng.pick(DISTRICTS)}`);
		b.push(`postcode/${rng.pick(POSTCODES)}`);
		if (rng.next() < 0.6) b.push(`street/${rng.pick(STREETS)}`);
		const field = () => `${rng.pick(NUMERIC)}/${feed.take(rng.range(1, 4))}`;
		let run = rng.range(3, 6);
		while (!feed.done) {
			b.push(field());
			if (--run === 0) {
				b.push(rng.next() < 0.5 ? `wing/${rng.pick(WINGS)}` : `zone/${rng.pick([..."abcdefgh"])}`);
				run = rng.range(3, 6);
			}
		}
		b.fill((room) => {
			const seg = field();
			if (seg.length <= room) return seg;
			if (room >= 5) return `box/${rng.chars(DIGITS, room - 4)}`;
			return null;
		});
		return b.toString();
	},
	parse(pathname) {
		return parseNumeric(pathname, PLAIN);
	},
};

export default postal;
