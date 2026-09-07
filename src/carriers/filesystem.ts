import { Alphabet } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { WordFeed } from "./feed";
import type { Carrier } from "./types";
import { FILESYSTEM_WORDS } from "./words/filesystem";

const ALPHABET = new Alphabet(FILESYSTEM_WORDS);
const ROOTS = [
	["home", "deploy"],
	["var", "www"],
	["mnt", "backup-drive"],
	["srv", "app"],
	["opt", "legacy-app"],
	["usr", "local", "share"],
	["home", "admin"],
	["var", "opt", "data-old"],
];
export const STRUCTURAL = [
	"home",
	"deploy",
	"var",
	"www",
	"mnt",
	"backup-drive",
	"srv",
	"app",
	"opt",
	"legacy-app",
	"usr",
	"local",
	"share",
	"admin",
	"data-old",
];

function date(rng: Parameters<Carrier["render"]>[2]): string {
	const y = rng.range(2009, 2026);
	const m = String(rng.range(1, 12)).padStart(2, "0");
	const d = String(rng.range(1, 28)).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

const filesystem: Carrier = {
	id: "filesystem",
	name: "Filesystem",
	group: "Text",
	sample: "/home/deploy/2019-03-11/backup/backup-final/backup-final-v2/really-final/do-not-delete/",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new WordFeed(symbols, ALPHABET, rng);
		for (const r of rng.pick(ROOTS)) b.push(r);
		let run = rng.range(3, 7);
		while (!feed.done) {
			b.push(feed.take());
			if (--run === 0) {
				b.push(date(rng));
				run = rng.range(3, 7);
			}
		}
		b.fill((room) => {
			if (room >= 10 && rng.next() < 0.12) return date(rng);
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

export default filesystem;
