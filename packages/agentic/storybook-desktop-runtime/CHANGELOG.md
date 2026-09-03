# @fluentui-react-native/storybook-desktop-runtime

## 0.2.2

### Patch Changes

- 5b3f74c: Add the native macOS and Windows implementations, explicit native build
  verification, and prebuilt-only Storybook PR pipeline integration for the
  desktop-driver package. Keep the FocusZone Windows WinMD compatible with the
  consuming Storybook application's target SDK.
- 5b3f74c: Build the source-shipped native desktop helper explicitly, reuse verified
  content-addressed artifacts, and add the Windows/Win32 C++ and macOS Swift
  providers. Storybook can build the helper independently, ensures it during
  prep, and attaches authored smoke tests to the exact app process it launched.
  macOS cache resolution pins stable signatures to the leaf certificate and
  designated requirement, makes source builds reproducible, verifies Hardened
  Runtime and secure timestamps, reports TCC/AX diagnostics, and normalizes Fabric
  accessibility roles, window identity, input, and Retina ScreenCaptureKit
  evidence.

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
