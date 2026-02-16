import { Marker as LibMarker } from "@ai11y/react";
import type React from "react";
import { useDemoUi } from "@/context/DemoUiContext";

interface MarkerWithHighlightProps {
	id: string;
	label: string;
	intent: string;
	children: React.ReactElement;
}

/**
 * Demo Marker that applies the custom highlight wrapper (e.g. Bouncy animation)
 * when this marker is in the demo's highlighted set.
 */
export function MarkerWithHighlight({
	id,
	label,
	intent,
	children,
}: MarkerWithHighlightProps) {
	const { highlightedMarkers, highlightWrapper } = useDemoUi();
	const isHighlighted = highlightedMarkers.has(id);
	const Wrapper = highlightWrapper;

	const content =
		isHighlighted && Wrapper ? (
			<Wrapper markerId={id}>{children}</Wrapper>
		) : (
			children
		);

	return (
		<LibMarker id={id} label={label} intent={intent}>
			{content}
		</LibMarker>
	);
}
