import * as FieldPrimitive from "@base-ui/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/cn.js";

const fieldRootVariants = cva("space-y-2", {
	variants: {
		size: {
			sm: "space-y-1.5",
			md: "space-y-2",
			lg: "space-y-2.5",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const fieldLabelVariants = cva("text-xs font-medium text-foreground block", {
	variants: {
		size: {
			sm: "text-xs",
			md: "text-xs",
			lg: "text-sm",
		},
		error: {
			false: "",
			true: "text-destructive",
		},
	},
	defaultVariants: {
		size: "md",
		error: false,
	},
});

const fieldDescriptionVariants = cva("text-xs text-muted-foreground", {
	variants: {
		size: {
			sm: "text-xs",
			md: "text-xs",
			lg: "text-sm",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const fieldErrorVariants = cva("text-xs text-destructive", {
	variants: {
		size: {
			sm: "text-xs",
			md: "text-xs",
			lg: "text-sm",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export interface FieldProps
	extends VariantProps<typeof fieldRootVariants>,
		React.ComponentProps<typeof FieldPrimitive.Field.Root> {
	label?: React.ReactNode;
	description?: React.ReactNode;
	error?: React.ReactNode | boolean;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
	({ className, label, description, error, size, children, ...props }, ref) => {
		const hasError = typeof error === "boolean" ? error : !!error;
		const errorMessage =
			typeof error === "string"
				? error
				: error && typeof error !== "boolean"
					? String(error)
					: undefined;

		return (
			<FieldPrimitive.Field.Root
				ref={ref}
				className={cn(fieldRootVariants({ size }), className)}
				invalid={hasError}
				{...props}
			>
				{label && (
					<FieldPrimitive.Field.Label
						className={fieldLabelVariants({
							size,
							error: hasError,
						})}
					>
						{label}
					</FieldPrimitive.Field.Label>
				)}
				{description && (
					<FieldPrimitive.Field.Description
						className={fieldDescriptionVariants({ size })}
					>
						{description}
					</FieldPrimitive.Field.Description>
				)}
				{children}
				{errorMessage && (
					<FieldPrimitive.Field.Error className={fieldErrorVariants({ size })}>
						{errorMessage}
					</FieldPrimitive.Field.Error>
				)}
			</FieldPrimitive.Field.Root>
		);
	},
);

Field.displayName = "Field";

export type { FieldProps };
