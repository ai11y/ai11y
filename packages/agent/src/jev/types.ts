import type { JevPlanRequest, JevPlanResponse } from "@ai11y/core/jev";
export interface JevServerConfig {
	apiKey: string;
	model?: string;
	client?: { systemOne: (args: unknown) => Promise<unknown> };
}
export type { JevPlanRequest, JevPlanResponse };
