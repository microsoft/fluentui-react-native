# Carousel native specification

## Fluent UI Web references

- [Fluent UI Carousel specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-carousel/library/docs/Spec.md)
- [Fluent UI Carousel public types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-carousel/library/src/components/Carousel/Carousel.types.ts)
- [Fluent UI Carousel implementation](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-carousel/library/src/components)
- [Fluent UI Carousel stories](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-carousel/stories/src/Carousel)
- [Fluent 2 Carousel guidance](https://fluent2.microsoft.design/components/web/react/core/carousel/usage)

## Native design

Carousel is an accessible viewport containing an animated horizontal track or a fade stack. It supports controlled and
uncontrolled active indexes, circular navigation, direct indicators, previous/next controls, autoplay, fixed-width
peeking slides, swipe gestures, announcements, and an elevated appearance. The integrated controls use native
`Pressable` elements, while content remains regular React Native children.

The native API intentionally consolidates Web's compound `Carousel`, `CarouselViewport`, `CarouselSlider`,
`CarouselCard`, `CarouselNavContainer`, `CarouselNav`, and navigation-button components. React Native does not need
DOM slot boundaries to calculate scroll containers, inert descendants, or Tabster groups.

## Implemented behaviors

- Controlled and uncontrolled active indexes.
- Previous, next, direct-indicator, accessibility increment/decrement, swipe, and autoplay navigation.
- Circular slide transitions use cloned edge slides so wraparound preserves direction.
- Slide and cross-fade motion.
- Animation interruption starts the replacement transition from the current animated value.
- Fixed-width cards, card peeking, alignment, and configurable gaps.
- Flat and elevated appearances.
- Fluent 24x24 direct-navigation targets containing 8px dots and a 16x8 selected pill, plus image-preview indicators.
- Icon-only play/pause autoplay control with accessible state-specific labels.
- Top or bottom navigation.
- Polite slide announcements.
- Platform reduced-motion setting changes transitions to immediate updates.

## Motion and animation mapping

| Web motion | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| `slide` | Translated horizontal track; draggable stories use a native `ScrollView` | 400 ms, Fluent decelerate cubic Bezier `(0.1, 0.9, 0.2, 1)` | Immediate index update |
| `fade` | Overlaid slide opacity interpolation | 400 ms, Fluent decelerate cubic Bezier `(0.1, 0.9, 0.2, 1)` | Immediate index update |
| Drag release | Track follows pointer, then advances or settles | Up to 240 ms settle with the Fluent decelerate curve | Immediate settle |
| Custom motion object | `duration` overrides transition milliseconds | Consumer supplied | Duration ignored |

Fluent Web's slide duration is an Embla attraction-physics factor rather than milliseconds. Native uses the platform
scroll compositor for slide transitions so frame pacing does not depend on the JavaScript thread. The duration value
controls circular wraparound reset timing; the platform owns the visible scroll curve. Fade remains time-based.

## Accessibility

- The viewport exposes role `adjustable`, its one-based position and range, and increment/decrement actions.
- Previous, next, autoplay, and direct-navigation controls have explicit accessible names and roles.
- Indicators expose selected tab state.
- Inactive slide descendants are hidden from the accessibility tree.
- Slide changes are announced through a polite live region.
- Autoplay is opt-in and can expose a visible pause/play control.

## Fluent UI Web property mappings

| Web property | Native property | Mapping |
| --- | --- | --- |
| `activeIndex` | `activeIndex` | Direct controlled index mapping. |
| `defaultActiveIndex` | `defaultActiveIndex` | Direct uncontrolled initial index mapping. |
| `align` | `align` | Aligns fixed-width native slides. |
| `appearance` | `appearance` | Direct `flat` or `elevated` mapping. |
| `autoplayInterval` | `autoplayInterval` | Direct millisecond mapping. |
| `circular` | `circular` | Direct looping mapping. |
| `draggable` | `draggable` | Native horizontal pan gesture. |
| `motion` | `motion` | Slide/fade mapping; custom duration uses milliseconds natively. |
| `onActiveIndexChange` | `onActiveIndexChange` | Same index and interaction-type data shape with a native event. |
| `announcement` | `announcement` | Simplified to active index and total slide count. |
| Carousel cards | `children` | Each direct child is one native slide. |
| Carousel navigation composition | Integrated navigation props | Native controls avoid DOM-only compound slots. |

## Native-only properties

`autoplay`, `showAutoplayButton`, `showControls`, `showIndicators`, `navigationPosition`, `indicatorImages`,
`slideWidth`, `slideStyle`, and `gap` provide concise native composition and layout control.

## Web properties not exposed

`groupSize`, DOM slot property bags, CSS class names, Tabster focus grouping, HTML drag events, and direct Embla APIs
are omitted because they do not map consistently to native views. Grouped pages can be represented as one child slide.

## Storybook coverage

CopilotAgentUI maps Default, Top Navigation, Appearance, Responsive, Controlled, Image Slideshow, Alignment And
Whitespace, Autoplay, First Run Experience, Eventing, and Carousel Nav to this exported component.
