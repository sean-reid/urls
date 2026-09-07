import { charIndexer } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { CharFeed } from "./feed";
import type { Carrier } from "./types";

const BASES = "ACGT";
const index = charIndexer(BASES);
const DATA = /^[ACGT]+$/;
export const STRUCTURAL = [
	"sequence",
	"exon",
	"intron",
	"codon",
	"locus",
	"strand",
	"plus",
	"minus",
	"chr7",
	"chr12",
	"chrX",
];

const dna: Carrier = {
	id: "dna",
	name: "DNA sequence",
	group: "Data",
	sample: "/sequence/ATCGGATTACAGGCTTAACGTTAGC/exon/3/codon/1442/GATTACAGGCTTAACGATCG",
	radix: 4,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new CharFeed(symbols, BASES, rng);
		b.push("sequence");
		const annotation = () =>
			rng.pick([
				() => `exon/${rng.range(1, 40)}`,
				() => `intron/${rng.range(1, 40)}`,
				() => `codon/${rng.range(1, 4000)}`,
				() => `locus/${rng.pick(["chr7", "chr12", "chrX"])}`,
				() => `strand/${rng.pick(["plus", "minus"])}`,
			])();
		while (!feed.done) {
			b.push(feed.take(Math.min(feed.left, rng.range(20, 60))));
			if (rng.next() < 0.4) b.push(annotation());
		}
		b.fill((room) => {
			if (room >= 10 && rng.next() < 0.2) {
				const a = annotation();
				if (a.length <= room) return a;
			}
			return rng.chars(BASES, Math.min(room, rng.range(20, 60)));
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

export default dna;
