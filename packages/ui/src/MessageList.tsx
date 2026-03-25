import type React from "react";
import { MessageBubble } from "./MessageBubble.js";

export interface Message {
	type: "user" | "assistant" | "system";
	content: string;
	id?: string;
}

export interface MessageListProps {
	messages: Message[];
	isProcessing?: boolean;
	messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function MessageList({
	messages,
	isProcessing = false,
	messagesEndRef,
}: MessageListProps) {
	return (
		<div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
			{messages.map((msg, index) => (
				<MessageBubble key={msg.id ?? `msg-${index}`} message={msg} />
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
	);
}
