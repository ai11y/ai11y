# Plan 001: Add an opt-in JEV decision mode without changing normal LLM planning

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the next
> step. If anything in the "STOP conditions" section occurs, stop and report; do
> not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 7443499..HEAD -- packages/core packages/agent packages/react apps/demo README.md pnpm-lock.yaml`
> If any in-scope file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding. A semantic mismatch
> is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L (multi-day)
- **Risk**: MED (new external decision provider plus an action loop)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `7443499`, 2026-09-19

## Why this matters

ai11y currently treats planning as a conversational LLM operation that returns
human-readable text plus zero or more UI instructions. JEV is intentionally a
different primitive: it evaluates bounded, typed choices and returns a selected
choice, probabilities, and confidence, without generating chat text. Forcing it
through the current chat contract would either fake replies or weaken the
existing API.

Add JEV as an opt-in, additive mode with dedicated package subpaths. One JEV
request decides exactly one next UI step from candidates produced by code. A
client-side loop then describes the UI again after each action and asks for the
next decision until JEV selects `completed`, asks for user clarification, hits a
confidence/repetition guard, or reaches a maximum step count. Existing LLM and
rule-based consumers must compile and behave exactly as before.

The demo should make this distinction obvious: a large centered `JEV MODE`
control enables a minimal instruction-only interface. JEV never appears to chat
back. The user sees concise operational feedback such as “Evaluating”, “Step 2:
clicking Connect Stripe”, “Done”, or “Needs clarification”.

## Product decisions already made

Treat these as requirements, not open design questions:

1. JEV is opt-in. Do not change the behavior or signature of the existing
   `plan(ui, input, config?, messages?)` export from `@ai11y/core`.
2. Publish the browser contract from `@ai11y/core/jev` and the server adapter
   from `@ai11y/agent/jev`. Both subpaths may export a function named `plan`
   because consumers import them from distinct modules.
3. The browser-facing JEV `plan` call returns a decision, not a chat reply. Its
   response has an outcome, confidence, and zero or more existing ai11y
   `Instruction` values.
4. One request chooses one next step. Multi-step work is achieved by repeatedly
   describe -> decide -> act -> describe, never by asking JEV to reason out an
   entire chain in one response.
5. Code generates the bounded choices. JEV must never invent marker IDs, action
   names, routes, or free-form input values.
6. The first release supports these candidate plans:
   - `click` for an in-view marker;
   - `scroll` for showing a marker;
   - `[scroll, click]` as one candidate plan when a clicked marker is offscreen;
   - `highlight` for a marker;
   - `fillInput` only when code can deterministically extract a value from the
     user instruction or enumerate a marked select's existing options;
   - terminal `completed` and `needs-input` choices.
7. Direct `navigate` candidates are out of scope for v1 because `Ai11yContext`
   does not expose a bounded route catalog. Navigation remains possible by
   clicking marked links. Do not add guessed routes.
8. Default safety guards: minimum confidence `0.60`, maximum 8 executed steps,
   reject an immediately repeated identical instruction batch, and stop after
   any thrown `act()` error. These defaults must be configurable by the React
   hook without changing the server protocol.
9. No silent fallback from JEV to an LLM or the rule-based planner. A missing
   API key, low-confidence choice, HTTP error, or invalid response is visible as
   a JEV error/needs-input state. The user explicitly chose JEV mode.
10. Never send conversation history to JEV. Send the current instruction,
    compact current UI context, and a bounded machine-generated action history.

## External API facts to preserve

Read these official sources before implementing because the provider may have
changed since this plan was written:

- TypeSafe JavaScript SDK: <https://docs.typesafe.ai/sdk/javascript>
- Choice primitive: <https://docs.typesafe.ai/primitives/choice>
- Confidence-gated routing:
  <https://docs.typesafe.ai/patterns/confidence-routing>
- JEV 1.13 limitations: <https://docs.typesafe.ai/model-jaggedness/jev-1.13>

At planning time, the SDK package is `@typesafe-ai/sdk`, requires Node 20+,
reads `TYPESAFE_API_KEY` by default, and supports:

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { instruction: "show me billing" },
  questions: {
    next_step: choice("What should the UI do next?", {
      candidate_0: "Scroll to the Billing marker",
      completed: "The instruction is already fully satisfied",
      needs_input: "No available action can safely satisfy the instruction",
    }),
  },
});
```

A Choice supports up to 255 options and returns `choice`, `probabilities`, and
`confidence`. JEV accepts textual JSON state but is not trained to generate
text. It loses accuracy when state contains irrelevant detail, so do not send
raw DOM, event logs, chat transcripts, or redundant prose. Marker labels and
intents are untrusted data; make the question and candidate criteria explicit
and never execute anything that was not generated locally as a candidate.

## Current state

Relevant files and contracts:

- `packages/core/src/agent/plan.ts:27-40` owns the stable public planning API:

  ```ts
  export async function plan(
    ui: Ai11yContext,
    input: string,
    config?: AgentAdapterConfig,
    messages?: ConversationMessage[],
  ): Promise<AgentResponse> {
    return runAgentAdapter(input, ui, config, messages);
  }
  ```

- `packages/core/src/agent/types.ts:4-7` requires conversational output:

  ```ts
  export interface AgentResponse {
    reply: string;
    instructions?: Instruction[];
  }
  ```

  Do not make `reply` optional and do not add JEV to this interface.

- `packages/core/src/instruction.ts:1-6` is the action boundary JEV must reuse:

  ```ts
  export type Instruction =
    | { action: "click"; id: string }
    | { action: "navigate"; route: string }
    | { action: "highlight"; id: string }
    | { action: "scroll"; id: string }
    | { action: "fillInput"; id: string; value: string };
  ```

- `packages/core/src/context.ts:22-28` exposes markers, visibility, route,
  state, and the last error. Use this existing shape; do not add JEV-only
  fields.
- `packages/core/src/marker.ts:13-24` exposes marker `id`, `label`, `intent`,
  `elementType`, optional current value, and select options. These are enough to
  construct bounded candidates.
- `packages/agent/src/tool-registry.ts:113-234` is the existing registry for LLM
  tool calls. Its action descriptions are useful wording references, but JEV
  candidate creation must be a separate pure module. Do not make JEV depend on
  LangChain or execute tools on the server.
- `packages/agent/src/types.ts:4-10` currently supports only OpenAI LLM config.
  Keep `ServerConfig` unchanged. Define a separate `JevServerConfig` in the JEV
  submodule.
- `packages/agent/package.json:8-15` already exports `.` and `./fastify`. Add a
  third `./jev` export; do not alter the first two.
- `apps/demo/src/app/api/ai11y/agent/route.ts` is the normal LLM endpoint and
  reads `OPENAI_API_KEY`. Leave it behaviorally unchanged. Add a sibling JEV
  endpoint.
- `apps/demo/src/components/ScrollyHero.tsx:60-143` duplicates the chat planning
  flow and `:280-440` renders chat messages plus input. JEV mode belongs in this
  prominent hero surface. Do not retrofit `useChat` to understand JEV.
- `packages/react/src/hooks/useChat.ts` owns conversational message state. Leave
  it unchanged and add a separate hook for the decision loop.
- No test files or root test script exist at commit `7443499`. Add narrowly
  scoped tests for candidate generation and loop guards; do not introduce a
  repo-wide test framework migration.

Repository conventions to match:

- TypeScript ESM; relative source imports include `.js` suffixes.
- Tabs and double quotes, enforced by Biome.
- Public symbols are re-exported through package entry files/subpath entry
  files.
- Dependencies are exact versions and workspace packages use `workspace:*`.
- Public package changes require a Changesets minor entry.
- Existing commits use concise conventional-style messages, e.g. `feat: ...`,
  `chore: ...`, `ci: ...`.

## Target public contracts

Implement these names and semantics. Exact property documentation can improve,
but do not rename the public fields without stopping for review.

In `@ai11y/core/jev`:

```ts
import type { Ai11yContext, Instruction } from "@ai11y/core";

export interface JevActionHistoryEntry {
  step: number;
  instructions: Instruction[];
}

export interface JevPlanRequest {
  input: string;
  context: Ai11yContext;
  history?: JevActionHistoryEntry[];
}

export type JevPlanOutcome = "action" | "completed" | "needs-input";

export interface JevPlanResponse {
  outcome: JevPlanOutcome;
  instructions?: Instruction[];
  confidence: number;
  decisionId: string;
  summary: string;
}

export interface JevPlanConfig {
  apiEndpoint: string;
  signal?: AbortSignal;
}

export async function plan(
  request: JevPlanRequest,
  config: JevPlanConfig,
): Promise<JevPlanResponse>;
```

`summary` is deterministic code-owned status text, never generated by JEV. It
must not echo raw user input or marker values. Examples:
`Clicking Connect Stripe`, `Instruction complete`,
`I need a more specific instruction`.

In `@ai11y/agent/jev`:

```ts
export interface JevServerConfig {
  apiKey: string;
  model?: string; // default "jev-latest"
  client?: Pick<TypeSafeClient, "systemOne">; // optional test injection
}

export async function plan(
  request: JevPlanRequest,
  config: JevServerConfig,
): Promise<JevPlanResponse>;
```

In `@ai11y/react`:

```ts
export type JevRunStatus =
  | { state: "idle" }
  | { state: "evaluating"; step: number }
  | { state: "acting"; step: number; summary: string }
  | { state: "completed"; steps: number; summary: string }
  | { state: "needs-input"; steps: number; summary: string }
  | { state: "error"; steps: number; message: string };

export interface UseJevOptions {
  apiEndpoint: string;
  maxSteps?: number; // default 8
  minConfidence?: number; // default 0.60
  settle?: () => Promise<void>; // default waits two animation frames
}

export function useJev(options: UseJevOptions): {
  status: JevRunStatus;
  isRunning: boolean;
  run: (input: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
};
```

`useJev` obtains `describe`, `act`, and `track` from `useAi11yContext`. It must
use an `AbortController`, prevent concurrent runs, and ignore stale completion
from an aborted/replaced run.

## Commands you will need

| Purpose             | Command                                                        | Expected on success                                                         |
| ------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Install exact SDK   | `pnpm add @typesafe-ai/sdk --filter @ai11y/agent --save-exact` | exit 0; exact version in `packages/agent/package.json` and lockfile updated |
| Agent focused tests | `pnpm --filter @ai11y/agent test`                              | exit 0; candidate and response tests pass                                   |
| Core build          | `pnpm --filter @ai11y/core build`                              | exit 0; root and `./jev` declarations/bundles emitted                       |
| Agent build         | `pnpm --filter @ai11y/agent build`                             | exit 0; root, `./fastify`, and `./jev` build                                |
| React build         | `pnpm --filter @ai11y/react build`                             | exit 0                                                                      |
| Demo build          | `pnpm --filter ai11y-demo build`                               | exit 0                                                                      |
| Full build          | `pnpm build`                                                   | exit 0                                                                      |
| Quality             | `pnpm quality`                                                 | exit 0, no lint/format/syncpack errors                                      |

If the current `@typesafe-ai/sdk` release is newer than the repository's pnpm
minimum-release-age policy allows, select the newest non-deprecated exact
release accepted by `pnpm`; record that choice in the changeset. Do not weaken
the workspace supply-chain policy.

## Scope

**In scope** (only these files/directories may be modified or created):

- `packages/core/package.json`
- `packages/core/src/jev/**`
- `packages/agent/package.json`
- `packages/agent/src/jev/**`
- `packages/react/package.json`
- `packages/react/src/hooks/useJev.ts`
- `packages/react/src/index.ts`
- `apps/demo/src/app/api/ai11y/jev/route.ts`
- `apps/demo/src/components/ScrollyHero.tsx`
- `apps/demo/src/components/JevMode.tsx`
- `README.md`
- `packages/core/README.md`
- `packages/agent/README.md`
- `.changeset/<generated-jev-name>.md`
- `pnpm-lock.yaml`
- `plans/README.md` (status only)

**Out of scope** (do not touch even if tempting):

- Existing `@ai11y/core` root `plan`, `AgentResponse`, `AgentMode`, adapter,
  LLM, or rule-based behavior.
- Existing `@ai11y/agent` `runAgent`, LangChain provider, tool registry, or
  Fastify endpoint.
- `packages/react/src/hooks/useChat.ts` and existing chat UI components.
- Adding JEV to the floating `AssistPanel`; the first demo is the centered hero.
- Direct navigation candidates, arbitrary text generation, voice input,
  persistent run history, analytics dashboards, or production authorization.
- Publishing, pushing, or opening a pull request.

## Git workflow

- Branch: `codex/jev-mode` if the operator asks for a branch; otherwise stay on
  the current branch.
- Commit logical units with concise messages such as
  `feat: add jev decision planner` and `feat: add jev demo mode`.
- Do not push or open a PR unless explicitly instructed.

## Steps

### Step 1: Add the typed browser transport at `@ai11y/core/jev`

1. Add a `./jev` export to `packages/core/package.json` pointing at generated
   `dist/jev/index.mjs` and `dist/jev/index.d.mts`. Confirm `tsdown` discovers
   the nested entry; if it does not, add the minimum package-local build config
   needed under `packages/core` and include that file in Scope before editing.
2. Create `packages/core/src/jev/types.ts` with the target request/response
   contracts above.
3. Create `packages/core/src/jev/plan.ts` that POSTs the request as JSON to
   `config.apiEndpoint`, forwards `config.signal`, and validates the response at
   runtime before returning it. Validation must reject:
   - non-object JSON;
   - an unknown outcome;
   - confidence outside `[0, 1]`;
   - `outcome: "action"` without a non-empty instruction array;
   - instructions with unknown actions or missing required string fields.
4. Serialize errors in `Ai11yContext` the same safe way as
   `packages/core/src/agent/llm-agent.ts:24-45`: send only the error message,
   metadata, and timestamp, never an `Error` object.
5. Create `packages/core/src/jev/index.ts` exporting `plan` and all public JEV
   types. Do not re-export these from the root `packages/core/src/index.ts`.

**Verify**: `pnpm --filter @ai11y/core build` -> exit 0 and both
`packages/core/dist/index.d.mts` and `packages/core/dist/jev/index.d.mts` exist.

### Step 2: Build pure bounded candidates on the server

Create `packages/agent/src/jev/candidates.ts`. Keep it pure and export internal
helpers needed by tests.

1. Define a private candidate shape containing a stable opaque key
   (`candidate_0`, `candidate_1`, ...), a precise human-readable criterion, a
   deterministic summary, and the exact `Instruction[]` it maps to. The opaque
   key, not a marker ID, is sent as the Choice option key.
2. Filter malformed markers and deduplicate by marker ID before candidate
   creation. Preserve DOM order for deterministic keys and tests.
3. For every usable marker create:
   - a `highlight` candidate;
   - a `scroll` candidate;
   - an interaction candidate. If its ID is in `inViewMarkerIds`, interaction is
     `[click]`; otherwise it is `[scroll, click]` in that order.
4. For inputs/textareas, create `fillInput` only when a deterministic parser
   finds an explicit value in the user's instruction. Support quoted values
   first (`"Ada Lovelace"` or `'Ada Lovelace'`), then a conservative terminal
   `with <value>` form. Do not infer or normalize values. Never produce a fill
   candidate when the marker's current value is `[REDACTED]`.
5. For select markers, create one `fillInput` candidate per existing option,
   using the option's exact `value` in the instruction and its label in the
   criterion. Skip empty or duplicate option values.
6. Append terminal candidates `completed` and `needs_input`. Their criteria must
   clearly separate “already satisfied” from “cannot safely choose an available
   action / instruction is ambiguous”.
7. Enforce the Choice limit before calling the SDK. Reserve two slots for the
   terminal choices and cap action candidates at 253. Prefer in-view
   interactions, then candidates whose label/intent has case-insensitive token
   overlap with the input, then original order. Do not ask JEV to rank more than
   255 options.
8. Exclude any exact instruction batch already present in history. This is a
   code-level loop prevention measure; do not rely on JEV understanding history.

Do not execute candidates here. The returned SDK choice is only an opaque key;
the server must look it up in the local candidate map.

**Verify**: Add table-driven tests covering in-view click, offscreen
scroll-then-click, highlight, quoted fill, conservative `with` fill, redacted
input exclusion, select option enumeration, duplicate markers/options, history
exclusion, deterministic ordering, and the 255-option cap. Run
`pnpm --filter @ai11y/agent test` -> all tests pass.

### Step 3: Add the TypeSafe/JEV server planner

1. Install `@typesafe-ai/sdk` as an exact runtime dependency of `@ai11y/agent`.
   Add a package-local `test` script using the existing `tsx` dev dependency and
   Node's test runner; do not add a monorepo-wide test stack.
2. Create `packages/agent/src/jev/plan.ts`, `types.ts`, and `index.ts`.
3. Validate `JevPlanRequest` at the server boundary without adding another
   schema library. Reject missing input/context, more than 8 history entries,
   malformed markers, and payloads whose serialized form exceeds a documented
   conservative size limit (use 256 KiB). Return/throw stable errors without
   including the full payload.
4. Construct a compact state object containing:
   - `user_instruction`;
   - current route if present;
   - marker facts needed to distinguish candidates: opaque ordinal, label,
     intent, element type, in-view boolean, and non-redacted current/select
     values;
   - prior executed instruction batches as action names plus opaque marker
     ordinals, not raw event/chat history.
5. Call `client.systemOne` once with model `config.model ?? "jev-latest"` and
   one Choice question named `next_step`. Its options must be the locally built
   candidate criteria plus the two terminal criteria.
6. Resolve the returned choice only through the local candidate map. An unknown
   choice is an error; never parse a choice key into an instruction.
7. Return the exact `JevPlanResponse` contract. Generate `decisionId` locally
   with `crypto.randomUUID()`. Generate `summary` from the selected local
   candidate. Never ask JEV for either string.
8. Export `plan`, types, and testable pure helpers from the `./jev` subpath
   only. Add the `./jev` package export without modifying root export behavior.
9. Tests must inject a fake `systemOne` client and cover action, completed,
   needs-input, unknown choice, malformed response, payload limit, and SDK error
   propagation. Assert that returned instructions are object-identical in value
   to a locally generated candidate, not provider-controlled data.

**Verify**:
`pnpm --filter @ai11y/agent test && pnpm --filter @ai11y/agent build` -> both
exit 0.

### Step 4: Add the reusable React decision loop

Create `packages/react/src/hooks/useJev.ts` and export it plus its public types
from `packages/react/src/index.ts`.

The hook must:

1. Read `describe`, `act`, and `track` from `useAi11yContext`.
2. On `run(input)`, reject blank input, abort any prior controller, clear prior
   status, and start at step 1 with empty history.
3. For each iteration: call `describe()` fresh; call `@ai11y/core/jev` `plan`;
   enforce `minConfidence` before acting; handle terminal outcomes; reject an
   identical repeat of the previous batch; call `act` for instructions in order;
   append history; emit a `jev_decision` tracking event containing only outcome,
   confidence, step, decision ID, and action names; then await `settle()` before
   the next describe.
4. The default settle function waits for two animation frames so React/router
   updates can become observable. It must be replaceable in tests.
5. Stop after `maxSteps` executed decisions with `needs-input` and a clear
   summary. Default is 8; constrain caller values to 1..20.
6. Never execute an action below `minConfidence`. Default is `0.60`; constrain
   caller values to 0..1.
7. `cancel()` aborts the fetch and returns to idle. Aborted/stale runs must not
   overwrite the current run's status.
8. Catch an `act` error and expose `error`; do not continue or silently invoke
   another planner.

Do not add messages, replies, or conversation history to this hook.

**Verify**: `pnpm --filter @ai11y/react build` -> exit 0. If extracting a pure
loop helper is necessary for reliable tests, keep it under
`packages/react/src/hooks/` and test at least completed, low confidence,
repeated batch, max steps, cancellation, and thrown action. Do not add a DOM
test framework solely for hook rendering.

### Step 5: Add a protected demo API route

Create `apps/demo/src/app/api/ai11y/jev/route.ts` modeled structurally on the
existing agent route, but import `plan` from `@ai11y/agent/jev`.

1. Read `TYPESAFE_API_KEY`; return 503 with a concise configuration message if
   absent.
2. Parse JSON and pass it to the server planner with
   `model: process.env.TYPESAFE_MODEL || "jev-latest"`.
3. Map bad requests to 400, provider/auth/rate-limit failures to an appropriate
   non-2xx status when the SDK exposes one, and unexpected failures to 500.
4. Log error class/message only. Do not log request bodies, marker values, API
   keys, or provider responses.
5. Keep `/api/ai11y/agent` unchanged so normal LLM mode remains usable with
   `OPENAI_API_KEY`.

**Verify**: With no TypeSafe key, POST a valid minimal request and confirm 503.
With a key supplied by the operator, make one manual request and confirm a typed
decision response. Do not fabricate a key or commit `.env` files.

### Step 6: Build the centered JEV Mode demo experience

Create `apps/demo/src/components/JevMode.tsx` and integrate it into the main
hero in `ScrollyHero.tsx`.

Required states and behavior:

1. Default/disabled state keeps the existing normal chat demo intact and adds a
   visually dominant, centered button labeled exactly `JEV MODE`. It needs
   accessible button semantics, a visible focus state, and supporting copy no
   longer than one sentence: JEV makes decisions; it does not chat.
2. Clicking the button enables JEV mode and replaces (does not layer over) the
   hero's message list/chat affordances with:
   - one instruction input;
   - one submit button;
   - a clear `Exit JEV Mode` control;
   - a compact status region with `aria-live="polite"`.
3. Do not render assistant bubbles or fake prose replies in JEV mode. Render
   state-derived feedback only:
   - idle: `Give JEV an instruction`;
   - evaluating: `Evaluating next step…` plus step number;
   - acting: the server's deterministic summary;
   - completed: `Done` plus executed step count;
   - needs-input: concise summary and keep the input editable;
   - error: concise retryable error without stack/provider payload.
4. While running, disable mode switching and submission, but expose a Cancel
   control wired to the hook. On completion, restore focus to the instruction
   input.
5. Use `/api/ai11y/jev` as the endpoint. Normal mode continues using the
   existing `agentConfig` and `useChat` flow.
6. JEV status must remain understandable in both the full hero and compact
   sticky state. Reuse `JevMode` rather than duplicating a second state machine.
7. Respect reduced motion. Do not make completion depend on animation.
8. Suggested demo instructions must match supported bounded actions, for example
   `highlight the title` and `show me navigation`. Do not advertise arbitrary
   content generation or unbounded navigation.

Keep visual styling consistent with the existing rounded hero input, design
tokens, and Tailwind utility conventions. This plan intentionally does not
specify pixel-perfect art direction; it does specify interaction and
accessibility behavior.

**Verify**: `pnpm --filter ai11y-demo build` -> exit 0. Then manually verify at
desktop and mobile widths:

- normal chat still submits and renders replies;
- JEV button enables the minimal interface;
- no assistant message appears in JEV mode;
- evaluating, acting, done, needs-input, error, and cancel are distinguishable;
- keyboard focus order is logical and the live region announces terminal state;
- exiting JEV mode restores the unchanged chat interface.

### Step 7: Document the additive API and release it as a minor feature

1. Add a root README section showing normal `plan()` first and JEV as an opt-in
   alternative. Explicitly say the API key belongs on the server.
2. Document `@ai11y/core/jev` in `packages/core/README.md` with a request
   example and decision response; do not imply it returns chat text.
3. Document `@ai11y/agent/jev` in `packages/agent/README.md`, including
   `TYPESAFE_API_KEY`, optional `TYPESAFE_MODEL`, candidate bounds, confidence,
   and the fact that actions execute in the browser.
4. Add a Changesets minor entry for `@ai11y/core`, `@ai11y/agent`, and
   `@ai11y/react`. Mention that all existing root APIs remain compatible.

**Verify**:
`pnpm exec prettier --check README.md packages/core/README.md packages/agent/README.md .changeset/*.md`
-> exit 0.

### Step 8: Run final compatibility and scope gates

Run in order:

```sh
pnpm --filter @ai11y/agent test
pnpm build
pnpm quality
git diff --check
git status --short
```

Expected: every command exits 0. `git status --short` lists only files under the
In scope section. Inspect the generated package artifacts or package export
resolution to confirm all of these imports typecheck:

```ts
import { plan as planNormally } from "@ai11y/core";
import { plan as planWithJev } from "@ai11y/core/jev";
import { runAgent } from "@ai11y/agent";
import { plan as planJevOnServer } from "@ai11y/agent/jev";
import { useChat, useJev } from "@ai11y/react";
```

Update Plan 001 in `plans/README.md` to `DONE` only after every gate passes.

## Test plan

Automated tests belong primarily beside the pure server planner because that is
where unsafe provider output becomes executable instructions.

- Candidate generation:
  - one in-view marker -> click candidate;
  - one offscreen marker -> ordered scroll/click candidate;
  - highlight/show wording remains distinct in criteria;
  - quoted and `with` fill extraction;
  - redacted values never become candidates or provider state;
  - select options map exact values;
  - duplicates are removed;
  - history removes executed batches;
  - > 253 action candidates are deterministically capped;
  - terminal choices always remain.
- Server mapping with injected fake client:
  - selected candidate maps to local instruction value;
  - completed and needs-input have no instructions;
  - confidence is forwarded;
  - unknown key and malformed answers fail closed;
  - oversized input fails before SDK invocation;
  - provider errors do not trigger an LLM fallback.
- Loop helper/hook behavior:
  - describes again after each action;
  - acts in instruction order;
  - low confidence executes nothing;
  - repeat/max-step/cancel/error guards stop the loop;
  - tracking contains metadata, not raw input/marker values.
- Manual demo regression:
  - existing LLM chat path;
  - JEV happy path and every terminal/error state;
  - desktop/mobile, keyboard, reduced-motion, and live-region behavior.

## Done criteria

All must hold:

- [ ] Existing imports from `@ai11y/core`, `@ai11y/agent`, and `@ai11y/react`
      remain source-compatible and retain their behavior.
- [ ] `@ai11y/core/jev` and `@ai11y/agent/jev` resolve with declarations.
- [ ] JEV chooses only locally generated bounded candidates; provider output can
      never directly supply an instruction, marker ID, route, or input value.
- [ ] Low confidence, repeated actions, maximum steps, cancellation, invalid
      responses, and thrown actions all stop without executing further work.
- [ ] The demo has a large centered `JEV MODE` entry control and a minimal
      instruction/status UI with no fake assistant messages.
- [ ] Normal chat remains available and unchanged when JEV mode is disabled.
- [ ] API keys are server-only and neither requests nor sensitive marker values
      are logged.
- [ ] Focused tests, full build, quality checks, and `git diff --check` pass.
- [ ] A minor changeset exists for the three public packages.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` is updated to DONE.

## STOP conditions

Stop and report; do not improvise if any occurs:

- Current TypeSafe docs/SDK no longer support typed Choice questions,
  probabilities/confidence, injected API keys, or a Node 22-compatible SDK.
- The SDK license or package provenance cannot be verified from the official
  documentation/package metadata.
- Supporting the `./jev` subpath requires changing existing root exports or
  output paths in a breaking way.
- The demo requires exposing `TYPESAFE_API_KEY` through `NEXT_PUBLIC_*` or any
  other client-side mechanism.
- Candidate generation exceeds 255 choices after reserving terminal options, or
  the provider's current documented limit is lower than assumed. Adjusting the
  deterministic cap is allowed; changing to free-form generation is not.
- A requested behavior requires JEV to generate arbitrary text, routes, marker
  IDs, or values. Report it as deferred/hybrid-LLM scope.
- Verification fails twice after a reasonable targeted correction.
- Implementation appears to require an out-of-scope file. Report the exact file
  and why before editing it.

## Maintenance notes

- Reviewers should scrutinize candidate construction and local choice lookup
  more closely than UI polish. That boundary prevents model/provider output from
  becoming arbitrary DOM actions.
- Confidence `0.60` is a safe demo starting point, not a universal production
  threshold. Calibrate it with recorded, redacted evaluation cases before
  deploying JEV mode for consequential actions.
- Marker text is untrusted state. TypeSafe currently documents susceptibility to
  adversarial content; precise criteria, narrow state, and local candidate
  mapping reduce but do not eliminate this risk.
- A later release can add action risk tiers, confirmation before destructive
  clicks, route catalogs, batch/multi-target actions, or an explicit hybrid JEV
  -> LLM route. Those require product/API decisions and are deliberately
  excluded here.
- If ai11y later adds a generic planner-provider interface, these subpaths can
  implement it. Do not introduce that abstraction until there is at least one
  additional structured planner with genuinely shared semantics.
