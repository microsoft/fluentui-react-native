# Checkbox native specification

## Fluent UI Web references

- [Fluent UI Checkbox specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-checkbox/library/docs/Spec.md)
- [Fluent UI Checkbox public types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-checkbox/library/src/components/Checkbox/Checkbox.types.ts)
- [Fluent UI Checkbox implementation](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-checkbox/library/src/components/Checkbox)
- [Fluent UI Checkbox stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-checkbox/stories/src/Checkbox)
- [Fluent 2 Checkbox usage guidance](https://fluent2.microsoft.design/components/web/react/core/checkbox/usage)

## Native design

Checkbox is a single accessible `Pressable` containing a visual indicator and an optional label. The root owns hover,
press, focus, keyboard, touch, and accessibility behavior. The indicator is presentation-only and renders an SVG
checkmark, square mixed mark, or circular mixed mark. The component uses Fluent theme tokens and supports controlled
and uncontrolled tri-state values.

The visual dimensions match Fluent UI React: medium uses a 16 px indicator with a 12 px glyph, large uses a 20 px
indicator with a 16 px glyph, labels use 14 px Segoe UI with a 20 px line height, and both slots use the Web component's
8 px outer spacing.

## Implemented behaviors

- Controlled and uncontrolled unchecked, checked, and mixed states.
- Mixed activation requests `true`, matching the live Fluent UI React story.
- Square and circular indicators.
- Medium and large sizes.
- Labels before or after the indicator.
- First-line indicator alignment for wrapped labels.
- Rest, hover, pressed, focused, and disabled visuals.
- Pointer, touch, Space key, and accessibility Toggle action activation.
- Disabled controls are removed from focus and do not invoke `onChange`.
- Required label indicator and required accessibility state.
- No state-change animation, matching Fluent UI React.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| Native HTML form submission and validation | React Native has no shared browser form model. `required` is represented visually and through accessibility state. |
| Browser label `htmlFor` activation | The native root is one Pressable, so its indicator and visible label share one activation target. |
| DOM focus-within selector | Native focus state renders equivalent two-tone focus visuals directly. |
| Enter-driven form submission | Checkbox handles Space and native activation only; it does not emulate browser form submission. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `checked` | `checked` | `boolean \| "mixed"` / `false` | Same | Direct controlled tri-state mapping. |
| `defaultChecked` | `defaultChecked` | `boolean \| "mixed"` / `false` | Same | Direct uncontrolled initial state mapping. |
| `disabled` | `disabled` | `boolean` / `false` | Same | Disables interaction and focus. |
| `label` | `label` | Label slot / none | `ReactNode` / none | Renders visible native content; strings receive Fluent typography. |
| `labelPosition` | `labelPosition` | `"before" \| "after"` / `"after"` | Same | Direct logical position mapping. |
| `onChange` | `onChange` | `(event, { checked })` | Same data shape with native interaction event | Native event replaces the DOM change event. |
| `required` | `required` | `boolean` / `false` | Same | Adds an asterisk and accessibility required state; no browser validation. |
| `shape` | `shape` | `"square" \| "circular"` / `"square"` | Same | Direct visual mapping. |
| `size` | `size` | `"medium" \| "large"` / `"medium"` | Same | Direct 16 px and 20 px indicator mapping. |
| `style` | `style` | CSS properties | React Native View style | Applies to the root layout surface. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| React Native accessibility props | Platform-defined | Supports accessible names, hints, relationships, actions, and test automation across native platforms. |
| `hitSlop` | React Native inset / `4` | Expands the touch target without changing the Web-parity visual dimensions. |
| `testID` | `string` / none | Supports native automation and testing. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `root`, `input`, `indicator`, and label slot property bags | Replaces or configures DOM slots | DOM element types and attributes do not map consistently to native views. |
| `children` | Native element content | Web explicitly disallows children; native uses `label`. |
| `className` | CSS class customization | React Native has no class names. |
| `id`, `name`, `value`, `form` | HTML form integration | Browser-only form attributes. |
| `type` | Selects HTML input type | Checkbox semantics are fixed by the native component. |
| `aria-*` DOM attributes | Browser accessibility | Replaced by React Native accessibility properties and state. |
| DOM mouse/change event props | Browser event contracts | Native interaction is normalized through `onChange` and React Native event props. |

## Accessibility

- The root exposes role `checkbox`.
- `accessibilityState.checked` is `false`, `true`, or `"mixed"`.
- Disabled and required states are exposed through `accessibilityState`.
- A string label becomes the default accessible name; consumers can override it with `accessibilityLabel`.
- Disabled controls are not focusable.
- Space and the accessibility Toggle action invoke the same state transition.
- The indicator and focus-ring views are excluded from the accessibility tree.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| State changes | Immediate token and glyph replacement | None | No adaptation required. |

## Tests and Storybook coverage

Unit tests cover default semantics, uncontrolled state, mixed activation, disabled behavior, and required accessibility.
CopilotAgentUI maps all official stories: Default, Checked, Mixed, Disabled, Large, Label Before, Label Wrapping,
Required, and Circular. Final validation compares every rendered instance with the corresponding live Web story in
ReactTest.
