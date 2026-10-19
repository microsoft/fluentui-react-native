---
name: popover
platform: react-native (Windows, macOS)
status: contract-reviewed
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Popover

## Scope

Popover presents structured, optionally interactive content in a nonmodal
native popup anchored to a trigger. It owns the popup's requested presence,
trigger wiring, entry focus, dismissal reporting, and surface appearance.
Native-core's modern Callout owns placement, the separate popup window, light
dismissal, and focus confirmation.

Popover has one visual type and no size, appearance, or state axis. It is not a
Tooltip (single-line labels), Dialog (blocking decisions), or Menu (command
lists with selection semantics). Rect and point anchors, context opening, and
modal containment are outside this contract.

## Public contract

### Props and defaults

| Prop           | Type                               | Default  | Contract                                                                                                                                   |
| -------------- | ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`         | `boolean`                          | absent   | When supplied, requested presence is externally driven. `false` and omission are distinct.                                                 |
| `defaultOpen`  | `boolean`                          | `false`  | Starting requested presence while internally driven.                                                                                       |
| `onOpenChange` | `(open, data: { reason }) => void` | absent   | Reports user-driven changes. `reason` is `trigger` (the trigger toggled it) or `dismiss` (native light dismissal, anchor loss, or detach). |
| `placement`    | `top \| bottom \| start \| end`    | `bottom` | Preferred side relative to the trigger. Logical sides follow layout direction.                                                             |
| `align`        | `start \| center \| end`           | `center` | Alignment along the trigger edge.                                                                                                          |
| `trigger`      | Button props                       | required | The component-owned trigger slot.                                                                                                          |
| `surface`      | View props with `ref`              | `{}`     | The floating surface that hosts `children`.                                                                                                |
| `children`     | React nodes                        | required | Popover content.                                                                                                                           |

The root is a structural, non-accessible `View`. It accepts owned `ViewProps`
and a stable `ref`; a caller `style` applies after the root's structural
style. Caller-driven `open` changes never call `onOpenChange`.

### Slots and anatomy

The render order is the root, the trigger, then the native popup containing
the surface and its content.

| Slot      | Rendered when          | Contract                                                                                                                                     |
| --------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`    | always                 | A `View` whose `ref` stays stable across presentations.                                                                                      |
| `trigger` | always                 | A FURN `Button`. Popover composes its press, expanded state, hint, anchor ref, and focus target with caller props and refs.                  |
| `surface` | the popup is presented | The native popup's content View. It owns fill, stroke, radius, and padding, carries the accessible name, and its `ref` is null while closed. |

The native presentation handle and the theme input boundary inside the surface
are private. Content refs inside `children` attach only while presented.

### Requirements

- **POP-001:** Resolve the documented defaults, required trigger and content,
  and root, trigger, and surface props and refs, with caller styles last.
- **POP-002:** Keep requested presence controllable in both directions. Native
  presence is authoritative: a native dismissal reports `dismiss` and stays
  closed (latched) while requested presence remains true, until it becomes
  false then true or the trigger requests opening again. A press on the
  trigger while open closes without reopening.
- **POP-003:** Anchor the popup to the trigger's live native view on the
  requested logical side and alignment, offset by the token gap, and rely on
  native placement for flipping and work-area clamping. Render no arrow.
- **POP-004:** After the native presentation reports readiness, request focus on
  the first eligible content on every open; when none exists, make the surface
  a focus stop and focus it. Observe the native outcome and never confirm focus
  with a fixed delay or a void `focus()` return.
- **POP-005:** Escape, outside pointer input, application deactivation, and
  anchor loss close the popup. Escape and a caller-driven close of a focused
  presentation return focus to the live trigger; outside pointer input leaves
  focus where the input put it. Tab stays within the popup.
- **POP-006:** Expose the trigger's expanded state from actual presence and a
  popup hint; expose the surface as a named group, warn in development when its
  name is missing, and keep closed content out of the accessibility tree and
  tab order.
- **POP-007:** Resolve the surface's fill, stroke, radius, and padding from Flex
  tokens, apply native elevation, and apply the caller surface style last.
- **POP-008:** Warn in development when a Popover renders inside another
  Popover's surface.
- **POP-009:** Present through native-core's modern Callout on macOS (Paper and
  Fabric) and Windows Fabric. Other hosts throw a descriptive error on use.
  Do not export Popover publicly until it qualifies on all four desktop
  endpoints.

## Platform behavior

macOS and Windows present the surface in a separate native popup window owned
by the trigger's window. Presentation does not move focus by itself; Popover
requests entry focus after the native readiness event. Native placement flips
to the opposite side when the preferred side does not fit and clamps to the
work area on both axes.

Native light dismissal is authoritative: Escape in focused content, pointer
input outside the popup and its anchor, and application deactivation close the
popup before Popover is notified. Pointer input on the trigger does not
light-dismiss; the trigger's own press toggles the popup. Closing a focused
popup returns key input to the owner window's retained focus, and Popover then
returns focus to the trigger for Escape and caller-driven close.

The popup window has no native backdrop material: the surface View draws the
Flex fill, stroke, and rounded silhouette, and the native window shadow follows
that silhouette. Windows popup silhouette, shadow, and anchor-press ordering
require their own qualification.

Office Win32 uses host-provided legacy views and has no modern adapter yet, so
Popover throws there and its stories are excluded from Win32 Storybook until
the native-core Win32 route (#4384) exists. iOS and Android are unsupported.
Because all desktop endpoints ship together, Popover is not exported from the
package root until that route is qualified.

## Divergences from Flex

| ID                         | Disposition | React Native contract                                                                                                                                                               | Follow-up                                                    |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `popover-arrow`            | Deferred    | No arrow is rendered; the modern native popup has no beak geometry.                                                                                                                 | Revisit with a native beak and silhouette-aware shadow.      |
| `popover-motion`           | Deferred    | Presentation is instant, which equals the reduced-motion behavior. Flex motion is pending.                                                                                          | Revisit when Flex motion is final and native popups animate. |
| `popover-group-semantics`  | Accepted    | The surface is a named group, not a dialog: React Native Windows maps no dialog role. The trigger exposes expanded state and a hint; has-popup and controls have no typed property. | Adopt native relationships if the renderers add them.        |
| `popover-tab-containment`  | Deferred    | Tab and Shift+Tab move within the popup and wrap; Escape is the keyboard exit. Flex permits closing at the boundary with natural continuation.                                      | Adopt when owner-relative continuation lands (#4377).        |
| `popover-native-elevation` | Accepted    | The native popup window shadow provides elevation instead of drawing `shadow.low`, which a window sized to its content would clip.                                                  | Revisit if native-core supports inset shadow geometry.       |
| `popover-edge-margin`      | Deferred    | Native clamping aligns the popup with the work-area edge without the small margin Flex suggests.                                                                                    | Add a native margin under #4375.                             |
| `popover-trigger-slot`     | Accepted    | The trigger is a component-owned Button slot instead of a wrapped arbitrary child, so refs and handlers compose without cloning children.                                           | Composite components add an external-trigger binding.        |

## Conformance

The listed files exist for every requirement. macOS Fabric and Paper qualify the native behavior; Windows Fabric and
the Win32 route (#4384) must still qualify, so POP-009 evidence stays planned in `spec/source.json`.

| Requirement | Evidence                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------- |
| POP-001     | `popover.types.ts`, `usePopover.ts`, `popover.test.tsx`, `popover.types.test.ts`             |
| POP-002     | `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                                   |
| POP-003     | `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                                   |
| POP-004     | `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                                   |
| POP-005     | `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                                   |
| POP-006     | `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                                   |
| POP-007     | `popover.styles.ts`, `usePopoverStyles.ts`, `popover.test.tsx`                               |
| POP-008     | `usePopover.ts`, `popover.test.tsx`                                                          |
| POP-009     | `popoverNative.ts`, `popoverNative.macos.ts`, `popoverNative.windows.ts`, `popover.test.tsx` |
