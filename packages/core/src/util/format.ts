/**
 * Formats a marker ID into a readable label
 * Converts snake_case to Title Case
 *
 * @param id - The marker ID to format
 * @returns A formatted label
 *
 * @example
 * ```ts
 * formatMarkerId('connect_stripe');
 * // Returns: 'Connect Stripe'
 * ```
 */
export function formatMarkerId(id: string): string {
	return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
