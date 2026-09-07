// Bytes are carried as digits in an arbitrary radix. Each group of four bytes
// becomes a fixed number of digits, so decoding needs no big integers. A
// fixed-width byte count leads the stream; anything after the payload is
// filler and is ignored.

export const MAX_BYTES = 8192;
const GROUP = 4;
const GROUP_SPACE = 2 ** 32;

export function digitsPerGroup(radix: number): number {
	let n = 1;
	let space = radix;
	while (space < GROUP_SPACE) {
		space *= radix;
		n++;
	}
	return n;
}

export function headerWidth(radix: number): number {
	let n = 1;
	let space = radix;
	while (space <= MAX_BYTES) {
		space *= radix;
		n++;
	}
	return n;
}

function toDigits(value: number, radix: number, width: number, out: number[]): void {
	const start = out.length;
	for (let i = 0; i < width; i++) out.push(0);
	let v = value;
	for (let i = width - 1; i >= 0; i--) {
		out[start + i] = v % radix;
		v = Math.floor(v / radix);
	}
}

function fromDigits(digits: number[], offset: number, width: number, radix: number): number {
	let v = 0;
	for (let i = 0; i < width; i++) v = v * radix + (digits[offset + i] as number);
	return v;
}

export function toSymbols(bytes: Uint8Array, radix: number): number[] {
	if (bytes.length > MAX_BYTES) throw new RangeError("payload too large");
	const out: number[] = [];
	toDigits(bytes.length, radix, headerWidth(radix), out);
	const width = digitsPerGroup(radix);
	for (let i = 0; i < bytes.length; i += GROUP) {
		let v = 0;
		for (let j = 0; j < GROUP; j++) v = v * 256 + (bytes[i + j] ?? 0);
		toDigits(v, radix, width, out);
	}
	return out;
}

export function symbolCount(byteLength: number, radix: number): number {
	return headerWidth(radix) + Math.ceil(byteLength / GROUP) * digitsPerGroup(radix);
}

export function fromSymbols(digits: number[], radix: number): Uint8Array | null {
	const hw = headerWidth(radix);
	if (digits.length < hw) return null;
	const length = fromDigits(digits, 0, hw, radix);
	if (length === 0 || length > MAX_BYTES) return null;
	const width = digitsPerGroup(radix);
	const groups = Math.ceil(length / GROUP);
	if (digits.length < hw + groups * width) return null;
	const out = new Uint8Array(groups * GROUP);
	for (let g = 0; g < groups; g++) {
		let v = fromDigits(digits, hw + g * width, width, radix);
		if (v >= GROUP_SPACE) return null;
		for (let j = GROUP - 1; j >= 0; j--) {
			out[g * GROUP + j] = v % 256;
			v = Math.floor(v / 256);
		}
	}
	return out.subarray(0, length);
}
