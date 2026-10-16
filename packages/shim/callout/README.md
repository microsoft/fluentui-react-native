# Callout compatibility shim

`@fluentui-react-native/callout` preserves its existing named exports by
re-exporting the implementation and public types from
`@fluentui-react-native/native-core/legacy`.

New consumers should import `Callout`, `CalloutProps`, and `CalloutHandle`
from `@fluentui-react-native/native-core/legacy`. Deprecated compatibility aliases
remain available through this shim.

This package owns no native code, codegen specification, pod, or Windows
project. Native applications must list `@fluentui-react-native/native-core`
as a direct dependency so native tooling discovers its pod and Windows
Fabric library. Remove explicit `FRNCallout` pod declarations and regenerate
autolinking/Pods after updating.

See the [Callout contract](../../agentic/native-core/src/legacy/callout/SPEC.md)
and [native-core organization](../../agentic/native-core/README.md).
