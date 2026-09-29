import type { Ai11yContext } from "../context.js";
import type { Instruction } from "../instruction.js";

export interface JevActionHistoryEntry {
	step: number;
	instructions: Instruction[];
}
export interface JevPlanRequest {
	input: string;
	context: Ai11yContext;
	history?: JevActionHistoryEntry[];
}
export type JevPlanOutcome = "action" | "completed" | "needs-input" | "result";
export interface JevClarificationOption {
	label: string;
	value: string;
	/** Marker represented by this option, used for client-side previews. */
	markerId?: string;
}
export interface JevResult {
	type: "marker-value" | "state-value";
	markerId?: string;
	key?: string;
	label: string;
	value: string;
	redacted?: boolean;
}
export interface JevPlanResponse {
	outcome: JevPlanOutcome;
	instructions?: Instruction[];
	confidence: number;
	decisionId: string;
	summary: string;
	choices?: JevClarificationOption[];
	result?: JevResult;
	/** Whether this action fully satisfies the request without another planning call. */
	terminal?: boolean;
}
export interface JevPlanConfig {
	apiEndpoint: string;
	signal?: AbortSignal;
}
