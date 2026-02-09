import type React from "react";

interface CustomHighlightWrapperProps {
	markerId: string;
	children: React.ReactNode;
}

/**
 * Custom highlight wrapper component that uses Tailwind CSS classes
 * This demonstrates the new component-based highlighting approach
 */
export function CustomHighlightWrapper({
	markerId: _markerId,
	children,
}: CustomHighlightWrapperProps) {
	return (
		<div className="rq-highlight-rubberband z-50 relative transition-transform duration-300 will-change-transform">
			{children}
		</div>
	);
}
