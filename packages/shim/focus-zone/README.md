# FocusZone compatibility shim

`@fluentui-react-native/focus-zone` preserves its existing named exports by
re-exporting the implementation and public types from
`@fluentui-react-native/native-core/legacy`. Its legacy `NativeProps` export aliases
the component-qualified `FocusZoneNativeProps` export.

New consumers should import `FocusZone` and `FocusZoneProps` from
`@fluentui-react-native/native-core/legacy`. Deprecated compatibility types remain
available through this shim.

This package owns no native code, codegen specification, pod, or Windows
project. Native applications must list `@fluentui-react-native/native-core`
as a direct dependency so native tooling discovers its pod and Windows
Fabric library. Remove explicit `RCTFocusZone` pod declarations and regenerate
autolinking/Pods after updating. Win32 keeps its host-provided native component.

See the [FocusZone contract](../../agentic/native-core/src/legacy/focus-zone/SPEC.md)
and [native-core organization](../../agentic/native-core/README.md).
