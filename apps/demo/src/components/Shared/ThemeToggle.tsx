"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
	const { setTheme, resolvedTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	const { onClick, ...restProps } = props;

	return (
		<button
			{...restProps}
			type="button"
			onClick={(e) => {
				toggleTheme();
				onClick?.(e);
			}}
			className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			aria-label="Toggle theme"
		>
			{resolvedTheme === "dark" ? (
				<Sun className="h-4 w-4 text-foreground" aria-hidden />
			) : (
				<Moon className="h-4 w-4 text-foreground" aria-hidden />
			)}
		</button>
	);
}
