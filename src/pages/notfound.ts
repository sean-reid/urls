import type { Page } from "./layout";

export function notFound(path: string): Page {
	return {
		title: "Not found",
		description: "This link could not be resolved.",
		path,
		body: `<h1>This link could not be resolved.</h1>
<p class="lede">It is not an extended URL issued by this service, or it was altered in transit.</p>
<p><a href="/">Return to the service.</a></p>`,
	};
}
