# Native Core

`@fluentui-react-native/native-core` is the shared home for new native-backed
components and non-UI native modules. JavaScript should generally be a thin,
typed wrapper around native behavior, not a second implementation of it.
Higher-order Fluent components, theming, and composition remain in their
existing packages and can consume this package without introducing a reverse
dependency.

## Current contents

The existing unstyled `Callout` and `FocusZone` JavaScript wrappers, public
types, tests, stories, and specifications live under `src/legacy` and are
exported only from `@fluentui-react-native/native-core/legacy`. They are not
exported by the root entrypoint, which is reserved for modern cross-platform
APIs. The `macos` and `windows` now expose React 19 modern Callout/FocusZone previews,
live native targets, and typed operation outcomes. The root, `win`, and
`win32` remain unadmitted for modern components. Legacy Win32 uses its existing
host registrations without new managed commands.

`@fluentui-react-native/callout` and `@fluentui-react-native/focus-zone` are
JS-only compatibility shims under `packages/shim`. Deprecated type aliases and
native registration names are preserved. The legacy entrypoint uses the
component-qualified `FocusZoneNativeProps`; the FocusZone shim retains its old
`NativeProps` name.

```ts
import { Callout, FocusZone } from '@fluentui-react-native/native-core/legacy';
import type { CalloutProps, FocusZoneProps } from '@fluentui-react-native/native-core/legacy';
```

Native implementations and shared codegen inputs remain outside `src/legacy`;
the legacy boundary applies to the JavaScript component API, not native
ownership or renderer support.

Native applications must directly depend on this package for autolinking.
macOS now uses one `FRNNativeCore` pod, and Windows uses one
`FRNNativeCore.ReactPackageProvider` library for both components. Remove
explicit old `FRNCallout`/`RCTFocusZone` pod or standalone Windows project
references and regenerate the consuming native project/Pods. Win32 continues
to use its host-provided `RCTCallout` and `RCTFocusZone`.

The macOS module-named header at `macos/shared/FRNNativeCore.h` is required by
the generated `FRNNativeCore-Swift.h`; keep it aligned with the pod's
`module_name` when changing native ownership.

## Public entrypoints

| Import                                       | Scope                                       | Source entrypoint      |
| -------------------------------------------- | ------------------------------------------- | ---------------------- |
| `@fluentui-react-native/native-core`         | Cross-platform APIs                         | `src/index.ts`         |
| `@fluentui-react-native/native-core/legacy`  | Legacy Callout/FocusZone wrappers and types | `src/legacy/index.ts`  |
| `@fluentui-react-native/native-core/macos`   | Modern macOS component previews             | `src/macos/index.ts`   |
| `@fluentui-react-native/native-core/windows` | Modern Windows component previews           | `src/windows/index.ts` |
| `@fluentui-react-native/native-core/win`     | APIs shared by Windows and Win32            | `src/win/index.ts`     |
| `@fluentui-react-native/native-core/win32`   | Office React Native Win32-specific APIs     | `src/win32/index.ts`   |

Each entrypoint explicitly exports components, module facades, and their
public types. The root does not re-export legacy or platform submodules;
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

Legacy wrappers live in `src/legacy/callout` and `src/legacy/focus-zone`, with
shared codegen inputs in `src/specs/components`. Reserve `src/components` for
modern wrappers and add module/internal directories as real features arrive:

```text
src/
  index.ts
  macos/index.ts
  windows/index.ts
  win/index.ts
  win32/index.ts
  legacy/
    index.ts                     Explicit legacy-only public exports
    callout/                     Existing Callout wrapper, types, tests, and stories
    focus-zone/                  Existing FocusZone wrapper, types, and tests
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

Node tests validate the six export maps, emitted JS/declaration files,
conditional resolution, shared native ownership, and JS-only shims. Colocated
Jest tests retain wrapper behavior, imperative refs/commands, slot acceptance,
and public type contracts; shim tests verify exact component identity.
Runtime and compile-time checks reject legacy component/type exports at root.
The package prebuild regenerates Windows bindings from the shared spec.
Native
verification must cover registration, events/commands, refs, unmount cleanup,
error propagation, and architecture/platform parity, not only JS mocks.
Callout's executable macOS Fabric story verifies native popup creation, `onShow` and
`onDismiss`, outside-click dismissal, and reopening. Run it together
with FocusZone's keyboard cases from `apps/storybook` using the owned lifecycle:

```sh
STORYBOOK_SMOKE_STORY='native-*' yarn storybook smoke --macos --mode stories-and-tests
```

This traverses the full catalog before running the selected native tests.
The macOS Desktop Driver currently targets Fabric; a successful Paper build
does not establish Paper runtime or input parity.

## Modern component previews

```tsx
import { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';
// Windows uses the equivalent /windows entrypoint.
```

These previews require React 19 and the current native-core registration.
`useNativeViewTarget` supplies a passive live callback binding; attach its
`ref` to a materialized native View. Rect/point anchors use local logical
coordinates relative to such a live owner, not global screen coordinates.

Callout's ref is an opaque-presentation command handle; `content.ref` is the
actual View ref. Controlled `open` is requested presence, and physical native
closure latches the generation until false-to-true or a changed
`presentationKey`. `onReady` is separate from legacy `onShow`. FocusZone
preserves its actual native root `ref` and publishes confirmed requests through
`commandsRef`. Neither ref assignment nor a void native focus return is
confirmation. Requests support abort and timeout, and reject stale lifetimes.

Modern and legacy facades use the same private host components and native
registrations. macOS shares Swift focus eligibility/actual-responder and
placement behavior between the renderer adapters; the existing navigation
algorithm is not rewritten merely to change language.

Windows source/codegen and the native library build are qualified on RNW 0.81.35.
Initial modern FocusZone command/target-lifetime and legacy navigation cases
pass; Windows Callout runtime and the remaining protocol/geometry cases are
still unqualified. Win32 legacy FocusZone cases pass, while its Callout
popup-operation automation remains unqualified.
Root/Win32 admission, older-peer builds, popup-family transactions,
restoration/Tab policy, text fragments, modal containment, and a real module
remain explicit gates. See the repository's `plans/modernization.md` for the
cross-machine progress and exact validation handoff.
