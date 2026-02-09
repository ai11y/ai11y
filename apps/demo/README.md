# Demo - ai11y Demo App

This demo shows **describe → plan → act** in action. The core is JavaScript; the
UI uses the React wrapper (Provider + Marker).

## Quick Start

From the monorepo root:

```bash
pnpm install
pnpm dev
```

- Demo: http://localhost:5173
- Server: http://localhost:3000 (only if you set up LLM)

**Optional (LLM agent):** Create `apps/server/.env` with `OPENAI_API_KEY=...`
and `apps/demo/.env` with
`VITE_AI11Y_API_ENDPOINT=http://localhost:3000/ai11y/agent`. Without these, the
rule-based agent is used (no server needed).

To run separately: `pnpm --filter ai11y-server-app dev` then
`pnpm --filter ai11y-demo dev`.

## What You'll See

- **Describe → plan → act:** The hero uses the same core API: `describe()`,
  `plan(ui, input)`, and `act(instruction)`. React only provides context and
  markers.
- **Navigation:** Ask to go to billing or integrations.
- **Clicks and highlighting:** Buttons and sections are marked so your agent can
  click or highlight them.
- **Form awareness:** Give your agent the ability to read and fill inputs (see
  the form demo section).
- **LLM or rule-based:** With an API endpoint configured, the plan step uses an
  LLM; otherwise a local rule-based planner is used.

Try commands like: "Take me to billing", "Highlight the title", "Click enable
billing", "Go to integrations", "Connect stripe" (fails once, then retry).
