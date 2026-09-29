"use client";

import type { ReactNode } from "react";
import { useDemoUi } from "@/context/DemoUiContext";

export function JevCopySwap({
	normal,
	jev,
}: {
	normal: ReactNode;
	jev: ReactNode;
}) {
	const { jevEnabled } = useDemoUi();

	return (
		<span className="inline-flex flex-wrap items-baseline gap-x-1.5">
			<span className={jevEnabled ? "jev-copy-out" : undefined}>{normal}</span>
			{jevEnabled ? <span className="jev-copy-in">{jev}</span> : null}
		</span>
	);
}
