# @ai11y/react

Thin React wrapper for ai11y. Uses the same **describe → plan → act** flow: wrap
your app in `Ai11yProvider`, mark elements with `Marker`, and use
`useAi11yContext()` for `describe` and `act`; call `plan()` from `@ai11y/core`.

## Installation

```bash
pnpm add @ai11y/react @ai11y/core
```

## Usage

Wrap your app in `Ai11yProvider` and use `Marker` so elements are registered for
`describe()`. Get `describe` and `act` from `useAi11yContext()` and call
`plan()` from `@ai11y/core`:

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

For the plan step with an LLM, point the client at your server endpoint; see
[packages/agent/README.md](../agent/README.md).
