# Evidence, migration, and research provenance

[Guide](../../platform-divergence.md)

## Evidence standard

**Observed** means source inspected at a named revision, not executed native behavior.
**Historical** means an observation retained from the original study, not independently revalidated here.
**Inferred** means a conclusion requiring confirmation. **Proposed** means an API option, not current support.

The primary local baseline is FURN `ae22f89ce6bfa4e56b1f1eccdc6dbe73837cf9f3`.
The [lockfile](../../../../yarn.lock), local patch and source contracts establish the FURN package baseline.
Later upstream snapshots provide context, not a claim that FURN already runs those features.

| Source                 | Revision / scope                            | Use                                                          |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| Core React Native      | v0.81.6                                     | FURN comparison baseline                                     |
| Core nightly snapshot  | `cd2de187e8878119896159371225acbb9dfa5d9c`  | Windows source study baseline (0.89.0 nightly)               |
| Core releases          | v0.82.0 through v0.88.0 npm packages        | First stable release of each post-0.81 API                   |
| Core React Native      | v0.88.1 npm package, tag and changelog      | Latest stable comparison, flag defaults and Canary overrides |
| Core release candidate | v0.89.0-rc.1                                | Unreleased changes, reported separately                      |
| RNmacOS release        | `react-native-macos@0.83.0` (`19f618c0`)    | Newer macOS focus routing and key events                     |
| RNW and Win32 releases | `react-native-windows_v0.85.0` (`44614fd3`) | Newer RNW focus flag, key events and Win32 0.85.0 package    |
| RNmacOS source study   | `459c4e15de37205ee3bcd94db5dfe767a4e04d56`  | Broader upstream AppKit divergence                           |
| RNW source study       | `ae439afb21e77403eac009fff400aee6a831d968`  | Broader hosting/API divergence                               |
| Office source study    | `office/office/Office@8b0baa0708`           | Historical host overlay; private source not reread           |

Public upstream entry points:
[core View props](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/Libraries/Components/View/ViewPropTypes.js),
[RNmacOS tree](https://github.com/microsoft/react-native-macos/tree/459c4e15de37205ee3bcd94db5dfe767a4e04d56),
[RNW tree](https://github.com/microsoft/react-native-windows/tree/ae439afb21e77403eac009fff400aee6a831d968),
[Win32 package boundary](https://github.com/microsoft/react-native-windows/blob/ae439afb21e77403eac009fff400aee6a831d968/packages/@office-iss/react-native-win32/README.md).

## Complete migration

The three original `references/divergence` documents have moved here as source studies. They retain their topic
inventories and original evidence; new introductions explain their historical boundaries. macOS source links now
resolve to the pinned upstream repository rather than nonexistent FURN-relative paths.

| Original coverage                                                                                                        | Durable location                         | Reconciled interpretation                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| macOS sections 1-2: focus, keyboard, accessibility                                                                       | [macOS study](macos-source-study.md)     | [Capabilities](platform-capabilities.md), [focus](focus-proposal.md), [actions](accessibility-proposal.md) |
| macOS sections 3-4: windows, hosting, RCTUIKit                                                                           | Same study                               | [Surfaces](surfaces-proposal.md)                                                                           |
| macOS sections 5-10 and boundaries: pointer, editing, scroll/metrics, appearance, services, resolution                   | Same study, complete                     | [Capabilities](platform-capabilities.md#the-less-visible-divergence)                                       |
| Windows sections 1-4: focus, input, UIA, theme                                                                           | [Windows study](windows-source-study.md) | Capabilities, keyboard and accessibility proposals                                                         |
| Windows sections 5-8: windows, embedding, extensions, sizing                                                             | Same study                               | Surface/host proposals                                                                                     |
| Windows sections 9-11, boundary notes and footnotes                                                                      | Same study, complete                     | Capabilities and endpoint restrictions                                                                     |
| Office sections 1-4: scope, builds and host abstraction                                                                  | [Office study](office-source-study.md)   | [Office overlay](office-hosting.md)                                                                        |
| Office sections 5-7: every lifecycle, bundle and injection subcase                                                       | Same study, complete                     | Office lifecycle/sharing and service taxonomy                                                              |
| Office sections 8-14: UI, containers, specialized hosts, Android stack, queues, engines, tooling, diagnostics, reach-ins | Same study, complete                     | Office taxonomy and upgrade gates                                                                          |
| Office sections 15-17: ten risk groups, five open questions and source index                                             | Same study, complete                     | Revalidation gates; none silently closed                                                                   |

## Corrections from independent research

The synthesis does not adopt several overbroad historical or draft interpretations:

- Core 0.81.6 has focus events and text-input focus, but lacks View focus/blur commands and generic View key
  events. The inspected command declarations appear from v0.83.0; key declarations follow in v0.84.0 with Android
  implementation reported. All three inspected desktop packages already route focus to ordinary views.
- In 0.88.1, ordinary-View `ref.focus()` and View key events remain behind default-off flags with no OSS Stable or
  Canary override. Canary-only and flag-gated APIs are not stable defaults, and the 0.89.0-rc.1 changes are not
  stable. The [core API evolution](core-api-evolution.md) article records availability for each API.
- Core 0.82.0 removes the New Architecture opt-out, and core 0.86.0 no longer ships the Paper JavaScript renderer,
  which appears only in a package comparison. DOM ref methods apply to Fabric refs, not Paper refs such as Win32's.
  RNmacOS 0.83.0 forces the New Architecture under CocoaPods, so FURN's macOS Paper lane is an upgrade decision.
- `enableImperativeFocus` is a native flag that JavaScript overrides cannot set. iOS Views gate first-responder
  acceptance on it only from 0.86.0.
- Core keeps the platform-specific iOS `isDarkerSystemColorsEnabled` and Android `isHighTextContrastEnabled`
  queries from before 0.81; the gap is a forced-colors or cross-platform contrast preference, not any contrast
  query. The 0.89.0-rc.0 iOS Show Borders query is a shape preference.
- Version boundaries were corrected after review: the `parentNode` fix is 0.87.0 with a 0.86.3 backport, ref
  `EventTarget` dispatch is gated in 0.86.0 and Canary from 0.88.0, and accessibility order is Experimental from
  0.83.0 and Canary from 0.87.0.
- Core 0.81.6 declares experimental pointer callbacks, not universally qualified pointer support. Its host/surface
  and platform-specific segment-loading seams are existing foundations, not new Office inventions.
- Newer declarations do not establish support on every backend or prove a particular pull request landed.
- The unpatched RNmacOS Fabric gap is distinct from FURN's patched behavior. Patch non-propagation does not prove
  that Office lacks an equivalent fix.
- RNW also declares annotations and access-key metadata; these are not universally Win32-only features.
- Office V1 sharing and the gated Apple parallel-V2 sharing path do not imply one host per feature identity
  everywhere. Different native and JS pins are a compatibility question, not automatically a contradiction.
- Apple JSC provenance remains inconsistent in the original study. Office architecture deployment remains unknown.
- Native focus confirmation can use actual state, including already-focused targets, rather than always requiring
  a new event. Key fallback must not reinterpret a known physical code as an unrelated logical key.
- Shared conformance fixtures need endpoint-specific runners; RNTester or headless renderer tooling cannot
  automatically execute private Win32 host behavior.

## Review provenance

Two independent whole-scope investigations used **Astra (`gpt-6-astra`)** and
**Opus 5.5 (`claude-opus-5.5`)**, both with **maximum reasoning and long context**, followed by reciprocal
review in the original threads. The coordinator reconciled their reports into these articles.

Both models also reviewed the assembled guide. Astra found no material remaining issues; Opus requested explicit
release boundaries and recognition of existing Android accessibility and bundle-loading seams. Those corrections
are incorporated above and in the proposals.

The update for core 0.88.1 was reviewed by the same two agents. Opus found an unstated New Architecture baseline,
overbroad contrast and DOM-ref claims, a native-only flag described as overridable and version boundaries to correct;
Astra found availability-level and iOS action-label omissions. The coordinator verified each finding against the
npm packages, changelog and fork sources before applying it. Complete reports and reviews remain in the private research record;
durable findings and sources are included here so readers do not depend on those artifacts.
No private source bodies were imported. Office identifiers were carried from the supplied source study; their
publication should be reviewed before merging this research into a public default branch.

## Qualification and next research gates

This work performed static research, not code execution. Native builds, physical input, UIA/AX action invocation,
Narrator/VoiceOver speech and actual Office application integration were **not run**.
Historical qualification statements in source studies do not change that status.

For future work, choose an upstream target revision and minimal capability scope before prototyping.
Core can validate schemas, command lifetime and renderer invariants, then native reference implementations can
validate actual behavior. The [RNTester platform-test precedent](https://reactnative.dev/blog/2022/12/13/pointer-events-in-react-native)
shows how shared fixtures can exercise cross-platform semantics; it is not proof that the proposed APIs exist.
Keep current FURN gates in
[native-core remaining work](../../../../packages/agentic/native-core/references/remaining-work.md) and
[component remaining work](../../../../packages/agentic/components/references/remaining-work.md).
