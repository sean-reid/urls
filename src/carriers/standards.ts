import { DIGITS } from "./alphabet";
import { PathBuilder } from "./builder";
import { CharFeed } from "./feed";
import { DOTTED, parseNumeric } from "./numeric";
import type { Carrier } from "./types";

const BODIES = [
	"iso",
	"iec",
	"ieee",
	"rfc",
	"ansi",
	"nist",
	"itu-t",
	"etsi",
	"en",
	"bs",
	"din",
	"jis",
];
const PARTS = [
	"annex",
	"clause",
	"subclause",
	"section",
	"paragraph",
	"table",
	"figure",
	"note",
	"part",
	"control",
	"requirement",
	"amendment",
	"corrigendum",
	"edition",
];
const LETTERS = "ABCDEFGH";
export const STRUCTURAL = [...BODIES, ...PARTS, ...LETTERS.split("")];

const standards: Carrier = {
	id: "standards",
	name: "Standards citation",
	group: "Text",
	sample: "/iso/iec/27001/2022/annex/A/control/8.24/clause/3/paragraph/2/rfc/3986/section/3.3",
	radix: 10,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, DIGITS, rng);
		const cite = () => {
			const body = rng.pick(BODIES);
			const parts = body === "iso" && rng.next() < 0.5 ? ["iso", "iec"] : [body];
			parts.push(feed.take(rng.range(3, 5)));
			if (rng.next() < 0.6) parts.push(feed.take(4));
			return parts.join("/");
		};
		const ref = () => {
			const part = rng.pick(PARTS);
			if (part === "annex") return `annex/${rng.pick(LETTERS.split(""))}`;
			const depth = rng.range(1, 3);
			const nums: string[] = [];
			for (let i = 0; i < depth; i++) nums.push(feed.take(rng.range(1, 2)));
			return `${part}/${nums.join(".")}`;
		};
		while (!feed.done) {
			b.push(cite());
			for (let i = rng.range(1, 4); i > 0; i--) b.push(ref());
		}
		b.fill((room) => {
			const seg = rng.next() < 0.3 ? cite() : ref();
			if (seg.length <= room) return seg;
			if (room >= 6) return `note/${rng.chars(DIGITS, room - 5)}`;
			return null;
		});
		return b.toString();
	},
	parse(pathname) {
		return parseNumeric(pathname, DOTTED);
	},
};

export default standards;
