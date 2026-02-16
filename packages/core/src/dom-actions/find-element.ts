import { getMarkerSelector } from "../util/attributes.js";

/**
 * Finds an element by its marker ID (data-ai-id attribute)
 *
 * @param markerId - The marker ID to find
 * @returns The element if found, null otherwise
 */
export function findMarkerElement(markerId: string): Element | null {
	if (typeof document === "undefined") {
		return null;
	}
	return document.querySelector(getMarkerSelector(markerId));
}
