---
name: tablist
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# TabList

## Scope

TabList coordinates a bounded set of `Tab` children that switch one region
between peer panels. It owns group selection, roving focus, orientation-aware
keyboard movement, and the native tab-list semantics. Each Tab continues to own
its visual presentation and controlled-panel relationship.

TabList does not render panels, overflow tabs, scroll controls, badges, or a
selection indicator. It is not a navigation bar and does not change routes.

## Public contract

### Props and defaults

| Prop                    | Type                      | Default                 | Contract                                                                                    |
| ----------------------- | ------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `children`              | `ReactNode`               | required                | Tab children in visual and keyboard order.                                                  |
| `selectedValue`         | `string`                  | absent                  | Externally driven selected Tab value.                                                       |
| `defaultSelectedValue`  | `string`                  | first enabled Tab value | Initial selection while internally driven.                                                  |
| `onSelectionChange`     | `(value: string) => void` | none                    | Reports the requested value in controlled and uncontrolled modes.                           |
| `orientation`           | `horizontal \| vertical`  | `horizontal`            | Selects row or column layout and the arrow-key axis.                                        |
| `selectionFollowsFocus` | `boolean`                 | `true`                  | When true, keyboard focus movement also requests selection; when false, activation selects. |
| `circularNavigation`    | `boolean`                 | `true`                  | Wraps arrow movement between the first and last enabled Tab.                                |
| `disabled`              | `boolean`                 | `false`                 | Disables every child Tab and removes the group from keyboard interaction.                   |
| `style`                 | `StyleProp<ViewStyle>`    | none                    | Applied after the orientation and token-derived group styles.                               |

A Tab's group value is its explicit `value` or, when omitted, its required
`controls` identifier. Values must be unique within a list.

**TBL-001:** Support controlled and uncontrolled selection without mutating a
controlled value, and report every requested value through
`onSelectionChange`.

**TBL-002:** Derive a stable ordered child inventory from Tab values, warn
about duplicates in development, and choose the first enabled Tab when no
initial value is supplied.

### Slots and anatomy

| Slot   | Type   | Rendered | Contract                                                        |
| ------ | ------ | -------- | --------------------------------------------------------------- |
| `root` | `View` | always   | The tab-list semantic container and row or column layout owner. |

The root renders children in caller order without cloning their visual slots.
An internal context supplies selection, disabled state, set position, roving
focus, and interaction handlers to each Tab.

**TBL-003:** Preserve caller child order and styles while coordinating Tab
behavior through package-private context.

### State and navigation

Exactly one enabled Tab is tabbable. The selected enabled Tab is initially
tabbable; if it is absent or disabled, the first enabled Tab is used. Disabled
Tabs stay in the accessibility tree but are skipped by roving focus.

Horizontal lists use Left and Right. Vertical lists use Up and Down. Home moves
to the first enabled Tab and End to the last. Arrow movement wraps only when
`circularNavigation` is true. Handled keys prevent the native event's default
behavior.

When `selectionFollowsFocus` is true, movement requests the focused value.
Otherwise focus moves independently and Enter, Space, or pointer activation
requests selection through the Tab press path.

**TBL-004:** Keep one enabled Tab tabbable, recover when the active Tab becomes
disabled or disappears, and expose no tabbable Tab when all are disabled.

**TBL-005:** Move focus by orientation, skip disabled Tabs, support Home and
End, and honor circular navigation.

**TBL-006:** Apply automatic or manual activation consistently and preserve
each Tab's consumer handlers.

## Platform behavior

The root uses the native tab-list role while remaining a structural container
so each child Tab stays an independent accessible element. Tabs expose their
one-based position and the enabled and disabled items both contribute to the
set size.

Windows and macOS use native focus commands on the next Tab after a handled
navigation key. Native Tab and Shift+Tab enter and leave the list through its
single tabbable item. Pointer activation moves both active focus ownership and
selection to the pressed Tab.

**TBL-007:** Expose tab-list, tab, selected, disabled, controlled-panel, set
position, and set-size semantics without grouping child Tabs into one
accessibility element.

**TBL-008:** Lay out the group with the mapped spacing token and place caller
styles last.

## Divergences from Flex

| ID                                | Disposition | React Native contract                                                                                                                            | Follow-up |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `tablist-controls-value-fallback` | Accepted    | A Tab may omit `value`; its required `controls` identifier then becomes the group selection value.                                               | None.     |
| `tablist-no-selection-indicator`  | Accepted    | Selection is expressed by the existing Tab fill, foreground, icon, and weight treatment rather than a separate animated indicator owned by list. | None.     |
| `tablist-native-focus-command`    | Accepted    | Roving navigation uses native React Native focus refs rather than browser tabindex and DOM query behavior.                                       | None.     |

## Conformance

| Requirement | Evidence                                                       |
| ----------- | -------------------------------------------------------------- |
| TBL-001     | `tablist.types.ts`, `useTabList.ts`, `tablist.test.tsx`        |
| TBL-002     | `useTabList.ts`, `tablist.test.tsx`                            |
| TBL-003     | `TabListContext.ts`, `renderTabList.tsx`, `tablist.test.tsx`   |
| TBL-004     | `useTabList.ts`, `tablist.test.tsx`                            |
| TBL-005     | `useTabList.ts`, `tablist.test.tsx`                            |
| TBL-006     | `useTabList.ts`, `tablist.test.tsx`                            |
| TBL-007     | `useTabList.ts`, `tablist.test.tsx`                            |
| TBL-008     | `tablist.styles.ts`, `useTabListStyles.ts`, `tablist.test.tsx` |
