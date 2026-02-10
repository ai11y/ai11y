import type { AgentRequest, AgentResponse, Instruction } from "@ai11y/core";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createLLM } from "./llm-provider.js";
import {
	createDefaultToolRegistry,
	type ToolRegistry,
} from "./tool-registry.js";
import type { ServerConfig } from "./types.js";

/**
 * Format context for the LLM prompt
 */
function formatContextForPrompt(context: AgentRequest["context"]): string {
	const parts: string[] = [];

	if (context.route) {
		parts.push(`Current route: ${context.route}`);
	}

	if (context.error) {
		const error = context.error.error;
		parts.push(
			`\n! Last error: ${error.message}${context.error.meta?.markerId ? ` (related to marker: ${context.error.meta.markerId})` : ""}`,
		);
		parts.push(
			"The user may want to retry the failed action. Look for markers related to the error.",
		);
	}

	if (context.state && Object.keys(context.state).length > 0) {
		parts.push(`\nApplication state: ${JSON.stringify(context.state)}`);
	}

	if (context.markers.length > 0) {
		parts.push("\nAvailable UI elements (markers):");
		for (const marker of context.markers) {
			const isInView = context.inViewMarkerIds?.includes(marker.id) ?? false;
			const inViewStatus = isInView ? " [IN VIEW]" : "";
			let markerLine = `  - ${marker.label} (ID: ${marker.id}, Type: ${marker.elementType})${inViewStatus}: ${marker.intent}`;

			if (marker.value !== undefined) {
				markerLine += `\n    Current value: "${marker.value}"`;
			}

			if (marker.options !== undefined) {
				const optionsList = marker.options
					.map((opt) => `${opt.label} (${opt.value})`)
					.join(", ");
				markerLine += `\n    Available options: ${optionsList}`;
			}
			if (
				marker.selectedOptions !== undefined &&
				marker.selectedOptions.length > 0
			) {
				markerLine += `\n    Selected: ${marker.selectedOptions.join(", ")}`;
			}

			parts.push(markerLine);
		}
	} else {
		parts.push("\nNo UI elements are currently available.");
	}

	if (context.inViewMarkerIds && context.inViewMarkerIds.length > 0) {
		parts.push(`\nVisible markers: ${context.inViewMarkerIds.join(", ")}`);
	}

	return parts.join("\n");
}

/**
 * Convert tool registry to LangChain tools
 */
function createLangChainTools(
	toolRegistry: ToolRegistry,
	context: AgentRequest["context"],
): DynamicStructuredTool[] {
	const tools: DynamicStructuredTool[] = [];
	const toolDefinitions = toolRegistry.getToolDefinitions();

	for (const toolDef of toolDefinitions) {
		const def = toolDef.function;

		const zodSchema: Record<string, z.ZodTypeAny> = {};
		for (const [key, param] of Object.entries(
			def.parameters.properties,
		) as Array<[string, { type: string; description: string }]>) {
			const zodType =
				param.type === "string"
					? z.string()
					: param.type === "number"
						? z.number()
						: param.type === "boolean"
							? z.boolean()
							: z.unknown();
			zodSchema[key] = zodType.describe(param.description);
		}

		const schema = z.object(zodSchema);

		const tool = new DynamicStructuredTool({
			name: def.name,
			description: def.description,
			schema,
			func: async (args: Record<string, unknown>) => {
				const result = await toolRegistry.executeToolCall(
					def.name,
					args,
					context,
				);
				return JSON.stringify(result);
			},
		});

		tools.push(tool);
	}

	return tools;
}

/**
 * Check if user input matches any marker and return matching marker info
 * Also checks if user is referring to a UI element (button, link, etc.) vs just a route
 */
function findMatchingMarker(
	input: string,
	markers: AgentRequest["context"]["markers"],
): {
	marker: AgentRequest["context"]["markers"][0];
	searchText: string;
	isElementReference: boolean;
} | null {
	const lowerInput = input.toLowerCase().trim();

	const hasNavigationLanguage =
		lowerInput.includes("go to") ||
		lowerInput.includes("navigate to") ||
		lowerInput.includes("open") ||
		lowerInput.includes("take me to");

	if (!hasNavigationLanguage) {
		return null;
	}

	const elementKeywords = [
		"button",
		"link",
		"nav button",
		"navigation button",
		"nav link",
		"navigation link",
		"element",
		"item",
		"tab",
	];
	const isElementReference = elementKeywords.some((keyword) =>
		lowerInput.includes(keyword),
	);

	const searchText = lowerInput
		.replace(/go to|navigate to|open|take me to/g, "")
		.trim();

	const matchingMarker = markers.find((m) => {
		const markerText = `${m.label} ${m.intent}`.toLowerCase();
		return (
			markerText.includes(searchText) ||
			lowerInput.includes(m.label.toLowerCase()) ||
			lowerInput.includes(m.intent.toLowerCase())
		);
	});

	return matchingMarker
		? { marker: matchingMarker, searchText, isElementReference }
		: null;
}

/**
 * LangChain response with tool calls
 */
interface LangChainResponseWithTools {
	tool_calls?: Array<{
		name?: string;
		args?: Record<string, unknown>;
		function?: {
			name?: string;
			arguments?: string | Record<string, unknown>;
		};
	}>;
	additional_kwargs?: {
		tool_calls?: Array<{
			name?: string;
			args?: Record<string, unknown>;
			function?: {
				name?: string;
				arguments?: string | Record<string, unknown>;
			};
		}>;
	};
}

/**
 * Type guard to check if response has tool calls
 */
function hasToolCalls(
	response: unknown,
): response is LangChainResponseWithTools {
	const kwargs = (response as LangChainResponseWithTools).additional_kwargs;
	return (
		typeof response === "object" &&
		response !== null &&
		("tool_calls" in response ||
			("additional_kwargs" in response &&
				typeof kwargs === "object" &&
				kwargs !== null &&
				"tool_calls" in kwargs))
	);
}

/**
 * Run the LLM agent on the server
 */
export async function runAgent(
	request: AgentRequest,
	config: ServerConfig,
	toolRegistry: ToolRegistry = createDefaultToolRegistry(),
): Promise<AgentResponse> {
	const llm = await createLLM(config);

	const markerMatch = findMatchingMarker(
		request.input,
		request.context.markers,
	);

	const contextPrompt = formatContextForPrompt(request.context);
	const langchainTools = createLangChainTools(toolRegistry, request.context);

	const llmWithTools =
		langchainTools.length > 0 && typeof llm.bindTools === "function"
			? llm.bindTools(langchainTools)
			: llm;

	let recentMarkerContext = "";
	if (request.messages && request.messages.length > 0) {
		const lastFewMessages = request.messages.slice(-4);
		for (const msg of lastFewMessages) {
			for (const marker of request.context.markers) {
				if (
					msg.content.toLowerCase().includes(marker.label.toLowerCase()) ||
					msg.content.toLowerCase().includes(marker.id.toLowerCase())
				) {
					recentMarkerContext += `\nRecently discussed: ${marker.label} (${marker.id}) - ${marker.intent}`;
					break;
				}
			}
		}
	}

	let markerMatchGuidance = "";
	if (markerMatch) {
		const marker = markerMatch.marker;
		const isInView =
			request.context.inViewMarkerIds?.includes(marker.id) ?? false;
		const isLink = marker.elementType === "a";

		if (isLink && isInView) {
			markerMatchGuidance = `\n\n⚠️ Match found: "${marker.label}" (${marker.id}) is a visible link. Use 'click' tool.`;
		} else if (isLink && !isInView) {
			markerMatchGuidance = `\n\n🚨 Match found: "${marker.label}" (${marker.id}) is a link NOT in view. You MUST call BOTH 'scroll' and 'click' (in that order)—two tool calls. Do not call only scroll.`;
		} else if (!isInView) {
			markerMatchGuidance = `\n\n🚨 Match found: "${marker.label}" (${marker.id}) is NOT in view. You MUST call BOTH 'scroll' and 'click' (or the appropriate action) in that order—two tool calls. Do not call only scroll.`;
		} else {
			markerMatchGuidance = `\n\nMatch found: "${marker.label}" (${marker.id}) is an element. Use 'scroll' tool.`;
		}
	}

	const systemPrompt = `You are a helpful AI agent embedded in a web application. Help users navigate, interact with UI elements, and resolve errors.

${contextPrompt}${recentMarkerContext}${markerMatchGuidance}

Reading marker values:
- You can read current values from markers in the context above
- For input/textarea elements: The "Current value" field shows what's currently entered
- For select elements: The "Available options" shows all choices, and "Selected" shows what's currently selected
- When users ask "what's in [field]" or "what's the value of [marker]", read the value from the context and respond with it
- You don't need a tool to read values - they're already in the context provided above

Navigation rules:
- "navigate to [element]" = scroll to that element (use 'scroll' tool)
- "navigate to [route]" = route navigation (use 'navigate' tool with route path)
- If marker matches and is in inViewMarkerIds + elementType='a' → use 'click'
- If no marker matches → use 'navigate' with route path
- For affirmative responses after discussing a marker, interact with that marker using the appropriate tool.

Scroll-then-act rule (CRITICAL):
- When the user wants to INTERACT with an element (click, press, increment, submit, fill, etc.) and the target marker is NOT in inViewMarkerIds: you MUST emit TWO tool calls in order—(1) 'scroll' to that marker, (2) the action ('click', 'fillInput', etc.). Emitting only 'scroll' is WRONG; the user asked for an action, so you must call both scroll and the action.
- Prefer the specific interactive element for the action (e.g. the button click_demo_increment for "increment counter"), not a parent section (e.g. slide_click). Emit one scroll to the exact target element, then the action.
- If the user only wants to see or navigate to an element (no click/fill), use a single 'scroll' to that element.

Relative scrolling rules (for "scroll to next" or "scroll to previous"):
- Markers are listed in document order (top to bottom) in the markers array
- CRITICAL: Always skip markers that are in inViewMarkerIds - only scroll to markers NOT currently in view
- For "scroll to next": Find the first marker in the markers array that comes after any currently visible markers and is NOT in inViewMarkerIds
- For "scroll to previous": Find the first marker in the markers array that comes before any currently visible markers and is NOT in inViewMarkerIds
- This prevents getting stuck on sections already in view

Multiple actions rules:
- When user says "all" (e.g., "highlight all badges", "click all buttons"), generate MULTIPLE tool calls - one for each matching marker
- When user specifies a count (e.g., "click 10 times", "increment counter 5 times"), generate MULTIPLE tool calls - repeat the action the specified number of times
- CRITICAL: You can and should call the same tool multiple times in a single response when the user requests multiple actions
- For "highlight all [type]" or "click all [type]": Find all markers matching the type and generate one tool call per marker
- For "[action] [count] times": Generate [count] identical tool calls`;

	const conversationMessages: Array<{ role: string; content: string }> = [
		{ role: "system", content: systemPrompt },
	];

	if (request.messages && request.messages.length > 0) {
		const recentMessages = request.messages.slice(-10);
		for (const msg of recentMessages) {
			conversationMessages.push({
				role: msg.role,
				content: msg.content,
			});
		}
	}

	conversationMessages.push({ role: "user", content: request.input });

	const response = await llmWithTools.invoke(conversationMessages);

	const instructions: Instruction[] = [];
	let reply = "";

	if (response.content) {
		if (typeof response.content === "string") {
			reply = response.content;
		} else if (Array.isArray(response.content)) {
			reply = response.content
				.map((c) => {
					if (typeof c === "string") return c;
					if (c && typeof c === "object" && "text" in c) return c.text;
					return "";
				})
				.join("");
		} else {
			reply = String(response.content);
		}
	}

	// LangChain stores tool calls in response.tool_calls or response.additional_kwargs.tool_calls
	const toolCallObjects: Array<{
		name?: string;
		args?: Record<string, unknown>;
		function?: {
			name?: string;
			arguments?: string | Record<string, unknown>;
		};
	}> = hasToolCalls(response)
		? response.tool_calls || response.additional_kwargs?.tool_calls || []
		: [];

	for (const toolCall of toolCallObjects) {
		const toolName = toolCall.name || toolCall.function?.name;
		const toolArgs =
			toolCall.args ||
			(toolCall.function?.arguments
				? typeof toolCall.function.arguments === "string"
					? JSON.parse(toolCall.function.arguments)
					: toolCall.function.arguments
				: {});

		if (toolName) {
			const converted = toolRegistry.convertToolCall({
				type: "function",
				function: {
					name: toolName,
					arguments: JSON.stringify(toolArgs),
				},
			});

			if (converted) {
				instructions.push(converted);
			} else {
				try {
					const result = await toolRegistry.executeToolCall(
						toolName,
						toolArgs,
						request.context,
					);
					if (result && typeof result === "object" && "action" in result) {
						instructions.push(result as Instruction);
					}
				} catch (error) {
					console.error(`Error executing tool ${toolName}:`, error);
				}
			}
		}
	}

	return {
		reply: reply || "I'm here to help!",
		instructions: instructions.length > 0 ? instructions : undefined,
	};
}
