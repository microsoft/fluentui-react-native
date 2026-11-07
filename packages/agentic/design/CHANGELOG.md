# @fluentui-react-native/design

## 0.6.0

### Minor Changes

- 06b458f: Breaking: move every module that loads the Fluent 2 token JSON into a new `@fluentui-react-native/design/deprecated`
  entry point, reserved for tests and the existing platform themes. It exports `getAliasTokens`, `getShadowTokens`,
  `globalTokens`, `hcAliasTokens`, `mapPipelineToTheme`, `mapFontPipelineToTheme`, and `mapPipelineToShadow`. The
  `theming` entry point no longer exports the pipeline mappers, and the `tokens/legacy` and `theming/compat/defaults`
  entry points and `getDefaultLegacyTheme` are removed; use the Fluent themes from `@fluentui-react-native/design/themes`
  for complete default themes. `themeFromFlexTokens` now fills the values Flex cannot represent from the generated Fluent
  theme for the appearance instead of the removed legacy defaults, so the `theming` entry point no longer bundles the
  token JSON.
- 06b458f: Add `flexTheme` and `flexWarmTheme` to the `@fluentui-react-native/design/themes` entry point. Each is a new
  `FlexThemeDescription`, which pairs a complete Flex token description with an optional `ColorTone`, holding the cool or
  warm x3 defaults. `FlexThemeReference` now accepts a `FlexThemeDescription` as its `base`: the description replaces the
  package defaults, and its tone becomes the reference's default `appearance.colorTone` unless the `appearance` option or
  a provider request sets one. The `ThemeState` types now live with the Flex model; their exports are unchanged.
- 06b458f: Add the `@fluentui-react-native/design/themes` entry point with `fluentLightTheme`, `fluentDarkTheme`, `fluentHcTheme`,
  and `fluentTheme`. The themes are built from the generated Fluent 2 alias colors, shadows, font aliases, and global
  tokens rather than hand-authored values, and each legacy palette color points at the alias color that plays its role.
  `fluentTheme` is a `ThemeReference` that follows the system appearance, including high contrast, and the `appearance`
  prop of `ThemeProvider` or `ThemedRoot` overrides it. `fluentHcTheme` always resolves the high-contrast theme for the
  color scheme. Elevated appearances resolve by color scheme for now.
- 06b458f: Rework Flex tokens around the current x3 defaults. Legacy `ThemeReference` themes, `ThemeProvider`, `useTheme`, and
  Flex tokens projected from legacy themes keep their values.
  
  Breaking changes for Flex consumers and theme authors:
  
  - Every Flex semantic color is a resolved `InteractiveColor` with `rest`, `hover`, and `pressed`. Read
    `tokens.color.x.rest` instead of `tokens.color.x`, and `.hover` or `.pressed` instead of the removed `color.hover`
    and `color.pressed` maps. Omitted interactive states derive lazily from rest with no configuration.
  - Author a color as a value, a `[light, dark]` tuple, or `flexColor` options with explicit states and a `standard`,
    `inverted`, or `fixed` interaction type. Each color override replaces the previous color atomically. Recipes receive
    the authored description; `selectColorEntry` reads an entry for an appearance.
  - Appearances accept an optional `colorTone` (`cool` or `warm`) that selects the default tokens and interaction
    algorithm.
  - The default tokens follow x3-design/fluent-design@206e890b for both tones, including an achromatic brand,
    translucent neutral backgrounds, and larger corner radii. Tests should read defaults from `defaultFlexTokens` in the
    `testing` entry point.
  - Shadows are arrays of `{ x, y, blur, color }` layers and may vary by color scheme; author a former `{ ambient, key }`
    shadow as `[ambient, key]`, and use `selectShadowEntry` to read an authored entry. Motion tokens and
    `spacing.componentBase800` are new.
  - The `color-lib` interaction functions no longer take a token; their `variant` option is replaced by `colorTone`,
    `direction`, and `compositing`. `isInverseInteractionToken` moves from `color-lib` to the package root, alongside the
    new `INTERACTIVE_COLOR_TOKENS` and `isInteractiveColorToken`.
  
  Root `useThemeState` consumers now bundle the interaction algorithm and generated defaults, about 23 KB raw and 8 KB
  gzip in the measured scenarios. Package sources move under `src/flex`, `src/fluent`, `src/types`, and `src/test`; export
  keys and conditions are unchanged.

### Patch Changes

- 06b458f: Generate complete Fluent color, shadow, font, and appearance token sets for Win32, Windows, macOS, iOS, and Android.
  Every platform provides light, dark, light elevated, dark elevated, high-contrast light, and high-contrast dark sets.
  Elevated sets fall back to their color scheme, high-contrast light falls back to high-contrast dark, and platforms
  without high-contrast data use light and dark. Windows high contrast uses the Win32 high-contrast set with Windows
  system color brushes. Preserve native values and fill missing tokens with same-platform equivalents, then portable
  same-scheme defaults. Use platform global typography when font aliases are absent and enforce required generated token
  types.
- ccb458e: Add independently bundleable flexCoolTheme and flexWarmTheme descriptions, let flexTheme select its palette from appearance.colorTone, and use flexCoolTheme for no-theme fallbacks.
- 06b458f: Shrink the generated Flex defaults by about 6 KB minified: values that repeat are emitted once, and the entries both
  tones share are emitted once in a common object. The default token values are unchanged.
- ccb458e: Lazily initialize the fallback Flex theme state once using the current system light or dark appearance, and keep the fallback appearance hooks consistent.

## 0.5.3

### Patch Changes

- dc47e15: Refresh dependency alignment with current rnx-kit tools and remove retired depcheck configuration.

## 0.5.2

### Patch Changes

- cfa4c66: Write TypeScript build information to `node_modules/.cache` instead of `.cache`, so
  incremental build state is no longer included in published packages.
- cfa4c66: Add package-owned agent guidance, user entry points, and indexed references to
  design and framework-base. Design's completed plan is removed and its open
  theming work moves to `references/remaining-work.md`. Both packages now restrict
  published contents with a `files` allowlist. Desktop Driver guidance now tracks
  unfinished work in a remaining-work reference.
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [60121de]
  - @fluentui-react-native/adapters@0.15.2
  - @fluentui-react-native/framework-base@0.9.0

## 0.5.1

### Patch Changes

- Updated dependencies [3dbc30f]
  - @fluentui-react-native/framework-base@0.8.1

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
