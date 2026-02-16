import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./lib/cn.js";

const cardVariants = cva(
	"rounded-sm border border-border bg-card text-card-foreground",
	{
		variants: {
			variant: {
				default: "",
				elevated: "shadow-sm",
				outline: "bg-transparent",
			},
			padding: {
				none: "",
				sm: "p-3",
				md: "p-4",
				lg: "p-6",
			},
		},
		defaultVariants: {
			variant: "default",
			padding: "md",
		},
	},
);

export interface CardProps
	extends VariantProps<typeof cardVariants>,
		useRender.ComponentProps<"div"> {
	children?: React.ReactNode;
}

export type CardElement = React.ComponentRef<"div">;

export function Card({
	className,
	variant,
	padding,
	children,
	render,
	ref,
	...props
}: CardProps) {
	const defaultProps: useRender.ElementProps<"div"> = {
		className: cn(cardVariants({ variant, padding }), className),
		children,
	};

	const element = useRender({
		defaultTagName: "div",
		render,
		props: mergeProps<"div">(defaultProps, props),
		ref: ref,
	});

	return element;
}

Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
	return (
		<div className={cn("flex flex-col gap-1", className)} {...props}>
			{children}
		</div>
	);
}

CardHeader.displayName = "CardHeader";

export interface CardTitleProps
	extends React.HTMLAttributes<HTMLHeadingElement> {
	children?: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
	return (
		<h3
			className={cn("text-xl font-semibold text-foreground", className)}
			{...props}
		>
			{children}
		</h3>
	);
}

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps
	extends React.HTMLAttributes<HTMLParagraphElement> {
	children?: React.ReactNode;
}

export function CardDescription({
	className,
	children,
	...props
}: CardDescriptionProps) {
	return (
		<p className={cn("text-sm text-muted-foreground", className)} {...props}>
			{children}
		</p>
	);
}

CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode;
}

export function CardContent({
	className,
	children,
	...props
}: CardContentProps) {
	return (
		<div className={cn("pt-3", className)} {...props}>
			{children}
		</div>
	);
}

CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
	return (
		<div className={cn("flex items-center gap-2 pt-3", className)} {...props}>
			{children}
		</div>
	);
}

CardFooter.displayName = "CardFooter";

export { cardVariants };
