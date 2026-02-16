import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./lib/cn.js";

const chipVariants = cva(
	"inline-flex items-center justify-center text-sm rounded-md",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground",
				outline: "border border-border bg-transparent text-foreground",
				solid: "bg-foreground text-background",
				primary: "bg-primary text-primary-foreground",
			},
			size: {
				sm: "px-1.5 py-0.5 text-xs",
				md: "px-2 py-0.5 text-sm",
				lg: "px-2.5 py-1 text-base",
			},
			interactive: {
				true: "cursor-pointer hover:opacity-80 active:scale-95",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
			interactive: false,
		},
	},
);

export interface ChipProps
	extends VariantProps<typeof chipVariants>,
		Omit<useRender.ComponentProps<"span">, "render"> {
	children?: React.ReactNode;
	render?:
		| useRender.RenderProp
		| React.ReactElement
		| keyof React.JSX.IntrinsicElements;
}

export type ChipElement = React.ComponentRef<"span">;

export function Chip({
	className,
	variant,
	size,
	interactive,
	children,
	render,
	ref,
	...props
}: ChipProps) {
	const defaultProps: useRender.ElementProps<"span"> = {
		className: cn(chipVariants({ variant, size, interactive }), className),
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

Chip.displayName = "Chip";

export { chipVariants };
