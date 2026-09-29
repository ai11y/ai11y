import type { Instruction } from "@ai11y/core";
import {
	type AgentAdapterConfig,
	type LLMAgentConfig,
	plan,
} from "@ai11y/core";
import { useAi11yContext, useChat } from "@ai11y/react";
import { ChevronDown, FileText, Github } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useContextDrawer } from "@/context/ContextDrawerContext";
import { useDemoUi } from "@/context/DemoUiContext";
import { JevCopySwap } from "./JevCopySwap";
import {
	ActionProgress,
	InstructionComposer,
	JevInstructionSurface,
	JevModeFloatingTrigger,
	JevModeTrigger,
} from "./JevMode";
import { MarkerWithHighlight as Marker } from "./Shared/MarkerWithHighlight";
import { ThemeToggleButton } from "./Shared/ThemeToggleDynamic";
import { SuggestionChip } from "./SuggestionChip";

interface ScrollyHeroProps {
	onSuggestionReady?: (handler: (suggestion: string) => void) => void;
}

export function ScrollyHero({ onSuggestionReady }: ScrollyHeroProps = {}) {
	const { describe, act, track, agentConfig } = useAi11yContext();
	const { addHighlight, jevEnabled, setJevDraft } = useDemoUi();
	const { isOpen: isContextOpen, setIsOpen: setContextOpen } =
		useContextDrawer();
	const [isCompact, setIsCompact] = useState(false);
	const [showMessages, setShowMessages] = useState(false);
	const [hasNewMessages, setHasNewMessages] = useState(false);
	const [llmProgress, setLlmProgress] = useState(-1);
	const wasLlmProcessing = useRef(false);
	const lastSeenCountRef = useRef(0);
	const heroRef = useRef<HTMLElement>(null);
	const [barBottom, setBarBottom] = useState<number | null>(null);

	// Track scroll to switch between full and compact modes, and position bar above footer when footer is in view
	useEffect(() => {
		const updateBarPosition = () => {
			const scrollY = window.scrollY;
			const threshold = window.innerHeight * 0.6;
			setIsCompact(scrollY > threshold);

			const footer = document.getElementById("site-footer");
			if (!footer) return;
			const rect = footer.getBoundingClientRect();
			const gap = 24;
			if (rect.top < window.innerHeight) {
				setBarBottom(window.innerHeight - rect.top + gap);
			} else {
				setBarBottom(null);
			}
		};

		updateBarPosition();
		window.addEventListener("scroll", updateBarPosition, { passive: true });
		window.addEventListener("resize", updateBarPosition);
		return () => {
			window.removeEventListener("scroll", updateBarPosition);
			window.removeEventListener("resize", updateBarPosition);
		};
	}, []);

	const handleSubmit = async (
		message: string,
		messages: Array<{ type: string; content: string }>,
	) => {
		const ui = describe();

		const conversationMessages = messages
			.filter((m, index) => {
				if (
					index === messages.length - 1 &&
					m.type === "user" &&
					m.content === message
				) {
					return false;
				}
				return m.type === "user" || m.type === "assistant";
			})
			.map((m) => ({
				role: m.type === "user" ? ("user" as const) : ("assistant" as const),
				content: m.content,
			}));

		const adapterConfig: AgentAdapterConfig = {
			mode: agentConfig?.mode ?? "auto",
			forceRuleBased: agentConfig?.forceRuleBased,
			llmConfig:
				agentConfig?.apiEndpoint !== undefined
					? ({ apiEndpoint: agentConfig.apiEndpoint } as LLMAgentConfig)
					: undefined,
		};

		const response = await plan(
			ui,
			message,
			adapterConfig,
			conversationMessages,
		);

		track("agent_message", {
			input: message,
			instructions: response.instructions,
		});

		return {
			reply: response.reply,
			instructions:
				response.instructions && response.instructions.length > 0
					? response.instructions
					: undefined,
		};
	};

	const handleInstruction = (instruction: Instruction) => {
		setLlmProgress(2);
		act(instruction);
		if (instruction.action === "highlight") {
			addHighlight(instruction.id);
		}
	};

	const inputRef = useRef<HTMLInputElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const compactMessagesContainerRef = useRef<HTMLDivElement>(null);

	const scrollMessagesToBottom = useCallback(() => {
		const scrollToBottom = (el: HTMLDivElement | null) => {
			if (el) el.scrollTop = el.scrollHeight;
		};
		scrollToBottom(messagesContainerRef.current);
		scrollToBottom(compactMessagesContainerRef.current);
	}, []);

	const {
		messages,
		input,
		setInput,
		isProcessing,
		handleSubmit: handleChatSubmit,
	} = useChat({
		onSubmit: handleSubmit,
		onInstruction: handleInstruction,
		onMessage: scrollMessagesToBottom,
		initialMessage:
			"Welcome! I can help you navigate this page, highlight features, and interact with demos. Try saying 'show me navigation' or scroll down to explore!",
	});

	useEffect(() => {
		if (isProcessing) {
			wasLlmProcessing.current = true;
			setLlmProgress(1);
			return;
		}
		if (!wasLlmProcessing.current) return;
		wasLlmProcessing.current = false;
		setLlmProgress(3);
		const timeout = window.setTimeout(() => setLlmProgress(-1), 1200);
		return () => window.clearTimeout(timeout);
	}, [isProcessing]);

	useEffect(() => {
		if (showMessages) {
			scrollMessagesToBottom();
			setHasNewMessages(false);
			lastSeenCountRef.current = messages.length;
		}
	}, [showMessages, scrollMessagesToBottom, messages.length]);

	useEffect(() => {
		if (!showMessages && messages.length > lastSeenCountRef.current) {
			setHasNewMessages(true);
		}
	}, [messages.length, showMessages]);

	const recentMessages = messages.slice(-4);
	const lastMessage = messages[messages.length - 1];

	const handleSuggestion = useCallback(
		(suggestion: string) => {
			if (jevEnabled) {
				setJevDraft(suggestion);
				return;
			}
			setInput(suggestion);
			// Only focus on devices with fine pointer (mouse/trackpad) to avoid opening the keyboard on touch devices
			if (
				typeof window !== "undefined" &&
				window.matchMedia("(pointer: fine)").matches
			) {
				inputRef.current?.focus();
			}
		},
		[jevEnabled, setInput, setJevDraft],
	);

	useEffect(() => {
		onSuggestionReady?.(handleSuggestion);
	}, [onSuggestionReady, handleSuggestion]);

	return (
		<>
			<div
				className={`fixed top-0 left-0 z-[60] transition-all duration-300 ${
					isContextOpen ? "right-[var(--sidebar-width)]" : "right-0"
				}`}
			>
				<div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-end min-h-[57px] gap-3">
					<Link
						href="https://github.com/maerzhase/ui4ai"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-1.5"
					>
						<Github className="h-4 w-4" aria-hidden />
						<span className="hidden sm:inline">GitHub</span>
					</Link>
					<Link
						href="/docs/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
					>
						Docs
					</Link>
					<div className="flex items-center gap-2">
						<ThemeToggleButton />
						{!isContextOpen && (
							<Marker
								id="context_panel_toggle"
								label="ai11y Context Toggle"
								intent="Open the ai11y Context to view events, markers, and UI context"
							>
								<button
									type="button"
									onClick={() => setContextOpen(true)}
									className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium shadow-sm"
									aria-label="Open ai11y Context"
								>
									<FileText className="h-4 w-4" aria-hidden />
									View Context
								</button>
							</Marker>
						)}
					</div>
				</div>
			</div>

			<header
				className={`fixed top-0 left-0 z-50 transition-all duration-300 ${
					isContextOpen ? "right-[var(--sidebar-width)]" : "right-0"
				} ${
					isCompact
						? "opacity-100 translate-y-0"
						: "opacity-0 -translate-y-full pointer-events-none"
				}`}
			>
				<div className="bg-background/80 backdrop-blur-xl border-b border-border/50">
					<div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between min-h-[57px]">
						<div className="flex items-center gap-3">
							<h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								ai11y
							</h1>
							<span className="text-xs text-muted-foreground hidden sm:block">
								A structured UI context layer for{" "}
								<JevCopySwap normal="AI agents" jev="JEV" />
							</span>
						</div>
					</div>
				</div>
			</header>

			<section
				ref={heroRef}
				className="min-h-screen flex items-center justify-center relative"
			>
				<div className="relative max-w-2xl w-full mx-auto px-6">
					<JevModeTrigger />
					<div className="relative rounded-3xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

						<div className="relative p-8">
							<Marker
								id="hero_title"
								label="ai11y"
								intent="The main hero title - A structured UI context layer for AI agents"
							>
								<h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight text-center">
									ai11y
								</h1>
							</Marker>

							<div className="text-lg text-muted-foreground mb-6 text-center max-w-md mx-auto space-y-1">
								<p>
									A structured UI context layer for{" "}
									<JevCopySwap normal="AI agents" jev="JEV" />.
								</p>
								<p className="text-base">
									Makes existing user interfaces understandable and actionable
									for <JevCopySwap normal="AI agents" jev="JEV" />.
								</p>
							</div>

							{jevEnabled ? (
								<>
									<JevInstructionSurface />
									<p className="pt-3 text-center text-xs text-muted-foreground">
										Try{" "}
										<SuggestionChip
											onClick={() => handleSuggestion("highlight title")}
										>
											highlight title
										</SuggestionChip>{" "}
										or{" "}
										<SuggestionChip
											onClick={() => handleSuggestion("go to next section")}
										>
											go to next section
										</SuggestionChip>
									</p>
								</>
							) : (
								<>
									<div
										ref={messagesContainerRef}
										className="mb-4 max-h-40 overflow-y-auto scrollbar-thin"
									>
										<div className="space-y-2">
											{recentMessages.map((msg) => (
												<div
													key={msg.id}
													className={`text-sm px-3 py-2 rounded-xl ${
														msg.type === "user"
															? "bg-primary text-primary-foreground ml-8"
															: "bg-secondary text-secondary-foreground border border-border mr-8"
													}`}
												>
													{msg.content}
												</div>
											))}
											{isProcessing && (
												<div className="text-sm px-3 py-2 rounded-xl bg-secondary text-secondary-foreground border border-border mr-8">
													<span className="inline-flex gap-1">
														<span className="animate-bounce">·</span>
														<span className="animate-bounce [animation-delay:0.1s]">
															·
														</span>
														<span className="animate-bounce [animation-delay:0.2s]">
															·
														</span>
													</span>
												</div>
											)}
										</div>
									</div>

									<InstructionComposer
										value={input}
										onChange={setInput}
										onSubmit={handleChatSubmit}
										disabled={isProcessing}
										inputRef={isCompact ? undefined : inputRef}
										placeholder="What do you want to do?"
									/>
									<div className="mt-3 px-0.5">
										<ActionProgress progress={llmProgress} />
									</div>

									<p className="text-xs text-muted-foreground pt-2 text-center">
										Try{" "}
										<SuggestionChip
											onClick={() => handleSuggestion("highlight title")}
										>
											highlight title
										</SuggestionChip>{" "}
										or{" "}
										<SuggestionChip
											onClick={() => handleSuggestion("go to next section")}
										>
											go to next section
										</SuggestionChip>
									</p>
								</>
							)}
						</div>
					</div>

					<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60">
						<span className="text-xs">Scroll to explore</span>
						<div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center p-1">
							<div className="w-1 h-2 bg-current rounded-full animate-bounce" />
						</div>
					</div>
				</div>
			</section>

			<div
				className={`fixed z-50 w-full max-w-xl px-4 transition-all duration-300 ${
					isContextOpen
						? "left-[calc(50%-10rem)] -translate-x-1/2"
						: "left-1/2 -translate-x-1/2"
				} ${
					isCompact
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-8 pointer-events-none"
				}`}
				style={{
					bottom: barBottom !== null ? `${barBottom}px` : "1.5rem",
				}}
			>
				<div className="relative">
					<JevModeFloatingTrigger />
					<div className="overflow-hidden rounded-2xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl">
						{jevEnabled ? (
							<JevInstructionSurface
								compact
								className="p-5 pt-7 sm:p-6 sm:pt-8"
							/>
						) : (
							<>
								<div
									className={`overflow-hidden transition-all duration-300 ${
										showMessages ? "max-h-48" : "max-h-0"
									}`}
								>
									<div
										ref={compactMessagesContainerRef}
										className="max-h-48 overflow-y-auto border-b border-border/30 p-4 scrollbar-thin"
									>
										<div className="space-y-2">
											{recentMessages.map((msg) => (
												<div
													key={msg.id}
													className={`text-sm px-3 py-2 rounded-sm ${
														msg.type === "user"
															? "bg-primary text-primary-foreground ml-6"
															: "bg-secondary text-secondary-foreground border border-border mr-6"
													}`}
												>
													{msg.content}
												</div>
											))}
											{isProcessing && (
												<div className="text-sm px-3 py-2 rounded-sm bg-secondary text-secondary-foreground border border-border mr-6">
													<span className="inline-flex gap-1">
														<span className="animate-bounce">·</span>
														<span className="animate-bounce [animation-delay:0.1s]">
															·
														</span>
														<span className="animate-bounce [animation-delay:0.2s]">
															·
														</span>
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-3 p-4">
									<div className="flex min-h-7 items-center gap-2">
										<button
											type="button"
											onClick={() => setShowMessages((v) => !v)}
											className={`relative rounded-md p-1.5 transition-colors ${
												showMessages
													? "bg-primary/10 text-primary"
													: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
											}`}
											aria-label={
												showMessages ? "Collapse messages" : "Expand messages"
											}
										>
											<ChevronDown
												size={18}
												className={`transition-transform ${showMessages ? "rotate-180" : ""}`}
												aria-hidden
											/>
											{hasNewMessages && (
												<span
													className="absolute top-0.5 right-0.5 z-10 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background shrink-0"
													aria-hidden
												/>
											)}
										</button>

										<span className="text-xs font-medium text-muted-foreground">
											History
										</span>
										{!showMessages && lastMessage && (
											<div className="ml-auto hidden max-w-48 truncate px-2 text-xs text-muted-foreground sm:block">
												{lastMessage.content.slice(0, 40)}
												{lastMessage.content.length > 40 ? "..." : ""}
											</div>
										)}
									</div>
									<InstructionComposer
										value={input}
										onChange={setInput}
										onSubmit={handleChatSubmit}
										disabled={isProcessing}
										compact
										inputRef={isCompact ? inputRef : undefined}
										placeholder="What do you want to do?"
									/>
									<div className="px-0.5">
										<ActionProgress progress={llmProgress} />
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
