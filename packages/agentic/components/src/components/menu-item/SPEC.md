---
name: menu-item
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# MenuItem

## Scope

MenuItem renders a menu row or a noninteractive section-header row. It owns
the row's React Native role, visuals, and local press state; an owning menu
still coordinates which item is selected, focus traversal, submenu lifetime,
and menu dismissal.

## Public contract

`menuStyle` defaults to `list-item`; `secondaryContentPosition` defaults to
`right`; `disabled`, `loading`, `hasCheckmark`, `hasChevron`,
`hasMultiselect`, and `selected` default to `false`. Missing `content`
renders `"Menu item"` and omitted `secondaryContent` renders `"Secondary"`;
`null` or an empty secondary string hides it. `loading` applies only to a
section header. Caller style wins after the component's root styles.

The public slots are `root`, `icon`, `selectedIcon`, `avatar`, `chevron`,
`checkmark`, and `multiselectCheckbox`. Text is deliberately supplied through
the `content` and `secondaryContent` properties. A list-item root renders
FocusVisual and CompoundItemLayout. Its leading visual is avatar or the
selected replacement icon or icon. Its trailing order is chevron, checkmark,
then the multiselect checkbox. List item labels and secondary text use
state-only reservations to avoid a size change when selected. A section header
is disabled and nonfocusable; when loading, its normal row content is replaced
by skeletons.

The caller owns `selected` and changes it from `onPress`. Checkmark creates a
radio menu role and multiselect creates a checkbox menu role; either adds
checked state. With neither, a selected list item exposes selected state.
Multiselect takes visual precedence over selected fill and semibold text.

### Requirements

- **MNI-001:** Resolve documented defaults, text fallbacks, public slots, and
  caller root styles.
- **MNI-002:** Render list items and headers with their documented conditional
  structure, leading precedence, and trailing order.
- **MNI-003:** Preserve externally owned selection and native menu roles for
  default, checkmark, and multiselect rows.
- **MNI-004:** Keep section headers noninteractive and limit skeleton loading
  to that variant.
- **MNI-005:** Apply token-derived interaction, accessibility, and persistent
  focus behavior without overriding caller handlers.

## Platform behavior

Windows and macOS expose list items through React Native with
`role="menuitem"`. Checkmark and multiselect variants preserve the same menu
role and publish their caller-owned selection through checked state.
The root accessible name defaults to the content text and a chevron supplies
the default hint `"Has submenu"`. Header roots expose the `none` role, are
disabled, and cannot receive focus. Decorative visuals are inaccessible.

The native Pressable drives pointer hover, press, focus, and keyboard
activation for interactive rows. FocusVisual is mounted for each row and
visible only on enabled list items with focus. The component does not navigate
between menu items, open a submenu, restore focus, or dismiss a menu.

## Divergences from Flex

- `menu-item-native-header-root` (**accepted**): A FURN section header uses a
  disabled Pressable with the `none` role rather than a platform-specific
  menu-group primitive.
- `menu-item-multiselect-precedence` (**accepted**): Supplying both selection
  indicators logs a development warning and resolves to the multiselect role
  and visual path instead of rejecting the prop combination.

## Conformance

| Requirement | Evidence                                                            |
| ----------- | ------------------------------------------------------------------- |
| MNI-001     | `menu-item.types.ts`, `useMenuItem.ts`, `menu-item.types.test.ts`   |
| MNI-002     | `useMenuItem.ts`, `renderMenuItem.tsx`, `menu-item.test.tsx`        |
| MNI-003     | `useMenuItem.ts`, `menu-item.styles.ts`, `menu-item.test.tsx`       |
| MNI-004     | `useMenuItem.ts`, `renderMenuItem.tsx`, `menu-item.test.tsx`        |
| MNI-005     | `useMenuItemStyles.ts`, `menu-item.styles.ts`, `menu-item.test.tsx` |
