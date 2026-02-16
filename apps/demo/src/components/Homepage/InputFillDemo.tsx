import {
	Field,
	Form,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ai11y/ui";
import { useState } from "react";
import { MarkerWithHighlight as Marker } from "@/components/Shared/MarkerWithHighlight";
import { SuggestionSection } from "@/components/Shared/SuggestionSection";

export function InputFillDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
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
					id="fill_demo_password"
					label="Password Input"
					intent="Password input field (value is redacted for privacy)"
				>
					<Field label="Password" name="password">
						<Input
							type="password"
							id="fill_demo_password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							className="w-full"
							data-1p-ignore="true"
							autoComplete="new-password"
						/>
					</Field>
				</Marker>

				<Marker
					id="fill_demo_category"
					label="Category Select"
					intent="Category selection dropdown"
				>
					<Field label="Category" name="category">
						<Select
							modal={false}
							value={category}
							onValueChange={(value) => setCategory(value as string)}
							data-1p-ignore="true"
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Select a category</SelectItem>
								<SelectItem value="support">Support</SelectItem>
								<SelectItem value="feedback">Feedback</SelectItem>
								<SelectItem value="bug">Bug Report</SelectItem>
								<SelectItem value="feature">Feature Request</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</Field>
				</Marker>
			</Form>
			<div className="text-xs text-muted-foreground italic">
				Password values are automatically redacted for privacy
			</div>
			<SuggestionSection
				suggestions={[
					"fill email with test@example.com",
					"what is the password value?",
					"set category to feedback",
				]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
