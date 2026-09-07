import { CARRIERS } from "../carriers";
import { MAX_LENGTH } from "../extend";
import { fmt } from "./html";
import type { Page } from "./layout";

export function pricing(): Page {
	return {
		title: "Pricing",
		description: "Plans for the URL Extension Service.",
		path: "/pricing",
		body: `<h1>Pricing</h1>
<p class="lede">Two plans are available.</p>
<div class="plans">
<section class="plan">
<h2>Free</h2>
<p class="price">$0</p>
<ul>
<li>All ${CARRIERS.length} styles</li>
<li>Lengths to ${fmt(MAX_LENGTH)} characters</li>
<li>Unlimited extended URLs</li>
<li>Permanent resolution</li>
<li>API access</li>
<li>No account</li>
</ul>
</section>
<section class="plan">
<h2>Enterprise</h2>
<p class="price">Contact sales</p>
<ul>
<li>Everything in Free</li>
</ul>
</section>
</div>`,
	};
}
