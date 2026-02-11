/**
 * Attribute name constants for data-ai-* attributes
 */
export const ATTRIBUTE_ID = "data-ai-id";
export const ATTRIBUTE_LABEL = "data-ai-label";
export const ATTRIBUTE_INTENT = "data-ai-intent";
export const ATTRIBUTE_SENSITIVE = "data-ai-sensitive";

/**
 * Gets the value of the data-ai-id attribute from an element
 *
 * @param element - The element to get the attribute from
 * @returns The marker ID or null if not found
 */
export function getMarkerId(element: Element): string | null {
	return element.getAttribute(ATTRIBUTE_ID);
}

/**
 * Gets the value of the data-ai-label attribute from an element
 *
 * @param element - The element to get the attribute from
 * @returns The marker label or null if not found
 */
export function getMarkerLabel(element: Element): string | null {
	return element.getAttribute(ATTRIBUTE_LABEL);
}

/**
 * Gets the value of the data-ai-intent attribute from an element
 *
 * @param element - The element to get the attribute from
 * @returns The marker intent or null if not found
 */
export function getMarkerIntent(element: Element): string | null {
	return element.getAttribute(ATTRIBUTE_INTENT);
}

/**
 * Creates a query selector for finding an element by marker ID
 *
 * @param markerId - The marker ID to search for
 * @returns A query selector string
 *
 * @example
 * ```ts
 * const selector = getMarkerSelector('connect_stripe');
 * // Returns: '[data-ai-id="connect_stripe"]'
 * ```
 */
export function getMarkerSelector(markerId: string): string {
	return `[${ATTRIBUTE_ID}="${markerId}"]`;
}

/**
 * Creates a query selector for finding all elements with marker IDs
 *
 * @returns A query selector string
 *
 * @example
 * ```ts
 * const selector = getAllMarkersSelector();
 * // Returns: '[data-ai-id]'
 * ```
 */
export function getAllMarkersSelector(): string {
	return `[${ATTRIBUTE_ID}]`;
}
