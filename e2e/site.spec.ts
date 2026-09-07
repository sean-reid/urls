import { expect, test } from "@playwright/test";

const shot = (name: string, project: string) => `e2e/screenshots/${name}-${project}.png`;
// wrangler dev reports the production host in request urls, so links are
// followed against the local server by swapping the origin.
const local = (link: string, base: string) => base + link.slice(link.indexOf("/", 8));

test("extends a url and copies it", async ({ page, context, browserName }, info) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
	await page.goto("/");
	await expect(page).toHaveTitle("URL Extension Service");
	await page.screenshot({ path: shot("home", info.project.name), fullPage: true });

	await page.getByLabel("URL").fill("https://en.wikipedia.org/wiki/Uniform_Resource_Identifier");
	await page.getByLabel("Reassurance").check();
	await page.getByLabel("Maximum").check();
	await page.getByRole("button", { name: "Extend" }).click();

	const out = page.locator("#out");
	await expect(out).toBeVisible();
	const link = (await out.textContent()) ?? "";
	expect(new URL(link).pathname.length).toBeGreaterThan(1);
	expect(link.length).toBeLessThanOrEqual(2000);
	expect(link.length).toBeGreaterThan(1950);
	await expect(page.locator(".meta")).toContainText("characters.");
	await page.screenshot({ path: shot("result", info.project.name), fullPage: true });

	const copy = page.getByRole("button", { name: "Copy" });
	await expect(copy).toBeVisible();
	const box = await copy.boundingBox();
	expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
	if (browserName === "chromium") {
		await copy.click();
		await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
		const clip = await page.evaluate(() => navigator.clipboard.readText());
		expect(clip).toBe(link);
	}

	const res = await page.request.get(local(link, info.project.use.baseURL as string), {
		maxRedirects: 0,
	});
	expect(res.status()).toBe(301);
	expect(res.headers().location).toBe("https://en.wikipedia.org/wiki/Uniform_Resource_Identifier");
});

test("exact length field selects its radio and is honored", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel("URL").fill("example.com");
	await page.getByLabel("Exact length in characters").fill("777");
	await expect(page.locator("#exact")).toBeChecked();
	await page.getByRole("button", { name: "Extend" }).click();
	const link = (await page.locator("#out").textContent()) ?? "";
	expect(link.length).toBeLessThanOrEqual(777);
	expect(link.length).toBeGreaterThan(740);
});

test("shows a validation error inline", async ({ page }, info) => {
	await page.goto("/");
	await page.getByLabel("URL").fill("http://192.168.0.1/admin");
	await page.getByRole("button", { name: "Extend" }).click();
	await expect(page.locator(".error")).toContainText("not reachable");
	await page.screenshot({ path: shot("error", info.project.name) });
});

test("works without javascript", async ({ browser }, info) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: info.project.use.viewport ?? null,
	});
	const page = await context.newPage();
	await page.goto("/");
	await page.getByLabel("URL").fill("https://example.com/no-js");
	await page.getByLabel("Chess game").check();
	await page.getByRole("button", { name: "Extend" }).click();
	await expect(page.locator("#out")).toContainText("/game/1.");
	await expect(page.getByRole("button", { name: "Copy" })).toBeHidden();
	await page.screenshot({ path: shot("nojs", info.project.name), fullPage: true });
	await context.close();
});

test("docs, pricing, and 404 render", async ({ page }, info) => {
	await page.goto("/docs");
	await expect(page.getByRole("heading", { name: "Documentation" })).toBeVisible();
	await page.screenshot({ path: shot("docs", info.project.name), fullPage: true });
	await page.goto("/pricing");
	await expect(page.getByText("Contact sales")).toBeVisible();
	await page.screenshot({ path: shot("pricing", info.project.name), fullPage: true });
	const res = await page.goto("/this/does/not/resolve");
	expect(res?.status()).toBe(404);
	await expect(page.getByRole("heading", { name: /could not be resolved/ })).toBeVisible();
	await page.screenshot({ path: shot("notfound", info.project.name) });
});

test("dark scheme renders", async ({ page }, info) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/");
	await page.screenshot({ path: shot("home-dark", info.project.name), fullPage: true });
});

test("touch targets meet 44px", async ({ page }) => {
	await page.goto("/");
	for (const label of await page.locator("label.style, .lengths label").all()) {
		const box = await label.boundingBox();
		expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
	}
	const button = await page.getByRole("button", { name: "Extend" }).boundingBox();
	expect(button?.height ?? 0).toBeGreaterThanOrEqual(44);
});
