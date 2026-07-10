import { track } from "../store.js";
import { findMarkerElement } from "./find-element.js";

/**
 * Scrolls to a marker element by its ID
 * Does not apply highlight animation - use highlightMarker() if you want both scroll and highlight
 *
 * @param markerId - The marker ID to scroll to
 *
 * @example
 * ```ts
 * scrollToMarker('connect_stripe');
 * ```
 */
export function scrollToMarker(markerId: string): void {
	const element = findMarkerElement(markerId);
	if (!element) {
		console.warn(`Marker ${markerId} not found`);
		return;
	}

	element.scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "nearest",
	});

	track("scroll", { markerId });
}
