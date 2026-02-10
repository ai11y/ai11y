import { Button } from "@ai11y/ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { ThemedSyntaxHighlighter } from "@/components/Shared/ThemedSyntaxHighlighter";

type Tab = "javascript" | "react";

interface FlipCardProps {
	children: ReactNode;
	code: string;
	language?: string;
	/** When provided, show JavaScript | React tabs on the code side. */
	reactCode?: string;
	reactLanguage?: string;
}

export function FlipCard({
	children,
	code,
	language = "tsx",
	reactCode,
	reactLanguage = "tsx",
}: FlipCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [codeTab, setCodeTab] = useState<Tab>("javascript");

	return (
		<div className="w-full">
			<div className="flex justify-center mb-4">
				<Button
					type="button"
					onClick={() => setIsFlipped(!isFlipped)}
					className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium"
				>
					<span>{isFlipped ? "👁️" : "💻"}</span>
					<span>{isFlipped ? "Show Demo" : "Show Code"}</span>
				</Button>
			</div>

			<div
				className="relative w-full"
				style={{
					perspective: "1000px",
				}}
			>
				<div
					className="relative w-full"
					style={{
						transformStyle: "preserve-3d",
						transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
						transition: "transform 0.7s ease-in-out",
					}}
				>
					<div
						className="w-full"
						style={{
							backfaceVisibility: "hidden",
							WebkitBackfaceVisibility: "hidden",
						}}
					>
						{children}
					</div>

					<div
						className="absolute inset-0 w-full"
						style={{
							backfaceVisibility: "hidden",
							WebkitBackfaceVisibility: "hidden",
							transform: "rotateY(180deg)",
						}}
					>
						<div className="flip-card-code rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
							{reactCode ? (
								<>
									<div className="flex border-b border-border/50 bg-muted/30">
										<button
											type="button"
											onClick={() => setCodeTab("javascript")}
											className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
												codeTab === "javascript"
													? "bg-background text-foreground border-b-2 border-primary"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											JavaScript
										</button>
										<button
											type="button"
											onClick={() => setCodeTab("react")}
											className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
												codeTab === "react"
													? "bg-background text-foreground border-b-2 border-primary"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											React
										</button>
									</div>
									<div className="p-6">
										<ThemedSyntaxHighlighter
											language={
												codeTab === "javascript" ? language : reactLanguage
											}
											PreTag="div"
											codeTagProps={{ style: { background: "transparent" } }}
										>
											{codeTab === "javascript" ? code : reactCode}
										</ThemedSyntaxHighlighter>
									</div>
								</>
							) : (
								<div className="p-6">
									<ThemedSyntaxHighlighter
										language={language}
										PreTag="div"
										codeTagProps={{ style: { background: "transparent" } }}
									>
										{code}
									</ThemedSyntaxHighlighter>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
