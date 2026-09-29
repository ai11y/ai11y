"use client";

import { useState } from "react";
import { FeatureSlide } from "@/components/FeatureSlide";
import { ClickDemoWithSuggestions } from "@/components/Homepage/ClickDemo";
import { ConceptSection } from "@/components/Homepage/ConceptSection";
import { demoCodeExamples } from "@/components/Homepage/demoCodeExamples";
import { HighlightDemoWithSuggestions } from "@/components/Homepage/HighlightDemo";
import { InputFillDemoWithSuggestions } from "@/components/Homepage/InputFillDemo";
import { MultiStepDemo } from "@/components/Homepage/MultiStepDemo";
import { NavigationDemo } from "@/components/Homepage/NavigationDemo";
import { PermissionsDemoWithSuggestions } from "@/components/Homepage/PermissionsDemo";
import { JevCopySwap } from "@/components/JevCopySwap";
import { ScrollyHero } from "@/components/ScrollyHero";
import { Footer } from "@/components/sections/Footer";
import {
	SuggestionInputProvider,
	useSuggestionInput,
} from "@/context/SuggestionInputContext";

function FeatureSlides() {
	const { setSuggestion } = useSuggestionInput();

	return (
		<div>
			<ConceptSection />

			<FeatureSlide
				id="feature-navigation"
				direction="left"
				emoji="🧭"
				title="Navigation"
				description={
					<>
						Give <JevCopySwap normal="your agent" jev="JEV" /> the ability to
						navigate between pages from natural language. It can use your
						app&apos;s routing structure to take users where they ask.
					</>
				}
				code={demoCodeExamples.navigationJavaScript}
				reactCode={demoCodeExamples.navigation}
				codeLanguage="html"
				reactCodeLanguage="tsx"
				markerId="slide_navigation"
				markerLabel="Navigation Section"
				markerIntent="Navigate to the Navigation feature section"
			>
				<NavigationDemo onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-highlight"
				direction="right"
				emoji="✨"
				title="Visual Highlighting"
				description="Draw attention to any element with customizable highlight animations. Perfect for tutorials, onboarding flows, and guided experiences."
				code={demoCodeExamples.highlightJavaScript}
				reactCode={demoCodeExamples.highlight}
				codeLanguage="html"
				reactCodeLanguage="tsx"
				markerId="slide_highlight"
				markerLabel="Visual Highlighting Section"
				markerIntent="Navigate to the Visual Highlighting feature section"
			>
				<HighlightDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-click"
				direction="left"
				emoji="👆"
				title="Interaction"
				description={
					<>
						Give <JevCopySwap normal="your agent" jev="JEV" /> the ability to
						interact with buttons, links, and other UI elements. Users describe
						their intent; <JevCopySwap normal="your agent" jev="JEV" /> chooses
						the right action.
					</>
				}
				code={demoCodeExamples.clickJavaScript}
				reactCode={demoCodeExamples.click}
				codeLanguage="html"
				reactCodeLanguage="tsx"
				markerId="slide_click"
				markerLabel="Interaction Section"
				markerIntent="Navigate to the Interaction feature section"
			>
				<ClickDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-fill-input"
				direction="right"
				emoji="⌨️"
				title="Form Awareness"
				description={
					<>
						Give <JevCopySwap normal="your agent" jev="JEV" /> the ability to
						read and fill form fields from natural language. It can read current
						values and fill inputs, textareas, and dropdowns.
					</>
				}
				code={demoCodeExamples.inputFillJavaScript}
				reactCode={demoCodeExamples.inputFill}
				codeLanguage="html"
				reactCodeLanguage="tsx"
				markerId="slide_fill_input"
				markerLabel="Form Awareness Section"
				markerIntent="Navigate to the Form Awareness feature section"
			>
				<InputFillDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-multistep"
				direction="left"
				emoji="🔗"
				title="Chained instructions"
				description={
					<>
						<JevCopySwap normal="Your agent" jev="JEV" /> can perform multi-step
						tasks inside one surface: fill, toggle, save. Instructions chain
						reliably across the same describe → plan → act loop.
					</>
				}
				markerId="slide_multistep"
				markerLabel="Multi-step Section"
				markerIntent="Navigate to the Multi-step demo section"
			>
				<MultiStepDemo />
			</FeatureSlide>

			<FeatureSlide
				id="feature-state"
				direction="right"
				emoji="🔐"
				title="Custom State"
				description={
					<>
						Give <JevCopySwap normal="your agent" jev="JEV" /> knowledge beyond
						the DOM. Expose permissions, user context, and app-specific data for
						safer decisions.
					</>
				}
				code={demoCodeExamples.permissionsJavaScript}
				reactCode={demoCodeExamples.permissions}
				codeLanguage="html"
				reactCodeLanguage="tsx"
				markerId="slide_state"
				markerLabel="Custom State Section"
				markerIntent="Navigate to the Custom State feature section"
			>
				<PermissionsDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>
		</div>
	);
}

export function HomePage() {
	const [suggestionHandler, setSuggestionHandler] = useState<
		((suggestion: string) => void) | null
	>(null);

	const handleSuggestionReady = (handler: (suggestion: string) => void) => {
		setSuggestionHandler(() => handler);
	};

	const currentHandler = suggestionHandler || (() => {});

	return (
		<SuggestionInputProvider value={{ setSuggestion: currentHandler }}>
			<div className="scrolly-container">
				<div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
				<div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/3 via-transparent to-primary/3" />

				<ScrollyHero onSuggestionReady={handleSuggestionReady} />

				<FeatureSlides />

				<Footer />
			</div>
		</SuggestionInputProvider>
	);
}
