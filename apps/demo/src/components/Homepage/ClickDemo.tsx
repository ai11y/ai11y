import { setState } from "@ai11y/core";
import { useEffect, useState } from "react";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { SuggestionSection } from "@/components/Shared/SuggestionSection";

export function ClickDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const [counter, setCounter] = useState(0);
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		setState({
			counterValue: counter,
			counterIsActive: isActive,
		});
	}, [counter, isActive]);

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				Give your agent the ability to interact with buttons:
			</div>
			<div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
				<div>
					<div className="text-xs text-muted-foreground mb-1">Counter</div>
					<div className="text-2xl font-bold text-foreground">{counter}</div>
				</div>
				<div className="flex gap-2">
					<Marker
						id="click_demo_decrement"
						label="Decrement Button"
						intent="Decreases the counter by 1"
					>
						<button
							type="button"
							onClick={() => setCounter((c) => c - 1)}
							className="w-10 h-10 rounded-sm border border-border bg-background text-foreground font-bold hover:bg-muted transition-colors"
						>
							−
						</button>
					</Marker>
					<Marker
						id="click_demo_increment"
						label="Increment Button"
						intent="Increases the counter by 1"
					>
						<button
							type="button"
							onClick={() => setCounter((c) => c + 1)}
							className="w-10 h-10 rounded-sm border border-border bg-background text-foreground font-bold hover:bg-muted transition-colors"
						>
							+
						</button>
					</Marker>
				</div>
			</div>
			<div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
				<div>
					<div className="text-xs text-muted-foreground mb-1">Status</div>
					<div
						className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
					>
						{isActive ? "Active" : "Inactive"}
					</div>
				</div>
				<Marker
					id="click_demo_toggle"
					label="Toggle Status"
					intent="Toggles the active status"
				>
					<button
						type="button"
						onClick={() => setIsActive((v) => !v)}
						className={`px-4 py-2 rounded-sm font-medium transition-all ${
							isActive
								? "bg-primary text-primary-foreground hover:bg-primary/90"
								: "border border-border bg-background text-foreground hover:bg-muted"
						}`}
					>
						{isActive ? "Deactivate" : "Activate"}
					</button>
				</Marker>
			</div>
			<SuggestionSection
				suggestions={[
					"increment counter 10 times",
					"decrement counter",
					"toggle status",
					"what is the current counter value?",
				]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
