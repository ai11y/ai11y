---
"@ai11y/core": patch
"@ai11y/agent": patch
"@ai11y/react": patch
---

Add custom state management and privacy protection features

- **Custom State API**: `setState()` now merges with existing state (like
  React's setState), allowing multiple components to independently manage state
  keys. Added `clearState()` helper for resetting state.
- **Privacy Protection**: Automatically redact sensitive input values
  (passwords, hidden fields, credit card fields) from UI context. Values are
  replaced with `[REDACTED]` to prevent exposure to AI agents.
- **Sensitive Marker Support**: Added `data-ai-sensitive` attribute and
  `sensitive` prop to Marker component for explicitly marking sensitive fields.
- **Agent Improvements**: Enhanced agent prompts with security rules to prevent
  filling password fields and improved pronoun resolution for better context
  tracking in conversations.
