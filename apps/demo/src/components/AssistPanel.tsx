import {
	type AgentAdapterConfig,
	type LLMAgentConfig,
	plan,
} from "@ai11y/core";
import { useAi11yContext, useChat } from "@ai11y/react";
import { AssistPanelPopover, ChatInput, MessageBubble } from "@ai11y/ui";
import type React from "react";
import { useEffect, useRef } from "react";
import { useDemoUi } from "@/context/DemoUiContext";

export function AssistPanel() {
	const { describe, act, track, agentConfig } = useAi11yContext();
	const {
		isPanelOpen,
		setIsPanelOpen,
		pendingMessage,
		clearPendingMessage,
		addHighlight,
	} = useDemoUi();

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

	const handleInstruction = (
		instruction: import("@ai11y/core").Instruction,
	) => {
		act(instruction);
		if (instruction.action === "highlight") {
			addHighlight(instruction.id);
		}
	};

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const {
		messages,
		input,
		setInput,
		isProcessing,
		handleSubmit: handleChatSubmit,
	} = useChat({
		onSubmit: handleSubmit,
		onInstruction: handleInstruction,
		onMessage: () => {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		},
	});

	useEffect(() => {
		if (isPanelOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isPanelOpen]);

	useEffect(() => {
		if (!pendingMessage || !isPanelOpen) return;

		setInput(pendingMessage);
		clearPendingMessage();

		const timeout = window.setTimeout(() => {
			inputRef.current?.focus();
		}, 0);

		return () => window.clearTimeout(timeout);
	}, [pendingMessage, isPanelOpen, setInput, clearPendingMessage]);

	return (
		<AssistPanelPopover
			isOpen={isPanelOpen}
			onOpenChange={setIsPanelOpen}
			onClose={() => setIsPanelOpen(false)}
		>
			<div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
				{messages.map((msg, index) => (
					<MessageBubble
						key={msg.id ?? `msg-${index}`}
						message={{
							type: msg.type,
							content: msg.content,
						}}
					/>
				))}
				{isProcessing && (
					<div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground">
						<span className="inline-flex gap-0.5">
							<span className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse" />
							<span className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:150ms]" />
							<span className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:300ms]" />
						</span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<ChatInput
				value={input}
				onChange={setInput}
				onSubmit={handleChatSubmit}
				disabled={isProcessing}
				inputRef={inputRef as React.RefObject<HTMLInputElement>}
			/>
		</AssistPanelPopover>
	);
}
