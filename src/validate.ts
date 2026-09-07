export const MAX_DESTINATION = 2048;

export type Checked = { ok: true; url: string } | { ok: false; error: string };

const BLOCKED_SUFFIXES = [
	".localhost",
	".local",
	".internal",
	".home.arpa",
	".test",
	".invalid",
	".onion",
];

function isPrivateV4(host: string): boolean {
	const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
	if (!m) return false;
	const [a, b] = [Number(m[1]), Number(m[2])];
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 100 && b >= 64 && b <= 127) ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		(a === 198 && (b === 18 || b === 19)) ||
		a >= 224
	);
}

function isPrivateV6(host: string): boolean {
	const h = host.slice(1, -1).toLowerCase();
	return (
		h === "::" ||
		h === "::1" ||
		h.startsWith("fc") ||
		h.startsWith("fd") ||
		h.startsWith("fe80") ||
		h.startsWith("::ffff:")
	);
}

export function checkDestination(input: string, selfHost: string): Checked {
	const trimmed = input.trim();
	if (trimmed.length === 0) return { ok: false, error: "Enter a URL." };
	const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
	let url: URL;
	try {
		url = new URL(withScheme);
	} catch {
		return { ok: false, error: "That is not a valid URL." };
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") {
		return { ok: false, error: "Only http and https URLs can be extended." };
	}
	if (url.username || url.password)
		return { ok: false, error: "URLs with credentials cannot be extended." };
	const host = url.hostname;
	if (host === selfHost || host.endsWith(`.${selfHost}`))
		return { ok: false, error: "Extended URLs cannot be extended further." };
	if (
		host === "localhost" ||
		BLOCKED_SUFFIXES.some((s) => host.endsWith(s)) ||
		isPrivateV4(host) ||
		(host.startsWith("[") && isPrivateV6(host))
	) {
		return { ok: false, error: "That host is not reachable from the public internet." };
	}
	if (!host.includes(".") && !host.startsWith("["))
		return { ok: false, error: "The host name is incomplete." };
	if (url.href.length > MAX_DESTINATION)
		return { ok: false, error: `The URL is longer than ${MAX_DESTINATION} characters.` };
	return { ok: true, url: url.href };
}
