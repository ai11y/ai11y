"use client";

import type { AgentConfig } from "@ai11y/core";
import { Ai11yProvider } from "@ai11y/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { CustomHighlightWrapper } from "@/components/Shared/CustomHighlight";
import { DemoUiProvider } from "@/context/DemoUiContext";
import { AppLayout } from "@/layout/AppLayout";

const apiEndpoint =
	process.env.NEXT_PUBLIC_AI11Y_API_ENDPOINT || "/api/ai11y/agent";
const agentConfig: AgentConfig = {
	apiEndpoint,
	mode: "auto" as const,
};

export function ClientProviders({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();

	const handleNavigate = React.useCallback(
		(route: string) => {
			if (route !== pathname) {
				router.push(route);
			}
		},
		[router, pathname],
	);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<Ai11yProvider onNavigate={handleNavigate} agentConfig={agentConfig}>
				<DemoUiProvider highlightWrapper={CustomHighlightWrapper}>
					<AppLayout>{children}</AppLayout>
				</DemoUiProvider>
			</Ai11yProvider>
		</ThemeProvider>
	);
}
