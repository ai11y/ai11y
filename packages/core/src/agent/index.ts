/**
 * Agent module - provides different agent implementations
 *
 * Agents:
 * - runRuleBasedAgent: Pattern-matching agent for common commands (works offline)
 * - runLLMAgent: LLM-based agent using server-side API
 * - runAgentAdapter: Unified adapter that selects the appropriate agent
 */

export { runAgentAdapter } from "./agent-adapter.js";
export { runLLMAgent } from "./llm-agent.js";
export { runRuleBasedAgent } from "./rule-based-agent.js";
export type {
	AgentAdapterConfig,
	AgentConfig,
	AgentMode,
	AgentRequest,
	AgentResponse,
	ConversationMessage,
	LLMAgentConfig,
} from "./types.js";
