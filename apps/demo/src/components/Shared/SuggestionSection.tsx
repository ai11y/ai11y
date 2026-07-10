import { SuggestionChip } from "@/components/SuggestionChip";

interface SuggestionSectionProps {
	suggestions: string[];
	onSuggestion: (suggestion: string) => void;
}

export function SuggestionSection({
	suggestions,
	onSuggestion,
}: SuggestionSectionProps) {
	return (
		<p className="text-xs text-muted-foreground pt-2 leading-7">
			Try{" "}
			{suggestions.map((suggestion, index, array) => (
				<span key={suggestion}>
					{index > 0 && index === array.length - 1 && " or "}
					{index > 0 && index < array.length - 1 && ", "}
					<SuggestionChip onClick={() => onSuggestion(suggestion)}>
						{suggestion}
					</SuggestionChip>
				</span>
			))}
		</p>
	);
}
