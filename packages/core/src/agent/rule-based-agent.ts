import type { Ai11yContext } from "../context.js";
import type { Instruction } from "../instruction.js";
import type { AgentResponse } from "./types.js";

/**
 * Rule-based agent that uses pattern matching for common commands.
 * Provides immediate responses without requiring an LLM.
 */
export function runRuleBasedAgent(
	input: string,
	context: Ai11yContext,
): AgentResponse {
	const lowerInput = input.toLowerCase().trim();

	// Handle navigation commands
	if (
		lowerInput.includes("go to") ||
		lowerInput.includes("navigate to") ||
		lowerInput.includes("open") ||
		lowerInput.includes("take me to")
	) {
		// First, check if input matches any marker
		const searchText = lowerInput
			.replace(/go to|navigate to|open|take me to/g, "")
			.trim();
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			return (
				markerText.includes(searchText) ||
				lowerInput.includes(m.label.toLowerCase()) ||
				lowerInput.includes(m.intent.toLowerCase())
			);
		});

		// If a marker matches, decide based on element type and visibility
		if (matchingMarker) {
			const isInView =
				context.inViewMarkerIds?.includes(matchingMarker.id) ?? false;
			const isLink = matchingMarker.elementType === "a";

			// If it's a link marker and in view, click it (navigate)
			if (isLink && isInView) {
				return {
					reply: `Navigating to ${matchingMarker.label}...`,
					instructions: [{ action: "click", id: matchingMarker.id }],
				};
			}

			// If it's a link marker but not in view, scroll to it first
			if (isLink && !isInView) {
				return {
					reply: `Scrolling to ${matchingMarker.label}...`,
					instructions: [{ action: "scroll", id: matchingMarker.id }],
				};
			}

			// For non-link markers (sections, divs), scroll to them
			return {
				reply: `Scrolling to ${matchingMarker.label}...`,
				instructions: [{ action: "scroll", id: matchingMarker.id }],
			};
		}

		// No marker found, proceed with route navigation
		const instructions: Instruction[] = [];

		// Extract route from input
		let route = "/";
		if (lowerInput.includes("billing")) {
			route = "/billing";
		} else if (lowerInput.includes("integrations")) {
			route = "/integrations";
		} else if (lowerInput.includes("home")) {
			route = "/";
		}

		if (route !== context.route) {
			instructions.push({ action: "navigate", route });
			return {
				reply: `Navigating to ${route === "/" ? "home" : route}...`,
				instructions,
			};
		} else {
			return {
				reply: `You're already on ${route === "/" ? "home" : route}.`,
			};
		}
	}

	// Handle click commands
	if (lowerInput.includes("click") || lowerInput.includes("press")) {
		// Find matching marker
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			return (
				markerText.includes(lowerInput.replace(/click|press/g, "").trim()) ||
				lowerInput.includes(m.label.toLowerCase()) ||
				lowerInput.includes(m.intent.toLowerCase())
			);
		});

		if (matchingMarker) {
			return {
				reply: `Clicking ${matchingMarker.label}...`,
				instructions: [{ action: "click", id: matchingMarker.id }],
			};
		} else {
			return {
				reply: `I couldn't find a button or element matching "${input}". Available options: ${context.markers.map((m) => m.label).join(", ") || "none"}`,
			};
		}
	}

	// Handle scroll commands (scroll to element)
	if (
		lowerInput.includes("scroll to") ||
		lowerInput.includes("scroll") ||
		lowerInput.includes("show me")
	) {
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			const searchText = lowerInput
				.replace(/scroll to|scroll|show me/g, "")
				.trim();
			return (
				markerText.includes(searchText) ||
				lowerInput.includes(m.label.toLowerCase())
			);
		});

		if (matchingMarker) {
			// If user explicitly wants to scroll, use scroll tool
			// Otherwise, if they say "show me" or "highlight", use highlight (which now scrolls)
			if (lowerInput.includes("scroll")) {
				return {
					reply: `Scrolling to ${matchingMarker.label}...`,
					instructions: [{ action: "scroll", id: matchingMarker.id }],
				};
			}
		}
	}

	// Handle highlight commands
	if (lowerInput.includes("highlight") || lowerInput.includes("show")) {
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			return (
				markerText.includes(lowerInput.replace(/highlight|show/g, "").trim()) ||
				lowerInput.includes(m.label.toLowerCase())
			);
		});

		if (matchingMarker) {
			return {
				reply: `Highlighting ${matchingMarker.label}...`,
				instructions: [{ action: "highlight", id: matchingMarker.id }],
			};
		}
	}

	// Handle fill input commands
	if (
		lowerInput.includes("fill") ||
		lowerInput.includes("enter") ||
		lowerInput.includes("type") ||
		lowerInput.includes("put")
	) {
		// Try to extract value from commands like:
		// "fill email with test@example.com"
		// "enter test@example.com in email"
		// "type test@example.com in email input"
		// "put test@example.com in email"
		let value: string | undefined;
		let markerSearchText = lowerInput;

		// Pattern: "fill [marker] with [value]" or "fill [marker] [value]"
		const fillWithMatch = lowerInput.match(
			/(?:fill|enter|type|put)\s+(.+?)\s+(?:with|in|into)\s+(.+)/i,
		);
		if (fillWithMatch) {
			markerSearchText = fillWithMatch[1].trim();
			value = fillWithMatch[2].trim();
		} else {
			// Pattern: "fill [value] in [marker]" or "enter [value] in [marker]"
			const fillInMatch = lowerInput.match(
				/(?:fill|enter|type|put)\s+(.+?)\s+in\s+(.+)/i,
			);
			if (fillInMatch) {
				value = fillInMatch[1].trim();
				markerSearchText = fillInMatch[2].trim();
			} else {
				// Pattern: "[value] in [marker]"
				const inMatch = lowerInput.match(/(.+?)\s+in\s+(.+)/i);
				if (inMatch) {
					value = inMatch[1].trim();
					markerSearchText = inMatch[2].trim();
				}
			}
		}

		// Find matching marker (look for input-like elements)
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			const cleanedMarkerSearch = markerSearchText
				.replace(/fill|enter|type|put|input|field/g, "")
				.trim();
			return (
				markerText.includes(cleanedMarkerSearch) ||
				cleanedMarkerSearch.includes(m.label.toLowerCase()) ||
				cleanedMarkerSearch.includes(m.id.toLowerCase())
			);
		});

		if (matchingMarker && value) {
			return {
				reply: `Filling ${matchingMarker.label} with "${value}"...`,
				instructions: [
					{
						action: "fillInput",
						id: matchingMarker.id,
						value: value,
					},
				],
			};
		} else if (matchingMarker && !value) {
			return {
				reply: `I found ${matchingMarker.label}, but I need a value to fill. Please specify what to enter, for example: "fill ${matchingMarker.label.toLowerCase()} with [value]"`,
			};
		}
	}

	// Handle error context
	if (context.error) {
		const error = context.error.error;
		const errorMessage = error.message || "An error occurred";

		if (
			lowerInput.includes("retry") ||
			lowerInput.includes("try again") ||
			lowerInput.includes("fix")
		) {
			// Try to find a retry action
			if (context.error.meta?.markerId) {
				const marker = context.markers.find(
					(m) => m.id === context.error?.meta?.markerId,
				);
				if (marker) {
					return {
						reply: `Retrying ${marker.label}...`,
						instructions: [{ action: "click", id: marker.id }],
					};
				}
			}

			return {
				reply: `I can help you retry. The error was: ${errorMessage}. Would you like me to try clicking the button again?`,
			};
		}

		return {
			reply: `I noticed an error: ${errorMessage}. You can ask me to "retry" or "try again" to attempt the action once more.`,
		};
	}

	// Default response
	return {
		reply: `I can help you navigate, click buttons, highlight elements, or fill inputs. Try saying "go to billing", "click connect stripe", "show me the enable billing button", or "fill email with test@example.com".`,
	};
}
