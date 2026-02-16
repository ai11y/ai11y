import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

export interface DemoUiContextValue {
	isPanelOpen: boolean;
	setIsPanelOpen: (open: boolean) => void;
	pendingMessage: string | null;
	clearPendingMessage: () => void;
	openPanelWithMessage: (message: string) => void;
	togglePanelForMarker: (markerId: string, message: string) => void;
	highlightedMarkers: Set<string>;
	addHighlight: (markerId: string, duration?: number) => void;
	focusedMarkerId: string | null;
	highlightWrapper?: React.ComponentType<{
		children: React.ReactNode;
		markerId: string;
	}>;
}

const DemoUiContext = createContext<DemoUiContextValue | null>(null);

export interface DemoUiProviderProps {
	children: React.ReactNode;
	highlightWrapper?: React.ComponentType<{
		children: React.ReactNode;
		markerId: string;
	}>;
}

export function DemoUiProvider({
	children,
	highlightWrapper,
}: DemoUiProviderProps) {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);
	const [highlightedMarkers, setHighlightedMarkers] = useState<Set<string>>(
		new Set(),
	);
	const [focusedMarkerId, setFocusedMarkerId] = useState<string | null>(null);
	const focusedMarkerIdRef = useRef<string | null>(null);
	const isPanelOpenRef = useRef(false);
	const highlightTimeoutRef = useRef<Map<string, number>>(new Map());

	focusedMarkerIdRef.current = focusedMarkerId;
	isPanelOpenRef.current = isPanelOpen;

	const addHighlight = useCallback((markerId: string, duration = 2000) => {
		setHighlightedMarkers((prev) => {
			const next = new Set(prev);
			next.add(markerId);
			return next;
		});

		const existingTimeout = highlightTimeoutRef.current.get(markerId);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		const timeout = window.setTimeout(() => {
			setHighlightedMarkers((prev) => {
				const next = new Set(prev);
				next.delete(markerId);
				return next;
			});
			highlightTimeoutRef.current.delete(markerId);
		}, duration);

		highlightTimeoutRef.current.set(markerId, timeout);
	}, []);

	const openPanelWithMessage = useCallback((message: string) => {
		setPendingMessage(message);
		setIsPanelOpen(true);
	}, []);

	const togglePanelForMarker = useCallback(
		(markerId: string, message: string) => {
			const currentFocusedId = focusedMarkerIdRef.current;
			const currentPanelOpen = isPanelOpenRef.current;

			if (currentFocusedId === markerId && currentPanelOpen) {
				setIsPanelOpen(false);
				setFocusedMarkerId(null);
				return;
			}

			setFocusedMarkerId(markerId);
			setPendingMessage(message);
			setIsPanelOpen(true);
		},
		[],
	);

	const clearPendingMessage = useCallback(() => {
		setPendingMessage(null);
	}, []);

	const handleSetIsPanelOpen = useCallback((open: boolean) => {
		setIsPanelOpen(open);
		if (!open) {
			setFocusedMarkerId(null);
		}
	}, []);

	useEffect(() => {
		return () => {
			highlightTimeoutRef.current.forEach((timeout) => {
				clearTimeout(timeout);
			});
			highlightTimeoutRef.current.clear();
		};
	}, []);

	const value: DemoUiContextValue = {
		isPanelOpen,
		setIsPanelOpen: handleSetIsPanelOpen,
		pendingMessage,
		clearPendingMessage,
		openPanelWithMessage,
		togglePanelForMarker,
		highlightedMarkers,
		addHighlight,
		focusedMarkerId,
		highlightWrapper,
	};

	return (
		<DemoUiContext.Provider value={value}>{children}</DemoUiContext.Provider>
	);
}

export function useDemoUi(): DemoUiContextValue {
	const context = useContext(DemoUiContext);
	if (!context) {
		throw new Error("useDemoUi must be used within DemoUiProvider");
	}
	return context;
}
