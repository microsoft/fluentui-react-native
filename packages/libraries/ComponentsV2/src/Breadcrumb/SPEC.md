# Breadcrumb native specification

## Fluent UI Web references

- `packages/react-components/react-breadcrumb/library/docs/Spec.md`
- `packages/react-components/react-breadcrumb/library/src/components/Breadcrumb`
- `packages/react-components/react-breadcrumb/library/src/components/BreadcrumbButton`
- `packages/react-components/react-breadcrumb/library/src/components/BreadcrumbItem`
- `packages/react-components/react-breadcrumb/library/src/components/BreadcrumbDivider`
- `packages/react-components/react-breadcrumb/library/src/utils`
- https://react.fluentui.dev/?path=/docs/components-breadcrumb--default

## Native design

`Breadcrumb` is a horizontal list and context provider for size and focus mode.
`BreadcrumbItem` is a list item, `BreadcrumbButton` is a tokenized Pressable, and
`BreadcrumbDivider` renders an accessibility-hidden chevron by default. Consumers
compose overflow UI and use `partitionBreadcrumbItems` to determine its contents.

## Implemented behaviors

- Small, medium, and large context sizes matching Web heights and typography.
- Rest, hover, press, focus, disabled, disabled-focusable, and current button states.
- Press and accessibility activate actions.
- Current items expose page/current, selected, and disabled semantics while retaining the normal current-page foreground color and semibold typography.
- Default `breadcrumb` accessibility label plus list/listitem roles on platforms that support them.
- Default overflow partitioning of six displayed items with overflow at index one.
- String names longer than 30 characters are visibly truncated; the original name is exposed through `accessibilityHint`.
- Custom icons, dividers, tooltip hints, truncation lengths, styles, labels, and test IDs.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| DOM `nav`, `ol`, `li`, `a`, and `href` rendering | React Native has no DOM or URL anchor primitive. Native list/listitem and button semantics are used. |
| Built-in overflow measurement/menu | Web also exposes overflow partitioning as a composition pattern. Native consumers choose an appropriate Menu/Popover. |
| Browser hover tooltip popup | Core React Native has no cross-platform tooltip primitive. The tooltip text is exposed as `accessibilityHint`; hosts may compose a visual tooltip. |
| Tabster roving focus | Tabster is DOM-only. Native platforms retain their tab/directional focus engines. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| Breadcrumb `size` | `size` | small/medium/large; medium | same | Context controls all descendants. |
| Breadcrumb `focusMode` | `focusMode` | tab/arrow; tab | same | Tab uses native tab order; arrow uses native directional focus. |
| Breadcrumb `aria-label` | `accessibilityLabel` | breadcrumb | breadcrumb | Native accessibility label. |
| Breadcrumb children | `children` | React nodes | React nodes | Compound composition. |
| BreadcrumbItem `size` | `size` | context | context | Optional native override. |
| BreadcrumbButton `current` | `current` | false | false | Maps to current page, selected, and disabled accessibility state. |
| BreadcrumbButton `disabled` | `disabled` | false | false | Prevents focus and actions. |
| BreadcrumbButton `disabledFocusable` | `disabledFocusable` | false | false | Retains focus but prevents actions. |
| BreadcrumbButton `icon` | `icon` | slot | React node | Leading icon slot. |
| BreadcrumbButton children | `children` | slot | React node | Strings receive Fluent truncation behavior. |
| BreadcrumbDivider children | `children` | slot | React node | Replaces default chevron. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `truncate` | boolean or number; true | Enables recommended 30-character truncation without DOM measurement. |
| `tooltip` | string; undefined | Overrides the native accessibility hint for truncated content. |
| React Native accessibility, interaction, style, and test props | platform types | Supports native hosts and automation. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `as` | Changes an HTML element | No DOM in React Native. |
| `list` slot | Replaces/configures `ol` | Native root already owns list semantics. |
| `href`, `target`, `download` | Browser navigation | Consumers perform navigation in `onPress`. |
| `className` and Griffel slots | CSS customization | React Native uses `style`. |
| DOM event handlers | Browser input | Native Pressable/accessibility handlers are inherited. |

## Accessibility

The root defaults to label `breadcrumb` and role `list`; items use `listitem`.
Dividers are hidden. Buttons use button semantics and provide disabled/selected
state. Current items set native `aria-current="page"` where supported. Truncated
string content keeps the full string as its label and accessibility hint.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| State color changes | Immediate token change | none | No motion to reduce. |

## Focus mode adaptation

`tab` preserves normal platform focus order. `arrow` documents intent and allows
Windows/macOS directional focus engines to navigate horizontally; core React
Native does not expose a portable keydown/roving-tab-index API, so no JavaScript
arrow-key interception is installed on iOS or Android.

## Tests and Storybook coverage

`Breadcrumb.test.tsx` covers default accessibility, context sizing, current and
disabled-focusable semantics, action suppression, truncation/tooltip behavior,
overflow defaults, and helper functions. Storybook/catalog changes are outside
this directory and intentionally excluded from this change.
