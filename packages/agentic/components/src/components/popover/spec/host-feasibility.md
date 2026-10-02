# Bounded Popover host P and prospective Menu FM

**Decision state:** bounded contract approved and local recovery authored,
not native qualification. The following capability assessment is the
pre-repair baseline snapshot. Evidence was
read at `c3a89b0b717a6bcc8c2104fdb11b733b1a725356`; no native command ran.
P remains unqualified. FM has useful building blocks but no complete,
approved portable interface.

The coordinator assigned a separate native foundation owner for Menu
prerequisites. Popover consumes only the existing Callout target/dismiss
protocol; no prospective lifecycle/focus API is assumed implemented or reviewed.

## Actual interface, not inferred support

`packages/native/Callout/src/Callout.types.ts` declares `target`, preferred
direction, `setInitialFocus`, `onShow`, reasonless `onDismiss`,
Win32 `onRestoreFocus({nativeEvent: {containsFocus}})`, capture options,
and imperative `focusWindow` / `blurWindow`.
The generated schema adds a target tag to events, not a dismiss reason,
live focus target, activity snapshot, or readiness generation.
The wrapper maps a ref to a numeric tag only when the target object changes.

| Required capability    | macOS Callout / RNmacOS Fabric                                                             | Windows Fabric Callout / RNW                                                                      | Office Win32                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Anchored content host  | Ref target resolved to native View; separate popup/proxy and touch attachment              | Portal popup, first-child layout sizing, numeric anchor and work-area calculation                 | Host-supplied `RCTCallout`; declarations/repository precedent, no host source or fresh run |
| Show notification      | `onShow` after ordering front and optional key-window request                              | `onShow` after popup show, island focus request, `First` navigation                               | Declared `onShow`; event timing unverified                                                 |
| Specific initial child | Native View focus command and focus events exist; Callout itself selects no child          | Native item ref path exists; Callout unconditionally requests `First`, not an owner-selected item | Existing ref focus foundation and leaf hooks; native popup target routing unverified       |
| Window focus commands  | Paper and Fabric forward to popup/parent `makeKey`                                         | Both handlers `nyi`                                                                               | Declared host command surface, not a confirmed result or guarded restoration               |
| Popup key delivery     | Fabric View emits key events from first responder and supports native handled-key entries  | Normal View key props and portal island exist; actual popup delivery/cancellation unqualified     | V1 handlers provide compatibility scenarios; prebuilt host popup delivery unverified here  |
| Escape                 | `cancelOperation` dismisses; a handled popup child key can prevent AppKit default handling | No explicit Escape branch; platform light-dismiss action is not a reason-rich Escape event        | Host behavior not established from declarations                                            |
| Outside click          | Local left-button monitor dismisses and returns original event                             | `InputLightDismissAction.Dismissed` hides popup                                                   | Capture/dismiss props declared; exact destination/event order unverified                   |
| App deactivation       | Observer dismisses on application resignation, with no reason                              | No explicit component deactivation observer or reason                                             | Unverified                                                                                 |
| Restoration context    | No `onRestoreFocus` emission; parent key command is unconditional                          | No `onRestoreFocus` emission or window commands                                                   | `containsFocus` declaration does not distinguish outside click, Escape, or deactivation    |

Declarations, source implementation, unit assertions, and executed native
results are different evidence levels. The Windows standalone Callout stories
are excluded in `apps/storybook/storybook.config.mts`; the documented Fabric
host failures remain a P blocker, not evidence that all portal transport is
impossible. New Popover/Menu consumers must not be hidden to manufacture a pass.

## Exact evidence anchors

Paths below are repository-relative unless marked installed. The retained
`callout-native` provenance identifies unchanged host source bytes; the
`recovery-baseline` entry identifies current focus/input/story plumbing.

- `packages/native/Callout/src/Callout.tsx:27-55`: command forwarding and
  target effect with `[target]`, without tracking `.current` replacement.
- `packages/native/Callout/src/CalloutNativeComponent.ts:41-70`: show,
  dismiss, restore-focus event shapes and the two generated window commands.
- `packages/native/Callout/macos/CalloutView.swift:33-45,142-218,390-424`:
  key-window commands, show, outside click/application resignation, reasonless
  callback, popup/proxy ownership.
- `packages/native/Callout/macos/CalloutWindow.swift:21-37`: key/not-main
  window and Escape `cancelOperation`.
- `packages/native/Callout/macos/FRNCalloutManager.m:50-84` and
  `macos/RCTCalloutComponentView.mm:103-132,177-221`: Paper/Fabric command
  registration, proxy touch attachment, show/dismiss forwarding only.
- `packages/native/Callout/windows/Callout/Callout.cpp:132-140,181-273,297-379`:
  missing commands, queued show lifetime, reasonless hide, unconditional
  first navigation, anchor/work-area positioning.
- `packages/framework-base/src/hooks/focusTarget.ts:1-29,123-166`,
  `useFocusTarget.ts:17-53`, and `useFocusablePressable.native.ts:35-181`:
  live mounted targets, generation/cancellation and request/event distinction,
  self-focus, native activation ownership; no active-window service.
- `packages/framework-base/src/component-patterns/useSlot.ts:45-66,88-112`:
  required slots pre-expand phased hooks; optional slots keep a normal mounted
  component boundary.
- `packages/agentic/design/src/theming/RootInputBoundary.tsx:13-17` and
  `useRootInputProps.ts:18-88`: popup event attachment to an existing controller,
  not a focus-ready or window-activity service.
- Installed RNmacOS 0.81.9
  `React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm:1758-1804,1808-1860`:
  first-responder command/events, key emission and native handled-key matching.
- Installed RNW 0.81.35
  `Microsoft.ReactNative/Fabric/Composition/CompositionViewComponentView.cpp:465-477,1361-1405`
  and `RootComponentView.cpp:83-110,141-183`: the ordinary View `focus`
  command selects a target in its owning root and attempts island activation;
  key emission uses the original source and native handled descriptors match
  `code` and modifiers. These are real child-target building blocks even
  though Callout's separate window commands are `nyi`.
- `packages/components/Menu/src/MenuPopover/useMenuPopover.ts:48-51,72-96`
  and `packages/components/ContextualMenu/src/ContextualMenu.tsx:39-55`:
  V1 ownership assumptions and historical timing workaround. The timer is
  deliberately not adopted.
- `packages/agentic/components/src/components/menu-item/useMenuItem.ts:39-88`
  and `menu-item.types.ts:77-97`: enabled list-item ref/focus path; section
  headers and disabled leaves are not focusable. No Menu registration context.

## FM ownership and minimum prospective interface

Menu can own eligible-item registration, stable item identity, one navigation
owner, action/selection and owner-originated close reasons. Its live
`FocusTarget.requestFocus(intent)` path is preferable to a naked tag.
Apply committed eligibility first and treat only observed focus as confirmed.
A ref's existence, `onShow`, key-window activation, or a returned void command
does not prove readiness or focus success.

The existing Windows child-ref route can request focus without calling
Callout's unimplemented `focusWindow`. It is therefore incorrect to infer
that a window-command repair is always necessary. Conversely, RNW stores
focus and emits a focus event after attempting island activation without
exposing that activation result through this JS contract. FocusTarget can
also report an already-observed target as confirmed. Neither fact establishes
that its window is currently active. macOS can retain a first responder in
an inactive window as well. Window/activity eligibility remains a separate
missing fact for guarded restoration.

These are **requirements for an owner-approved host interface**, not existing
APIs or implementation promises:

| Needed interface fact                                                                                                         | Why existing data is insufficient                                                                                                                 | Smallest accountable action                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current host/content attachment and usable window generation, with cancellable selected-target request and focus confirmation | `onShow` has no layout/attachment guarantee; Windows races with automatic first navigation, macOS chooses no descendant                           | Native/focus owner approves a ready/attachment handshake or demonstrates the exact child-ref plus show/layout path. Change Callout only where demonstrated missing; no timer retry. |
| Origin/reason and focus ownership at dismissal                                                                                | All Windows/macOS native dismiss paths collapse into one reasonless callback; `containsFocus` is absent there and insufficient by itself on Win32 | Add native reason/context at each dismissal origin and carry host generation through the event. Do not infer reason from blur order or scene modality.                              |
| Active intended return window and live eligible target, preserving an outside-click destination                               | FocusTarget has no native active-window identity. macOS parent `makeKey` steals activation; Windows commands are missing                          | Native/focus owner scopes guarded window/target restoration or activity observation. Return explicit requested/confirmed/cancelled/unsupported outcomes.                            |
| Popup-local key ownership and native cancellation for required Escape/arrows/Tab                                              | React ancestry does not guarantee key delivery; native Escape can dismiss before JS reason ownership                                              | Approve endpoint-specific handled-key registration/event routing, then qualify actual popup keys. Repair native emission only if that supported path fails.                         |

Owner-originated selection or close actions can retain their own known reason,
but cannot classify native outside click/deactivation after the fact.
The safe policy for an unknown/native reason is **no restoration**, not a
default restore. That prevents focus theft but does not satisfy Menu's required
Escape return; it is a documented blocker, not a complete reduced Menu.

There is no basis for requiring a new process-global focus manager, importing
production FocusZone, reviving Native Lib wholesale, polling the automation
driver, or installing global key monitors. Window commands may need a repair,
but implementing `focusWindow` alone does not solve target readiness, reason
classification, or restoration eligibility.

**Coordinator disposition:** bounded Popover recovery was independently
approved on 2026-10-01. The minimal native/focus interface work above is
separately assigned and must be reviewed and integrated before accepting FM.
If an endpoint cannot provide it, record that endpoint as blocked and
obtain an explicit scope decision. Do not silently claim #4232 complete.

## Planned endpoint evidence

P needs actual anchors, popup content, constrained/scaled geometry, scene
theme/modality, action projection, and attachment/ref/session cleanup on
macOS, Windows Fabric, and Win32. FM subsequently needs keyboard/pointer/AX
invocation to a chosen eligible item; empty/all-disabled and removal cases;
popup-local Escape and navigation; outside-click destination preservation;
application/window deactivation; guarded restoration, event order, and
exactly-once action counts.

Use typed named WDIO callbacks with isolated cases, explicit capability
skips, and native state/geometry observations. Observe owned popup content
without changing focus; selecting/activating a popup to discover it would
invalidate initial-focus evidence. Record endpoint versions, actual target
identity, Keyboard navigation setting on macOS, and pass/fail/skip totals.
This session executed zero native cases and makes no readiness claim.
