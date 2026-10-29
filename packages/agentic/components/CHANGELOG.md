# @fluentui-react-native/components

## 0.7.1

### Patch Changes

- 68cfe41: Project MenuButton's plain content label onto its native trigger name while preserving explicit accessibility naming props.
- b13da50: Expose Button's plain content as its native name and declare Toggle when selected is supplied, preserving explicit naming, caller actions and externally owned checked state.
- cdea138: Project standalone ListboxItem selection through React Native's supported checked accessibility state and platform toggle action while preserving the button role. Keep externally owned selection and disabled semantics authoritative over caller ARIA aliases without changing Dropdown option selection.
- 6e1c063: Expose native MenuItem indicator state and actions while preserving caller-owned selection and original accessibility events.
- d732230: Declare Radio's native Select action and project caller-owned selection to UI Automation without synthesizing presses or changing the selected value.
- @fluentui-react-native/native-core@0.2.0

## 0.7.0

### Minor Changes

- 60121de: Add the reviewed Dropdown contract and its macOS (Paper and Fabric), Windows Fabric, and Office Win32 implementation.
  Dropdown draws Input's outline or underline chrome on a combobox trigger and presents ListboxItem options in a native
  list popup for single or multiple selection, with controlled or uncontrolled selection and presence, a placeholder, and
  a count summary when selected labels do not fit. On macOS the list requests a vertical scroller only while its options
  overflow, so Paper's legacy scrollers do not inset the options. Dropdown is exported from the package root.
  
  ListboxItem gains a `value` prop. Inside a Dropdown list, an item with a value becomes a bound option that the list
  selects, positions, and focuses, and that exposes select, add-to-selection, and remove-from-selection actions. Outside
  a list, or without a value, ListboxItem is unchanged.
- 60121de: Add the reviewed Menu and MenuButton contracts and their macOS implementation: command rows with wrapping arrows,
  Home/End, type-ahead, two submenu levels that open on arrows, press, or hover, activation dismissal, and focus return.
  MenuButton adds Button chrome with a down chevron, Up/Down entry, and Tab past the trigger. Both are exported from the
  package root. MenuItem gains a `submenu` prop and a Menu context that supplies
  registration, type-ahead labels, and the platform's disabled-focusable default.
  
  The experimental modern Callout accepts `tabNavigation: 'cycle' | 'dismiss' | 'continue'` and reports `tab-forward` and
  `tab-backward` dismissals. On macOS, Tab in a popup family closes its outermost Tab-exiting presentation and can continue
  focus past the anchor. Legacy Callout behavior and APIs are unchanged.
- 60121de: Add the reviewed Popover contract and its macOS and Windows implementation: a Button trigger, a token-styled
  surface in a native popup, controlled and uncontrolled presence with native dismissal reasons, entry focus, and
  focus return to the trigger. Popover is exported from the package root.
  
  On macOS, the experimental modern Callout now presents an unstyled transparent popup window with a native shadow
  that follows its content. Pointer input on a live view anchor no longer light-dismisses it, Tab moves within the
  popup, and Paper orders modern commands after previously committed view updates. Legacy Callout behavior and APIs
  are unchanged.
- 60121de: Add opt-in disabled-focusable pressable targets and MenuItem rows that retain
  disabled semantics without enabling activation. Give Input its variant-specific
  focus-visible treatment: a shared outline ring or an additive underline
  indicator, without a competing native editor ring.
  Keep keyboard release cleanup exactly once when disabling a pressed target.
  
  Extend the experimental modern Callout focus operation with native first/last
  strategies, report observed dismissal causes without guessing unclassified
  notifications, and ignore duplicate close or late ready events for a dismissed
  presentation. Rebuild native hosts for the changed modern command schema.
  Legacy APIs and prebuilt Win32 commands are unchanged.

### Patch Changes

- cfa4c66: Write TypeScript build information to `node_modules/.cache` instead of `.cache`, so
  incremental build state is no longer included in published packages.
- cfa4c66: Add package-owned agent guidance, user entry points, and indexed references to
  components and native-core. The agentic component recipes and contract source
  adapters move into the components package, the desktop focus plan is replaced
  by `references/remaining-work.md`, and both packages publish their guidance.
  Components now restricts published contents with a `files` allowlist, and the
  callout and focus-zone shims link to native-core's architecture reference.
- e2092f9: Use Framework Base's `pointerFocus` mode for Tab. FocusZone stories request
  focus through focus targets so React Native macOS does not keep an unmounted
  item as its focused input.
- e2092f9: Cover native focus from a physical pointer click on Input.
- fcc3b7f: Add a macOS-only `--paper` option to prepare, build, launch, and smoke test Storybook with Paper while preserving Fabric as the default renderer.
  
  Use centered alignment in macOS Paper CompoundItemLayout stories to avoid the native Yoga baseline crash without changing the primitive or Fabric demonstrations.
  
  Measure LayoutStableText's hidden reserve Text directly in native alignment stories, avoiding Paper Text-versus-View pixel-rounding mismatches without relaxing the geometry assertions.
  
  Deduplicate compatible Storybook React, theming, and shared UI dependencies in the lockfile after desktop UI updates, keeping strict Metro duplicate checks enabled.
- 60121de: Share one native popup host, presence latch, and list-popup trigger controller across Popover, Menu, MenuButton, and
  Dropdown, along with the popup layout styles and ref and handler composition helpers. Input and Dropdown share Input's
  visual-state resolution. Behavior is unchanged.
- 60121de: Present Popover on Office Win32 through a new `Callout` adapter in native-core's `win32` entrypoint. The adapter
  implements the modern props and presentation handle over the host's existing Callout registration and sends it no
  new commands. It supports view anchors only, and its popup sits flush against the anchor. The host draws the surface
  fill and corner radius, because its popup window has no per-pixel transparency. On Win32 the Popover trigger also
  declares `Expand` and `Collapse` accessibility actions, so UI Automation exposes its expanded state.
  
  On Windows, the modern Callout popup window now has rounded corners and the platform popup shadow. A press on the
  live view anchor no longer light-dismisses it before the anchor handles that press.
  
  The Windows desktop driver no longer reactivates a window whose owned popup is in the foreground. It also retries a
  subtree walk when a closing popup's UI Automation provider reports a transient failure.
- 60121de: Present Menu and MenuButton on Windows and Office Win32. On Windows, the modern Callout now implements
  `tabNavigation`: Tab or Shift+Tab in any popup of a nested family closes the whole family and either keeps focus at
  the owner (`dismiss`) or moves it past the anchor (`continue`). Closing an outer Callout also closes the Callouts
  nested in it, and focus requests treat a nested popup's owner window as active.
  
  Native-core's `win32` entrypoint adds a `FocusZone` adapter over the host's FocusZone registration. Its `Callout`
  adapter adds `initialFocus`, keeps the popup's focus and key events from bubbling to its owner, and closes the
  outermost popup on Tab. On Win32, Menu handles Home and End itself, and MenuButton returns Tab to its trigger.
  Because the Win32 host reports a pointer leave together with its enter, a pending submenu change there survives the
  leave until another row is hovered.
  
  The Windows desktop driver injects a character that one unmodified key of the foreground keyboard layout types as
  that virtual key, so key-based handlers such as type-ahead match it.
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [f550cfb]
- Updated dependencies [f550cfb]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [60121de]
- Updated dependencies [60121de]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [60121de]
- Updated dependencies [60121de]
- Updated dependencies [f550cfb]
- Updated dependencies [27dc8eb]
- Updated dependencies [60121de]
- Updated dependencies [60121de]
  - @fluentui-react-native/design@0.5.2
  - @fluentui-react-native/framework-base@0.9.0
  - @fluentui-react-native/native-core@0.2.0

## 0.6.2

### Patch Changes

- c547395: Move Callout and FocusZone implementations into native-core and retain the existing packages as JS-only compatibility shims under packages/shim. Native applications must directly depend on native-core and regenerate native autolinking/Pods; macOS now uses the shared FRNNativeCore pod and Windows uses one Fabric library for both components. Public APIs and native registration names are unchanged.
- c547395: Isolate the existing Callout and FocusZone JavaScript wrappers under native-core/legacy instead of the package root. Compatibility shims retain their exports through this submodule; native implementations and codegen specifications are unchanged.
- Updated dependencies [c547395]
- Updated dependencies [c547395]
- Updated dependencies [c547395]
  - @fluentui-react-native/native-core@0.1.0

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
