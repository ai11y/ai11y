import { Button, Tabs, TabsList, TabsPanel, TabsTrigger } from "@ai11y/ui";
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
								<Tabs defaultValue="javascript">
									<TabsList>
										<TabsTrigger value="javascript">JavaScript</TabsTrigger>
										<TabsTrigger value="react">React</TabsTrigger>
									</TabsList>
									<TabsPanel value="javascript" className="p-6">
										<ThemedSyntaxHighlighter
											language={language}
											PreTag="div"
											codeTagProps={{ style: { background: "transparent" } }}
										>
											{code}
										</ThemedSyntaxHighlighter>
									</TabsPanel>
									<TabsPanel value="react" className="p-6">
										<ThemedSyntaxHighlighter
											language={reactLanguage}
											PreTag="div"
											codeTagProps={{ style: { background: "transparent" } }}
										>
											{reactCode}
										</ThemedSyntaxHighlighter>
									</TabsPanel>
								</Tabs>
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
