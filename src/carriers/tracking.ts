import { BASE36, BASE64URL, charIndexer, HEX } from "./alphabet";
import { CharFeed } from "./feed";
import type { Carrier } from "./types";

const DATA_KEYS = ["sid", "cid", "tid", "rid", "sig", "tok", "ck", "cs", "sess", "trace"];
const DATA_SET = new Set(DATA_KEYS);
const index = charIndexer(BASE36);

const SOURCES = [
	"newsletter",
	"email",
	"linkedin",
	"twitter",
	"facebook",
	"google",
	"partner",
	"direct",
	"referral",
	"podcast",
	"webinar",
	"print",
];
const MEDIUMS = [
	"email",
	"cpc",
	"social",
	"organic",
	"banner",
	"affiliate",
	"display",
	"referral",
	"sms",
	"push",
];
const CAMPAIGNS = [
	"spring-launch",
	"q3-nurture",
	"re-engagement",
	"winback",
	"onboarding-v2",
	"annual-report",
	"product-update",
	"brand-awareness",
	"always-on",
];
const CONTENT = [
	"cta-primary",
	"hero-button",
	"footer-link",
	"sidebar",
	"inline-text",
	"image-1",
	"variant-b",
];

type Filler = [string, (rng: Parameters<Carrier["render"]>[2]) => string];
const FILLERS: Filler[] = [
	["utm_source", (r) => r.pick(SOURCES)],
	["utm_medium", (r) => r.pick(MEDIUMS)],
	["utm_campaign", (r) => r.pick(CAMPAIGNS)],
	["utm_content", (r) => r.pick(CONTENT)],
	[
		"utm_term",
		(r) => r.pick(["url-extension", "long-urls", "link-management", "enterprise-links"]),
	],
	["utm_id", (r) => r.chars("0123456789", 6)],
	["fbclid", (r) => r.chars(BASE64URL, r.range(40, 61))],
	["gclid", (r) => r.chars(BASE64URL, r.range(50, 91))],
	["msclkid", (r) => r.chars(HEX, 32)],
	["mc_cid", (r) => r.chars(HEX, 10)],
	["mc_eid", (r) => r.chars(HEX, 10)],
	["_hsenc", (r) => `p2ANqtz-${r.chars(BASE64URL, r.range(40, 60))}`],
	["_hsmi", (r) => r.chars("0123456789", 9)],
	["igshid", (r) => r.chars(BASE64URL, 16)],
	["ttclid", (r) => r.chars(BASE64URL, r.range(20, 40))],
	[
		"li_fat_id",
		(r) =>
			`${r.chars(HEX, 8)}-${r.chars(HEX, 4)}-${r.chars(HEX, 4)}-${r.chars(HEX, 4)}-${r.chars(HEX, 12)}`,
	],
	["twclid", (r) => r.chars(BASE64URL, 20)],
	["yclid", (r) => r.chars("0123456789", 19)],
	["dclid", (r) => r.chars(BASE64URL, r.range(40, 60))],
	["wbraid", (r) => r.chars(BASE64URL, r.range(30, 60))],
	["gbraid", (r) => r.chars(BASE64URL, r.range(30, 60))],
	["srsltid", (r) => r.chars(BASE64URL, 60)],
	["mkt_tok", (r) => r.chars(BASE64URL, r.range(30, 60))],
	["_ga", (r) => `2.${r.chars("0123456789", 9)}.${r.chars("0123456789", 10)}`],
	["_gl", (r) => r.chars(BASE64URL, r.range(40, 80))],
	["oly_enc_id", (r) => r.chars(BASE36, 12)],
	["vero_id", (r) => r.chars(HEX, 16)],
	["ncid", (r) => r.chars(BASE36, 20)],
	["cmpid", (r) => r.chars(BASE36, 12)],
	["ref", (r) => r.pick(["share", "copy-link", "embed", "footer", "nav", "app"])],
	["src", (r) => r.pick(["web", "ios", "android", "email", "widget"])],
	["campaign_id", (r) => r.chars("0123456789", 10)],
	["ad_id", (r) => r.chars("0123456789", 12)],
	["adset_id", (r) => r.chars("0123456789", 12)],
	["placement", (r) => r.pick(["feed", "story", "sidebar", "search", "video"])],
	["s_kwcid", (r) => `AL!${r.chars("0123456789", 4)}!3!${r.chars("0123456789", 12)}`],
	["ef_id", (r) => `${r.chars(BASE64URL, 20)}:G:s`],
];
export const FILLER_KEYS = FILLERS.map((f) => f[0]);

const tracking: Carrier = {
	id: "tracking",
	name: "Tracking parameters",
	group: "Infrastructure",
	sample: "/c?utm_source=newsletter&utm_medium=email&utm_campaign=q3-nurture&fbclid=",
	radix: 36,
	render(symbols, target, rng) {
		const feed = new CharFeed(symbols, BASE36, rng);
		const params: string[] = [];
		let length = 0;
		const push = (k: string, v: string) => {
			params.push(`${k}=${v}`);
			length += k.length + v.length + 2;
		};
		const path = rng.pick(["/c", "/r", "/l", "/go", "/click", "/track", "/e", "/out"]);
		length += path.length;
		const filler = () => {
			const [k, make] = rng.pick(FILLERS);
			return [k, make(rng)] as const;
		};
		for (let i = rng.range(1, 3); i > 0; i--) push(...filler());
		let keys = DATA_KEYS.slice();
		while (!feed.done) {
			if (keys.length === 0) keys = DATA_KEYS.slice();
			const k = keys.splice(rng.int(keys.length), 1)[0] as string;
			push(k, feed.take(Math.min(feed.left, rng.range(8, 40))));
			if (rng.next() < 0.5) push(...filler());
		}
		for (let misses = 0; misses < 10; ) {
			const [k, v] = filler();
			if (length + k.length + v.length + 2 <= target) {
				push(k, v);
				misses = 0;
			} else misses++;
		}
		const room = target - length - 2;
		if (room > 4) push("_", rng.chars(BASE36, room - 1));
		return `${path}?${params.join("&")}`;
	},
	parse(_pathname, search) {
		const out: number[] = [];
		if (!search.startsWith("?")) return out;
		for (const pair of search.slice(1).split("&")) {
			const eq = pair.indexOf("=");
			if (eq < 0) continue;
			if (!DATA_SET.has(pair.slice(0, eq))) continue;
			if (!index(pair.slice(eq + 1), out)) return [];
		}
		return out;
	},
};

export default tracking;
