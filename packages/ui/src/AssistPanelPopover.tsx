import {
	Popover,
	type PopoverRootChangeEventDetails,
} from "@base-ui/react/popover";
import { X } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { AssistTrigger } from "./AssistTrigger.js";

export interface AssistPanelPopoverProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onClose?: () => void;
	children: React.ReactNode;
	trigger?: React.ReactNode;
	triggerClassName?: string;
	/** When true, the default trigger shows a primary-colored dot for new messages */
	hasNewMessages?: boolean;
}

export function AssistPanelPopover({
	isOpen,
	onOpenChange,
	onClose,
	children,
	trigger,
	triggerClassName = "fixed bottom-4 right-4 flex items-center justify-center border-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring z-[10000]",
	hasNewMessages = false,
}: AssistPanelPopoverProps) {
	// Handle open change, ignoring outside press events so users can interact with the page
	const handleOpenChange = useCallback(
		(open: boolean, eventDetails: PopoverRootChangeEventDetails) => {
			// Ignore outside clicks - the panel should stay open while interacting with the page
			if (!open && eventDetails.reason === "outside-press") {
				return;
			}
			onOpenChange(open);
		},
		[onOpenChange],
	);

	return (
		<Popover.Root open={isOpen} onOpenChange={handleOpenChange} modal={false}>
			<Popover.Trigger className={triggerClassName} aria-label="Open AI Agent">
				{trigger ?? <AssistTrigger hasNewMessages={hasNewMessages} />}
			</Popover.Trigger>

			<Popover.Portal className="z-200">
				<Popover.Positioner
					side="top"
					align="end"
					sideOffset={8}
					className="z-200"
				>
					<Popover.Popup className="origin-[var(--transform-origin)] fixed inset-0 w-screen h-[100dvh] max-h-none rounded-none md:relative md:inset-auto md:w-[min(320px,max(0px,calc((100vw-20rem-2rem)*0.85)))] md:h-[420px] md:max-h-[calc(100vh-80px)] md:rounded-sm bg-popover/70 backdrop-blur-2xl backdrop-saturate-150 text-popover-foreground shadow-xl shadow-black/10 border border-white/10 transition-[transform,scale,opacity] duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 flex flex-col z-200 overflow-hidden">
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="absolute top-2 right-2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
								aria-label="Close"
							>
								<X size={14} aria-hidden />
							</button>
						)}
						{children}
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
