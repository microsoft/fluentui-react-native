---
name: nav-item
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# NavItem

## Scope

NavItem is a single pressable navigation row. It owns its own row anatomy,
density rhythm, current-destination presentation, and disclosure affordance for
a category row. It does not own the surrounding navigation surface: collection
roles, item position announcements, arrow-key movement between rows, which
category may be open, and which row is current all belong to a parent
navigation component that does not exist in this package yet.

Both stateful axes are therefore externally driven. NavItem renders the
`selected` and `expanded` values it is given, never changes them, and reports
activation through `onPress`.

## Public contract

`label` defaults to `"Nav item"`. `density` defaults to `comfortable`, `type`
to `item`, `nesting` to `topLevel`, `showLabel` to `true`, and `disabled`,
`selected`, and `expanded` to `false`. The root is a React Native `Pressable`
that accepts owned Pressable props including `ref`; the caller `style` is
applied after all component styles.

The public slots are `root`, `label`, `icon`, `selectedIcon`, `avatar`,
`trailingContent`, and `trailingActions`. `selectedIndicator`, the hidden
label reservation, and `chevron` are state-only slots.

The rendered root contains the persistent FocusVisual, the persistent selected
indicator, and then the row layout. The row layout renders the leading region,
the layout-stable label, the trailing content, and the trailing region. `avatar`
takes precedence over both icons, and a selected row prefers `selectedIcon`
over `icon`.

`type` chooses the row intent. An `item` row is a destination: it publishes the
link role and its selected value. A `category` row is a disclosure toggle: it
publishes the button role, its expanded value, and an optional `controls`
identifier, renders a trailing chevron whose direction follows `expanded`, and
never publishes a selected accessibility value even when it carries the
selected treatment for a hidden current destination.

`showLabel: false` renders the collapsed icon rail row. It removes the label,
trailing content, trailing actions, and chevron from layout, centers the
leading visual, and requires `accessibilityLabel` for the row's accessible
name.

### Requirements

- **NVI-001:** Defaults, public slots, owned Pressable root props, and the
  forwarded root `ref` resolve as declared.
- **NVI-002:** Render order and leading-visual precedence follow the documented
  anatomy, and only supplied public content is rendered.
- **NVI-003:** `selected` stays caller-owned and drives the selected treatment:
  soft row fill, strong label weight, brand indicator bar, and the brand-colored
  selected leading icon.
- **NVI-004:** `type` resolves row semantics. An item row publishes the link
  role with its selected state; a category row publishes the button role, its
  expanded state, optional `controls`, and a direction-following chevron, and
  never publishes a selected state. `expanded` stays caller-owned.
- **NVI-005:** Density and nesting resolve the documented padding, gap, leading
  size, typography, and sub-item indent.
- **NVI-006:** `showLabel: false` removes the label and trailing regions,
  centers the leading visual, and warns when no accessible name is supplied.
- **NVI-007:** Disabled, hover, press, focus, accessibility merging, and user
  style behavior remain coherent on the root.

## Platform behavior

On Windows and macOS the root is a React Native `Pressable`. It merges caller
accessibility state with the state NavItem owns, is accessible by default, and
is focusable unless disabled. Native press, pointer hover, and focus events
drive the resolved state, and disabled wins over pressed, which wins over
hovered.

The dual-ring FocusVisual stays mounted and becomes visible only while the
enabled root is focused. The selected indicator also stays mounted and changes
only its color, so selection never changes row geometry. The label reserves its
strong-weight width with a hidden ghost node so selection never changes the
row's line count.

NavItem does not implement arrow-key movement, Home/End, roving focus,
type-ahead, focus restoration, position-in-set announcements, or timed
animation. Trailing action controls nested in `trailingActions` capture their
own native press and do not activate the row.

## Divergences from Flex

- `nav-item-native-role-and-current` (**accepted**): React Native has no
  `aria-current`. An item row publishes `role: 'link'` with
  `accessibilityState.selected`, and a category row publishes
  `role: 'button'` with `accessibilityState.expanded`.
- `nav-item-indicator-inside-backplate` (**accepted**): the selected indicator
  is inset inside the row's start edge rather than positioned outside it,
  because React Native gives no cross-platform guarantee for content drawn
  outside a view's bounds and because keeping one Pressable root preserves the
  package's root-ref contract.
- `nav-item-external-expanded` (**accepted**): category disclosure is
  externally driven only. NavItem does not render the disclosed group, so the
  press is not the state change; the parent navigation owns it.
- `nav-item-persistent-trailing-actions` (**accepted**): trailing actions are
  always visible instead of being revealed on hover or focus. A React Native
  control hidden by opacity stays hit-testable and would create an invisible
  press target.
- `nav-item-collapsed-rail-tooltip` (**deferred**): the collapsed rail row
  requires `accessibilityLabel` for its accessible name. The visible tooltip
  waits on a Tooltip component in this package.
- `nav-item-no-state-transitions` (**accepted**): color, weight, icon, and
  chevron changes are instant. This package does not animate row state.

## Conformance

| Requirement | Evidence                                                         |
| ----------- | ---------------------------------------------------------------- |
| NVI-001     | `nav-item.types.ts`, `useNavItem.ts`, `nav-item.types.test.ts`   |
| NVI-002     | `renderNavItem.tsx`, `useNavItem.ts`, `nav-item.test.tsx`        |
| NVI-003     | `nav-item.styles.ts`, `useNavItemStyles.ts`, `nav-item.test.tsx` |
| NVI-004     | `useNavItem.ts`, `renderNavItem.tsx`, `nav-item.test.tsx`        |
| NVI-005     | `nav-item.styles.ts`, `useNavItem.ts`, `nav-item.test.tsx`       |
| NVI-006     | `useNavItem.ts`, `renderNavItem.tsx`, `nav-item.test.tsx`        |
| NVI-007     | `useNavItem.ts`, `useNavItemStyles.ts`, `nav-item.test.tsx`      |
