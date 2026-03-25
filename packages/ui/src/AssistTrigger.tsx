import { Bot } from "lucide-react";
import { MorphingBlob } from "./MorphingBlob.js";

export interface AssistTriggerProps {
	className?: string;
	/** When true, shows a primary-colored dot to indicate new messages */
	hasNewMessages?: boolean;
}

export function AssistTrigger({
	className = "",
	hasNewMessages = false,
}: AssistTriggerProps) {
	return (
		<div className={`relative cursor-pointer group ${className}`}>
			<MorphingBlob
				size={44}
				className="text-foreground transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg group-active:scale-95"
			>
				<Bot size={18} className="text-background relative z-10" aria-hidden />
			</MorphingBlob>
			{hasNewMessages && (
				<span
					className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background z-20"
					aria-hidden
				/>
			)}
		</div>
	);
}
