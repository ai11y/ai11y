import type { Ai11yContext } from "../context.js";

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: {
		type: "object";
		properties: Record<
			string,
			{
				type: string;
				description: string;
			}
		>;
		required?: string[];
	};
}

export type ToolExecutor = (
	args: Record<string, unknown>,
	context: Ai11yContext,
) => Promise<unknown> | unknown;
