import { Chip } from "@ai11y/ui";

interface SuggestionChipProps {
	children: string;
	onClick: () => void;
}

export function SuggestionChip({ children, onClick }: SuggestionChipProps) {
	return (
		<Chip
			render="button"
			interactive={true}
			variant="outline"
			size="sm"
			onClick={onClick}
		>
			{children}
		</Chip>
	);
}
