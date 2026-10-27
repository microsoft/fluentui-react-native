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
private state slots. A list item renders optional `FocusRing` then CompoundItemLayout:
avatar or the active icon, layout-stable primary content, secondary content,
and trailing chevron, checkmark, then checkbox indicator. A selected icon
replaces the normal icon. The header instead renders its content or, when
`loading`, skeleton placeholders.

`selected` is an externally driven value. Pressing forwards `onPress` and
does not change it. `multiselect` suppresses the row selected fill and
semibold label reservation, while its internal indicator reflects `selected`.
`checkmark` renders only when both it and `selected` are true.

`value` is an optional string that identifies a list item as an option of an
owning list (LBI-006). A standalone list item ignores it.

### Requirements

- **LBI-001:** Resolve option and header defaults, exposed slots, and owned
  root props as documented.
- **LBI-002:** Render each variant in its documented slot order, including
  icon replacement, conditional indicators, and loading structure.
- **LBI-003:** Preserve externally owned selection and its separate
  checkmark and multiselect presentations.
- **LBI-004:** Resolve disabled, hover, press, and focus presentation with
  user root style last, following the [shared focus visual policy](../../../references/higher-order-components.md#focus-visual-policy).
- **LBI-005:** Expose the native accessibility role and state appropriate to
  the resolved variant.
- **LBI-006:** Inside a Dropdown list, a list item with a string `value` is a
  bound option. It registers its value and focus target with the list and
  exposes the `listitem` role with `selected` and `disabled` state, its
  one-based position, and the option count, instead of the `button` role and
  `checked` state. It declares the select, add-to-selection, and
  remove-from-selection actions, lowercase on Windows Fabric and title case
  elsewhere; the list applies an action before the caller's
  `onAccessibilityAction` receives the event once. The list owns the option's
  selection: it supplies `selected`, shows the checkmark in single mode and the
  checkbox indicator in multiple mode, and ignores caller values for
  `selected`, `checkmark`, and `multiselect`. Without `content`, a bound option
  shows its `accessibilityLabel` or else its value, and it renders the icon,
  selected icon, and secondary content only when they are supplied. It reports
  focus, hover, key, and press input to the list after the caller's handlers
  and declares the keys the list handles in `keyDownEvents`. Outside a list,
  or without a `value`, the item is unchanged.

LBI-006 was reviewed before code on October 19, 2026 with the Dropdown contract
(`../dropdown/SPEC.md`). Dropdown supplies the binding context, so ListboxItem
never imports Dropdown or native-core.

## Focus visuals

The state hook uses `useFocusVisuals` to create a private optional `FocusRing`.
Windows and macOS request the system ring by default, without a custom subtree.
Win32 and other platforms use the custom ring, visible only while focused and
the scene's current input modality is keyboard. Programmatic focus follows the
last root modality. Disabled and noninteractive targets never show custom feedback.

The composition hook supports an explicit `useSystemFocusRing` override.
`alwaysVisible` selects the custom path and bypasses modality while focused;
it does not make an unfocused target visible or move native focus. Custom rings
stay mounted across focus/blur. `applyFocusRingStyles` supplies shared theme
colors and widths; component style hooks preserve their resolved radius.
These hook options do not add new component props. Scenes require `ThemedRoot`.

## Platform behavior

On Windows and macOS, a list item is an accessible React Native `Pressable`
with the `button` role. Its accessibility state combines the caller's state
with `disabled` and `checked: selected`, and it is focusable unless disabled.
The checked value represents persistent, externally owned toggle selection,
not the transient pointer-pressed interaction state. The owned role, disabled
state, and checked value take precedence over their caller-provided React Native
and ARIA aliases; unrelated caller accessibility values are preserved.
The standalone root declares the platform toggle accessibility action using
the shared resolver, preserving caller labels and custom actions. This exposes
the native Toggle pattern without changing the button's role. Selection still
belongs to the caller: accessibility actions reach `onAccessibilityAction`
unchanged and do not synthesize `onPress` or mutate `selected`.
A bound option uses the `listitem` role and `selected` state instead, which
Windows exposes through UI Automation's SelectionItem pattern (LBI-006).
Its owned role, disabled state, and selected value also take precedence over
their caller-provided aliases.
A section header is exposed through a nonfocusable React Native `View` with
the `header` role. The internal leading and trailing visuals are inaccessible.

Pointer hover, press, and focus events flow through `usePressableState`.
Section headers gain no ring or focus stop. A standalone list item never moves
between options, processes collection keys, opens submenus, or closes an
owning popup. A bound option forwards its input to its list, which owns
navigation, selection, dismissal, and focus return.

## Divergences from Flex

- `native-system-focus-visuals` (**accepted**): Apply the [shared native adaptation](../../../references/higher-order-components.md#focus-visual-policy).

- `listbox-item-native-toggle-state` (**accepted**): Standalone selection is
  surfaced through `accessibilityState.checked`, preserving toggle-button
  semantics using the supported React Native state instead of a web
  accessibility attribute. A bound option continues to use `selected`
  (LBI-006).
- `listbox-item-default-icon` (**accepted**): FURN creates the normal and
  selected icon slots by default; the pinned Flex reference requires an
  explicit icon opt-in. A bound option requires the opt-in (LBI-006).
- `listbox-item-native-focus-model` (**accepted**): FURN gives each option a
  directly focusable Pressable root and local platform focus treatment instead
  of retaining focus at a parent selection controller.
- `listbox-item-native-indicators` (**accepted**): The multiselect visual is
  the internal `CheckboxIndicator`, and the checkmark and chevron are
  inaccessible Icon slots rather than browser control composition.

## Conformance

### October 27, 2026 representation review

LBI-005 retains the requirement to expose both selected and unselected
standalone buttons to native accessibility. The previous
`listbox-item-native-pressed-state` adaptation named an unsupported state:
[React Native 0.81 accessibility](https://reactnative.dev/docs/0.81/accessibility#accessibilitystate)
defines `checked`, not `pressed`, and the pinned
[`Pressable` implementation](https://github.com/facebook/react-native/blob/cddf8a7536de12db889e35e946281cfaf327197a/packages/react-native/Libraries/Components/Pressable/Pressable.js)
reconstructs the native state without `pressed`. It also gives ARIA state
aliases precedence over `accessibilityState`.

The corrected representation follows the existing [Button state hook](../button/useButton.ts):
`checked` mirrors the owner-supplied selection, including false and disabled
selection, without changing selection on activation. This is a platform
adaptation correction, not removal of the persistent pressed/toggled behavior.
Native Win32 validation additionally showed that checked state alone on a
generic button does not expose a Toggle pattern. Although the pinned public
type lists `togglebutton`, the installed REX host projected that role as a
Group rather than a Button. The shipped
[FURN ToggleButton](../../../../../components/Button/src/ToggleButton/useToggleButton.ts)
instead preserves the button role and declares `Toggle` alongside checked
state. This component follows that native compatibility precedent using
`resolveAccessibilityAction` for platform naming, without adopting its
internally driven state or synthesizing a press event. The immutable
compatibility source is recorded alongside the RN platform source.
Flex source identities, slot anatomy, focus/ref ownership, disabled activation,
and bound Dropdown option semantics are unchanged. The public RN source
identity and per-requirement authority are recorded in `spec/source.json`.
Regression coverage includes rendered public state, contradictory caller aliases,
owner rerenders, and input-free native `checked`/enabled reads; JavaScript
coverage alone does not establish native projection.

| Requirement | Evidence                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| LBI-001     | `listbox-item.types.ts`, `useListboxItem.ts`, `listbox-item.types.test.ts`                           |
| LBI-002     | `useListboxItem.ts`, `renderListboxItem.tsx`, `listbox-item.test.tsx`                                |
| LBI-003     | `useListboxItem.ts`, `listbox-item.styles.ts`, `listbox-item.test.tsx`                               |
| LBI-004     | `useListboxItem.ts`, `listbox-item.styles.ts`, `useListboxItemStyles.ts`, `listbox-item.test.tsx`    |
| LBI-005     | `useListboxItem.ts`, `renderListboxItem.tsx`, `listbox-item.test.tsx`, `listbox-item.stories.tsx`    |
| LBI-006     | `listbox-item.types.ts`, `listboxItemOptionContext.ts`, `useListboxItem.ts`, `listbox-item.test.tsx` |
