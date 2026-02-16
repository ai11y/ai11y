import { setRoute, track } from "../store.js";

/**
 * Navigates to a route
 * Updates the route in the store and tracks the navigation event
 *
 * @param route - The route to navigate to
 *
 * @example
 * ```ts
 * navigateToRoute('/billing');
 * ```
 */
export function navigateToRoute(route: string): void {
	setRoute(route);
	track("navigate", { route });
}
