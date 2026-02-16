import type { Marker } from "./marker.js";

export interface Ai11yState {
	[key: string]: unknown;
}

export interface Ai11yError {
	error: Error;
	meta?: {
		surface?: string;
		markerId?: string;
	};
	timestamp: number;
}

export interface Ai11yEvent {
	type: string;
	payload?: unknown;
	timestamp: number;
}

export interface Ai11yContext {
	markers: Marker[];
	inViewMarkerIds?: string[];
	route?: string;
	state?: Ai11yState;
	error?: Ai11yError | null;
}
