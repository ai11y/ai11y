# ai11y

A structured UI context layer for AI agents. Makes existing user interfaces
understandable and actionable for AI agents.

The world runs on UIs and interfaces. That doesn't go away because we have
natural language. ai11y gives agents the context they need to operate those
interfaces.

The API is **describe → plan → act**: capture UI context, get instructions from
an agent, execute them on the page. The core is JavaScript; React is a thin
wrapper.

## Describe → Plan → Act

The world runs on user interfaces. Interfaces solve problems by making state,
constraints, and actions explicit.

ai11y exposes this structure so agents can operate existing UIs.

**Describe** — observe the current UI context.  
**Plan** — get instructions from the agent.  
**Act** — perform actions on the UI.

**Plain JavaScript:**

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

Optional helpers: `track(event, payload?)` and `reportError(error, meta?)` add
context for the agent. You can also call DOM helpers from `@ai11y/core` (e.g.
`clickMarker`, `highlightMarker`) directly if you prefer.

## Usage

### JavaScript (any framework or none)

Annotate elements with `data-ai-id`, `data-ai-label`, and optionally
`data-ai-intent`. Create a client and use describe → plan → act as above. The
core reads the DOM and executes instructions; no React required.

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

Mark elements so your agent can see them:

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

## Roadmap

- **Native ARIA support (optional)** — Use ARIA attributes where present to
  enrich UI context.
- **Linter rule** — Enforce or suggest `data-ai-*` / `Marker` usage in
  codebases.
- **Client-side LLM integration and examples** — Run the plan step in the
  browser with local or hosted models.
