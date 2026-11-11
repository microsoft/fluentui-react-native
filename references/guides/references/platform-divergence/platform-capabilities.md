# Platform capabilities and version boundaries

[Guide](../../platform-divergence.md) | [Evidence](evidence.md)

## What was compared

FURN's [lockfile](../../../../yarn.lock) pins core RN 0.81.6, RNmacOS 0.81.9, RNW 0.81.35 and
`@office-iss/react-native-win32` 0.81.9. Its
[RNmacOS patch](../../../../packages/agentic/native-core/references/rnmacos-patch.md) is part of the inspected
behavior. Consumers do not acquire that patch merely by installing a FURN package.

The retained [macOS study](macos-source-study.md) instead inspects RNmacOS
`459c4e15de37205ee3bcd94db5dfe767a4e04d56`; the [Windows study](windows-source-study.md) inspects RNW
`ae439afb21e77403eac009fff400aee6a831d968` against core
`0.89.0-nightly-20261002-cd2de187e`. Both were authored November 11, 2026.
Their "current" claims belong to those revisions, not to FURN's dependencies.

## Interaction, semantics, and presentation

| Topic                  | macOS                                                                                                 | Windows / RNW                                                                         | Win32                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Focus                  | First responder, key-view loop, key-window activation, focus rings; click-focus follows AppKit policy | Focus reasons, `TryFocus`, island entry/restore and focus search                      | Polite/aggressive focus commands; actual native behavior depends on host                               |
| Keyboard ownership     | Handled-key matching by logical key; native responder handling is separate from JS bubbling           | Descriptors use code and routing phase; native handling differs from JS propagation   | Similar JS descriptor shape, but unknown key codes and host transport need qualification               |
| Accessibility          | AX roles/actions; FURN's patch repairs specific Fabric role/state and text-input projections          | UIA patterns and collection metadata, access keys, annotations                        | Relationships and annotations; `accessibilityPositionInSet` differs from RNW's `accessibilityPosInSet` |
| Popup surface          | AppKit child popup; native window can be key without becoming main                                    | Composition portal/island with Windows App SDK popup bridge                           | Host-provided `RCTCallout`; no demonstrated equivalent general-purpose window API                      |
| Legacy/export boundary | Fabric Modal presentation excluded in the inspected implementation despite JS export                  | Popup/Flyout exports do not imply Fabric implementation; Glyph belongs to legacy XAML | Alert prompt throws; SafeArea fallback and View-inside-Text restriction matter                         |

Core 0.81.6 has focus events and text-input focus, but no View `focus`/`blur` command. All three inspected desktop
packages route `focus()` to ordinary views through platform-specific command/bookkeeping changes. Upstream View
command declarations are present from the inspected v0.83.0 release; generic `onKeyDown`/`onKeyUp` declarations
follow in v0.84.0, whose changelog reports Android support, not all-platform implementation.
Therefore both imperative focus and keyboard events need version and backend qualifiers. Core also declares
experimental pointer events (marked not yet ready in 0.81.6), accessibility, native embedding, and surfaces. Desktop divergence is frequently
implementation, ownership, or platform scope rather than invention of an entirely new API.

Evidence: [core 0.81.6 View props](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/Libraries/Components/View/ViewPropTypes.js),
[newer core View props](https://github.com/facebook/react-native/blob/cd2de187e8878119896159371225acbb9dfa5d9c/packages/react-native/Libraries/Components/View/ViewPropTypes.js),
[focus evidence](../../../agents/focus/platform-evidence.md),
[accessibility evidence](../../../agents/accessibility/action-transport-evidence.md), and the retained source studies.
These are static observations; action declaration is not action execution.

## The less visible divergence

The original studies remain useful beyond focus and popups. Their following topics are retained in full:

| Concern                  | Platform-specific boundary to investigate                                                                                                | Source inventory                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Pointer and drag/drop    | Auxiliary clicks, hover/leave, cursors, tooltips, drops and paste; a drop target is not a drag source                                    | macOS sections 5-6; Windows sections 2 and 9    |
| Text editing             | AppKit substitutions/grammar/ghost text and editor settings; Windows submit keys and clear-on-submit; Win32 inline-view restrictions     | macOS section 6; Windows section 9              |
| Scrolling and dimensions | AppKit overlay scrollers and root versus key-window metrics; island scale and sizing; Win32 non-font dimensions may be undefined         | macOS section 7; Windows section 8              |
| Appearance               | Increase Contrast is not forced colors; AppKit dynamic/effect colors and vibrancy; RNW AppTheme resources; Office host theming/gradients | macOS section 8; Windows section 4              |
| Dialogs and lifecycle    | Native alerts/sheets, linking, application activation/hiding, host back navigation; keyboard/status-bar facilities are not universal     | macOS sections 9-10; Windows section 11         |
| Native extensions        | AppKit/RCTUIKit integration, RNW host/island/window APIs, legacy XAML versus Fabric registration, additional host controls               | macOS sections 3-4; Windows sections 5-7 and 10 |
| Resolution               | `macos` is not an implicit `ios` fallback; `win32` is not an implicit `windows` fallback                                                 | Both source studies' platform-identity sections |

The table records the research scope, not a new verification claim for every historical feature.
Use the pinned source inventories in [macOS](macos-source-study.md) and [Windows](windows-source-study.md) to
recheck the exact renderer before depending on an item.

## Avoid false equivalence

The Win32 JS package depends on an Office-owned native framework; its public declarations cannot establish native
parity. RNW running in a Win32 application is a different endpoint. Office's historical Fabric configuration uses
the `windows` platform identity, so platform resolution alone does not establish which host registered a component.

FURN's [Storybook lanes](../../../../apps/storybook/AGENTS.md) distinguish macOS Paper/Fabric, Windows Fabric and
REX Win32 Paper. REX is a test host, not evidence that an Office application supports the same integration.
Root admission, optional capabilities and runtime readiness must remain separate
([native-core entry points](../../../../packages/agentic/native-core/references/entry-points.md)).

When upgrading, record package and native-host revisions, local patches, renderer, registration and test lane.
Then rerun native input, accessibility projection and action invocation separately. Do not silently promote old
Win32 0.81.8 observations to execution evidence for 0.81.9.
