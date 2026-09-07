import { charIndexer, DIGITS } from "./alphabet";
import { segments } from "./builder";

const index = charIndexer(DIGITS);

// Collects the digits of every segment that is purely numeric, optionally
// signed or dotted. Shared by the carriers that hide data in numbers.
export function parseNumeric(pathname: string, pattern: RegExp): number[] {
	const out: number[] = [];
	for (const seg of segments(pathname)) {
		if (!pattern.test(seg)) continue;
		index(seg.replace(/[^0-9]/g, ""), out);
	}
	return out;
}

export const PLAIN = /^\d+$/;
export const SIGNED_DECIMAL = /^-?\d+(\.\d+)?$/;
export const DOTTED = /^\d+(\.\d+)*$/;
