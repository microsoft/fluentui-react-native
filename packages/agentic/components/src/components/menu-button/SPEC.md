---
name: menu-button
platform: react-native (Windows, macOS)
status: contract-reviewed
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# MenuButton

## Scope

MenuButton is a Button-styled trigger with an always-present down chevron that
opens a Menu of actions. It forwards Button's appearance, size, and
interaction states, draws its pressed chrome while the menu is open, and adds
the Menu-button keyboard model: Down and Up open to the first and last item,
and Tab leaves past the trigger. Menu owns the popup family, navigation,
submenus, and activation dismissal.

MenuButton has no selected, shape, or icon-position axis. It is not a
Dropdown (value selection) or a toggle.

## Public contract

### Props and defaults

| Prop                                              | Type                  | Default     | Contract                                                                         |
| ------------------------------------------------- | --------------------- | ----------- | -------------------------------------------------------------------------------- |
| `appearance`                                      | Button appearance     | `secondary` | Forwarded to Button's chrome.                                                    |
| `size`                                            | Button size           | `medium`    | Forwarded to Button's chrome; also sizes the chevron 16/20/20.                   |
| `disabled`                                        | `boolean`             | `false`     | Disables the trigger; a disabled MenuButton never opens and closes an open menu. |
| `content`                                         | Button content slot   | absent      | Optional label. Never mirrors the chosen action.                                 |
| `leadingIcon`                                     | Button icon slot      | absent      | Optional leading icon.                                                           |
| `open` / `defaultOpen` / `onOpenChange`           | as Menu               | as Menu     | Menu's presence contract (MNU-002), including the `action` reason.               |
| `disabledFocusable`, `submenuOpenOnHover`, delays | as Menu               | as Menu     | Forwarded to the menu.                                                           |
| `menu`                                            | View props with `ref` | `{}`        | The menu surface that hosts `children`.                                          |
| `children`                                        | React nodes           | required    | MenuItem list rows and Dividers.                                                 |

All other Button root props, including handlers, `accessibilityLabel`, and
`ref`, apply to the actual trigger Pressable. `shape` and `trailingIcon`
are not accepted. Caller-driven `open`
changes never call `onOpenChange`.

Button's direct `tooltip?: string` applies to the trigger, not the menu surface or its items. It does not replace
the trigger name or its menu-opening accessibility hint.

### Slots and anatomy

The trigger Pressable contains the optional leading icon, the optional label,
and the private chevron, in that order. The menu popup renders outside the
Pressable and takes no layout space.

| Slot          | Rendered when             | Contract                                                                       |
| ------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `root`        | always                    | The actual trigger Pressable, with Button's focus target and the caller `ref`. |
| `content`     | `content` is supplied     | Button's label slot.                                                           |
| `leadingIcon` | `leadingIcon` is supplied | Button's leading icon slot.                                                    |
| `menu`        | the menu is presented     | The root menu surface, as Menu's `surface` (MNU-010, MNU-011).                 |

The chevron is private and cannot be replaced or hidden.

### Requirements

- **MNB-001:** Resolve Button's forwarded defaults and props on one actual
  Pressable root with the caller `ref` and style last. Warn in development
  when both label and icon are absent, and require an accessible name for an
  icon-only trigger.
- **MNB-002:** Use Button's content-layout metrics and rounded radius for
  every label and icon combination, append the private static Fluent SVG down
  chevron in the trigger foreground at 16, 20, and 20 for small, medium, and large, and
  draw the pressed chrome while the menu is presented, unless disabled.
  Use the effective Button theme tokens for the trigger, with separate
  MenuButton theme tokens for its chevron and macOS label offset, and caller trigger visuals last.
  The open trigger uses a distinct border in high contrast.
- **MNB-003:** Present the children through Menu's presence, family,
  navigation, and dismissal (MNU-002 to MNU-011), placed below the trigger and
  start-aligned. Warn in development for section-header rows and for a
  MenuButton rendered inside a menu.
- **MNB-004:** Enter, Space, and Down open the menu and focus its first row;
  Up opens it and focuses its last row; a pointer press follows Menu's pointer
  entry. While open, Enter or Space on the trigger is not repeated into the
  menu.
- **MNB-005:** Activation, Escape at the root, Shift+Tab, and outside pointer
  input (MNU-006) return focus to the trigger. Tab closes the whole menu and
  moves focus to the next focusable view after the trigger through native-core
  continuation.
- **MNB-006:** Expose the button role, a name from explicit naming props or
  the plain label text, the expanded state from actual presence, and the
  `Opens a menu` hint without toggle or selected semantics.
- **MNB-007:** Present through native-core's modern Callout and FocusZone on
  macOS (Paper and Fabric) and Windows Fabric, and through its Win32 Callout
  and FocusZone adapters on Office Win32. Other hosts throw a descriptive error
  on use. Do not export MenuButton publicly until it qualifies on all
  four desktop endpoints.

## Platform behavior

MenuButton's menu uses Callout `tabNavigation: 'continue'`: Tab from any popup
in the family closes it and focuses the view that follows the trigger in the
owner window's key-view order, and Shift+Tab focuses the trigger. macOS and
Windows Fabric implement this continuation natively. The Win32 host cannot
continue focus past the popup's owner, so Office Win32 uses the approved interim
(R1): Tab closes the menu and returns focus to the trigger.

The component token companion selects the size-specific Fluent SVG chevron on
every supported host. The chevron is decorative and does not receive pointer input.

## Divergences from Flex

| ID                          | Disposition | React Native contract                                                                                                      | Follow-up                                                                        |
| --------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `menu-button-haspopup`      | Deferred    | Expanded state plus a hint are the interim native representation. They do not establish a programmatic popup relationship. | Verify real native popup type and controls relationships before claiming parity. |
| `menu-button-pointer-entry` | Accepted    | A pointer open follows Menu's native pointer entry (`menu-pointer-entry`) instead of focusing the first row.               | None.                                                                            |
| `menu-button-motion`        | Deferred    | Menu presentation and trigger color changes are instant, which equals the reduced-motion behavior.                         | Revisit when Flex motion is final.                                               |

## Conformance

The listed files exist for every requirement. macOS Fabric and Paper, Windows Fabric, and the Win32 adapters qualify the
native behavior in the MenuButton stories.

| Requirement | Evidence                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| MNB-001     | `menu-button.types.ts`, `useMenuButton.ts`, `menu-button.test.tsx`, `menu-button.types.test.ts`                       |
| MNB-002     | `spec/tokens.json`, `useMenuButtonStyles.ts`, `menu-button.styles.ts`, `renderMenuButton.tsx`, `menu-button.test.tsx` |
| MNB-003     | `useMenuButton.ts`, `renderMenuButton.tsx`, `menu-button.test.tsx`, `menu-button.stories.tsx`                         |
| MNB-004     | `useMenuButton.ts`, `menu-button.test.tsx`, `menu-button.stories.tsx`                                                 |
| MNB-005     | `useMenuButton.ts`, `menu-button.test.tsx`, `menu-button.stories.tsx`                                                 |
| MNB-006     | `useMenuButton.ts`, `menu-button.test.tsx`, `menu-button.stories.tsx`                                                 |
| MNB-007     | `useMenuButton.ts`, `menu-button.test.tsx`, `menu-button.stories.tsx`                                                 |
