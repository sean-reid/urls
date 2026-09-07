import { CARRIERS, carrier } from "./carriers";
import { extend, isReserved, MAX_LENGTH, MIN_LENGTH, resolve } from "./extend";
import { docs } from "./pages/docs";
import { DEFAULT_LENGTH, DEFAULT_STYLE, type HomeState, home } from "./pages/home";
import { layout, type Page } from "./pages/layout";
import { notFound } from "./pages/notfound";
import { pricing } from "./pages/pricing";
import { checkDestination } from "./validate";

export interface Env {
	ANALYTICS_TOKEN?: string;
	GENERATE?: RateLimit;
}

const SECURITY: Record<string, string> = {
	"x-content-type-options": "nosniff",
	"referrer-policy": "strict-origin-when-cross-origin",
	"strict-transport-security": "max-age=31536000; includeSubDomains",
	"x-frame-options": "DENY",
};

const CORS: Record<string, string> = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, POST, OPTIONS",
	"access-control-allow-headers": "content-type",
	"access-control-max-age": "86400",
};

function nonce(): string {
	const b = new Uint8Array(16);
	crypto.getRandomValues(b);
	return btoa(String.fromCharCode(...b));
}

function page(p: Page, req: Request, env: Env, status = 200): Response {
	const n = nonce();
	const url = new URL(req.url);
	const html = layout(p, {
		origin: url.origin,
		nonce: n,
		analyticsToken: env.ANALYTICS_TOKEN || undefined,
	});
	const csp = [
		"default-src 'none'",
		`script-src 'nonce-${n}' https://static.cloudflareinsights.com`,
		`style-src 'nonce-${n}'`,
		"font-src 'self'",
		"img-src 'self'",
		"connect-src 'self' https://cloudflareinsights.com",
		"form-action 'self'",
		"base-uri 'none'",
		"frame-ancestors 'none'",
	].join("; ");
	return new Response(html, {
		status,
		headers: {
			...SECURITY,
			"content-type": "text/html; charset=utf-8",
			"content-security-policy": csp,
			"cache-control": status === 200 && req.method === "GET" ? "public, max-age=300" : "no-store",
			vary: "accept-encoding",
		},
	});
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			...SECURITY,
			...CORS,
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			...extra,
		},
	});
}

interface Input {
	url: string;
	style: string;
	length: number;
	exact: boolean;
}

function readInput(params: URLSearchParams | Record<string, unknown>): Input {
	const get = (k: string) => (params instanceof URLSearchParams ? params.get(k) : params[k]);
	const rawLength = get("length");
	const exact = rawLength === "exact";
	const chosen = exact ? get("exact") : rawLength;
	const length =
		chosen === null || chosen === undefined || chosen === "" ? DEFAULT_LENGTH : Number(chosen);
	return {
		url: String(get("url") ?? ""),
		style: String(get("style") ?? DEFAULT_STYLE),
		length,
		exact,
	};
}

type Outcome =
	| { ok: true; result: ReturnType<typeof extend>; input: Input }
	| { ok: false; error: string; input: Input };

function run(input: Input, origin: string, host: string): Outcome {
	const style = carrier(input.style);
	if (!style) return { ok: false, error: "Unknown style.", input };
	if (!Number.isInteger(input.length) || input.length < MIN_LENGTH || input.length > MAX_LENGTH) {
		return {
			ok: false,
			error: `Length must be a whole number from ${MIN_LENGTH} to ${MAX_LENGTH}.`,
			input,
		};
	}
	const checked = checkDestination(input.url, host);
	if (!checked.ok) return { ok: false, error: checked.error, input };
	return {
		ok: true,
		result: extend(checked.url, style, input.length, origin),
		input: { ...input, url: checked.url },
	};
}

async function limited(req: Request, env: Env): Promise<boolean> {
	if (!env.GENERATE) return false;
	const key = req.headers.get("cf-connecting-ip") ?? "unknown";
	const { success } = await env.GENERATE.limit({ key });
	return !success;
}

async function readBody(req: Request): Promise<Record<string, unknown> | URLSearchParams | null> {
	const type = req.headers.get("content-type") ?? "";
	try {
		if (type.includes("application/json")) {
			const body: unknown = await req.json();
			return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
		}
		if (
			type.includes("application/x-www-form-urlencoded") ||
			type.includes("multipart/form-data")
		) {
			const form = await req.formData();
			const params = new URLSearchParams();
			for (const [k, v] of form.entries()) if (typeof v === "string") params.set(k, v);
			return params;
		}
	} catch {
		return null;
	}
	return null;
}

async function api(req: Request, env: Env, url: URL): Promise<Response> {
	if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
	if (req.method !== "GET" && req.method !== "POST")
		return json({ error: "Method not allowed." }, 405, { allow: "GET, POST, OPTIONS" });
	if (await limited(req, env))
		return json({ error: "Too many requests." }, 429, { "retry-after": "60" });
	let params: URLSearchParams | Record<string, unknown> | null = url.searchParams;
	if (req.method === "POST") {
		params = await readBody(req);
		if (!params) return json({ error: "Send a JSON or form body." }, 400);
	}
	const outcome = run(readInput(params), url.origin, url.hostname);
	if (!outcome.ok) return json({ error: outcome.error }, 400);
	const { result, input } = outcome;
	return json({
		url: result.url,
		length: result.length,
		requested_length: input.length,
		style: input.style,
		destination: input.url,
		minimum: result.minimum,
	});
}

function redirect(destination: string): Response {
	return new Response(null, {
		status: 301,
		headers: {
			...SECURITY,
			location: destination,
			"cache-control": "public, max-age=31536000, immutable",
			"referrer-policy": "no-referrer",
			"x-robots-tag": "noindex",
		},
	});
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url);
		const path = url.pathname;

		if (path === "/") {
			if (req.method === "GET" || req.method === "HEAD") return page(home(), req, env);
			if (req.method === "POST") {
				if (await limited(req, env))
					return page(home({ error: "Too many requests. Try again in a minute." }), req, env, 429);
				const params = await readBody(req);
				const input = readInput(params ?? new URLSearchParams());
				const outcome = run(input, url.origin, url.hostname);
				const state: HomeState = {
					url: input.url,
					style: input.style,
					length: input.length,
					exact: input.exact,
				};
				if (outcome.ok) state.result = outcome.result;
				else state.error = outcome.error;
				return page(home(state), req, env, outcome.ok ? 200 : 400);
			}
			return new Response("Method not allowed.", { status: 405, headers: { allow: "GET, POST" } });
		}

		if (path === "/api/v1/extend") return api(req, env, url);
		if (path === "/api/v1/styles") {
			return json(
				CARRIERS.map((c) => ({ id: c.id, name: c.name, group: c.group, sample: c.sample })),
				200,
				{
					"cache-control": "public, max-age=3600",
				},
			);
		}

		if (req.method !== "GET" && req.method !== "HEAD") {
			return new Response("Method not allowed.", { status: 405, headers: { allow: "GET" } });
		}
		if (path === "/docs") return page(docs(url.origin), req, env);
		if (path === "/pricing") return page(pricing(), req, env);
		if (isReserved(path)) return page(notFound(path), req, env, 404);

		const destination = resolve(path, url.search);
		if (destination && checkDestination(destination, url.hostname).ok) return redirect(destination);
		return page(notFound(path), req, env, 404);
	},
} satisfies ExportedHandler<Env>;
