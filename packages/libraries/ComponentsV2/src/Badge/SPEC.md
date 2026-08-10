# Badge native specification

## Fluent UI Web references

- `packages/react-components/react-badge/library/src/components/Badge/Badge.types.ts`
- `packages/react-components/react-badge/library/src/components/Badge/useBadgeStyles.styles.ts`
- `packages/react-components/react-badge/library/docs/Spec.md`

## Native design

`Badge` is a non-interactive `View` containing optional icon and content slots. Primitive content is rendered in a bounded, single-line `Text`; custom React nodes are accepted unchanged. Theme alias colors are used where available and Fluent palette values complete semantic treatments.

## Implemented behaviors

- Six sizes, three shapes, four appearances, and eight semantic colors.
- Arbitrary React-node icon before or after content.
- Exact preset outer heights/minimum widths and compact explicit font size, line height, and text height.
- Consumer-provided React Native view, accessibility, test, and style props.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| CSS high-contrast pseudo-element border | React Native has no pseudo-elements; a real non-layout-changing preset border is used. |
| DOM slot `as` polymorphism | Native uses a stable `View` root. |
| Focus behavior | Badge is informational and is not an interactive focus target. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| appearance | appearance | filled/ghost/outline/tint; filled | Same | Direct mapping. |
| color | color | 8 semantic values; brand | Same | Direct semantic mapping. |
| children | children | ReactNode | ReactNode | Primitive values receive native compact text metrics. |
| icon | icon | slot | ReactNode | Wrapped in a measured native icon container. |
| iconPosition | iconPosition | before/after; before | Same | Direct mapping. |
| shape | shape | circular/rounded/square; circular | Same | Direct mapping. |
| size | size | 6 named sizes; medium | Same | Direct mapping using Web dimensions. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| ViewProps | React Native view props | Enables native accessibility, testing, layout, and event integration. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| root/icon `className` | CSS customization | DOM/CSS-only. Use native `style` and custom React-node icon. |
| root/icon `as` | DOM element polymorphism | No native DOM element model. |

## Accessibility

Badge itself adds no role or focus behavior. Consumers should label the decorated control or pass native accessibility props when the badge must be announced. The icon is not independently accessible.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| None | None | N/A | N/A |

## Tests and Storybook coverage

Unit tests cover defaults, compact text bounds, geometry extremes, icon position, custom icon nodes, and numeric zero content. Storybook integration is outside the requested directories.
