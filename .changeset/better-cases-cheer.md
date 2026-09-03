---
"@fluentui-react-native/storybook-desktop-runtime": patch
"@fluentui-react-native/storybook-desktop": patch
"@fluentui-react-native/desktop-driver": patch
"@fluentui-react-native/components": patch
"@fluentui-react-native/focus-zone": patch
---

Add the native macOS and Windows implementations, explicit native build
verification, and prebuilt-only Storybook PR pipeline integration for the
desktop-driver package. Keep the FocusZone Windows WinMD compatible with the
consuming Storybook application's target SDK.
