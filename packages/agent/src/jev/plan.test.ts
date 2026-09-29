import assert from "node:assert/strict";
import test from "node:test";
import { plan } from "./plan.js";

test("maps provider answer to a locally generated instruction", async () => {
	const response = await plan(
		{
			input: "click save",
			context: {
				markers: [
					{ id: "save", label: "Save", intent: "", elementType: "button" },
				],
				inViewMarkerIds: ["save"],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => ({
					answers: { next_step: { choice: "candidate_2", confidence: 0.9 } },
				}),
			},
		},
	);
	assert.deepEqual(response.instructions, [{ action: "click", id: "save" }]);
	assert.equal(response.outcome, "action");
});

test("sends compact state without duplicating the marker catalog", async () => {
	let receivedRequest: { state?: Record<string, unknown> } | undefined;
	const response = await plan(
		{
			input: "help with save",
			context: {
				route: "/settings/",
				markers: [
					{
						id: "save",
						label: "Save",
						intent: "Save settings",
						elementType: "button",
					},
				],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async (request) => {
					receivedRequest = request as { state?: Record<string, unknown> };
					return {
						answers: {
							next_step: { choice: "candidate_2", confidence: 0.9 },
						},
					};
				},
			},
		},
	);

	assert.equal(receivedRequest?.state?.markers, undefined);
	assert.equal(receivedRequest?.state?.user_instruction, "help with save");
	assert.equal(response.terminal, true);
});

test("stops a uniquely resolved highlight after satisfying the request", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: "highlight feature badge",
			context: {
				markers: [
					{
						id: "feature",
						label: "Feature Badge",
						intent: "A badge demonstrating the highlight feature",
						elementType: "div",
					},
				],
				inViewMarkerIds: ["feature"],
			},
			history: [
				{ step: 1, instructions: [{ action: "highlight", id: "feature" }] },
			],
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {
						answers: {
							next_step: { choice: "completed", confidence: 0.9 },
						},
					};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.equal(response.outcome, "completed");
});

test("executes an explicit poll target without asking JEV to reinterpret it", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: "activate click_demo_toggle",
			context: {
				markers: [
					{
						id: "theme_toggle",
						label: "Theme Toggle",
						intent: "Toggle dark and light mode",
						elementType: "button",
					},
					{
						id: "click_demo_toggle",
						label: "Toggle Status",
						intent: "Toggles the active status",
						elementType: "button",
					},
				],
				inViewMarkerIds: ["theme_toggle"],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.deepEqual(response.instructions, [
		{ action: "scroll", id: "click_demo_toggle" },
		{ action: "click", id: "click_demo_toggle" },
	]);
	assert.equal(response.confidence, 1);
});

test("completes an explicit poll target after it was executed", async () => {
	const response = await plan(
		{
			input: "activate click_demo_toggle",
			context: {
				markers: [
					{
						id: "click_demo_toggle",
						label: "Toggle Status",
						intent: "Toggles the active status",
						elementType: "button",
					},
				],
			},
			history: [
				{
					step: 1,
					instructions: [
						{ action: "scroll", id: "click_demo_toggle" },
						{ action: "click", id: "click_demo_toggle" },
					],
				},
			],
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "completed");
	assert.equal(response.confidence, 1);
});

test("resolves a uniquely matched highlight without provider uncertainty", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: "highlight title",
			context: {
				markers: [
					{
						id: "hero_title",
						label: "Hero Title",
						intent: "The main page heading",
						elementType: "h1",
					},
					{
						id: "feature_badge",
						label: "Feature Badge",
						intent: "A product feature",
						elementType: "div",
					},
				],
				inViewMarkerIds: [],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.deepEqual(response.instructions, [
		{ action: "scroll", id: "hero_title" },
		{ action: "highlight", id: "hero_title" },
	]);
	assert.equal(response.confidence, 1);
});

test("highlights every matching marker when explicitly asked for all", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: "highlight all badges",
			context: {
				markers: [
					{
						id: "feature_badge",
						label: "Feature Badge",
						intent: "Feature",
						elementType: "div",
					},
					{
						id: "status_badge",
						label: "Status Badge",
						intent: "Status",
						elementType: "div",
					},
					{
						id: "hero_title",
						label: "Hero Title",
						intent: "Heading",
						elementType: "h1",
					},
				],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.equal(response.outcome, "action");
	assert.equal(response.terminal, true);
	assert.deepEqual(response.instructions, [
		{ action: "highlight", id: "feature_badge" },
		{ action: "highlight", id: "status_badge" },
	]);
});

test("completes a directly resolved highlight after executing it", async () => {
	const response = await plan(
		{
			input: "highlight title",
			context: {
				markers: [
					{
						id: "hero_title",
						label: "Hero Title",
						intent: "The main page heading",
						elementType: "h1",
					},
				],
			},
			history: [
				{
					step: 1,
					instructions: [{ action: "highlight", id: "hero_title" }],
				},
			],
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "completed");
	assert.equal(response.confidence, 1);
});

test("fills a uniquely matched field without provider uncertainty", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: 'set email to "test@test.com"',
			context: {
				markers: [
					{
						id: "fill_demo_email",
						label: "Email Address",
						intent: "Enter an email address",
						elementType: "input",
					},
					{
						id: "message",
						label: "Message",
						intent: "Enter a message",
						elementType: "textarea",
					},
				],
				inViewMarkerIds: ["fill_demo_email"],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.deepEqual(response.instructions, [
		{ action: "fillInput", id: "fill_demo_email", value: "test@test.com" },
	]);
	assert.equal(response.confidence, 1);
});

test("asks which field to fill when multiple fields match", async () => {
	const response = await plan(
		{
			input: 'set email to "test@test.com"',
			context: {
				markers: [
					{
						id: "fill_demo_email",
						label: "Demo Email",
						intent: "Enter an email address",
						elementType: "div",
						value: "",
					},
					{
						id: "multi_email",
						label: "Billing Email",
						intent: "Enter the billing email address",
						elementType: "div",
						value: "",
					},
				],
				inViewMarkerIds: ["fill_demo_email"],
			},
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "needs-input");
	assert.deepEqual(response.choices, [
		{
			label: "Demo Email",
			value: 'set fill_demo_email to "test@test.com"',
			markerId: "fill_demo_email",
		},
		{
			label: "Billing Email",
			value: 'set multi_email to "test@test.com"',
			markerId: "multi_email",
		},
	]);
});

test("returns a marker value without asking JEV to generate text", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: "what is the email value",
			context: {
				markers: [
					{
						id: "email",
						label: "Email",
						intent: "Account email",
						elementType: "input",
						value: "test@test.com",
					},
				],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.equal(response.outcome, "result");
	assert.deepEqual(response.result, {
		type: "marker-value",
		markerId: "email",
		label: "Email",
		value: "test@test.com",
		redacted: false,
	});
});

test("reads the populated field when multiple fields match", async () => {
	const response = await plan(
		{
			input: "what is the email address value",
			context: {
				state: { counterValue: 0 },
				markers: [
					{
						id: "fill_demo_email",
						label: "Email Input",
						intent: "Email address input field",
						elementType: "input",
						value: "test@test.com",
					},
					{
						id: "multi_email",
						label: "Billing Email",
						intent: "Email address for billing notifications",
						elementType: "input",
						value: "",
					},
				],
			},
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "result");
	assert.deepEqual(response.result, {
		type: "marker-value",
		markerId: "fill_demo_email",
		label: "Email Input",
		value: "test@test.com",
		redacted: false,
	});
});

test("returns a protected result for a redacted value", async () => {
	const response = await plan(
		{
			input: "what is the password value",
			context: {
				state: { counterValue: 0 },
				markers: [
					{
						id: "password",
						label: "Password",
						intent: "Account password",
						elementType: "input",
						value: "[REDACTED]",
					},
				],
			},
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "result");
	assert.equal(response.result?.redacted, true);
});

test("navigates a uniquely named route without provider uncertainty", async () => {
	let providerCalled = false;
	const response = await plan(
		{
			input: "go to billing",
			context: {
				route: "/",
				markers: [
					{
						id: "nav_route_billing",
						label: "Billing Route",
						intent: "Navigate to Billing page",
						elementType: "a",
						route: "/billing/",
					},
				],
			},
		},
		{
			apiKey: "test",
			client: {
				systemOne: async () => {
					providerCalled = true;
					return {};
				},
			},
		},
	);

	assert.equal(providerCalled, false);
	assert.deepEqual(response.instructions, [
		{ action: "navigate", route: "/billing/" },
	]);
	assert.equal(response.confidence, 1);
});

test("returns exposed permissions as a typed state result", async () => {
	const response = await plan(
		{
			input: "What permissions do I have?",
			context: {
				markers: [],
				state: {
					canDelete: false,
					canExport: true,
					canInvite: true,
					role: "editor",
					plan: "pro",
				},
			},
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "result");
	assert.deepEqual(response.result, {
		type: "state-value",
		key: "permissions",
		label: "Your permissions",
		value: "Plan: pro\nRole: editor\nCannot delete\nCan export\nCan invite",
	});
});

test("answers a specific exposed permission without generated text", async () => {
	const response = await plan(
		{
			input: "Am I allowed to export data?",
			context: {
				markers: [],
				state: { canExport: true, canDelete: false },
			},
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "result");
	assert.equal(response.result?.key, "canExport");
	assert.equal(response.result?.value, "Allowed");
});

test("returns an arbitrary exposed state value by its semantic key", async () => {
	const response = await plan(
		{
			input: "what is the current counter value?",
			context: {
				markers: [],
				state: { counterValue: 10, counterIsActive: false },
			},
		},
		{ apiKey: "test" },
	);

	assert.equal(response.outcome, "result");
	assert.deepEqual(response.result, {
		type: "state-value",
		key: "counterValue",
		label: "Counter Value",
		value: "10",
	});
});

test("scrolls to the next feature section in document order", async () => {
	const response = await plan(
		{
			input: "go to next section",
			context: {
				markers: [
					{
						id: "slide_navigation",
						label: "Navigation Section",
						intent: "Navigate to the Navigation feature section",
						elementType: "section",
					},
					{
						id: "slide_highlight",
						label: "Visual Highlighting Section",
						intent: "Navigate to the Visual Highlighting feature section",
						elementType: "section",
					},
				],
				inViewMarkerIds: ["slide_navigation"],
			},
		},
		{ apiKey: "test" },
	);

	assert.deepEqual(response.instructions, [
		{ action: "scroll", id: "slide_highlight" },
	]);
	assert.equal(response.terminal, true);
});

test("includes the concept section when moving forward from the hero", async () => {
	const response = await plan(
		{
			input: "go to next section",
			context: {
				markers: [
					{
						id: "hero_title",
						label: "ai11y",
						intent: "The main hero title",
						elementType: "h1",
					},
					{
						id: "slide_concept",
						label: "Core Concept Section",
						intent: "Navigate to the Describe, Plan, Act concept section",
						elementType: "section",
					},
					{
						id: "slide_navigation",
						label: "Navigation Section",
						intent: "Navigate to the Navigation feature section",
						elementType: "section",
					},
				],
				inViewMarkerIds: ["hero_title"],
			},
		},
		{ apiKey: "test" },
	);

	assert.deepEqual(response.instructions, [
		{ action: "scroll", id: "slide_concept" },
	]);
});
