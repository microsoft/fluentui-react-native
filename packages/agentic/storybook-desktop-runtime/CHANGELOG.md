# @fluentui-react-native/storybook-desktop-runtime

## 0.3.7

### Patch Changes

- c5ea4df: Update Storybook React Native packages to 10.7.1 and Storybook to 10.6.5.
- @fluentui-react-native/native-core@0.2.2
  - @fluentui-react-native/design@0.6.1
  - @fluentui-react-native/default-theme@0.28.1

## 0.3.6

### Patch Changes

- 26cc577: Add local story-provider lifetime/cancellation context, authenticated connection
  epochs, versioned native marker conformance, prompt disconnect failure, and stale
  preview mutation rejection. Fence interrupted navigation conservatively and
  report renderer-specific bridge/relaunch failures without claiming transparent
  upstream reconnect or clearing unknown-effect quarantine.
- da2b62c: Scroll the Win32 story preview inside its viewport and remount the preview for each navigation generation, so story tests start from a fresh, reachable preview.
- Updated dependencies [8574d22]
  - @fluentui-react-native/native-core@0.2.1

## 0.3.5

### Patch Changes

- 06b458f: Keep the Storybook chrome and story canvas on the Flex theme. The Theme selector now applies Flex or Fluent only to
  story content, while scheme, contrast, and tone still apply to the chrome.
- 06b458f: Read Storybook chrome colors through the design package's interactive color envelope.
- 06b458f: Replace the fixed Storybook theme buttons with Theme (Flex or Fluent), Scheme (light, dark, or system), Contrast, and Tone dropdowns. The toolbar now defaults to Flex light, standard contrast, and cool tone, independent of the host appearance.
- Updated dependencies [06b458f]
- Updated dependencies [06b458f]
- Updated dependencies [06b458f]
- Updated dependencies [ccb458e]
- Updated dependencies [06b458f]
- Updated dependencies [06b458f]
- Updated dependencies [06b458f]
- Updated dependencies [ccb458e]
- Updated dependencies [06b458f]
  - @fluentui-react-native/default-theme@0.28.0
  - @fluentui-react-native/design@0.6.0
  - @fluentui-react-native/native-core@0.2.0

## 0.3.4

### Patch Changes

- Updated dependencies [dc47e15]
  - @fluentui-react-native/design@0.5.3
  - @fluentui-react-native/default-theme@0.27.16
  - @fluentui-react-native/native-core@0.2.0

## 0.3.3

### Patch Changes

- cfa4c66: Write TypeScript build information to `node_modules/.cache` instead of `.cache`, so
  incremental build state is no longer included in published packages.
- d690e1c: Add package-owned agent guidance and user entry points, and restrict published
  contents to the package files required at runtime and for documentation.
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [f550cfb]
- Updated dependencies [f550cfb]
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
  - @fluentui-react-native/default-theme@0.27.15
  - @fluentui-react-native/design@0.5.2
  - @fluentui-react-native/native-core@0.2.0

## 0.3.2

### Patch Changes

- c547395: Move Callout and FocusZone implementations into native-core and retain the existing packages as JS-only compatibility shims under packages/shim. Native applications must directly depend on native-core and regenerate native autolinking/Pods; macOS now uses the shared FRNNativeCore pod and Windows uses one Fabric library for both components. Public APIs and native registration names are unchanged.
- c547395: Isolate the existing Callout and FocusZone JavaScript wrappers under native-core/legacy instead of the package root. Compatibility shims retain their exports through this submodule; native implementations and codegen specifications are unchanged.
- Updated dependencies [c547395]
- Updated dependencies [c547395]
- Updated dependencies [c547395]
  - @fluentui-react-native/native-core@0.1.0

## 0.3.1

### Patch Changes

- 3dbc30f: Align Storybook's actual canvas background with its preview surface so Secondary Button fills remain visible in Default Flex, light, and dark themes. Preserve explicit story background overrides and native-color fallbacks.
- @fluentui-react-native/design@0.5.1
  - @fluentui-react-native/callout@0.29.6
  - @fluentui-react-native/default-theme@0.27.14

## 0.3.0

### Minor Changes

- 65245b4: Place the entire desktop Storybook app in one ThemedRoot, derive chrome colors from its theme state, and render component test scenes under a shared ThemedRoot wrapper.

### Patch Changes

- 5b3f74c: Add the native macOS and Windows implementations, explicit native build
  verification, and prebuilt-only Storybook PR pipeline integration for the
  desktop-driver package. Keep the FocusZone Windows WinMD compatible with the
  consuming Storybook application's target SDK.
- 65245b4: Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.
  
  Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.
  
  Separate native keyboard press cleanup from activation pairing, preserving macOS keydown activation and clearing pressed feedback after interruption, blur, disable, or target replacement. Centralize endpoint-specific accessibility action contracts in Framework Base, and execute shared focus stories on macOS with narrowly scoped Windows-only pointer assertions.
  
  Carry owned modifier state on macOS native input events so rapid WebDriver chords such as Shift+Tab are delivered correctly.
  
  Clarify that FocusZone uses geometric directional navigation on macOS, while Windows and Win32 opt into geometry with use2DNavigation.
  
  Coalesce same-instance callback-ref handoffs without changing snapshots or mount generations, while rejecting detached-target activation immediately. Track repeated native key events separately from held physical keys so a single modifier release cannot leave later input modified.
- 5b3f74c: Build the source-shipped native desktop helper explicitly, reuse verified
  content-addressed artifacts, and add the Windows/Win32 C++ and macOS Swift
  providers. Storybook can build the helper independently, ensures it during
  prep, and attaches authored smoke tests to the exact app process it launched.
  macOS cache resolution pins stable signatures to the leaf certificate and
  designated requirement, makes source builds reproducible, verifies Hardened
  Runtime and secure timestamps, reports TCC/AX diagnostics, and normalizes Fabric
  accessibility roles, window identity, input, and Retina ScreenCaptureKit
  evidence.
- Updated dependencies [65245b4]
- Updated dependencies [65245b4]
- Updated dependencies [65245b4]
  - @fluentui-react-native/design@0.5.0
  - @fluentui-react-native/callout@0.29.5
  - @fluentui-react-native/default-theme@0.27.13

## 0.2.1

### Patch Changes

- Updated dependencies [0a6286c]
  - @fluentui-react-native/design@0.4.1
  - @fluentui-react-native/default-theme@0.27.12

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

- Updated dependencies [6259f5d]
- Updated dependencies [4157768]
  - @fluentui-react-native/callout@0.29.4
  - @fluentui-react-native/design@0.4.0
  - @fluentui-react-native/default-theme@0.27.11
