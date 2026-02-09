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
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					className="text-background relative z-10"
					aria-hidden
				>
					<title>Assist</title>
					{/* Cute face - eyes */}
					<circle cx="8" cy="10" r="2" fill="currentColor" />
					<circle cx="16" cy="10" r="2" fill="currentColor" />
					{/* Smile */}
					<path
						d="M8 15c1.5 2 6.5 2 8 0"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</svg>
			</MorphingBlob>
		</div>
	);
}
