import type { Ai11yContext } from "../context.js";
import type { Instruction } from "../instruction.js";

export interface AgentResponse {
	reply: string;
	instructions?: Instruction[];
}

export interface ConversationMessage {
	role: "user" | "assistant";
	content: string;
}

export interface AgentRequest {
	input: string;
	context: Ai11yContext;
	messages?: ConversationMessage[];
}

/**
 * Configuration for LLM-based agent
 */
export interface LLMAgentConfig {
	/**
	 * API endpoint URL for the agent server (e.g., "http://localhost:3000/ai11y/agent")
	 */
	apiEndpoint: string;
}

/**
 * Agent mode selection
 */
export type AgentMode = "llm" | "rule-based" | "auto";

/**
 * Configuration for agent selection
 */
export interface AgentAdapterConfig {
	/**
	 * Agent mode selection strategy
	 * - "llm": Always use LLM agent (requires llmConfig)
	 * - "rule-based": Always use rule-based agent
	 * - "auto": Use LLM if configured, fallback to rule-based on error or when offline
	 * @default "auto"
	 */
	mode?: AgentMode;

	/**
	 * LLM configuration (required for "llm" mode, optional for "auto")
	 */
	llmConfig?: LLMAgentConfig | null;

	/**
	 * Force rule-based mode (skip LLM even if config is available)
	 * @default false
	 */
	forceRuleBased?: boolean;
}

/**
 * Unified agent configuration combining LLM settings with agent selection options
 */
export interface AgentConfig {
	/**
	 * API endpoint URL for the LLM agent server (required for "llm" mode)
	 */
	apiEndpoint?: string;

	/**
	 * Agent mode selection strategy
	 * - "llm": Always use LLM agent (requires apiEndpoint)
	 * - "rule-based": Always use rule-based agent
	 * - "auto": Use LLM if apiEndpoint is provided, fallback to rule-based on error or when offline
	 * @default "auto"
	 */
	mode?: AgentMode;

	/**
	 * Force rule-based mode (skip LLM even if apiEndpoint is available)
	 * @default false
	 */
	forceRuleBased?: boolean;
}
