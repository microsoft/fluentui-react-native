---
id: native-core.remaining-work
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
---

# Remaining work

Open native-core work. Completed work is removed rather than marked done; qualified behavior is documented in
[modern components](modern-components.md) and each component's `SPEC.md`.

## Qualification and admission gates

Root and Win32 admission, older-peer builds, popup-family transactions, restoration and Tab policy, text fragments,
modal containment, and a real module remain explicit gates. Each is tracked by an issue under the
[Components](https://github.com/microsoft/fluentui-react-native/issues/4274) and
[Infrastructure](https://github.com/microsoft/fluentui-react-native/issues/4275) workstreams:

| Gate                                                                                                        | Issue                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Native FocusZone request races, inactive windows, field editors, and parity-preserving navigation follow-up | [#4374](https://github.com/microsoft/fluentui-react-native/issues/4374)                                                                          |
| Callout geometry, lifecycle/resource, and assistive-technology qualification                                | [#4375](https://github.com/microsoft/fluentui-react-native/issues/4375)                                                                          |
| Win32 capabilities, old peer floors, packed consumers, publishing, and root admission                       | [#4376](https://github.com/microsoft/fluentui-react-native/issues/4376)                                                                          |
| Popup families, owner-relative Tab/restoration, and disabled MenuItem discoverability                       | [#4377](https://github.com/microsoft/fluentui-react-native/issues/4377)                                                                          |
| Renderer-owned text fragments and layout generations                                                        | [#4378](https://github.com/microsoft/fluentui-react-native/issues/4378)                                                                          |
| Modal focus scope and background accessibility isolation                                                    | [#4379](https://github.com/microsoft/fluentui-react-native/issues/4379)                                                                          |
| Office Win32 host popup continuation, lifecycle, and accessibility capabilities                             | [#4384](https://github.com/microsoft/fluentui-react-native/issues/4384)                                                                          |
| Representative TurboModule, deferred until a real consumer exists                                           | [#4380](https://github.com/microsoft/fluentui-react-native/issues/4380)                                                                          |
| Dialog and Drawer components that consume these primitives                                                  | [#4222](https://github.com/microsoft/fluentui-react-native/issues/4222), [#4223](https://github.com/microsoft/fluentui-react-native/issues/4223) |

Each issue retains the applicable baseline, native qualification limits, and
acceptance criteria. Record exact executed commands and results in the owning
issue or pull request; compilation and skipped cases are not native qualification.

## RNmacOS upstream replacement

- **Outcome:** consumers receive the macOS accessibility fixes without this repository's RNmacOS patch.
- **Current state:** the [repository-local patch](rnmacos-patch.md) is applied only to this repository's native hosts;
  publishing native-core or components does not install it in a consumer.
- **Done when:** the fixes land upstream or in an equivalent consuming-renderer integration, and the same native cases
  pass against that replacement before the patch is removed. Checked-state actions, AX relationships, and VoiceOver
  speech remain separate, still-unqualified semantics.
