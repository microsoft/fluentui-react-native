# Native Core

`@fluentui-react-native/native-core` is the shared home for new native-backed
components and non-UI native modules. JavaScript should generally be a thin,
typed wrapper around native behavior, not a second implementation of it.
Higher-order Fluent components, theming, and composition remain in their
existing packages and can consume this package without introducing a reverse
dependency.

## Quick start

Native applications must depend on this package directly for autolinking. macOS uses one `FRNNativeCore` pod and
Windows uses one `FRNNativeCore.ReactPackageProvider` library; regenerate the consuming native project or Pods after
adding it. Win32 uses the Office host's existing `RCTCallout` and `RCTFocusZone` registrations.

The existing `Callout` and `FocusZone` wrappers are exported from the `legacy` entry point:

```ts
import { Callout, FocusZone } from '@fluentui-react-native/native-core/legacy';
import type { CalloutProps, FocusZoneProps } from '@fluentui-react-native/native-core/legacy';
```

React 19 modern previews are exported per platform:

```tsx
import { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';
// Windows uses the equivalent /windows entrypoint.
```

The root entry point is reserved for APIs with equivalent behavior on every supported desktop host.

## Documentation

| Topic                                                                         | Covers                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Entry points](references/entry-points.md)                                    | Public entry points, legacy wrappers, compatibility shims, and autolinking |
| [Modern components](references/modern-components.md)                          | Modern Callout and FocusZone behavior and per-platform qualification       |
| [Architecture](references/architecture.md)                                    | JavaScript, specification, and native layout and host policy               |
| [Codegen, registration, and publishing](references/codegen-and-publishing.md) | Codegen identity, registration names, and the published archive            |
| [RNmacOS patch](references/rnmacos-patch.md)                                  | The repository-local React Native macOS accessibility patch                |
| [Contributing](references/contributing.md)                                    | Delivery, validation commands, native stories, and the Apple probe         |
| [Remaining work](references/remaining-work.md)                                | Open qualification and admission gates                                     |

The [reference index](references/README.md) lists every reference by ID. Agents working in this package start from
[AGENTS.md](AGENTS.md).
