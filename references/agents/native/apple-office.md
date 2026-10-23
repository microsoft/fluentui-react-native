---
id: native.apple-office
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
  - packages/experimental
---

# Apple native authoring and Office integration

These rules apply to all iOS and macOS native components and modules, including experimental packages. Office may
compile Swift with an Objective-C bridging header instead of CocoaPods' `React` clang module, and may expose React Native
headers only through the `React/` namespace. Preserve both integration modes; do not require a host-specific header-map
workaround.

- **R-APPLE-001:** Import React Native headers in Objective-C and Objective-C++ as `<React/HeaderName.h>` with the exact
  upstream filename case, for example `<React/RCTI18nUtil.h>`. Use quoted includes for local package headers, not bare
  React Native names.
- **R-APPLE-002:** Guard Swift's React import. Existing macOS targets use `#if USE_REACT_AS_MODULE`; iOS targets use
  `#if canImport(React)`. When the import is disabled, the host's bridging header must expose the required React Native
  declarations using qualified includes. Do not invent substitute React types or silently change the macOS build-flag
  contract.
- **R-APPLE-003:** A translation unit containing `RCT_EXTERN_MODULE` must not import its generated `<Module>-Swift.h`,
  directly or through another header. Bridging-header builds can emit internal Swift manager classes into that generated
  header, causing duplicate interfaces against the extern macro. Implement Swift-manager commands in Swift and export
  matching Objective-C selectors and argument types with `RCT_EXTERN_METHOD`.
- **R-APPLE-004:** Keep custom Paper property bridges independent of generated Swift types: use React or AppKit base types
  and narrowly declared manager helpers, or remapped setters implemented in Swift. Renderer adapters and other
  Objective-C or Objective-C++ consumers that do not declare an extern Swift manager may import the generated header when
  needed. Keep the interoperability header basename aligned with the pod's `module_name`.
- **R-APPLE-005:** Dispatch bridge-manager view lookup and UI mutation to the main queue; `requiresMainQueueSetup` does
  not change a command's method queue. For the existing non-`Sendable` manager handoff, use the narrowly scoped
  `nonisolated(unsafe) let manager = self` pattern, with all access inside the main-queue closure. Do not add blanket
  `@unchecked Sendable`, disable concurrency checking, or mark shared mutable state unsafe to suppress diagnostics. Verify
  the target Swift version and features when introducing concurrency annotations.
- **R-APPLE-006:** Compile cleanly with strict warnings. Mark genuinely unused Objective-C method and block parameters
  `__unused`; do not remove required selector arguments or suppress `-Wunused-parameter` or case-mismatch warnings
  globally.
- **R-APPLE-007:** Validate changed boundaries in both the CocoaPods module configuration and the bridging-header
  configuration without the `React` module. Include an emitted bridging-mode Swift header to verify its declarations,
  then syntax-check extern registrations without importing that header. Check strict Swift concurrency and qualified,
  case-sensitive React header lookup. Run the owning native build and relevant Paper and Fabric commands when feasible;
  an upstream build alone is not Office qualification. Record unavailable Office or runtime checks explicitly rather than
  claiming parity (R-NATIVE-003).

## Examples in this repository

| Rule        | Example                                                                                                                                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-APPLE-002 | macOS: [CalloutView.swift](../../../packages/agentic/native-core/macos/components/Callout/shared/CalloutView.swift); iOS: [AvatarViewManager.swift](../../../packages/experimental/Avatar/ios/AvatarViewManager.swift)                                                                         |
| R-APPLE-003 | [FRNCalloutManager.m](../../../packages/agentic/native-core/macos/components/Callout/paper/FRNCalloutManager.m) declares `RCT_EXTERN_METHOD` commands implemented in [CalloutManager.swift](../../../packages/agentic/native-core/macos/components/Callout/paper/CalloutManager.swift)         |
| R-APPLE-004 | [FRNNativeCore.podspec](../../../packages/agentic/native-core/FRNNativeCore.podspec) sets `module_name`; see native-core's [macOS Swift interoperability](../../../packages/agentic/native-core/references/architecture.md#macos-swift-interoperability) notes for the interoperability header |
| R-APPLE-005 | The main-queue manager handoff in [CalloutManager.swift](../../../packages/agentic/native-core/macos/components/Callout/paper/CalloutManager.swift)                                                                                                                                            |
| R-APPLE-006 | `__unused` block parameters in [RCTFocusZone.m](../../../packages/agentic/native-core/macos/components/FocusZone/shared/RCTFocusZone.m)                                                                                                                                                        |

PR #4364 is the compatibility precedent for these rules. Native-core's
[macOS Swift interoperability](../../../packages/agentic/native-core/references/architecture.md#macos-swift-interoperability) notes describe its interoperability header and Paper
manager placement; general native ownership and qualification rules are in
[native components and modules](components-and-modules.md).
