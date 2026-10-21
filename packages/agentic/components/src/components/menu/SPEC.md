---
name: menu
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Menu

## Scope

Menu presents a command collection of MenuItem rows and Dividers in a nonmodal
native popup anchored to a trigger. It owns requested presence, the popup
family of up to two submenu levels, entry focus, Home/End and type-ahead
navigation, hover-open submenus, activation dismissal, and focus return.
Native-core's modern Callout owns placement, the separate popup windows, light
dismissal, Tab exit, and focus confirmation; its modern FocusZone owns wrapping
arrow navigation.

Menu has no visual axis. It is not a Popover (free-form content), a Dropdown
(value selection), or a navigation surface. Context-menu opening and point
anchors are deferred to #4383. Modal containment is out of scope.

## Public contract

### Props and defaults

| Prop                 | Type                               | Default          | Contract                                                                                                                               |
| -------------------- | ---------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `open`               | `boolean`                          | absent           | When supplied, requested presence is externally driven. `false` and omission are distinct.                                             |
| `defaultOpen`        | `boolean`                          | `false`          | Starting requested presence while internally driven.                                                                                   |
| `onOpenChange`       | `(open, data: { reason }) => void` | absent           | Reports user-driven changes. `reason` is `trigger`, `dismiss` (light dismissal, Tab, anchor loss, or detach), or `action` (a row ran). |
| `placement`          | `top \| bottom \| start \| end`    | `bottom`         | Preferred side of the root menu relative to the trigger. Logical sides follow layout direction.                                        |
| `align`              | `start \| center \| end`           | `center`         | Alignment of the root menu along the trigger edge.                                                                                     |
| `disabledFocusable`  | `boolean`                          | platform default | Whether disabled rows stay focusable. Windows and Win32 default to `true`; macOS defaults to `false`. A row's own prop wins.           |
| `submenuOpenOnHover` | `boolean`                          | `true`           | Whether pointer hover opens and switches submenus.                                                                                     |
| `submenuOpenDelay`   | `number` (ms)                      | platform default | Hover time on a submenu row before its submenu opens. macOS 100 ms; Windows the system menu show delay (400 ms fallback).              |
| `submenuCloseDelay`  | `number` (ms)                      | platform default | Hover time on another row before an open submenu closes or switches. macOS 300 ms; Windows the system menu show delay.                 |
| `trigger`            | Button props                       | required         | The component-owned trigger slot.                                                                                                      |
| `surface`            | View props with `ref`              | `{}`             | The root menu surface that hosts `children`.                                                                                           |
| `children`           | React nodes                        | required         | MenuItem and Divider elements.                                                                                                         |

The root is a structural, non-accessible `View` with owned `ViewProps` and a
stable `ref`; a caller `style` applies after the root's structural style.
Caller-driven `open` changes never call `onOpenChange`.

A MenuItem declares a submenu through its `submenu` prop (MenuItem MNI-007):
View props with `ref` for the submenu surface plus its MenuItem and Divider
`children`. A submenu has the same surface styling, navigation, and dismissal
as the root menu, anchors to its row, and is private to the Menu that renders
the row.

### Slots and anatomy

The render order is the root, the trigger, then the native popup containing
the surface, a private vertical focus zone, and the rows.

| Slot      | Rendered when          | Contract                                                                                                                       |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `root`    | always                 | A `View` whose `ref` stays stable across presentations.                                                                        |
| `trigger` | always                 | A FURN `Button`. Menu composes its press, expanded state, hint, anchor ref, and focus target with caller props and refs.       |
| `surface` | the popup is presented | The root popup's content View. It owns fill, stroke, radius, and padding, carries the menu name, and its `ref` is null closed. |

The native presentation handle, focus zone, input boundary, and submenu
popups are private.

### Requirements

- **MNU-001:** Resolve the documented defaults, required trigger and children,
  and root, trigger, and surface props and refs, with caller styles last.
  Warn in development for text or host-primitive direct children.
- **MNU-002:** Keep requested presence controllable in both directions with
  Popover's latch: a native dismissal reports `dismiss` and stays closed while
  requested presence remains true, until it becomes false then true or the
  trigger requests opening again. A row activation reports `action`. A press
  on the trigger while open closes without reopening.
- **MNU-003:** Anchor the root popup to the trigger on the requested logical
  side and alignment, and each submenu to its row on the inline-end side with
  start alignment, offset by the token gap. Rely on native placement for
  flipping, RTL, and work-area clamping.
- **MNU-004:** After native readiness, a keyboard or accessibility open
  focuses the first focusable row. A pointer open focuses the menu surface
  without highlighting a row; the first Down or Up then focuses the first or
  last row. Confirm each focus request through its native outcome.
- **MNU-005:** Arrow Up and Down move between focusable rows and wrap; Home and
  End focus the first and last; a printable character focuses the next row,
  after the current one and wrapping, whose label starts with it. Section
  headers and Dividers are never focus stops; disabled rows are reachable only
  while disabled-focusable.
- **MNU-006:** Activating a row without a submenu runs its `onPress` once,
  closes the whole family, reports `action`, and returns focus to the trigger.
  Escape closes only the deepest popup; at the root it returns focus to the
  trigger. Tab and Shift+Tab close the whole family and return focus to the
  trigger. Outside pointer input closes the family and returns focus to the
  trigger unless the input focused another control. Application deactivation
  and anchor loss close without moving focus.
- **MNU-007:** A row with a submenu opens it on Enter, Space, or the
  inline-end arrow and focuses its first row; a pointer press toggles it
  without moving focus. The inline-start arrow, or Escape, in a submenu closes
  it and focuses its row. At most one submenu is open per level; opening a
  sibling replaces it. Submenus nest at most two levels below the root; a
  deeper submenu warns in development and does not open.
- **MNU-008:** With hover opening enabled, hovering a submenu row opens it
  after the open delay, and hovering another row of the same menu closes or
  switches an open submenu after the close delay. A hovered row becomes the
  focused row while the menu holds keyboard focus. Hover never opens the root
  menu, and timers are cancelled on close, replacement, and unmount.
- **MNU-009:** Rows inherit the menu's `disabledFocusable` default; disabled
  rows announce their disabled state and refuse every activation path.
- **MNU-010:** Expose the trigger's expanded state from actual presence and a
  menu hint; expose each surface with the `menu` role and a name (defaulting
  to the trigger or row label); expose submenu rows' expanded state; keep
  closed content out of the accessibility tree and tab order.
- **MNU-011:** Resolve each surface's fill, stroke, and radius from Popover's
  bindings with Menu padding and no row gap, size it to the widest row, apply
  native elevation, and apply caller surface styles last.
- **MNU-012:** Present through native-core's modern Callout and FocusZone on
  macOS (Paper and Fabric) and Windows Fabric, and through its Win32 Callout
  and FocusZone adapters on Office Win32. Other hosts throw a descriptive error
  on use. Do not export Menu publicly until it qualifies on all four
  desktop endpoints.

## Platform behavior

Each popup is a separate native window owned by its parent: the trigger's
window for the root menu, and the row's popup for a submenu. Input inside a
submenu does not dismiss its ancestors. Native light dismissal is
authoritative; Menu then reconciles its family and focus. Native-core's
`tabNavigation: 'dismiss'` closes the root presentation when Tab or Shift+Tab
reaches any popup in the family.

macOS handles Home and End, type-ahead, and submenu arrows in Menu policy
through the rows' key events; the native FocusZone handles Up and Down.
Windows handles Home and End natively. Pointer opens on macOS follow AppKit
menus by focusing the menu surface without a highlighted row.

Office Win32 presents each popup through native-core's Win32 Callout adapter
without initial focus, so Menu focuses the entry row itself. The host's
FocusZone handles Up and Down; Menu handles Home and End by focusing the first
or last focusable row. Tab or Shift+Tab in any popup closes the family and
focuses the trigger. The Win32 host reports a pointer leave together with its
enter, so a pending submenu open or switch there survives the leave and is
replaced only by hovering another row, as in native Windows menus. iOS and
Android are unsupported.

## Divergences from Flex

| ID                        | Disposition | React Native contract                                                                                                                                                       | Follow-up                                                    |
| ------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `menu-pointer-entry`      | Accepted    | A pointer open focuses the menu surface without highlighting a row, following native menus (D03). Keyboard and accessibility opens focus the first row.                     | None.                                                        |
| `menu-trigger-slot`       | Accepted    | The trigger is a component-owned Button slot; context, icon, and shortcut triggers are not offered.                                                                         | Context opening under #4383.                                 |
| `menu-submenu-prop`       | Accepted    | A submenu is declared through MenuItem's `submenu` prop rather than a nested Menu, so row props stay typed as MenuItem props.                                               | None.                                                        |
| `menu-hover-open`         | Accepted    | Hover opens and switches submenus after platform default delays, with overrides (D07). Flex does not specify hover.                                                         | None.                                                        |
| `menu-submenu-intent`     | Deferred    | macOS uses delay-only hover switching; native pointer-travel tolerance toward an open submenu is not implemented.                                                           | Add a native submenu-intent signal.                          |
| `menu-semantics`          | Accepted    | The trigger exposes expanded state and a hint; has-popup and controls have no typed property (D12). The surface name defaults to the trigger label rather than a reference. | Adopt native relationships if the renderers add them.        |
| `menu-disabled-focusable` | Accepted    | Disabled rows stay focusable by default on Windows and Win32 and opt in on macOS (D06, R2).                                                                                 | None.                                                        |
| `menu-native-elevation`   | Accepted    | The native popup window shadow provides elevation, as for Popover.                                                                                                          | Revisit with native inset shadow geometry.                   |
| `menu-motion`             | Deferred    | Presentation is instant, which equals the reduced-motion behavior.                                                                                                          | Revisit when Flex motion is final and native popups animate. |
| `menu-edge-margin`        | Deferred    | Native clamping aligns popups with the work-area edge without a margin.                                                                                                     | Add a native margin under #4375.                             |

## Conformance

The listed files exist for every requirement. macOS Fabric and Paper, Windows Fabric, and the Win32 adapters qualify the
native behavior in the Menu stories.

| Requirement | Evidence                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| MNU-001     | `menu.types.ts`, `useMenu.ts`, `menu.test.tsx`, `menu.types.test.ts`                                                        |
| MNU-002     | `menuFamily.ts`, `menu.test.tsx`, `menu.stories.tsx`                                                                        |
| MNU-003     | `useMenu.ts`, `menuSubmenu.tsx`, `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                       |
| MNU-004     | `menuFamily.ts`, `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                       |
| MNU-005     | `menuNavigation.ts`, `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                   |
| MNU-006     | `menuFamily.ts`, `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                       |
| MNU-007     | `menuSubmenu.tsx`, `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                     |
| MNU-008     | `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                                        |
| MNU-009     | `menuDefaults.ts`, `menuDefaults.macos.ts`, `menu.test.tsx`, `menu.stories.tsx`                                             |
| MNU-010     | `useMenu.ts`, `menuPopup.tsx`, `menu.test.tsx`, `menu.stories.tsx`                                                          |
| MNU-011     | `menu.styles.ts`, `useMenuStyles.ts`, `menuPopup.tsx`, `menu.test.tsx`                                                      |
| MNU-012     | `menuNative.ts`, `menuNative.macos.ts`, `menuNative.windows.ts`, `menuNative.win32.ts`, `menu.test.tsx`, `menu.stories.tsx` |
