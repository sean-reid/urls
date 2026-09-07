export function esc(s: string): string {
	return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const number = new Intl.NumberFormat("en-US");

export function fmt(n: number): string {
	return number.format(n);
}
