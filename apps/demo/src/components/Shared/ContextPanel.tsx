import { useAi11yContext } from "@ai11y/react";
import { useEffect, useState } from "react";

interface ContextPanelProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

type SidebarTab = "ui-context" | "events";

export function ContextPanel({ isOpen, onOpenChange }: ContextPanelProps) {
	const { events, describe, state, lastError } = useAi11yContext();
	const [context, setContext] = useState(() => describe());
	const [activeTab, setActiveTab] = useState<SidebarTab>("ui-context");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const updateContext = () => {
			setContext(describe());
		};
		updateContext();
		const interval = setInterval(updateContext, 1000);

		return () => clearInterval(interval);
	}, [describe]);

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		const time = date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		const ms = String(date.getMilliseconds()).padStart(3, "0");
		return `${time}.${ms}`;
	};

	const formatPayload = (payload: unknown): string => {
		if (payload === null || payload === undefined) {
			return "null";
		}
		try {
			return JSON.stringify(payload, null, 2);
		} catch {
			return String(payload);
		}
	};

	return (
		<div
			className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-border shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-40 ${
				isOpen ? "translate-x-0" : "translate-x-full"
			}`}
		>
			<div className="flex-shrink-0 border-b border-border">
				<div className="flex items-center justify-between px-4 py-2.5">
					<h2 className="text-sm font-semibold text-foreground">
						What your agent sees
					</h2>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="p-1 rounded hover:bg-accent transition-colors -mr-1"
						aria-label="Close context panel"
					>
						<svg
							className="h-4 w-4 text-muted-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden
						>
							<title>Close</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div
					className="flex px-0 pb-0"
					role="tablist"
					aria-label="Sidebar panels"
				>
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === "ui-context"}
						aria-controls="sidebar-panel-ui-context"
						id="tab-ui-context"
						onClick={() => setActiveTab("ui-context")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
							activeTab === "ui-context"
								? "bg-muted/50 text-foreground"
								: "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
						}`}
					>
						UI Context
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === "events"}
						aria-controls="sidebar-panel-events"
						id="tab-events"
						onClick={() => setActiveTab("events")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
							activeTab === "events"
								? "bg-muted/50 text-foreground"
								: "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
						}`}
					>
						Events ({events.length})
					</button>
				</div>
			</div>

			<div className="flex-1 flex flex-col overflow-hidden min-h-0">
				{activeTab === "events" && (
					<div
						id="sidebar-panel-events"
						role="tabpanel"
						aria-labelledby="tab-events"
						className="flex-1 overflow-y-auto scrollbar-thin p-4"
					>
						<div className="space-y-2">
							{events.length === 0 ? (
								<p className="text-xs text-muted-foreground">No events yet</p>
							) : (
								events
									.slice()
									.reverse()
									.map((event, index) => (
										<div
											key={`${event.timestamp}-${index}`}
											className="p-2 rounded border border-border/50 bg-muted/30 text-xs"
										>
											<div className="flex items-center justify-between mb-1">
												<span className="font-medium text-foreground">
													{event.type}
												</span>
												<span className="text-muted-foreground">
													{formatTimestamp(event.timestamp)}
												</span>
											</div>
											{event.payload != null ? (
												<pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
													{formatPayload(event.payload)}
												</pre>
											) : null}
										</div>
									))
							)}
						</div>
					</div>
				)}

				{activeTab === "ui-context" && (
					<div
						id="sidebar-panel-ui-context"
						role="tabpanel"
						aria-labelledby="tab-ui-context"
						className="flex-1 overflow-y-auto scrollbar-thin p-4"
					>
						<div className="space-y-3 text-xs">
							<div>
								<div className="text-muted-foreground mb-1">Route</div>
								<div className="font-mono p-2 rounded border border-border/50 bg-muted/30 text-foreground">
									{context.route || "/"}
								</div>
							</div>

							<div>
								<div className="text-muted-foreground mb-1">State</div>
								<pre className="p-2 rounded border border-border/50 bg-muted/30 text-[10px] text-foreground overflow-x-auto">
									{Object.keys(state).length === 0
										? "{}"
										: formatPayload(state)}
								</pre>
							</div>

							{mounted &&
								context.inViewMarkerIds &&
								context.inViewMarkerIds.length > 0 && (
									<div>
										<div className="text-muted-foreground mb-1">
											In-View Markers ({context.inViewMarkerIds.length})
										</div>
										<div className="p-2 rounded border border-primary/50 bg-primary/10">
											<div className="flex flex-wrap gap-1">
												{context.inViewMarkerIds.map((markerId) => (
													<span
														key={markerId}
														className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary border border-primary/30"
													>
														{markerId}
													</span>
												))}
											</div>
										</div>
									</div>
								)}

							<div>
								<div className="text-muted-foreground mb-1">
									Markers ({context.markers.length})
								</div>
								<div className="space-y-1">
									{context.markers.length === 0 ? (
										<p className="text-muted-foreground p-2 rounded border border-border/50 bg-muted/30">
											No markers
										</p>
									) : (
										context.markers.map((marker) => {
											const isInView =
												context.inViewMarkerIds?.includes(marker.id) ?? false;
											return (
												<div
													key={marker.id}
													className={`p-2 rounded border ${
														isInView
															? "border-primary/50 bg-primary/10"
															: "border-border/50 bg-muted/30"
													}`}
												>
													<div className="flex items-center justify-between mb-1">
														<div className="font-medium text-foreground">
															{marker.id}
														</div>
														{isInView && (
															<span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary border border-primary/30">
																In View
															</span>
														)}
													</div>
													<div className="text-muted-foreground space-y-0.5">
														<div>
															<span className="font-medium">Type:</span>{" "}
															<span className="font-mono text-foreground">
																{marker.elementType}
															</span>
														</div>
														<div>
															<span className="font-medium">Label:</span>{" "}
															{marker.label}
														</div>
														<div>
															<span className="font-medium">Intent:</span>{" "}
															{marker.intent}
														</div>
													</div>
												</div>
											);
										})
									)}
								</div>
							</div>

							{lastError && (
								<div>
									<div className="text-muted-foreground mb-1">Last Error</div>
									<div className="p-2 rounded border border-destructive/50 bg-destructive/10">
										<div className="font-medium text-destructive mb-1">
											{lastError.error.message}
										</div>
										{lastError.meta && (
											<pre className="text-[10px] text-muted-foreground mt-1">
												{formatPayload(lastError.meta)}
											</pre>
										)}
										<div className="text-[10px] text-muted-foreground mt-1">
											{formatTimestamp(lastError.timestamp)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
