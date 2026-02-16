import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/cn.js";

const inputVariants = cva(
	"w-full rounded-sm border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors",
	{
		variants: {
			size: {
				sm: "h-7 px-2 text-sm",
				md: "h-10 px-3 py-2",
				lg: "h-11 px-3 py-2.5 text-base",
			},
			variant: {
				default: "",
				ghost: "border-transparent bg-transparent hover:border-border",
			},
			error: {
				false: "",
				true: "border-destructive focus:ring-destructive/50",
			},
		},
		defaultVariants: {
			size: "md",
			variant: "default",
			error: false,
		},
	},
);

const inputContainerVariants = cva(
	"flex w-full items-center gap-3 rounded-sm border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 transition-colors",
	{
		variants: {
			size: {
				sm: "h-7 px-2",
				md: "h-10 px-3 py-2",
				lg: "h-11 px-3 py-2.5",
			},
			variant: {
				default: "",
				ghost: "border-transparent bg-transparent hover:border-border",
			},
			error: {
				false: "",
				true: "border-destructive focus-within:ring-destructive/50",
			},
		},
		defaultVariants: {
			size: "md",
			variant: "default",
			error: false,
		},
	},
);

export interface InputProps
	extends VariantProps<typeof inputVariants>,
		Omit<React.ComponentProps<typeof InputPrimitive>, "size"> {
	inputClassName?: string;
	error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{ className, inputClassName, size, variant, error, children, ...props },
		ref,
	) => {
		// Use container when there are children (InputSlot)
		if (children) {
			return (
				<div
					className={cn(
						inputContainerVariants({ size, variant, error }),
						className,
					)}
				>
					<InputPrimitive
						spellCheck={false}
						className={cn(
							"h-full w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none",
							error && "text-destructive",
							inputClassName,
						)}
						{...props}
						ref={ref}
					/>
					{children}
				</div>
			);
		}

		return (
			<InputPrimitive
				spellCheck={false}
				className={cn(
					inputVariants({ size, variant, error }),
					className,
					inputClassName,
				)}
				{...props}
				ref={ref}
			/>
		);
	},
);

Input.displayName = "Input";

function InputSlot({
	className,
	side = "left",
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	side?: "left" | "right";
}) {
	return (
		<div
			className={cn(
				"px-1",
				{
					"-order-1": side === "left",
				},
				className,
			)}
			{...props}
		/>
	);
}

InputSlot.displayName = "InputSlot";

export { InputSlot };
