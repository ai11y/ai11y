import { randomUUID } from "node:crypto";
import type { JevPlanRequest, JevPlanResponse } from "@ai11y/core/jev";
import { buildCandidates } from "./candidates.js";
import type { JevServerConfig } from "./types.js";

const highlightStopWords = new Set([
	"highlight",
	"all",
	"the",
	"a",
	"an",
	"please",
]);

function singularWord(value: string) {
	if (value.endsWith("ies") && value.length > 3)
		return `${value.slice(0, -3)}y`;
	if (value.endsWith("s") && !value.endsWith("ss") && value.length > 2)
		return value.slice(0, -1);
	return value;
}

function allHighlightMarkers(request: JevPlanRequest) {
	if (!/^\s*highlight\s+all\b/i.test(request.input)) return;
	const targetWords = words(request.input)
		.filter((word) => !highlightStopWords.has(word))
		.map(singularWord);
	if (targetWords.length === 0) return;
	const matches = request.context.markers.filter((marker) => {
		const descriptionWords = new Set(
			words(`${marker.id} ${marker.label} ${marker.intent}`).map(singularWord),
		);
		return targetWords.every((word) => descriptionWords.has(word));
	});
	return matches.length > 0 ? matches : undefined;
}

function words(value: string) {
	return value.toLowerCase().split(/\W+/).filter(Boolean);
}

function uniqueHighlightMarker(request: JevPlanRequest) {
	if (!/^\s*highlight\b/i.test(request.input)) return;
	const targetWords = words(request.input).filter(
		(word) => !highlightStopWords.has(word),
	);
	if (targetWords.length === 0) return;
	const matches = request.context.markers
		.map((marker) => {
			const descriptionWords = words(
				`${marker.id} ${marker.label} ${marker.intent}`,
			);
			return {
				marker,
				score: targetWords.filter((word) => descriptionWords.includes(word))
					.length,
			};
		})
		.filter(({ score }) => score > 0);
	const best = Math.max(0, ...matches.map(({ score }) => score));
	const bestMatches = matches.filter(({ score }) => score === best);
	return bestMatches.length === 1 ? bestMatches[0]?.marker : undefined;
}

function directFill(request: JevPlanRequest) {
	const match = request.input.match(
		/^\s*(?:set|fill|enter|type)\s+(?:the\s+)?(.+?)\s+(?:to|with)\s+(.+)$/i,
	);
	if (!match?.[1] || !match[2]) return;
	const targetWords = words(match[1]);
	const quotedValue = match[2].match(/^["']([^"']+)["']$/)?.[1];
	const value = quotedValue ?? match[2].trim();
	if (!value || targetWords.length === 0) return;
	const matches = request.context.markers
		.filter(
			(marker) =>
				["input", "textarea", "select"].includes(marker.elementType) ||
				marker.value !== undefined ||
				marker.options !== undefined,
		)
		.map((marker) => {
			const descriptionWords = words(
				`${marker.id} ${marker.label} ${marker.intent}`,
			);
			return {
				marker,
				score: targetWords.filter((word) => descriptionWords.includes(word))
					.length,
			};
		})
		.filter(({ score }) => score > 0);
	const best = Math.max(0, ...matches.map(({ score }) => score));
	const bestMatches = matches.filter(({ score }) => score === best);
	if (bestMatches.length === 0) return;
	if (bestMatches.length > 1)
		return {
			value,
			choices: bestMatches.map(({ marker }) => ({
				label: marker.label || marker.id,
				value: `set ${marker.id} to ${JSON.stringify(value)}`,
				markerId: marker.id,
			})),
		};
	return { marker: bestMatches[0]?.marker, value };
}

function directRead(request: JevPlanRequest) {
	const exact = request.input.match(/^\s*read\s+(.+?)\s+value\s*$/i)?.[1];
	const isReadRequest =
		exact !== undefined ||
		/\b(?:what\s+is|show|read|return|get)\b.*\bvalue\b/i.test(request.input);
	if (!isReadRequest) return;
	const ignored = new Set([
		"what",
		"is",
		"show",
		"me",
		"read",
		"return",
		"get",
		"the",
		"value",
		"of",
	]);
	const targetWords = words(exact ?? request.input).filter(
		(word) => !ignored.has(word),
	);
	if (targetWords.length === 0) return;
	const matches = request.context.markers
		.filter((marker) => marker.value !== undefined)
		.map((marker) => {
			const descriptionWords = words(
				`${marker.id} ${marker.label} ${marker.intent}`,
			);
			return {
				marker,
				score: targetWords.filter((word) => descriptionWords.includes(word))
					.length,
			};
		})
		.filter(({ score }) => score > 0);
	const best = Math.max(0, ...matches.map(({ score }) => score));
	const bestMatches = matches.filter(({ score }) => score === best);
	if (bestMatches.length === 0) return;
	const populatedMatches = bestMatches.filter(
		({ marker }) => marker.value !== "" && marker.value !== undefined,
	);
	if (populatedMatches.length === 1)
		return { marker: populatedMatches[0]?.marker };
	if (bestMatches.length > 1)
		return {
			choices: bestMatches.map(({ marker }) => ({
				label: marker.label || marker.id,
				value: `read ${marker.id} value`,
				markerId: marker.id,
			})),
		};
	return { marker: bestMatches[0]?.marker };
}

function directNavigation(request: JevPlanRequest) {
	const match = request.input.match(
		/^\s*(?:go|navigate)(?:\s+to)?\s+(.+?)\s*$/i,
	)?.[1];
	if (!match) return;
	const targetWords = words(match).filter(
		(word) => !["the", "page", "route"].includes(word),
	);
	if (targetWords.length === 0) return;
	const matches = request.context.markers
		.filter((marker) => marker.route)
		.map((marker) => {
			const descriptionWords = words(
				`${marker.id} ${marker.label} ${marker.intent} ${marker.route}`,
			);
			return {
				marker,
				score: targetWords.filter((word) => descriptionWords.includes(word))
					.length,
			};
		})
		.filter(({ score }) => score > 0);
	const best = Math.max(0, ...matches.map(({ score }) => score));
	const bestMatches = matches.filter(({ score }) => score === best);
	return bestMatches.length === 1 ? bestMatches[0]?.marker : undefined;
}

function directSectionNavigation(request: JevPlanRequest) {
	const direction = request.input
		.match(/\b(next|previous)\s+section\b/i)?.[1]
		?.toLowerCase();
	if (!direction) return;
	const sections = request.context.markers.filter(
		(marker) =>
			/\bsection\b/i.test(marker.label) &&
			/\bnavigate\b.*\bsection\b/i.test(marker.intent),
	);
	if (sections.length === 0) return;
	const inView = new Set(request.context.inViewMarkerIds ?? []);
	const visibleIndexes = sections
		.map((marker, index) => (inView.has(marker.id) ? index : -1))
		.filter((index) => index >= 0);
	const targetIndex =
		direction === "next"
			? visibleIndexes.length
				? Math.max(...visibleIndexes) + 1
				: 0
			: visibleIndexes.length
				? Math.min(...visibleIndexes) - 1
				: sections.length - 1;
	return sections[targetIndex];
}

function directStateResult(request: JevPlanRequest) {
	const state = request.context.state;
	if (!state) return;
	const input = request.input.toLowerCase();
	if (/\bpermissions?\b/.test(input)) {
		const permissionEntries = Object.entries(state).filter(
			([key, value]) => key.startsWith("can") && typeof value === "boolean",
		);
		if (permissionEntries.length === 0) return;
		const lines = permissionEntries.map(([key, value]) => {
			const action = key
				.replace(/^can/, "")
				.replace(/([a-z])([A-Z])/g, "$1 $2")
				.toLowerCase();
			return `${value ? "Can" : "Cannot"} ${action}`;
		});
		if (typeof state.role === "string") lines.unshift(`Role: ${state.role}`);
		if (typeof state.plan === "string") lines.unshift(`Plan: ${state.plan}`);
		return {
			key: "permissions",
			label: "Your permissions",
			value: lines.join("\n"),
		};
	}
	for (const key of ["role", "plan"]) {
		if (new RegExp(`\\b${key}\\b`).test(input) && state[key] !== undefined)
			return {
				key,
				label: key[0]?.toUpperCase() + key.slice(1),
				value: String(state[key]),
			};
	}
	if (/\b(?:can i|am i allowed)\b/.test(input)) {
		const targetWords = words(input).filter(
			(word) =>
				![
					"can",
					"i",
					"am",
					"allowed",
					"to",
					"this",
					"the",
					"data",
					"project",
				].includes(word),
		);
		const matches = Object.entries(state)
			.filter(
				([key, value]) => key.startsWith("can") && typeof value === "boolean",
			)
			.map(([key, value]) => ({
				key,
				value,
				score: targetWords.filter((word) =>
					words(key.replace(/([a-z])([A-Z])/g, "$1 $2")).includes(word),
				).length,
			}))
			.filter(({ score }) => score > 0);
		const best = Math.max(0, ...matches.map(({ score }) => score));
		const bestMatches = matches.filter(({ score }) => score === best);
		if (bestMatches.length === 1) {
			const permission = bestMatches[0];
			if (!permission) return;
			const action = permission.key.replace(/^can/, "");
			return {
				key: permission.key,
				label: `${action} permission`,
				value: permission.value ? "Allowed" : "Not allowed",
			};
		}
	}
	if (/\b(?:what\s+is|show|read|return|get)\b/i.test(input)) {
		const ignored = new Set([
			"what",
			"is",
			"show",
			"me",
			"read",
			"return",
			"get",
			"the",
			"current",
			"my",
		]);
		const targetWords = words(input).filter((word) => !ignored.has(word));
		const meaningfulTargetWords = targetWords.filter(
			(word) => word !== "value",
		);
		const matches = Object.entries(state)
			.map(([key, value]) => {
				const keyWords = words(key.replace(/([a-z])([A-Z])/g, "$1 $2"));
				return {
					key,
					value,
					score: targetWords.filter((word) => keyWords.includes(word)).length,
					meaningfulScore: meaningfulTargetWords.filter((word) =>
						keyWords.includes(word),
					).length,
				};
			})
			.filter(({ meaningfulScore }) => meaningfulScore > 0)
			.sort((a, b) => b.score - a.score);
		const best = matches[0]?.score ?? 0;
		const bestMatches = matches.filter(({ score }) => score === best);
		if (bestMatches.length === 1) {
			const match = bestMatches[0];
			if (!match) return;
			const label = match.key
				.replace(/([a-z])([A-Z])/g, "$1 $2")
				.replace(/^./, (character) => character.toUpperCase());
			return {
				key: match.key,
				label,
				value:
					typeof match.value === "string"
						? match.value
						: (JSON.stringify(match.value) ?? String(match.value)),
			};
		}
	}
}

export async function plan(
	request: JevPlanRequest,
	config: JevServerConfig,
): Promise<JevPlanResponse> {
	if (
		!request ||
		typeof request.input !== "string" ||
		!request.context ||
		request.input.trim() === ""
	)
		throw new Error("Invalid JEV request");
	if (
		(request.history?.length ?? 0) > 8 ||
		JSON.stringify(request).length > 262144
	)
		throw new Error("JEV request is too large");
	const explicitAction = request.input.match(
		/^(activate|click|press|toggle|highlight)\s+(.+)$/i,
	);
	const explicitActionName = explicitAction?.[1]?.toLowerCase();
	const explicitMarker = explicitAction?.[2]
		? request.context.markers.find((marker) => marker.id === explicitAction[2])
		: undefined;
	const highlightMarker =
		explicitActionName === "highlight" && explicitMarker
			? explicitMarker
			: uniqueHighlightMarker(request);
	const highlightMarkers = allHighlightMarkers(request);
	if (highlightMarkers)
		return {
			outcome: "action",
			instructions: highlightMarkers.map((marker) => ({
				action: "highlight" as const,
				id: marker.id,
			})),
			terminal: true,
			confidence: 1,
			decisionId: randomUUID(),
			summary: `Highlighting ${highlightMarkers.length} targets`,
		};
	const fill = directFill(request);
	const read = directRead(request);
	if (read?.choices)
		return {
			outcome: "needs-input",
			confidence: 1,
			decisionId: randomUUID(),
			summary: "Multiple values match. Choose one:",
			choices: read.choices,
		};
	if (read?.marker) {
		const redacted = read.marker.value === "[REDACTED]";
		return {
			outcome: "result",
			confidence: 1,
			decisionId: randomUUID(),
			summary: redacted
				? `${read.marker.label} is protected`
				: `Read ${read.marker.label}`,
			result: {
				type: "marker-value",
				markerId: read.marker.id,
				label: read.marker.label || read.marker.id,
				value: read.marker.value ?? "",
				redacted,
			},
		};
	}
	const stateResult = directStateResult(request);
	if (stateResult)
		return {
			outcome: "result",
			confidence: 1,
			decisionId: randomUUID(),
			summary: `Read ${stateResult.label.toLowerCase()}`,
			result: {
				type: "state-value",
				...stateResult,
			},
		};
	const navigationMarker = directNavigation(request);
	const sectionMarker = directSectionNavigation(request);
	if (sectionMarker)
		return {
			outcome: "action",
			instructions: [{ action: "scroll", id: sectionMarker.id }],
			terminal: true,
			confidence: 1,
			decisionId: randomUUID(),
			summary: `Scrolling to ${sectionMarker.label}`,
		};
	const directMarker = fill?.marker ?? highlightMarker ?? explicitMarker;
	const directInstruction = fill
		? "fillInput"
		: highlightMarker
			? "highlight"
			: "click";
	if (fill?.choices)
		return {
			outcome: "needs-input",
			confidence: 1,
			decisionId: randomUUID(),
			summary: "Multiple fields match. Choose one:",
			choices: fill.choices,
		};
	if (
		directMarker &&
		request.history?.some((entry) =>
			entry.instructions.some(
				(instruction) =>
					instruction.action === directInstruction &&
					instruction.id === directMarker.id &&
					(!fill ||
						(instruction.action === "fillInput" &&
							instruction.value === fill.value)),
			),
		)
	)
		return {
			outcome: "completed",
			confidence: 1,
			decisionId: randomUUID(),
			summary: "Instruction complete",
		};
	const candidates = buildCandidates(
		request.input,
		request.context,
		request.history,
	);
	if (navigationMarker?.route) {
		if (navigationMarker.route === request.context.route)
			return {
				outcome: "completed",
				confidence: 1,
				decisionId: randomUUID(),
				summary: `Already on ${navigationMarker.label}`,
			};
		const navigationCandidate = candidates.find((candidate) =>
			candidate.instructions?.some(
				(instruction) =>
					instruction.action === "navigate" &&
					instruction.route === navigationMarker.route,
			),
		);
		if (navigationCandidate)
			return {
				outcome: "action",
				instructions: navigationCandidate.instructions,
				terminal: navigationCandidate.terminal,
				confidence: 1,
				decisionId: randomUUID(),
				summary: navigationCandidate.summary,
			};
	}
	if (candidates.length === 1 && candidates[0]?.outcome === "needs-input")
		return {
			outcome: "needs-input",
			confidence: 1,
			decisionId: randomUUID(),
			summary: candidates[0].summary,
			choices: candidates[0].choices,
		};
	if (directMarker) {
		const exactCandidate = candidates.find((candidate) =>
			candidate.instructions?.some(
				(instruction) =>
					instruction.action === directInstruction &&
					instruction.id === directMarker.id &&
					(!fill ||
						(instruction.action === "fillInput" &&
							instruction.value === fill.value)),
			),
		);
		if (exactCandidate)
			return {
				outcome: "action",
				instructions: exactCandidate.instructions,
				terminal: exactCandidate.terminal,
				confidence: 1,
				decisionId: randomUUID(),
				summary: exactCandidate.summary,
			};
	}
	let client = config.client;
	if (!client) {
		const sdk = await import("@typesafe-ai/sdk");
		client = new sdk.TypeSafeClient({ apiKey: config.apiKey });
	}
	const sdk = await import("@typesafe-ai/sdk");
	const response = await client.systemOne({
		model: config.model ?? "jev-latest",
		state: {
			user_instruction: request.input,
			route: request.context.route,
			completed_action_history: (request.history ?? []).map((entry) => ({
				step: entry.step,
				actions: entry.instructions,
			})),
		},
		questions: {
			next_step: sdk.choice(
				"Choose exactly one safe next UI step. If the completed action history already satisfies the user instruction, choose completed instead of doing more.",
				Object.fromEntries(candidates.map((c) => [c.key, c.criterion])),
			),
		},
	});
	const selected =
		response?.answers?.next_step ??
		response?.questions?.next_step ??
		response?.next_step ??
		response?.choice;
	const key = typeof selected === "string" ? selected : selected?.choice;
	const c = candidates.find((x) => x.key === key);
	if (!c) throw new Error("Invalid JEV choice");
	const confidence = Number(selected?.confidence ?? response?.confidence ?? 1);
	if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)
		throw new Error("Invalid JEV confidence");
	return {
		outcome: c.outcome ?? "action",
		instructions: c.instructions,
		terminal: c.terminal,
		confidence,
		decisionId: randomUUID(),
		summary: c.summary,
	};
}
