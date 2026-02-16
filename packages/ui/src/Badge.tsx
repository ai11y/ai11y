import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./lib/cn.js";

const badgeVariants = cva(
	"inline-flex items-center gap-1 text-xs rounded-xs px-1.5 py-0.5",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground",
				success: "bg-primary/20 text-primary",
				warning: "bg-accent/20 text-accent-foreground",
				error: "bg-destructive/15 text-destructive",
				primary: "bg-primary/20 text-primary",
				outline: "border border-border bg-transparent text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends VariantProps<typeof badgeVariants>,
		useRender.ComponentProps<"span"> {
	children?: React.ReactNode;
	dot?: boolean;
}

export type BadgeElement = React.ComponentRef<"span">;

export function Badge({
	className,
	variant,
	children,
	dot = false,
	render,
	ref,
	...props
}: BadgeProps) {
	const defaultProps: useRender.ElementProps<"span"> = {
		className: cn(badgeVariants({ variant }), className),
		children: (
			<>
				{dot && (
					<span
						className={cn(
							"w-1.5 h-1.5 rounded-full",
							variant === "success" && "bg-primary",
							variant === "warning" && "bg-accent-foreground",
							variant === "error" && "bg-destructive",
							variant === "primary" && "bg-primary",
							(!variant || variant === "default" || variant === "outline") &&
								"bg-muted-foreground",
						)}
					/>
				)}
				{children}
			</>
		),
	};

	const element = useRender({
		defaultTagName: "span",
		render,
		props: mergeProps<"span">(defaultProps, props),
		ref: ref,
	});

	return element;
}

Badge.displayName = "Badge";

export { badgeVariants };
