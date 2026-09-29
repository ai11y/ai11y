import type { Instruction } from "../instruction.js";
import type {
	JevPlanConfig,
	JevPlanRequest,
	JevPlanResponse,
} from "./types.js";

function validInstruction(value: unknown): value is Instruction {
	if (
		!value ||
		typeof value !== "object" ||
		typeof (value as { action?: unknown }).action !== "string"
	)
		return false;
	const item = value as Record<string, unknown>;
	if (
		!["click", "navigate", "highlight", "scroll", "fillInput"].includes(
			item.action as string,
		)
	)
		return false;
	if (item.action === "fillInput")
		return typeof item.id === "string" && typeof item.value === "string";
	return (
		typeof item.id === "string" ||
		(item.action === "navigate" && typeof item.route === "string")
	);
}
function validate(value: unknown): JevPlanResponse {
	if (!value || typeof value !== "object")
		throw new Error("Invalid JEV response");
	const item = value as Record<string, unknown>;
	if (
		!["action", "completed", "needs-input", "result"].includes(
			item.outcome as string,
		)
	)
		throw new Error("Invalid JEV outcome");
	if (
		typeof item.confidence !== "number" ||
		item.confidence < 0 ||
		item.confidence > 1
	)
		throw new Error("Invalid JEV confidence");
	if (typeof item.decisionId !== "string" || typeof item.summary !== "string")
		throw new Error("Invalid JEV response fields");
	if (
		item.outcome === "action" &&
		(!Array.isArray(item.instructions) ||
			item.instructions.length === 0 ||
			!item.instructions.every(validInstruction))
	)
		throw new Error("Invalid JEV instructions");
	if (
		item.choices !== undefined &&
		(!Array.isArray(item.choices) ||
			!item.choices.every(
				(choice) =>
					choice &&
					typeof choice === "object" &&
					typeof (choice as Record<string, unknown>).label === "string" &&
					typeof (choice as Record<string, unknown>).value === "string" &&
					((choice as Record<string, unknown>).markerId === undefined ||
						typeof (choice as Record<string, unknown>).markerId === "string"),
			))
	)
		throw new Error("Invalid JEV choices");
	if (item.outcome === "result") {
		const result = item.result as Record<string, unknown> | undefined;
		if (
			!result ||
			!["marker-value", "state-value"].includes(result.type as string) ||
			(result.type === "marker-value" && typeof result.markerId !== "string") ||
			(result.type === "state-value" && typeof result.key !== "string") ||
			typeof result.label !== "string" ||
			typeof result.value !== "string" ||
			(result.redacted !== undefined && typeof result.redacted !== "boolean")
		)
			throw new Error("Invalid JEV result");
	}
	if (item.terminal !== undefined && typeof item.terminal !== "boolean")
		throw new Error("Invalid JEV terminal flag");
	return item as unknown as JevPlanResponse;
}
export async function plan(
	request: JevPlanRequest,
	config: JevPlanConfig,
): Promise<JevPlanResponse> {
	const context = {
		...request.context,
		error: request.context.error
			? {
					message: request.context.error.error?.message,
					meta: request.context.error.meta,
					timestamp: request.context.error.timestamp,
				}
			: null,
	};
	const response = await fetch(config.apiEndpoint, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ ...request, context }),
		signal: config.signal,
	});
	if (!response.ok) throw new Error(`JEV request failed (${response.status})`);
	return validate(await response.json());
}
