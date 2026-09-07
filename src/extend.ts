import { CARRIERS, type Carrier } from "./carriers";
import { frame, unframe } from "./codec/frame";
import { Rng } from "./codec/rng";
import { fromSymbols, toSymbols } from "./codec/symbols";

export const MAX_LENGTH = 2000;
export const MIN_LENGTH = 100;
export const RESERVED = [
	"/api",
	"/docs",
	"/pricing",
	"/fonts",
	"/favicon.svg",
	"/og.png",
	"/robots.txt",
];

export interface Extended {
	url: string;
	length: number;
	// True when the destination alone needs more than the requested length.
	minimum: boolean;
}

export function extend(
	destination: string,
	style: Carrier,
	length: number,
	origin: string,
	rng = new Rng(),
): Extended {
	const symbols = toSymbols(frame(destination), style.radix, () => rng.int(256));
	const path = style.render(symbols, length - origin.length, rng);
	const url = origin + path;
	return { url, length: url.length, minimum: url.length > length };
}

export function resolve(pathname: string, search: string): string | null {
	for (const c of CARRIERS) {
		const digits = c.parse(pathname, search);
		if (digits.length === 0) continue;
		const bytes = fromSymbols(digits, c.radix);
		if (!bytes) continue;
		const url = unframe(bytes);
		if (url) return url;
	}
	return null;
}

export function isReserved(pathname: string): boolean {
	return RESERVED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
