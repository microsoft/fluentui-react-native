---
"@fluentui-react-native/callout": patch
---

Fix the macOS Fabric build for Callout.

`codegenConfig.includesGeneratedCode` is read by React Native core's codegen executor rather than by
`react-native-windows`, so it told React Native that Callout ships generated code for every platform. Callout only ships
generated code for Windows, so Apple codegen stopped emitting
`react/renderer/components/FRNCalloutSpec/*`. `RCTCalloutComponentView.mm` then failed to compile, `libFRNCallout.a` was
never produced, and consuming apps failed at the link step with `library 'FRNCallout' not found`.

Removed the flag and updated the macOS component view for the `RCTCallout` to `Callout` component rename: the generated
types are now `CalloutProps`, `CalloutEventEmitter`, `CalloutState`, `CalloutDirectionalHint`,
`RCTCalloutViewProtocol`, and `RCTCalloutHandleCommand`. The view no longer redeclares the component name, shadow node,
or component descriptor by hand and imports them from the generated headers instead, which also removes a duplicate
`CalloutComponentName` definition.
