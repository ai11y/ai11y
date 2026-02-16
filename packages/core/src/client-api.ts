import type { Ai11yContext, Ai11yError } from "./context.js";
import { getContext } from "./dom.js";
import {
	clickMarker,
	fillInputMarker,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "./dom-actions/index.js";
import type { Instruction } from "./instruction.js";
import { setError, track as trackToStore } from "./store.js";

/**
 * Client interface for interacting with the AI accessibility system
 */
export interface Ai11yClient {
	/**
	 * Describes the current UI context (markers, route, state, errors)
	 */
	describe(): Ai11yContext;

	/**
	 * Executes an instruction on the UI
	 */
	act(instruction: Instruction): void;

	/**
	 * Tracks a custom event
	 */
	track(event: string, payload?: unknown): void;

	/**
	 * Reports an error to the system
	 */
	reportError(
		error: Error,
		meta?: { surface?: string; markerId?: string },
	): void;
}

interface CreateClientOptions {
	onNavigate?: (route: string) => void;
}

/**
 * Creates a new AI accessibility client instance
 *
 * @param options - Optional configuration
 * @returns An Ai11yClient instance
 *
 * @example
 * ```ts
 * const ctx = createClient({ onNavigate: (route) => navigate(route) })
 * const ui = ctx.describe()
 * ctx.act({ action: "click", id: "save_button" })
 * ```
 */
export function createClient(options?: CreateClientOptions): Ai11yClient {
	const { onNavigate } = options || {};

	return {
		describe(): Ai11yContext {
			return getContext();
		},

		act(instruction: Instruction): void {
			switch (instruction.action) {
				case "click":
					clickMarker(instruction.id);
					break;
				case "navigate":
					if (onNavigate) {
						onNavigate(instruction.route);
					} else {
						navigateToRoute(instruction.route);
					}
					break;
				case "highlight":
					highlightMarker(instruction.id);
					break;
				case "scroll":
					scrollToMarker(instruction.id);
					break;
				case "fillInput":
					fillInputMarker(instruction.id, instruction.value);
					break;
			}
		},

		track(event: string, payload?: unknown): void {
			trackToStore(event, payload);
		},

		reportError(
			error: Error,
			meta?: { surface?: string; markerId?: string },
		): void {
			const assistError: Ai11yError = {
				error,
				meta,
				timestamp: Date.now(),
			};
			setError(assistError);
			trackToStore("error", { error: error.message, meta });
		},
	};
}
