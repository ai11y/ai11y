import dynamic from "next/dynamic";
import type React from "react";
import {
	ContextDrawerProvider,
	useContextDrawer,
} from "@/context/ContextDrawerContext";

const ContextPanel = dynamic(
	() =>
		import("@/components/Shared/ContextPanel").then((m) => ({
			default: m.ContextPanel,
		})),
	{ ssr: false },
);

interface AppLayoutProps {
	children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
	const { isOpen, setIsOpen } = useContextDrawer();

	return (
		<div className="min-h-screen bg-background text-foreground transition-colors overflow-x-hidden">
			<ContextPanel isOpen={isOpen} onOpenChange={setIsOpen} />
			<div
				className={`min-h-screen transition-all duration-300 ease-in-out ${
					isOpen ? "mr-80 w-[calc(100%-20rem)]" : "mr-0 w-full"
				}`}
			>
				{children}
			</div>
		</div>
	);
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<ContextDrawerProvider>
			<AppLayoutContent>{children}</AppLayoutContent>
		</ContextDrawerProvider>
	);
}
