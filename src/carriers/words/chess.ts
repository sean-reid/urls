const FILES = "abcdefgh";

function squares(ranks: string): string[] {
	const out: string[] = [];
	for (const r of ranks) for (const f of FILES) out.push(f + r);
	return out;
}

const pawns = squares("3456");
const pieces = (p: string) => squares("12345678").map((s) => p + s);

export const CHESS_MOVES: string[] = [
	...pawns,
	...pieces("N"),
	...pieces("B"),
	...pieces("R"),
	...pieces("Q").slice(0, 24),
	"O-O",
	"O-O-O",
	"exd5",
	"dxe5",
	"Bxf7+",
	"Nxe5",
	"Qxd8+",
	"Kxd8",
];
