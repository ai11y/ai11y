# @ai11y/agent

## 0.1.0

### Minor Changes

- [`b025e08`](https://github.com/ai11y/ai11y/commit/b025e087460e3189de4b8fd5fe69defbc57bf831)
  Thanks [@maerzhase](https://github.com/maerzhase)! - Add opt-in JEV decision
  planning while keeping existing conversational APIs compatible.

### Patch Changes

- Updated dependencies
  [[`b025e08`](https://github.com/ai11y/ai11y/commit/b025e087460e3189de4b8fd5fe69defbc57bf831)]:
  - @ai11y/core@0.1.0

## 0.0.1

### Patch Changes

- [#10](https://github.com/maerzhase/ai11y/pull/10)
  [`a578f29`](https://github.com/maerzhase/ai11y/commit/a578f296c21cd19c935ff8003442677f7a1cb72d)
  Thanks [@maerzhase](https://github.com/maerzhase)! - Docs and demo
  improvements: naming (ai11y ≠ a11y), Describe/Plan/Act boundaries, UI context
  payload viewer, annotation guidance, Why not ARIA, Security & privacy,
  multi-step demo

- [#10](https://github.com/maerzhase/ai11y/pull/10)
  [`a578f29`](https://github.com/maerzhase/ai11y/commit/a578f296c21cd19c935ff8003442677f7a1cb72d)
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

- Updated dependencies
  [[`a578f29`](https://github.com/maerzhase/ai11y/commit/a578f296c21cd19c935ff8003442677f7a1cb72d),
  [`a578f29`](https://github.com/maerzhase/ai11y/commit/a578f296c21cd19c935ff8003442677f7a1cb72d)]:
  - @ai11y/core@0.0.1
