# Accordion native specification

## Fluent UI Web references

- https://react.fluentui.dev/?path=/docs/components-accordion--docs
- `@fluentui/react-accordion` Accordion, AccordionItem, AccordionHeader, and AccordionPanel public APIs
- Fluent UI Web Accordion stories for default, controlled, collapsible, multiple, disabled, size, icon, inline, and expand-icon-position scenarios

## Native design

Accordion owns controlled or uncontrolled open item values. AccordionItem supplies value, disabled, and open state to its AccordionHeader and AccordionPanel. AccordionHeader is a native button inside a heading container. AccordionPanel measures absolutely positioned content outside the collapsed height constraint, then animates a clipped height. Fluent theme colors and exported size/motion tokens drive visuals.

## Implemented behaviors

- Controlled `openItems` and uncontrolled `defaultOpenItems`
- Single-open and `multiple` selection
- Optional `collapsible` open items
- Disabled items
- Small, medium, large, and extra-large headers
- Start/end expand icon positions, custom expand icons, and decorative icons
- Inline headers and heading levels 1 through 6
- Expanded accessibility state and activate/toggle accessibility actions
- Height and optional opacity panel animation
- Reduced-motion-aware expand, collapse, and chevron rotation

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| DOM keyboard roving or browser tab-order rules | Native focus traversal is platform-owned; Space and Enter activation are supported where key events exist. |
| CSS animation-name and CSS custom-property overrides | Native animation is exposed as typed duration and opacity options. |
| HTML heading element selection | React Native has no HTML elements; `headingLevel` maps to native heading semantics. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| openItems | openItems | unknown[] / [] | `(string \| number)[]` / [] | Controlled open values with stable native-friendly keys. |
| defaultOpenItems | defaultOpenItems | unknown[] / [] | `(string \| number)[]` / [] | Initial uncontrolled values. |
| collapsible | collapsible | boolean / false | boolean / false | Allows an open item to close. |
| multiple | multiple | boolean / false | boolean / false | Allows multiple open items. |
| onToggle | onToggle | callback | callback | Returns `{ value, openItems }`. |
| value | value | unknown | string or number | Required AccordionItem identity. |
| disabled | disabled | boolean / false | boolean / false | Removes focus and interaction. |
| size | size | small, medium, large, extra-large / medium | same / medium | Uses native Fluent size tokens. |
| expandIconPosition | expandIconPosition | start or end / start | same / start | Controls visual ordering. |
| expandIcon | expandIcon | slot | ReactNode | Replaces the default chevron and receives the same rotation. |
| icon | icon | slot | ReactNode | Decorative and hidden from accessibility. |
| inline | inline | boolean / false | boolean / false | Shrinks the header to intrinsically measured content width, constrained by its parent so long labels wrap instead of clipping. |
| headingLevel | headingLevel | 1-6 / 2 | 1-6 / 2 | Maps to native heading level metadata. |
| collapseMotion | collapseMotion | motion slot | `{ duration?, animateOpacity? }` | Typed native height/opacity animation. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| contentStyle | ViewStyle / undefined | Styles measured panel content without breaking the animated clipping container. |
| View and Pressable accessibility props | React Native props | Allows platform labels, hints, test IDs, and actions. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| as | Selects an HTML element | No DOM elements exist in React Native. |
| components | Replaces internal Web slot element types | Native public compound components already provide composition boundaries. |
| root, button, expandIcon slot style shorthands | CSS and DOM slot customization | React Native uses component props, ReactNode slots, and StyleProp. |
| navigation | Browser-specific keyboard navigation mode | Native focus traversal is platform-owned. |

## Accessibility

Each header is a button with `expanded` and `disabled` state. A containing native header exposes `headingLevel`. Decorative and expand icons are hidden from accessibility. Closed panel descendants are hidden from the accessibility tree. Activate and toggle accessibility actions invoke the same state transition as press.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Panel expand/collapse | Animated clipped height and optional opacity | 200 ms Fluent deceleration by default | Duration becomes zero. |
| Expand chevron rotation | Animated 0 to 90 degree rotation | 200 ms Fluent deceleration | Duration becomes zero. |

## Tests and Storybook coverage

`Accordion.test.tsx` covers uncontrolled toggling, controlled state, multiple/collapsible behavior, disabled items, expanded accessibility state, custom icons, icon position, inline layout, heading level, and extra-large sizing. Consumer Storybook/catalog files are intentionally outside this change scope.
