import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { FlipCard } from "./FlipCard";
import { MarkerWithHighlight as Marker } from "./Shared/MarkerWithHighlight";

interface FeatureSlideProps {
	direction: "left" | "right";
	title: string;
	description: string;
	emoji: string;
	children: ReactNode;
	code?: string;
	codeLanguage?: string;
	reactCode?: string;
	reactCodeLanguage?: string;
	id?: string;
	markerId?: string;
	markerLabel?: string;
	markerIntent?: string;
}

export function FeatureSlide({
	direction,
	title,
	description,
	emoji,
	children,
	code,
	codeLanguage,
	reactCode,
	reactCodeLanguage,
	id,
	markerId,
	markerLabel,
	markerIntent,
}: FeatureSlideProps) {
	const { ref, isInView } = useInView<HTMLDivElement>({
		threshold: 0.2,
		triggerOnce: true,
	});

	const section = (
		<section
			id={id}
			ref={ref}
			className="min-h-screen flex items-center justify-center py-24 px-6 relative"
		>
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div
					className={`absolute top-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl ${
						direction === "left" ? "-left-48" : "-right-48"
					}`}
				/>
			</div>

			<div
				className={`relative max-w-4xl w-full transition-all duration-700 ease-out ${
					isInView
						? "opacity-100 translate-x-0"
						: direction === "left"
							? "opacity-0 -translate-x-24"
							: "opacity-0 translate-x-24"
				}`}
			>
				<div
					className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${
						direction === "right" ? "lg:flex-row-reverse" : ""
					}`}
				>
					<div
						className={`flex-1 text-center lg:text-left ${
							direction === "right" ? "lg:flex lg:flex-col" : ""
						}`}
					>
						<div
							className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-4xl mb-6 ${
								direction === "right" ? "lg:ml-auto" : ""
							}`}
						>
							{emoji}
						</div>
						<h2
							className={`text-3xl md:text-4xl font-bold mb-4 text-foreground tracking-tight ${
								direction === "right" ? "lg:text-right" : ""
							}`}
						>
							{title}
						</h2>
						<p
							className={`text-lg text-muted-foreground leading-relaxed max-w-md ${
								direction === "right" ? "lg:ml-auto lg:text-right" : ""
							}`}
						>
							{description}
						</p>
					</div>

					<div className="flex-1 w-full max-w-md">
						{code ? (
							<FlipCard
								code={code}
								{...(codeLanguage ? { language: codeLanguage } : {})}
								{...(reactCode
									? {
											reactCode,
											...(reactCodeLanguage
												? {
														reactLanguage: reactCodeLanguage,
													}
												: {}),
										}
									: {})}
							>
								<div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
									{children}
								</div>
							</FlipCard>
						) : (
							<div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
								{children}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);

	if (markerId) {
		return (
			<Marker
				id={markerId}
				label={markerLabel || title}
				intent={markerIntent || `Navigate to the ${title} section`}
			>
				{section}
			</Marker>
		);
	}

	return section;
}
