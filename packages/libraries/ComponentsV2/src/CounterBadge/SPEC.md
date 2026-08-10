# CounterBadge native specification

## Fluent UI Web references

- `packages/react-components/react-badge/library/src/components/CounterBadge/CounterBadge.types.ts`
- `packages/react-components/react-badge/library/src/components/CounterBadge/useCounterBadge.ts`
- `packages/react-components/react-badge/library/src/components/CounterBadge/useCounterBadgeStyles.styles.ts`

## Native design

`CounterBadge` specializes the native `Badge`. It owns numeric formatting, zero visibility, overflow, and dot behavior while retaining Badge content/icon composition and native view props.

## Implemented behaviors

- Filled and ghost appearances; brand, danger, important, and informative colors.
- Circular and rounded shapes and all six badge sizes.
- Hidden automatically for count zero unless `showZero` or custom children are provided.
- Overflow formatting, custom content override, negative counts, and six-pixel dot mode.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| CSS `display: none` hidden node | Returning `null` is the native equivalent and removes the inaccessible layout node. |
| DOM slot polymorphism | Native uses the stable Badge `View` root. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| appearance | appearance | filled/ghost; filled | Same | Direct mapping. |
| color | color | brand/danger/important/informative; brand | Same | Direct mapping. |
| count | count | number; 0 | Same | Direct mapping. |
| dot | dot | boolean; false | Same | Uses Web's fixed 6 px dot. |
| overflowCount | overflowCount | number; 99 | Same | Values above it render `<overflowCount>+`. |
| shape | shape | circular/rounded; circular | Same | Direct mapping. |
| showZero | showZero | boolean; false | Same | Direct mapping. |
| size | size | six Badge sizes; medium | Same | Ignored visually in dot mode, matching Web. |
| children/icon/iconPosition | inherited | Badge values | Same | Custom content overrides generated count. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| ViewProps | React Native view props | Native layout, accessibility, testing, and event integration. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| root/icon `className` and `as` | DOM styling and polymorphism | DOM/CSS-only. |

## Accessibility

CounterBadge does not become an independent focus target. Consumers should incorporate its count or dot meaning into the decorated control's accessibility label.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| None | None | N/A | N/A |

## Tests and Storybook coverage

Unit tests cover default zero hiding, `showZero`, overflow, custom content, negative counts, dot dimensions, and custom-content visibility. Storybook integration is outside the requested directories.
