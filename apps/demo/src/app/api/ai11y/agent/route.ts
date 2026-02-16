import {
	createDefaultToolRegistry,
	runAgent,
	type ServerConfig,
} from "@ai11y/agent";
import type { AgentRequest } from "@ai11y/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		return NextResponse.json(
			{
				error: "Server not configured for LLM agent",
				message:
					"OPENAI_API_KEY is not set. Add it to .env.local to enable the LLM agent, or the client will fall back to the rule-based agent.",
			},
			{ status: 503 },
		);
	}

	let body: AgentRequest;
	try {
		body = (await request.json()) as AgentRequest;
	} catch {
		return NextResponse.json(
			{ error: "Invalid request", message: "Request body must be valid JSON" },
			{ status: 400 },
		);
	}

	if (!body.input || !body.context) {
		return NextResponse.json(
			{ error: "Invalid request", message: "input and context are required" },
			{ status: 400 },
		);
	}

	const config: ServerConfig = {
		provider: "openai",
		apiKey,
		model: process.env.LLM_MODEL,
		temperature:
			process.env.LLM_TEMPERATURE != null && process.env.LLM_TEMPERATURE !== ""
				? Number(process.env.LLM_TEMPERATURE)
				: 0,
		baseURL: process.env.OPENAI_BASE_URL,
	};

	try {
		const response = await runAgent(body, config, createDefaultToolRegistry());
		return NextResponse.json(response);
	} catch (error) {
		console.error("Agent request failed:", error);
		return NextResponse.json(
			{
				error: "Failed to process agent request",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
