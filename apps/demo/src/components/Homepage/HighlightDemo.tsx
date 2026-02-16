import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { SuggestionSection } from "@/components/Shared/SuggestionSection";

export function HighlightDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				Elements can be highlighted on command:
			</div>
			<div className="grid grid-cols-2 gap-3">
				<Marker
					id="highlight_demo_badge_1"
					label="Feature Badge"
					intent="A badge demonstrating the highlight feature"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary/15 border border-primary/40 shadow-sm">
						<div className="relative flex items-center justify-center w-10 h-10">
							<div className="absolute inset-0 rounded-full bg-background/70" />
							<span className="text-2xl relative z-10">✨</span>
						</div>
					</div>
				</Marker>
				<Marker
					id="highlight_demo_badge_2"
					label="Status Badge"
					intent="A status badge to highlight"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-primary/25 via-primary/18 to-primary/12 border border-primary/35 shadow-sm">
						<div className="relative flex items-center justify-center w-10 h-10">
							<div className="absolute inset-0 rounded-full bg-background/70" />
							<span className="text-2xl relative z-10">🎯</span>
						</div>
					</div>
				</Marker>
				<Marker
					id="highlight_demo_badge_3"
					label="Action Badge"
					intent="An action badge to highlight"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border border-primary/30 shadow-sm">
						<div className="relative flex items-center justify-center w-10 h-10">
							<div className="absolute inset-0 rounded-full bg-background/70" />
							<span className="text-2xl relative z-10">⚡</span>
						</div>
					</div>
				</Marker>
				<Marker
					id="highlight_demo_badge_4"
					label="Info Badge"
					intent="An info badge to highlight"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-primary/15 via-primary/12 to-primary/8 border border-primary/25 shadow-sm">
						<div className="relative flex items-center justify-center w-10 h-10">
							<div className="absolute inset-0 rounded-full bg-background/70" />
							<span className="text-2xl relative z-10">💡</span>
						</div>
					</div>
				</Marker>
			</div>
			<SuggestionSection
				suggestions={[
					"highlight feature badge",
					"highlight status badge",
					"highlight all badges",
				]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
