# AvatarGroup native specification

## Fluent UI Web references

- `@fluentui/react-avatar` AvatarGroup, AvatarGroupItem, and overflow indicator source, types, and stories.
- https://react.fluentui.dev/?path=/docs/components-avatar-avatargroup--docs
- Avatar Group scenarios in the Fluent UI Web Storybook index.

## Native design

`AvatarGroup` provides size through context and arranges `AvatarGroupItem` and `AvatarGroupOverflowIndicator` children. Spread uses explicit gaps, stack uses explicit negative overlap, and pie clips one primary half plus two quarter-size entries. Overflow can be generated from `maxItems` or supplied explicitly. Like Fluent UI Web, generated overflow reserves one inline slot for its indicator and keeps the final items visible.

## Implemented behaviors

- Spread, stack, and pie layouts, including Web-compatible fixed spacing breakpoints, stack dividers, and half-plus-quarters pie geometry.
- Inherited Avatar size for all supported Avatar sizes.
- Automatic item partitioning and count or icon overflow indicators.
- Pressable generated overflow indicators with a scrollable native list of hidden people.
- Public `partitionAvatarGroupItems` helper.
- Maximum of three inline pie entries.
- Tooltip text mapped to `accessibilityHint` and native `title` semantics, without a Web hover popover.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| Hover-open tooltip popover | Native platforms use accessibility hints and platform title semantics instead of browser hover. |
| CSS grid and DOM slot selectors | Native flex and absolute clipping are used. |
| Browser focus-visible styling | Native Pressable focus semantics are used for the overflow indicator. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `layout` | `layout` | spread/stack/pie / spread | same | Native flex/overlap/clipping. |
| `size` | `size` | Avatar size / 32 | same | Inherited through context. |
| `children` | `children` | slot collection | ReactNode | `AvatarGroupItem` and optional explicit indicator. |
| overflow count | `maxItems` plus generated indicator | hook-driven | number / all inline | Partitions children and renders remaining count. |
| overflow indicator | `overflowIndicatorAppearance`, `overflowIcon` | slot | count/icon | React-node icon or `+N`. |
| item tooltip | `tooltip` | Tooltip relationship | string | Accessibility hint and native title only. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `overflowTooltip` | string | Describes the generated overflow indicator to native accessibility services. |
| `ViewProps` accessibility fields | native platform types | Supports platform accessibility customization. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `as` | Selects an HTML element | DOM-specific. |
| `className` | Applies CSS classes | CSS-specific. |
| Popover positioning props | Positions browser tooltip surfaces | No browser hover popover is created. |
| Low-level DOM slot prop objects | Customizes HTML nodes | Replaced by React-node content and native view props. |

## Accessibility

Each Avatar remains an image. Overflow indicators are images labeled with the hidden count or supplied tooltip. Tooltip strings are exposed through `accessibilityHint` and the native `title` prop where a host platform supports it.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Group layout changes | Immediate layout update | None | No motion to suppress. |

## Tests and Storybook coverage

`AvatarGroup.test.tsx` covers partitioning, inherited size, generated count overflow, icon overflow, tooltip semantics, and the three-item pie cap.
