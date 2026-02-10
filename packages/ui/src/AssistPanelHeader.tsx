import { X } from "lucide-react";
import { Button } from "./Button.js";

export interface AssistPanelHeaderProps {
	title?: string;
	onClose: () => void;
}

export function AssistPanelHeader({
	title = "Agent",
	onClose,
}: AssistPanelHeaderProps) {
	return (
		<div className="px-3 py-2.5 border-b border-border/50 flex justify-between items-center">
			<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
				{title}
			</span>
			<Button
				onClick={onClose}
				className="bg-transparent border-none cursor-pointer text-muted-foreground p-0.5 hover:text-foreground transition-colors rounded hover:bg-muted"
				aria-label="Close"
			>
				<X size={14} aria-hidden />
			</Button>
		</div>
	);
}
