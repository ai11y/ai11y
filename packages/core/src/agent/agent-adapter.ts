import type { Ai11yContext } from "../context.js";
import { runLLMAgent } from "./llm-agent.js";
import { runRuleBasedAgent } from "./rule-based-agent.js";
import type {
	AgentAdapterConfig,
	AgentResponse,
	ConversationMessage,
} from "./types.js";

/**
 * Detect if we're likely offline (browser only)
 */
function isLikelyOffline(): boolean {
	if (typeof navigator !== "undefined" && "onLine" in navigator) {
		return !navigator.onLine;
	}
	return false;
}

/**
 * Select and run the appropriate agent based on configuration.
 *
 * This adapter handles agent selection logic:
 * - "llm": Always use LLM agent (requires llmConfig)
 * - "rule-based": Always use rule-based agent
 * - "auto": Use LLM if configured, fallback to rule-based on error or when offline
 */
export async function runAgentAdapter(
	input: string,
	context: Ai11yContext,
	config: AgentAdapterConfig = {},
	messages?: ConversationMessage[],
): Promise<AgentResponse> {
	const { mode = "auto", llmConfig = null, forceRuleBased = false } = config;

	// Force rule-based agent if explicitly requested
	if (forceRuleBased || mode === "rule-based") {
		return runRuleBasedAgent(input, context);
	}

	if (mode === "llm") {
		if (!llmConfig) {
			console.warn(
				"LLM mode requested but no llmConfig provided. Falling back to rule-based agent.",
			);
			return runRuleBasedAgent(input, context);
		}
		return runLLMAgent(input, context, llmConfig, messages);
	}

	// Auto mode: try LLM if available, fallback to rule-based
	if (mode === "auto" || !mode) {
		// Check if we're offline - use rule-based
		if (isLikelyOffline()) {
			return runRuleBasedAgent(input, context);
		}

		// Try LLM if configured
		if (llmConfig) {
			try {
				return await runLLMAgent(input, context, llmConfig, messages);
			} catch (error) {
				// runLLMAgent already falls back to rule-based, but we catch here for safety
				console.warn("LLM agent failed, using rule-based fallback:", error);
				return runRuleBasedAgent(input, context);
			}
		}

		// Default to rule-based
		return runRuleBasedAgent(input, context);
	}

	// Fallback (shouldn't reach here)
	return runRuleBasedAgent(input, context);
}
