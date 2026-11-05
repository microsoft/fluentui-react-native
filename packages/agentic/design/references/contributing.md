---
id: design.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/design
---

# Contributing to Design

## Source map

| Path                   | Owns                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/types/`           | Type-only contracts shared by the Flex and Fluent models, such as appearance                                |
| `src/theming/`         | Shared theme sources, providers, boundaries, appearance, runtime caches, and the `theming` facades          |
| `src/flex/`            | Flex token and theme state types, `FlexThemeReference`, `useThemeState`, layered shadows, and styles        |
| `src/flex/defaults/`   | The generated x3 cool and warm defaults and their parity tests; see `tokens.md`                             |
| `src/flex/adapters/`   | The engine-free Theme-to-Flex adapter and its Fluent-native fallbacks                                       |
| `src/flex/colors/`     | Authored color normalization, the resolved color envelope, token classification, and the interaction policy |
| `src/fluent/`          | Legacy Fluent theme types, `ThemeReference`, `useTheme`, platform utilities, and legacy styling             |
| `src/fluent/compat/`   | The Flex-to-legacy projection onto the Fluent themes; never reachable from the root                         |
| `src/themes/`          | Ready-made Fluent themes from the generated Fluent 2 tokens and Flex themes from the x3 defaults            |
| `src/tokens/`          | Generated global tokens and shared token attributes                                                         |
| `src/tokens/mappings/` | The canonical token map and its generated projections; see `tokens.md`                                      |
| `src/styling/`         | Shared state style factories and the `styling` facade; see `styling.md`                                     |
| `src/color-lib/`       | Raw, token-free color algorithms; see `color-lib.md`                                                        |
| `src/deprecated/`      | Fluent 2 token JSON loaders and pipeline mappers behind `./deprecated`; see `entry-points.md`               |
| `src/test/`            | Test-only fixtures, compatibility baselines, and color validation; see `testing.md`                         |
| `src/index.ts`         | The modern root entry point; see `entry-points.md` for every subpath                                        |

Shared modules may import types from either model. At runtime, only the `theming` facade, the `themes` entry, and the
legacy subpaths reach `src/fluent/`; the root and `styling` graphs may reach `src/flex/` but never `src/fluent/`.
Dependencies point one way: `src/flex/colors/` may import `src/color-lib/`, but `src/color-lib/` imports only its own
modules and shared types. Production code never imports `src/test/`, and only `src/deprecated/` imports the Fluent 2
token JSON packages. Source paths are private: consumers use the package subpaths in `entry-points.md`, never `src/` or
`lib/` paths.

The package's scripts directory holds `codegen.cts`, which runs before every build, the token-mapping check and upstream
drift tools, and the x3 defaults generator, all described in `tokens.md`. The Fluent token generator applies the
deprecated pipeline mappers from `src/deprecated/` at build time. Generated token, projection, and default files are
committed; change their inputs and regenerate rather than editing them.

## Invariants

- Keep the root import graph modern: it must not reach `useTheme` or anything under `src/fluent/`. It reaches
  `color-lib/interaction` (with its parsing and conversion dependencies) only through `src/flex/colors/`, never
  `color-lib/compositing`. The legacy `ThemeReference`, `useTheme`, and `ThemeProvider` graphs must not reach
  `src/flex/` or `src/color-lib/`, and the Theme-to-Flex adapter in `src/flex/adapters/` must not reach the interaction
  policy, the x3 defaults, or `src/color-lib/`. `src/test/compatibility/importBoundaries.test.ts` checks these graphs;
  run the bundle-size scenarios too when changing imports between these areas.
- Keep `src/themes/` a consumer of generated tokens. `src/themes/fluent/` may reach `ThemeReference`, the generated
  Fluent tokens, and the generated global tokens, but never `src/flex/`, `src/color-lib/`, `useTheme`,
  `src/fluent/compat/`, or `src/deprecated/`, and it authors no color value that the generated alias colors lack.
  `src/themes/flex/` exposes the fixed x3 default descriptions unchanged and an adaptive description that selects one
  by resolved color tone. Each fixed theme must not reach the other palette's generated module. These themes never reach
  `src/fluent/` or `color-lib/compositing`. The tests under `src/themes/`, the import-boundary test, and the `design-fluent-*` and
  `design-flex-*` bundle-size scenarios guard this.
- Never mutate author-owned theme inputs; caches are external and keyed by source, revision, and resolved appearance.
- Keep color resolution lazy: resolving tokens, reading rest, merging, and copying the color map must not run the
  interaction algorithm, and a derived state computes at most once per resolved color. `flex-colors.md` owns the color
  contract, and `src/flex/colors/interactionLaziness.test.tsx` guards it.
- Keep platform appearance listeners subscription-scoped; nothing subscribes at module import.
- Keep the experimental native appearance modules and platform theme packages out of this package's dependencies;
  platform theme packages inject their sources.
- Production code must not import the `testing` entry point (R-DESIGN-002).
- Keep the Fluent 2 token JSON behind `src/deprecated/`: only tests, other deprecated modules, build scripts, and the
  existing deprecated consumers may use it, and no other production entry point may reach it (R-DESIGN-003).

## Tests

Jest runs with the macOS platform preset declared in `package.json`. A test named `*.test.<platform>.ts` runs under
that platform, so add one when a platform implementation file changes.
Iterate with a focused selection, such as `yarn test themeRuntime` or `yarn test --findRelatedTests src/theming/appearance.ts`.
`src/test/compatibility/` holds the public-surface, legacy-runtime, and import-boundary baselines; update their
snapshots only for an intended compatibility change.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, `yarn test`, and `yarn check:mappings` in this package (R-VALID-001).
Run `yarn bundle-size` from the repository root when an import boundary changes. This is a published package; add a
changeset (R-REPO-003). Finish code or configuration changes with one `yarn clean-lage-cache` and then
`yarn lage buildci` (R-VALID-003, R-VALID-004).
