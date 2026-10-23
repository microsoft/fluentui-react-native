---
id: design.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/design
---

# Contributing to Design

## Source map

| Path                   | Owns                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `src/theming/`         | Theme sources, providers, boundaries, appearance, runtime caches, and legacy theme types  |
| `src/theming/compat/`  | The Flex-to-legacy projection and complete legacy defaults; never reachable from the root |
| `src/useThemeState.ts` | `useThemeState`, `useThemeAppearance`, and `themedStyleSheetFactory`                      |
| `src/tokens/`          | Flex token types and defaults, the Theme-to-Flex adapter, and generated global tokens     |
| `src/tokens/mappings/` | The canonical token map and its generated projections; see `tokens.md`                    |
| `src/tokens/legacy/`   | Legacy alias, shadow, and global token data                                               |
| `src/styling/`         | State and color style factories plus the legacy styling subpaths; see `styling.md`        |
| `src/color-lib/`       | The runtime color engine; see `color-lib.md`                                              |
| `src/testing/`         | Test-only fixtures and color validation; see `testing.md`                                 |
| `src/index.ts`         | The modern root entry point; see `entry-points.md` for every subpath                      |

The package's scripts directory holds `codegen.cts`, which runs before every build, and the token-mapping check and
upstream drift tools described in `tokens.md`. Generated token and projection files are committed; change their inputs
and rebuild rather than editing them.

## Invariants

- Keep the root import graph modern: it must not reach `useTheme`, `src/theming/compat/`, legacy token payloads, or
  `src/color-lib/`. Run the bundle-size scenarios when changing imports between these areas.
- Never mutate author-owned theme inputs; caches are external and keyed by source, revision, and resolved appearance.
- Keep platform appearance listeners subscription-scoped; nothing subscribes at module import.
- Keep the experimental native appearance modules and platform theme packages out of this package's dependencies;
  platform theme packages inject their sources.
- Production code must not import the `testing` entry point (R-DESIGN-002).

## Tests

Jest runs with the macOS platform preset declared in `package.json`. A test named `*.test.<platform>.ts`, such as
`defaultLegacyTheme.test.ios.ts`, runs under that platform, so add one when a platform implementation file changes.
Iterate with a focused selection, such as `yarn test themeRuntime` or `yarn test --findRelatedTests src/theming/appearance.ts`.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, `yarn test`, and `yarn check:mappings` in this package (R-VALID-001).
Run `yarn bundle-size` from the repository root when an import boundary changes. This is a published package; add a
changeset (R-REPO-003). Finish code or configuration changes with one `yarn clean-lage-cache` and then
`yarn lage buildci` (R-VALID-003, R-VALID-004).
