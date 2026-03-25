/**
 * Event listener function type
 */
type EventListener = () => void;

/**
 * Set of event listeners
 */
const listeners = new Set<EventListener>();

/**
 * Subscribe to event notifications
 * Returns an unsubscribe function
 *
 * @param listener - Function to call when events are tracked
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * const unsubscribe = subscribe(() => {
 *   console.log('Event tracked!');
 * });
 * // Later...
 * unsubscribe();
 * ```
 */
export function subscribe(listener: EventListener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

/**
 * Notify all subscribers that an event has been tracked
 * This is called internally by the store when track() is called
 */
export function notify(): void {
	for (const listener of listeners) {
		try {
			listener();
		} catch (error) {
			// Don't let one listener's error break others
			console.error("Error in event listener:", error);
		}
	}
}

/**
 * Get the number of active subscribers
 * Useful for debugging
 */
export function getSubscriberCount(): number {
	return listeners.size;
}
