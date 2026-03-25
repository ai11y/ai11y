"use client";

import dynamic from "next/dynamic";

/** Whole theme button (Marker + ThemeToggle) loaded client-only — nothing rendered on server. */
export const ThemeToggleButton = dynamic(
	() =>
		import("./ThemeToggleButton").then((m) => ({
			default: m.ThemeToggleButton,
		})),
	{ ssr: false, loading: () => null },
);
