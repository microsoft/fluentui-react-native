# Avatar native specification

## Fluent UI Web references

- `@fluentui/react-avatar` Avatar source, public types, and stories in the Fluent UI monorepo.
- https://react.fluentui.dev/?path=/docs/components-avatar-avatar--docs
- Existing FURN Avatar implementation under `packages/components/Avatar`.

## Native design

`Avatar` is an accessible React Native `View` with image, initials, icon, default-person, badge, activity-ring, and shadow layers. Size-dependent geometry is defined by the explicit table in `Avatar.tokens.ts`. Named palette values and deterministic colorful selection are also tokenized.

## Implemented behaviors

- Sizes 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, and 128.
- Circular and square shapes.
- Neutral, brand, colorful, and all named palette colors.
- Web-compatible XOR-rotate hashing using `idForColor` before `name` and Web's 30-color automatic palette.
- `image` and `imageUrl`, including initials/icon fallback after a load error.
- Generated or custom initials, custom React-node icon, default person icon, and React-node badge.
- Unset, active, and inactive states with ring, shadow, and ring-shadow active appearances.
- Image accessibility role and name-derived accessible label.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| DOM element replacement through `as` | React Native has no DOM element model. |
| CSS class names and CSS custom properties | Native styles and explicit tokens are used. |
| Browser image drag behavior | Not applicable to native images. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `active` | `active` | enum / `unset` | same | Inactive scales and fades; active enables the selected appearance. |
| `activeAppearance` | `activeAppearance` | ring/shadow/ring-shadow / ring | same | Native border and shadow/elevation. |
| `badge` | `badge` | slot | `ReactNode` | Rendered at the lower trailing edge while activity is unset. |
| `color` | `color` | palette / neutral | same supported palette | Colorful uses the Web hash. |
| `idForColor` | `idForColor` | string | string | Preferred colorful hash input. |
| `image` | `image` | slot | `ImageProps` | Native image props with error fallback. |
| image URL shorthand | `imageUrl` | URL | string | Converted to a native URI source. |
| `initials` | `initials` | string | string | Overrides generated initials. |
| `icon` | `icon` | slot | `ReactNode` | Native content rather than a DOM slot. |
| `name` | `name` | string | string | Accessibility, initials, and color input. |
| `shape` | `shape` | circular/square / circular | same | Explicit radii per size. |
| `size` | `size` | supported number / 32 | same plus 128 | Uses an explicit token record with Fluent Web typography breakpoints. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `image` | `ImageProps` | Exposes native resize, caching, and image event behavior. |
| `accessibilityLabel` and other `ViewProps` | native platform types | Integrates with native accessibility services. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `as` | Selects an HTML element | DOM-specific. |
| `className` | Applies CSS classes | CSS-specific. |
| `root`, `image`, `initials` slot prop objects | Low-level DOM slot customization | Replaced by typed native content and image props. |

## Accessibility

The root is accessible with `accessibilityRole="image"` by default. `name` supplies the default accessible label. Decorative internal content is excluded from the accessibility tree.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Active/inactive visual changes | Immediate native style update | None | No motion to suppress. |

## Tests and Storybook coverage

`Avatar.test.tsx` covers accessibility, initials, React-node slots, image-error fallback, size 128, active appearance, and deterministic hashing.
