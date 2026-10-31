---
id: native-core.architecture
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core/src
  - packages/agentic/native-core/macos
  - packages/agentic/native-core/windows
---

# Architecture

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

## Native layout and host policy

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
Windows Fabric native component reference (`native.windows-fabric`)
and verify APIs against the installed RNW version.
Win32 integration is separate from React Native Windows Paper support; adding
a Win32 export does not authorize a second RNW view-manager implementation.

Component renderer support and TurboModule availability are separate
capabilities. Do not infer module availability solely from Fabric being
enabled. Modules own their native threading, resource cleanup, event
subscriptions, and cancellation contracts; wrappers preserve those contracts
and expose native failures.

## macOS Swift interoperability

The macOS module-named header at `macos/shared/FRNNativeCore.h` is required by
the generated `FRNNativeCore-Swift.h`; keep it aligned with the pod's
`module_name` when changing native ownership. Fabric adapters and shared
Objective-C behavior, such as FocusZone's use of the Swift focus service, may
import the generated header. Paper `RCT_EXTERN_MODULE` registration files and
the headers they import must not: hosts that compile the Swift sources with an
Objective-C bridging header also get internal Swift classes declared there,
duplicating the extern interfaces. Implement Paper manager methods in Swift
and declare them with `RCT_EXTERN_METHOD`; custom property bridges use React or
AppKit types and the narrow manager protocol in `FRNCalloutManager.h`. Follow
the repository's Apple and Office authoring rules (`native.apple-office`)
for every macOS change.

## Shared facades and host implementations

Modern and legacy facades share the native registrations; Callout's facades
also share a hook-free private host that applies native-safe positioning and
appearance values. Both modern facades are phased components: the first phase
owns hooks and the presentation/command lifetime, and the hook-free render
phase merges render-time pass-through props. When a modern facade is used as
a slot, supply its first-phase props (listed in each `SPEC.md`) through the
slot props. macOS shares Swift focus eligibility/actual-responder and
placement behavior between the renderer adapters; the existing navigation
algorithm is not rewritten merely to change language.
