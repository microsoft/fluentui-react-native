---
"@fluentui-react-native/callout": minor
---

Add a macOS Fabric (New Architecture) implementation for Callout. The native component name is standardized on `RCTCallout` (the platform-agnostic `CalloutNativeComponent.ts` spec; the `.macos.ts` variant is removed and the Paper view manager is renamed accordingly), codegen reads from `src`, and a new `RCTCalloutComponentView` hosts the shared `FRNCalloutView` under `RCT_NEW_ARCH_ENABLED` while the legacy Paper path continues to build.
