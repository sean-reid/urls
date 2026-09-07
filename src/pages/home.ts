import { CARRIERS, GROUPS } from "../carriers";
import type { Extended } from "../extend";
import { MAX_LENGTH, MIN_LENGTH } from "../extend";
import { esc, fmt } from "./html";
import type { Page } from "./layout";

export const TIERS: [string, number][] = [
	["Standard", 500],
	["Extended", 1000],
	["Maximum", 2000],
];
export const DEFAULT_STYLE = "enterprise";
export const DEFAULT_LENGTH = 1000;

export interface HomeState {
	url?: string;
	style?: string;
	length?: number;
	exact?: boolean;
	result?: Extended;
	error?: string;
}

function styleList(selected: string): string {
	return GROUPS.map((g) => {
		const rows = CARRIERS.filter((c) => c.group === g)
			.map(
				(c) =>
					`<label class="style"><input type="radio" name="style" value="${c.id}"${c.id === selected ? " checked" : ""}><span>${esc(c.name)}</span><code>${esc(c.sample)}</code></label>`,
			)
			.join("");
		return `<div class="group">${g}</div>${rows}`;
	}).join("");
}

function lengthList(length: number, exact: boolean): string {
	const tiers = TIERS.map(
		([name, n]) =>
			`<label><input type="radio" name="length" value="${n}"${!exact && n === length ? " checked" : ""}>${name} <span class="muted">${fmt(n)}</span></label>`,
	).join("");
	return `${tiers}<label><input type="radio" name="length" value="exact" id="exact"${exact ? " checked" : ""}>Exact <input type="number" name="exact" min="${MIN_LENGTH}" max="${MAX_LENGTH}" inputmode="numeric" aria-label="Exact length in characters" value="${exact ? length : ""}"></label>`;
}

function result(state: HomeState): string {
	if (state.error)
		return `<section class="result" id="result"><p class="error">${esc(state.error)}</p></section>`;
	if (!state.result) return `<section class="result" id="result" hidden></section>`;
	const r = state.result;
	const note = r.minimum ? " The destination needs at least this many." : "";
	return `<section class="result" id="result"><p class="url" id="out">${esc(r.url)}</p><div class="meta"><span>${fmt(r.length)} characters.${note}</span><button type="button" class="secondary" data-copy hidden>Copy</button></div></section>`;
}

export function home(state: HomeState = {}): Page {
	const style = state.style ?? DEFAULT_STYLE;
	const length = state.length ?? DEFAULT_LENGTH;
	return {
		title: "URL Extension Service",
		description:
			"Extends a URL to a specified length. Extended URLs resolve to their destination indefinitely.",
		path: "/",
		script: true,
		body: `<h1>URL Extension Service</h1>
<p class="lede">Extends a URL to a specified length. Extended URLs resolve to their destination indefinitely.</p>
<form method="post" action="/" id="f">
<label class="field" for="url">URL</label>
<input type="text" id="url" name="url" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="https://" required value="${esc(state.url ?? "")}">
<fieldset><legend>Style</legend><div class="styles">${styleList(style)}</div></fieldset>
<fieldset><legend>Length</legend><div class="lengths">${lengthList(length, state.exact ?? false)}</div></fieldset>
<button type="submit" class="primary">Extend</button>
</form>
${result(state)}`,
	};
}
