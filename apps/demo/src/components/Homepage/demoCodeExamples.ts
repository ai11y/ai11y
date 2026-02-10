export const demoCodeExamples = {
	describePlanAct: `import { createClient, plan } from "@ai11y/core";

const client = createClient({
  onNavigate: (route) => window.history.pushState({}, "", route),
});

const ui = client.describe();
const { reply, instructions } = await plan(ui, "click the save button");
for (const instruction of instructions ?? []) {
  client.act(instruction);
}`,

	describePlanActReact: `import { useAi11yContext } from "@ai11y/react";
import { plan } from "@ai11y/core";

function Chat() {
  const { describe, act } = useAi11yContext();

  const handleSubmit = async (input: string) => {
    const ui = describe();
    const { reply, instructions } = await plan(ui, input);
    for (const instruction of instructions ?? []) {
      act(instruction);
    }
    return reply;
  };

  return (/* ... input and messages ... */);
}`,

	navigationJavaScript: `<a
  href="/billing"
  data-ai-id="nav_route_billing"
  data-ai-label="Billing Route"
  data-ai-intent="Navigate to Billing page"
>
  Billing
</a>`,

	navigation: `import { Marker } from "@ai11y/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function NavigationDemo() {
  const router = useRouter();

  return (
    <Marker
      id="nav_route_billing"
      label="Billing Route"
      intent="Navigate to Billing page"
    >
      <Link href="/billing" onClick={(e) => {
        e.preventDefault();
        router.push("/billing");
      }}>
        Billing
      </Link>
    </Marker>
  );
}`,

	highlightJavaScript: `<div
  data-ai-id="highlight_demo_badge"
  data-ai-label="Feature Badge"
  data-ai-intent="A badge to highlight"
  class="badge"
>
  ✨ Feature
</div>`,

	highlight: `import { Marker } from "@ai11y/react";

function HighlightDemo() {
  return (
    <Marker
      id="highlight_demo_badge"
      label="Feature Badge"
      intent="A badge to highlight"
    >
      <div className="badge">
        ✨ Feature
      </div>
    </Marker>
  );
}`,

	clickJavaScript: `<button
  data-ai-id="click_demo_increment"
  data-ai-label="Increment Button"
  data-ai-intent="Increases the counter by 1"
  onclick="/* your handler */"
>
  +
</button>`,

	click: `import { Marker } from "@ai11y/react";
import { useState } from "react";

function ClickDemo() {
  const [count, setCount] = useState(0);

  return (
    <Marker
      id="click_demo_increment"
      label="Increment Button"
      intent="Increases the counter by 1"
    >
      <button onClick={() => setCount(c => c + 1)}>
        +
      </button>
    </Marker>
  );
}`,

	inputFillJavaScript: `<input
  type="email"
  data-ai-id="fill_demo_email"
  data-ai-label="Email Input"
  data-ai-intent="Email address input field"
  placeholder="Enter your email"
/>`,

	inputFill: `import { Marker } from "@ai11y/react";
import { useState } from "react";

function InputFillDemo() {
  const [email, setEmail] = useState("");

  return (
    <Marker
      id="fill_demo_email"
      label="Email Input"
      intent="Email address input field"
    >
      <input
        type="email"
        id="fill_demo_email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
    </Marker>
  );
}`,
};
