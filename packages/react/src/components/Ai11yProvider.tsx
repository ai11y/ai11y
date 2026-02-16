import {
	type AgentConfig,
	type Ai11yError,
	type Ai11yEvent,
	type Ai11yState,
	createClient,
	getError,
	getEvents,
	getRoute,
	getState,
	setState,
	subscribe,
	subscribeToStore,
} from "@ai11y/core";
import type React from "react";
import { createContext, useEffect, useRef, useState } from "react";

export interface Ai11yProviderContextValue {
	state: Ai11yState;
	currentRoute: string;
	lastError: Ai11yError | null;
	events: Ai11yEvent[];
	onNavigate?: (route: string) => void;
	track: (event: string, payload?: unknown) => void;
	reportError: (
		error: Error,
		meta?: { surface?: string; markerId?: string },
	) => void;
	describe: () => import("@ai11y/core").Ai11yContext;
	act: (instruction: import("@ai11y/core").Instruction) => void;
	agentConfig: AgentConfig | null;
}

const Ai11yProviderContext = createContext<Ai11yProviderContextValue | null>(
	null,
);

interface Ai11yProviderProps {
	children: React.ReactNode;
	initialState?: Ai11yState;
	onNavigate?: (route: string) => void;
	agentConfig?: AgentConfig;
}

export function Ai11yProvider({
	children,
	initialState = {},
	onNavigate,
	agentConfig,
}: Ai11yProviderProps) {
	const clientRef = useRef(
		createClient({
			onNavigate,
		}),
	);

	useEffect(() => {
		if (Object.keys(initialState).length > 0) {
			setState(initialState);
		}
	}, [initialState]);

	const [currentRoute, setCurrentRoute] = useState<string>(
		() => getRoute() || "/",
	);
	const [uiState, setUIState] = useState<Ai11yState>(() => {
		const coreState = getState();
		return coreState || {};
	});
	const [lastError, setLastError] = useState<Ai11yError | null>(() => {
		const coreError = getError();
		return coreError || null;
	});
	const [events, setEvents] = useState<Ai11yEvent[]>(() => getEvents());

	useEffect(() => {
		const unsubscribe = subscribeToStore(
			(type: "route" | "state" | "error", value: unknown) => {
				if (type === "route") {
					setCurrentRoute((value as string) || "/");
				} else if (type === "state") {
					setUIState((value as Ai11yState) || {});
				} else if (type === "error") {
					setLastError((value as Ai11yError | null) || null);
				}
			},
		);
		return unsubscribe;
	}, []);

	useEffect(() => {
		const unsubscribe = subscribe(() => {
			setEvents([...getEvents()]);
		});
		return unsubscribe;
	}, []);

	const value: Ai11yProviderContextValue = {
		state: uiState,
		currentRoute,
		lastError,
		events,
		onNavigate,
		track: clientRef.current.track.bind(clientRef.current),
		reportError: clientRef.current.reportError.bind(clientRef.current),
		describe: clientRef.current.describe.bind(clientRef.current),
		act: clientRef.current.act.bind(clientRef.current),
		agentConfig: agentConfig ?? null,
	};

	return (
		<Ai11yProviderContext.Provider value={value}>
			{children}
		</Ai11yProviderContext.Provider>
	);
}

export { Ai11yProviderContext };
