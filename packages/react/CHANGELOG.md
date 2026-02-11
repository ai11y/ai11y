# @ai11y/react

## 0.1.0

### Minor Changes

- [#7](https://github.com/maerzhase/ai11y/pull/7)
  [`bf03ab3`](https://github.com/maerzhase/ai11y/commit/bf03ab306ac852778700606a9d9dcfcb8ff7bbca)
  Thanks [@maerzhase](https://github.com/maerzhase)! - Docs and demo
  improvements: naming (ai11y ≠ a11y), Describe/Plan/Act boundaries, UI context
  payload viewer, annotation guidance, Why not ARIA, Security & privacy,
  multi-step demo

- [#7](https://github.com/maerzhase/ai11y/pull/7)
  [`415ab4e`](https://github.com/maerzhase/ai11y/commit/415ab4e1da55a1d02cff9d2bb85f3f9f93bf6d9f)
  Thanks [@maerzhase](https://github.com/maerzhase)! - Add custom state
  management and privacy protection features
  - **Custom State API**: `setState()` now merges with existing state (like
    React's setState), allowing multiple components to independently manage
    state keys. Added `clearState()` helper for resetting state.
  - **Privacy Protection**: Automatically redact sensitive input values
    (passwords, hidden fields, credit card fields) from UI context. Values are
    replaced with `[REDACTED]` to prevent exposure to AI agents.
  - **Sensitive Marker Support**: Added `data-ai-sensitive` attribute and
    `sensitive` prop to Marker component for explicitly marking sensitive
    fields.
  - **Agent Improvements**: Enhanced agent prompts with security rules to
    prevent filling password fields and improved pronoun resolution for better
    context tracking in conversations.

### Patch Changes

- [#7](https://github.com/maerzhase/ai11y/pull/7)
  [`415ab4e`](https://github.com/maerzhase/ai11y/commit/415ab4e1da55a1d02cff9d2bb85f3f9f93bf6d9f)
  Thanks [@maerzhase](https://github.com/maerzhase)! - Fix conversation history
  not being passed to agent due to async state update timing issue
- Updated dependencies
  [[`bf03ab3`](https://github.com/maerzhase/ai11y/commit/bf03ab306ac852778700606a9d9dcfcb8ff7bbca),
  [`415ab4e`](https://github.com/maerzhase/ai11y/commit/415ab4e1da55a1d02cff9d2bb85f3f9f93bf6d9f)]:
  - @ai11y/core@0.1.0
