---
name: menu
platform: react-native (Windows, macOS)
implementation-platforms: macos
status: contract-reviewed
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Menu

**Reviewed macOS-first contract for #4232.** Independent coordinator review
approved the public API, behavior, source identities, native family protocol,
and semantic Popover composition boundary on 2026-10-02. This does not certify
the future component or native runtime qualification. The user decision
`macos-menu-first` on 2026-10-02 authorizes full pinned Menu behavior on macOS
first, with Windows and Win32 expressly gated. The same whole-component owner
has now authored the local implementation and coverage against delivered
native-family and semantic Popover declarations.
The coordinator-generated `spec/source.json` is preserved: one pinned
`flex-component` source, twenty planned requirements, contract-reviewed lifecycle,
reviewed conformance, and the 2026-10-02 pre-code review date.

The baseline is `c3a89b0b717a6bcc8c2104fdb11b733b1a725356`.
The authoring input remains `flex-1.5.0-206c4996`, canonical skill
`flex-components:menu`, invoked through the exposed `menu` alias.
See [source review](./spec/source-review.md) for identities and authority,
[feasibility](./spec/feasibility.md) for prerequisite decisions, and
[evidence planning](./spec/platform-evidence.md) for acceptance obligations.

## Scope

Menu coordinates a temporary collection of commands in a Popover-backed native
popup. Membership, navigation, submenu state, and action-close policy belong
to Menu. MenuItem continues to own row presentation and activation mechanics.
Callout owns popup transport, native dismissal, and native restoration.
These are distinct responsibilities, not interchangeable focus algorithms.

The macOS implementation goal includes character navigation, checkable commands,
pointer-driven row focus, natural Tab exit, native guarded restoration, and
submenus. These are **required macOS behavior**, not optional flat-menu
extensions. Two descendant submenu levels are the maximum below the root.
An opaque custom child, editor, independently interactive row descendant,
split action, modal trap, or mobile endpoint is outside this contract.

Windows/Win32 exclusion is an explicit delivery gate, not a feature-reduced
Menu, a claim that native Callout is unsupported, or evidence of cross-platform
readiness. Importing package exports remains safe; trying to use Menu or its
state/render pipeline on a non-macOS endpoint must throw a clear
unsupported-platform error before creating its trigger, entries, or popup,
even when closed. MenuEntry also requires a macOS Menu owner. No dead menu,
fake subtree, rejected-command fallback, or import-time exception substitutes
for this use-time guard. The coordinator owns guarded exports and discovery.

## Public contract

### Menu

`open?: boolean`, `defaultOpen?: boolean = false`, and
`onOpenChange?: (open: boolean) => void` govern self-driving open state.
Supplying `open`, including false, makes the axis controlled. A close request
cannot mutate that value or resurrect a native-hidden presentation.
`disabled?: boolean = false` guards trigger activation, not dismissal cleanup;
it does not implicitly disable commands in an already-open menu.

`position` reuses Popover's preferred-hint union and defaults to
`bottomLeftEdge`. `surfaceAccessibilityLabel: string` is required and names
the popup content, independently of the trigger. No fixed design width,
public popup handle, arbitrary anchor, context-point anchor, restore target,
Escape veto, initial-item override, modal option, or persistence flag is
exposed. A caller can request open from a shortcut or context gesture, but
placement still uses the live declared trigger, not the gesture's coordinates.

The public slots are `root`, `trigger`, and `content`.
The passive root is a native View; its React 19 top-level ref identifies that
View. Trigger is a narrowed native Pressable presentation/observer surface
matching Popover's trigger boundary, without `as`. Its ref identifies the
actual trigger and composes with anchor and focus refs. Content is a narrowed
View slot: children, ref, test identifier, style, and non-conflicting observers.
It cannot substitute an opaque component or override membership, role,
focusability, or key ownership. Omitted or null content is empty, never the
Popover placeholder. Content style is caller-last on its own View; the popup
boundary remains Menu-owned.

Content accepts `MenuEntry`, existing `MenuItem` with
`menuStyle="section-header"`, horizontal `Divider`, arrays, fragments, and
conditional empty nodes. Standalone interactive MenuItem is not automatically
registered: use the explicit adapter below. Runtime validation must diagnose
unsupported children and ambiguous identities, rather than silently flatten
unknown component output. An invalid entry cannot activate or register.
Headers and dividers retain their existing presentation and nonfocusability.

### MenuEntry: bounded MenuItem adapter

MenuEntry lives in this component's folder. Its pipeline reuses MenuItem's
state, style, and render stages and their **same native Pressable and same
FocusTarget**. No leaf edit, additional native wrapper, or second pressable
controller is authorized.

`itemId: string` and nonempty `content: string` are required.
Identity is unique among sibling entries and stable across reorder. A tree
path disambiguates equal IDs in different submenus. React keys should remain
stable too; an array index, label, attachment order, or renderer tag is not
identity. `textValue?: string` defaults to the primary content and supplies
the text searched by character navigation. It is not an accessible-name
override.

The adapter preserves MenuItem's optional leading/trailing presentation,
secondary text/position, selected visual, native ref, styles, and observers,
but owns list-item mode, membership, role aliases, focusability, key
descriptors, and submenu/selection indicators. `loading`, `menuStyle`,
raw `hasCheckmark` / `hasMultiselect` / `hasChevron`, native children, and
root `as` overrides are excluded. Decorative slots cannot contain another
focusable action. Do not expose private registration or render slots.

The reviewed adapter has three mutually exclusive entry kinds:

- A command may have externally supplied `selected` and
  `onAction?: (event?: MenuActionEvent) => void`.
- A checkable command adds `checkable: "radio" | "checkbox"` and required
  `selected: boolean`; radio additionally requires `selectionGroup: string`.
  `onAction` requests the caller's choice. No leaf or Menu-level automatic
  checked-value store is introduced. The caller coordinates radio peers.
- A submenu trigger supplies `submenu: MenuSubmenuContent`, a descriptor with
  required `surfaceAccessibilityLabel` and the same constrained content slot.
  It cannot also be checkable or carry a command `onAction`. Its self-driving
  axis is `submenuOpen` / `defaultSubmenuOpen = false` /
  `onSubmenuOpenChange`. A controlled submenu request never changes the prop.
  Only one sibling submenu can be presented; conflicting controlled true
  values are diagnosed, not arbitrarily rendered.

`MenuActionEvent` is a union of the original native press event and the
original native accessibility-action event, not a fabricated press.
The optional callback argument is **undefined only for genuine eventless
macOS Fabric onAccessibilityTap**. The user-approved/coordinator-ratified
2026-10-02 amendment covers MNU-001, MNU-003, MNU-009 and MNU-013 without
changing the pin, source identities, or requirement IDs.
`onPress`, key, focus, hover, tap and accessibility-action props remain observers.
For commands, the semantic action and original activation observer run once
before action-close, allowing the caller to move focus elsewhere. For a
submenu, activation requests expansion and forwards its original observer
without executing or closing a root command.

Checkable named Toggle/Select and submenu Expand/Collapse use the existing
shared accessibility resolver. They reach the appropriate semantic request
and original `onAccessibilityAction` once; they never synthesize `onPress`.
Real press invocation remains on the existing native Pressable path.
Eventless AX command activation calls onAction(undefined), then the caller's
onAccessibilityTap() once, then native guarded family close. It never calls
onPress or manufactures an event. Checkbox activation requests inversion of
externally supplied selected; radio activation requests selection, even when
already selected. Caller state is never changed internally.
Submenu eventless activation requests open only, then forwards its tap observer;
the root trigger toggles its open request then forwards its tap observer.
Disabled guards prevent owned effects but preserve tap observers once, like
other accessibility observers. Stale presentations also cannot invoke commands.
Actual default AX/UIA invocation is a separate native gate.

### Defaults and ownership

There is no Menu appearance/size axis, automatic selected-first policy, or
remembered-last-item policy. Every fresh presentation begins at its first
eligible command, including pointer and accessibility opening. This is an
explicit departure from V1's pointer-container opening policy. Selection
never follows focus. Checkable actions close the menu like other commands;
the V1 persistent-checkbox behavior is not adopted.

Disabled entries stay rendered with their native disabled semantics, but are
not keyboard destinations. This preserves current agentic MenuItem and differs
from V1 Win32's disabled-focusable rows. Empty/all-disabled content is a valid,
named popup with native Escape/light-dismiss handling and no invented enabled
row or automatic close-on-empty policy.

Private resolved state distinguishes requested open, committed anchor,
native presentation generation/visibility, ordered membership, registered
targets, pending focus intent, observed active row, submenu path, and caller
styles. A focus request is not native confirmation; an observed React focus
snapshot is not current active-window authority.

### Proposed explicit exports

Parent integration exports `Menu`, `MenuEntry`, their `useMenu_unstable` /
`useMenuStyles_unstable` / `renderMenu_unstable` and
`useMenuEntry_unstable` / `useMenuEntryStyles_unstable` /
`renderMenuEntry_unstable` pipelines, plus `MenuProps`, `MenuSlots`,
`MenuStateProps`, `MenuState`, `MenuPosition`, `MenuTriggerProps`,
`MenuContentProps`, `MenuEntryProps`, `MenuEntrySlots`, `MenuEntryState`,
`MenuCheckable`, `MenuActionEvent`, and `MenuSubmenuContent`.
These symbols are authored locally; package-root wiring is coordinator-owned.
Every use path retains the
macOS admission guard. No context, registry, private host slot, raw Callout
prop bag, native command, or style cache is an additional public export.

## Composition boundary

Reuse `usePopover_unstable`, `usePopoverStyles_unstable`, and
`renderPopover_unstable` rather than copying anchoring, open-session mounting,
theme/input attachment, or the stable overlay tree. After Popover styling,
Menu can attach its menu role and padding to the resolved private content
host through the public unstable state pipeline. That does **not** make the
host a public Menu slot or authorize a private-file import.

Popover's approved P1/P2 second argument now supplies a `menu-macos` host
policy, owner initial focus, presentation key, mounted binding ref and original
ready/context/movement callbacks. `getCurrent()` returns mounted/ready phase,
handle, anchor generation and AbortSignal; only ready has nativeGeneration.
Its external mode accepts the committed row nativeRef/mountGeneration and
existing FocusTarget lifetime witness without another trigger.
Menu uses exactly these declarations and the public unstable stages.
Preserve normal Popover behavior and reuse its open-session lifetime;
do not import private files, duplicate the overlay, export private slots, or
leak raw CalloutProps into Menu.

The approved macOS native-family direction retains `menuFocusManagement`,
`onReady`, `onDismissContext`, `focusInitialChild`, and `closeOwned`, and adds
`focusOwnedChild`, `submenu-back`, native Tab continuation, and
`onMenuPointerMove`. Native derives weak families from the actual anchor owner;
Menu supplies no family ID, arbitrary return target, or window snapshot.
The native additions are delivered and the coordinator reports 39 native
Callout unit cases, lint/build and Storybook prep/native macOS build passing.
Those prerequisite results are not Menu runtime or native-family behavior
qualification. See feasibility for the remaining actual transport/geometry
gates; no imaginary focus cancellation command or method is used.

## Conformance

All listed local files now exist. Runtime/type tests and named WDIO stories
are authored, not executed by this worker. All twenty IDs and planned paths
retain their coordinator-generated identities; metadata remains reviewed at
the pre-code level pending integrated execution and realized-contract review.
Each requirement cites the sole `flex-component` source for design goals.
Current FURN mechanisms, native-owner approval and proposed Popover options
are local realization/review evidence, not additional immutable source entries
or proof of native delivery. MNU-012 covers explicit admission gating and
the retained future Win32 compatibility invariant; it is not a Win32 pass.

| ID      | macOS-first contract obligation                                                                                                         | Planned evidence                                                                                                        |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| MNU-001 | Preserve controlled/uncontrolled open, activation guards, cleanup, and no-op suppression.                                               | `menu.types.ts`, `useMenu.ts`, `menu.test.tsx`, `menu.types.test.ts`                                                    |
| MNU-002 | Expose only declared roots/slots and validated collection content; empty means empty.                                                   | `menu.types.ts`, `menu.children.ts`, `renderMenu.tsx`, `menu.types.test.ts`                                             |
| MNU-003 | Reuse MenuItem stages with one root/target, external selection, exclusive entry kinds, and stable IDs.                                  | `menu-entry.types.ts`, `useMenuEntry.ts`, `menu-entry.test.tsx`, `menu-entry.types.test.ts`                             |
| MNU-004 | Compose root/trigger/entry/content refs and cancel stale registration/focus work.                                                       | `useMenu.ts`, `useMenuEntry.ts`, `menu.test.tsx`, `menu-entry.test.tsx`                                                 |
| MNU-005 | Focus the first committed eligible row using actual ready generation and guarded native confirmation.                                   | `useMenu.ts`, `menu.stories.tsx`, `spec/platform-evidence.md`                                                           |
| MNU-006 | Keep disabled rows accessible but nonfocusable; skip headers/dividers.                                                                  | `menu.children.ts`, `useMenuEntry.ts`, `menu.test.tsx`, `menu.stories.tsx`                                              |
| MNU-007 | Own vertical wrap, Home/End, logical submenu arrows, and original-event forwarding once.                                                | `menu.keyboard.ts`, `useMenu.ts`, `menu.test.tsx`, `menu.stories.tsx`                                                   |
| MNU-008 | Search by a printable character in committed sibling order without selection or activation.                                             | `menu.keyboard.ts`, `menu.test.tsx`, `menu.stories.tsx`                                                                 |
| MNU-009 | Preserve original native events and genuine eventless AX semantics; execute one action/choice request and observer before family close. | `useMenuEntry.ts`, `menu-entry.test.tsx`, `menu-entry.types.ts`, `menu-entry.types.test.ts`, `menu.stories.tsx`         |
| MNU-010 | Delegate bare Escape to native; child return and root action return use guarded native transactions.                                    | `useMenu.ts`, `menu.test.tsx`, `menu.stories.tsx`, `spec/platform-evidence.md`                                          |
| MNU-011 | Native Tab/Shift+Tab continue the original event in the natural owner loop; all outside/deactivation/teardown closes do not return.     | `useMenu.ts`, `menu.stories.tsx`, `spec/platform-evidence.md`                                                           |
| MNU-012 | Reject non-macOS Menu use explicitly; retain later Win32 native-first/default-restore parity with no override or managed dispatch.      | `useMenu.ts`, `menu.test.tsx`, `menu.stories.tsx`, `spec/platform-evidence.md`                                          |
| MNU-013 | Preserve named popup/items, checked/expanded state, exact named actions and real eventless trigger/command/submenu AX activation.       | `useMenu.ts`, `useMenuEntry.ts`, `menu.test.tsx`, `menu-entry.test.tsx`, `menu-entry.types.test.ts`, `menu.stories.tsx` |
| MNU-014 | Reuse Popover appearance/measurement/input boundary, overriding padding only; keep caller-last styles and immutable caches.             | `menu.styles.ts`, `useMenuStyles.ts`, `menu.test.tsx`, `menu.stories.tsx`                                               |
| MNU-015 | Genuine native displaced pointer movement clears keyboard hover suppression; leaving a row is not dismissal provenance.                 | `useMenu.ts`, `useMenuEntry.ts`, `menu-entry.test.tsx`, `menu.stories.tsx`                                              |
| MNU-016 | Anchor two submenu levels to live rows; native weak families preserve ancestors, sibling exclusion and RTL lifetime.                    | `useMenu.ts`, `renderMenuEntry.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                |
| MNU-017 | Child Escape/submenu-back returns only to its parent row; atomic family action permits root return only.                                | `useMenu.ts`, `menu.stories.tsx`, `spec/platform-evidence.md`                                                           |
| MNU-018 | Reconcile removal/disable/reorder with guarded owned-child repair; invalidate hidden controlled sessions.                               | `useMenu.ts`, `menu.test.tsx`, `menu.stories.tsx`                                                                       |
| MNU-019 | Preserve the shared macOS native ring policy and instant lifetime without local modality, focus timers or speculative motion tokens.    | `useMenuEntry.ts`, `useMenuStyles.ts`, `menu-entry.test.tsx`, `menu.stories.tsx`                                        |
| MNU-020 | Ratify full macOS behavior with non-skipped native and separate AX/action/announcement evidence; keep Windows/Win32 gates explicit.     | `menu.stories.tsx`, `menu.wdio.ts`, `spec/platform-evidence.md`                                                         |

## Divergences from Flex

The coordinator's 2026-10-02 pre-code approval governs these adaptations.
Canonical metadata IDs/statuses are preserved; this worker does not self-ratify
the realized implementation or waive a missing native requirement.

`menu-real-native-focus` adapts browser focus bookkeeping to committed native
targets. `menu-disabled-skipping` preserves agentic leaf eligibility rather
than V1 Win32 disabled stops. `menu-first-item-opening` chooses first-row entry
for all invocation modes. `menu-external-selection` leaves selection with the
caller, with no persistent-command option. `menu-safe-native-return` rejects
unconditional return after outside interaction, including the historical issue
wording that paired outside press with trigger restoration.

`menu-native-system-focus-visuals` follows the current shared policy instead of
the issue's older custom-only/native-ring prohibition. `menu-context-anchor`
bounds the first API to its declared trigger rather than point anchoring.
`menu-motion` proposes instant transitions pending meaningful native motion
tokens. Exact gap, shadow and containment remain explicit geometry/conformance
questions; the approved family delta does not repair them. Required submenu
geometry, Tab continuation, hover delivery, and family lifetime cannot be
waived merely to call this full macOS Menu. Windows/Win32 are an authorized
platform-admission gate; no new source release or reduced macOS feature set
follows from that decision. Existing canonical divergence IDs are preserved.

## Platform behavior

macOS Fabric is the first implementation and qualification target. Native
Callout owns ready generations, actual-anchor-derived weak families, bare
Escape, bare Tab/Shift+Tab with the original event/natural owner loop,
submenu-back return, atomic family action-close, current-owner child focus,
and scoped displaced pointer movement. Menu owns item order, navigation,
external selection, and self-driving open/submenu requests. MenuEntry retains
MenuItem's macOS keydown activation and native focus ring.

Native macOS Paper is a Callout regression obligation where supported, not an
automatic Menu readiness claim. Windows Fabric and Office Win32 Menu use are
gated until separately admitted. Windows still needs supported Tab continuation
and trustworthy family-input/light-dismiss handling; Win32 requires its own
host-owner and physical parity evidence.

For that later Win32 review, preserve existing native `setInitialFocus`,
Escape/dismissal and default restoration. Leave `onRestoreFocus` unset and add
no JS refocus or new managed commands to the prebuilt host. Source absence
does not imply native unsupported behavior. No endpoint has been qualified
by this local implementation, and no existing Win32 menu or Callout behavior
is changed.

## Local implementation and acceptance status

Menu/MenuEntry types, controller/context, slot stages, assembly, runtime/type
cases and typed WDIO stories are authored. Native Escape/Tab and family-close
remain solely native-owned. Every focus continuation checks ready phase,
native/anchor/target generations, live refs, work identity and the actual lease
signal. Close deliberately invalidates its lease; it is not mistaken for
initial-focus success or followed by JS restoration.

The initial screen-space hover transport gap was resolved during authoring by
the native owner's delivered `targetTag` field: native hit-tests the original
NSEvent, yielding the nearest eligible descendant in that popup or zero.
Menu matches that per-event identity against **current eligible row refs**,
never a saved hovered row or tag registry, and dispatches ref-based guarded
pointer focus. No coordinate guess, future hardware sampling or ordinary-focus
fallback is used. The coordinator reports the final hit-target schema
regeneration/native macOS build and all 47 native Callout unit cases passing.
Actual padded/disabled/replaced/cross-popup hit qualification is still required;
these prerequisite passes are not Menu native interaction results.

**Full macOS acceptance is pending.** Native geometry/AX/pointer-family evidence
and integrated execution are not replaced by the authored code or mock cases.
Default Fabric AX activation exposes an eventless onAccessibilityTap path,
now wired through the approved optional-event onAction contract. Its
[reviewed eventless native route](./spec/accessibility.md#default-ax-activation-amendment)
resolves the earlier event-shape implementation blocker, without a synthetic
activation event or Invoke fallback. Physical AX delivery, action counts,
checked/expanded projection and VoiceOver results remain qualification gates.
Parent owns exports, story type/discovery platform settings and serialized
commands. `contract-reviewed` remains; file existence does not establish
`implemented`, full pinned conformance, or native readiness.
