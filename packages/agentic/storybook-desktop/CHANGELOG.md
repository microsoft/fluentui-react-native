# @fluentui-react-native/storybook-desktop

## 0.3.0

### Minor Changes

- 65245b4: Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.

  Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.

  Separate native keyboard press cleanup from activation pairing, preserving macOS keydown activation and clearing pressed feedback after interruption, blur, disable, or target replacement. Centralize endpoint-specific accessibility action contracts in Framework Base, and execute shared focus stories on macOS with narrowly scoped Windows-only pointer assertions.

  Carry owned modifier state on macOS native input events so rapid WebDriver chords such as Shift+Tab are delivered correctly.

  Clarify that FocusZone uses geometric directional navigation on macOS, while Windows and Win32 opt into geometry with use2DNavigation.

  Coalesce same-instance callback-ref handoffs without changing snapshots or mount generations, while rejecting detached-target activation immediately. Track repeated native key events separately from held physical keys so a single modifier release cannot leave later input modified.

- 8d31a6b: Add opt-in executable WebdriverIO callbacks in React Native stories, Storybook-owned test configuration, isolated Node execution, and Button examples.
- 8d31a6b: Add named, individually isolated WDIO story tests with target-platform context and test-name filtering. Migrate Button's declarative desktop-driver plans to executable WebdriverIO callbacks.
- 5b3f74c: Build the source-shipped native desktop helper explicitly, reuse verified
  content-addressed artifacts, and add the Windows/Win32 C++ and macOS Swift
  providers. Storybook can build the helper independently, ensures it during
  prep, and attaches authored smoke tests to the exact app process it launched.
  macOS cache resolution pins stable signatures to the leaf certificate and
  designated requirement, makes source builds reproducible, verifies Hardened
  Runtime and secure timestamps, reports TCC/AX diagnostics, and normalizes Fabric
  accessibility roles, window identity, input, and Retina ScreenCaptureKit
  evidence.

### Patch Changes

- 5b3f74c: Add the native macOS and Windows implementations, explicit native build
  verification, and prebuilt-only Storybook PR pipeline integration for the
  desktop-driver package. Keep the FocusZone Windows WinMD compatible with the
  consuming Storybook application's target SDK.
- 8d31a6b: Capture ordered per-command stdout/stderr logs, replay full output on failure or in verbose mode, and report contextual story navigation and test failures with nested causes.
- 8d31a6b: Navigate to each test's story before execution, bound navigation waits, and group static plans and inline WebdriverIO callbacks by story in desktop smoke tests.
- 8d31a6b: Wait for the authenticated Storybook preview to initialize before navigating after app startup or restart. Allow the aggregate WDIO subprocess contract enough CI time without relaxing individual callback deadlines.
- 8d31a6b: Fix loading WDIO settings from Storybook's source-config fallback before compiled JavaScript exists.
- 65245b4: Migrate all component catalog story tests to named WDIO callbacks and add Windows/Win32 focus contract coverage, including activation pairing, native target lifetime, nested modality, editable fields, TabList sequencing, and FocusZone navigation. Keep Node-only test helpers out of production emit, require story type coverage, preserve focused smoke filters, and allow worker HTTP handles to close naturally while retaining bounded cleanup.
- Updated dependencies [5b3f74c]
- Updated dependencies [8d31a6b]
- Updated dependencies [65245b4]
- Updated dependencies [8d31a6b]
- Updated dependencies [8d31a6b]
- Updated dependencies [5b3f74c]
  - @fluentui-react-native/desktop-driver@0.3.0

## 0.2.0

### Minor Changes

- 59b6003: Add reusable platform-aware configuration and CLI APIs for serving, preparing, bundling, building, running, and smoke testing desktop Storybook applications. The package now owns complete Windows Fabric and Win32 smoke lifecycles, native host launch, synchronized story traversal, desktop UX checks, process cleanup, and per-enlistment bundle and service isolation. React Native runtime code and peers are isolated in a companion package so Yarn's pnpm linker can invoke the peer-free CLI through a physical workspace locator.
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

### Patch Changes

- Updated dependencies [59b6003]
  - @fluentui-react-native/desktop-driver@0.2.0
