export class Rng {
	private state: number;

	constructor(seed?: number) {
		if (seed === undefined) {
			const buf = new Uint32Array(1);
			crypto.getRandomValues(buf);
			seed = buf[0] as number;
		}
		this.state = seed >>> 0;
	}

	next(): number {
		this.state = (this.state + 0x6d2b79f5) >>> 0;
		let t = this.state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	int(maxExclusive: number): number {
		return Math.floor(this.next() * maxExclusive);
	}

	range(min: number, maxInclusive: number): number {
		return min + this.int(maxInclusive - min + 1);
	}

	pick<T>(items: readonly T[]): T {
		return items[this.int(items.length)] as T;
	}

	chars(alphabet: string, n: number): string {
		let s = "";
		for (let i = 0; i < n; i++) s += alphabet[this.int(alphabet.length)];
		return s;
	}
}
