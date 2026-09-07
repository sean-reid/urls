import { Alphabet } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { WordFeed } from "./feed";
import type { Carrier } from "./types";
import { WINDOWS_WORDS } from "./words/windows";

const ALPHABET = new Alphabet(WINDOWS_WORDS);
const FILES = [
	"final (3).docx",
	"Copy of final.docx",
	"Copy of Copy of final (2).docx",
	"untitled.txt",
	"New Text Document.txt",
	"New Text Document (2).txt",
	"Thumbs.db",
	"desktop.ini",
	"~$final.docx",
	"budget FINAL v7.xlsx",
	"presentation final REAL.pptx",
	"scan0001.pdf",
	"IMG_0001 (1).jpg",
];
export const STRUCTURAL = ["C:", "D:", "Users", "Administrator", "Desktop", ...FILES];

const windows: Carrier = {
	id: "windows",
	name: "Windows desktop",
	group: "Text",
	sample:
		"/C:/Users/Administrator/Desktop/New%20folder/New%20folder%20(2)/Copy%20of%20final/final%20FINAL%20(3)",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new WordFeed(symbols, ALPHABET, rng);
		for (const p of [rng.pick(["C:", "C:", "D:"]), "Users", "Administrator", "Desktop"]) b.push(p);
		while (!feed.done) b.push(encodeURIComponent(feed.take()));
		b.fill((room) => {
			for (let n = room; n >= 3; n--) {
				const w = feed.fitting(n);
				if (w === null) return null;
				const enc = encodeURIComponent(w);
				if (enc.length <= room) return enc;
			}
			return null;
		});
		const file = encodeURIComponent(rng.pick(FILES));
		b.tryPush(file);
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			let name: string;
			try {
				name = decodeURIComponent(seg);
			} catch {
				return [];
			}
			const v = ALPHABET.get(name);
			if (v !== undefined) out.push(v);
		}
		return out;
	},
};

export default windows;
