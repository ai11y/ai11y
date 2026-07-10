import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./lib/cn.js";

const textVariants = cva("", {
	variants: {
		size: {
			xs: "text-xs",
			sm: "text-sm",
			base: "text-base",
			lg: "text-lg",
			xl: "text-xl",
			"2xl": "text-2xl",
			"3xl": "text-3xl",
			"4xl": "text-4xl",
			"5xl": "text-5xl",
			"6xl": "text-6xl",
		},
		weight: {
			regular: "font-normal",
			medium: "font-medium",
			semibold: "font-semibold",
			bold: "font-bold",
		},
		align: {
			left: "text-left",
			center: "text-center",
			right: "text-right",
		},
		color: {
			primary: "text-foreground",
			secondary: "text-muted-foreground",
			muted: "text-muted-foreground/70",
			accent: "text-primary",
			destructive: "text-destructive",
			inherit: "text-inherit",
		},
	},
	defaultVariants: {
		size: "base",
		weight: "regular",
		color: "primary",
	},
});

export interface TextProps
	extends VariantProps<typeof textVariants>,
		Omit<useRender.ComponentProps<"span">, "render"> {
	children?: React.ReactNode;
	render?:
		| useRender.RenderProp
		| React.ReactElement
		| keyof React.JSX.IntrinsicElements;
}

export type TextElement = React.ComponentRef<"span">;

export function Text({
	className,
	align,
	size,
	weight,
	color,
	render,
	ref,
	children,
	...props
}: TextProps) {
	const defaultProps: useRender.ElementProps<"span"> = {
		className: cn(textVariants({ align, size, weight, color }), className),
		children,
	};

	// Handle string render prop by using it as defaultTagName
	const defaultTagName =
		typeof render === "string"
			? (render as keyof React.JSX.IntrinsicElements)
			: "span";
	const renderProp = typeof render === "string" ? undefined : render;

	const element = useRender({
		defaultTagName,
		render: renderProp,
		props: mergeProps<"span">(defaultProps, props),
		ref: ref,
	});

	return element;
}

Text.displayName = "Text";

export { textVariants };
