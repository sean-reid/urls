// Assembles slash-separated segments while tracking length against a cap.
// Data segments are always added; filler is added only while it fits.
export class PathBuilder {
	private parts: string[] = [];
	private length = 0;

	constructor(private readonly target: number) {}

	get remaining(): number {
		return this.target - this.length;
	}

	push(segment: string): void {
		this.parts.push(segment);
		this.length += 1 + segment.length;
	}

	fits(segment: string): boolean {
		return this.length + 1 + segment.length <= this.target;
	}

	tryPush(segment: string): boolean {
		if (!this.fits(segment)) return false;
		this.push(segment);
		return true;
	}

	// Adds filler until nothing more fits. `make` receives the room left for a
	// single segment and may return a shorter one; it returns null to stop.
	fill(make: (room: number) => string | null): void {
		for (let misses = 0; misses < 8; ) {
			const room = this.remaining - 1;
			if (room < 1) return;
			const seg = make(room);
			if (seg === null) return;
			if (this.tryPush(seg)) misses = 0;
			else misses++;
		}
	}

	toString(): string {
		return `/${this.parts.join("/")}`;
	}
}

export function segments(pathname: string): string[] {
	return pathname.split("/").filter((s) => s.length > 0);
}
