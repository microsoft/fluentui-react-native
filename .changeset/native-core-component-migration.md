---
"@fluentui-react-native/callout": patch
"@fluentui-react-native/focus-zone": patch
"@fluentui-react-native/components": patch
"@fluentui-react-native/storybook-desktop-runtime": patch
"@fluentui-react-native/tester": patch
---

Move Callout and FocusZone implementations into native-core and retain the existing packages as JS-only compatibility shims under packages/shim. Native applications must directly depend on native-core and regenerate native autolinking/Pods; macOS now uses the shared FRNNativeCore pod and Windows uses one Fabric library for both components. Public APIs and native registration names are unchanged.
