---
id: native-core.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
---

# Contributing to Native Core

## Delivery and validation

Add each feature as one reviewed contract, thin wrapper/schema, native
implementation, explicit export, and tests. The component codegen path is
exercised by Callout and FocusZone; add a representative TurboModule before
claiming module readiness.
macOS component admission requires both Paper and Fabric evidence; Windows
component admission requires Fabric evidence. A `win` or root API also
requires Win32 evidence before it is exported there.

Run the owning workspace's scripts from the repository root:

```sh
yarn workspace @fluentui-react-native/native-core format --check
yarn workspace @fluentui-react-native/native-core lint
yarn workspace @fluentui-react-native/native-core build
yarn workspace @fluentui-react-native/native-core test
yarn workspace @fluentui-react-native/native-core codegen:windows --check
yarn build
```

Node tests validate the six export maps, emitted JS/declaration files,
conditional resolution, shared native ownership, and JS-only shims. Colocated
Jest tests retain wrapper behavior, imperative refs/commands, slot acceptance,
and public type contracts; shim tests verify exact component identity.
Runtime and compile-time checks reject legacy component/type exports at root.
The package prebuild regenerates Windows bindings from the shared spec.
Native
verification must cover registration, events/commands, refs, unmount cleanup,
error propagation, and architecture/platform parity, not only JS mocks.
Callout's executable stories verify native popup creation, `onShow` and
`onDismiss`, outside-click and Escape dismissal, and reopening on macOS,
Windows, and Win32; the modern stories add readiness, descendant focus,
explicit close/rearm, a flat Menu composition (FocusZone entry, arrow
navigation, and trigger restoration), explicit empty-container focus, and
macOS/Windows view/rect/point anchor geometry. Run them
together with FocusZone's keyboard cases from `apps/storybook` using the owned
lifecycle:

```sh
STORYBOOK_SMOKE_STORY='native-*' yarn storybook smoke --macos --mode stories-and-tests
```

Use `--windows` or `--win32` for the Windows endpoints. This traverses the
full catalog before running the selected native tests.
Add `--paper` to run the macOS Paper lane; a successful Paper build alone does
not establish Paper runtime or input parity.

## Apple boundary probe

After building macOS Storybook, run the reproducible Apple boundary probe:

```sh
yarn workspace @fluentui-react-native/native-core test:apple-integration
```

It compiles the build's Swift source list with complete concurrency checking and
warnings as errors, verifies that the bridging mode cannot import `React`,
syntax-checks its emitted Swift header, and checks both Paper extern registrations
with strict unused-parameter and case-sensitive include diagnostics. Only the
Swift importer's two known RNmacOS 0.81.9 header diagnostics (nullability
completeness and property atomicity) are excluded; package Swift warnings and
registration diagnostics are not suppressed.
