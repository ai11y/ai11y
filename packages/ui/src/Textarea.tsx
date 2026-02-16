import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/cn.js";

const textareaVariants = cva(
	"w-full rounded-sm border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors",
	{
		variants: {
			size: {
				sm: "px-2 py-1.5 text-sm",
				md: "px-3 py-2",
				lg: "px-3 py-2.5 text-base",
			},
			error: {
				false: "",
				true: "border-destructive focus:ring-destructive/50",
			},
		},
		defaultVariants: {
			size: "md",
			error: false,
		},
	},
);

export interface TextareaProps
	extends VariantProps<typeof textareaVariants>,
		React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, size, error, ...props }, ref) => {
		return (
			<textarea
				className={cn(textareaVariants({ size, error }), className)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Textarea.displayName = "Textarea";

export type { TextareaProps };
