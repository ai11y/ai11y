import type { Ai11yContext, Instruction } from "@ai11y/core";
import type { JevActionHistoryEntry } from "@ai11y/core/jev";
export interface JevCandidate {
	key: string;
	criterion: string;
	summary: string;
	instructions?: Instruction[];
	outcome?: "completed" | "needs-input";
	choices?: Array<{ label: string; value: string; markerId?: string }>;
	terminal?: boolean;
}
const batch = (x: Instruction[]) => JSON.stringify(x);
function valueFrom(input: string) {
	const q = input.match(/["']([^"']+)["']/);
	return q?.[1] ?? input.match(/\bwith\s+([^,.!?]+)$/i)?.[1]?.trim();
}
function repeatCountFrom(input: string) {
	const match = input.match(/\b(\d+)\s*(?:x|times?)\b/i);
	if (!match) return 1;
	const count = Number(match[1]);
	return Number.isSafeInteger(count) && count > 0 ? Math.min(count, 20) : 1;
}
const actionWords = new Set([
	"activate",
	"click",
	"press",
	"toggle",
	"the",
	"a",
	"an",
	"please",
]);
function words(value: string) {
	return value.toLowerCase().split(/\W+/).filter(Boolean);
}

type ActionKind = "highlight" | "scroll" | "navigate" | "activate" | "fill";

function requestedAction(input: string): ActionKind | undefined {
	if (/\bhighlight\b/i.test(input)) return "highlight";
	if (/\b(?:next|previous)\s+section\b/i.test(input)) return "scroll";
	if (/\b(?:go|navigate)(?:\s+to)?\b/i.test(input)) return "navigate";
	if (/\bscroll\b/i.test(input)) return "scroll";
	if (/\b(?:set|fill|enter|type|select|choose)\b/i.test(input)) return "fill";
	if (
		/\b(?:click|press|activate|toggle|increment|decrement|submit|open|close)\b/i.test(
			input,
		)
	)
		return "activate";
}

const relevanceStopWords = new Set([
	"a",
	"an",
	"the",
	"to",
	"please",
	"go",
	"navigate",
	"scroll",
	"highlight",
	"click",
	"press",
	"activate",
	"toggle",
	"set",
	"fill",
	"enter",
	"type",
	"select",
	"choose",
	"times",
]);

function shortlistMarkers(
	input: string,
	markers: Ai11yContext["markers"],
	inViewMarkerIds: string[] = [],
) {
	const tokens = words(input).filter(
		(word) => !relevanceStopWords.has(word) && !/^\d+$/.test(word),
	);
	return markers
		.map((marker, ordinal) => {
			const description = words(
				`${marker.id} ${marker.label} ${marker.intent}`,
			);
			return {
				marker,
				ordinal,
				score:
					tokens.filter((token) => description.includes(token)).length * 2 +
					(inViewMarkerIds.includes(marker.id) ? 1 : 0),
			};
		})
		.sort((a, b) => b.score - a.score || a.ordinal - b.ordinal)
		.slice(0, 5)
		.map(({ marker }) => marker);
}
function ambiguousActionSummary(
	input: string,
	markers: Ai11yContext["markers"],
) {
	if (!/\b(?:activate|click|press|toggle)\b/i.test(input)) return;
	const targetWords = words(input).filter((word) => !actionWords.has(word));
	if (targetWords.length === 0) return;
	const activationRequest = /\b(?:activate|toggle)\b/i.test(input);
	const matches = markers
		.filter(
			(marker) => marker.elementType === "button" || marker.elementType === "a",
		)
		.map((marker) => {
			const description = `${marker.id} ${marker.label} ${marker.intent}`;
			return {
				marker,
				score:
					targetWords.filter((word) => words(description).includes(word))
						.length +
					(activationRequest &&
					/\b(?:toggle|active|activate)\b/i.test(description)
						? 1
						: 0),
			};
		})
		.filter(({ score }) => score > 0);
	const best = Math.max(0, ...matches.map(({ score }) => score));
	const tied = matches.filter(({ score }) => score === best);
	if (tied.length < 2) return;
	return tied.map(({ marker }) => ({
		label: marker.label || marker.id,
		value: `activate ${marker.id}`,
		markerId: marker.id,
	}));
}
export function buildCandidates(
	input: string,
	context: Ai11yContext,
	history: JevActionHistoryEntry[] = [],
): JevCandidate[] {
	const seen = new Set<string>();
	const out: JevCandidate[] = [];
	const prior = new Set(history.map((h) => batch(h.instructions)));
	const repeatCount = repeatCountFrom(input);
	const actionKind = requestedAction(input);
	const markers = (context.markers ?? []).filter((m) => {
		if (!m || typeof m.id !== "string" || seen.has(m.id)) return false;
		seen.add(m.id);
		return true;
	});
	const ambiguousChoices = ambiguousActionSummary(input, markers);
	if (ambiguousChoices)
		return [
			{
				key: "needs_input",
				criterion:
					"The instruction matches multiple equally plausible controls",
				summary: "Multiple controls match. Choose one:",
				outcome: "needs-input",
				choices: ambiguousChoices,
			},
		];
	const add = (
		criterion: string,
		summary: string,
		instructions: Instruction[],
	) => {
		if (!prior.has(batch(instructions)))
			out.push({
				key: `candidate_${out.length}`,
				criterion,
				summary,
				instructions,
				terminal: true,
			});
	};
	const eligibleMarkers = markers.filter((marker) => {
		if (actionKind === "navigate") return Boolean(marker.route);
		if (actionKind === "activate")
			return marker.elementType === "button" || marker.elementType === "a";
		if (actionKind === "fill")
			return (
				marker.elementType === "input" ||
				marker.elementType === "textarea" ||
				marker.elementType === "select" ||
				marker.value !== undefined ||
				marker.options !== undefined
			);
		return true;
	});
	const shortlisted = shortlistMarkers(
		input,
		eligibleMarkers,
		context.inViewMarkerIds,
	);
	for (const m of shortlisted) {
		const inView = context.inViewMarkerIds?.includes(m.id) ?? false;
		if (!actionKind || actionKind === "highlight")
			add(
				`${inView ? "Highlight" : "Scroll to and highlight"} marker ${m.label || m.id} (${m.id}): ${m.intent}`,
				`Highlighting ${m.label || m.id}`,
				inView
					? [{ action: "highlight", id: m.id }]
					: [
							{ action: "scroll", id: m.id },
							{ action: "highlight", id: m.id },
						],
			);
		if (!actionKind || actionKind === "scroll")
			add(
				`Scroll until marker ${m.label || m.id} is visible`,
				`Scrolling to ${m.label || m.id}`,
				[{ action: "scroll", id: m.id }],
			);
		if (
			(!actionKind || actionKind === "navigate") &&
			m.elementType === "a" &&
			m.route &&
			m.route !== context.route
		)
			add(
				`Navigate to ${m.label || m.id} at known route ${m.route}: ${m.intent}`,
				`Navigating to ${m.label || m.route}`,
				[{ action: "navigate", route: m.route }],
			);
		else if (
			(!actionKind || actionKind === "activate") &&
			(m.elementType === "button" || m.elementType === "a")
		)
			add(
				`Activate marker ${m.label || m.id}: ${m.intent}`,
				repeatCount > 1
					? `Clicking ${m.label || m.id} ${repeatCount} times`
					: `Clicking ${m.label || m.id}`,
				inView
					? Array.from({ length: repeatCount }, () => ({
							action: "click" as const,
							id: m.id,
						}))
					: [
							{ action: "scroll", id: m.id },
							...Array.from({ length: repeatCount }, () => ({
								action: "click" as const,
								id: m.id,
							})),
						],
			);
		if ((!actionKind || actionKind === "fill") && m.options)
			for (const o of m.options)
				if (
					o.value &&
					!out.some(
						(c) =>
							c.instructions?.[0].action === "fillInput" &&
							c.instructions[0].action === "fillInput" &&
							c.instructions[0].value === o.value,
					)
				)
					add(`Set ${m.label} to option ${o.label}`, `Selecting ${o.label}`, [
						{ action: "fillInput", id: m.id, value: o.value },
					]);
		if (
			(!actionKind || actionKind === "fill") &&
			(m.elementType === "input" ||
				m.elementType === "textarea" ||
				m.value !== undefined) &&
			m.value !== "[REDACTED]"
		) {
			const v = valueFrom(input);
			if (v)
				add(
					`Enter the explicit requested value in ${m.label}`,
					`Filling ${m.label}`,
					[{ action: "fillInput", id: m.id, value: v }],
				);
		}
	}
	const tokens = input.toLowerCase().split(/\W+/).filter(Boolean);
	out.sort(
		(a, b) =>
			Number(tokens.some((t) => b.criterion.toLowerCase().includes(t))) -
			Number(tokens.some((t) => a.criterion.toLowerCase().includes(t))),
	);
	const capped = out
		.slice(0, 253)
		.map((c, i) => ({ ...c, key: `candidate_${i}` }));
	capped.push(
		{
			key: "completed",
			criterion:
				history.length > 0
					? "The completed action history fully satisfies the instruction; choose this instead of taking an additional action"
					: "The instruction was already satisfied before any action was needed",
			summary: "Instruction complete",
			outcome: "completed",
		},
		{
			key: "needs_input",
			criterion: "No safe available action can satisfy this instruction",
			summary: "I need a more specific instruction",
			outcome: "needs-input",
		},
	);
	return capped;
}
