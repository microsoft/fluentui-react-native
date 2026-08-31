# @fluentui-react-native/storybook-desktop

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
