import { Field, Form, Input, Textarea } from "@ai11y/ui";
import { useState } from "react";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { SuggestionSection } from "@/components/Shared/SuggestionSection";

export function InputFillDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");
	const [category, setCategory] = useState("");

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				Give your agent the ability to read and fill forms:
			</div>
			<Form>
				<Marker
					id="fill_demo_email"
					label="Email Input"
					intent="Email address input field"
				>
					<Field label="Email Address" name="email">
						<Input
							type="email"
							id="fill_demo_email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full"
							data-1p-ignore="true"
							autoComplete="off"
						/>
					</Field>
				</Marker>

				<Marker
					id="fill_demo_name"
					label="Name Input"
					intent="Full name input field"
				>
					<Field label="Full Name" name="name">
						<Input
							type="text"
							id="fill_demo_name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="w-full"
							data-1p-ignore="true"
							autoComplete="off"
						/>
					</Field>
				</Marker>

				<Marker
					id="fill_demo_message"
					label="Message Textarea"
					intent="Message textarea field"
				>
					<Field label="Message" name="message">
						<Textarea
							id="fill_demo_message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Enter your message"
							rows={3}
							className="w-full"
							data-1p-ignore="true"
							autoComplete="off"
						/>
					</Field>
				</Marker>

				<Marker
					id="fill_demo_category"
					label="Category Select"
					intent="Category selection dropdown"
				>
					<Field label="Category" name="category">
						<select
							id="fill_demo_category"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className="w-full h-10 px-3 py-2 rounded-sm border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
							data-1p-ignore="true"
						>
							<option value="">Select a category</option>
							<option value="support">Support</option>
							<option value="feedback">Feedback</option>
							<option value="bug">Bug Report</option>
							<option value="feature">Feature Request</option>
							<option value="other">Other</option>
						</select>
					</Field>
				</Marker>
			</Form>
			<SuggestionSection
				suggestions={[
					"what is the current value of the email field?",
					"fill email with test@example.com",
					"set name to John Doe",
					"fill message with Hello, this is a test message!",
					"set category to feedback",
				]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
