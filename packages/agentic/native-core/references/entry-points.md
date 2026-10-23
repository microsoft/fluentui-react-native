---
id: native-core.entry-points
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core/src
---

# Entry points

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

## Legacy components and shims

The existing unstyled `Callout` and `FocusZone` JavaScript wrappers, public
types, tests, stories, and specifications live under `src/legacy` and are
exported only from `@fluentui-react-native/native-core/legacy`. They are not
exported by the root entrypoint, which is reserved for modern cross-platform
APIs. The `macos` and `windows` now expose React 19 modern Callout/FocusZone previews,
live native targets, and typed operation outcomes. `win32` exposes constrained
modern `Callout` and `FocusZone` adapters over the host's legacy registrations
(see each `SPEC.md`); the root and `win` remain unadmitted for modern components.
Legacy Win32 uses its existing host registrations without new managed commands.

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

## Native project integration

Native applications must directly depend on this package for autolinking.
macOS now uses one `FRNNativeCore` pod, and Windows uses one
`FRNNativeCore.ReactPackageProvider` library for both components. Remove
explicit old `FRNCallout`/`RCTFocusZone` pod or standalone Windows project
references and regenerate the consuming native project/Pods. Win32 continues
to use its host-provided `RCTCallout` and `RCTFocusZone`.
