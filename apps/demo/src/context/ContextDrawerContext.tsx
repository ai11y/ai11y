import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface ContextDrawerContextType {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

const ContextDrawerContext = createContext<
	ContextDrawerContextType | undefined
>(undefined);

export function ContextDrawerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(() => {
		if (typeof window === "undefined") return false;
		const stored = localStorage.getItem("context-panel-open");
		return stored === "true";
	});

	useEffect(() => {
		localStorage.setItem("context-panel-open", String(isOpen));
	}, [isOpen]);

	return (
		<ContextDrawerContext.Provider value={{ isOpen, setIsOpen }}>
			{children}
		</ContextDrawerContext.Provider>
	);
}

export function useContextDrawer() {
	const context = useContext(ContextDrawerContext);
	if (context === undefined) {
		throw new Error(
			"useContextDrawer must be used within a ContextDrawerProvider",
		);
	}
	return context;
}
