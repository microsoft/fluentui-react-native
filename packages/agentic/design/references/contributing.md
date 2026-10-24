---
id: design.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/design
---

# Contributing to Design

## Source map

| Path                   | Owns                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/types/`           | Type-only contracts shared by the Flex and Fluent models, such as appearance and theme state             |
| `src/theming/`         | Shared theme sources, providers, boundaries, appearance, runtime caches, and the `theming` facades       |
| `src/flex/`            | Flex token types, defaults, the Theme-to-Flex adapter, `FlexThemeReference`, `useThemeState`, and styles |
| `src/fluent/`          | Legacy Fluent theme types, `ThemeReference`, `useTheme`, platform utilities, and legacy styling          |
| `src/fluent/compat/`   | The Flex-to-legacy projection and complete legacy defaults; never reachable from the root                |
| `src/fluent/tokens/`   | Legacy alias, shadow, and global token data                                                              |
| `src/tokens/`          | Generated global tokens and shared token attributes                                                      |
| `src/tokens/mappings/` | The canonical token map and its generated projections; see `tokens.md`                                   |
| `src/styling/`         | Shared state style factories and the `styling` facade; see `styling.md`                                  |
| `src/color-lib/`       | The runtime color engine; see `color-lib.md`                                                             |
| `src/test/`            | Test-only fixtures, compatibility baselines, and color validation; see `testing.md`                      |
| `src/index.ts`         | The modern root entry point; see `entry-points.md` for every subpath                                     |

Shared modules may import types from either model. At runtime, only the `theming` facade and the legacy subpaths reach
`src/fluent/`; the root and `styling` graphs may reach `src/flex/` but never `src/fluent/`. Production code never imports
`src/test/`. Source paths are private: consumers use the package subpaths in `entry-points.md`, never `src/` or `lib/`
paths.

The package's scripts directory holds `codegen.cts`, which runs before every build, and the token-mapping check and
upstream drift tools described in `tokens.md`. Generated token and projection files are committed; change their inputs
and rebuild rather than editing them.

## Invariants

- Keep the root import graph modern: it must not reach `useTheme`, anything under `src/fluent/`, or
  `src/color-lib/`. `src/test/compatibility/importBoundaries.test.ts` checks the entry graphs; run the bundle-size
  scenarios too when changing imports between these areas.
- Never mutate author-owned theme inputs; caches are external and keyed by source, revision, and resolved appearance.
- Keep platform appearance listeners subscription-scoped; nothing subscribes at module import.
- Keep the experimental native appearance modules and platform theme packages out of this package's dependencies;
  platform theme packages inject their sources.
- Production code must not import the `testing` entry point (R-DESIGN-002).

## Tests

Jest runs with the macOS platform preset declared in `package.json`. A test named `*.test.<platform>.ts`, such as
`defaultLegacyTheme.test.ios.ts`, runs under that platform, so add one when a platform implementation file changes.
Iterate with a focused selection, such as `yarn test themeRuntime` or `yarn test --findRelatedTests src/theming/appearance.ts`.
`src/test/compatibility/` holds the public-surface, legacy-runtime, and import-boundary baselines; update their
snapshots only for an intended compatibility change.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, `yarn test`, and `yarn check:mappings` in this package (R-VALID-001).
Run `yarn bundle-size` from the repository root when an import boundary changes. This is a published package; add a
changeset (R-REPO-003). Finish code or configuration changes with one `yarn clean-lage-cache` and then
`yarn lage buildci` (R-VALID-003, R-VALID-004).
