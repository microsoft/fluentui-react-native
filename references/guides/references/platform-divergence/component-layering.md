# Component layering: Callout, FocusZone, and Dropdown

[Guide](../../platform-divergence.md) | [Platform baseline](platform-capabilities.md)

These are static observations at the FURN revision in [evidence](evidence.md), not new runtime qualification.

## How divergence is contained

FURN uses platform files, scoped package entry points, runtime admission checks, capability records, typed
operation outcomes, renderer patches, and constrained adapters over legacy hosts. These are complementary:
an import can be valid while an optional operation is unsupported, and a registered component can still be unready.

The [native-core entry-point contract](../../../../packages/agentic/native-core/references/entry-points.md)
keeps its root separate from platform previews.
[`modernHost.ts`](../../../../packages/agentic/native-core/src/internal/modernHost.ts) checks platform/React/
registration; it is not a negotiated feature protocol.
[`popupHost.types.ts`](../../../../packages/agentic/components/src/common/popupHost.types.ts) captures known popup
differences for higher-level components. Neither mechanism justifies a success-shaped no-op.

Framework-base owns interaction and focus targets, design owns scene modality and appearance, native-core owns
native presentation/navigation, and components own selection and disclosure policy.
[`RootInputBoundary`](../../../../packages/agentic/design/src/theming/RootInputBoundary.tsx) connects popup input
to its existing scene; React context alone is not native input attachment.

## Callout: presentation is not a View ref

The [facade](../../../../packages/agentic/native-core/src/components/callout/Callout.tsx) separates a presentation
handle from content, coordinates operations with attachment generations, and latches native closure until rearm.
[Native targets](../../../../packages/agentic/native-core/src/components/nativeTarget.ts) and
[operations](../../../../packages/agentic/native-core/src/components/nativeOperation.ts) reject stale work.
Cancellation prevents a pending operation from being accepted; it does not promise to undo an already performed
native action.

| Endpoint           | Mechanism                                             | Consequential distinction                                                                                 |
| ------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| macOS Paper/Fabric | Shared AppKit child popup; separate renderer adapters | Can be key, not main; Paper orders commands after view updates; Fabric mounts through a proxy             |
| Windows Fabric     | Portal/island and `DesktopPopupSiteBridge`            | Native owner/input integration and Tab continuation; legacy focusWindow/blurWindow remain unimplemented   |
| Win32 Paper        | JS adapter over baked host Callout                    | View anchors only; constrained focus; no equivalent last/close/reposition commands; Tab returns to anchor |

Sources: [macOS shared behavior](../../../../packages/agentic/native-core/macos/components/Callout/shared/CalloutView.swift),
[popup window](../../../../packages/agentic/native-core/macos/components/Callout/shared/CalloutWindow.swift),
[Windows implementation](../../../../packages/agentic/native-core/windows/NativeCore/components/Callout/Callout.cpp),
[Win32 adapter](../../../../packages/agentic/native-core/src/components/callout/Win32Callout.tsx).

Win32's unclassified dismissal requires a 250 ms hold to disambiguate trigger toggles. That workaround is not a
portable lifecycle contract. Readiness, focus acceptance, native closure, restoration and Tab continuation should
remain distinct outcomes.

## FocusZone: traversal is not modal containment

The [facade](../../../../packages/agentic/native-core/src/components/focus-zone/FocusZone.tsx) preserves the native
root separately from command access. macOS uses AppKit responder/key-view and geometric traversal; its Fabric
adapter hosts a tagless shared implementation. Windows has native Home/End and remembered entry.
Win32 first/last requests are constrained by its host rather than synthesized as successful modern operations.

Sources: [AppKit zone](../../../../packages/agentic/native-core/macos/components/FocusZone/shared/RCTFocusZone.m),
[Windows zone](../../../../packages/agentic/native-core/windows/NativeCore/components/FocusZone/FocusZoneComponentView.cpp),
[Win32 adapter](../../../../packages/agentic/native-core/src/components/focus-zone/Win32FocusZone.tsx).

Keyboard traversal, keyboard focus, accessibility focus/order and modal tree isolation are different capabilities.
Do not infer a trap or modal experience from cycling navigation. Confirmation also needs actual native focus:
AppKit field-editor behavior and Windows root-owner activity checks are not equivalent to a void JS `focus()` call
([common focus guidance](../../../agents/focus/common.md)).

## Dropdown: policy above primitives

[`dropdownPopup.tsx`](../../../../packages/agentic/components/src/components/dropdown/dropdownPopup.tsx)
waits for readiness and chooses an eligible selected/recently toggled option, a first/last option, or the surface.
It composes Callout, FocusZone and ListboxItem; options take real focus. Root, trigger focus target and popup anchor
are distinct identities. Platform adaptations include Windows width flooring, macOS Paper scrolling behavior and
explicit Win32 entry-focus handling.

[`useDropdown`](../../../../packages/agentic/components/src/components/dropdown/useDropdown.ts) owns selection and
semantic state. [`usePopupPresence`](../../../../packages/agentic/components/src/common/usePopupPresence.ts) and
[`usePopupTrigger`](../../../../packages/agentic/components/src/common/usePopupTrigger.ts) coordinate closure,
rearm, trigger races and guarded restoration. They are component policy, not reasons to extend the native host
with Fluent-specific concepts.

The relevant history is the agentic family, not the older experimental Dropdown:

| Commit                                | Change                                           | What it does not establish                                                      |
| ------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `60121de61` (October 21, 2026; #4386) | Introduced popup families and shared foundations | Intermediate type-ahead wording is not the final contract; Dropdown excludes it |
| `a82c68a82` (October 29; #4414)       | Contract/non-input value coverage                | Does not close physical-input reentry gates                                     |
| `06b458f48` (November 2; #4429)       | Color-read changes                               | No additional focus/action qualification                                        |
| `da2b62ca2` (November 7; #4466)       | Declared input-lane changes                      | No automatic Narrator/VoiceOver or Office qualification                         |

The [Dropdown contract](../../../../packages/agentic/components/src/components/dropdown/SPEC.md) and
[remaining work](../../../../packages/agentic/components/references/remaining-work.md) take precedence over a
historical commit description's shorthand.

## Accessibility: three separate questions

Does a node project the intended role/state? Can a native action reach the handler? Does the resulting experience
work with assistive technology? These need separate evidence.
[`resolveAccessibilityAction`](../../../../packages/framework-base/src/accessibility/resolveAccessibilityAction.ts)
normalizes known platform action transport; arbitrary custom actions must keep their identity.
The [RNmacOS patch](../../../../packages/agentic/native-core/references/rnmacos-patch.md) repairs selected projection
and text behavior, not every action or activation difference.

Source research identified verification questions, **not reproduced bugs**:

- Windows Dropdown may expose ExpandCollapse from expanded state without the declarations required by native
  action dispatch. Invoke the UIA pattern and check exactly one state change.
- Windows Home/End may be owned by both JS option handling and native FocusZone. Record native handling and
  resulting focus, including boundaries and nested zones.
- Win32 option position may be lost between `accessibilityPosInSet` and the package's
  `accessibilityPositionInSet`/`aria-posinset` transport. Read UIA PositionInSet after updates.

Do not use these hypotheses to silently change component contracts in this documentation task.
The [accessibility proposal](accessibility-proposal.md) describes how portable conformance tests could expose such
differences before they reach a component.
