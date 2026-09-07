import { defineConfig, devices } from "@playwright/test";

const PORT = 8788;

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: "retain-on-failure",
	},
	webServer: {
		command: `pnpm wrangler dev --port ${PORT} --var ANALYTICS_TOKEN:`,
		url: `http://localhost:${PORT}/`,
		reuseExistingServer: !process.env.CI,
		timeout: 60000,
	},
	projects: [
		{
			name: "mobile",
			use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 740 }, hasTouch: true },
		},
		{
			name: "tablet",
			use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
		},
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 900 } },
		},
	],
});
