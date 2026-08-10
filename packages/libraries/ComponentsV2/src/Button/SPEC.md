# Button native specification

## Fluent UI Web references

- [Button types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/Button/Button.types.ts)
- [CompoundButton types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/CompoundButton/CompoundButton.types.ts)
- [MenuButton types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/MenuButton/MenuButton.types.ts)
- [SplitButton types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/SplitButton/SplitButton.types.ts)
- [ToggleButton types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/ToggleButton/ToggleButton.types.ts)
- [Button stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-button/stories/src/Button), [CompoundButton stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-button/stories/src/CompoundButton), [MenuButton stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-button/stories/src/MenuButton), [SplitButton stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-button/stories/src/SplitButton), and [ToggleButton stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-button/stories/src/ToggleButton)

## Native design

The Button family owns its React Native `Pressable` surfaces rather than exposing FURN's Button implementation. Shared
size and color tokens reproduce the Fluent Web small (24), medium (32), and large (40) metrics. A Button surface owns
hover, press, focus, disabled, loading, accessibility, text, and icon layout. CompoundButton adds a vertical content
slot; MenuButton adds a trailing disclosure slot and expansion state; SplitButton combines two independent surfaces;
and ToggleButton owns controlled or uncontrolled pressed state.

## Implemented behaviors

- Button, CompoundButton, MenuButton, SplitButton, and ToggleButton expose the Web appearance, shape, size, icon, and disabled APIs that map to native behavior.
- Secondary, primary, outline, subtle, and transparent appearances use Fluent theme colors for rest, hover, pressed, disabled, and selected states.
- Icons can precede or follow Button/CompoundButton/ToggleButton content. Icon-only sizing is inferred when no label is supplied.
- Loading displays a native activity indicator, sets busy and disabled accessibility state, and blocks activation.
- Long labels wrap in the available native width rather than being clipped by a line limit.
- CompoundButton supports secondary content and includes it in its generated accessible name.
- MenuButton always has a trailing disclosure affordance, exposes `accessibilityState.expanded`, and lets its menu owner control `expanded`.
- SplitButton has two independent actions and tab stops. Its menu action derives `More <primary label> options` when a label is not supplied.
- ToggleButton supports controlled `checked`, uncontrolled `defaultChecked`, selected state, `isAccessible`, and `onCheckedChange`.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| HTML button/anchor rendering through `as`, `href`, `target`, and `rel` | React Native has no shared anchor or browser navigation semantics; use a native Link control. |
| DOM MenuTrigger, `aria-controls`, and automatic `aria-labelledby` IDs | The menu implementation owns the popup on native. MenuButton exposes native expansion state; SplitButton derives a stable native label. |
| CSS forced-colors media query and Tabster focus selectors | Native surfaces use theme colors and explicit focus overlays; platform accessibility/high-contrast services own system rendering. |
| CSS transition properties | React Native Pressable state changes are immediate. Fluent Web's `durationFaster` background/border/color transition has no meaningful native geometry transition. |
| Browser form submission and `type` | React Native has no HTML form model. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `appearance` | `appearance` | Five appearances / `secondary` | Same | Fluent theme colors map each state. |
| `shape` | `shape` | rounded, circular, square / rounded | Same | Native border radius. |
| `size` | `size` | small, medium, large / medium | Same | 24, 32, and 40 dp metrics. |
| `icon` | `icon` | icon slot | `ReactNode` or FURN `fontSource` | Native presentation content; existing catalog FURN font sources render as native glyph text. |
| `iconPosition` | `iconPosition` | before, after / before | Same except MenuButton | Native flex ordering. |
| `disabled` | `disabled` | boolean / false | Same | Blocks focus and activation. |
| `disabledFocusable` | `disabledFocusable` | boolean / false | Same | Disabled state with a retained focus target; activation remains blocked. |
| CompoundButton `secondaryContent` | `secondaryContent` | span slot | `ReactNode` | Renders below primary content. |
| MenuButton menu disclosure | `menuIcon` | span slot | `ReactNode`, default chevron | Always trailing. |
| MenuTrigger expanded state | `expanded` | trigger-managed | boolean / false | Native menu owner passes expansion state to accessibility. |
| SplitButton button slots | `primaryActionButton`, `menuButton` | Button/MenuButton slots | partial native action props | Supports per-action callbacks, styles, labels, and state overrides. |
| ToggleButton `checked` / `defaultChecked` | Same | boolean | Same | Controlled and uncontrolled pressed state. |
| ToggleButton checked accessibility treatment | `isAccessible` | boolean / false | Same | Uses brand background and on-brand foreground while selected. |
| DOM `onClick` | `onClick` | DOM mouse event | native interaction event | Shared activation callback. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `loading` | boolean / false | Preserves the FURN loading story as a first-class native busy control. |
| `iconOnly` | boolean or inferred | Allows an intentional compact touch target when a label is supplied indirectly. |
| `onCheckedChange` | `(event, { checked })` | Gives native controlled/uncontrolled consumers a typed state-change callback without changing Web `onClick`. |
| React Native accessibility, focus, test, gesture, and style props | platform-defined | Integrate with native automation and accessibility APIs. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `as`, `href`, `target`, `rel` | Button/anchor polymorphism | Browser-only navigation semantics. |
| DOM slot element property bags and `className` | Griffel and DOM customization | Native owns Pressable/View/Text structure and has no CSS class system. |
| `aria-*` DOM attributes | Browser accessibility | Replaced by React Native accessibility props and `accessibilityState`. |
| `MenuTrigger` context / popup DOM attributes | Menu composition | Native menu owner supplies `expanded` and navigation behavior. |
| DOM event handlers and form attributes | Browser event/form integration | Native uses normalized Pressable and accessibility events. |

## Accessibility

- Every action is a native `button` with an inferred text label when possible.
- Disabled controls report `accessibilityState.disabled`; disabledFocusable controls remain focusable but do not activate.
- Loading reports `busy` and disabled state.
- MenuButton and SplitButton menu actions report `accessibilityState.expanded`.
- ToggleButton reports `accessibilityState.checked`. `isAccessible` provides a non-color-only selected treatment; otherwise pair the control with distinguishable icon/content where required.
- SplitButton exposes two independent focus targets. Its non-interactive View root is excluded from the accessibility tree.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Background, border, and color transition | Immediate native Pressable token update | None | No motion, so no reduced-motion adaptation is required. |
| Loading spinner | Native `ActivityIndicator` | Platform supplied | Platform accessibility behavior applies. |

## Tests and Storybook coverage

`Button.test.tsx` covers defaults, five appearance paths, all size/shape/icon layout paths, long text, disabled and
disabledFocusable behavior, loading, CompoundButton secondary content, MenuButton expansion, two SplitButton actions,
and controlled/uncontrolled ToggleButton state including `isAccessible`. The existing Fluent catalog stories exercise
the same Button-family appearance, icon, loading, text, disabled, disclosure, split action, and toggle scenarios.
