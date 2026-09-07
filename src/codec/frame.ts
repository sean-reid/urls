import { crc32 } from "./crc32";

const VERSION = 0x01;
const TRAILER = 4;

export function frame(url: string): Uint8Array {
	const body = new TextEncoder().encode(url);
	const out = new Uint8Array(1 + body.length + TRAILER);
	out[0] = VERSION;
	out.set(body, 1);
	const sum = crc32(out.subarray(0, 1 + body.length));
	new DataView(out.buffer).setUint32(1 + body.length, sum);
	return out;
}

export function unframe(bytes: Uint8Array): string | null {
	if (bytes.length < 1 + TRAILER || bytes[0] !== VERSION) return null;
	const end = bytes.length - TRAILER;
	const want = new DataView(bytes.buffer, bytes.byteOffset).getUint32(end);
	if (crc32(bytes.subarray(0, end)) !== want) return null;
	try {
		return new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(
			bytes.subarray(1, end),
		);
	} catch {
		return null;
	}
}
