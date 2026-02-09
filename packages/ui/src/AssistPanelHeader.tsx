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
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<title>Close</title>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</Button>
		</div>
	);
}
