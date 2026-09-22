# @fluentui-react-native/design

## 0.5.0

### Minor Changes

- 65245b4: Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.
  
  Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.
  
  Separate native keyboard press cleanup from activation pairing, preserving macOS keydown activation and clearing pressed feedback after interruption, blur, disable, or target replacement. Centralize endpoint-specific accessibility action contracts in Framework Base, and execute shared focus stories on macOS with narrowly scoped Windows-only pointer assertions.
  
  Carry owned modifier state on macOS native input events so rapid WebDriver chords such as Shift+Tab are delivered correctly.
  
  Clarify that FocusZone uses geometric directional navigation on macOS, while Windows and Win32 opt into geometry with use2DNavigation.
  
  Coalesce same-instance callback-ref handoffs without changing snapshots or mount generations, while rejecting detached-target activation immediately. Track repeated native key events separately from held physical keys so a single modifier release cannot leave later input modified.
- 65245b4: Add a View-compatible ThemedRoot with inherited theme and appearance options, default Flex tokens, and a stable scene context that tracks keyboard and pointer input without rerendering consumers.

### Patch Changes

- Updated dependencies [65245b4]
  - @fluentui-react-native/framework-base@0.8.0

## 0.4.1

### Patch Changes

- 0a6286c: Add submodule for color utilities for automatic hover and press coloring

## 0.4.0

### Minor Changes

- 4157768: Add appearance-aware Flex theme sources with stable token identity and lazy compatibility bridges for legacy themes.

### Patch Changes

- Updated dependencies [24be698]
  - @fluentui-react-native/framework-base@0.7.0

## 0.3.3

### Patch Changes

- 587845c: Enforce Flex mapping consistency and record reproducible x3 upstream drift.
- a0ef3f4: Add sideEffects: false to package manifests

## 0.3.2

### Patch Changes

- 51fab45: Updating path references to components and design packages
- cfef63e: update package references to use consolidated package directly
- 7372841: Share high-contrast alias token processing across Windows platforms from the design package and expose it through the theme-tokens compatibility shim.
- cfef63e: Consolidate theming utilities in the design package and move compatibility packages to the shim directory
- cfef63e: Consolidate legacy theming and styling implementations into design submodules, deprecate their former packages as compatibility shims, and group those shims under `packages/shim`.

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
