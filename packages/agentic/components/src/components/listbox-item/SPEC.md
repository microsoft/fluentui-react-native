---
name: listbox-item
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ListboxItem

## Scope

ListboxItem provides either a pressable option row or a noninteractive section
header. It supplies option anatomy and selection presentation but leaves
selection coordination, collection navigation, popup lifetime, and focus
return to the consumer.

## Public contract

`variant` defaults to `listItem`; `disabled`, `loading`, `checkmark`,
`chevron`, `multiselect`, and `selected` default to `false`; and
`secondaryContentPosition` defaults to `right`. List-item `content` defaults
to `"Listbox item"`, its icon and secondary content render by default, and the
section-header form renders neither. Caller root style applies after component
styles.

`root`, `content`, `secondaryContent`, `icon`, `selectedIcon`, and `avatar`
are public slots. The header root, selection indicators, and hidden label are
private state slots. A list item renders FocusVisual then CompoundItemLayout:
avatar or the active icon, layout-stable primary content, secondary content,
and trailing chevron, checkmark, then checkbox indicator. A selected icon
replaces the normal icon. The header instead renders its content or, when
`loading`, skeleton placeholders.

`selected` is an externally driven value. Pressing forwards `onPress` and
does not change it. `multiselect` suppresses the row selected fill and
semibold label reservation, while its internal indicator reflects `selected`.
`checkmark` renders only when both it and `selected` are true.

### Requirements

- **LBI-001:** Resolve option and header defaults, exposed slots, and owned
  root props as documented.
- **LBI-002:** Render each variant in its documented slot order, including
  icon replacement, conditional indicators, and loading structure.
- **LBI-003:** Preserve externally owned selection and its separate
  checkmark and multiselect presentations.
- **LBI-004:** Resolve disabled, hover, press, and focus presentation with
  user root style last.
- **LBI-005:** Expose the native accessibility role and state appropriate to
  the resolved variant.

## Platform behavior

On Windows and macOS, a list item is an accessible React Native `Pressable`
with the `button` role. Its accessibility state combines the caller's state
with `disabled` and `pressed: selected`, and it is focusable unless disabled.
A section header is exposed through a nonfocusable React Native `View` with
the `header` role. The internal leading and trailing visuals are inaccessible.

Pointer hover, press, and focus events flow through `usePressableState`.
FocusVisual stays mounted in the list-item structure, appearing only for an
enabled focused option. No code here moves between options, processes
collection keys, opens submenus, or closes an owning popup.

## Divergences from Flex

- `listbox-item-native-pressed-state` (**accepted**): The selected option is
  surfaced to native accessibility through `accessibilityState.pressed`
  instead of a web accessibility attribute.
- `listbox-item-default-icon` (**accepted**): FURN creates the normal and
  selected icon slots by default; the pinned Flex reference requires an
  explicit icon opt-in.
- `listbox-item-native-focus-model` (**accepted**): FURN gives each option a
  directly focusable Pressable root and local FocusVisual instead of retaining
  focus at a parent selection controller.
- `listbox-item-native-indicators` (**accepted**): The multiselect visual is
  the internal `CheckboxIndicator`, and the checkmark and chevron are
  inaccessible Icon slots rather than browser control composition.

## Conformance

| Requirement | Evidence                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| LBI-001     | `listbox-item.types.ts`, `useListboxItem.ts`, `listbox-item.types.test.ts`   |
| LBI-002     | `useListboxItem.ts`, `renderListboxItem.tsx`, `listbox-item.test.tsx`        |
| LBI-003     | `useListboxItem.ts`, `listbox-item.styles.ts`, `listbox-item.test.tsx`       |
| LBI-004     | `listbox-item.styles.ts`, `useListboxItemStyles.ts`, `listbox-item.test.tsx` |
| LBI-005     | `useListboxItem.ts`, `renderListboxItem.tsx`, `listbox-item.test.tsx`        |
