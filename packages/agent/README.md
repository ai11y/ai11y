# @ai11y/agent

Runs the **plan** step for ai11y on the server (LLM + tools). Securely handles
LLM API calls and provides extensible tool support.

## Installation

```bash
pnpm add @ai11y/agent
```

## Quick Start

### Standalone

Use `runAgent` with a config and tool registry; wire it to your own HTTP (or
other) transport:

```ts
import type { AgentRequest } from "@ai11y/core";
import { runAgent, createDefaultToolRegistry } from "@ai11y/agent";
import type { ServerConfig } from "@ai11y/agent";

const config: ServerConfig = {
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
};

const toolRegistry = createDefaultToolRegistry();

async function handleRequest(request: AgentRequest) {
  const response = await runAgent(request, config, toolRegistry);
  return response;
}
```

### With Fastify

Register the plugin to expose the agent endpoint:

```ts
import Fastify from "fastify";
import { ai11yPlugin } from "@ai11y/agent/fastify";

const fastify = Fastify();

await fastify.register(ai11yPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
    baseURL: "https://api.openai.com/v1",
  },
});

await fastify.listen({ port: 3000 });
```

The plugin registers `POST /ai11y/agent` and `GET /ai11y/health`. See
`apps/server/` for a full example.

## Extending with Custom Tools

You can extend the agent with custom tools using the `ToolRegistry`:

```ts
import type { Ai11yContext, ToolDefinition, ToolExecutor } from "@ai11y/core";
import { ai11yPlugin, createToolRegistry } from "@ai11y/agent/fastify";

const registry = createToolRegistry();

registry.register(
  {
    name: "send_email",
    description: "Send an email notification",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body" },
      },
      required: ["to", "subject", "body"],
    },
  },
  async (args, context) => {
    console.log("Sending email:", args);
    return { success: true, messageId: "123" };
  },
);

await fastify.register(ai11yPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  toolRegistry: registry,
});
```

For API details and types, see the generated docs.
