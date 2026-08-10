# Combobox native specification

## Fluent UI Web references

- `packages/react-components/react-combobox/library/src/components/Combobox`
- `packages/react-components/react-combobox/library/src/components/Option`
- `packages/react-components/react-combobox/library/src/components/OptionGroup`
- `packages/react-components/react-combobox/stories/src/Combobox`

## Native design

`Combobox` composes a native editable `TextInput`, an expand or clear action, and a bounded inline listbox. `ComboboxOption` and `ComboboxOptionGroup` are declarative children parsed by the parent. Selection, editable value, and expanded state each support controlled and uncontrolled usage.

The inline listbox avoids Win32 popup hit-testing and nested-scroll hangs in the ReactTest catalog while retaining keyboard/pointer-accessible option surfaces. It renders at most eight options at once; hosts that need larger data sets should filter or window their children.

## Implemented behaviors

- Single and multiple selection.
- Controlled and uncontrolled value, selection, and expanded state.
- Editable filtering/freeform scenarios.
- Clearable single selection.
- Disabled fields and disabled options.
- Grouped, customized, and complex option content.
- Selected-state check glyphs and custom check glyphs.
- Small, medium, and large sizing.
- Outline, underline, filled-darker, and filled-lighter appearances.
- Active-option callbacks from focus and pointer hover.
- Expand, collapse, clear, select, and deselect accessibility actions.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| DOM portal positioning | React Native has no DOM; the listbox is rendered inline for reliable native hit testing. |
| Browser `aria-activedescendant` management | Native accessibility focus is placed directly on option surfaces. |
| Browser click-outside dismissal | Native hosts require platform-specific overlay infrastructure; selection and explicit disclosure close the list. |
| CSS reduced-motion focus underline transition | The native field uses a static focus treatment because no listbox motion is required. |
| Web Virtualizer package integration | Native virtualization is a host concern; the inline listbox renders a bounded eight-option window to avoid nested Win32 scroll hosts. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `appearance` | `appearance` | four variants / `outline` | same | Direct visual mapping. |
| `size` | `size` | `small`, `medium`, `large` / `medium` | same | Uses 24, 32, and 40 native heights. |
| `clearable` | `clearable` | boolean / false | same | Replaces expand icon after a single selection. |
| `disabled` | `disabled` | boolean / false | same | Blocks edit, expansion, and selection. |
| `freeform` | `freeform` | boolean / false | same | Commits typed values on submit. |
| `multiselect` | `multiselect` | boolean / false | same | Options expose checked state and the list remains open after selection. |
| `open` | `open` | controlled boolean | same | Controlled expansion. |
| `defaultOpen` | internal initial state | boolean / false | not exposed | Native catalogs use controlled `open` when an initial open state is required. |
| `selectedOptions` | `selectedOptions` | string[] | same | Controlled selected values. |
| `defaultSelectedOptions` | `defaultSelectedOptions` | string[] | same | Uncontrolled initial selected values. |
| `value` | `value` | string | same | Controlled editable value. |
| `defaultValue` | `defaultValue` | string | same | Uncontrolled initial editable value. |
| `placeholder` | `placeholder` | string | same | Passed to `TextInput`. |
| `onOpenChange` | `onOpenChange` | event and open data | native event and open data | Equivalent state request callback. |
| `onOptionSelect` | `onOptionSelect` | event and option data | native event and option data | Equivalent selection callback. |
| `onActiveOptionChange` | `onActiveOptionChange` | event and option data | native focus/hover event and option data | Direct native focus/hover adaptation. |
| `children` | `ComboboxOption` / `ComboboxOptionGroup` | JSX options | declarative native children | Parsed by the parent. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `inputProps` | `TextInputProps` subset | Exposes platform keyboard, focus, and submit behavior. |
| `inputStyle` | `TextStyle` | Supports native text measurement and host-specific typography. |
| `listboxStyle` | `ViewStyle` | Allows native list height and width constraints. |
| `onChangeText` | `(value: string) => void` | Matches React Native text editing semantics. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `inlinePopup` | DOM placement strategy | Native listbox is always inline. |
| `positioning` | Floating UI configuration | DOM-only geometry contract. |
| `mountNode` | Portal target | No DOM portal in React Native. |
| `listbox`, `input`, `root`, `expandIcon`, `clearIcon` slots | DOM slot overrides | Replaced by native props and declarative options. |
| DOM event handlers | Browser event integration | Native callbacks use React Native events. |

## Accessibility

The native text input remains directly focusable and editable. Options expose selected/checked and disabled state. The expand and clear affordances are independently named buttons.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Focus underline scale | Static focused native surface | None | No motion. |
| Listbox appearance | Immediate inline render | None | No motion. |

## Tests and Storybook coverage

Unit tests cover open/select/close, multiselect, disabled options, grouped/custom content, clearability, and disabled fields. The ReactTest Combobox page maps all 17 Fluent UI Web stories and is validated with side-by-side visual and interaction matrices.
