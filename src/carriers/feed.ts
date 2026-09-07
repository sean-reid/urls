import type { Rng } from "../codec/rng";
import type { Alphabet } from "./alphabet";

// Hands out data characters in order, then random filler from the same
// alphabet once the data is exhausted.
export class CharFeed {
	private i = 0;
	private readonly data: string;

	constructor(
		symbols: number[],
		private readonly alphabet: string,
		private readonly rng: Rng,
	) {
		let s = "";
		for (const d of symbols) s += alphabet[d];
		this.data = s;
	}

	get done(): boolean {
		return this.i >= this.data.length;
	}

	get left(): number {
		return this.data.length - this.i;
	}

	take(n: number): string {
		const s = this.data.slice(this.i, this.i + n);
		this.i += s.length;
		return s.length < n ? s + this.rng.chars(this.alphabet, n - s.length) : s;
	}
}

export class WordFeed {
	private i = 0;

	constructor(
		private readonly symbols: number[],
		private readonly alphabet: Alphabet,
		private readonly rng: Rng,
	) {}

	get done(): boolean {
		return this.i >= this.symbols.length;
	}

	take(): string {
		if (this.done) return this.rng.pick(this.alphabet.tokens);
		return this.alphabet.at(this.symbols[this.i++] as number);
	}

	fitting(room: number): string | null {
		return this.alphabet.fitting(room, (b) => this.rng.pick(b));
	}
}
