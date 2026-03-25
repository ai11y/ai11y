import { useId } from "react";

export interface MorphingBlobProps {
	/** Size in pixels */
	size?: number;
	/** CSS class for additional styling */
	className?: string;
	/** Content to render inside the blob */
	children?: React.ReactNode;
	/** Animation duration in seconds */
	duration?: number;
}

export function MorphingBlob({
	size = 44,
	className = "",
	children,
	duration = 6,
}: MorphingBlobProps) {
	const id = useId();
	const gradientId = `quest-grad-${id}`;

	// Scale the path coordinates based on size (paths are designed for 44x44)
	const _scale = size / 44;
	const viewBox = `0 0 ${size} ${size}`;

	// Center point
	const c = size / 2;
	// Radius variations
	const r1 = size * 0.45; // ~20 at 44
	const r2 = size * 0.36; // ~16 at 44
	const r3 = size * 0.41; // ~18 at 44

	// Generate blob path keyframes
	const paths = [
		`M${c} ${c - r1} Q${c + r1 * 0.6} ${c - r1} ${c + r1 * 0.9} ${c - r1 * 0.55} Q${c + r1} ${c - r1 * 0.1} ${c + r1 * 0.9} ${c + r2 * 0.4} Q${c + r1 * 0.6} ${c + r1} ${c} ${c + r1} Q${c - r1 * 0.55} ${c + r1} ${c - r1 * 0.9} ${c + r3 * 0.5} Q${c - r1} ${c} ${c - r1 * 0.7} ${c - r2 * 0.5} Q${c - r1 * 0.45} ${c - r1} ${c} ${c - r1} Z`,
		`M${c} ${c - r2} Q${c + r1 * 0.7} ${c - r2 * 0.85} ${c + r3 * 0.8} ${c - r2 * 0.3} Q${c + r1 * 0.95} ${c + r2 * 0.3} ${c + r3 * 0.7} ${c + r3 * 0.65} Q${c + r2 * 0.3} ${c + r1 * 0.95} ${c - r2 * 0.1} ${c + r3 * 0.85} Q${c - r1 * 0.65} ${c + r3 * 0.7} ${c - r1 * 0.9} ${c + r2 * 0.1} Q${c - r1} ${c - r2 * 0.35} ${c - r2 * 0.5} ${c - r3 * 0.55} Q${c - r2 * 0.1} ${c - r1} ${c} ${c - r2} Z`,
		`M${c} ${c - r1} Q${c + r3 * 0.5} ${c - r1 * 0.95} ${c + r1 * 0.9} ${c - r2 * 0.5} Q${c + r1} ${c + r2 * 0.1} ${c + r3 * 0.85} ${c + r3 * 0.65} Q${c + r2 * 0.4} ${c + r1 * 0.95} ${c - r2 * 0.05} ${c + r1} Q${c - r1 * 0.55} ${c + r3 * 0.85} ${c - r1 * 0.9} ${c + r2 * 0.35} Q${c - r1} ${c - r2 * 0.2} ${c - r3 * 0.6} ${c - r3 * 0.6} Q${c - r2 * 0.2} ${c - r1} ${c} ${c - r1} Z`,
		`M${c} ${c - r2} Q${c + r1 * 0.6} ${c - r2} ${c + r1 * 0.9} ${c - r2 * 0.3} Q${c + r1} ${c + r2 * 0.1} ${c + r3 * 0.85} ${c + r3 * 0.5} Q${c + r2 * 0.4} ${c + r1} ${c - r2 * 0.05} ${c + r1} Q${c - r1 * 0.55} ${c + r1} ${c - r1 * 0.9} ${c + r2 * 0.45} Q${c - r1} ${c - r2 * 0.1} ${c - r1 * 0.7} ${c - r2 * 0.55} Q${c - r2 * 0.35} ${c - r1} ${c} ${c - r2} Z`,
		`M${c} ${c - r1} Q${c + r1 * 0.6} ${c - r1} ${c + r1 * 0.9} ${c - r1 * 0.55} Q${c + r1} ${c - r1 * 0.1} ${c + r1 * 0.9} ${c + r2 * 0.4} Q${c + r1 * 0.6} ${c + r1} ${c} ${c + r1} Q${c - r1 * 0.55} ${c + r1} ${c - r1 * 0.9} ${c + r3 * 0.5} Q${c - r1} ${c} ${c - r1 * 0.7} ${c - r2 * 0.5} Q${c - r1 * 0.45} ${c - r1} ${c} ${c - r1} Z`,
	];

	return (
		<div
			className={`relative ${className}`}
			style={{ width: size, height: size }}
		>
			{/* SVG Definitions */}
			<svg className="absolute size-0" aria-hidden="true">
				<defs>
					<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="currentColor" stopOpacity="1" />
						<stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
					</linearGradient>
				</defs>
			</svg>

			{/* Morphing blob */}
			<svg
				className="absolute inset-0 size-full drop-shadow-md"
				viewBox={viewBox}
				aria-hidden
			>
				<title>Decorative background</title>
				<path fill={`url(#${gradientId})`}>
					<animate
						attributeName="d"
						dur={`${duration}s`}
						repeatCount="indefinite"
						calcMode="spline"
						keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
						values={paths.join(";")}
					/>
				</path>
			</svg>

			{/* Content */}
			{children && (
				<div className="absolute inset-0 flex items-center justify-center">
					{children}
				</div>
			)}
		</div>
	);
}
