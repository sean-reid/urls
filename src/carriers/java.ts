import { Alphabet } from "./alphabet";
import { PathBuilder, segments } from "./builder";
import { WordFeed } from "./feed";
import type { Carrier } from "./types";
import { JAVA_FRAGMENTS } from "./words/java";

const ALPHABET = new Alphabet(JAVA_FRAGMENTS);
const PACKAGES = [
	"impl",
	"core",
	"util",
	"spi",
	"api",
	"service",
	"support",
	"common",
	"legacy",
	"shaded",
	"repackaged",
	"backport",
	"v2",
];
const METHODS = [
	"getInstance",
	"resolve",
	"doResolveInternal",
	"newBuilder",
	"build",
	"execute",
	"handle",
	"process",
	"invoke",
	"apply",
	"create",
	"init",
	"configure",
	"wrap",
	"unwrap",
	"delegate",
	"toProxy",
	"get",
	"of",
];
export const STRUCTURAL = [
	"com",
	"org",
	"net",
	"io",
	"dwainosaur",
	"platform",
	"internal",
	...PACKAGES,
	...METHODS,
];

const java: Carrier = {
	id: "java",
	name: "Java package",
	group: "Text",
	sample:
		"/com/dwainosaur/platform/internal/impl/AbstractLinkResolverFactoryBeanImpl/getInstance/resolve",
	radix: 256,
	render(symbols, target, rng) {
		const b = new PathBuilder(target);
		const feed = new WordFeed(symbols, ALPHABET, rng);
		for (const p of [rng.pick(["com", "org", "net", "io"]), "dwainosaur", "platform", "internal"])
			b.push(p);
		for (let i = rng.range(0, 2); i > 0; i--) b.push(rng.pick(PACKAGES));
		while (!feed.done) {
			let name = "";
			for (let i = rng.range(2, 6); i > 0 && !feed.done; i--) name += feed.take();
			b.push(name);
			const r = rng.next();
			if (r < 0.3) b.push(rng.pick(METHODS));
			else if (r < 0.5) b.push(rng.pick(PACKAGES));
		}
		b.fill((room) => {
			if (room >= 10 && rng.next() < 0.25) return rng.pick(METHODS);
			let name = "";
			for (let i = rng.range(2, 5); i > 0; i--) {
				const f = feed.fitting(room - name.length);
				if (f === null) break;
				name += f;
			}
			return name.length ? name : null;
		});
		return b.toString();
	},
	parse(pathname) {
		const out: number[] = [];
		for (const seg of segments(pathname)) {
			if (!/^[A-Z]/.test(seg)) continue;
			for (const frag of seg.split(/(?=[A-Z])/)) {
				const v = ALPHABET.get(frag);
				if (v === undefined) return [];
				out.push(v);
			}
		}
		return out;
	},
};

export default java;
