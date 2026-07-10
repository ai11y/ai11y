export interface MessageBubbleProps {
	message: {
		type: "user" | "assistant" | "system";
		content: string;
	};
}

export function MessageBubble({ message }: MessageBubbleProps) {
	return (
		<div
			className={`flex flex-col ${
				message.type === "user" ? "items-end" : "items-start"
			}`}
		>
			<div
				className={`max-w-[85%] text-[13px] leading-snug ${
					message.type === "user"
						? "px-2.5 py-1.5 rounded-sm bg-foreground text-background"
						: message.type === "system"
							? "text-muted-foreground text-xs italic"
							: "px-2.5 py-1.5 rounded-sm bg-secondary text-secondary-foreground border border-border"
				}`}
			>
				{message.content}
			</div>
		</div>
	);
}
