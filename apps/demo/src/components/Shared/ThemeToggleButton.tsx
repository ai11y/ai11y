"use client";

import { MarkerWithHighlight as Marker } from "./MarkerWithHighlight";
import { ThemeToggle } from "./ThemeToggle";

/** Theme button wrapped in Marker for ai11y context. */
export function ThemeToggleButton() {
	return (
		<Marker
			id="theme_toggle"
			label="Theme Toggle"
			intent="Toggle between light and dark theme"
		>
			<ThemeToggle />
		</Marker>
	);
}
