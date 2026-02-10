"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

/** Syntax highlighter that only renders theme-dependent content after mount to avoid hydration mismatch. */
export function ThemedSyntaxHighlighter(props: SyntaxHighlighterProps) {
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	const style = useMemo(
		() => (resolvedTheme === "dark" ? oneDark : oneLight),
		[resolvedTheme],
	);

	if (!mounted) {
		// Placeholder: same structure, no theme-dependent styling
		const { children, customStyle, PreTag = "pre", codeTagProps } = props;
		return (
			<PreTag
				style={{
					margin: 0,
					padding: "1rem",
					background: "transparent",
					fontSize: "0.875rem",
					lineHeight: 1.5,
					...customStyle,
				}}
			>
				<code {...codeTagProps}>{children}</code>
			</PreTag>
		);
	}

	return (
		<SyntaxHighlighter
			{...props}
			style={style}
			customStyle={{
				margin: 0,
				padding: "1rem",
				background: "transparent",
				fontSize: "0.875rem",
				lineHeight: 1.5,
				...(props.customStyle ?? {}),
			}}
		/>
	);
}
