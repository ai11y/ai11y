import { Bot } from "lucide-react";
import { MorphingBlob } from "./MorphingBlob.js";

export interface AssistTriggerProps {
	className?: string;
}

export function AssistTrigger({ className = "" }: AssistTriggerProps) {
	return (
		<div className={`cursor-pointer group ${className}`}>
			<MorphingBlob
				size={44}
				className="text-foreground transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg group-active:scale-95"
			>
				<Bot size={18} className="text-background relative z-10" aria-hidden />
			</MorphingBlob>
		</div>
	);
}
