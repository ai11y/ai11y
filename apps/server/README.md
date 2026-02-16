# ai11y Server App

Example server application using the `@ai11y/agent` package.

A structured UI context layer for AI agents. Makes existing user interfaces
understandable and actionable for AI agents.

## Setup

```bash
# Install dependencies (from monorepo root)
pnpm install
```

## Running

### Option 1: Using .env file (Recommended)

1. Create a `.env` file in this directory:

```bash
OPENAI_API_KEY=your-api-key-here
LLM_MODEL=gpt-5-nano
PORT=3000
```

2. Run the server:

```bash
pnpm dev
```

### Option 2: Using environment variables

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here

# Run in development mode
pnpm dev

# Or from monorepo root
pnpm --filter ai11y-server-app dev
```

The server will start on `http://localhost:3000` (or the port specified in
`PORT` env var) with the following endpoints:

- `POST /ai11y/agent` - Main agent endpoint
- `GET /ai11y/health` - Health check endpoint

**CORS:** The server has CORS enabled to allow requests from localhost origins
(for development). In production, you should configure specific allowed origins.

## Environment Variables

The server automatically loads environment variables from a `.env` file in this
directory.

### Required

- `OPENAI_API_KEY` (required) - Your OpenAI API key

### Optional

- `LLM_MODEL` (optional) - Model to use (defaults to `gpt-5-nano`)
- `LLM_TEMPERATURE` (optional) - Temperature for responses (defaults to `0.7`)
- `OPENAI_BASE_URL` (optional) - Custom base URL for OpenAI API
- `PORT` (optional) - Server port (defaults to `3000`)

### Example Configuration

```bash
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-5-nano
LLM_TEMPERATURE=0.7
PORT=3000
```
