"use client";

import type { Instruction } from "@ai11y/core";
import { useAi11yContext } from "@ai11y/react";
import { useState } from "react";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { useDemoUi } from "@/context/DemoUiContext";

const MACRO_STEPS: Instruction[] = [
	{ action: "click", id: "multi_status_toggle" },
	{ action: "fillInput", id: "multi_email", value: "billing@example.com" },
	{ action: "highlight", id: "multi_save" },
];

function stepLabel(instruction: Instruction): string {
	if (
		instruction.action === "click" &&
		instruction.id === "multi_status_toggle"
	) {
		return "Toggle Status";
	}

	if (instruction.action === "fillInput" && instruction.id === "multi_email") {
		return "Fill email input";
	}

	if (instruction.action === "highlight" && instruction.id === "multi_save") {
		return "Highlight Multi save";
	}

	switch (instruction.action) {
		case "navigate":
			return `Navigate to ${"route" in instruction ? instruction.route : ""}`;
		case "scroll":
			return `Scroll to ${"id" in instruction ? instruction.id : ""}`;
		case "highlight":
			return `Highlight ${"id" in instruction ? instruction.id : ""}`;
		case "click":
			return `Click ${"id" in instruction ? instruction.id : ""}`;
		case "fillInput":
			return `Fill ${"id" in instruction ? instruction.id : ""}`;
		default:
			return JSON.stringify(instruction);
	}
}

export function MultiStepDemo() {
	const { act } = useAi11yContext();
	const { addHighlight } = useDemoUi();
	const [status, setStatus] = useState<"inactive" | "active">("inactive");
	const [email, setEmail] = useState("");
	const [savedEmail, setSavedEmail] = useState<string | null>(null);
	const [log, setLog] = useState<
		Array<{ step: number; instruction: Instruction; status: string }>
	>([]);
	const [running, setRunning] = useState(false);

	const runMacro = async () => {
		setRunning(true);
		setLog([]);

		for (let i = 0; i < MACRO_STEPS.length; i++) {
			const instruction = MACRO_STEPS[i];
			setLog((prev) => [
				...prev,
				{ step: i + 1, instruction, status: "running" },
			]);

			act(instruction);
			if (instruction.action === "highlight") {
				addHighlight(instruction.id);
			}

			setLog((prev) =>
				prev.map((entry, idx) =>
					idx === prev.length - 1 ? { ...entry, status: "done" } : entry,
				),
			);

			await new Promise((r) => setTimeout(r, 600));
		}

		setRunning(false);
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4">
				<div className="flex items-center justify-between">
					<div>
						<div className="mb-1 text-xs text-muted-foreground">Status</div>
						<div
							className={`text-sm font-medium ${
								status === "active" ? "text-primary" : "text-muted-foreground"
							}`}
						>
							{status === "active" ? "Active" : "Inactive"}
						</div>
					</div>
					<Marker
						id="multi_status_toggle"
						label="Status Toggle"
						intent="Toggle the billing status between active and inactive"
					>
						<button
							type="button"
							onClick={() =>
								setStatus((s) => (s === "active" ? "inactive" : "active"))
							}
							className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
						>
							Toggle status
						</button>
					</Marker>
				</div>
			</div>

			<div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="multi-email-input"
						className="text-xs text-muted-foreground"
					>
						Billing email
					</label>
					<div className="flex gap-2">
						<Marker
							id="multi_email"
							label="Billing Email"
							intent="Email address for billing notifications"
						>
							<input
								id="multi-email-input"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
								placeholder="you@example.com"
							/>
						</Marker>
						<Marker
							id="multi_save"
							label="Save Billing Settings"
							intent="Save the current billing email and status"
						>
							<button
								type="button"
								onClick={() => setSavedEmail(email)}
								className="rounded-md border border-primary bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
							>
								Save
							</button>
						</Marker>
					</div>
					{savedEmail && (
						<p className="text-xs text-muted-foreground">
							Last saved email:{" "}
							<span className="font-mono text-foreground">
								{savedEmail || "—"}
							</span>
						</p>
					)}
				</div>
			</div>

			<div className="text-sm text-muted-foreground">
				Chained instructions inside this section: fill, toggle, save. Your agent
				can perform multi-step tasks reliably.
			</div>
			<button
				type="button"
				onClick={runMacro}
				disabled={running}
				className="w-full px-4 py-3 rounded-xl border border-primary bg-primary/10 text-primary font-medium hover:bg-primary/20 disabled:opacity-50 transition-colors"
			>
				{running ? "Running…" : "Run multi-step demo"}
			</button>
			{log.length > 0 && (
				<div className="space-y-2">
					<div className="text-xs font-medium text-muted-foreground">Steps</div>
					<ul className="space-y-1.5 text-xs">
						{log.map((entry) => (
							<li
								key={`${entry.step}-${entry.instruction.action}-${
									"route" in entry.instruction
										? entry.instruction.route
										: "id" in entry.instruction
											? entry.instruction.id
											: entry.step
								}`}
								className="flex items-center gap-2 rounded border border-border/50 bg-muted/30 p-2"
							>
								<span className="font-mono text-muted-foreground shrink-0">
									{entry.step}.
								</span>
								<span className="text-foreground">
									{stepLabel(entry.instruction)}
								</span>
								<span
									className={`ml-auto shrink-0 ${
										entry.status === "done"
											? "text-primary"
											: "text-muted-foreground"
									}`}
								>
									{entry.status === "done" ? "Done" : "…"}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
