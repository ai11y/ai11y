# ai11y

**ai11y ≠ a11y**

Accessibility makes interfaces usable for humans. ai11y makes interfaces usable
for AI.

a11y exposes meaning to assistive tech. ai11y exposes meaning to agents.

A structured UI context layer for AI agents. Makes existing user interfaces
understandable and actionable for AI agents. The API is **describe → plan →
act**: capture UI context, get instructions from an agent, execute them on the
page. The core is JavaScript; React is a thin wrapper.

## Name

Just like accessibility APIs expose structure, roles, and actions to assistive
technologies, ai11y exposes structure, state, and actions to AI agents. Same
idea. New consumer.

## Describe → Plan → Act

The world runs on user interfaces. Interfaces solve problems by making state,
constraints, and actions explicit.

ai11y exposes this structure so agents can operate existing UIs.

- **Describe** — observe the current UI context.  
  _Runtime: local — DOM → structured context._

- **Plan** — get instructions from the agent.  
  _Runtime: model/server — context + intent → instructions._

- **Act** — perform actions on the UI.  
  _Runtime: local — instructions → DOM actions._

The demo’s **View Context** panel can show the exact JSON payload sent to the
planner.

```ts
import { createClient, plan } from "@ai11y/core";

const client = createClient({
  onNavigate: (route) => window.history.pushState({}, "", route),
});

const ui = client.describe();
const { reply, instructions } = await plan(ui, "click the save button");
for (const instruction of instructions ?? []) {
  client.act(instruction);
}
```

When `act()` cannot run (e.g. element not found), errors are reported via the
client’s error reporting and can be inspected in the demo’s context panel or
your own UI.

## Usage

### JavaScript (any framework or none)

Annotate elements with `data-ai-id`, `data-ai-label`, and optionally
`data-ai-intent`. Start by marking only the top-level interactive elements (e.g.
main actions, nav); ai11y still works and you can add more markers over time.
Create a client and use describe → plan → act as above. The core reads the DOM
and executes instructions; no React required.

### With React

Wrap your app in `Ai11yProvider` and use the `Marker` component so elements are
registered for `describe()`. Get `describe` and `act` from `useAi11yContext()`
and call `plan()` from `@ai11y/core`:

```tsx
import { Ai11yProvider, Marker, useAi11yContext } from "@ai11y/react";
import { plan } from "@ai11y/core";

function App() {
  return (
    <Ai11yProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
    </Ai11yProvider>
  );
}

function Chat() {
  const { describe, act } = useAi11yContext();
  const handleSubmit = async (input: string) => {
    const ui = describe();
    const { reply, instructions } = await plan(ui, input);
    for (const instruction of instructions ?? []) act(instruction);
    return reply;
  };
  // ... render input and messages
}
```

Use marker component to annotate your components:

```tsx
<Marker id="save_btn" label="Save" intent="Save the document">
  <button onClick={onSave}>Save</button>
</Marker>
```

### LLM agent (server)

For natural-language planning, run the plan step on your server with
`@ai11y/agent`. See [packages/agent/README.md](packages/agent/README.md). The
client sends `describe()` output and user input; the server returns
`{ reply, instructions }`. Without a configured endpoint, the client falls back
to a built-in rule-based planner.

## Security & privacy

**What gets sent:** The plan step receives the output of `describe()`: route,
markers (id, label, intent, value, options as applicable), optional state. No
automatic PII; whatever you put in markers or state is what goes to the planner.

**Sensitive data:** Do not put secrets in marker labels or state. Redact or omit
form values (or other sensitive fields) before calling `plan()`, or sanitize in
your serialization layer.

**Recommendation:** Run the plan step on the server (`@ai11y/agent`) so the LLM
and context stay server-side; the client only sends what you choose.

## Why not just ARIA / the accessibility tree?

ai11y is a UI-to-agent context bridge (structured, actionable instructions), not
an accessibility checker. ARIA describes semantics for assistive tech; we will
use ARIA where present to enrich context (see Roadmap).

## Roadmap

- **Native ARIA support (optional)** — Use ARIA attributes where present to
  enrich UI context.
- **Linter rule** — Enforce or suggest `data-ai-*` / `Marker` usage in
  codebases.
- **AI-assisted error handling and recovery** — Detect failures, suggest fixes,
  and automatically retry or roll back actions when possible.
- **Client-side LLM integration and examples** — Run the plan step in the
  browser with local or hosted models.
