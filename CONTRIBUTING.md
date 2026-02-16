# Contributing to ai11y

Thank you for your interest in contributing to ai11y! This guide will help you
get started.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code. Please report unacceptable
behavior to <ai11y@m3000.io>.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9.0.0 (this project uses pnpm as the package manager)

### Repository Structure

This is a monorepo managed with Turborepo and pnpm workspaces:

```text
ai11y/
├── packages/
│   ├── core/          # Core ai11y functionality (describe, act)
│   ├── react/         # React bindings (Ai11yProvider, Marker, hooks)
│   ├── agent/         # Server-side agent implementation
│   └── ui/            # UI components
└── apps/
    ├── demo/          # Demo Frontend application
    └── server/        # Demo Backend application
```

### Initial Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/<your-username>/ai11y.git
   cd ai11y
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build all packages:

   ```bash
   pnpm build
   ```

4. Start development mode:

   ```bash
   pnpm dev
   ```

## Development Workflow

### Building

- Build all packages: `pnpm build`
- Build demo: `pnpm build:demo`
- Build server: `pnpm build:server`
- Build docs: `pnpm docs:build`

### Running in Development

- Development mode (all packages): `pnpm dev`
- Watch mode: `pnpm watch`

### Code Quality

Before submitting a PR, ensure your code passes all quality checks:

```bash
# Check formatting and linting (no changes)
pnpm quality

# Auto-fix formatting and linting issues
pnpm quality:fix
```

You can also run formatting and linting separately:

```bash
# Linting
pnpm lint           # Check for linting issues
pnpm lint:fix       # Auto-fix linting issues

# Formatting
pnpm format         # Check formatting
pnpm format:fix     # Auto-fix formatting
```

This project uses:

- **Biome** for JavaScript/TypeScript formatting and linting
- **Prettier** for Markdown formatting

### Testing

When adding new features or fixing bugs, please include tests where applicable.
Ensure all tests pass before submitting your PR.

## Making Changes

### Branching Strategy

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes following the code style and conventions.

3. Commit your changes with clear, descriptive commit messages.

### Commit Messages

Write clear and concise commit messages that explain what changed and why:

```text
Add support for nested markers in React

- Allow Marker components to be nested
- Update context tracking to handle hierarchy
- Add tests for nested marker scenarios
```

### Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for
version management and changelog generation.

When you make a change that affects the public API or functionality:

1. Create a changeset:

   ```bash
   pnpm changeset
   ```

2. Follow the prompts to:
   - Select which packages are affected
   - Choose the type of change (major, minor, patch)
   - Write a description of the change

3. Commit the generated changeset file with your PR

**Changeset Guidelines:**

- **Major**: Breaking changes to the public API
- **Minor**: New features that are backward compatible
- **Patch**: Bug fixes and internal improvements

Packages ignored from versioning (don't need changesets):

- `ai11y-demo`
- `ai11y-server-app`
- `@ai11y/ui`

## Pull Request Process

1. Ensure your code follows the project's code quality standards:

   ```bash
   pnpm quality
   ```

2. If applicable, create a changeset describing your changes.

3. Push your branch and open a Pull Request against `main`.

4. Fill out the PR template with:
   - Clear description of the changes
   - Motivation and context
   - Any breaking changes
   - Related issues

5. Request review from maintainers.

6. Address any feedback and update your PR as needed.

7. Once approved, a maintainer will merge your PR.

## Working with Packages

### Adding Dependencies

This project uses exact dependency versions (no `^` or `~` prefixes) to ensure
consistent builds across environments.

When adding dependencies, use the `--save-exact` flag:

```bash
# Add to workspace root
pnpm add -w --save-exact <package>

# Add to specific package
pnpm add --save-exact <package> --filter @ai11y/core
```

If you accidentally add a dependency without `--save-exact`, manually remove the
`^` or `~` prefix from the version in `package.json`.

### Keeping Dependencies in Sync

This project uses [syncpack](https://github.com/JamieMason/syncpack) to ensure
dependencies are consistent across all packages in the monorepo.

Before submitting a PR, check that dependencies are in sync:

```bash
# Check for dependency mismatches and formatting
pnpm syncpack

# Auto-fix mismatches and format package.json files
pnpm syncpack:fix

# Update dependencies to latest versions
pnpm syncpack:update
```

Syncpack ensures:

- Shared dependencies use the same version across all packages
- All versions use exact ranges (no `^` or `~` prefixes)
- Workspace packages use the `workspace:*` protocol
- All `package.json` files follow a consistent format (sorted fields,
  alphabetized scripts/dependencies)

### Package Development

When working on a specific package:

```bash
# Navigate to the package directory
cd packages/core

# Build the package
pnpm build

# Run in watch mode
pnpm watch
```

Changes to packages are automatically picked up by apps in development mode
thanks to Turborepo's dependency tracking.

## Documentation

### Code Documentation

- Add JSDoc comments to public APIs
- Update README files in relevant packages
- Include examples for new features

### TypeDoc

API documentation is generated using TypeDoc. When adding new public APIs,
ensure they are properly documented:

````typescript
/**
 * Describes the current UI context.
 *
 * @returns The structured UI context including route, markers, and state
 * @example
 * ```ts
 * const ui = client.describe();
 * console.log(ui.route, ui.markers);
 * ```
 */
export function describe(): UIContext {
  // ...
}
````

## Release Process

Releases are automated via GitHub Actions and managed by maintainers using
Changesets.

### How It Works

1. Contributors create changesets when making changes (see
   [Changesets](#changesets) section above)
2. When changesets are merged to `main`, the GitHub Actions workflow:
   - Creates or updates a "Version Packages" PR with all pending changes
   - The PR includes updated versions and CHANGELOG entries
3. When maintainers merge the "Version Packages" PR:
   - Packages are built and published to npm automatically
   - GitHub releases are created with release notes

### Manual Commands (Maintainers Only)

If needed, maintainers can run these commands locally:

- `pnpm changeset version` - Update versions based on changesets
- `pnpm release` - Build and publish packages
- `pnpm ci:publish` - CI-only publish command

The automated workflow is defined in `.github/workflows/release.yml`.

## Getting Help

- Check existing [issues](https://github.com/maerzhase/ai11y/issues)
- Open a new issue with the appropriate template
- Join discussions in the repository

## Project Vision

ai11y exposes structured UI context for AI agents, similar to how accessibility
APIs expose structure to assistive technologies. When contributing:

- **Maintain simplicity**: The API should remain simple (describe → plan → act)
- **Prioritize developer experience**: Make it easy to add ai11y to existing
  projects
- **Keep security in mind**: Ensure the system doesn't expose sensitive data by
  default
- **Think about extensibility**: Consider how your changes affect the ecosystem

## Recognition

Contributors will be recognized in:

- Release notes (via changesets)
- Specific acknowledgments for significant contributions

Thank you for contributing to ai11y!
