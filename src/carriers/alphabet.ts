// A 256-entry token alphabet with reverse lookup. Lists may be longer than
// 256; the first 256 entries are used so lists can be edited freely.
export class Alphabet {
	readonly tokens: readonly string[];
	private readonly index = new Map<string, number>();
	private readonly sorted: readonly string[];

	constructor(list: readonly string[]) {
		if (list.length < 256) throw new Error(`alphabet has ${list.length} entries, needs 256`);
		this.tokens = list.slice(0, 256);
		this.tokens.forEach((t, i) => {
			if (this.index.has(t)) throw new Error(`duplicate token ${t}`);
			this.index.set(t, i);
		});
		this.sorted = [...this.tokens].sort((a, b) => a.length - b.length);
	}

	has(token: string): boolean {
		return this.index.has(token);
	}

	get(token: string): number | undefined {
		return this.index.get(token);
	}

	at(i: number): string {
		return this.tokens[i] as string;
	}

	// A random token no longer than `room`.
	fitting(room: number, pick: (w: readonly string[]) => string): string | null {
		let n = this.sorted.length;
		while (n > 0 && (this.sorted[n - 1] as string).length > room) n--;
		if (n === 0) return null;
		return pick(this.sorted.slice(0, n));
	}
}

export const DIGITS = "0123456789";
export const HEX = "0123456789abcdef";
export const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";
export const BASE36_UPPER = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function charIndexer(alphabet: string): (s: string, out: number[]) => boolean {
	const map = new Map<string, number>();
	for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i] as string, i);
	return (s, out) => {
		for (const ch of s) {
			const v = map.get(ch);
			if (v === undefined) return false;
			out.push(v);
		}
		return true;
	};
}
