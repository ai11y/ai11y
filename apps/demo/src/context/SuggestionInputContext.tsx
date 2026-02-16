import { createContext, useContext } from "react";

interface SuggestionInputContextValue {
	setSuggestion: (suggestion: string) => void;
}

const SuggestionInputContext =
	createContext<SuggestionInputContextValue | null>(null);

export function SuggestionInputProvider({
	children,
	value,
}: {
	children: React.ReactNode;
	value: SuggestionInputContextValue;
}) {
	return (
		<SuggestionInputContext.Provider value={value}>
			{children}
		</SuggestionInputContext.Provider>
	);
}

export function useSuggestionInput() {
	const context = useContext(SuggestionInputContext);
	if (!context) {
		throw new Error(
			"useSuggestionInput must be used within SuggestionInputProvider",
		);
	}
	return context;
}
