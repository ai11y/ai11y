import { track } from "../store.js";
import { findMarkerElement } from "./find-element.js";

/**
 * Clicks a marker element by its ID
 *
 * @param markerId - The marker ID to click
 *
 * @example
 * ```ts
 * clickMarker('connect_stripe');
 * ```
 */
export function clickMarker(markerId: string): void {
	const element = findMarkerElement(markerId);
	if (!element) {
		console.warn(`Marker ${markerId} not found`);
		return;
	}

	// Prefer native click to avoid double-firing handlers (important for toggles)
	if (
		"click" in element &&
		typeof (element as HTMLElement).click === "function"
	) {
		(element as HTMLElement).click();
	} else {
		// Fallback: dispatch a synthetic mouse event
		const mouseEvent = new MouseEvent("click", {
			view: window,
			bubbles: true,
			cancelable: true,
			buttons: 1,
		});
		element.dispatchEvent(mouseEvent);
	}

	track("click", { markerId });
}
