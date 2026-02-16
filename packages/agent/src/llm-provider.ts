/**
 * LLM Provider Factory
 * Creates LangChain-compatible LLM instances for OpenAI
 */

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ServerConfig } from "./types.js";

/**
 * Create a LangChain LLM instance for OpenAI
 */
export async function createLLM(config: ServerConfig): Promise<BaseChatModel> {
	const { ChatOpenAI } = await import("@langchain/openai");
	return new ChatOpenAI({
		modelName: config.model || "gpt-5-nano",
		temperature: config.temperature ?? 0,
		openAIApiKey: config.apiKey,
		configuration: config.baseURL
			? {
					baseURL: config.baseURL,
				}
			: undefined,
	});
}
