import { Form as FormPrimitive } from "@base-ui/react/form";
import * as React from "react";
import { cn } from "./lib/cn.js";

export interface FormProps<
	FormValues extends Record<string, unknown> = Record<string, unknown>,
> extends React.ComponentProps<typeof FormPrimitive<FormValues>> {
	className?: string;
}

export const Form = React.forwardRef<
	HTMLFormElement,
	FormProps<Record<string, unknown>>
>(({ className, children, ...props }, ref) => {
	return (
		<FormPrimitive ref={ref} className={cn("space-y-4", className)} {...props}>
			{children}
		</FormPrimitive>
	);
});

Form.displayName = "Form";

export type { FormProps };
