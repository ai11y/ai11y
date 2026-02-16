import type { AgentRequest } from "@ai11y/core";
import type {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import { runAgent } from "./agent.js";
import {
	createDefaultToolRegistry,
	type ToolRegistry,
} from "./tool-registry.js";
import type { ServerConfig } from "./types.js";

interface FastifyAi11yOptions extends FastifyPluginOptions {
	config: ServerConfig;
	toolRegistry?: ToolRegistry;
}

/**
 * Fastify plugin for ai11y server
 *
 * @example
 * ```ts
 * import Fastify from 'fastify';
 * import { ai11yPlugin } from '@ai11y/agent/fastify';
 *
 * const fastify = Fastify();
 *
 * await fastify.register(ai11yPlugin, {
 *   config: {
 *     provider: 'openai',
 *     apiKey: process.env.OPENAI_API_KEY!,
 *     model: 'gpt-4o-mini'
 *   }
 * });
 *
 * await fastify.listen({ port: 3000 });
 * ```
 */
export async function ai11yPlugin(
	fastify: FastifyInstance,
	options: FastifyAi11yOptions,
) {
	const { config, toolRegistry = createDefaultToolRegistry() } = options;

	// Validate config
	if (!config.apiKey) {
		throw new Error("API key is required");
	}

	/**
	 * POST /ai11y/agent
	 * Main endpoint for agent requests
	 */
	fastify.post<{ Body: AgentRequest }>(
		"/ai11y/agent",
		async (
			request: FastifyRequest<{ Body: AgentRequest }>,
			reply: FastifyReply,
		) => {
			try {
				const response = await runAgent(request.body, config, toolRegistry);
				return reply.send(response);
			} catch (error) {
				fastify.log.error(error, "Error processing agent request");
				return reply.status(500).send({
					error: "Failed to process agent request",
					message: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
	);

	/**
	 * GET /ai11y/health
	 * Health check endpoint
	 */
	fastify.get("/ai11y/health", async (_request, reply) => {
		return reply.send({ status: "ok" });
	});
}

/**
 * Helper function to create a tool registry with custom tools.
 * Returns a ToolRegistry instance that supports method chaining.
 *
 * @example
 * ```ts
 * const registry = createToolRegistry()
 *   .register({
 *     name: "custom_action",
 *     description: "Perform a custom action",
 *     parameters: {
 *       type: "object",
 *       properties: {
 *         param: { type: "string", description: "A parameter" }
 *       },
 *       required: ["param"]
 *     }
 *   }, async (args) => {
 *     // Execute custom logic
 *     return { success: true };
 *   });
 * ```
 */
export function createToolRegistry(): ToolRegistry {
	return createDefaultToolRegistry();
}

export type { ServerConfig } from "./types.js";
