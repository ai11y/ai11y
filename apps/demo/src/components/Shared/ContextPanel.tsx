import { useAi11yContext } from "@ai11y/react";
import { useEffect, useState } from "react";

interface ContextPanelProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ContextPanel({ isOpen, onOpenChange }: ContextPanelProps) {
	const { events, describe, state, lastError } = useAi11yContext();
	const [context, setContext] = useState(() => describe());

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
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			millisecond: "2-digit",
		});
	};

	const formatPayload = (payload: unknown) => {
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
			<div className="flex items-center justify-between px-4 py-3 border-b border-border min-h-[57px]">
				<h2 className="text-sm font-semibold text-foreground">ai11y Context</h2>
				<button
					type="button"
					onClick={() => onOpenChange(false)}
					className="p-1 rounded hover:bg-accent transition-colors"
					aria-label="Close ai11y Context"
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

			<div className="flex-1 flex flex-col overflow-hidden min-h-0">
				<div className="flex-shrink-0 flex flex-col border-b border-border max-h-[50%] min-h-0">
					<div className="p-3 border-b border-border">
						<h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
							Events ({events.length})
						</h3>
					</div>
					<div className="flex-1 overflow-y-auto scrollbar-thin p-3">
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
											{event.payload && (
												<pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
													{formatPayload(event.payload)}
												</pre>
											)}
										</div>
									))
							)}
						</div>
					</div>
				</div>

				<div className="flex-1 flex flex-col overflow-hidden min-h-0">
					<div className="p-3 border-b border-border">
						<h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
							UI Context
						</h3>
					</div>
					<div className="flex-1 overflow-y-auto scrollbar-thin p-3">
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

							{context.inViewMarkerIds &&
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
				</div>
			</div>
		</div>
	);
}
