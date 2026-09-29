import assert from "node:assert/strict";
import test from "node:test";
import { buildCandidates } from "./candidates.js";

test("builds bounded local candidates", () => {
	const candidates = buildCandidates("click the save button", {
		markers: [
			{ id: "save", label: "Save", intent: "save", elementType: "button" },
		],
		inViewMarkerIds: ["save"],
	});
	assert.equal(candidates.at(-1)?.key, "needs_input");
	assert.deepEqual(
		candidates.find((c) => c.summary === "Clicking Save")?.instructions,
		[{ action: "click", id: "save" }],
	);
});
test("offscreen click is scroll then click", () => {
	const candidates = buildCandidates("activate button", {
		markers: [{ id: "x", label: "X", intent: "", elementType: "button" }],
	});
	assert.deepEqual(
		candidates.find((c) => c.summary === "Clicking X")?.instructions,
		[
			{ action: "scroll", id: "x" },
			{ action: "click", id: "x" },
		],
	);
});

test("offscreen highlight is one scroll-then-highlight decision", () => {
	const candidates = buildCandidates("highlight hero title", {
		markers: [
			{
				id: "hero_title",
				label: "Hero Title",
				intent: "The main hero title",
				elementType: "h1",
			},
		],
	});

	assert.deepEqual(
		candidates.find(
			(candidate) => candidate.summary === "Highlighting Hero Title",
		)?.instructions,
		[
			{ action: "scroll", id: "hero_title" },
			{ action: "highlight", id: "hero_title" },
		],
	);
});

test("builds a direct navigation candidate for a known internal route", () => {
	const candidates = buildCandidates("go to billing", {
		route: "/",
		markers: [
			{
				id: "billing_route",
				label: "Billing Route",
				intent: "Navigate to Billing page",
				elementType: "a",
				route: "/billing/",
			},
		],
	});

	assert.deepEqual(
		candidates.find(
			(candidate) => candidate.summary === "Navigating to Billing Route",
		)?.instructions,
		[{ action: "navigate", route: "/billing/" }],
	);
});

test("repeats a counted action in one bounded candidate", () => {
	const candidates = buildCandidates("increment counter 10 times", {
		markers: [
			{
				id: "increment",
				label: "Increment Button",
				intent: "Increases the counter by 1",
				elementType: "button",
			},
		],
		inViewMarkerIds: ["increment"],
	});
	const candidate = candidates.find(
		(c) => c.summary === "Clicking Increment Button 10 times",
	);

	assert.equal(candidate?.instructions?.length, 10);
	assert.ok(
		candidate?.instructions?.every(
			(instruction) =>
				instruction.action === "click" && instruction.id === "increment",
		),
	);
});

test("scrolls once before a repeated offscreen action", () => {
	const candidates = buildCandidates("click 3 times", {
		markers: [{ id: "x", label: "X", intent: "", elementType: "button" }],
	});
	const candidate = candidates.find((c) => c.summary === "Clicking X 3 times");

	assert.deepEqual(candidate?.instructions, [
		{ action: "scroll", id: "x" },
		{ action: "click", id: "x" },
		{ action: "click", id: "x" },
		{ action: "click", id: "x" },
	]);
});

test("asks for clarification when an action has equally plausible targets", () => {
	const candidates = buildCandidates("activate status", {
		markers: [
			{
				id: "general_status",
				label: "Toggle Status",
				intent: "Toggles the active status",
				elementType: "button",
			},
			{
				id: "billing_status",
				label: "Status Toggle",
				intent: "Toggle the billing status between active and inactive",
				elementType: "button",
			},
			{
				id: "save_billing",
				label: "Save Billing Settings",
				intent: "Save the current billing email and status",
				elementType: "button",
			},
		],
	});

	assert.equal(candidates.length, 1);
	assert.equal(candidates[0]?.outcome, "needs-input");
	assert.deepEqual(candidates[0]?.choices, [
		{
			label: "Toggle Status",
			value: "activate general_status",
			markerId: "general_status",
		},
		{
			label: "Status Toggle",
			value: "activate billing_status",
			markerId: "billing_status",
		},
	]);
});

test("uses extra context to disambiguate an action target", () => {
	const candidates = buildCandidates("activate billing status", {
		markers: [
			{
				id: "general_status",
				label: "Toggle Status",
				intent: "Toggles the active status",
				elementType: "button",
			},
			{
				id: "billing_status",
				label: "Status Toggle",
				intent: "Toggle the billing status between active and inactive",
				elementType: "button",
			},
		],
		inViewMarkerIds: ["billing_status"],
	});

	assert.deepEqual(
		candidates.find(
			(candidate) => candidate.summary === "Clicking Status Toggle",
		)?.instructions,
		[{ action: "click", id: "billing_status" }],
	);
});

test("treats a marker with nested input metadata as fillable", () => {
	const candidates = buildCandidates('set email to "test@test.com"', {
		markers: [
			{
				id: "fill_demo_email",
				label: "Email Input",
				intent: "Email address input field",
				elementType: "div",
				value: "",
			},
		],
	});

	assert.deepEqual(
		candidates.find((candidate) => candidate.summary === "Filling Email Input")
			?.instructions,
		[{ action: "fillInput", id: "fill_demo_email", value: "test@test.com" }],
	);
});

test("builds fill actions for an option-exposing custom select", () => {
	const candidates = buildCandidates("set category to feedback", {
		markers: [
			{
				id: "fill_demo_category",
				label: "Category Select",
				intent: "Category selection dropdown",
				elementType: "div",
				options: [
					{ value: "support", label: "Support" },
					{ value: "feedback", label: "Feedback" },
				],
			},
		],
	});

	assert.deepEqual(
		candidates.find((candidate) => candidate.summary === "Selecting Feedback")
			?.instructions,
		[{ action: "fillInput", id: "fill_demo_category", value: "feedback" }],
	);
});

test("filters by requested action and shortlists five markers", () => {
	const candidates = buildCandidates("click save", {
		markers: Array.from({ length: 10 }, (_, index) => ({
			id: index === 9 ? "save" : `button_${index}`,
			label: index === 9 ? "Save" : `Button ${index}`,
			intent: index === 9 ? "Save settings" : `Perform action ${index}`,
			elementType: "button",
		})),
	});
	const actions = candidates.filter((candidate) => candidate.instructions);

	assert.equal(actions.length, 5);
	assert.ok(
		actions.every(
			(candidate) =>
				candidate.terminal === true &&
				candidate.instructions?.every(
					(instruction) =>
						instruction.action === "scroll" || instruction.action === "click",
				),
		),
	);
	assert.ok(
		actions[0]?.instructions?.some(
			(instruction) =>
				instruction.action === "click" && instruction.id === "save",
		),
	);
});
