import { useEffect, useState } from "react";

function getInitialTheme(): "light" | "dark" {
	const stored = localStorage.getItem("theme");
	if (stored === "dark" || stored === "light") {
		return stored;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme: "light" | "dark") {
	const root = document.documentElement;
	if (theme === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}
}

export function ThemeToggle(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
	const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	useEffect(() => {
		applyTheme(theme);
		localStorage.setItem("theme", theme);
		window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
	}, [theme]);

	// Listen for theme changes to sync between multiple instances
	useEffect(() => {
		const handleThemeChange = (e: Event) => {
			const customEvent = e as CustomEvent<string>;
			if (customEvent.detail === "dark" || customEvent.detail === "light") {
				setTheme(customEvent.detail);
			}
		};
		window.addEventListener("themechange", handleThemeChange);
		return () => window.removeEventListener("themechange", handleThemeChange);
	}, []);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	const { onClick, ref, ...restProps } = props;

	return (
		<button
			{...restProps}
			ref={ref}
			type="button"
			onClick={(e) => {
				toggleTheme();
				onClick?.(e);
			}}
			className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			aria-label="Toggle theme"
		>
			{theme === "light" ? (
				<svg
					className="h-4 w-4 text-foreground"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden
				>
					<title>Moon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/>
				</svg>
			) : (
				<svg
					className="h-4 w-4 text-foreground"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden
				>
					<title>Sun</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			)}
		</button>
	);
}
