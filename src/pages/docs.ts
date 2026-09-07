import { CARRIERS } from "../carriers";
import { MAX_LENGTH, MIN_LENGTH } from "../extend";
import { esc, fmt } from "./html";
import type { Page } from "./layout";

export function docs(origin: string): Page {
	const styles = CARRIERS.map(
		(c) =>
			`<tr><td><code>${c.id}</code></td><td>${esc(c.name)}</td><td><code>${esc(c.sample.slice(0, 44))}</code></td></tr>`,
	).join("");
	return {
		title: "Documentation",
		description: "API reference for the URL Extension Service.",
		path: "/docs",
		body: `<h1>Documentation</h1>
<p class="lede">The service is available as a JSON API. No key is required.</p>

<h2>Endpoint</h2>
<pre>GET  ${esc(origin)}/api/v1/extend?url=&lt;url&gt;&amp;style=&lt;style&gt;&amp;length=&lt;n&gt;
POST ${esc(origin)}/api/v1/extend</pre>
<p>POST accepts a JSON body or a form body with the same three fields. Responses are JSON. Cross-origin requests are allowed.</p>

<h2>Parameters</h2>
<table>
<tr><th>Field</th><th>Required</th><th>Description</th></tr>
<tr><td><code>url</code></td><td>yes</td><td>The destination. http or https. A missing scheme is treated as https. Hosts on private networks are refused.</td></tr>
<tr><td><code>style</code></td><td>no</td><td>One of the style identifiers below. Default <code>enterprise</code>.</td></tr>
<tr><td><code>length</code></td><td>no</td><td>Target length of the extended URL in characters, ${fmt(MIN_LENGTH)} to ${fmt(MAX_LENGTH)}. Default ${fmt(1000)}. The result is never longer than this unless the destination itself needs more.</td></tr>
</table>

<h2>Styles</h2>
<table>
<tr><th>Identifier</th><th>Name</th><th>Shape</th></tr>
${styles}
</table>
<p><code>GET /api/v1/styles</code> returns the same list as JSON.</p>

<h2>Response</h2>
<pre>{
  "url": "${esc(origin)}/platform/v3/regions/us-east-2/...",
  "length": 1000,
  "requested_length": 1000,
  "style": "enterprise",
  "destination": "https://example.com/",
  "minimum": false
}</pre>
<p><code>minimum</code> is true when the destination alone needs more characters than requested. The URL returned is then the shortest valid one.</p>

<h2>Errors</h2>
<table>
<tr><th>Status</th><th>Meaning</th></tr>
<tr><td><code>400</code></td><td>The destination or a parameter was rejected. The body carries an <code>error</code> field with the reason.</td></tr>
<tr><td><code>429</code></td><td>Too many requests from one address. Retry after the number of seconds in <code>Retry-After</code>.</td></tr>
</table>

<h2>Examples</h2>
<pre>curl "${esc(origin)}/api/v1/extend?url=https://example.com"</pre>
<pre>curl "${esc(origin)}/api/v1/extend?url=https://example.com&amp;style=chess&amp;length=2000"</pre>
<pre>curl -X POST ${esc(origin)}/api/v1/extend \\
  -H "content-type: application/json" \\
  -d '{"url":"https://example.com","style":"dna","length":1500}'</pre>

<h2>Resolution</h2>
<p>The destination is encoded inside the extended URL. Nothing is stored, so links do not expire and cannot be edited or revoked. A request to an extended URL receives a permanent redirect to its destination.</p>

<h2>Acceptable use</h2>
<p>Extended URLs may not be used to disguise the destination of phishing, malware, or other content that would be blocked if the destination were visible. Destinations that resolve to private networks are refused at generation. Reports go to <a href="mailto:abuse@dwainosaur.com">abuse@dwainosaur.com</a> and are acted on.</p>`,
	};
}
