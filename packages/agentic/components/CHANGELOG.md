# @fluentui-react-native/components

## 0.6.1

### Patch Changes

- 3dbc30f: Prevent the Avatar activity ring from crashing React Native Windows Fabric by replacing native outlines with a persistently mounted decorative border. Preserve its token-derived gap, stroke, layout, and accessibility, and cover visibility changes across all avatar sizes.
- 3dbc30f: Center intrinsic font icons, Avatar initials, and layout-stable labels inside their View frames, and move single-line Input spacing outside the native editor. Correct the compound text-row baseline examples and add alignment regression coverage and authoring guidance.
- 3dbc30f: Restore loading animations on macOS Fabric by selecting the supported JavaScript animation driver. Keep Skeleton silhouettes visible without motion and calculate Spinner's quarter-circle dash lengths from native geometry. Add native motion and macOS text-alignment regression coverage.
- 3dbc30f: Replace Skeleton's solid highlight strip with a soft, angled SVG linear-gradient sweep based on the repository's Shimmer pattern. Preserve shared timing, reduced motion, rounded clipping, and visible static placeholders, and mirror travel for RTL.
- Updated dependencies [3dbc30f]
  - @fluentui-react-native/framework-base@0.8.1
  - @fluentui-react-native/design@0.5.1
  - @fluentui-react-native/callout@0.29.6

## 0.6.0

### Minor Changes

- 65245b4: Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.
  
  Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.
  
  Separate native keyboard press cleanup from activation pairing, preserving macOS keydown activation and clearing pressed feedback after interruption, blur, disable, or target replacement. Centralize endpoint-specific accessibility action contracts in Framework Base, and execute shared focus stories on macOS with narrowly scoped Windows-only pointer assertions.
  
  Carry owned modifier state on macOS native input events so rapid WebDriver chords such as Shift+Tab are delivered correctly.
  
  Clarify that FocusZone uses geometric directional navigation on macOS, while Windows and Win32 opt into geometry with use2DNavigation.
  
  Coalesce same-instance callback-ref handoffs without changing snapshots or mount generations, while rejecting detached-target activation immediately. Track repeated native key events separately from held physical keys so a single modifier release cannot leave later input modified.
- 65245b4: Add useFocusVisuals and shared focus-ring styling, and migrate focusable components to optional FocusRing state slots. Windows and macOS default to native rings; Win32 defaults to keyboard-modality-aware custom rings. The hook supports native-ring overrides and always-visible focused custom rings. Component scenes now require ThemedRoot, and unstable state no longer carries focusVisualProps or Checkbox's local focusVisible flag.

### Patch Changes

- 5b3f74c: Add the native macOS and Windows implementations, explicit native build
  verification, and prebuilt-only Storybook PR pipeline integration for the
  desktop-driver package. Keep the FocusZone Windows WinMD compatible with the
  consuming Storybook application's target SDK.
- 8d31a6b: Add opt-in executable WebdriverIO callbacks in React Native stories, Storybook-owned test configuration, isolated Node execution, and Button examples.
- 8d31a6b: Add named, individually isolated WDIO story tests with target-platform context and test-name filtering. Migrate Button's declarative desktop-driver plans to executable WebdriverIO callbacks.
- 65245b4: Use native focus visuals on all platforms by default while retaining the custom
  FocusVisual implementation behind a shared evaluation switch. Require React
  Native Windows 0.81.35 or newer for the native focus visual crash fix.
  Refresh the Windows Callout and FocusZone NuGet locks to the same runtime version.
- 5b3f74c: Build the source-shipped native desktop helper explicitly, reuse verified
  content-addressed artifacts, and add the Windows/Win32 C++ and macOS Swift
  providers. Storybook can build the helper independently, ensures it during
  prep, and attaches authored smoke tests to the exact app process it launched.
  macOS cache resolution pins stable signatures to the leaf certificate and
  designated requirement, makes source builds reproducible, verifies Hardened
  Runtime and secure timestamps, reports TCC/AX diagnostics, and normalizes Fabric
  accessibility roles, window identity, input, and Retina ScreenCaptureKit
  evidence.
- 8d31a6b: Navigate to each test's story before execution, bound navigation waits, and group static plans and inline WebdriverIO callbacks by story in desktop smoke tests.
- 65245b4: Place the entire desktop Storybook app in one ThemedRoot, derive chrome colors from its theme state, and render component test scenes under a shared ThemedRoot wrapper.
- 65245b4: Migrate all component catalog story tests to named WDIO callbacks and add Windows/Win32 focus contract coverage, including activation pairing, native target lifetime, nested modality, editable fields, TabList sequencing, and FocusZone navigation. Keep Node-only test helpers out of production emit, require story type coverage, preserve focused smoke filters, and allow worker HTTP handles to close naturally while retaining bounded cleanup.
- Updated dependencies [65245b4]
- Updated dependencies [65245b4]
- Updated dependencies [65245b4]
  - @fluentui-react-native/framework-base@0.8.0
  - @fluentui-react-native/design@0.5.0
  - @fluentui-react-native/callout@0.29.5

## 0.5.0

### Minor Changes

- 6b2753d: Expose React 19 ref props for components and primitives with stable native roots.
- 650c8d5: Add a theme-aware Text primitive and use it for component text content.

### Patch Changes

- Updated dependencies [0a6286c]
  - @fluentui-react-native/design@0.4.1

## 0.4.0

### Minor Changes

- 24be698: Add TabList group coordination, shared focus-modality and animation hooks, and align component behavior with the ratified React Native contracts.

### Patch Changes

- 59b6003: Add the platform-neutral W3C desktop driver and integrate Storybook manifests,
  authenticated runtime readiness, deterministic preview resets, and same-process
  driver supervision. Add portable Button, Checkbox, and Input story plans for
  WebdriverIO and agent validation. Desktop Storybook smoke runs can now either
  traverse the complete catalog or traverse it and then execute the authored
  desktop-e2e plans.
  Smoke startup now waits through the initial Metro compilation, macOS cleanup
  terminates the exact bundle-identifier process, and Windows CI installs the
  required Windows App Runtime while the shared registration lifecycle installs
  the SDK-provided Debug VCLibs frameworks.
- 4157768: Add appearance-aware Flex theme sources with stable token identity and lazy compatibility bridges for legacy themes.
- Updated dependencies [24be698]
- Updated dependencies [6259f5d]
- Updated dependencies [4157768]
  - @fluentui-react-native/framework-base@0.7.0
  - @fluentui-react-native/callout@0.29.4
  - @fluentui-react-native/design@0.4.0

## 0.3.0

### Minor Changes

- f21f82c: Move public primitive exports from the package root to the `./primitives`
  subpath and document their contracts.

### Patch Changes

- a0ef3f4: Add sideEffects: false to package manifests
- Updated dependencies [587845c]
- Updated dependencies [a0ef3f4]
  - @fluentui-react-native/design@0.3.3

## 0.2.4

### Patch Changes

- 51fab45: Updating path references to components and design packages
- 34bdf23: Version updates for security
- Updated dependencies [51fab45]
- Updated dependencies [cfef63e]
- Updated dependencies [7372841]
- Updated dependencies [cfef63e]
- Updated dependencies [34bdf23]
- Updated dependencies [cfef63e]
  - @fluentui-react-native/design@0.3.2
  - @fluentui-react-native/callout@0.29.3

## 0.2.3

### Patch Changes

- 4777e54: Render persistent single- and dual-ring focus visuals across agentic components to avoid React Native Windows Fabric crashes.

## 0.2.2

### Patch Changes

- 853f1fd: Moved the location of callout, with links to new location
- 5bc9e81: Normalize component controlled and uncontrolled state patterns and utilities
- 54870b4: Remove file added inadvertently after the move of the storybook app
- 5bc9e81: Give each stateful component axis an explicit owner.

  Adds `useToggleState` to `framework-base` for controls whose interaction _is_ the state change. It wraps
  `useControllableValue` and adds a disabled guard and no-op suppression, so the control works both when a caller owns the
  value and when it owns the value itself.

  Self-driving controls support both directions through the `<state>` / `default<State>` / `on<State>Change` triple:

  - `Accordion` gains `defaultExpanded` and no longer treats a supplied `expanded` value as its own uncontrolled default,
    which previously left `expanded={false}` permanently collapsed.
  - `Checkbox` and `Switch` route their existing axes through the shared hook so disabled and redundant changes behave
    consistently, and `Switch` now forwards `onPress`.

  `Button`, `Card`, `ListItem`, `ListboxItem`, `MenuItem`, `Radio`, and `Tab` keep `selected` as externally driven state.
  They render the value they are given and report the interaction through `onPress`, because a press on a button is an
  action and a press on a tab, radio, or item is a message to the group that owns the selection.

  Storybook stories now demonstrate each axis correctly: `default<State>` drives the self-driving controls, and a
  caller-owned `React.useState` story drives selection. `Button` and `Card` no longer expose `selected` as a control,
  because that prop decides whether the component is a toggle button or a selectable card at all, and flipping it between
  `undefined` and `false` resized or re-roled the component.

- cbd319c: Bump package to publish via ESRP (no changes)
- Updated dependencies [853f1fd]
- Updated dependencies [5bc9e81]
- Updated dependencies [5bc9e81]
- Updated dependencies [5bc9e81]
- Updated dependencies [cbd319c]
  - @fluentui-react-native/callout@0.29.2
  - @fluentui-react-native/framework-base@0.6.1
  - @fluentui-react-native/design@0.3.1

## 0.2.1

### Patch Changes

- 3405262: Very initial framework for RNW fabric callout implementation
- Updated dependencies [2cb34bb]
- Updated dependencies [3405262]
  - @fluentui-react-native/callout@0.29.1

## 0.2.0

### Minor Changes

- 778d82b: Export the generated agentic components and their composition helpers, and fix their build errors.
- 778d82b: Add shared component primitives, styling utilities, state hooks, accessibility diagnostics, and owned native-root prop types.

### Patch Changes

- c41071d: Bug fixes and additional stories for primitives
- 1157793: Export shared state-based styling utilities from the design package styling submodule
- 778d82b: Consolidation of shared utilities, dependency profile updates, and more generated components
- ea738f0: Align agentic Button corner radii with desktop V1 values and add context-backed FURN Theme-to-Flex token conversion
- Updated dependencies [3abc13a]
- Updated dependencies [778d82b]
- Updated dependencies [3abc13a]
- Updated dependencies [1157793]
- Updated dependencies [778d82b]
- Updated dependencies [ea738f0]
  - @fluentui-react-native/design@0.3.0
  - @fluentui-react-native/framework-base@0.6.0
