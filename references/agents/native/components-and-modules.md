---
id: native.components-and-modules
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
---

# Native components and modules

Native code can accompany a v0, v1, or agentic component, or stand alone as a module or service. Native-core's
[package references](../../../packages/agentic/native-core/references/README.md) are authoritative for its
[entry points](../../../packages/agentic/native-core/references/entry-points.md), [architecture](../../../packages/agentic/native-core/references/architecture.md),
[codegen and publishing](../../../packages/agentic/native-core/references/codegen-and-publishing.md), and [validation](../../../packages/agentic/native-core/references/contributing.md).

- **R-NATIVE-001:** Put new modern native components, TurboModules, and native services in
  `@fluentui-react-native/native-core` rather than creating another standalone package. Maintain existing native
  wrappers in their current packages unless the task explicitly requests a migration.
- **R-NATIVE-002:** Preserve public APIs and native registration names during maintenance and migration. Callout and
  FocusZone keep their existing public APIs and registration names after moving to native-core.
- **R-NATIVE-003:** Record native validation per platform and renderer as passed, failed, skipped, not run, or
  unsupported, with reasons (R-VALID-002). Native code is qualified only by building and exercising the affected native
  boundary; an upstream or JavaScript-only build does not qualify another host such as Office.

## Native-core boundaries

Native-core's entry-point, legacy-wrapper, shim, host, and autolinking rules are owned by its
[entry points](../../../packages/agentic/native-core/references/entry-points.md) and [architecture](../../../packages/agentic/native-core/references/architecture.md) references. In brief, root exports need
equivalent implementations on every supported desktop host, Windows components are Fabric-only, and macOS components
support Paper and Fabric.

## Component shape

Components with native code typically:

- have one root slot wrapping the native component;
- declare it with `codegenNativeComponent` for New Architecture compatibility;
- may use `constantsToExport` for native-side defaults;
- include a `.podspec` for iOS and macOS. Some wrap FluentUI Apple controls.

Run `pod install` from the owning app or its `ios`/`macos` directory after dependency changes; see the
[permissions reference](../repository/permissions.md) for approved Pod operations.

## Platform guidance

- React Native Windows Fabric views: [Windows Fabric native components](windows-fabric.md).
- Apple native code: follow [Apple native authoring and Office integration](apple-office.md) (R-APPLE-001 through
  R-APPLE-007) for every iOS or macOS change, plus native-core's [macOS Swift interoperability](../../../packages/agentic/native-core/references/architecture.md#macos-swift-interoperability) notes.
- Focus targets and native focus visuals: [common focus authoring](../focus/common.md) and its platform files.
- Accessibility actions: the [framework-base accessibility reference](../../../packages/framework-base/references/accessibility.md)
  define the transport contract and its native qualification requirements.
