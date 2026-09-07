import type { Rng } from "../codec/rng";

export type Group = "Infrastructure" | "Physical" | "Data" | "Text";

export interface Carrier {
	id: string;
	name: string;
	group: Group;
	sample: string;
	radix: number;
	// Returns a path plus optional query, starting with "/", at most `target`
	// characters long unless the data alone needs more.
	render(symbols: number[], target: number, rng: Rng): string;
	// Returns the data digits found in a path and query, in order. Anything
	// after the payload is filler and is left for the codec to ignore.
	parse(pathname: string, search: string): number[];
}
