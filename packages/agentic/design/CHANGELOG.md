# @fluentui-react-native/design

## 0.3.2

### Patch Changes

- 51fab45: Updating path references to components and design packages

## 0.3.1

### Patch Changes

- cbd319c: Bump package to publish via ESRP (no changes)
- Updated dependencies [5bc9e81]
- Updated dependencies [5bc9e81]
- Updated dependencies [cbd319c]
  - @fluentui-react-native/framework-base@0.6.1

## 0.3.0

### Minor Changes

- 3abc13a: Group Flex tokens by category and remove category prefixes from individual token names
- 778d82b: Add shared component primitives, styling utilities, state hooks, accessibility diagnostics, and owned native-root prop types.
- 1157793: Export shared state-based styling utilities from the design package styling submodule

### Patch Changes

- 3abc13a: Updated packages with agent instructions and type fixes
- 778d82b: Consolidation of shared utilities, dependency profile updates, and more generated components
- ea738f0: Align agentic Button corner radii with desktop V1 values and add context-backed FURN Theme-to-Flex token conversion
- Updated dependencies [778d82b]
- Updated dependencies [3abc13a]
- Updated dependencies [778d82b]
  - @fluentui-react-native/framework-base@0.6.0

## 0.2.0

### Minor Changes

- d2690c9: Move theme type definitions into the `@fluentui-react-native/design` package under the new `@fluentui-react-native/design/theming` submodule export. The `@fluentui-react-native/theme-types` package is now a thin compatibility shim that re-exports from `@fluentui-react-native/design/theming`, and all in-repo consumers now reference the new submodule.

### Patch Changes

- e37b04b: Adding new core design package to consolidate design types, values, concepts, and utilities
- 01ed385: Switch packages that referenced globalTokens by object to use the new constant references instead
- 1eef74e: Add a default implementation of flex tokens
- 801d8b1: Switch to the released typescript 7
- 80bf14d: Move platform theming utilities into the design package, update usage in the repo to use the new source"
- c1de024: Add central font size/weight lookup by name to design package and consume in Text.tsx
- 03ba7ef: Add flex tokens draft shape
- Updated dependencies [1eef74e]
- Updated dependencies [801d8b1]
- Updated dependencies [e2a4065]
- Updated dependencies [b28f021]
- Updated dependencies [5b5afea]
- Updated dependencies [9d2bb3e]
  - @fluentui-react-native/framework-base@0.5.0
