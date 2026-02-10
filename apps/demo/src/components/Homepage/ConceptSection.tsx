import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { ThemedSyntaxHighlighter } from "@/components/Shared/ThemedSyntaxHighlighter";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { demoCodeExamples } from "./demoCodeExamples";

type Tab = "javascript" | "react";

const codeByTab: Record<Tab, { code: string; language: string }> = {
	javascript: {
		code: demoCodeExamples.describePlanAct,
		language: "ts",
	},
	react: {
		code: demoCodeExamples.describePlanActReact,
		language: "tsx",
	},
};

export function ConceptSection() {
	const [tab, setTab] = useState<Tab>("javascript");
	const { ref, isInView } = useInView<HTMLElement>({
		threshold: 0.15,
		triggerOnce: true,
	});
	const { code, language } = codeByTab[tab];

	return (
		<Marker
			id="slide_concept"
			label="Core Concept Section"
			intent="Navigate to the Describe, Plan, Act concept section"
		>
			<section
				id="feature-concept"
				ref={ref}
				className="min-h-screen flex items-center justify-center py-24 px-6 relative"
			>
				<div
					className={`relative w-full max-w-2xl mx-auto text-left transition-all duration-700 ease-out ${
						isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground tracking-tight">
						Describe → Plan → Act
					</h2>
					<p className="text-lg text-muted-foreground leading-relaxed mb-2">
						The world runs on user interfaces. Interfaces solve problems by
						making state, constraints, and actions explicit.
					</p>
					<p className="text-lg text-muted-foreground leading-relaxed mb-6">
						ai11y exposes this structure so agents can operate existing UIs.
					</p>
					<ul className="text-lg text-muted-foreground leading-relaxed mb-10 list-none space-y-2 pl-0">
						<li>
							<strong className="text-foreground">Describe</strong> — observe
							the current UI context.
						</li>
						<li>
							<strong className="text-foreground">Plan</strong> — get
							instructions from the agent.
						</li>
						<li>
							<strong className="text-foreground">Act</strong> — perform actions
							on the UI.
						</li>
					</ul>

					<div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
						<div className="flex border-b border-border/50 bg-muted/30">
							<button
								type="button"
								onClick={() => setTab("javascript")}
								className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
									tab === "javascript"
										? "bg-background text-foreground border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								JavaScript
							</button>
							<button
								type="button"
								onClick={() => setTab("react")}
								className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
									tab === "react"
										? "bg-background text-foreground border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								React
							</button>
						</div>
						<div className="p-6">
							<ThemedSyntaxHighlighter
								language={language}
								PreTag="div"
								codeTagProps={{ style: { background: "transparent" } }}
							>
								{code}
							</ThemedSyntaxHighlighter>
						</div>
					</div>
				</div>
			</section>
		</Marker>
	);
}
