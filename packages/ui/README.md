# @ai11y/ui

Primitive UI components built with Tailwind CSS and Base UI. Works with the
describe → plan → act flow (e.g. assist panels, triggers, message bubbles).

## Installation

```bash
pnpm add @ai11y/ui
```

## Usage

Import the CSS file in your application's entry point:

```tsx
import "@ai11y/ui/styles.css";
import { AssistPanel } from "@ai11y/ui";
```

## Components

### AssistPanel

A primitive chat panel component that accepts props for state and callbacks.

```tsx
import { AssistPanel } from "@ai11y/ui";

<AssistPanel
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  onSubmit={async (message) => {
    // Handle message submission
    return { reply: "Response", toolCalls: [] };
  }}
  onToolCall={(toolCall) => {
    // Handle tool calls
  }}
/>;
```

## Styling

This package uses Tailwind CSS. Make sure to import the CSS file:

```tsx
import "@ai11y/ui/styles.css";
```

The CSS is processed and minified during build, containing only the Tailwind
utilities used by the components.
