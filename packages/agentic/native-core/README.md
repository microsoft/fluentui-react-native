# Native Core

`@fluentui-react-native/native-core` is the shared home for new native-backed
components and non-UI native modules. JavaScript should generally be a thin,
typed wrapper around native behavior, not a second implementation of it.
Higher-order Fluent components, theming, and composition remain in their
existing packages and can consume this package without introducing a reverse
dependency.

## Current contents

The root exports the existing unstyled `Callout` and `FocusZone` wrappers and
their public types. Their JS, tests, specifications, macOS implementations,
and Windows Fabric implementations live here. The `macos`, `windows`, `win`,
and `win32` entrypoints are reserved for future host-specific APIs and remain
empty; shared components belong to the root.

`@fluentui-react-native/callout` and `@fluentui-react-native/focus-zone` are
JS-only compatibility shims under `packages/shim`. Deprecated type aliases and
native registration names are preserved. The root uses the component-qualified
`FocusZoneNativeProps`; the FocusZone shim retains its old `NativeProps` name.

Native applications must directly depend on this package for autolinking.
macOS now uses one `FRNNativeCore` pod, and Windows uses one
`FRNNativeCore.ReactPackageProvider` library for both components. Remove
explicit old `FRNCallout`/`RCTFocusZone` pod or standalone Windows project
references and regenerate the consuming native project/Pods. Win32 continues
to use its host-provided `RCTCallout` and `RCTFocusZone`.

## Public entrypoints

| Import                                       | Scope                                   | Source entrypoint      |
| -------------------------------------------- | --------------------------------------- | ---------------------- |
| `@fluentui-react-native/native-core`         | Cross-platform APIs                     | `src/index.ts`         |
| `@fluentui-react-native/native-core/macos`   | macOS-specific APIs                     | `src/macos/index.ts`   |
| `@fluentui-react-native/native-core/windows` | React Native Windows-specific APIs      | `src/windows/index.ts` |
| `@fluentui-react-native/native-core/win`     | APIs shared by Windows and Win32        | `src/win/index.ts`     |
| `@fluentui-react-native/native-core/win32`   | Office React Native Win32-specific APIs | `src/win32/index.ts`   |

Each entrypoint explicitly exports components, module facades, and their
public types. The root is not an umbrella export of the platform submodules;
`win` is not an umbrella export of `windows` and `win32`. Give an API its
narrowest applicable public home. Shared implementation does not itself make
an API cross-platform.

Root exports require equivalent implementations on all supported desktop
hosts: macOS, React Native Windows, and Win32. Additional platform support
must be stated and verified per API; this initialization does not promise
iOS or Android support. A `win` export must work on both Windows hosts,
despite their potentially different native implementations.

Keep platform imports behind the corresponding entrypoint and implementation
file. Importing one entrypoint must not initialize another platform's native
components or module registry. Keep schemas, generated bindings, registration,
and internal helpers private; the export map deliberately disallows deep
imports. Never use wildcard re-exports.

## JavaScript and specification layout

Component wrappers live in `src/components/callout` and
`src/components/focus-zone`, with codegen inputs in `src/specs/components`.
Add module and internal utility directories as real features arrive:

```text
src/
  index.ts
  macos/index.ts
  windows/index.ts
  win/index.ts
  win32/index.ts
  components/
    <name>/
      <Name>.tsx                  Thin public wrapper, when shared
      <Name>.types.ts             Public props, events, commands, and refs
      <Name>.<platform>.tsx       Platform binding when needed
      <Name>.test.tsx             Wrapper behavior tests
      <Name>.types.test.ts        Public type contract
      SPEC.md                    Supported platforms and renderer behavior
  modules/
    <name>/
      <Name>.ts                   Typed public facade over a native module
      <Name>.<platform>.ts        Platform binding when needed
      <Name>.test.ts              Facade and error propagation tests
      SPEC.md                    Availability, threading, events, and lifetime
  specs/
    components/
      <Name>NativeComponent.ts    Fabric props, events, and native commands
    modules/
      Native<Name>.ts            TurboModule interface
  internal/                      Private shared boundary utilities, as needed
```

Use React Native codegen-compatible schemas as the JS/native source of truth.
Keep public ergonomic props separate from the lower-level native schema only
when translation is necessary. Native component wrappers forward props,
events, commands, children, and native refs; module facades normalize only
the behavior needed for the public contract.

Use `.macos`, `.windows`, and `.win32` implementation files for real host
differences. `win` is a package scope, not a Metro platform extension. Keep
React Native fork imports out of the shared TypeScript type graph; use
platform-specific files or platform-neutral shapes. Missing required native
registrations must surface a descriptive error, not a no-op component or a
success-shaped module fallback.

## Native layout and architecture

The planned native layout separates UI components from non-UI modules and
shares platform behavior below the renderer adapters:

```text
macos/
  components/<Name>/
    shared/                      AppKit view and behavior
    fabric/                      Fabric component-view adapter
    paper/                       Temporary Paper view-manager adapter
  modules/<Name>/               TurboModule implementation and required glue
  shared/                       Platform utilities used by multiple features
  registration/                 Component and module provider wiring
windows/
  NativeCore/
    components/<Name>/          Fabric component views
    modules/<Name>/             TurboModule implementations
    shared/                     C++/WinRT platform utilities
    registration/               ReactPackageProvider wiring
    codegen/                    Generated Windows bindings, never hand-edited
win32/                          Host-specific integration, only when needed
FRNNativeCore.podspec            macOS sources and native dependencies
react-native.config.cjs          Native project discovery/autolinking
```

| Host                             | Native component policy                                                                       | Non-UI module policy                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| React Native Windows (`windows`) | Fabric only; no new Paper view managers or fallback path                                      | TurboModules, with host support verified per module                                |
| macOS (`macos`)                  | Both Paper and Fabric initially; Fabric-only long term                                        | TurboModules; add narrowly scoped legacy-host glue only when required and verified |
| Office Win32 (`win32`)           | Explicit host contract per feature; do not assume the RNW Fabric implementation is compatible | Explicit host registration and module availability per feature                     |

On macOS, Paper and Fabric adapters must expose the same props, events,
commands, refs, and behavior while delegating to shared AppKit logic.
Keep Paper-specific code in `paper/` and guard native compilation with the
host's architecture configuration. Retire that adapter after supported macOS
hosts become Fabric-only, without changing the public JS API.

The Windows component project must require the New Architecture and fail
clearly for a Paper build. Use the repository's
[Windows Fabric native component reference](../../../.github/skills/agentic-component-authoring/references/windows-fabric-native-components.md)
and verify APIs against the installed RNW version.
Win32 integration is separate from React Native Windows Paper support; adding
a Win32 export does not authorize a second RNW view-manager implementation.

Component renderer support and TurboModule availability are separate
capabilities. Do not infer module availability solely from Fabric being
enabled. Modules own their native threading, resource cleanup, event
subscriptions, and cancellation contracts; wrappers preserve those contracts
and expose native failures.

## Codegen, registration, and publishing plan

The shared native build metadata follows this organization:

1. Use one package-level codegen identity, `FRNNativeCoreSpec`, with
   `type: "all"` and `jsSrcsDir: "src/specs"` so components and modules remain
   distinct in source but share a generation boundary.
2. Name component schemas `<Name>NativeComponent.ts` and module schemas
   `Native<Name>.ts`. Prefix native registration names with `FRNNativeCore`
   for new APIs to avoid collisions. Migrated Callout and FocusZone retain
   their existing Fabric and Paper names for compatibility. Keep names
   identical in the schema, generated interface, registration, and JS binding.
3. Configure Windows with both `componentsWindows` and `modulesWindows`
   generators and `windows/NativeCore/codegen` output. Apple codegen should
   run through the consuming macOS app's Pod integration. Inspect each
   platform's generated schema and provider list so platform-only APIs do
   not require registration on unrelated hosts.
4. Leave `includesGeneratedCode` unset unless generated artifacts for every
   supported native platform are deliberately shipped and verified. It is
   not a Windows-only switch and can prevent Apple code generation.
5. The macOS podspec includes both components' shared and Paper sources.
   Fabric component views retain their `RCT_NEW_ARCH_ENABLED` guards. Paper
   managers remain available for existing bridge interoperability until the
   supported macOS hosts are Fabric-only. Windows declares `RnwNewArchOnly`
   and registers both components through one package provider.
6. Keep native targets and required generated outputs in the published
   archive. The `files` allowlist includes `src`, `lib`, `macos`,
   `windows`, `win32`, podspecs, and `react-native.config.cjs`. Intermediate
   native build artifacts, tests, and machine-local project output must not
   leak into it.
7. Verify the packed package in consuming hosts before replacing an existing
   package. Migrations are separate changes with compatibility evidence, not
   implicit effects of adding this workspace.

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

Node tests validate the five export maps, emitted JS/declaration files,
conditional resolution, shared native ownership, and JS-only shims. Colocated
Jest tests retain wrapper behavior, imperative refs/commands, slot acceptance,
and public type contracts; shim tests verify exact component identity.
The package prebuild regenerates Windows bindings from the shared spec.
Native
verification must cover registration, events/commands, refs, unmount cleanup,
error propagation, and architecture/platform parity, not only JS mocks.
