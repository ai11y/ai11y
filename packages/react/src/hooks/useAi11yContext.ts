import { useContext } from "react";
import { Ai11yProviderContext } from "../components/Ai11yProvider.js";

/**
 * Hook to access the AI accessibility context
 *
 * @example
 * ```tsx
 * const ctx = useAi11yContext()
 * const ui = ctx.describe()
 * ctx.act({ action: "click", id: "save_button" })
 * ```
 */
export function useAi11yContext() {
	const context = useContext(Ai11yProviderContext);
	if (!context) {
		throw new Error("useAi11yContext must be used within Ai11yProvider");
	}
	return context;
}
