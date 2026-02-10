import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type * as React from "react";
import { cn } from "./lib/cn.js";

export interface TabsProps
	extends React.ComponentProps<typeof TabsPrimitive.Root> {}

export function Tabs({ className, ...props }: TabsProps) {
	return (
		<TabsPrimitive.Root className={cn("flex flex-col", className)} {...props} />
	);
}

export interface TabsListProps
	extends React.ComponentProps<typeof TabsPrimitive.List> {}

export function TabsList({ className, ...props }: TabsListProps) {
	return (
		<TabsPrimitive.List
			className={cn(
				"flex items-center gap-px border-b border-border bg-muted/30",
				className,
			)}
			{...props}
		/>
	);
}

const tabsTriggerBase =
	"flex-1 min-w-0 px-4 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
const tabsTriggerActive = "bg-muted/30 text-foreground";

export interface TabsTriggerProps
	extends React.ComponentProps<typeof TabsPrimitive.Tab> {}

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
	return (
		<TabsPrimitive.Tab
			className={(state: { active: boolean }) =>
				cn(
					tabsTriggerBase,
					state.active && tabsTriggerActive,
					typeof className === "function" ? className(state) : className,
				)
			}
			{...props}
		/>
	);
}

export interface TabsPanelProps
	extends React.ComponentProps<typeof TabsPrimitive.Panel> {}

export function TabsPanel({ className, ...props }: TabsPanelProps) {
	return (
		<TabsPrimitive.Panel
			className={cn(
				"flex-1 min-h-0 overflow-auto focus-visible:outline-none",
				className,
			)}
			{...props}
		/>
	);
}
