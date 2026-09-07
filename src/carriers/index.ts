import airline from "./airline";
import chess from "./chess";
import countdown from "./countdown";
import dna from "./dna";
import enterprise from "./enterprise";
import filesystem from "./filesystem";
import gps from "./gps";
import hex from "./hex";
import identifiers from "./identifiers";
import java from "./java";
import legalese from "./legalese";
import pi from "./pi";
import postal from "./postal";
import redirects from "./redirects";
import standards from "./standards";
import timestamps from "./timestamps";
import tracking from "./tracking";
import type { Carrier, Group } from "./types";
import windows from "./windows";

export const CARRIERS: readonly Carrier[] = [
	enterprise,
	tracking,
	hex,
	identifiers,
	gps,
	postal,
	airline,
	dna,
	pi,
	timestamps,
	java,
	windows,
	redirects,
	legalese,
	filesystem,
	chess,
	standards,
	countdown,
];

export const GROUPS: readonly Group[] = ["Infrastructure", "Physical", "Data", "Text"];

const byId = new Map(CARRIERS.map((c) => [c.id, c]));

export function carrier(id: string): Carrier | undefined {
	return byId.get(id);
}

export type { Carrier, Group };
