import { Button as BaseButton } from "@base-ui/react/button";
import type React from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
	return (
		<BaseButton className={className} {...props}>
			{children}
		</BaseButton>
	);
}
