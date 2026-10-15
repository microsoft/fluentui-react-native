---
id: native.components-and-modules
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
---

# Native components and modules

Native code can accompany a v0, v1, or agentic component, or stand alone as a module or service. The
[native-core README](../../../packages/agentic/native-core/README.md) is authoritative for native-core's entrypoints,
JavaScript and specification layout, native architecture, codegen, registration, and delivery plan.

- **R-NATIVE-001:** Put new modern native components, TurboModules, and native services in
  `@fluentui-react-native/native-core` rather than creating another standalone package. Maintain existing native
  wrappers in their current packages unless the task explicitly requests a migration.
- **R-NATIVE-002:** Preserve public APIs and native registration names during maintenance and migration. Callout and
  FocusZone keep their existing public APIs and registration names after moving to native-core.
- **R-NATIVE-003:** Record native validation per platform and renderer as passed, failed, skipped, not run, or
  unsupported, with reasons (R-VALID-002). Native code is qualified only by building and exercising the affected native
  boundary; an upstream or JavaScript-only build does not qualify another host such as Office.

## Native-core boundaries

- Callout and FocusZone implementations live in native-core. Their former packages are JavaScript-only compatibility
  shims under `packages/shim/`. Their JavaScript wrappers live in `src/legacy` and are exported only from
  `@fluentui-react-native/native-core/legacy`, not the root entrypoint.
- Export shared APIs from the root only when equivalent implementations exist on every supported desktop host. Scope
  platform APIs to `macos`, `windows` (React Native Windows), `win` (Windows and Win32), or `win32`.
- Windows components are Fabric-only. macOS components support Paper and Fabric.
- Native applications must depend on native-core directly for native project discovery and autolinking.

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
  R-APPLE-007) for every iOS or macOS change, plus the macOS layout notes in the native-core README.
- Focus targets and native focus visuals: [common focus authoring](../focus/common.md) and its platform files.
- Accessibility actions: the [framework-base accessibility instructions](../../../packages/framework-base/src/accessibility/AGENTS.md)
  define the transport contract and its native qualification requirements.
