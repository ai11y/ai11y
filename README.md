# ai11y

> a11y exposes meaning to assistive tech. ai11y exposes meaning to agents. Just
> like accessibility APIs expose structure, roles, and actions to assistive
> technologies, ai11y exposes structure, state, and actions to AI agents. Same
> idea. New consumer.

ai11y is a structured UI context layer that makes existing user interfaces
understandable and actionable for AI agents. It ships MCP-compatible tool
definitions and registers them via
[WebMCP](https://github.com/webmachinelearning/webmcp) so any browser-based AI
assistant can discover and operate your UI.

## How it works

```text
  Your UI                 ai11y                     AI Agent
 ┌────────┐     ┌──────────────────────┐     ┌────────────────┐
 │ Markers│────>│  describe()          │────>│ Browser LLM    │
 │ State  │     │  ai11yTools (MCP)    │     │ or             │
 │ Route  │<────│  act(instruction)    │<────│ Server LLM     │
 └────────┘     │  WebMCP registration │     └────────────────┘
                └──────────────────────┘
```

The core loop is **describe -> plan -> act**:

- **Describe** -- observe the current UI context (markers, route, state,
  errors). _Runtime: local -- DOM -> structured context._

- **Plan** -- get instructions from the agent. _Runtime: model/server --
  context + intent -> instructions._

- **Act** -- perform actions on the UI (click, scroll, fill, navigate,
  highlight). _Runtime: local -- instructions -> DOM actions._

## Usage

### Plain JS

Annotate elements with `data-ai-id`, `data-ai-label`, and optionally
`data-ai-intent`. Start by marking only the top-level interactive elements (e.g.
main actions, nav); ai11y still works and you can add more markers over time.
Create a client and use describe -> plan -> act:

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

### React

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

Use the `Marker` component to annotate your elements:

```tsx
<Marker id="save_btn" label="Save" intent="Save the document">
  <button onClick={onSave}>Save</button>
</Marker>
```

## WebMCP Support

ai11y ships MCP-compatible tool definitions (`ai11yTools`) and registers them
with [WebMCP](https://github.com/webmachinelearning/webmcp)
(`navigator.modelContext`) so browser-based AI assistants can discover and call
them without any server round-trip.

WebMCP is a proposed browser API currently in development. Until browsers
support it natively, you'll need to load the
[@mcp-b/global](https://www.npmjs.com/package/@mcp-b/global) polyfill.

### Tools

| Tool              | Description                                    |
| ----------------- | ---------------------------------------------- |
| `ai11y_describe`  | Get current UI context (markers, route, state) |
| `ai11y_click`     | Click an interactive element by marker ID      |
| `ai11y_fillInput` | Fill a form field by marker ID                 |
| `ai11y_navigate`  | Navigate to a route                            |
| `ai11y_scroll`    | Scroll an element into view                    |
| `ai11y_highlight` | Temporarily highlight an element               |
| `ai11y_setState`  | Update shared application state                |
| `ai11y_getState`  | Retrieve shared application state              |

All tool definitions follow the MCP `InputSchema` spec and are exported as
`ai11yTools` from `@ai11y/core`. The same definitions are used for both WebMCP
registration (client-side) and server-side agent prompt generation -- single
source of truth.

### Using the WebMCP Extension

Install the
[MCP-B Chrome Extension](https://chromewebstore.google.com/detail/mcp-b/daohopfhkdelnpemnhlekblhnikhdhfa)
to discover and call your website's MCP tools.

Once installed:

1. Visit your ai11y-enabled website.
2. Open the extension popup (click the icon in the toolbar).
3. Use the chat to query AI (e.g., "Click the save button") or the inspector to
   list/call tools manually.

### Enabling WebMCP in Plain JS

```ts
import "@mcp-b/global/iife";
import { initWebMCP } from "@ai11y/core";

initWebMCP();
```

### Enabling WebMCP in React

Pass `webmcp` to the provider to register tools with `navigator.modelContext`:

```tsx
import "@mcp-b/global/iife";
import { Ai11yProvider } from "@ai11y/react";

function App() {
  return (
    <Ai11yProvider webmcp onNavigate={(route) => navigate(route)}>
      <YourApp />
    </Ai11yProvider>
  );
}
```

## Server Agent

For natural-language planning, run the plan step on your server with
`@ai11y/agent`. See [packages/agent/README.md](packages/agent/README.md).

The client sends `describe()` output and user input; the server returns
`{ reply, instructions }`. Without a configured endpoint, the client falls back
to a built-in rule-based planner.

The server agent uses the same `ai11yTools` definitions from `@ai11y/core` to
generate tool bindings for the LLM.

## Packages

| Package                          | Description                       |
| -------------------------------- | --------------------------------- |
| [`@ai11y/core`](packages/core)   | Types, tools, DOM context, WebMCP |
| [`@ai11y/react`](packages/react) | Provider, Marker, hooks, useChat  |
| [`@ai11y/agent`](packages/agent) | Server-side LLM agent (LangChain) |
| [`@ai11y/ui`](packages/ui)       | Shared UI components              |

## Security & privacy

**What gets sent:** The plan step receives the output of `describe()`: route,
markers (id, label, intent, value, options as applicable), optional state. No
automatic PII; whatever you put in markers or state is what goes to the planner.

**Sensitive data:** Do not put secrets in marker labels or state. Redact or omit
form values (or other sensitive fields) before calling `plan()`, or sanitize in
your serialization layer.

**Recommendation:** Run the plan step on the server (`@ai11y/agent`) so the LLM
and context stay server-side; the client only sends what you choose.

## FAQ

### Why not just ARIA / the accessibility tree?

ai11y is a UI-to-agent context bridge (structured, actionable instructions), not
an accessibility checker. ARIA describes semantics for assistive tech; we will
use ARIA where present to enrich context (see Roadmap).

## Roadmap

- **Native ARIA support (optional)** -- Use ARIA attributes where present to
  enrich UI context.
- **Linter rule** -- Enforce or suggest `data-ai-*` / `Marker` usage in
  codebases.
- **AI-assisted error handling and recovery** -- Detect failures, suggest fixes,
  and automatically retry or roll back actions when possible.
- **Client-side LLM integration and examples** -- Run the plan step in the
  browser with local or hosted models.
