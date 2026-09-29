"use client";

import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import {
	type FormEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useDemoUi } from "@/context/DemoUiContext";

export function JevModeTrigger() {
	const { jevEnabled, setJevEnabled, isJevRunning } = useDemoUi();

	return (
		<button
			type="button"
			disabled={isJevRunning}
			aria-pressed={jevEnabled}
			aria-label={
				jevEnabled ? "JEV mode is on; switch to LLM mode" : "Activate JEV mode"
			}
			onClick={() => setJevEnabled(!jevEnabled)}
			className={`jev-stoerer group absolute -right-3 -top-5 z-20 -rotate-3 border-2 border-foreground px-5 py-3 font-black uppercase tracking-[-0.04em] shadow-[5px_5px_0_hsl(var(--foreground))] transition-[transform,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:translate-x-1 active:translate-y-1 active:shadow-none sm:-right-8 sm:-top-8 sm:px-7 sm:py-4 ${jevEnabled ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground hover:rotate-0 hover:scale-105"}`}
		>
			<span className="block text-[0.62rem] leading-none tracking-[0.28em] opacity-70">
				{jevEnabled ? "System one active" : "Try system one"}
			</span>
			<span className="mt-1 block text-2xl leading-none sm:text-3xl">
				{jevEnabled ? "JEV ON" : "JEV MODE"}
			</span>
		</button>
	);
}

export function JevModeFloatingTrigger() {
	const { jevEnabled, setJevEnabled, isJevRunning } = useDemoUi();

	return (
		<button
			type="button"
			disabled={isJevRunning}
			onClick={() => setJevEnabled(!jevEnabled)}
			aria-pressed={jevEnabled}
			aria-label={
				jevEnabled ? "JEV mode is on; switch to LLM mode" : "Activate JEV mode"
			}
			className={`jev-stoerer-reverse group absolute -right-3 -top-5 z-20 rotate-2 border-2 border-foreground px-3 py-2 text-left shadow-[3px_3px_0_hsl(var(--foreground))] transition-all hover:rotate-0 hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 sm:-right-5 ${jevEnabled ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}
		>
			<span className="block text-xs font-black uppercase leading-none tracking-[0.08em]">
				{jevEnabled ? "JEV ON" : "JEV MODE"}
			</span>
		</button>
	);
}

interface JevInstructionSurfaceProps {
	compact?: boolean;
	className?: string;
}

interface InstructionComposerProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (event: FormEvent) => void;
	disabled: boolean;
	compact?: boolean;
	inputRef?: React.RefObject<HTMLInputElement | null>;
	placeholder?: string;
}

export function InstructionComposer({
	value,
	onChange,
	onSubmit,
	disabled,
	compact = false,
	inputRef,
	placeholder = "What do you want to do?",
}: InstructionComposerProps) {
	return (
		<form
			onSubmit={onSubmit}
			className="group relative overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
		>
			<input
				ref={inputRef}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				disabled={disabled}
				className={`w-full border-0 bg-transparent outline-none placeholder:text-muted-foreground/60 disabled:opacity-60 ${compact ? "py-3 pl-3.5 pr-12 text-sm" : "py-4 pl-4 pr-14 text-[0.95rem]"}`}
				placeholder={placeholder}
			/>
			<button
				type="submit"
				disabled={!value.trim() || disabled}
				className={`absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg bg-foreground text-background transition-[background-color,transform,opacity] hover:bg-primary hover:text-primary-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 ${compact ? "size-8" : "size-9"}`}
				aria-label="Run instruction"
			>
				<ArrowRight size={compact ? 15 : 18} aria-hidden />
			</button>
		</form>
	);
}

export function ActionProgress({ progress }: { progress: number }) {
	const steps = ["Describe", "Plan", "Act", "Done"];
	return (
		<div
			className="flex min-w-0 flex-1 items-center"
			role="progressbar"
			aria-label="Action progress"
			aria-valuemin={0}
			aria-valuemax={steps.length - 1}
			aria-valuenow={Math.max(0, progress)}
		>
			{steps.map((step, index) => (
				<div
					key={step}
					className="flex min-w-0 flex-1 items-center last:flex-none"
				>
					<span
						className={`rounded-md px-1.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] transition-colors duration-300 ${index === progress ? "bg-primary text-primary-foreground" : index < progress ? "bg-primary/10 text-primary" : "text-muted-foreground/45"}`}
					>
						{step}
					</span>
					{index < steps.length - 1 ? (
						<span
							className={`mx-1 h-px min-w-2 flex-1 transition-colors duration-300 ${index < progress ? "bg-primary/50" : "bg-border"}`}
						/>
					) : null}
				</div>
			))}
		</div>
	);
}

export function JevInstructionSurface({
	compact = false,
	className = "",
}: JevInstructionSurfaceProps) {
	const {
		jevStatus: status,
		isJevRunning: isRunning,
		jevDraft: value,
		setJevDraft: setValue,
		runJev: run,
	} = useDemoUi();
	const input = useRef<HTMLInputElement>(null);
	const activePreview = useRef<{ markerId: string; label: string } | null>(
		null,
	);
	const targetPreviewElement = useRef<HTMLDivElement>(null);
	const offscreenPreviewElement = useRef<HTMLDivElement>(null);
	const [offscreenPreview, setOffscreenPreview] = useState<{
		label: string;
		direction: "up" | "down";
		x: number;
	} | null>(null);
	const [targetPreview, setTargetPreview] = useState<{
		top: number;
		left: number;
		width: number;
		height: number;
	} | null>(null);

	const currentProgress =
		status.state === "idle"
			? -1
			: status.state === "evaluating"
				? 1
				: status.state === "acting"
					? 2
					: status.state === "completed" || status.state === "result"
						? 3
						: 1;
	const [progress, setProgress] = useState(currentProgress);
	const detail =
		status.state === "needs-input"
			? status.summary
			: status.state === "error"
				? status.message
				: null;

	useEffect(() => {
		if (
			status.state === "completed" ||
			status.state === "needs-input" ||
			status.state === "result"
		) {
			input.current?.focus({ preventScroll: true });
		}
	}, [status.state]);

	useEffect(() => {
		setProgress(currentProgress);
		if (status.state !== "completed" && status.state !== "result") return;
		const timeout = window.setTimeout(() => setProgress(-1), 1200);
		return () => window.clearTimeout(timeout);
	}, [currentProgress, status.state]);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (value.trim() && !isRunning) void run(value.trim());
	};
	const choose = (instruction: string) => {
		activePreview.current = null;
		setTargetPreview(null);
		setOffscreenPreview(null);
		void run(instruction);
	};
	const preview = useCallback((markerId: string | undefined, label: string) => {
		if (!markerId || typeof document === "undefined") return;
		activePreview.current = { markerId, label };
		const element = Array.from(
			document.querySelectorAll<HTMLElement>("[data-ai-id]"),
		).find((candidate) => candidate.getAttribute("data-ai-id") === markerId);
		if (!element) return;
		const rect = element.getBoundingClientRect();
		const viewportEdge = 16;
		const direction =
			rect.top < viewportEdge
				? "up"
				: rect.bottom > window.innerHeight - viewportEdge
					? "down"
					: null;
		const targetLeft = Math.max(4, rect.left);
		const targetTop = Math.max(4, rect.top);
		const targetWidth = Math.min(
			rect.width,
			window.innerWidth - targetLeft - 4,
		);
		const targetHeight = Math.min(
			rect.height,
			window.innerHeight - targetTop - 4,
		);
		const markerX = Math.min(
			window.innerWidth - 56,
			Math.max(56, rect.left + rect.width / 2),
		);
		if (direction && offscreenPreviewElement.current) {
			offscreenPreviewElement.current.style.left = `${markerX}px`;
		} else if (!direction && targetPreviewElement.current) {
			Object.assign(targetPreviewElement.current.style, {
				top: `${targetTop}px`,
				left: `${targetLeft}px`,
				width: `${targetWidth}px`,
				height: `${targetHeight}px`,
			});
		}
		setOffscreenPreview(
			direction
				? {
						label,
						direction,
						x: markerX,
					}
				: null,
		);
		setTargetPreview(
			direction
				? null
				: {
						top: targetTop,
						left: targetLeft,
						width: targetWidth,
						height: targetHeight,
					},
		);
	}, []);
	const clearPreview = () => {
		activePreview.current = null;
		setTargetPreview(null);
		setOffscreenPreview(null);
	};

	useEffect(() => {
		const repositionPreview = () => {
			const active = activePreview.current;
			if (active) preview(active.markerId, active.label);
		};

		window.addEventListener("scroll", repositionPreview, true);
		window.addEventListener("resize", repositionPreview);
		return () => {
			window.removeEventListener("scroll", repositionPreview, true);
			window.removeEventListener("resize", repositionPreview);
		};
	}, [preview]);

	return (
		<section
			className={`jev-surface flex flex-col ${compact ? "gap-3" : "gap-4"} ${className}`}
			aria-label="JEV mode"
		>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<span className="relative flex size-2">
						<span className="relative inline-flex size-2 rounded-full bg-primary" />
					</span>
					<span className="text-xs font-medium text-foreground">Ask JEV</span>
				</div>
			</div>

			<InstructionComposer
				value={value}
				onChange={setValue}
				onSubmit={submit}
				disabled={isRunning}
				compact={compact}
				inputRef={input}
			/>

			<div className="flex min-h-5 items-center justify-between gap-3 px-0.5">
				<div aria-live="polite" className="flex min-w-0 flex-1 items-center">
					<ActionProgress progress={progress} />
				</div>
			</div>

			{detail ? (
				<p className="px-0.5 text-xs leading-snug text-muted-foreground">
					{detail}
				</p>
			) : null}

			{status.state === "needs-input" && status.choices?.length ? (
				<fieldset className="grid gap-2" aria-label="Choose a target">
					<legend className="sr-only">Choose a target</legend>
					{status.choices.map((choice, index) => (
						<button
							key={choice.value}
							type="button"
							onClick={() => choose(choice.value)}
							onMouseEnter={() => preview(choice.markerId, choice.label)}
							onMouseLeave={clearPreview}
							onFocus={() => preview(choice.markerId, choice.label)}
							onBlur={clearPreview}
							className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm font-medium transition-[border-color,background-color] hover:border-primary/50 hover:bg-muted/40"
						>
							<span>
								<span className="mr-2 font-mono text-[0.65rem] text-muted-foreground">
									{String(index + 1).padStart(2, "0")}
								</span>
								{choice.label}
							</span>
							<ArrowRight
								size={15}
								aria-hidden
								className="transition-transform group-hover:translate-x-1"
							/>
						</button>
					))}
				</fieldset>
			) : null}

			{status.state === "result" ? (
				<div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3">
					<div className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
						{status.result.label}
					</div>
					<output className="mt-1 block whitespace-pre-wrap break-words font-mono text-sm font-bold text-foreground">
						{status.result.redacted
							? "REDACTED"
							: status.result.value || "Empty"}
					</output>
				</div>
			) : null}

			{offscreenPreview && typeof document !== "undefined"
				? createPortal(
						<div
							ref={offscreenPreviewElement}
							className={`jev-offscreen-target jev-offscreen-target-${offscreenPreview.direction}`}
							style={{ left: offscreenPreview.x }}
							role="status"
							aria-label={`${offscreenPreview.label} is ${offscreenPreview.direction === "up" ? "above" : "below"} the viewport`}
						>
							{offscreenPreview.direction === "up" ? (
								<ArrowUp className="size-3.5" aria-hidden />
							) : (
								<ArrowDown className="size-3.5" aria-hidden />
							)}
							<span>TARGET</span>
						</div>,
						document.body,
					)
				: null}

			{targetPreview && typeof document !== "undefined"
				? createPortal(
						<div
							ref={targetPreviewElement}
							className="jev-target-preview"
							style={{
								top: targetPreview.top,
								left: targetPreview.left,
								width: targetPreview.width,
								height: targetPreview.height,
							}}
							aria-hidden
						>
							<span className="jev-target-preview-label">TARGET</span>
						</div>,
						document.body,
					)
				: null}
		</section>
	);
}
