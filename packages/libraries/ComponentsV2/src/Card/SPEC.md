# Card native specification

## Fluent UI Web references

- `packages/react-components/react-card/library/src/components/Card/Card.types.ts`
- `packages/react-components/react-card/library/src/components/Card/useCard.ts`
- `packages/react-components/react-card/library/src/components/Card/useCardSelectable.ts`
- `packages/react-components/react-card/library/src/components/Card/useCardStyles.styles.ts`
- `packages/react-components/react-card/library/src/components/CardHeader/*`
- `packages/react-components/react-card/library/src/components/CardFooter/*`
- `packages/react-components/react-card/library/src/components/CardPreview/*`
- `CardDefault`, `CardAppearance`, `CardAction`, `CardFocusMode`, `CardOrientation`, `CardSelectable`, and `CardDisabled` stories

## Native design

`Card` composes `CardHeader`, `CardPreview`, and `CardFooter` in a surfaced `View` or a native `Pressable`. It maps Fluent Web size tokens to 8/12/16 dp padding and gap and 2/4/6 dp corner radii. Direct `CardPreview` children receive edge bleed based on their first/last position and the card orientation.

`CardHeader` provides image, primary header, description, and trailing action slots using nested flex layouts. `CardFooter` exposes normal content and a trailing action slot. `CardPreview` is clipped, full-bleed media with a 32 dp bottom-leading logo overlay.

## Implemented behaviors

- Filled, filled-alternative, outline, and subtle appearances, including theme-driven hover, pressed, selected, and disabled colors.
- Filled appearances map Web shadow4/shadow8 elevation to native shadow/elevation values; state changes are immediate as on Web.
- Vertical and horizontal compositions, and small, medium, and large sizing.
- Controlled `selected`, uncontrolled `defaultSelected`, and `onSelectionChange`.
- A selectable card is a native checkbox with `accessibilityState.checked`. Like Fluent Web, it does not add a visible indicator unless a custom `floatingAction` is provided.
- Disabled cards suppress press and selection, leave native disabled accessibility state, and remove focus participation.
- Interactive cards map Web `onClick` to native press handling and retain native `onPress` support. Nested action Pressables own their gesture responder, so their actions do not select the card.
- `focusMode='no-tab' | 'tab-exit' | 'tab-only'` makes the root focusable. Interactive cards default to `no-tab`; focus and hover/press visuals use supported native events.
- Header string content supplies a selectable card label when an explicit `accessibilityLabel` is absent.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| Tabster Groupper focus trapping and sentinel elements | React Native and RNW use host focus traversal rather than DOM tab trapping. |
| CSS pseudo-element border and disabled blocker | The root native view has a direct clipped border and native `disabled` press suppression. |
| DOM `aria-labelledby` IDs | Native accessibility uses `accessibilityLabel`; string CardHeader content is registered as a convenient fallback. |
| CSS forced-colors media query | Native high-contrast palettes are supplied by the active Fluent/native theme, not CSS media queries. |
| Browser pointer cursor and text-selection rules | They have no consistent touch-native equivalent. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `appearance` | `appearance` | 4 values, `filled` | Same | Theme backgrounds, border, and elevation map the Web treatments. |
| `orientation` | `orientation` | vertical/horizontal, vertical | Same | Maps to flex direction and preview edge bleed. |
| `size` | `size` | small/medium/large, medium | Same | Maps to 8/12/16 dp padding and gap. |
| `selected` | `selected` | boolean | Same | Controlled checkbox state. |
| `defaultSelected` | `defaultSelected` | boolean | Same | Initial uncontrolled checkbox state. |
| `onSelectionChange` | `onSelectionChange` | `(event, { selected })` | Same data shape | Fires for native press, keyboard, and accessibility activation. |
| `disabled` | `disabled` | boolean | Same | Blocks native activation and supplies disabled accessibility state. |
| `floatingAction` | `floatingAction` | slot | `ReactNode` | Top-trailing native overlay used for an explicit selection indicator or other action. |
| `focusMode` | `focusMode` | off/no-tab/tab-exit/tab-only | Same union | Controls root focusability; host controls traversal. |
| root click | `onClick` and `onPress` | DOM click | Native interaction callbacks | Both callbacks run for card-surface native press. |
| Header/Footer/Preview slots | component props | DOM slots | `ReactNode` slots | Native React nodes replace HTML slots. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `onPress` | Native `Pressable` callback | Preserves idiomatic React Native invocation in addition to Web-compatible `onClick`. |
| Native `ViewProps`/`PressablePropsExtended` | Platform props | Enables native test IDs, accessibility hints, layout, and supported input events. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| HTML `div`, `input`, and image element override slot types | DOM element customization | Native slots are React nodes and do not have HTML element types. |
| DOM intrinsic attributes and CSS class names | Browser customization | React Native has platform props and styles instead. |
| `aria-labelledby` reference IDs | Checkbox naming | Native uses direct accessibility labels. |
| Pointer, mouse, touch, and drag callback variants | Browser interaction detection | Native consumers use `onPress`, `onLongPress`, and supported Pressable input events. |

## Accessibility

Selectable cards expose `accessibilityRole="checkbox"`, checked and disabled state, and a `toggle` action. A header string becomes the fallback accessible name; consumers should provide `accessibilityLabel` for non-string header content. Interactive non-selectable cards expose a button role by default. Selection is blocked for disabled cards and nested native actions retain their own responder.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Hover/pressed/selected/focus color and shadow changes | Immediate token swap | None | No animation, so no reduced-motion change is needed. |

## Tests and Storybook coverage

`Card.test.tsx` covers default compound composition, Header/Footer/Preview slots, all appearances, orientation and size, controlled/uncontrolled selection, default/custom indicators, checkbox semantics, disabled behavior, focus-mode adaptation, hover/focus visuals, nested actions, and preview edge bleed. The corresponding Fluent catalog stories are represented by the exported Card family API; no consumer or catalog files are changed by this control implementation.
