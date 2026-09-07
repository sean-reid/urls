import { PathBuilder, segments } from "./builder";
import type { Carrier } from "./types";

const WORDS = [
	"section",
	"subsection",
	"clause",
	"paragraph",
	"article",
	"schedule",
	"annex",
	"appendix",
	"exhibit",
	"part",
	"chapter",
	"title",
	"item",
	"rule",
	"provision",
	"addendum",
	"rider",
	"recital",
	"definition",
	"footnote",
	"note",
	"table",
	"line",
];
const DOCUMENTS = [
	"terms-of-service",
	"privacy-policy",
	"acceptable-use-policy",
	"data-processing-addendum",
	"master-services-agreement",
	"service-level-agreement",
	"cookie-policy",
	"end-user-license-agreement",
];
const LETTERS = "abcdefghijk";
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
export const STRUCTURAL = [
	"legal",
	"en-us",
	"en-gb",
	"amendments",
	"as-amended",
	"restated",
	"effective",
	"superseding",
	"archived",
	...DOCUMENTS,
];
const DATA = /^[a-z]+-(\d{1,3})$/;

const legalese: Carrier = {
	id: "legalese",
	name: "Policy document",
	group: "Text",
	sample: "/legal/terms-of-service/section-14/subsection-b/clause-203/paragraph-7/as-amended/",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		b.push("legal");
		b.push(rng.pick(DOCUMENTS));
		if (rng.next() < 0.4) b.push(rng.pick(["en-us", "en-gb"]));
		const structural = () =>
			rng.pick([
				() => `${rng.pick(["subsection", "item", "point"])}-${LETTERS[rng.int(LETTERS.length)]}`,
				() => `${rng.pick(["clause", "part"])}-${rng.pick(ROMAN)}`,
				() => rng.pick(["amendments", "as-amended", "restated", "effective", "superseding"]),
			])();
		let run = rng.range(2, 4);
		for (const d of symbols) {
			b.push(`${rng.pick(WORDS)}-${d}`);
			if (--run === 0) {
				b.push(structural());
				run = rng.range(2, 4);
			}
		}
		b.fill((room) => {
			if (rng.next() < 0.2) {
				const s = structural();
				if (s.length <= room) return s;
			}
			const n = rng.int(256);
			const digits = String(n).length;
			const fits = WORDS.filter((w) => w.length + 1 + digits <= room);
			if (fits.length === 0) return room >= 6 ? `line-${rng.int(10)}` : null;
			return `${rng.pick(fits)}-${n}`;
		});
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			const m = DATA.exec(seg);
			if (!m) continue;
			const v = Number(m[1]);
			if (v > 255) return [];
			out.push(v);
		}
		return out;
	},
};

export default legalese;
