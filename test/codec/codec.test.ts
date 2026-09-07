import { describe, expect, it } from "vitest";
import { crc32 } from "../../src/codec/crc32";
import { frame, unframe } from "../../src/codec/frame";
import { Rng } from "../../src/codec/rng";
import {
	digitsPerGroup,
	fromSymbols,
	headerWidth,
	symbolCount,
	toSymbols,
} from "../../src/codec/symbols";

describe("crc32", () => {
	it("matches the reference value for a known input", () => {
		expect(crc32(new TextEncoder().encode("The quick brown fox jumps over the lazy dog"))).toBe(
			0x414fa339,
		);
		expect(crc32(new Uint8Array(0))).toBe(0);
	});
});

describe("frame", () => {
	it("round-trips a url", () => {
		const url = "https://example.com/a?b=c#d";
		expect(unframe(frame(url))).toBe(url);
	});

	it("rejects a corrupted frame", () => {
		const f = frame("https://example.com/");
		f[3] = (f[3] as number) ^ 0xff;
		expect(unframe(f)).toBeNull();
	});

	it("rejects an unknown version and short input", () => {
		const f = frame("https://example.com/");
		f[0] = 0x02;
		expect(unframe(f)).toBeNull();
		expect(unframe(new Uint8Array([1, 2, 3]))).toBeNull();
	});

	it("keeps non-ascii destinations intact", () => {
		const url = "https://例え.jp/パス?q=値";
		expect(unframe(frame(url))).toBe(url);
	});
});

describe("symbols", () => {
	const radices = [4, 10, 16, 36, 64, 256];

	it("picks enough digits per group to hold 32 bits", () => {
		for (const r of radices) {
			expect(r ** digitsPerGroup(r)).toBeGreaterThanOrEqual(2 ** 32);
			expect(r ** (digitsPerGroup(r) - 1)).toBeLessThan(2 ** 32);
			expect(r ** headerWidth(r)).toBeGreaterThan(8192);
		}
	});

	it("round-trips random payloads in every radix and ignores trailing filler", () => {
		const rng = new Rng(7);
		for (const r of radices) {
			for (let i = 0; i < 200; i++) {
				const len = rng.range(1, 300);
				const bytes = new Uint8Array(len);
				for (let j = 0; j < len; j++) bytes[j] = rng.int(256);
				const digits = toSymbols(bytes, r);
				expect(digits.length).toBe(symbolCount(len, r));
				for (let j = 0; j < rng.int(50); j++) digits.push(rng.int(r));
				expect(Array.from(fromSymbols(digits, r) as Uint8Array)).toEqual(Array.from(bytes));
			}
		}
	});

	it("returns null when digits are missing", () => {
		const digits = toSymbols(new Uint8Array([1, 2, 3, 4, 5]), 10);
		expect(fromSymbols(digits.slice(0, -1), 10)).toBeNull();
		expect(fromSymbols([], 10)).toBeNull();
		expect(fromSymbols([0, 0, 0, 0], 10)).toBeNull();
	});
});

describe("rng", () => {
	it("is deterministic for a seed and uniform enough", () => {
		const a = new Rng(42);
		const b = new Rng(42);
		for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
		const counts = new Array(10).fill(0);
		for (let i = 0; i < 10000; i++) counts[a.int(10)]++;
		for (const c of counts) expect(c).toBeGreaterThan(800);
	});
});
