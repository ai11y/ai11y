import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "./lib/cn.js";

const selectTriggerVariants = cva(
	"inline-flex w-full items-center justify-between rounded-sm border border-border bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors",
	{
		variants: {
			size: {
				sm: "h-7 px-2",
				md: "h-10 px-3 py-2",
				lg: "h-11 px-3 py-2.5",
			},
			error: {
				false: "",
				true: "border-destructive focus-visible:ring-destructive/50",
			},
		},
		defaultVariants: {
			size: "md",
			error: false,
		},
	},
);

export interface SelectProps
	extends React.ComponentProps<typeof SelectPrimitive.Root> {}

export function Select({ children, ...props }: SelectProps) {
	return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}

export interface SelectTriggerProps
	extends VariantProps<typeof selectTriggerVariants>,
		React.ComponentProps<typeof SelectPrimitive.Trigger> {
	error?: boolean;
}

export const SelectTrigger = React.forwardRef<
	HTMLButtonElement,
	SelectTriggerProps
>(({ className, size, error, children, ...props }, ref) => {
	return (
		<SelectPrimitive.Trigger
			ref={ref}
			className={cn(selectTriggerVariants({ size, error }), className)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon className="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground">
				<ChevronDown aria-hidden size={16} />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
});

SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps
	extends React.ComponentProps<typeof SelectPrimitive.Value> {}

export function SelectValue({ className, ...props }: SelectValueProps) {
	return (
		<SelectPrimitive.Value
			className={cn(
				"flex-1 text-left text-foreground data-[placeholder]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export interface SelectContentProps {
	className?: string;
	listClassName?: string;
	children: React.ReactNode;
}

export function SelectContent({
	className,
	listClassName,
	children,
}: SelectContentProps) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner side="bottom" align="center">
				<SelectPrimitive.Popup
					className={cn(
						"z-50 overflow-hidden rounded-sm border border-border bg-background text-foreground shadow-lg",
						className,
					)}
					style={{ width: "var(--anchor-width)" }}
				>
					<SelectPrimitive.List
						className={cn(
							"max-h-60 overflow-y-auto py-1 text-sm bg-background",
							listClassName,
						)}
					>
						{children}
					</SelectPrimitive.List>
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

export interface SelectItemProps
	extends React.ComponentProps<typeof SelectPrimitive.Item> {}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"relative flex cursor-default select-none items-center gap-2 px-3 py-1.5 text-sm text-foreground outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator className="inline-flex h-4 w-4 items-center justify-center text-primary">
				<Check aria-hidden size={16} />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}
