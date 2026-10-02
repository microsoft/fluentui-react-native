---
"@fluentui-react-native/native-core": minor
"@fluentui-react-native/callout": patch
"@fluentui-react-native/focus-zone": patch
"@fluentui-react-native/components": patch
"@fluentui-react-native/storybook-desktop-runtime": patch
---

Isolate the existing Callout and FocusZone JavaScript wrappers under native-core/legacy instead of the package root. Compatibility shims retain their exports through this submodule; native implementations and codegen specifications are unchanged.
