import { describe, expect, it } from "vitest";
import { checkDestination } from "../src/validate";

const SELF = "urls.dwainosaur.com";

describe("checkDestination", () => {
	it("accepts ordinary urls and adds a scheme when missing", () => {
		expect(checkDestination("https://example.com/a?b=c", SELF)).toEqual({
			ok: true,
			url: "https://example.com/a?b=c",
		});
		expect(checkDestination("  example.com/path  ", SELF)).toEqual({
			ok: true,
			url: "https://example.com/path",
		});
		expect(checkDestination("http://8.8.8.8/", SELF)).toEqual({ ok: true, url: "http://8.8.8.8/" });
	});

	it.each([
		["", "Enter a URL."],
		["not a url", "That is not a valid URL."],
		["ftp://example.com/", "Only http and https URLs can be extended."],
		["javascript:alert(1)", "Only http and https URLs can be extended."],
		["https://user:pw@example.com/", "URLs with credentials cannot be extended."],
		["https://intranet/", "The host name is incomplete."],
		["https://urls.dwainosaur.com/platform/v3", "Extended URLs cannot be extended further."],
		["https://a.urls.dwainosaur.com/", "Extended URLs cannot be extended further."],
		["http://localhost:8080/", "That host is not reachable from the public internet."],
		["http://127.0.0.1/", "That host is not reachable from the public internet."],
		["http://10.1.2.3/", "That host is not reachable from the public internet."],
		["http://172.20.0.1/", "That host is not reachable from the public internet."],
		["http://192.168.1.1/", "That host is not reachable from the public internet."],
		[
			"http://169.254.169.254/latest/meta-data",
			"That host is not reachable from the public internet.",
		],
		["http://[::1]/", "That host is not reachable from the public internet."],
		["http://[fd00::1]/", "That host is not reachable from the public internet."],
		["http://printer.local/", "That host is not reachable from the public internet."],
		["http://db.internal/", "That host is not reachable from the public internet."],
		[`https://example.com/${"x".repeat(2100)}`, "The URL is longer than 2048 characters."],
	])("rejects %s", (input, error) => {
		expect(checkDestination(input, SELF)).toEqual({ ok: false, error });
	});
});
