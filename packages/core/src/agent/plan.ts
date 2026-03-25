import type { Ai11yContext } from "../context.js";
import { runAgentAdapter } from "./agent-adapter.js";
import type {
	AgentAdapterConfig,
	AgentResponse,
	ConversationMessage,
} from "./types.js";

/**
 * Plans instructions based on UI context and user input
 *
 * @param ui - The current UI context
 * @param input - User input/command
 * @param config - Optional agent configuration
 * @param messages - Optional conversation history
 * @returns The full agent response containing both reply and instructions
 *
 * @example
 * ```ts
 * const ui = ctx.describe()
 * const response = await plan(ui, "click save button", config)
 * for (const instruction of response.instructions || []) {
 *   ctx.act(instruction)
 * }
 * ```
 */
export async function plan(
	ui: Ai11yContext,
	input: string,
	config?: AgentAdapterConfig,
	messages?: ConversationMessage[],
): Promise<AgentResponse> {
	const response: AgentResponse = await runAgentAdapter(
		input,
		ui,
		config,
		messages,
	);

	return response;
}
