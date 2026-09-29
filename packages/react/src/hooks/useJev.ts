import type { Instruction } from "@ai11y/core";
import {
	type JevActionHistoryEntry,
	type JevClarificationOption,
	type JevResult,
	plan,
} from "@ai11y/core/jev";
import { useCallback, useRef, useState } from "react";
import { useAi11yContext } from "./useAi11yContext.js";
export type JevRunStatus =
	| { state: "idle" }
	| { state: "evaluating"; step: number }
	| { state: "acting"; step: number; summary: string }
	| { state: "completed"; steps: number; summary: string }
	| { state: "result"; steps: number; summary: string; result: JevResult }
	| {
			state: "needs-input";
			steps: number;
			summary: string;
			choices?: JevClarificationOption[];
	  }
	| { state: "error"; steps: number; message: string };
export interface UseJevOptions {
	apiEndpoint: string;
	maxSteps?: number;
	minConfidence?: number;
	settle?: () => Promise<void>;
	onInstruction?: (instruction: Instruction) => void;
}
const frames = () =>
	typeof requestAnimationFrame === "function"
		? new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			)
		: Promise.resolve();
export function useJev(options: UseJevOptions) {
	const ctx = useAi11yContext();
	const [status, setStatus] = useState<JevRunStatus>({ state: "idle" });
	const controller = useRef<AbortController | null>(null);
	const runId = useRef(0);
	const max = Math.min(20, Math.max(1, options.maxSteps ?? 8));
	const min = Math.min(1, Math.max(0, options.minConfidence ?? 0.6));
	const cancel = useCallback(() => {
		controller.current?.abort();
		controller.current = null;
		setStatus({ state: "idle" });
	}, []);
	const reset = useCallback(() => setStatus({ state: "idle" }), []);
	const run = useCallback(
		async (input: string) => {
			if (!input.trim()) return;
			cancel();
			const id = ++runId.current;
			const ac = new AbortController();
			controller.current = ac;
			const history: JevActionHistoryEntry[] = [];
			let previous = "";
			try {
				for (let step = 1; step <= max; step++) {
					if (ac.signal.aborted) return;
					setStatus({ state: "evaluating", step });
					const response = await plan(
						{ input, context: ctx.describe(), history },
						{ apiEndpoint: options.apiEndpoint, signal: ac.signal },
					);
					if (response.confidence < min) {
						setStatus({
							state: "needs-input",
							steps: step - 1,
							summary: "JEV couldn't choose a safe next action.",
						});
						return;
					}
					if (response.outcome !== "action") {
						if (response.outcome === "result" && response.result) {
							setStatus({
								state: "result",
								steps: step - 1,
								summary: response.summary,
								result: response.result,
							});
							return;
						}
						setStatus({
							state: response.outcome,
							steps: step - 1,
							summary: response.summary,
							choices: response.choices,
						} as JevRunStatus);
						return;
					}
					const instructions = response.instructions ?? [];
					const signature = JSON.stringify(instructions);
					if (signature === previous) {
						setStatus({
							state: "needs-input",
							steps: step - 1,
							summary: "JEV stopped before repeating the same action.",
						});
						return;
					}
					previous = signature;
					setStatus({ state: "acting", step, summary: response.summary });
					for (const instruction of instructions) {
						ctx.act(instruction);
						options.onInstruction?.(instruction);
					}
					history.push({ step, instructions });
					ctx.track("jev_decision", {
						outcome: response.outcome,
						confidence: response.confidence,
						step,
						decisionId: response.decisionId,
						actions: instructions.map((x: Instruction) => x.action),
					});
					if (response.terminal) {
						setStatus({
							state: "completed",
							steps: step,
							summary: response.summary,
						});
						return;
					}
					await (options.settle ?? frames)();
				}
				setStatus({
					state: "needs-input",
					steps: max,
					summary: "JEV stopped at the safe action limit.",
				});
			} catch (error) {
				if (!ac.signal.aborted && id === runId.current)
					setStatus({
						state: "error",
						steps: history.length,
						message: error instanceof Error ? error.message : "JEV failed",
					});
			}
		},
		[ctx, options, cancel, max, min],
	);
	return {
		status,
		isRunning: status.state === "evaluating" || status.state === "acting",
		run,
		cancel,
		reset,
	};
}
